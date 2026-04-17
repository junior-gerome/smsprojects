export interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  body: string;
  variables: string[];
  usage: string;
}

export interface TemplateDraft {
  name: string;
  description: string;
  body: string;
}
