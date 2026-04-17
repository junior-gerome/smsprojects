export interface AudienceOption {
  id: string;
  label: string;
  recipients: string;
  description: string;
  sourceType: 'group' | 'contacts';
  targetGroupIds: string[];
  targetContactIds: string[];
}

export interface TemplateOption {
  id: string;
  name: string;
  description: string;
  content: string;
}

export interface CampaignVariable {
  label: string;
  token: string;
  helper?: string;
}

export interface CampaignSummary {
  id: string;
  name: string;
  status: 'processing' | 'scheduled' | 'completed' | 'failed';
  audience: string;
  engagement: string;
}

export interface CampaignState {
  name: string;
  message: string;
  audiences: AudienceOption[];
  selectedAudienceId: string;
  scheduleMode: 'now' | 'later';
  scheduleAt: string;
  shortenLinks: boolean;
  recentCampaigns: CampaignSummary[];
  variables: CampaignVariable[];
  templates: TemplateOption[];
  selectedTemplateId: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
}
