import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as api from './api';

export interface AuthState {
    user: api.UserDTO | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refresh: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<api.UserDTO | null>(null);
    const [token, setToken] = useState<string | null>(api.getToken());
    const [loading, setLoading] = useState<boolean>(!!api.getToken());
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function bootstrap() {
            if (!token) return setLoading(false);
            try {
                const res = await api.me();
                if (!cancelled) setUser(res.user);
            } catch (e: any) {
                if (!cancelled) {
                    setError(e?.message || 'Failed to load session');
                    api.logout();
                    setToken(null);
                    setUser(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        bootstrap();
        return () => {
            cancelled = true;
        };
    }, [token]);

    const login = async (email: string, password: string) => {
        setError(null);
        setLoading(true);
        try {
            const res = await api.login(email, password);
            setToken(res.token);
            setUser(res.user);
        } catch (e: any) {
            setError(e?.message || 'Login failed');
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        api.logout();
        setUser(null);
        setToken(null);
        setError(null);
    };

    const refresh = async () => {
        try {
            if (!api.getToken()) {
                setUser(null);
                return;
            }
            const res = await api.me();
            setUser(res.user);
        } catch (e: any) {
            // If refresh fails, keep current user but log out if unauthorized
            // Here we simply surface the error in state
            setError(e?.message || 'Failed to refresh session');
        }
    };

    const value: AuthState = useMemo(
        () => ({ user, token, loading, error, login, logout, refresh }),
        [user, token, loading, error],
    );

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
    const ctx = useContext(AuthCtx);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}
