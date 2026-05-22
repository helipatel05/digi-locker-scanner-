import { useParams, Link } from "wouter";
import { useGetAnalysis, getGetAnalysisQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, ArrowLeft, Loader2, AlertTriangle, Fingerprint } from "lucide-react";
import { format } from "date-fns";

export default function AnalysisDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  
  const { data: result, isLoading, isError } = useGetAnalysis(id, {
    query: {
      enabled: !!id,
      queryKey: getGetAnalysisQueryKey(id)
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Link href="/history" className="text-primary font-mono text-sm flex items-center hover:underline mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Log
        </Link>
        <div className="text-center py-20 text-red-500 font-mono">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Record Not Found</h2>
          <p className="text-sm">Unable to retrieve analysis #{id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/history" className="text-primary font-mono text-sm flex items-center hover:underline w-fit mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Log
      </Link>

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
            <div className="font-mono text-sm text-muted-foreground mt-2">
              {result.documentType.replace('_', ' ').toUpperCase()} • {result.filename || 'Unknown file'}
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="font-mono text-xs text-muted-foreground">SCAN ID</div>
            <div className="font-mono text-sm text-foreground">#{result.id.toString().padStart(6, '0')}</div>
            <div className="font-mono text-xs text-muted-foreground mt-2">TIMESTAMP</div>
            <div className="font-mono text-xs text-foreground">{format(new Date(result.createdAt), 'yyyy-MM-dd HH:mm:ss')}</div>
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
              <h4 className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center">
                <Fingerprint className="w-4 h-4 mr-2" />
                Executive Summary
              </h4>
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
  );
}
