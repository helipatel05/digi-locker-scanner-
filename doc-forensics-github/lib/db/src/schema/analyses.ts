import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analysesTable = pgTable("analyses", {
  id: serial("id").primaryKey(),
  documentType: text("document_type").notNull(),
  filename: text("filename"),
  verdict: text("verdict").notNull(),
  confidence: integer("confidence").notNull(),
  tamperingScore: integer("tampering_score").notNull(),
  findings: jsonb("findings").notNull().$type<Array<{ category: string; severity: string; description: string }>>(),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnalysisSchema = createInsertSchema(analysesTable).omit({ id: true, createdAt: true });
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysesTable.$inferSelect;
