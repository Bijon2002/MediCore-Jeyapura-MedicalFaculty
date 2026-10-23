import { supabase } from '../../lib/supabase';
import type {
  Article,
  ArticleListResponse,
  CreateArticleInput,
  UpdateArticleInput,
  QueryArticleParams,
} from '../types/article.types';

export class ArticlesApiClient {
  /**
   * Retrieves a paginated list of articles with optional filtering and search from Supabase.
   */
  static async getArticles(
    params?: QueryArticleParams,
    _token?: string,
  ): Promise<ArticleListResponse> {
    const page = params?.page ? Number(params.page) : 1;
    const limit = params?.limit ? Number(params.limit) : 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('articles')
      .select('*, author:profiles!author_id(*), subject:subjects(*), topic:topics(*)', { count: 'exact' });

    if (params?.status) {
      query = query.eq('status', params.status);
    }
    if (params?.subjectId) {
      query = query.eq('subject_id', params.subjectId);
    }
    if (params?.topicId) {
      query = query.eq('topic_id', params.topicId);
    }
    if (params?.search) {
      query = query.ilike('title', `%${params.search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: (data as unknown as Article[]) || [],
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Retrieves a single article by its URL slug.
   */
  static async getArticleBySlug(
    slug: string,
    _token?: string,
  ): Promise<Article> {
    const { data, error } = await supabase
      .from('articles')
      .select('*, author:profiles!author_id(*), subject:subjects(*), topic:topics(*)')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Article not found');
    }

    return data as unknown as Article;
  }

  /**
   * Retrieves a single article by its unique UUID ID.
   */
  static async getArticleById(
    id: string,
    _token?: string,
  ): Promise<Article> {
    const { data, error } = await supabase
      .from('articles')
      .select('*, author:profiles!author_id(*), subject:subjects(*), topic:topics(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Article not found');
    }

    return data as unknown as Article;
  }

  /**
   * Creates a new article in Supabase.
   */
  static async createArticle(
    data: CreateArticleInput,
    _token?: string,
  ): Promise<Article> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to create an article');
    }

    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
        '-' +
        Date.now();

    const { data: inserted, error } = await supabase
      .from('articles')
      .insert({
        title: data.title,
        slug,
        content: data.content,
        summary: data.summary || null,
        status: data.status || 'DRAFT',
        subject_id: data.subjectId || null,
        topic_id: data.topicId || null,
        featured_image_url: data.featuredImageUrl || null,
        author_id: user.id,
      })
      .select('*, author:profiles!author_id(*), subject:subjects(*), topic:topics(*)')
      .single();

    if (error || !inserted) {
      throw new Error(error?.message || 'Failed to create article');
    }

    return inserted as unknown as Article;
  }

  /**
   * Partially updates an existing article in Supabase.
   */
  static async updateArticle(
    id: string,
    data: UpdateArticleInput,
    _token?: string,
  ): Promise<Article> {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.slug !== undefined) updatePayload.slug = data.slug;
    if (data.content !== undefined) updatePayload.content = data.content;
    if (data.summary !== undefined) updatePayload.summary = data.summary;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.subjectId !== undefined) updatePayload.subject_id = data.subjectId;
    if (data.topicId !== undefined) updatePayload.topic_id = data.topicId;
    if (data.featuredImageUrl !== undefined) updatePayload.featured_image_url = data.featuredImageUrl;

    const { data: updated, error } = await supabase
      .from('articles')
      .update(updatePayload)
      .eq('id', id)
      .select('*, author:profiles!author_id(*), subject:subjects(*), topic:topics(*)')
      .single();

    if (error || !updated) {
      throw new Error(error?.message || 'Failed to update article');
    }

    return updated as unknown as Article;
  }

  /**
   * Deletes an article by ID in Supabase.
   */
  static async deleteArticle(
    id: string,
    _token?: string,
  ): Promise<{ message: string }> {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Article deleted successfully' };
  }
}
