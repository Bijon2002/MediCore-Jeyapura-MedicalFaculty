import { supabase } from '../../lib/supabase';
import type {
  Quiz,
  CreateQuizInput,
  UpdateQuizInput,
  SubmitQuizInput,
  QuizSubmitResult,
  QuizAttemptHistoryItem,
} from '../types/quiz.types';

export class QuizzesApiClient {
  private static cache: { data: Quiz[]; timestamp: number } | null = null;
  private static CACHE_TTL = 30000; // 30 seconds

  // Clear legacy local storage key so devices do not mask database state
  static {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('medcore_deleted_quiz_ids');
      } catch {}
    }
  }

  /**
   * Retrieves quizzes from Supabase.
   */
  static async getQuizzes(_token?: string): Promise<Quiz[]> {
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL) {
      return this.cache.data;
    }

    const { data, error } = await supabase
      .from('quizzes')
      .select('*, subject:subjects(id, title), topic:topics(id, title), questions:quiz_questions(*, options:quiz_options(*))')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const result = (data || [])
      .map((q: any) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        subjectId: q.subject_id,
        topicId: q.topic_id,
        isPublished: q.is_published,
        createdById: q.created_by_id,
        createdAt: q.created_at,
        updatedAt: q.updated_at,
        subject: q.subject ? { id: q.subject.id, title: q.subject.title } : undefined,
        topic: q.topic ? { id: q.topic.id, title: q.topic.title } : null,
        questions: (q.questions || []).map((quest: any) => ({
          id: quest.id,
          question: quest.question,
          explanation: quest.explanation,
          orderIndex: quest.order_index,
          options: (quest.options || []).map((opt: any) => ({
            id: opt.id,
            optionText: opt.option_text,
            orderIndex: opt.order_index,
          })),
        })),
      }));

    this.cache = { data: result, timestamp: Date.now() };
    return result;
  }

  static clearCache(): void {
    this.cache = null;
  }

  /**
   * Retrieves a single quiz by ID.
   */
  static async getQuizById(id: string, _token?: string): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, subject:subjects(id, title), topic:topics(id, title), questions:quiz_questions(*, options:quiz_options(*))')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Quiz not found');
    }

    const q = data as any;
    return {
      id: q.id,
      title: q.title,
      description: q.description,
      subjectId: q.subject_id,
      topicId: q.topic_id,
      isPublished: q.is_published,
      createdById: q.created_by_id,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
      subject: q.subject ? { id: q.subject.id, title: q.subject.title } : undefined,
      topic: q.topic ? { id: q.topic.id, title: q.topic.title } : null,
      questions: (q.questions || []).map((quest: any) => {
        const correctCount = (quest.options || []).filter((opt: any) => opt.is_correct).length;
        return {
          id: quest.id,
          question: quest.question,
          explanation: quest.explanation,
          orderIndex: quest.order_index,
          allowMultiple: correctCount > 1,
          options: (quest.options || []).map((opt: any) => ({
            id: opt.id,
            optionText: opt.option_text,
            orderIndex: opt.order_index,
            isCorrect: opt.is_correct,
          })),
        };
      }),
    };
  }

  /**
   * Creates a quiz with questions and options.
   */
  static async createQuiz(
    data: CreateQuizInput,
    _token?: string,
  ): Promise<Quiz> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to create a quiz');

    // 1. Insert Quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title: data.title,
        description: data.description || null,
        subject_id: data.subjectId,
        topic_id: data.topicId || null,
        is_published: false,
        created_by_id: user.id,
      })
      .select('*')
      .single();

    if (quizError || !quiz) {
      throw new Error(quizError?.message || 'Failed to create quiz');
    }

    // 2. Insert Questions & Options if provided
    if (data.questions && data.questions.length > 0) {
      for (let i = 0; i < data.questions.length; i++) {
        const q = data.questions[i];
        const { data: question, error: qError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: quiz.id,
            question: q.question,
            explanation: q.explanation || null,
            order_index: q.orderIndex ?? i,
          })
          .select('*')
          .single();

        if (qError || !question) continue;

        if (q.options && q.options.length > 0) {
          const optionsToInsert = q.options.map((opt, optIdx) => ({
            question_id: question.id,
            option_text: opt.optionText,
            is_correct: opt.isCorrect,
            order_index: opt.orderIndex ?? optIdx,
          }));
          await supabase.from('quiz_options').insert(optionsToInsert);
        }
      }
    }

    this.clearCache();
    return this.getQuizById(quiz.id);
  }

  /**
   * Updates an existing quiz.
   */
  static async updateQuiz(
    id: string,
    data: UpdateQuizInput,
    _token?: string,
  ): Promise<Quiz> {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.subjectId !== undefined) updatePayload.subject_id = data.subjectId;
    if (data.topicId !== undefined) updatePayload.topic_id = data.topicId;

    const { error: quizError } = await supabase
      .from('quizzes')
      .update(updatePayload)
      .eq('id', id);

    if (quizError) throw new Error(quizError.message);

    // If questions are provided, replace them
    if (data.questions && data.questions.length > 0) {
      const { data: oldQuestions } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('quiz_id', id);

      if (oldQuestions && oldQuestions.length > 0) {
        const oldQIds = oldQuestions.map((q: any) => q.id);
        await supabase.from('quiz_options').delete().in('question_id', oldQIds);
        await supabase.from('quiz_questions').delete().eq('quiz_id', id);
      }

      for (let i = 0; i < data.questions.length; i++) {
        const q = data.questions[i];
        const { data: question, error: qError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: id,
            question: q.question,
            explanation: q.explanation || null,
            order_index: q.orderIndex ?? i,
          })
          .select('*')
          .single();

        if (qError || !question) continue;

        if (q.options && q.options.length > 0) {
          const optionsToInsert = q.options.map((opt, optIdx) => ({
            question_id: question.id,
            option_text: opt.optionText,
            is_correct: opt.isCorrect,
            order_index: opt.orderIndex ?? optIdx,
          }));
          await supabase.from('quiz_options').insert(optionsToInsert);
        }
      }
    }

    this.clearCache();
    return this.getQuizById(id);
  }

  /**
   * Publishes a quiz.
   */
  static async publishQuiz(id: string, _token?: string): Promise<Quiz> {
    const { error } = await supabase
      .from('quizzes')
      .update({ is_published: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
    this.clearCache();
    return this.getQuizById(id);
  }

  /**
   * Unpublishes a quiz.
   */
  static async unpublishQuiz(id: string, _token?: string): Promise<Quiz> {
    const { error } = await supabase
      .from('quizzes')
      .update({ is_published: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
    this.clearCache();
    return this.getQuizById(id);
  }

  /**
   * Submits student answers for a quiz, calculates score, and records the attempt.
   */
  static async submitQuiz(
    id: string,
    data: SubmitQuizInput,
    _token?: string,
  ): Promise<QuizSubmitResult> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to submit a quiz');

    // 1. Fetch all questions and options for this quiz
    const { data: questions, error } = await supabase
      .from('quiz_questions')
      .select('*, options:quiz_options(*)')
      .eq('quiz_id', id);

    if (error || !questions) throw new Error('Failed to retrieve quiz questions');

    let score = 0;
    const total = questions.length;
    const answerBreakdown: Array<{
      questionId: string;
      selectedOptionId: string | null;
      selectedOptionIds?: string[];
      isCorrect: boolean;
    }> = [];

    const answersToInsert: Array<{
      question_id: string;
      option_id: string | null;
    }> = [];

    for (const q of questions) {
      const qAnswers = data.answers.filter((a) => a.questionId === q.id);
      const submittedOptionIds: string[] = [];
      qAnswers.forEach((a) => {
        if (a.optionId) submittedOptionIds.push(a.optionId);
        if (a.optionIds && Array.isArray(a.optionIds)) submittedOptionIds.push(...a.optionIds);
      });
      const uniqueSubmitted = Array.from(new Set(submittedOptionIds));

      const correctOptions = (q.options || []).filter((opt: { is_correct: boolean }) => opt.is_correct);
      const correctOptionIds = correctOptions.map((opt: { id: string }) => opt.id);

      let isCorrect = false;
      if (correctOptionIds.length > 1) {
        // Multiple answers question: all correct answers must be selected and no incorrect ones
        isCorrect =
          uniqueSubmitted.length === correctOptionIds.length &&
          correctOptionIds.every((id: string) => uniqueSubmitted.includes(id));
      } else if (correctOptionIds.length === 1) {
        // Single answer question
        isCorrect = uniqueSubmitted.length === 1 && uniqueSubmitted[0] === correctOptionIds[0];
      }

      if (isCorrect) score++;

      if (uniqueSubmitted.length > 0) {
        for (const optId of uniqueSubmitted) {
          answersToInsert.push({
            question_id: q.id,
            option_id: optId,
          });
        }
      } else {
        answersToInsert.push({
          question_id: q.id,
          option_id: null,
        });
      }

      answerBreakdown.push({
        questionId: q.id,
        selectedOptionId: uniqueSubmitted[0] || null,
        selectedOptionIds: uniqueSubmitted,
        isCorrect,
      });
    }

    // 2. Insert attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: id,
        student_id: user.id,
        score,
        total,
      })
      .select('*')
      .single();

    if (attemptError || !attempt) {
      throw new Error(attemptError?.message || 'Failed to save quiz attempt');
    }

    // 3. Insert individual answers
    if (answersToInsert.length > 0) {
      await supabase.from('quiz_answers').insert(
        answersToInsert.map((ans) => ({
          attempt_id: attempt.id,
          question_id: ans.question_id,
          option_id: ans.option_id,
        }))
      );
    }

    return {
      attemptId: attempt.id,
      score,
      total,
      percentage: total > 0 ? Math.round((score / total) * 100) : 0,
      results: answerBreakdown,
    };
  }

  /**
   * Retrieves previous quiz attempts by the student.
   */
  static async getAttempts(
    quizId?: string,
    _token?: string,
  ): Promise<QuizAttemptHistoryItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('quiz_attempts')
      .select('*, quiz:quizzes(title, subject:subjects(id, title), topic:topics(id, title))')
      .eq('student_id', user.id);

    if (quizId) {
      query = query.eq('quiz_id', quizId);
    }

    query = query.order('completed_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data || []).map((item: any) => ({
      attemptId: item.id,
      quizId: item.quiz_id,
      quizTitle: item.quiz?.title || 'Untitled Quiz',
      subject: {
        id: item.quiz?.subject?.id || '',
        name: item.quiz?.subject?.title || 'Unknown Subject',
      },
      topic: item.quiz?.topic
        ? {
            id: item.quiz.topic.id,
            name: item.quiz.topic.title,
          }
        : null,
      score: item.score,
      total: item.total,
      percentage: item.total > 0 ? Math.round((item.score / item.total) * 100) : 0,
      completedAt: item.completed_at,
    }));
  }

  static async getMyAttempts(token?: string): Promise<QuizAttemptHistoryItem[]> {
    return this.getAttempts(undefined, token);
  }

  /**
   * Deletes a quiz by ID.
   */
  static async deleteQuiz(
    id: string,
    _token?: string,
  ): Promise<{ message: string }> {
    try {
      // 1. Clean up attempts and answers if foreign key cascade is not enabled
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('id')
        .eq('quiz_id', id);
      if (attempts && attempts.length > 0) {
        const attemptIds = attempts.map((a: any) => a.id);
        await supabase.from('quiz_answers').delete().in('attempt_id', attemptIds);
        await supabase.from('quiz_attempts').delete().eq('quiz_id', id);
      }

      // 2. Clean up questions and options
      const { data: questions } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('quiz_id', id);
      if (questions && questions.length > 0) {
        const qIds = questions.map((q: any) => q.id);
        await supabase.from('quiz_options').delete().in('question_id', qIds);
        await supabase.from('quiz_questions').delete().eq('quiz_id', id);
      }
    } catch (cleanupErr) {
      console.warn('Pre-delete cleanup warning:', cleanupErr);
    }

    const { data, error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      throw new Error(`Database error deleting quiz: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(
        'Could not delete quiz from the database. Please verify your Supabase permissions under Row Level Security (RLS).'
      );
    }

    this.clearCache();
    return { message: 'Quiz deleted successfully' };
  }

  /**
   * Bulk deletes multiple quizzes by their IDs.
   */
  static async deleteQuizzes(
    ids: string[],
    _token?: string,
  ): Promise<{ message: string; deletedCount: number }> {
    if (!ids || ids.length === 0) {
      return { message: 'No quizzes selected', deletedCount: 0 };
    }

    try {
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('id')
        .in('quiz_id', ids);
      if (attempts && attempts.length > 0) {
        const attemptIds = attempts.map((a: any) => a.id);
        await supabase.from('quiz_answers').delete().in('attempt_id', attemptIds);
        await supabase.from('quiz_attempts').delete().in('quiz_id', ids);
      }

      const { data: questions } = await supabase
        .from('quiz_questions')
        .select('id')
        .in('quiz_id', ids);
      if (questions && questions.length > 0) {
        const qIds = questions.map((q: any) => q.id);
        await supabase.from('quiz_options').delete().in('question_id', qIds);
        await supabase.from('quiz_questions').delete().in('quiz_id', ids);
      }
    } catch (cleanupErr) {
      console.warn('Bulk pre-delete cleanup warning:', cleanupErr);
    }

    const { data, error } = await supabase
      .from('quizzes')
      .delete()
      .in('id', ids)
      .select('id');

    if (error) {
      throw new Error(`Database error bulk deleting quizzes: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(
        'None of the selected quizzes were deleted from the database. Please verify your Supabase permissions under Row Level Security (RLS).'
      );
    }

    this.clearCache();
    return {
      message: `${data.length} quiz(zes) deleted successfully`,
      deletedCount: data.length,
    };
  }
}
