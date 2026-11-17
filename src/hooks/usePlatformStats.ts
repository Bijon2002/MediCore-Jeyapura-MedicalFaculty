import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface PlatformStats {
  articles: number;
  subjects: number;
  topics: number;
  learners: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function usePlatformStats(): PlatformStats {
  const [stats, setStats] = useState<{
    articles: number;
    subjects: number;
    topics: number;
    learners: number;
    loading: boolean;
  }>({
    articles: 0,
    subjects: 0,
    topics: 0,
    learners: 0,
    loading: true,
  });

  const fetchStats = useCallback(async () => {
    try {
      const [topicsRes, subjectsRes, articlesRes, profilesRes] = await Promise.allSettled([
        supabase.from('topics').select('id', { count: 'exact', head: true }),
        supabase.from('subjects').select('id', { count: 'exact', head: true }),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'PUBLISHED'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      const topics = topicsRes.status === 'fulfilled' && topicsRes.value.count !== null ? topicsRes.value.count : 0;
      const subjects = subjectsRes.status === 'fulfilled' && subjectsRes.value.count !== null ? subjectsRes.value.count : 0;
      const articles = articlesRes.status === 'fulfilled' && articlesRes.value.count !== null ? articlesRes.value.count : 0;
      const learners = profilesRes.status === 'fulfilled' && profilesRes.value.count !== null ? profilesRes.value.count : 0;

      setStats({
        topics,
        subjects,
        articles,
        learners,
        loading: false,
      });
    } catch (err) {
      console.warn('Failed to load platform stats from Supabase:', err);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const statsChannel = supabase
      .channel('medcore-platform-stats-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'topics' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchStats())
      .subscribe();

    const handleRefresh = () => fetchStats();
    window.addEventListener('medcore:articles-updated', handleRefresh);
    window.addEventListener('medcore:subjects-updated', handleRefresh);
    window.addEventListener('medcore:topics-updated', handleRefresh);
    window.addEventListener('focus', handleRefresh);

    return () => {
      supabase.removeChannel(statsChannel);
      window.removeEventListener('medcore:articles-updated', handleRefresh);
      window.removeEventListener('medcore:subjects-updated', handleRefresh);
      window.removeEventListener('medcore:topics-updated', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
    };
  }, [fetchStats]);

  return {
    ...stats,
    refresh: fetchStats,
  };
}
