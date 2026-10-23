import { supabase } from '../../lib/supabase';
import type {
  Subject,
  SubjectListResponse,
  CreateSubjectInput,
  UpdateSubjectInput,
  QuerySubjectParams,
} from '../types/subject.types';

export class SubjectsApiClient {
  /**
   * Retrieves a paginated list of subjects sorted by orderIndex.
   */
  static async getSubjects(
    params?: QuerySubjectParams,
    _token?: string,
  ): Promise<SubjectListResponse> {
    const page = params?.page ? Number(params.page) : 1;
    const limit = params?.limit ? Number(params.limit) : 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('subjects')
      .select('*, topics(*)', { count: 'exact' });

    if (params?.search) {
      query = query.ilike('title', `%${params.search}%`);
    }

    query = query.order('order_index', { ascending: true }).range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: (data as unknown as Subject[]) || [],
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Retrieves a single subject by its URL slug.
   */
  static async getSubjectBySlug(
    slug: string,
    _token?: string,
  ): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*, topics(*)')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Subject not found');
    }

    return data as unknown as Subject;
  }

  /**
   * Retrieves a single subject by its UUID ID.
   */
  static async getSubjectById(
    id: string,
    _token?: string,
  ): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*, topics(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Subject not found');
    }

    return data as unknown as Subject;
  }

  /**
   * Creates a new subject.
   */
  static async createSubject(
    data: CreateSubjectInput,
    _token?: string,
  ): Promise<Subject> {
    const { data: inserted, error } = await supabase
      .from('subjects')
      .insert({
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        icon_url: data.iconUrl || null,
        order_index: data.orderIndex ?? 0,
      })
      .select('*, topics(*)')
      .single();

    if (error || !inserted) {
      throw new Error(error?.message || 'Failed to create subject');
    }

    return inserted as unknown as Subject;
  }

  /**
   * Updates an existing subject.
   */
  static async updateSubject(
    id: string,
    data: UpdateSubjectInput,
    _token?: string,
  ): Promise<Subject> {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.slug !== undefined) updatePayload.slug = data.slug;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.iconUrl !== undefined) updatePayload.icon_url = data.iconUrl;
    if (data.orderIndex !== undefined) updatePayload.order_index = data.orderIndex;

    const { data: updated, error } = await supabase
      .from('subjects')
      .update(updatePayload)
      .eq('id', id)
      .select('*, topics(*)')
      .single();

    if (error || !updated) {
      throw new Error(error?.message || 'Failed to update subject');
    }

    return updated as unknown as Subject;
  }

  /**
   * Deletes a subject by ID.
   */
  static async deleteSubject(
    id: string,
    _token?: string,
  ): Promise<{ message: string }> {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Subject deleted successfully' };
  }
}
