import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ThreatFeed() {
  const [threats] = useState([
    {
      id: "1",
      title: "Critical RCE in Apache Log4j",
      severity: "critical",
      date: "2026-04-21",
      source: "NVD",
      description: "Remote Code Execution vulnerability in Apache Log4j 2.x",
      cve: "CVE-2021-44228",
      affected: "Apache Log4j 2.0-beta9 through 2.15.0"
    },
    {
      id: "2",
      title: "Malware Campaign Targeting Healthcare",
      severity: "high",
      date: "2026-04-20",
      source: "CISA",
      description: "New ransomware variant targeting healthcare organizations",
      cve: "N/A",
      affected: "Windows, Linux, macOS"
    },
    {
      id: "3",
      title: "Phishing Campaign: Microsoft Office 365",
      severity: "high",
      date: "2026-04-20",
      source: "Proofpoint",
      description: "Large-scale phishing campaign impersonating Microsoft",
      cve: "N/A",
      affected: "Email users worldwide"
    },
    {
      id: "4",
      title: "Data Breach: 500K Records Exposed",
      severity: "high",
      date: "2026-04-19",
      source: "Have I Been Pwned",
      description: "Customer data exposed from major e-commerce platform",
      cve: "N/A",
      affected: "E-commerce customers"
    },
    {
      id: "5",
      title: "SQL Injection in Popular CMS",
      severity: "medium",
      date: "2026-04-19",
      source: "SecurityFocus",
      description: "SQL injection vulnerability discovered in WordPress plugin",
      cve: "CVE-2026-1234",
      affected: "WordPress 5.0-6.0"
    },
    {
      id: "6",
      title: "Zero-Day in Chrome Browser",
      severity: "critical",
      date: "2026-04-18",
      source: "Google Security",
      description: "Zero-day vulnerability in Chrome's V8 engine",
      cve: "CVE-2026-5678",
      affected: "Chrome 90-110"
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "secondary";
      case "medium":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Threat Feed</h1>
        <p className="text-muted-foreground">Monitor real-time security threats and vulnerabilities from multiple sources</p>
      </div>

      <div className="grid gap-4">
        {threats.map((threat) => (
          <Card key={threat.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle>{threat.title}</CardTitle>
                  <CardDescription>{threat.description}</CardDescription>
                </div>
                <Badge variant={getSeverityColor(threat.severity)} className="capitalize">
                  {threat.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-semibold">{threat.date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Source</p>
                  <p className="font-semibold">{threat.source}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">CVE</p>
                  <p className="font-mono">{threat.cve}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Affected</p>
                  <p className="font-semibold">{threat.affected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
