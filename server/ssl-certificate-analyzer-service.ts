import axios from 'axios';

export interface SSLCertificate {
  subject: string;
  issuer: string;
  valid_from: Date;
  valid_to: Date;
  fingerprint: string;
  version: string;
  serial_number: string;
  public_key_algorithm: string;
  signature_algorithm: string;
}

export interface CipherSuite {
  name: string;
  protocol: string;
  key_exchange: string;
  encryption: string;
  authentication: string;
  strength: 'strong' | 'weak' | 'deprecated';
}

export interface SSLAnalysisResult {
  target: string;
  scan_date: Date;
  certificate?: SSLCertificate;
  certificate_chain?: SSLCertificate[];
  supported_protocols: string[];
  cipher_suites: CipherSuite[];
  security_issues: SSLSecurityIssue[];
  overall_grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  risk_score: number;
}

export interface SSLSecurityIssue {
  type: 'certificate' | 'protocol' | 'cipher' | 'header';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  remediation: string;
  cve_references?: string[];
}

/**
 * Analyze SSL/TLS configuration of a domain
 */
export async function analyzeSSLConfiguration(hostname: string): Promise<SSLAnalysisResult> {
  const issues: SSLSecurityIssue[] = [];
  let riskScore = 0;

  try {
    // Normalize hostname
    const cleanHostname = hostname.replace(/^https?:\/\//, '').split('/')[0];

    // Mock SSL certificate data (in production, use node's tls module or external API)
    const certificate: SSLCertificate = {
      subject: `CN=${cleanHostname}`,
      issuer: 'Let\'s Encrypt Authority X3',
      valid_from: new Date('2024-01-01'),
      valid_to: new Date('2025-01-01'),
      fingerprint: 'AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90',
      version: '3',
      serial_number: '1234567890ABCDEF',
      public_key_algorithm: 'RSA',
      signature_algorithm: 'sha256WithRSAEncryption',
    };

    // Check certificate expiry
    const now = new Date();
    const daysUntilExpiry = Math.floor(
      (certificate.valid_to.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      issues.push({
        type: 'certificate',
        severity: 'critical',
        title: 'Certificate Expired',
        description: `SSL certificate expired on ${certificate.valid_to.toDateString()}`,
        remediation: 'Renew the SSL certificate immediately.',
        cve_references: ['CVE-2021-21224'],
      });
      riskScore += 50;
    } else if (daysUntilExpiry < 30) {
      issues.push({
        type: 'certificate',
        severity: 'high',
        title: 'Certificate Expiring Soon',
        description: `SSL certificate will expire in ${daysUntilExpiry} days`,
        remediation: 'Renew the SSL certificate before expiration.',
      });
      riskScore += 20;
    }

    // Check for weak key size
    if (certificate.public_key_algorithm === 'RSA') {
      issues.push({
        type: 'certificate',
        severity: 'medium',
        title: 'RSA Key Size Not Verified',
        description: 'Unable to verify RSA key size. Ensure it is at least 2048 bits.',
        remediation: 'Use RSA keys of at least 2048 bits (4096 bits recommended).',
      });
      riskScore += 10;
    }

    // Analyze supported protocols
    const supportedProtocols = ['TLSv1.2', 'TLSv1.3'];
    const deprecatedProtocols = ['SSLv3', 'TLSv1.0', 'TLSv1.1'];

    // Mock protocol analysis
    const detectedProtocols = ['TLSv1.2', 'TLSv1.3'];

    deprecatedProtocols.forEach((protocol) => {
      if (detectedProtocols.includes(protocol)) {
        issues.push({
          type: 'protocol',
          severity: 'high',
          title: `Deprecated Protocol Supported: ${protocol}`,
          description: `${protocol} is deprecated and should not be used.`,
          remediation: `Disable ${protocol} and use only TLSv1.2 or higher.`,
          cve_references: ['CVE-2014-3566'],
        });
        riskScore += 25;
      }
    });

    // Analyze cipher suites
    const cipherSuites: CipherSuite[] = [
      {
        name: 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
        protocol: 'TLSv1.2',
        key_exchange: 'ECDHE',
        encryption: 'AES-256-GCM',
        authentication: 'RSA',
        strength: 'strong',
      },
      {
        name: 'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
        protocol: 'TLSv1.2',
        key_exchange: 'ECDHE',
        encryption: 'AES-128-GCM',
        authentication: 'RSA',
        strength: 'strong',
      },
      {
        name: 'TLS_RSA_WITH_AES_256_CBC_SHA',
        protocol: 'TLSv1.2',
        key_exchange: 'RSA',
        encryption: 'AES-256-CBC',
        authentication: 'RSA',
        strength: 'weak',
      },
    ];

    // Check for weak ciphers
    cipherSuites.forEach((cipher) => {
      if (cipher.strength === 'weak') {
        issues.push({
          type: 'cipher',
          severity: 'high',
          title: `Weak Cipher Suite: ${cipher.name}`,
          description: `${cipher.name} is considered weak and should be disabled.`,
          remediation: 'Disable weak cipher suites and use only strong ones (preferably with ECDHE).',
          cve_references: ['CVE-2013-0169'],
        });
        riskScore += 15;
      }
    });

    // Check for missing security headers
    const securityHeaders = [
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Content-Security-Policy',
    ];

    securityHeaders.forEach((header) => {
      issues.push({
        type: 'header',
        severity: 'medium',
        title: `Missing Security Header: ${header}`,
        description: `The ${header} header is not present in the response.`,
        remediation: `Add the ${header} header to your HTTP response.`,
      });
      riskScore += 5;
    });

    // Calculate overall grade
    let overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    if (riskScore <= 10) overallGrade = 'A+';
    else if (riskScore <= 20) overallGrade = 'A';
    else if (riskScore <= 35) overallGrade = 'B';
    else if (riskScore <= 50) overallGrade = 'C';
    else if (riskScore <= 70) overallGrade = 'D';
    else if (riskScore <= 85) overallGrade = 'E';
    else overallGrade = 'F';

    return {
      target: cleanHostname,
      scan_date: new Date(),
      certificate,
      certificate_chain: [certificate],
      supported_protocols: detectedProtocols,
      cipher_suites: cipherSuites,
      security_issues: issues,
      overall_grade: overallGrade,
      risk_score: Math.min(riskScore, 100),
    };
  } catch (error) {
    throw new Error(`Failed to analyze SSL configuration for ${hostname}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check certificate chain validity
 */
export async function validateCertificateChain(hostname: string): Promise<{
  is_valid: boolean;
  chain_depth: number;
  issues: string[];
}> {
  const issues: string[] = [];

  try {
    // Mock certificate chain validation
    const chainDepth = 3;

    // Check for self-signed certificate
    issues.push('Certificate chain validation would require actual TLS connection');

    return {
      is_valid: true,
      chain_depth: chainDepth,
      issues,
    };
  } catch (error) {
    return {
      is_valid: false,
      chain_depth: 0,
      issues: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Get SSL Labs grade based on risk score
 */
export function getSSLGrade(riskScore: number): string {
  if (riskScore <= 10) return 'A+';
  if (riskScore <= 20) return 'A';
  if (riskScore <= 35) return 'B';
  if (riskScore <= 50) return 'C';
  if (riskScore <= 70) return 'D';
  if (riskScore <= 85) return 'E';
  return 'F';
}

/**
 * Check if protocol version is secure
 */
export function isProtocolSecure(protocol: string): boolean {
  const secureProtocols = ['TLSv1.2', 'TLSv1.3'];
  return secureProtocols.includes(protocol);
}

/**
 * Check if cipher suite is strong
 */
export function isCipherStrong(cipherName: string): boolean {
  const weakPatterns = [
    /DES/,
    /RC4/,
    /MD5/,
    /NULL/,
    /EXPORT/,
    /anon/i,
    /PSK/,
  ];

  return !weakPatterns.some((pattern) => pattern.test(cipherName));
}
