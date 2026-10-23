import { supabase } from '../../lib/supabase';
import type {
    AuthUser,
    LoginInput,
    LoginResponse,
    RegisterInput,
    RegisterResponse,
} from '../types/auth.types';

export class AuthApiClient {
    /**
     * Authenticates a user via Supabase Auth and returns an access token + profile.
     */
    static async login(data: LoginInput): Promise<LoginResponse> {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (error || !authData.user || !authData.session) {
            throw new Error(error?.message || 'Failed to authenticate');
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        const user: AuthUser = {
            id: authData.user.id,
            email: authData.user.email || data.email,
            firstName: profile?.first_name || '',
            lastName: profile?.last_name || '',
            role: profile?.role || 'STUDENT',
        };

        return {
            accessToken: authData.session.access_token,
            user,
        };
    }

    /**
     * Creates a new user account in Supabase Auth.
     * The handle_new_user trigger in Postgres will auto-create the public.profiles record.
     */
    static async register(data: RegisterInput): Promise<RegisterResponse> {
        const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    role: 'STUDENT',
                },
            },
        });

        if (error || !authData.user) {
            throw new Error(error?.message || 'Registration failed');
        }

        const user: AuthUser = {
            id: authData.user.id,
            email: authData.user.email || data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: 'STUDENT',
        };

        return {
            message: 'Registration successful! Please check your email if confirmation is required.',
            user,
        };
    }

    /**
     * Retrieves the currently authenticated user from the active Supabase session.
     */
    static async getMe(_token?: string): Promise<AuthUser> {
        const {
            data: { user: authUser },
            error,
        } = await supabase.auth.getUser();

        if (error || !authUser) {
            throw new Error('Not authenticated');
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

        return {
            id: authUser.id,
            email: authUser.email || '',
            firstName: profile?.first_name || '',
            lastName: profile?.last_name || '',
            role: profile?.role || 'STUDENT',
        };
    }

    /**
     * Signs out the current user from Supabase.
     */
    static async logout(): Promise<void> {
        await supabase.auth.signOut();
    }
}
