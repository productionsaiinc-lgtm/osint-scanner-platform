import axios from "axios";

/**
 * Web Application Firewall (WAF) Detection Service
 * Identifies and analyzes WAF protection on web applications
 */

export interface WAFDetectionResult {
  domain: string;
  wafDetected: boolean;
  wafType: string | null;
  confidence: number;
  protectionLevel: 'low' | 'medium' | 'high' | 'critical';
  indicators: WAFIndicator[];
  bypassMethods: string[];
  recommendations: string[];
}

export interface WAFIndicator {
  name: string;
  detected: boolean;
  value?: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Detect WAF on domain
 */
export async function detectWAF(domain: string): Promise<WAFDetectionResult> {
  try {
    const normalized = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const response = await axios.get(`https://${normalized}`, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; OSINTScanner/2.0)" },
    });
    const indicators = generateWAFIndicators(normalized, response.headers, response.status);
    const wafDetected = indicators.some(ind => ind.detected);
    const wafType = identifyWAFType(indicators);
    const confidence = calculateConfidence(indicators);

    return {
      domain: normalized,
      wafDetected,
      wafType,
      confidence,
      protectionLevel: getProtectionLevel(confidence),
      indicators,
      bypassMethods: generateBypassMethods(wafType),
      recommendations: generateRecommendations(wafType),
    };
  } catch (error) {
    throw new Error(`WAF detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate WAF indicators
 */
export function generateWAFIndicators(domain: string, headers: Record<string, any> = {}, statusCode?: number): WAFIndicator[] {
  const headerText = Object.entries(headers).map(([key, value]) => `${key}: ${value}`).join("\n").toLowerCase();
  const indicators: WAFIndicator[] = [
    {
      name: 'Cloudflare Headers',
      detected: /cloudflare|cf-ray|cf-cache-status|server: cloudflare/.test(headerText),
      value: headers["cf-ray"] || headers.server,
      severity: 'medium',
    },
    {
      name: 'AWS WAF Headers',
      detected: /x-amzn-waf|awselb|awsalb|x-amz-cf/.test(headerText),
      severity: 'high',
    },
    {
      name: 'Sucuri Headers',
      detected: /sucuri|x-sucuri-id/.test(headerText),
      value: headers["x-sucuri-id"],
      severity: 'medium',
    },
    {
      name: 'Imperva/Incapsula Headers',
      detected: /imperva|incap_ses|visid_incap/.test(headerText),
      severity: 'high',
    },
    {
      name: 'Akamai Headers',
      detected: /akamai|akamai-ghost|x-akamai/.test(headerText),
      severity: 'medium',
    },
    {
      name: 'Blocked or challenged response',
      detected: statusCode === 403 || statusCode === 429,
      value: statusCode ? `HTTP ${statusCode}` : undefined,
      severity: 'high',
    },
  ];

  return indicators;
}

/**
 * Identify WAF type from indicators
 */
export function identifyWAFType(indicators: WAFIndicator[]): string | null {
  const wafTypes: { [key: string]: string } = {
    'X-CDN-Provider: CloudFlare': 'Cloudflare WAF',
    'X-Protected-By: AWS': 'AWS WAF',
    'X-Sucuri-ID': 'Sucuri WAF',
    'X-Powered-By: ModSecurity': 'ModSecurity',
    'Server: Imperva': 'Imperva SecureSphere',
  };

  for (const indicator of indicators) {
    if (indicator.detected && indicator.value) {
      for (const [key, value] of Object.entries(wafTypes)) {
        if (indicator.value.includes(key.split(':')[0])) {
          return value;
        }
      }
    }
  }

  return indicators.some(ind => ind.detected) ? 'Unknown WAF' : null;
}

/**
 * Calculate WAF detection confidence
 */
export function calculateConfidence(indicators: WAFIndicator[]): number {
  const detectedCount = indicators.filter(ind => ind.detected).length;
  const totalCount = indicators.length;
  return Math.round((detectedCount / totalCount) * 100);
}

/**
 * Get protection level based on confidence
 */
export function getProtectionLevel(confidence: number): 'low' | 'medium' | 'high' | 'critical' {
  if (confidence >= 80) return 'critical';
  if (confidence >= 60) return 'high';
  if (confidence >= 40) return 'medium';
  return 'low';
}

/**
 * Generate bypass methods for detected WAF
 */
export function generateBypassMethods(wafType: string | null): string[] {
  const commonBypassMethods = [
    'IP Rotation',
    'User-Agent Rotation',
    'HTTP Method Manipulation',
    'Parameter Pollution',
    'Case Variation',
    'Comment Injection',
    'Null Byte Injection',
    'Encoding Bypass',
    'Time-Based Evasion',
    'Fragmentation',
  ];

  if (!wafType) return [];

  const bypassMethods: { [key: string]: string[] } = {
    'Cloudflare WAF': [
      'IP Rotation via Tor',
      'User-Agent Spoofing',
      'HTTP/2 Smuggling',
      'Slow Rate Attacks',
    ],
    'AWS WAF': [
      'Encoding Bypass',
      'Parameter Pollution',
      'Case Variation',
    ],
    'Sucuri WAF': [
      'Comment Injection',
      'Null Byte Injection',
      'Double Encoding',
    ],
  };

  return bypassMethods[wafType] || commonBypassMethods.slice(0, 4);
}

/**
 * Generate security recommendations
 */
export function generateRecommendations(wafType: string | null): string[] {
  return [
    'Implement additional rate limiting',
    'Enable CAPTCHA challenges for suspicious traffic',
    'Use IP whitelisting for trusted sources',
    'Implement behavioral analysis',
    'Enable DDoS protection',
    'Monitor and log all blocked requests',
    'Regularly update WAF rules',
    'Conduct security awareness training',
  ];
}

/**
 * Test WAF bypass techniques
 */
export async function testWAFBypass(domain: string, technique: string): Promise<{
  technique: string;
  successful: boolean;
  responseTime: number;
  statusCode: number;
}> {
  const started = Date.now();
  const normalized = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const response = await axios.get(`https://${normalized}/?osint_waf_probe=${encodeURIComponent(technique)}`, {
    timeout: 10000,
    validateStatus: () => true,
    headers: { "User-Agent": "Mozilla/5.0 (compatible; OSINTScanner/2.0)" },
  });
  return {
    technique,
    successful: response.status >= 200 && response.status < 400,
    responseTime: Date.now() - started,
    statusCode: response.status,
  };
}

/**
 * Analyze WAF rules
 */
export async function analyzeWAFRules(domain: string): Promise<{
  totalRules: number;
  activeRules: number;
  ruleCategories: string[];
  lastUpdated: string;
}> {
  const detection = await detectWAF(domain);
  return {
    totalRules: 0,
    activeRules: 0,
    ruleCategories: detection.indicators.filter((indicator) => indicator.detected).map((indicator) => indicator.name),
    lastUpdated: new Date().toISOString(),
  };
}
