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
