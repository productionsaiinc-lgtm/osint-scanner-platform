import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import NetworkScanner from "./pages/NetworkScanner";

import SocialOsint from "./pages/SocialOsint";
import MapView from "./pages/MapView";
import ScanHistory from "./pages/ScanHistory";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import { GitHubSearch } from "./pages/GitHubSearch";
import { CVESearch } from "./pages/CVESearch";

import { EmailVerification } from "./pages/EmailVerification";
import { SubscriptionManagement } from "./pages/SubscriptionManagement";
import { PayoutDashboard } from "./pages/PayoutDashboard";
import { ShodanSearch } from "./pages/ShodanSearch";
import { NotificationCenter } from "./pages/NotificationCenter";
import { PhoneLookup } from "./pages/PhoneLookup";
import { IMEIChecker } from "./pages/IMEIChecker";
import { NmapScanner } from "./pages/NmapScanner";
import { VPNService } from "./pages/VPNService";
import { VPNConnection } from "./pages/VPNConnection";
import WebScraper from "./pages/WebScraper";
import CreditCardChecker from "./pages/CreditCardChecker";
import OntarioLicensePlate from "./pages/OntarioLicensePlate";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={DashboardHome} />
      <Route path={"/network-scanner"} component={NetworkScannerPage} />

      <Route path={"/social-osint"} component={SocialOsintPage} />
      <Route path={"/map"} component={MapViewPage} />
      <Route path={"/history"} component={ScanHistoryPage} />
      <Route path={"/about"} component={AboutPage} />
      <Route path={"/pricing"} component={PricingPage} />
      <Route path={"/github-search"} component={GitHubSearchPage} />
      <Route path={"/cve-search"} component={CVESearchPage} />
      <Route path={"/email-verify"} component={EmailVerifyPage} />
      <Route path={"/subscription"} component={SubscriptionManagementPage} />
      <Route path={"/payouts"} component={PayoutDashboardPage} />
      <Route path={"/shodan"} component={ShodanSearchPage} />
      <Route path={"/notifications"} component={NotificationCenterPage} />
      <Route path={"/phone-lookup"} component={PhoneLookupPage} />
      <Route path={"/imei-checker"} component={IMEICheckerPage} />
      <Route path={"/nmap-scanner"} component={NmapScannerPage} />
      <Route path={"/vpn-connection"} component={VPNConnectionPage} />
      <Route path={"/web-scraper"} component={WebScraperPage} />
      <Route path={"/credit-card-checker"} component={CreditCardCheckerPage} />
      <Route path={"/ontario-license-plate"} component={OntarioLicensePlatePage} />
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

function ShodanSearchPage() {
  return (
    <DashboardLayout>
      <ShodanSearch />
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

function VPNConnectionPage() {
  return (
    <DashboardLayout>
      <VPNConnection />
    </DashboardLayout>
  );
}

function WebScraperPage() {
  return (
    <DashboardLayout>
      <WebScraper />
    </DashboardLayout>
  );
}

function CreditCardCheckerPage() {
  return (
    <DashboardLayout>
      <CreditCardChecker />
    </DashboardLayout>
  );
}

function OntarioLicensePlatePage() {
  return (
    <DashboardLayout>
      <OntarioLicensePlate />
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
