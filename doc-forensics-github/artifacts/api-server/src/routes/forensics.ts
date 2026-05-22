import { Router, type IRouter } from "express";
import { db, analysesTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { AnalyzeDocumentBody, GetAnalysisParams } from "@workspace/api-zod";
import { ai } from "@workspace/integrations-gemini-ai";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const DOCUMENT_LABELS: Record<string, string> = {
  aadhaar: "Aadhaar Card",
  pan: "PAN Card",
  driving_license: "Driving License",
  degree: "Degree Certificate",
  income_certificate: "Income Certificate",
  caste_certificate: "Caste Certificate",
};

router.post("/forensics/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { documentType, imageBase64, filename } = parsed.data;
  const docLabel = DOCUMENT_LABELS[documentType] ?? documentType;

  const prompt = `You are an expert AI document forensics analyst specializing in Indian government documents stored on DigiLocker. Analyze this ${docLabel} document image for tampering, forgery, and inconsistencies with extreme precision.

Check for:
1. Font inconsistencies — mismatched fonts, uneven character spacing, irregular text alignment vs official templates
2. Visual artifacts — pixelation, blurring, copy-paste marks, shadow edges, color bleeding from image manipulation
3. Format validation — Aadhaar (12 digits), PAN (AAAAA9999A pattern), dates (DD/MM/YYYY), issuing authority names
4. Seal and watermark integrity — missing, blurry, or incorrectly placed government seals/watermarks
5. Color and layout consistency — deviations from official color schemes, logo placements, border designs

Be strict and specific. Cite exact anomalies. If insufficient data, say so.

Return ONLY valid JSON (no markdown, no code fences):
{
  "verdict": "authentic" | "suspicious" | "tampered",
  "confidence": <0-100>,
  "tampering_score": <0-100>,
  "findings": [
    {
      "category": "<category name>",
      "severity": "info" | "warning" | "danger",
      "description": "<specific anomaly description>"
    }
  ],
  "summary": "<one-line conclusion>"
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const raw = response.text ?? "";

    let analysisData: {
      verdict: string;
      confidence: number;
      tampering_score: number;
      findings: Array<{ category: string; severity: string; description: string }>;
      summary: string;
    };

    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      analysisData = JSON.parse(jsonMatch[0]);
    } catch {
      req.log.error({ raw }, "Failed to parse Gemini response");
      res.status(500).json({ error: "Failed to parse AI analysis response" });
      return;
    }

    const [saved] = await db
      .insert(analysesTable)
      .values({
        documentType,
        filename: filename ?? null,
        verdict: analysisData.verdict,
        confidence: Math.round(analysisData.confidence),
        tamperingScore: Math.round(analysisData.tampering_score),
        findings: analysisData.findings,
        summary: analysisData.summary,
      })
      .returning();

    res.json({
      id: saved.id,
      documentType: saved.documentType,
      filename: saved.filename,
      verdict: saved.verdict,
      confidence: saved.confidence,
      tampering_score: saved.tamperingScore,
      findings: saved.findings,
      summary: saved.summary,
      createdAt: saved.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Gemini analysis failed");
    res.status(500).json({ error: "Document analysis failed. Please try again." });
  }
});

router.get("/forensics/history", async (req, res): Promise<void> => {
  const analyses = await db
    .select()
    .from(analysesTable)
    .orderBy(desc(analysesTable.createdAt))
    .limit(50);

  res.json(
    analyses.map((a) => ({
      id: a.id,
      documentType: a.documentType,
      filename: a.filename,
      verdict: a.verdict,
      confidence: a.confidence,
      tampering_score: a.tamperingScore,
      summary: a.summary,
      createdAt: a.createdAt.toISOString(),
    }))
  );
});

router.get("/forensics/history/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetAnalysisParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [analysis] = await db
    .select()
    .from(analysesTable)
    .where(eq(analysesTable.id, params.data.id));

  if (!analysis) {
    res.status(404).json({ error: "Analysis not found" });
    return;
  }

  res.json({
    id: analysis.id,
    documentType: analysis.documentType,
    filename: analysis.filename,
    verdict: analysis.verdict,
    confidence: analysis.confidence,
    tampering_score: analysis.tamperingScore,
    findings: analysis.findings,
    summary: analysis.summary,
    createdAt: analysis.createdAt.toISOString(),
  });
});

router.get("/forensics/stats", async (_req, res): Promise<void> => {
  const rows = await db.select().from(analysesTable);

  const total = rows.length;
  const authentic = rows.filter((r) => r.verdict === "authentic").length;
  const suspicious = rows.filter((r) => r.verdict === "suspicious").length;
  const tampered = rows.filter((r) => r.verdict === "tampered").length;
  const avgConfidence =
    total > 0 ? rows.reduce((s, r) => s + r.confidence, 0) / total : 0;
  const avgTamperingScore =
    total > 0 ? rows.reduce((s, r) => s + r.tamperingScore, 0) / total : 0;

  res.json({ total, authentic, suspicious, tampered, avgConfidence, avgTamperingScore });
});

export default router;
