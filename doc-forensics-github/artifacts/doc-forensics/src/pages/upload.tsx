import { useState, useCallback, useRef } from "react";
import { useAnalyzeDocument } from "@workspace/api-client-react";
import { AnalysisResult } from "@workspace/api-zod/src/generated/types";
import { UploadCloud, File, AlertTriangle, ShieldCheck, Search, Activity, Trash2, ArrowRight, Fingerprint, ScanSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const DOCUMENT_TYPES = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "driving_license", label: "Driving License" },
  { value: "degree", label: "Degree Certificate" },
  { value: "income_certificate", label: "Income Certificate" },
  { value: "caste_certificate", label: "Caste Certificate" },
];

export default function UploadPage() {
  const { toast } = useToast();
  const analyzeDoc = useAnalyzeDocument();
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string>("aadhaar");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG).",
        variant: "destructive"
      });
      return;
    }
    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = () => {
    if (!file || !previewUrl) return;

    // Extract base64 part
    const base64Data = previewUrl.split(',')[1];
    if (!base64Data) {
       toast({
        title: "Error reading file",
        description: "Failed to extract base64 data from the image.",
        variant: "destructive"
      });
      return;
    }

    analyzeDoc.mutate({
      data: {
        documentType,
        filename: file.name,
        imageBase64: base64Data
      }
    }, {
      onSuccess: (data) => {
        setResult(data as AnalysisResult);
        toast({
          title: "Analysis Complete",
          description: "Document scanning finished successfully.",
        });
      },
      onError: (err) => {
        toast({
          title: "Analysis Failed",
          description: "Failed to process the document. " + (err as any)?.error,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight text-foreground">X-Ray Scanner</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">Targeted forensic analysis for state-issued documentation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center">
                <File className="w-4 h-4 mr-2 text-primary" />
                Input Source
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Document Classification</label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger className="font-mono bg-background/50 border-border/50">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value} className="font-mono text-sm">{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!file ? (
                <div 
                  className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted/20 hover:border-primary/50 transition-colors flex flex-col items-center justify-center min-h-[240px]"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
                  <p className="text-sm font-mono font-medium text-foreground mb-1">Drag & drop document</p>
                  <p className="text-xs font-mono text-muted-foreground">or click to browse</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-[3/4] bg-muted/20 rounded-lg overflow-hidden border border-border/50">
                    {previewUrl && (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex flex-col justify-end p-4">
                      <p className="text-xs font-mono text-foreground truncate">{file.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 font-mono text-xs border-border/50 bg-background/50"
                      onClick={handleClear}
                      disabled={analyzeDoc.isPending}
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Discard
                    </Button>
                    <Button 
                      className="flex-1 font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleAnalyze}
                      disabled={analyzeDoc.isPending}
                    >
                      {analyzeDoc.isPending ? (
                        <>
                          <Activity className="w-3 h-3 mr-2 animate-pulse" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <ScanSearch className="w-3 h-3 mr-2" />
                          Execute Scan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8">
          {analyzeDoc.isPending ? (
            <Card className="h-full bg-card/50 border-border/50 backdrop-blur-sm min-h-[500px] flex flex-col items-center justify-center p-8">
               <div className="w-full max-w-md space-y-8 text-center">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-r-2 border-primary/50 rounded-full animate-spin duration-1000"></div>
                    <div className="absolute inset-4 border-b-2 border-primary/30 rounded-full animate-spin duration-700"></div>
                    <Search className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-mono text-lg text-primary tracking-widest uppercase">Executing Forensic Deep Scan</h3>
                    <p className="font-mono text-xs text-muted-foreground">Running spectral analysis and metadata verification...</p>
                  </div>
                  <Progress value={undefined} className="h-1 bg-muted/30 [&>div]:bg-primary" />
               </div>
            </Card>
          ) : result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden">
                <div className={`h-1 w-full ${
                  result.verdict === 'authentic' ? 'bg-green-500' :
                  result.verdict === 'suspicious' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <CardHeader className="pb-4 flex flex-row items-start justify-between border-b border-border/50">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                      Analysis Output
                    </CardTitle>
                    <div className="font-mono text-2xl font-bold flex items-center mt-2">
                      VERDICT: 
                      <span className={`ml-3 px-3 py-1 rounded border uppercase text-lg ${
                        result.verdict === 'authentic' ? 'text-green-500 border-green-500/30 bg-green-500/10' :
                        result.verdict === 'suspicious' ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10' :
                        'text-red-500 border-red-500/30 bg-red-500/10'
                      }`}>
                        {result.verdict}
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-mono text-xs text-muted-foreground">SCAN ID</div>
                    <div className="font-mono text-sm text-foreground">#{result.id.toString().padStart(6, '0')}</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between font-mono text-xs uppercase text-muted-foreground tracking-wider">
                        <span>Confidence Index</span>
                        <span className="text-foreground font-medium">{result.confidence}%</span>
                      </div>
                      <Progress value={result.confidence} className="h-2 bg-muted/30 [&>div]:bg-primary" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between font-mono text-xs uppercase text-muted-foreground tracking-wider">
                        <span>Tampering Probability</span>
                        <span className="text-foreground font-medium">{result.tampering_score}%</span>
                      </div>
                      <Progress value={result.tampering_score} className={`h-2 bg-muted/30 [&>div]:${
                        result.tampering_score > 70 ? 'bg-red-500' :
                        result.tampering_score > 30 ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                    </div>
                    <div className="pt-4 border-t border-border/50">
                      <h4 className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">Executive Summary</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed font-mono">{result.summary}</p>
                    </div>
                  </div>

                  <div className="space-y-4 bg-muted/10 p-4 rounded-lg border border-border/30">
                    <h4 className="font-mono text-xs text-muted-foreground uppercase tracking-wider flex items-center">
                      <ShieldCheck className="w-3 h-3 mr-2" />
                      Identified Anomalies
                    </h4>
                    {result.findings.length > 0 ? (
                      <div className="space-y-3">
                        {result.findings.map((finding, idx) => (
                          <div key={idx} className="flex gap-3 items-start font-mono">
                            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                              finding.severity === 'danger' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
                              finding.severity === 'warning' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' :
                              'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                            }`} />
                            <div>
                              <div className="text-xs font-bold text-foreground">{finding.category}</div>
                              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{finding.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs font-mono text-muted-foreground flex items-center">
                        <ShieldCheck className="w-3 h-3 mr-2 text-green-500" />
                        No anomalies detected in the source artifact.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
             <Card className="h-full bg-card/10 border-border/20 border-dashed flex flex-col items-center justify-center p-8 min-h-[500px]">
                <div className="text-center opacity-30 select-none pointer-events-none space-y-4">
                  <Fingerprint className="w-24 h-24 mx-auto" />
                  <div className="font-mono text-lg uppercase tracking-[0.2em]">Awaiting Input</div>
                </div>
             </Card>
          )}
        </div>
      </div>
    </div>
  );
}
