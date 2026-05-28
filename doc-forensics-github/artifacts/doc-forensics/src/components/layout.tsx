import { Link, useLocation } from "wouter";
import { 
  ScanSearch, 
  History, 
  BarChart3, 
  ShieldAlert,
  Fingerprint
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Upload & Analyze", icon: ScanSearch },
    { href: "/history", label: "Past Analyses", icon: History },
    { href: "/stats", label: "Dashboard", icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border/50 bg-card/50 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <Fingerprint className="w-6 h-6 text-primary mr-3" />
          <span className="font-mono font-bold tracking-tight text-lg">DocForensics</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className={`w-4 h-4 mr-3 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center px-3 py-2 text-xs text-muted-foreground bg-muted/30 rounded-md">
            <ShieldAlert className="w-3.5 h-3.5 mr-2 text-primary" />
            <span>CONFIDENTIAL - TS/SCI</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
