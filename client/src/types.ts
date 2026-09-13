export const STATUSES = ['WISHLIST', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'] as const;

export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
};

export interface Application {
  id: string;
  company: string;
  role: string;
  status: Status;
  url?: string | null;
  location?: string | null;
  salary?: string | null;
  notes?: string | null;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  resumeId?: string | null;
  resume?: { id: string; filename: string } | null;
}

export interface Resume {
  id: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
