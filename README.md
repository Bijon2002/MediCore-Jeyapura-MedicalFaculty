# MedCore

MedCore is a modern medical education platform built with **React (Vite)**, **TypeScript**, and **Supabase**.

---

## 🏗 Architecture

* **Frontend:** React 19 + TypeScript + Vite
* **Backend & Database:** Supabase (Managed PostgreSQL, Supabase Auth, Row Level Security)
* **SDK:** `@supabase/supabase-js`
* **Styling:** CSS3 & modern design tokens

---

## 📁 Project Structure

```
Medi-Core/
├── public/                 # Static assets & images
├── src/
│   ├── auth/              # Supabase AuthContext & Session management
│   ├── client/
│   │   ├── api/           # Supabase API services (Articles, Quizzes, Profiles, Subjects, Topics)
│   │   ├── types/         # TypeScript interfaces & domain types
│   │   └── utils/         # Helper functions
│   ├── components/        # React UI components (Dashboard, Quizzes, Articles, Profile, etc.)
│   ├── lib/
│   │   └── supabase.ts    # Initialized Supabase client
│   ├── App.tsx            # Main application shell & routing
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styling & design tokens
├── supabase/
│   └── schema.sql         # Complete PostgreSQL schema, triggers & RLS policies
├── .env                   # Supabase environment variables (URL & Anon Key)
├── index.html             # Vite entry HTML
├── package.json           # Dependencies & scripts
└── vite.config.ts         # Vite configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* A [Supabase](https://supabase.com/) project

### 2. Environment Setup
Configure your Supabase credentials in `.env`:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Database Setup
Run the SQL schema located in `supabase/schema.sql` inside your Supabase **SQL Editor**.

### 4. Run Locally
```bash
npm install
npm run dev
```

### 5. Build for Production
```bash
npm run build
```
