import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
  import { useIsMobile } from "@/hooks/useMobile";
  import { LayoutDashboard, LogOut, PanelLeft, Radar, Globe, Users, History, Map, Info, Download, CreditCard, AlertTriangle, Code2, AlertCircle, Mail, Zap, Wallet, Shield, Cpu, Search, Bell, Smartphone, HardDrive, Network, Lock, Power, Car, Eye, Archive, ChevronDown, Fingerprint, Beaker } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

interface MenuSection {
  section: string;
  items: Array<{ icon: any; label: string; path: string }>;
}

const menuSections: MenuSection[] = [
  {
    section: "Core",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
      { icon: History, label: "Scan History", path: "/history" },
      { icon: Eye, label: "Monitoring", path: "/monitoring" },
      { icon: Archive, label: "Alert History", path: "/alert-history" },
      { icon: Bell, label: "Notifications", path: "/notifications" },
    ],
  },
  {
    section: "Network & Infrastructure",
    items: [
      { icon: Radar, label: "Network Scanner", path: "/network-scanner" },
      { icon: Network, label: "Nmap Scanner", path: "/nmap-scanner" },
      { icon: Cpu, label: "Shodan", path: "/shodan" },
      { icon: Globe, label: "DNS Enumeration", path: "/dns-enumeration" },
      { icon: Globe, label: "WHOIS Lookup", path: "/whois-lookup" },
      { icon: Power, label: "VPN Connection", path: "/vpn-connection" },
    ],
  },
  {
    section: "Web & Domain Security",
    items: [
      { icon: Globe, label: "Web Scraper", path: "/web-scraper" },
      { icon: Lock, label: "SSL Analyzer", path: "/ssl-analyzer" },
      { icon: Shield, label: "WAF Detection", path: "/waf-detection" },
      { icon: AlertTriangle, label: "Subdomain Takeover", path: "/subdomain-takeover" },
    ],
  },
  {
    section: "Forensics",
    items: [
      { icon: Fingerprint, label: "Metadata Extractor", path: "/metadata-extractor" },
      { icon: Search, label: "Reverse Image Search", path: "/reverse-image-search" },
    ],
  },
  {
    section: "Intelligence & Threat",
    items: [
      { icon: Users, label: "Social Media OSINT", path: "/social-osint" },
      { icon: Code2, label: "GitHub Search", path: "/github-search" },
      { icon: AlertCircle, label: "CVE Database", path: "/cve-search" },
      { icon: Shield, label: "Vulnerability Scanner", path: "/vulnerability-scanner" },
    ],
  },
  {
    section: "Personal & Device",
    items: [
      { icon: Smartphone, label: "Phone Lookup", path: "/phone-lookup" },
      { icon: HardDrive, label: "IMEI Checker", path: "/imei-checker" },
      { icon: Smartphone, label: "SIM Swap Lookup", path: "/sim-swap-lookup" },
      { icon: Car, label: "Ontario License Plate", path: "/ontario-license-plate" },
      { icon: CreditCard, label: "Credit Card Checker", path: "/credit-card-checker" },
    ],
  },
  {
    section: "Visualization & Tools",
    items: [
      { icon: Map, label: "Map View", path: "/map" },
      { icon: Code2, label: "Pentest Lab", path: "/pentest-lab" },
    ],
  },
  {
    section: "Account & Billing",
    items: [
      { icon: CreditCard, label: "Pricing", path: "/pricing" },
      { icon: Zap, label: "Subscription", path: "/subscription" },
      { icon: Wallet, label: "Payouts", path: "/payouts" },
      { icon: Info, label: "About", path: "/about" },
    ],
  },
];

const downloadItems = [
  { icon: Download, label: "Download Mobile APK", action: "download-apk" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Sign in to continue
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Access to this dashboard requires authentication. Continue to launch the login flow.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Core"]));
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center border-b border-neon-pink/30">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="flex items-center gap-2 px-3 py-2 hover:bg-accent/20 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0 font-semibold text-sm"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-neon-cyan" />
                {!isCollapsed && <span className="text-neon-cyan neon-cyan-glow">Menu</span>}
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0 ml-auto">
                  <span className="font-bold tracking-tight truncate neon-cyan-glow text-sm">
                    OSINT
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
              {menuSections.map((section) => {
                const isExpanded = expandedSections.has(section.section);
                const isCollapsedSidebar = isCollapsed;

                return (
                  <div key={section.section} className="space-y-1">
                    {!isCollapsedSidebar && (
                      <button
                        onClick={() => toggleSection(section.section)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neon-cyan/70 hover:text-neon-cyan transition-colors group"
                      >
                        <span>{section.section}</span>
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}

                    {isExpanded && (
                      <SidebarMenu className="space-y-1">
                        {section.items.map((item) => {
                          const isActive = location === item.path;
                          return (
                            <SidebarMenuItem key={item.path}>
                              <SidebarMenuButton
                                isActive={isActive}
                                onClick={() => setLocation(item.path)}
                                tooltip={item.label}
                                className={`h-10 transition-all font-normal ${
                                  isActive
                                    ? "bg-neon-pink/20 text-neon-pink-glow border border-neon-pink/50"
                                    : "text-foreground hover:bg-neon-cyan/10 hover:text-neon-cyan"
                                }`}
                              >
                                <item.icon
                                  className={`h-4 w-4 ${
                                    isActive ? "text-neon-pink" : "text-neon-cyan/70"
                                  }`}
                                />
                                <span className="text-xs uppercase tracking-wider">{item.label}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-neon-pink/30 pt-2 pb-2 px-2 flex-shrink-0">
              <SidebarMenu className="space-y-1">
                {downloadItems.map(item => (
                  <SidebarMenuItem key={item.action}>
                    <SidebarMenuButton
                      onClick={() => {
                        if (item.action === "download-apk") {
                          const link = document.createElement('a');
                          link.href = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663526315443/FfTqerZJz39TgpHyUaW6rb/osint-scanner-final_6a7b79c7.zip';
                          link.download = 'osint-scanner-v1.0.0.zip';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                      tooltip={item.label}
                      className="h-10 transition-all font-normal text-foreground hover:bg-neon-green/10 hover:text-neon-green border border-neon-green/30 hover:border-neon-green/50"
                    >
                      <item.icon className="h-4 w-4 text-neon-green/70" />
                      <span className="text-xs uppercase tracking-wider">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-neon-pink/30">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-neon-cyan/10 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Resize handle */}
        <div
          onMouseDown={() => setIsResizing(true)}
          className="absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 hover:bg-neon-cyan/50 cursor-col-resize transition-all group"
        />
      </div>

      <SidebarInset>
        <div className="flex flex-col flex-1">
          {children}
        </div>
      </SidebarInset>
    </>
  );
}
