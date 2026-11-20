import { supabase } from '../../lib/supabase';
import type {
  Article,
  ArticleListResponse,
  CreateArticleInput,
  UpdateArticleInput,
  QueryArticleParams,
} from '../types/article.types';

export class ArticlesApiClient {
  private static cache = new Map<string, { data: ArticleListResponse; timestamp: number }>();
  private static CACHE_TTL = 30000; // 30 seconds
  private static FEATURED_ARTICLE_STORAGE_KEY = 'medcore_featured_article_id';

  // Clear legacy local storage key so devices do not mask database state
  static {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('medcore_deleted_article_ids');
      } catch {}
    }
  }

  private static getStoredFeaturedArticleId(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(this.FEATURED_ARTICLE_STORAGE_KEY);
  }

  private static normalizeArticle(raw: Record<string, unknown>): Article {
    const author = raw.author as Record<string, unknown> | null | undefined;
    const subject = raw.subject as Record<string, unknown> | null | undefined;
    const topic = raw.topic as Record<string, unknown> | null | undefined;

    return {
      ...(raw as unknown as Article),
      type: ((raw.type as string) || 'ARTICLE') as Article['type'],
      featuredImageUrl: (raw.featuredImageUrl ?? raw.featured_image_url) as string | null | undefined,
      isFeatured:
        Boolean(raw.isFeatured ?? raw.is_featured) ||
        raw.id === this.getStoredFeaturedArticleId(),
      publishedAt: (raw.publishedAt ?? raw.published_at) as string | Date | null | undefined,
      createdAt: (raw.createdAt ?? raw.created_at) as string | Date,
      updatedAt: (raw.updatedAt ?? raw.updated_at) as string | Date,
      authorId: (raw.authorId ?? raw.author_id) as string,
      subjectId: (raw.subjectId ?? raw.subject_id) as string | null | undefined,
      topicId: (raw.topicId ?? raw.topic_id) as string | null | undefined,
      author: author
        ? {
            id: String(author.id || ''),
            email: String(author.email || ''),
            firstName: (author.firstName ?? author.first_name) as string,
            lastName: (author.lastName ?? author.last_name) as string,
            avatarUrl: (author.avatarUrl ?? author.avatar_url) as string | null | undefined,
          }
        : undefined,
      subject: subject ? (subject as unknown as Article['subject']) : null,
      topic: topic ? (topic as unknown as Article['topic']) : null,
    };
  }

  /**
   * Retrieves a paginated list of articles with optional filtering and search from Supabase.
   */
  static async getArticles(
    params?: QueryArticleParams,
    _token?: string,
  ): Promise<ArticleListResponse> {
    const cacheKey = JSON.stringify(params || {});
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const page = params?.page ? Number(params.page) : 1;
    const limit = params?.limit ? Number(params.limit) : 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('articles')
      .select('id, title, slug, summary, featured_image_url, status, type, created_at, updated_at, author:profiles!author_id(id, first_name, last_name, avatar_url), subject:subjects(id, title, slug), topic:topics(id, title, slug)', { count: 'exact' });

    if (params?.status) {
      query = query.eq('status', params.status);
    }
    if (params?.type) {
      query = query.eq('type', params.type);
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
    this.clearCache();

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const normalizedData = data?.map((article) =>
      this.normalizeArticle(article as unknown as Record<string, unknown>)
    ) || [];

    const result: ArticleListResponse = {
      data: normalizedData,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };

    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  static clearCache(): void {
    this.cache.clear();
  }

  private static notifyArticlesUpdated(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('medcore:articles-updated'));
    }
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

    this.clearCache();
    return this.normalizeArticle(data as unknown as Record<string, unknown>);
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

    this.clearCache();
    return this.normalizeArticle(data as unknown as Record<string, unknown>);
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
        type: data.type || 'ARTICLE',
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

    this.clearCache();
    this.notifyArticlesUpdated();
    return this.normalizeArticle(inserted as unknown as Record<string, unknown>);
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
    if (data.type !== undefined) updatePayload.type = data.type;
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

    this.clearCache();
    this.notifyArticlesUpdated();
    return this.normalizeArticle(updated as unknown as Record<string, unknown>);
  }

  static async setFeaturedArticle(id: string, isFeatured: boolean): Promise<Article> {
    if (typeof window !== 'undefined') {
      if (isFeatured) {
        window.localStorage.setItem(this.FEATURED_ARTICLE_STORAGE_KEY, id);
      } else {
        window.localStorage.removeItem(this.FEATURED_ARTICLE_STORAGE_KEY);
      }
    }

    this.clearCache();
    this.notifyArticlesUpdated();
    return this.getArticleById(id);
  }

  /**
   * Deletes an article by ID in Supabase.
   */
  static async deleteArticle(
    id: string,
    _token?: string,
  ): Promise<{ message: string }> {
    const { data, error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      throw new Error(`Database error deleting article: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(
        'Could not delete article from the database. This happens when Supabase Row Level Security (RLS) restricts deletion for your role, or the article does not exist.'
      );
    }

    this.clearCache();
    this.notifyArticlesUpdated();
    return { message: 'Article deleted successfully' };
  }

  /**
   * Bulk deletes multiple articles by their IDs in Supabase.
   */
  static async deleteArticles(
    ids: string[],
    _token?: string,
  ): Promise<{ message: string; deletedCount: number }> {
    if (!ids || ids.length === 0) {
      return { message: 'No articles selected', deletedCount: 0 };
    }

    const { data, error } = await supabase
      .from('articles')
      .delete()
      .in('id', ids)
      .select('id');

    if (error) {
      throw new Error(`Database error bulk deleting articles: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(
        'None of the selected articles were deleted from the database. Please verify your Supabase permissions under Row Level Security (RLS).'
      );
    }

    this.clearCache();
    this.notifyArticlesUpdated();
    return {
      message: `${data.length} article(s) deleted successfully`,
      deletedCount: data.length,
    };
  }
}
