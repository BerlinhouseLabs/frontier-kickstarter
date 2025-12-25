export interface Sponsor {
  id: number;
  name: string;
  dailyRate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type SponsorPassStatus = "active" | "revoked";

export interface SponsorPass {
  id: number;
  sponsor: number;
  sponsorName: string;
  firstName: string;
  lastName: string;
  email: string;
  status: SponsorPassStatus;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  revokedAt: string | null;
}

export interface CreateSponsorPassRequest {
  sponsor: number;
  firstName: string;
  lastName: string;
  email: string;
  expiresAt?: string;
}

export interface ListParams {
  limit?: number;
  offset?: number;
}

export interface ListAllSponsorPassesParams extends ListParams {
  includeRevoked?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  results: T[];
}
