import { createContext, type RefObject } from "react";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  logIn: (email: string, password: string) => void;
  logOut: () => void;
  accessTokenRef: RefObject<string | null>
}

export const AuthContext = createContext<AuthState | undefined>(undefined);