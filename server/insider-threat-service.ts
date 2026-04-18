/**
 * Insider Threat Service
 * Employee social media risk scoring, disgruntled indicators
 */

export interface EmployeeRisk {
  employee_id: string;
  name: string;
  title: string;
  department: string;
  risk_score: number;
  risk_factors: string[];
  social_posts: {
    platform: string;
    content_snippet: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    risk_level: 'low' | 'medium' | 'high';
  }[];
  access_patterns: {
    anomalous_logins: number;
    data_exfiltration: boolean;
    privilege_escalation: boolean;
  };
  recommendations: string[];
}

export interface InsiderThreatResult {
  company: string;
  employees: EmployeeRisk[];
  high_risk_count: number;
  total_risk_score: number;
  top_threats: string[];
  mitigation_score: number;
}

/**
 * Analyze employees for insider threat indicators
 */
export async function analyzeInsiderThreat(company: string): Promise<InsiderThreatResult> {
  const employees: EmployeeRisk[] = [];
  
  const names = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Wilson', 'David Brown'];
  const titles = ['Software Engineer', 'Sales Manager', 'HR Director', 'DevOps Engineer', 'CEO'];
  const depts = ['Engineering', 'Sales', 'HR', 'IT', 'Executive'];
  
  for (let i = 0; i < 15; i++) {
    const riskScore = Math.floor(Math.random() * 90);
    const riskFactors = generateRiskFactors(riskScore);
    
    employees.push({
      employee_id: `emp_${Math.floor(Math.random()*10000)}`,
      name: names[Math.floor(Math.random()*names.length)],
      title: titles[Math.floor(Math.random()*titles.length)],
      department: depts[Math.floor(Math.random()*depts.length)],
      risk_score: riskScore,
      risk_factors: riskFactors.slice(0, Math.floor(riskFactors.length * Math.random())),
      social_posts: generateSocialPosts(riskScore > 60),
      access_patterns: {
        anomalous_logins: Math.floor(Math.random() * 10),
        data_exfiltration: Math.random() > 0.9,
        privilege_escalation: Math.random() > 0.95,
      },
      recommendations: getRecommendations(riskScore),
    });
  }

  const highRisk = employees.filter(e => e.risk_score > 70);

  return {
    company,
    employees,
    high_risk_count: highRisk.length,
    total_risk_score: Math.floor(employees.reduce((sum, e) => sum + e.risk_score, 0) / employees.length),
    top_threats: ['Disgruntled employee indicators', 'Data exfiltration patterns', 'Privilege abuse'],
    mitigation_score: Math.floor(Math.random() * 75) + 15,
  };
}

function generateRiskFactors(score: number): string[] {
  const factors = [
    'Negative sentiment in social posts',
    'Recent job dissatisfaction keywords',
    'Unusual login patterns',
    'Data download spikes',
    'Privilege escalation attempts',
    'Access to sensitive systems',
    'Contact with external threat actors',
    'Financial distress indicators',
  ];
  return factors.filter(() => Math.random() < (score / 100));
}

function generateSocialPosts(highRisk: boolean): EmployeeRisk['social_posts'] {
  const posts = [
    {
      platform: 'Twitter',
      content_snippet: "This company sucks. Can't wait to leave.",
      sentiment: 'negative' as const,
      risk_level: 'high' as const,
    },
    {
      platform: 'LinkedIn',
      content_snippet: 'Looking for new opportunities #OpenToWork',
      sentiment: 'negative' as const,
      risk_level: 'medium' as const,
    },
    {
      platform: 'Facebook',
      content_snippet: 'Work is killing me...',
      sentiment: 'negative' as const,
      risk_level: 'medium' as const,
    },
  ];
  return highRisk ? posts.slice(0,2) : [posts[2]];
}

function getRecommendations(score: number): string[] {
  if (score > 80) {
    return [
      'Immediate manager intervention required',
      'Suspend privileged access',
      'Conduct security interview',
      'Monitor all network activity',
      'Consider termination proceedings',
    ];
  }
  return [
    'Conduct routine behavioral interview',
    'Review access privileges',
    'Monitor for escalation indicators',
  ];
}

// Export types
export type InsiderThreatResultType = InsiderThreatResult;

