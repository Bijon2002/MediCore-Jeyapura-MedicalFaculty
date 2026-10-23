import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import { AuthApiClient } from '../client/api/auth.api';
import type {
    AuthUser,
    LoginInput,
} from '../client/types/auth.types';

interface AuthContextValue {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginInput) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async (): Promise<void> => {
        try {
            const currentUser = await AuthApiClient.getMe();
            setUser(currentUser);
        } catch {
            setUser(null);
        }
    };

    useEffect(() => {
        let isMounted = true;

        // 1. Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!isMounted) return;
            if (session?.user) {
                refreshUser().finally(() => {
                    if (isMounted) setIsLoading(false);
                });
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        // 2. Listen to Supabase auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!isMounted) return;
            if (session?.user) {
                await refreshUser();
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const login = async (data: LoginInput): Promise<void> => {
        const response = await AuthApiClient.login(data);
        setUser(response.user);
    };

    const logout = async (): Promise<void> => {
        await AuthApiClient.logout();
        setUser(null);
    };

    const value: AuthContextValue = {
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside an AuthProvider');
    }

    return context;
}
