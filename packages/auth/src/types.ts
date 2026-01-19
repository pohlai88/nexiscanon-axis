export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
    emailVerified?: boolean;
  };
  token: string;
  expiresAt?: number;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  error: AuthError | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  logout: () => void;
}
