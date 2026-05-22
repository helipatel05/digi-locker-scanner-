import { useGetForensicsStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ShieldCheck, ShieldAlert, Activity, Eye, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function StatsPage() {
  const { data: stats, isLoading } = useGetForensicsStats();

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Activity className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  const authenticPct = stats.total > 0 ? Math.round((stats.authentic / stats.total) * 100) : 0;
  const suspiciousPct = stats.total > 0 ? Math.round((stats.suspicious / stats.total) * 100) : 0;
  const tamperedPct = stats.total > 0 ? Math.round((stats.tampered / stats.total) * 100) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight text-foreground">Global Intelligence Metrics</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">Aggregate statistics across all scanned artifacts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase text-muted-foreground tracking-wider">Total Scans</span>
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div className="font-mono text-4xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase text-muted-foreground tracking-wider">Authentic</span>
              <ShieldCheck className="w-4 h-4 text-green-500" />
            </div>
            <div className="font-mono text-4xl font-bold text-green-500">{stats.authentic}</div>
            <div className="mt-2 font-mono text-xs text-muted-foreground">{authenticPct}% of total</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase text-muted-foreground tracking-wider">Suspicious</span>
              <Eye className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="font-mono text-4xl font-bold text-yellow-500">{stats.suspicious}</div>
            <div className="mt-2 font-mono text-xs text-muted-foreground">{suspiciousPct}% of total</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase text-muted-foreground tracking-wider">Tampered</span>
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </div>
            <div className="font-mono text-4xl font-bold text-red-500">{stats.tampered}</div>
            <div className="mt-2 font-mono text-xs text-muted-foreground">{tamperedPct}% of total</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-primary" />
              Verdict Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs uppercase text-muted-foreground tracking-wider">
                <span className="text-green-500">Authentic</span>
                <span>{authenticPct}%</span>
              </div>
              <Progress value={authenticPct} className="h-2 bg-muted/30 [&>div]:bg-green-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs uppercase text-muted-foreground tracking-wider">
                <span className="text-yellow-500">Suspicious</span>
                <span>{suspiciousPct}%</span>
              </div>
              <Progress value={suspiciousPct} className="h-2 bg-muted/30 [&>div]:bg-yellow-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs uppercase text-muted-foreground tracking-wider">
                <span className="text-red-500">Tampered</span>
                <span>{tamperedPct}%</span>
              </div>
              <Progress value={tamperedPct} className="h-2 bg-muted/30 [&>div]:bg-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-primary" />
              System Averages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Average Confidence Score</div>
                  <div className="font-mono text-3xl font-bold text-foreground">{Math.round(stats.avgConfidence)}%</div>
                </div>
              </div>
              <Progress value={stats.avgConfidence} className="h-1 bg-muted/30 [&>div]:bg-primary" />
            </div>

            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Average Tampering Score</div>
                  <div className="font-mono text-3xl font-bold text-foreground">{Math.round(stats.avgTamperingScore)}%</div>
                </div>
              </div>
              <Progress value={stats.avgTamperingScore} className={`h-1 bg-muted/30 [&>div]:${
                stats.avgTamperingScore > 50 ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
