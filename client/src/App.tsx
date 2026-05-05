import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./_core/hooks/useAuth";
import DashboardLayout from "./components/DashboardLayout";
import DashboardLayoutSkeleton from "./components/DashboardLayoutSkeleton";

// Public
import PublicLanding from "./pages/PublicLanding";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import DownloadAPK from "./pages/DownloadAPK";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { PaymentCancel } from "./pages/PaymentCancel";
import NotFound from "@/pages/NotFound";

// Dashboard / Authenticated pages
import Home from "./pages/Home";
import NetworkScanner from "./pages/NetworkScanner";
import SocialOsint from "./pages/SocialOsint";
import MapView from "./pages/MapView";
import ScanHistory from "./pages/ScanHistory";
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
import { VPNConnection } from "./pages/VPNConnection";
import WebScraper from "./pages/WebScraper";
import CreditCardChecker from "./pages/CreditCardChecker";
import OntarioLicensePlate from "./pages/OntarioLicensePlate";
import SimSwapLookup from "./pages/SimSwapLookup";
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
import { DarkWebMonitor } from "./pages/DarkWebMonitor";
import { VINDecoder } from "./pages/VINDecoder";
import { CryptoTracker } from "./pages/CryptoTracker";
import { EmployeeEnum } from "./pages/EmployeeEnum";
import { GeoReverse } from "./pages/GeoReverse";
import { MalwareAnalyzer } from "./pages/MalwareAnalyzer";
import { PasswordCracker } from "./pages/PasswordCracker";
import { IoTScanner } from "./pages/IoTScanner";
import { FlightTracker } from "./pages/FlightTracker";
import { SupplyChainAnalyzer } from "./pages/SupplyChainAnalyzer";
import { DeepfakeDetector } from "./pages/DeepfakeDetector";
import { InsiderThreat } from "./pages/InsiderThreat";
import { IPLookup } from "./pages/IPLookup";
import { CertificateTransparency } from "./pages/CertificateTransparency";
import { PortScanner } from "./pages/PortScanner";
import { ThreatFeed } from "./pages/ThreatFeed";
import { RewardsDashboard } from "./pages/RewardsDashboard";
import { VirtualComputers } from "./pages/VirtualComputers";
import { VirtualPhones } from "./pages/VirtualPhones";
import { CloudStoragePage } from "./pages/CloudStoragePage";
import { URLShortener } from "./pages/URLShortener";
import { TempEmail } from "./pages/TempEmail";
import { FileAnalyzer } from "./pages/FileAnalyzer";
import { SockPuppets } from "./pages/SockPuppets";

export default function App() {
  const { loading, user } = useAuth();

  // show skeleton while checking auth
  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <BrowserRouter>
            <Routes>

              {/* PUBLIC ROUTES */}
              {!user && (
                <>
                  <Route path="/" element={<PublicLanding />} />
                  <Route path="/about" element={<PublicLanding />} />
                  <Route path="/pricing" element={<PublicLanding />} />
                  <Route path="/download" element={<DownloadAPK />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/payment-cancel" element={<PaymentCancel />} />

                  {/* Fallback redirect to public home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              )}

              {/* PROTECTED DASHBOARD ROUTES */}
              {user && (
                <Route path="/" element={<DashboardLayout />}>

                  {/* Index route for dashboard home */}
                  <Route index element={<Home />} />

                  {/* Tools & Scanners */}
                  <Route path="network-scanner" element={<NetworkScanner />} />
                  <Route path="social-osint" element={<SocialOsint />} />
                  <Route path="map" element={<MapView />} />
                  <Route path="history" element={<ScanHistory />} />

                  {/* Search & OSINT */}
                  <Route path="github-search" element={<GitHubSearch />} />
                  <Route path="cve-search" element={<CVESearch />} />
                  <Route path="email-verify" element={<EmailVerification />} />
                  <Route path="subscription" element={<SubscriptionManagement />} />

                  {/* Payout & Billing */}
                  <Route path="payouts" element={<PayoutDashboard />} />
                  <Route path="payouts-enhanced" element={<PayoutDashboardEnhanced />} />
                  <Route path="payment-analytics" element={<PaymentAnalytics />} />
                  <Route path="checkout" element={<CheckoutPage />} />

                  {/* Infrastructure & Network */}
                  <Route path="shodan" element={<ShodanSearch />} />
                  <Route path="notifications" element={<NotificationCenter />} />
                  <Route path="phone-lookup" element={<PhoneLookup />} />
                  <Route path="imei-checker" element={<IMEIChecker />} />
                  <Route path="nmap-scanner" element={<NmapScanner />} />
                  <Route path="vpn-connection" element={<VPNConnection />} />

                  {/* ... more nested dashboard routes ... */}

                  <Route path="ssl-analyzer" element={<SSLAnalyzer />} />
                  <Route path="dns-enumeration" element={<DNSEnumeration />} />
                  <Route path="waf-detection" element={<WAFDetection />} />
                  <Route path="whois-lookup" element={<WHOISLookup />} />

                  <Route path="metadata-extractor" element={<MetadataExtractor />} />
                  <Route path="pentest-lab" element={<PentestLab />} />
                  <Route path="canary-tokens" element={<CanaryTokens />} />
                  <Route path="canary-tokens/:tokenId" element={<TokenDetails />} />

                  {/* Utility Pages */}
                  <Route path="cloud-storage" element={<CloudStoragePage />} />
                  <Route path="url-shortener" element={<URLShortener />} />
                  <Route path="temp-email" element={<TempEmail />} />
                  <Route path="file-analyzer" element={<FileAnalyzer />} />
                  <Route path="sock-puppets" element={<SockPuppets />} />

                  {/* Misc Tools */}
                  <Route path="crypto-tracker" element={<CryptoTracker />} />
                  <Route path="employee-enum" element={<EmployeeEnum />} />
                  <Route path="geo-reverse" element={<GeoReverse />} />
                  <Route path="malware-analyzer" element={<MalwareAnalyzer />} />
                  <Route path="password-cracker" element={<PasswordCracker />} />
                  <Route path="iot-scanner" element={<IoTScanner />} />
                  <Route path="flight-tracker" element={<FlightTracker />} />
                  <Route path="supply-chain-analyzer" element={<SupplyChainAnalyzer />} />
                  <Route path="deepfake-detector" element={<DeepfakeDetector />} />
                  <Route path="insider-threat" element={<InsiderThreat />} />

                  {/* Catch‑all 404 within dashboard */}
                  <Route path="*" element={<NotFound />} />

                </Route>
              )}
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}