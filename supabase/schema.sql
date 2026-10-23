-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'MEDICAL_REVIEWER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE article_status AS ENUM ('DRAFT', 'PUBLISHED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Users / Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    role user_role NOT NULL DEFAULT 'STUDENT',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Student Profile Table
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    medical_school TEXT,
    year_of_study INTEGER,
    target_exam TEXT,
    specialization_interest TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Reviewer Profile Table
CREATE TABLE IF NOT EXISTS public.reviewer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    professional_title TEXT,
    specialty TEXT,
    qualifications TEXT,
    institution TEXT,
    bio TEXT,
    expertise TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Topics Table
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Articles Table
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    status article_status NOT NULL DEFAULT 'DRAFT',
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    featured_image_url TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_author ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_subject ON public.articles(subject_id);
CREATE INDEX IF NOT EXISTS idx_articles_topic ON public.articles(topic_id);

-- 8. Reviewer Applications Table
CREATE TABLE IF NOT EXISTS public.reviewer_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    professional_title TEXT NOT NULL,
    specialty TEXT NOT NULL,
    qualifications TEXT NOT NULL,
    institution TEXT NOT NULL,
    bio TEXT,
    expertise TEXT,
    status application_status NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    reviewed_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Quiz Questions Table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    explanation TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Quiz Options Table
CREATE TABLE IF NOT EXISTS public.quiz_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0
);

-- 12. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Quiz Answers Table
CREATE TABLE IF NOT EXISTS public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    option_id UUID REFERENCES public.quiz_options(id) ON DELETE SET NULL
);

-- 14. Automatic Profile Trigger on Signup
-- When a user signs up via Supabase Auth, automatically insert a row into public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'first_name', ''),
        COALESCE(new.raw_user_meta_data->>'last_name', ''),
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'STUDENT'::user_role)
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 15. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviewer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviewer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- 16. Security Policies (RLS)

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- STUDENT & REVIEWER PROFILES
CREATE POLICY "Student profiles are viewable by everyone" 
    ON public.student_profiles FOR SELECT USING (true);
CREATE POLICY "Students can update their own profile" 
    ON public.student_profiles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Reviewer profiles viewable by everyone" 
    ON public.reviewer_profiles FOR SELECT USING (true);
CREATE POLICY "Reviewers can update their own profile" 
    ON public.reviewer_profiles FOR ALL USING (auth.uid() = user_id);

-- SUBJECTS & TOPICS (Everyone can read, authenticated can manage)
CREATE POLICY "Anyone can view subjects" 
    ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage subjects" 
    ON public.subjects FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view topics" 
    ON public.topics FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage topics" 
    ON public.topics FOR ALL USING (auth.role() = 'authenticated');

-- ARTICLES
CREATE POLICY "Anyone can read published articles" 
    ON public.articles FOR SELECT 
    USING (status = 'PUBLISHED' OR auth.uid() = author_id);
CREATE POLICY "Authenticated users can create articles" 
    ON public.articles FOR INSERT 
    WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their own articles" 
    ON public.articles FOR UPDATE 
    USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete their own articles" 
    ON public.articles FOR DELETE 
    USING (auth.uid() = author_id);

-- QUIZZES & QUESTIONS
CREATE POLICY "Anyone can view published quizzes" 
    ON public.quizzes FOR SELECT 
    USING (is_published = true OR auth.uid() = created_by_id);
CREATE POLICY "Authenticated users can create quizzes" 
    ON public.quizzes FOR INSERT 
    WITH CHECK (auth.uid() = created_by_id);
CREATE POLICY "Creators can update quizzes" 
    ON public.quizzes FOR UPDATE 
    USING (auth.uid() = created_by_id);

CREATE POLICY "Anyone can view quiz questions" 
    ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Creators can manage questions" 
    ON public.quiz_questions FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view quiz options" 
    ON public.quiz_options FOR SELECT USING (true);
CREATE POLICY "Creators can manage options" 
    ON public.quiz_options FOR ALL USING (auth.role() = 'authenticated');

-- QUIZ ATTEMPTS & ANSWERS
CREATE POLICY "Students can view their own attempts" 
    ON public.quiz_attempts FOR SELECT 
    USING (auth.uid() = student_id);
CREATE POLICY "Students can submit quiz attempts" 
    ON public.quiz_attempts FOR INSERT 
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own answers" 
    ON public.quiz_answers FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = quiz_answers.attempt_id AND student_id = auth.uid()));
CREATE POLICY "Students can submit answers" 
    ON public.quiz_answers FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = quiz_answers.attempt_id AND student_id = auth.uid()));

-- REVIEWER APPLICATIONS
CREATE POLICY "Users can view their own application" 
    ON public.reviewer_applications FOR SELECT 
    USING (auth.uid() = user_id OR auth.role() = 'authenticated');
CREATE POLICY "Users can submit reviewer application" 
    ON public.reviewer_applications FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update applications" 
    ON public.reviewer_applications FOR UPDATE 
    USING (auth.role() = 'authenticated');
