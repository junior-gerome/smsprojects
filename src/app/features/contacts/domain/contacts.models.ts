export type ContactStatus = 'ACTIVE' | 'NEW' | 'BOUNCED';

export interface Contact {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string;
  status: ContactStatus;
  tags: string[];
  groups: string[];
  createdAt: string;
}

export interface ContactGroupOption {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  createdAt: string;
}

export interface ContactDraft {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  groupIds: string[];
  tags: string;
}

export interface ContactGroupDraft {
  name: string;
  description: string;
}

export interface ImportedContactRow {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  groupNames: string[];
  tags: string[];
}
