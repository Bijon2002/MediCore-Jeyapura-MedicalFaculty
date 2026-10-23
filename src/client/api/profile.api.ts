import { supabase } from '../../lib/supabase';
import type {
    UserProfile,
    UpdateProfileInput,
} from '../types/profile.types';

export class ProfileApiClient {
    /**
     * Retrieves the currently authenticated user's profile and nested student/reviewer profile.
     */
    static async getMyProfile(_token?: string): Promise<UserProfile> {
        const {
            data: { user: authUser },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !authUser) {
            throw new Error('Not authenticated');
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*, student_profiles(*), reviewer_profiles(*)')
            .eq('id', authUser.id)
            .single();

        if (error || !profile) {
            throw new Error(error?.message || 'Profile not found');
        }

        const studentProfile = Array.isArray(profile.student_profiles)
            ? profile.student_profiles[0]
            : profile.student_profiles;

        const reviewerProfile = Array.isArray(profile.reviewer_profiles)
            ? profile.reviewer_profiles[0]
            : profile.reviewer_profiles;

        return {
            id: profile.id,
            email: profile.email,
            firstName: profile.first_name,
            lastName: profile.last_name,
            role: profile.role,
            avatarUrl: profile.avatar_url,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
            studentProfile: studentProfile
                ? {
                      id: studentProfile.id,
                      medicalSchool: studentProfile.medical_school,
                      yearOfStudy: studentProfile.year_of_study,
                      targetExam: studentProfile.target_exam,
                      specializationInterest: studentProfile.specialization_interest,
                      createdAt: studentProfile.created_at,
                      updatedAt: studentProfile.updated_at,
                  }
                : null,
            reviewerProfile: reviewerProfile
                ? {
                      id: reviewerProfile.id,
                      professionalTitle: reviewerProfile.professional_title,
                      specialty: reviewerProfile.specialty,
                      qualifications: reviewerProfile.qualifications,
                      institution: reviewerProfile.institution,
                      bio: reviewerProfile.bio,
                      expertise: reviewerProfile.expertise,
                      createdAt: reviewerProfile.created_at,
                      updatedAt: reviewerProfile.updated_at,
                  }
                : null,
        };
    }

    /**
     * Updates the currently authenticated user's profile and student profile.
     */
    static async updateMyProfile(
        data: UpdateProfileInput,
        _token?: string,
    ): Promise<UserProfile> {
        const {
            data: { user: authUser },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !authUser) {
            throw new Error('Not authenticated');
        }

        const profileUpdates: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (data.firstName !== undefined) profileUpdates.first_name = data.firstName;
        if (data.lastName !== undefined) profileUpdates.last_name = data.lastName;
        if (data.avatarUrl !== undefined) profileUpdates.avatar_url = data.avatarUrl;

        await supabase.from('profiles').update(profileUpdates).eq('id', authUser.id);

        const hasStudentUpdates =
            data.medicalSchool !== undefined ||
            data.yearOfStudy !== undefined ||
            data.targetExam !== undefined ||
            data.specializationInterest !== undefined;

        if (hasStudentUpdates) {
            const studentUpdates: Record<string, unknown> = {
                user_id: authUser.id,
                updated_at: new Date().toISOString(),
            };
            if (data.medicalSchool !== undefined) studentUpdates.medical_school = data.medicalSchool;
            if (data.yearOfStudy !== undefined) studentUpdates.year_of_study = data.yearOfStudy;
            if (data.targetExam !== undefined) studentUpdates.target_exam = data.targetExam;
            if (data.specializationInterest !== undefined)
                studentUpdates.specialization_interest = data.specializationInterest;

            await supabase
                .from('student_profiles')
                .upsert(studentUpdates, { onConflict: 'user_id' });
        }

        return this.getMyProfile();
    }
}
