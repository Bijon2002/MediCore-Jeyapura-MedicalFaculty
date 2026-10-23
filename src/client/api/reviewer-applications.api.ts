import { supabase } from '../../lib/supabase';
import type {
  ReviewerApplication,
  ApplyReviewerInput,
  RegisterAndApplyReviewerInput,
  RegisterAndApplyReviewerResponse,
  RejectApplicationInput,
  QueryApplicationsParams,
  PaginatedApplicationsResponse,
} from '../types/reviewer-application.types';

export class ReviewerApplicationsApiClient {
  /**
   * Registers a new user and creates their reviewer application in Supabase.
   */
  static async registerAndApply(
    data: RegisterAndApplyReviewerInput,
  ): Promise<RegisterAndApplyReviewerResponse> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
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

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Registration failed');
    }

    const { data: appData, error: appError } = await supabase
      .from('reviewer_applications')
      .insert({
        user_id: authData.user.id,
        professional_title: data.professionalTitle,
        specialty: data.specialty,
        qualifications: data.qualifications,
        institution: data.institution,
        bio: data.bio || null,
        expertise: data.expertise || null,
        status: 'PENDING',
      })
      .select('*')
      .single();

    if (appError || !appData) {
      throw new Error(appError?.message || 'Failed to submit application');
    }

    return {
      message: 'Application submitted successfully. Our team will review your credentials.',
      user: {
        id: authData.user.id,
        email: authData.user.email || data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'STUDENT',
      },
      application: appData as unknown as ReviewerApplication,
    };
  }

  /**
   * Creates a new reviewer application for the currently authenticated user.
   */
  static async apply(
    data: ApplyReviewerInput,
    _token?: string,
  ): Promise<ReviewerApplication> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to apply');

    const { data: appData, error } = await supabase
      .from('reviewer_applications')
      .insert({
        user_id: user.id,
        professional_title: data.professionalTitle,
        specialty: data.specialty,
        qualifications: data.qualifications,
        institution: data.institution,
        bio: data.bio || null,
        expertise: data.expertise || null,
        status: 'PENDING',
      })
      .select('*')
      .single();

    if (error || !appData) {
      throw new Error(error?.message || 'Failed to submit application');
    }

    return appData as unknown as ReviewerApplication;
  }

  /**
   * Retrieves the authenticated user's latest reviewer application status.
   */
  static async getMyApplication(
    _token?: string,
  ): Promise<ReviewerApplication | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('reviewer_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return (data as unknown as ReviewerApplication) || null;
  }

  /**
   * Retrieves all reviewer applications (for Admin dashboard).
   */
  static async getAllApplications(
    params?: QueryApplicationsParams,
    _token?: string,
  ): Promise<PaginatedApplicationsResponse> {
    const page = params?.page ? Number(params.page) : 1;
    const limit = params?.limit ? Number(params.limit) : 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('reviewer_applications')
      .select('*, user:profiles!user_id(*)', { count: 'exact' });

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: (data as unknown as ReviewerApplication[]) || [],
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Approves a reviewer application.
   */
  static async approveApplication(
    id: string,
    _token?: string,
  ): Promise<ReviewerApplication> {
    const { data: { user: adminUser } } = await supabase.auth.getUser();

    // 1. Update application status to APPROVED
    const { data: app, error } = await supabase
      .from('reviewer_applications')
      .update({
        status: 'APPROVED',
        reviewed_by_admin_id: adminUser?.id || null,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !app) throw new Error(error?.message || 'Failed to approve application');

    // 2. Promote the user's role to MEDICAL_REVIEWER in profiles
    await supabase
      .from('profiles')
      .update({ role: 'MEDICAL_REVIEWER' })
      .eq('id', app.user_id);

    // 3. Create or update reviewer profile
    await supabase.from('reviewer_profiles').upsert({
      user_id: app.user_id,
      professional_title: app.professional_title,
      specialty: app.specialty,
      qualifications: app.qualifications,
      institution: app.institution,
      bio: app.bio,
      expertise: app.expertise,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    return app as unknown as ReviewerApplication;
  }

  /**
   * Rejects a reviewer application.
   */
  static async rejectApplication(
    id: string,
    data: RejectApplicationInput,
    _token?: string,
  ): Promise<ReviewerApplication> {
    const { data: { user: adminUser } } = await supabase.auth.getUser();

    const { data: app, error } = await supabase
      .from('reviewer_applications')
      .update({
        status: 'REJECTED',
        rejection_reason: data.rejectionReason,
        reviewed_by_admin_id: adminUser?.id || null,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !app) throw new Error(error?.message || 'Failed to reject application');

    return app as unknown as ReviewerApplication;
  }
}
