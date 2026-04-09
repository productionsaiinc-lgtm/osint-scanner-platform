import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import NetworkScanner from "./pages/NetworkScanner";
import DomainOsint from "./pages/DomainOsint";
import SocialOsint from "./pages/SocialOsint";
import MapView from "./pages/MapView";
import ScanHistory from "./pages/ScanHistory";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import { BreachSearch } from "./pages/BreachSearch";
import { GitHubSearch } from "./pages/GitHubSearch";
import { CVESearch } from "./pages/CVESearch";
import { IPReputation } from "./pages/IPReputation";
import { EmailVerification } from "./pages/EmailVerification";
import { SubscriptionManagement } from "./pages/SubscriptionManagement";
import { PayoutDashboard } from "./pages/PayoutDashboard";
import { SecurityTrails } from "./pages/SecurityTrails";
import { ShodanSearch } from "./pages/ShodanSearch";
import { HunterSearch } from "./pages/HunterSearch";
import { NotificationCenter } from "./pages/NotificationCenter";
import { PhoneLookup } from "./pages/PhoneLookup";
import { IMEIChecker } from "./pages/IMEIChecker";
import { NmapScanner } from "./pages/NmapScanner";
import { VPNService } from "./pages/VPNService";
import { VPNConnection } from "./pages/VPNConnection";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={DashboardHome} />
      <Route path={"/network-scanner"} component={NetworkScannerPage} />
      <Route path={"/domain-osint"} component={DomainOsintPage} />
      <Route path={"/social-osint"} component={SocialOsintPage} />
      <Route path={"/map"} component={MapViewPage} />
      <Route path={"/history"} component={ScanHistoryPage} />
      <Route path={"/about"} component={AboutPage} />
      <Route path={"/pricing"} component={PricingPage} />
      <Route path={"/breach-search"} component={BreachSearchPage} />
      <Route path={"/github-search"} component={GitHubSearchPage} />
      <Route path={"/cve-search"} component={CVESearchPage} />
      <Route path={"/ip-reputation"} component={IPReputationPage} />
      <Route path={"/email-verify"} component={EmailVerifyPage} />
      <Route path={"/subscription"} component={SubscriptionManagementPage} />
      <Route path={"/payouts"} component={PayoutDashboardPage} />
      <Route path={"/security-trails"} component={SecurityTrailsPage} />
      <Route path={"/shodan"} component={ShodanSearchPage} />
      <Route path={"/hunter"} component={HunterSearchPage} />
      <Route path={"/notifications"} component={NotificationCenterPage} />
      <Route path={"/phone-lookup"} component={PhoneLookupPage} />
      <Route path={"/imei-checker"} component={IMEICheckerPage} />
      <Route path={"/nmap-scanner"} component={NmapScannerPage} />
      <Route path={"/vpn-service"} component={VPNServicePage} />
      <Route path={"/vpn-connection"} component={VPNConnectionPage} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function DashboardHome() {
  return (
    <DashboardLayout>
      <Home />
    </DashboardLayout>
  );
}

function NetworkScannerPage() {
  return (
    <DashboardLayout>
      <NetworkScanner />
    </DashboardLayout>
  );
}

function DomainOsintPage() {
  return (
    <DashboardLayout>
      <DomainOsint />
    </DashboardLayout>
  );
}

function SocialOsintPage() {
  return (
    <DashboardLayout>
      <SocialOsint />
    </DashboardLayout>
  );
}

function MapViewPage() {
  return (
    <DashboardLayout>
      <MapView />
    </DashboardLayout>
  );
}

function ScanHistoryPage() {
  return (
    <DashboardLayout>
      <ScanHistory />
    </DashboardLayout>
  );
}

function AboutPage() {
  return (
    <DashboardLayout>
      <About />
    </DashboardLayout>
  );
}

function PricingPage() {
  return (
    <DashboardLayout>
      <Pricing />
    </DashboardLayout>
  );
}

function BreachSearchPage() {
  return (
    <DashboardLayout>
      <BreachSearch />
    </DashboardLayout>
  );
}

function GitHubSearchPage() {
  return (
    <DashboardLayout>
      <GitHubSearch />
    </DashboardLayout>
  );
}

function CVESearchPage() {
  return (
    <DashboardLayout>
      <CVESearch />
    </DashboardLayout>
  );
}

function IPReputationPage() {
  return (
    <DashboardLayout>
      <IPReputation />
    </DashboardLayout>
  );
}

function EmailVerifyPage() {
  return (
    <DashboardLayout>
      <EmailVerification />
    </DashboardLayout>
  );
}

function SubscriptionManagementPage() {
  return (
    <DashboardLayout>
      <SubscriptionManagement />
    </DashboardLayout>
  );
}

function PayoutDashboardPage() {
  return (
    <DashboardLayout>
      <PayoutDashboard />
    </DashboardLayout>
  );
}

function SecurityTrailsPage() {
  return (
    <DashboardLayout>
      <SecurityTrails />
    </DashboardLayout>
  );
}

function ShodanSearchPage() {
  return (
    <DashboardLayout>
      <ShodanSearch />
    </DashboardLayout>
  );
}

function HunterSearchPage() {
  return (
    <DashboardLayout>
      <HunterSearch />
    </DashboardLayout>
  );
}

function NotificationCenterPage() {
  return (
    <DashboardLayout>
      <NotificationCenter />
    </DashboardLayout>
  );
}

function PhoneLookupPage() {
  return (
    <DashboardLayout>
      <PhoneLookup />
    </DashboardLayout>
  );
}

function IMEICheckerPage() {
  return (
    <DashboardLayout>
      <IMEIChecker />
    </DashboardLayout>
  );
}

function NmapScannerPage() {
  return (
    <DashboardLayout>
      <NmapScanner />
    </DashboardLayout>
  );
}

function VPNServicePage() {
  return (
    <DashboardLayout>
      <VPNService />
    </DashboardLayout>
  );
}

function VPNConnectionPage() {
  return (
    <DashboardLayout>
      <VPNConnection />
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
