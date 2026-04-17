export interface WorkflowStep {
  id: string;
  type: 'trigger' | 'message' | 'wait' | 'branch';
  title: string;
  description: string;
}

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  uplift: string;
}

export interface AutomationInsight {
  title: string;
  body: string;
}
