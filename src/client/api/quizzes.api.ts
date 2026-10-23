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
  /**
   * Retrieves quizzes from Supabase.
   */
  static async getQuizzes(_token?: string): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, subject:subjects(id, title), topic:topics(id, title), questions:quiz_questions(*, options:quiz_options(*))')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((q: any) => ({
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
      isCorrect: boolean;
    }> = [];

    const answersToInsert: Array<{
      question_id: string;
      option_id: string | null;
    }> = [];

    for (const q of questions) {
      const selected = data.answers.find((a) => a.questionId === q.id);
      const correctOption = q.options.find((opt: { is_correct: boolean }) => opt.is_correct);
      const isCorrect = Boolean(selected && correctOption && selected.optionId === correctOption.id);

      if (isCorrect) score++;

      answersToInsert.push({
        question_id: q.id,
        option_id: selected?.optionId || null,
      });

      answerBreakdown.push({
        questionId: q.id,
        selectedOptionId: selected?.optionId || null,
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
    const { error } = await supabase.from('quizzes').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { message: 'Quiz deleted successfully' };
  }
}
