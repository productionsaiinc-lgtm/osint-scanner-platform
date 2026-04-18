import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Shield, Zap, Globe, Users, FileText } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-black text-foreground">
      {/* Hero Section */}
      <div className="border-b border-cyan-500/30 pb-12">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-5xl font-bold mb-6 neon-glow-cyan">
            OSINT SCANNER PLATFORM 
            </h1>
            
          
          
          <p className="text-xl text-cyan-400 mb-8 font-mono">
            Advanced reconnaissance and intelligence gathering for security professionals
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            The OSINT Scanner Platform is a comprehensive cybersecurity reconnaissance tool designed for penetration testers, security researchers, and threat intelligence professionals. Powered by advanced algorithms and integrated with leading OSINT APIs, it provides deep insights into networks, domains, and digital identities.
          </p>
        </div>
      </div>

      {/* Core Capabilities */}
      <div className="border-b border-purple-500/30 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 neon-glow-purple">
            CORE CAPABILITIES
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Network Intelligence */}
            <Card className="bg-black border border-pink-500/50 p-6 hover:border-pink-500 transition">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-pink-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-pink-500 mb-3">Network Intelligence</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Advanced port scanning with service detection</li>
                    <li>• OS fingerprinting and vulnerability detection</li>
                    <li>• Ping and traceroute analysis</li>
                    <li>• IP geolocation and ISP information</li>
                    <li>• ASN and netblock enumeration</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Domain OSINT */}
            <Card className="bg-black border border-cyan-500/50 p-6 hover:border-cyan-500 transition">
              <div className="flex items-start gap-4">
                <Globe className="w-8 h-8 text-cyan-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-cyan-500 mb-3">Domain OSINT</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• WHOIS and DNS record lookup</li>
                    <li>• Subdomain enumeration</li>
                    <li>• SSL/TLS certificate analysis</li>
                    <li>• Web technology detection</li>
                    <li>• Security header analysis</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Social Media OSINT */}
            <Card className="bg-black border border-green-500/50 p-6 hover:border-green-500 transition">
              <div className="flex items-start gap-4">
                <Users className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-green-500 mb-3">Social Media OSINT</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Username enumeration across platforms</li>
                    <li>• Profile intelligence gathering</li>
                    <li>• Email verification and breach detection</li>
                    <li>• Credential leak database search</li>
                    <li>• Person search by name and location</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Advanced Intelligence */}
            <Card className="bg-black border border-purple-500/50 p-6 hover:border-purple-500 transition">
              <div className="flex items-start gap-4">
                <Zap className="w-8 h-8 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-purple-500 mb-3">Advanced Intelligence</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• CVE and vulnerability database search</li>
                    <li>• GitHub repository and code search</li>
                    <li>• Wayback Machine historical data</li>
                    <li>• IP reputation scoring</li>
                    <li>• Device search (Shodan integration)</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* API Integrations */}
      <div className="border-b border-green-500/30 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 neon-glow-green">
            INTEGRATED APIS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "HaveIBeenPwned", desc: "Breach detection" },
              { name: "GitHub API", desc: "Repository search" },
              { name: "Wayback Machine", desc: "Historical data" },
              { name: "NVD CVE", desc: "Vulnerability search" },
              { name: "IPQualityScore", desc: "IP reputation" },
              { name: "WHOIS API", desc: "Domain information" },
              { name: "Google DNS", desc: "DNS lookups" },
              { name: "VirusTotal", desc: "URL/file scanning" },
              { name: "Shodan", desc: "Device search" },
              { name: "SecurityTrails", desc: "Domain intelligence" },
              { name: "Hunter.io", desc: "Email enumeration" },
            ].map((api) => (
              <div key={api.name} className="bg-black border border-green-500/30 p-4 rounded hover:border-green-500 transition">
                <p className="font-mono font-bold text-green-400">{api.name}</p>
                <p className="text-sm text-gray-400">{api.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="border-b border-pink-500/30 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 neon-glow-pink">
            ADVANCED FEATURES
          </h2>
          
          <div className="space-y-6">
            <div className="bg-black border border-pink-500/30 p-6 rounded">
              <h3 className="text-xl font-bold text-pink-500 mb-3">LLM-Powered Threat Analysis</h3>
              <p className="text-gray-300">
                Automatic threat analysis and report generation using AI. Scan results are analyzed to identify vulnerabilities, highlight points of interest, and generate plain-language security reports accessible to non-expert users.
              </p>
            </div>

            <div className="bg-black border border-cyan-500/30 p-6 rounded">
              <h3 className="text-xl font-bold text-cyan-500 mb-3">Interactive Geolocation Maps</h3>
              <p className="text-gray-300">
                Visualize discovered hosts, domains, and their physical locations on interactive Google Maps. Plot network topology and geolocation data for comprehensive reconnaissance visualization.
              </p>
            </div>

            <div className="bg-black border border-green-500/30 p-6 rounded">
              <h3 className="text-xl font-bold text-green-500 mb-3">Comprehensive Reporting</h3>
              <p className="text-gray-300">
                Export scan results in multiple formats: PDF reports, CSV spreadsheets, JSON data, and XLSX workbooks. Create custom report templates and schedule automated reporting.
              </p>
            </div>

            <div className="bg-black border border-purple-500/30 p-6 rounded">
              <h3 className="text-xl font-bold text-purple-500 mb-3">Scan History & Management</h3>
              <p className="text-gray-300">
                Store all scan results in a secure database with advanced filtering, searching, and organization capabilities. Access historical data and compare reconnaissance findings over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="border-b border-purple-500/30 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 neon-glow-purple">
            USE CASES
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black border border-purple-500/30 p-6 rounded">
              <h3 className="font-bold text-purple-400 mb-2">Penetration Testing</h3>
              <p className="text-gray-300 text-sm">Comprehensive reconnaissance for authorized security assessments and penetration tests.</p>
            </div>
            <div className="bg-black border border-purple-500/30 p-6 rounded">
              <h3 className="font-bold text-purple-400 mb-2">Threat Intelligence</h3>
              <p className="text-gray-300 text-sm">Gather threat data and intelligence on potential adversaries and attack surfaces.</p>
            </div>
            <div className="bg-black border border-purple-500/30 p-6 rounded">
              <h3 className="font-bold text-purple-400 mb-2">Security Research</h3>
              <p className="text-gray-300 text-sm">Conduct in-depth security research and vulnerability analysis on targets.</p>
            </div>
            <div className="bg-black border border-purple-500/30 p-6 rounded">
              <h3 className="font-bold text-purple-400 mb-2">Asset Discovery</h3>
              <p className="text-gray-300 text-sm">Discover and map organization assets, infrastructure, and digital presence.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Download Section */}
      <div className="border-b border-pink-500/30 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 neon-glow-pink">
            MOBILE VERSION
          </h2>
          
          <Card className="bg-black border border-pink-500/50 p-8">
            <div className="flex items-center gap-6">
              <Download className="w-16 h-16 text-pink-500" />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-pink-500 mb-2">OSINT Scanner Mobile</h3>
                <p className="text-gray-300 mb-4">
                  Full-featured mobile application for iOS and Android with all scanning capabilities. Access OSINT tools on the go with offline support and push notifications.
                </p>
                <a 
                  href="/osint-scanner.apk" 
                  download
                  className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded transition"
                >
                  <Download className="w-5 h-5" />
                  Download APK (Android)
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 bg-gradient-to-b from-black to-purple-950/20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 neon-glow-cyan">
            READY TO BEGIN RECONNAISSANCE?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Start gathering intelligence with the most comprehensive OSINT platform for security professionals.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="/dashboard" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded transition">
              Launch Dashboard
            </a>
            <a href="/network-scanner" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded transition">
              Start Scanning
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
