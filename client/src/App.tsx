import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import NetworkScanner from "./pages/NetworkScanner";
import { PublicLanding } from "./pages/PublicLanding";
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
import { PayoutDashboardEnhanced } from "./pages/PayoutDashboardEnhanced";
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
import SimSwapLookup from "./pages/SimSwapLookup";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { PaymentCancel } from "./pages/PaymentCancel";
import { DownloadAPK } from "./pages/DownloadAPK";
import Monitoring from "./pages/Monitoring";
import AlertHistory from "./pages/AlertHistory";
import VulnerabilityScanner from "./pages/VulnerabilityScanner";
import SSLAnalyzer from "./pages/SSLAnalyzer";
import { ReverseImageSearch } from "./pages/ReverseImageSearch";
import { DNSEnumeration } from "./pages/DNSEnumeration";
import { WAFDetection } from "./pages/WAFDetection";
import { SubdomainTakeover } from "./pages/SubdomainTakeover";
import { WHOISLookup } from "./pages/WHOISLookup";
import { MetadataExtractor } from "./pages/MetadataExtractor";
import PentestLab from "./pages/PentestLab";
import CanaryTokens from "./pages/CanaryTokens";
import { TokenDetails } from "./pages/TokenDetails";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentAnalytics from "./pages/PaymentAnalytics";
import { LivePayoutsDashboard } from "./pages/LivePayoutsDashboard";
import { MDMDashboard } from "./pages/MDMDashboard";
import { useAuth } from "./_core/hooks/useAuth";
import { DashboardLayoutSkeleton } from "./components/DashboardLayoutSkeleton";

function Router() {
  const { loading, user } = useAuth();

  // Show loading skeleton while checking auth
  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  // Show public landing for unauthenticated users
  if (!user) {
    return (
      <Switch>
        <Route path={"/"} component={PublicLanding} />
        <Route path={"/about"} component={PublicLanding} />
        <Route path={"/pricing"} component={PublicLanding} />
        <Route path={"/download"} component={DownloadAPK} />
        <Route path={"/payment-success"} component={PaymentSuccess} />
        <Route path={"/payment-cancel"} component={PaymentCancel} />
        <Route component={PublicLanding} />
      </Switch>
    );
  }

  // Show dashboard for authenticated users
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
      <Route path={"/payouts-enhanced"} component={PayoutDashboardEnhancedPage} />
      <Route path={"/shodan"} component={ShodanSearchPage} />
      <Route path={"/notifications"} component={NotificationCenterPage} />
      <Route path={"/phone-lookup"} component={PhoneLookupPage} />
      <Route path={"/imei-checker"} component={IMEICheckerPage} />
      <Route path={"/nmap-scanner"} component={NmapScannerPage} />
      <Route path={"/vpn-connection"} component={VPNConnectionPage} />
      <Route path={"/web-scraper"} component={WebScraperPage} />
      <Route path={"/credit-card-checker"} component={CreditCardCheckerPage} />
      <Route path={"/ontario-license-plate"} component={OntarioLicensePlatePage} />
      <Route path={"/sim-swap-lookup"} component={SimSwapLookupPage} />
      <Route path={"/download"} component={DownloadAPKPage} />
      <Route path={"/payment-success"} component={PaymentSuccess} />
      <Route path={"/payment-cancel"} component={PaymentCancel} />
      <Route path={"/monitoring"} component={MonitoringPage} />
      <Route path={"/alert-history"} component={AlertHistoryPage} />      <Route path={"/vulnerability-scanner"} component={VulnerabilityScannerPage} />
      <Route path={"/ssl-analyzer"} component={SSLAnalyzerPage} />
      <Route path={"/reverse-image-search"} component={ReverseImageSearchPage} />
      <Route path={"/dns-enumeration"} component={DNSEnumerationPage} />
      <Route path={"/waf-detection"} component={WAFDetectionPage} />
      <Route path={"/subdomain-takeover"} component={SubdomainTakeoverPage} />
      <Route path={"/whois-lookup"} component={WHOISLookupPage} />
      <Route path={"/metadata-extractor"} component={MetadataExtractorPage} />
      <Route path={"/pentest-lab"} component={PentestLabPage} />
      <Route path={"/canary-tokens"} component={CanaryTokensPage} />
      <Route path={"/canary-tokens/:tokenId"} component={TokenDetailsPage} />
      <Route path={"/checkout"} component={CheckoutPageWrapper} />
      <Route path={"/payment-analytics"} component={PaymentAnalyticsPage} />      <Route path={"/live-payouts"} component={LivePayoutsDashboardPage} />
      <Route path={"/mdm"} component={MDMDashboardPage} />
      <Route path={"/:path*"} component={NotFound} />
      <Route path={"/:path*"} component={NotFound} />
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

function PayoutDashboardEnhancedPage() {
  return (
    <DashboardLayout>
      <PayoutDashboardEnhanced />
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

function SimSwapLookupPage() {
  return (
    <DashboardLayout>
      <SimSwapLookup />
    </DashboardLayout>
  );
}

function DownloadAPKPage() {
  return (
    <DashboardLayout>
      <DownloadAPK />
    </DashboardLayout>
  );
}

function MonitoringPage() {
  return (
    <DashboardLayout>
      <Monitoring />
    </DashboardLayout>
  );
}

function AlertHistoryPage() {
  return (
    <DashboardLayout>
      <AlertHistory />
    </DashboardLayout>
  );
}

function VulnerabilityScannerPage() {
  return (
    <DashboardLayout>
      <VulnerabilityScanner />
    </DashboardLayout>
  );
}

function SSLAnalyzerPage() {
  return (
    <DashboardLayout>
      <SSLAnalyzer />
    </DashboardLayout>
  );
}

function ReverseImageSearchPage() {
  return (
    <DashboardLayout>
      <ReverseImageSearch />
    </DashboardLayout>
  );
}

function DNSEnumerationPage() {
  return (
    <DashboardLayout>
      <DNSEnumeration />
    </DashboardLayout>
  );
}

function WAFDetectionPage() {
  return (
    <DashboardLayout>
      <WAFDetection />
    </DashboardLayout>
  );
}

function SubdomainTakeoverPage() {
  return (
    <DashboardLayout>
      <SubdomainTakeover />
    </DashboardLayout>
  );
}

function WHOISLookupPage() {
  return (
    <DashboardLayout>
      <WHOISLookup />
    </DashboardLayout>
  );
}

function MetadataExtractorPage() {
  return (
    <DashboardLayout>
      <MetadataExtractor />
    </DashboardLayout>
  );
}

function PentestLabPage() {
  return (
    <DashboardLayout>
      <PentestLab />
    </DashboardLayout>
  );
}

function CanaryTokensPage() {
  return (
    <DashboardLayout>
      <CanaryTokens />
    </DashboardLayout>
  );
}

function TokenDetailsPage() {
  return (
    <DashboardLayout>
      <TokenDetails />
    </DashboardLayout>
  );
}

function CheckoutPageWrapper() {
  return (
    <DashboardLayout>
      <CheckoutPage />
    </DashboardLayout>
  );
}

function PaymentAnalyticsPage() {
  return (
    <DashboardLayout>
      <PaymentAnalytics />
    </DashboardLayout>
  );
}

function LivePayoutsDashboardPage() {
  return (
    <DashboardLayout>
      <LivePayoutsDashboard />
    </DashboardLayout>
  );
}

function MDMDashboardPage() {
  return (
    <DashboardLayout>
      <MDMDashboard />
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
