import { AuthUser } from "./auth.models";

export interface AuthState {
  token: string | null;
  expiresAt: string | null;
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}