import { useListAnalyses } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldAlert, ArrowRight, Loader2, FileText } from "lucide-react";
import { AnalysisSummary } from "@workspace/api-zod/src/generated/types";

export default function HistoryPage() {
  const { data: analyses, isLoading, isError } = useListAnalyses();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight text-foreground">Archive Log</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">Historical record of all scanned artifacts.</p>
        </div>
      </div>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-border/50">
          <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center">
            <FileText className="w-4 h-4 mr-2 text-primary" />
            Scan History Database
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p className="font-mono text-sm uppercase tracking-wider">Accessing Database...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <ShieldAlert className="w-8 h-8 mb-4" />
              <p className="font-mono text-sm uppercase tracking-wider">Database Access Error</p>
            </div>
          ) : analyses && analyses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-mono text-xs text-muted-foreground uppercase">ID</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground uppercase">Document Type</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground uppercase">Verdict</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground uppercase text-right">Confidence</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground uppercase text-right">Tampering</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground uppercase">Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.map((item: AnalysisSummary) => (
                  <TableRow key={item.id} className="border-border/50 hover:bg-muted/20 transition-colors group cursor-pointer relative">
                    <TableCell className="font-mono text-xs">
                      <Link href={`/history/${item.id}`} className="absolute inset-0" aria-label="View details" />
                      #{item.id.toString().padStart(6, '0')}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.documentType.replace('_', ' ').toUpperCase()}
                      <div className="text-xs text-muted-foreground mt-0.5">{item.filename || 'Unknown file'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider ${
                        item.verdict === 'authentic' ? 'text-green-500 border-green-500/30' :
                        item.verdict === 'suspicious' ? 'text-yellow-500 border-yellow-500/30' :
                        'text-red-500 border-red-500/30'
                      }`}>
                        {item.verdict}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-right">
                      {item.confidence}%
                    </TableCell>
                    <TableCell className="font-mono text-sm text-right">
                      <span className={item.tampering_score > 70 ? 'text-red-500' : item.tampering_score > 30 ? 'text-yellow-500' : 'text-green-500'}>
                        {item.tampering_score}%
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all translate-x-[-10px] group-hover:translate-x-0" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <FileText className="w-8 h-8 mb-4 opacity-50" />
              <p className="font-mono text-sm uppercase tracking-wider">No Records Found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
