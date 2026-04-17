export interface AnalyticsMetric {
  label: string;
  value: string;
  change: string;
  icon: string;
  tone: 'primary' | 'success' | 'danger' | 'neutral';
}

export interface AnalyticsPoint {
  label: string;
  primaryLabel: string;
  primaryValue: number;
  secondaryLabel: string;
  secondaryValue: number;
}

export interface ReportItem {
  id: string;
  name: string;
  period: string;
  summary: string;
  status: 'ready' | 'scheduled';
}
