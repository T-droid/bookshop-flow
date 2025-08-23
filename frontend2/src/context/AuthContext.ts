import { createContext, type RefObject } from "react";
import { LoginResponse } from "@/types/user";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: LoginResponse | null;
  logIn: (email: string, password: string) => void;
  logOut: () => void;
  hasRole: (role: string) => boolean;
  accessTokenRef: RefObject<string | null>
}

export const AuthContext = createContext<AuthState | undefined>(undefined);