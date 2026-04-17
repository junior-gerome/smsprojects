export type DashboardTrend = 'up' | 'down' | 'flat';
export type DashboardTone = 'primary' | 'success' | 'danger' | 'neutral';

export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  trend: DashboardTrend;
  tone: DashboardTone;
  icon: string;
  helper: string;
}

export interface VolumePoint {
  label: string;
  value: number;
  emphasis?: boolean;
}

export interface DistributionItem {
  label: string;
  value: string;
  tone: DashboardTone;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  tone: DashboardTone;
}

export interface DashboardData {
  stats: DashboardStat[];
  volume: VolumePoint[];
  distribution: DistributionItem[];
  activity: ActivityItem[];
}
