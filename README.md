# MedCore

MedCore is a modern medical education platform built with **React (Vite)**, **TypeScript**, and **Supabase**, designed for medical faculty students to study, create, and take quizzes, and manage article‑based learning resources.

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
# Build for Production
```bash
npm run build
```

## 🚀 Deploy to Cloudflare Pages

The frontend is a static Vite build. You can deploy it directly to **Cloudflare Pages**:

1. Push the repository to GitHub (already done).
2. In the Cloudflare dashboard, create a new Pages project and connect it to this repo.
3. Set the **Build command** to `npm run build`.
4. Set the **Build output directory** to `dist`.
5. Add the two environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Pages Settings (or link the `.env` file via secret).
6. Click **Save and Deploy** – Cloudflare will serve the site on a global edge network.

No separate backend host is required because all data and auth are served by Supabase.

## 📱 Mobile Responsiveness

All UI components use responsive CSS (flexbox, CSS grid, and relative units). Test with:

- `npm run dev` and resize the browser or use Chrome DevTools device toolbar.
- Run `npm run build` and preview the static files (`npx serve dist`) on a mobile device.

The layout adapts to phones, tablets, and desktops out‑of‑the‑box.

## 📦 Repository Details

- **Description:** MedCore – a modern medical education platform for faculty students to study, create, and take quizzes.
- **Website:** https://github.com/Bijon2002/MediCore-Jeyapura-MedicalFaculty
- **Topics:** medical-education, supabase, react, vite, typescript
- **Deployments:** Cloudflare Pages (static), Supabase (backend services).

These details can be filled in the GitHub repository settings under *About* and *Topics*.


