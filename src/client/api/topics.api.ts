import { supabase } from '../../lib/supabase';
import type {
  Topic,
  TopicListResponse,
  CreateTopicInput,
  UpdateTopicInput,
  QueryTopicParams,
} from '../types/topic.types';

export class TopicsApiClient {
  /**
   * Retrieves a paginated list of topics with optional filtering by subjectId or parentId.
   */
  static async getTopics(
    params?: QueryTopicParams,
    _token?: string,
  ): Promise<TopicListResponse> {
    const page = params?.page ? Number(params.page) : 1;
    const limit = params?.limit ? Number(params.limit) : 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('topics')
      .select('*, subject:subjects(*)', { count: 'exact' });

    if (params?.subjectId) {
      query = query.eq('subject_id', params.subjectId);
    }
    if (params?.parentId !== undefined) {
      if (params.parentId === null) {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', params.parentId);
      }
    }

    query = query.order('order_index', { ascending: true }).range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: (data as unknown as Topic[]) || [],
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Retrieves a single topic by its URL slug.
   */
  static async getTopicBySlug(
    slug: string,
    _token?: string,
  ): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .select('*, subject:subjects(*)')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Topic not found');
    }

    return data as unknown as Topic;
  }

  /**
   * Retrieves a single topic by its UUID ID.
   */
  static async getTopicById(
    id: string,
    _token?: string,
  ): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .select('*, subject:subjects(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Topic not found');
    }

    return data as unknown as Topic;
  }

  /**
   * Creates a new topic.
   */
  static async createTopic(
    data: CreateTopicInput,
    _token?: string,
  ): Promise<Topic> {
    const { data: inserted, error } = await supabase
      .from('topics')
      .insert({
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        subject_id: data.subjectId,
        parent_id: data.parentId || null,
        order_index: data.orderIndex ?? 0,
      })
      .select('*, subject:subjects(*)')
      .single();

    if (error || !inserted) {
      throw new Error(error?.message || 'Failed to create topic');
    }

    return inserted as unknown as Topic;
  }

  /**
   * Updates an existing topic.
   */
  static async updateTopic(
    id: string,
    data: UpdateTopicInput,
    _token?: string,
  ): Promise<Topic> {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.slug !== undefined) updatePayload.slug = data.slug;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.subjectId !== undefined) updatePayload.subject_id = data.subjectId;
    if (data.parentId !== undefined) updatePayload.parent_id = data.parentId;
    if (data.orderIndex !== undefined) updatePayload.order_index = data.orderIndex;

    const { data: updated, error } = await supabase
      .from('topics')
      .update(updatePayload)
      .eq('id', id)
      .select('*, subject:subjects(*)')
      .single();

    if (error || !updated) {
      throw new Error(error?.message || 'Failed to update topic');
    }

    return updated as unknown as Topic;
  }

  /**
   * Deletes a topic by ID.
   */
  static async deleteTopic(
    id: string,
    _token?: string,
  ): Promise<{ message: string }> {
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Topic deleted successfully' };
  }
}
