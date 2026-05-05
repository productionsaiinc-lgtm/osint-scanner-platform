import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "./components/DashboardLayout";
import DashboardLayoutSkeleton from "./components/DashboardLayoutSkeleton";
import { useAuth } from "./_core/hooks/useAuth";

import PublicLanding from "./pages/PublicLanding";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import DownloadAPK from "./pages/DownloadAPK";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { PaymentCancel } from "./pages/PaymentCancel";

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

function AppRoutes() {
  const { loading, user } = useAuth();

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        {!user && (
          <>
            <Route path="/" element={<PublicLanding />} />
            <Route path="/about" element={<PublicLanding />} />
            <Route path="/pricing" element={<PublicLanding />} />
            <Route path="/download" element={<DownloadAPK />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancel" element={<PaymentCancel />} />

            {/* Fallback to public landing */}
            <Route path="*" element={<PublicLanding />} />
          </>
        )}

        {/* Authenticated Routes */}
        {user && (
          <>
            {/* Dashboard layout wrapper */}
            <Route
              path="/"
              element={<DashboardLayout><Home /></DashboardLayout>}
            />

            <Route
              path="/network-scanner"
              element={<DashboardLayout><NetworkScanner /></DashboardLayout>}
            />

            <Route
              path="/social-osint"
              element={<DashboardLayout><SocialOsint /></DashboardLayout>}
            />

            <Route
              path="/map"
              element={<DashboardLayout><MapView /></DashboardLayout>}
            />

            <Route
              path="/history"
              element={<DashboardLayout><ScanHistory /></DashboardLayout>}
            />

            <Route
              path="/github-search"
              element={<DashboardLayout><GitHubSearch /></DashboardLayout>}
            />

            <Route
              path="/cve-search"
              element={<DashboardLayout><CVESearch /></DashboardLayout>}
            />

            <Route
              path="/email-verify"
              element={<DashboardLayout><EmailVerification /></DashboardLayout>}
            />

            <Route
              path="/subscription"
              element={<DashboardLayout><SubscriptionManagement /></DashboardLayout>}
            />

            {/* Billing & payouts */}
            <Route
              path="/payouts"
              element={<DashboardLayout><PayoutDashboard /></DashboardLayout>}
            />

            <Route
              path="/payouts-enhanced"
              element={<DashboardLayout><PayoutDashboardEnhanced /></DashboardLayout>}
            />

            <Route
              path="/payment-analytics"
              element={<DashboardLayout><PaymentAnalytics /></DashboardLayout>}
            />

            <Route
              path="/checkout"
              element={<DashboardLayout><CheckoutPage /></DashboardLayout>}
            />

            {/* Tools & scanners */}
            <Route
              path="/shodan"
              element={<DashboardLayout><ShodanSearch /></DashboardLayout>}
            />

            <Route
              path="/notifications"
              element={<DashboardLayout><NotificationCenter /></DashboardLayout>}
            />

            <Route
              path="/phone-lookup"
              element={<DashboardLayout><PhoneLookup /></DashboardLayout>}
            />

            <Route
              path="/imei-checker"
              element={<DashboardLayout><IMEIChecker /></DashboardLayout>}
            />

            <Route
              path="/nmap-scanner"
              element={<DashboardLayout><NmapScanner /></DashboardLayout>}
            />

            <Route
              path="/vpn-connection"
              element={<DashboardLayout><VPNConnection /></DashboardLayout>}
            />

            {/* … continue similarly for all pages … */}

            <Route
              path="/web-scraper"
              element={<DashboardLayout><WebScraper /></DashboardLayout>}
            />

            <Route
              path="/credit-card-checker"
              element={<DashboardLayout><CreditCardChecker /></DashboardLayout>}
            />

            <Route
              path="/ontario-license-plate"
              element={<DashboardLayout><OntarioLicensePlate /></DashboardLayout>}
            />

            <Route
              path="/sim-swap-lookup"
              element={<DashboardLayout><SimSwapLookup /></DashboardLayout>}
            />

            {/* Utility & analysis tools */}
            <Route
              path="/ssl-analyzer"
              element={<DashboardLayout><SSLAnalyzer /></DashboardLayout>}
            />

            <Route
              path="/dns-enumeration"
              element={<DashboardLayout><DNSEnumeration /></DashboardLayout>}
            />

            <Route
              path="/waf-detection"
              element={<DashboardLayout><WAFDetection /></DashboardLayout>}
            />

            <Route
              path="/whois-lookup"
              element={<DashboardLayout><WHOISLookup /></DashboardLayout>}
            />

            <Route
              path="/metadata-extractor"
              element={<DashboardLayout><MetadataExtractor /></DashboardLayout>}
            />

            {/* Special pages */}
            <Route
              path="/canary-tokens/:tokenId"
              element={<DashboardLayout><TokenDetails /></DashboardLayout>}
            />

            {/* Many more routes… */}

            {/* Catch‑all 404 */}
            <Route path="*" element={<DashboardLayout><NotFound /></DashboardLayout>} />
          </>
        )}

      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <AppRoutes />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
                         }
