"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ApiError, getAuthToken, setAuthToken } from "../api/client";
import {
  getMe,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  type LoginPayload,
  type RegisterPayload,
} from "../api/auth";
import type { UserResponse } from "../types/roleplay";

interface AuthContextValue {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  authError: Error | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toError(error: unknown): Error {
  return error instanceof Error
    ? error
    : new Error("Terjadi kendala saat memuat data akun.");
}

function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start from the same state on the server and the client. The token is read
  // after hydration because localStorage is unavailable to Server Components.
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] =
    useState<"login" | "register">("login");

  const clearSession = useCallback(() => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setAuthError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = getAuthToken();

    if (!currentToken) {
      setUser(null);
      setToken(null);
      setAuthError(null);
      setIsRefreshing(false);
      return;
    }

    setToken(currentToken);
    setIsRefreshing(true);

    try {
      const userData = await getMe(currentToken);
      setUser(userData);
      setAuthError(null);
    } catch (error) {
      if (isUnauthorized(error)) {
        clearSession();
      } else {
        // Keep the token and any previously loaded profile so a temporary
        // network/backend failure can be retried without signing the user out.
        setAuthError(toError(error));
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [clearSession]);

  useEffect(() => {
    let active = true;

    // Defer browser-storage synchronization to the asynchronous effect phase.
    // This keeps the server/client initial render identical without a
    // synchronous state cascade inside the effect body.
    void Promise.resolve().then(() => {
      if (!active) return;

      const currentToken = getAuthToken();
      if (!currentToken) {
        setIsLoading(false);
        return;
      }

      setToken(currentToken);
      setAuthError(null);

      getMe(currentToken)
        .then((userData) => {
          if (active) {
            setUser(userData);
          }
        })
        .catch((error: unknown) => {
          if (!active) return;

          if (isUnauthorized(error)) {
            clearSession();
          } else {
            setAuthError(toError(error));
          }
        })
        .finally(() => {
          if (active) {
            setIsLoading(false);
          }
        });
    });

    return () => {
      active = false;
    };
  }, [clearSession]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const result = await apiLogin(payload);
      setToken(result.access_token);
      setAuthError(null);
      await refreshUser();
      setIsAuthModalOpen(false);
    },
    [refreshUser],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await apiRegister(payload);
      // Auto login right after registration.
      await login({ email: payload.email, password: payload.password });
    },
    [login],
  );

  const logout = useCallback(() => {
    apiLogout();
    setToken(null);
    setUser(null);
    setAuthError(null);
    setIsRefreshing(false);
  }, []);

  const openAuthModal = useCallback(
    (mode: "login" | "register" = "login") => {
      setAuthModalMode(mode);
      setIsAuthModalOpen(true);
    },
    [],
  );

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isRefreshing,
        authError,
        // A transient /auth/me outage does not invalidate a Bearer token.
        // Existing protected features can continue and let their own API call
        // authoritatively return 401 if the token is actually expired.
        isAuthenticated: !!token && (!!user || !!authError),
        login,
        register,
        logout,
        refreshUser,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
