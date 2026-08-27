# LearnPath AI - AI-Powered Personalized Learning Path Recommender

A full-stack intelligent learning platform that generates personalized learning paths based on your goals, current skills, and preferences. It uses AI to analyze career goals, identifies skill gaps, and recommends curated resources in an optimal learning sequence.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [AI Provider Configuration](#ai-provider-configuration)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Recommendation Engine](#recommendation-engine)
- [Learning Path Generation](#learning-path-generation)
- [Testing](#testing)
- [Demo Account](#demo-account)

---

## Features

- **AI-Powered Goal Analysis** - Natural language goal input analyzed by AI to extract required skills, timeline, and difficulty
- **Skill Gap Analysis** - Compares current skill levels against target requirements with priority classification (critical/high/medium/low)
- **Personalized Recommendations** - Weighted multi-factor scoring engine that ranks 62+ curated resources
- **Adaptive Learning Paths** - Prerequisite-aware topological sort generates phased roadmaps
- **Skill Assessments** - Quiz-based skill evaluation with instant scoring and explanations
- **Progress Tracking** - Track time spent, completion status, and skill development over time
- **AI Chat Assistant** - Context-aware conversational AI that understands your learning profile
- **Resource Feedback Loop** - Rate resources to improve future recommendations
- **6-Step Onboarding Wizard** - Guided setup capturing goals, skills, interests, and preferences
- **Responsive Dashboard** - KPIs, skill gap visualization, learning path progress, and recommendations at a glance

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL 17 |
| ORM | Prisma 5 |
| Authentication | NextAuth v5 (Auth.js) with JWT |
| AI | Multi-provider (Groq, Anthropic, OpenAI, Grok, Custom) |
| Validation | Zod v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Testing | Jest + Testing Library |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                   │
│  Dashboard | Learning Path | Skills | Assessments    │
│  Resources | Progress | Profile | AI Assistant       │
├─────────────────────────────────────────────────────┤
│                  Next.js App Router                   │
│         17 API Routes + Server Components            │
├──────────┬──────────┬──────────┬────────────────────┤
│   Auth   │    AI    │  Engine  │     Database        │
│ NextAuth │ Provider │  Scoring │     Prisma          │
│   JWT    │ Abstract │  Paths   │   PostgreSQL        │
└──────────┴──────────┴──────────┴────────────────────┘
```

### Core Modules

| Module | Path | Purpose |
|--------|------|---------|
| AI Provider | `src/lib/ai/provider.ts` | Multi-provider abstraction (Groq, Anthropic, OpenAI, Grok, Custom) |
| Fallback AI | `src/lib/ai/fallback.ts` | Deterministic keyword-based AI when no API key configured |
| Goal Analyzer | `src/lib/ai/goal-analyzer.ts` | Extracts required skills and timeline from natural language goals |
| Chat Service | `src/lib/ai/chat-service.ts` | Context-aware AI chat with learner profile injection |
| Skill Gap Analyzer | `src/lib/skill-gap/analyzer.ts` | Calculates gaps and assigns priority levels |
| Recommendation Engine | `src/lib/recommendations/engine.ts` | 7-factor weighted scoring model |
| Path Generator | `src/lib/learning-path/generator.ts` | Topological sort with prerequisite resolution |
| Auth | `src/lib/auth/index.ts` | NextAuth v5 credentials provider configuration |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 15+ (running locally or remote)
- **npm** or **yarn**

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd HCL_Project

# 2. Install dependencies
npm install

# 3. Copy environment file and configure
cp .env.example .env
# Edit .env with your database credentials and AI provider key

# 4. Set up the database
npx prisma db push

# 5. Seed the database with sample data
npx prisma db seed

# 6. Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**

---

## Environment Variables

Create a `.env` file from `.env.example`:

```env
# Database
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/learning_path_db"

# Authentication
AUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# AI Provider (choose one: anthropic, grok, groq, openai, custom, fallback)
AI_PROVIDER="groq"

# Provider API Keys (uncomment the one you're using)
GROQ_API_KEY="gsk_..."
# ANTHROPIC_API_KEY="sk-ant-..."
# XAI_API_KEY="xai-..."
# OPENAI_API_KEY="sk-..."

# Optional: Override default model
# AI_MODEL="llama-3.3-70b-versatile"
```

---

## Database Setup

### Create the PostgreSQL database

```bash
# Using psql
psql -U postgres
CREATE DATABASE learning_path_db;
\q

# Or using createdb
createdb -U postgres learning_path_db
```

### Prisma Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (no migrations)
npm run db:push

# Create a migration
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (visual database browser)
npm run db:studio
```

### Database Schema (15 Models)

| Model | Purpose |
|-------|---------|
| User | Authentication and identity |
| LearnerProfile | Learning preferences and experience level |
| Interest | User's topic interests |
| Skill | Master skill catalog (42 skills across 7 categories) |
| LearnerSkill | User's proficiency per skill (0-5 scale) |
| Goal | Career/learning goals with target timeline |
| Resource | Curated learning materials (62 resources with real URLs) |
| ResourceSkill | Many-to-many: which skills a resource teaches |
| Prerequisite | Skill dependency graph (33 relationships) |
| LearningPath | Generated personalized roadmap |
| LearningPathItem | Individual items within a path (phased + ordered) |
| Assessment | Skill evaluation quizzes (5 assessments) |
| Question | Quiz questions with options (25 questions) |
| AssessmentAttempt | User's quiz results and scores |
| Progress | Resource completion tracking |
| Feedback | User ratings on resources |
| Conversation | AI chat sessions |
| Message | Individual chat messages |

---

## AI Provider Configuration

The app supports multiple AI providers through a unified interface. All providers fall back to a deterministic keyword-based engine if the API is unavailable.

| Provider | Free Tier | Setup |
|----------|-----------|-------|
| **Groq** | Yes (generous) | [console.groq.com](https://console.groq.com) |
| **Grok (xAI)** | Yes (limited) | [console.x.ai](https://console.x.ai) |
| **Anthropic** | No | [console.anthropic.com](https://console.anthropic.com) |
| **OpenAI** | No | [platform.openai.com](https://platform.openai.com) |
| **Custom** | Varies | Any OpenAI-compatible endpoint |
| **Fallback** | Always free | No API key needed (deterministic responses) |

### What the AI does in this app

1. **Goal Analysis** - Parses natural language career goals into structured skill requirements
2. **Chat Assistant** - Answers learning questions with awareness of your profile, skills, and progress
3. **Recommendations** - Enhances resource scoring with contextual understanding

### Fallback Mode

When no API key is configured (or `AI_PROVIDER="fallback"`), the app uses:
- Keyword-based goal analysis matching common career paths
- Template-based chat responses
- Rule-based recommendation explanations

The fallback provides a fully functional experience without any external API dependencies.

---

## Project Structure

```
HCL_Project/
├── app/                          # Next.js App Router
│   ├── (app)/                    # Authenticated pages (sidebar layout)
│   │   ├── dashboard/            # Main dashboard with KPIs
│   │   ├── learning-path/        # Interactive roadmap view
│   │   ├── skills/               # Skill tracking & gap visualization
│   │   ├── assessments/          # Quiz system
│   │   ├── resources/            # Resource browser with feedback
│   │   ├── progress/             # Progress tracking & analytics
│   │   ├── profile/              # Profile editing
│   │   ├── assistant/            # AI chat interface
│   │   └── layout.tsx            # Sidebar navigation wrapper
│   ├── (auth)/                   # Public auth pages
│   │   ├── login/
│   │   └── signup/
│   ├── onboarding/               # 6-step setup wizard
│   ├── api/                      # API routes (17 endpoints)
│   │   ├── auth/                 # NextAuth + signup
│   │   ├── goals/analyze/        # AI goal analysis
│   │   ├── skill-gap/analyze/    # Skill gap calculation
│   │   ├── learning-path/        # Path CRUD + generation
│   │   ├── recommendations/      # Scoring engine + feedback
│   │   ├── assessments/          # Quiz fetching + submission
│   │   ├── progress/             # Progress tracking
│   │   ├── profile/              # Profile CRUD
│   │   ├── chat/                 # AI chat + history
│   │   └── feedback/             # Resource feedback
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── providers.tsx             # SessionProvider wrapper
│   └── globals.css               # Tailwind CSS imports
├── src/
│   ├── lib/
│   │   ├── ai/                   # AI provider layer
│   │   │   ├── provider.ts       # Multi-provider factory
│   │   │   ├── fallback.ts       # Deterministic fallback
│   │   │   ├── goal-analyzer.ts  # Goal parsing with Zod schemas
│   │   │   └── chat-service.ts   # Context-aware chat
│   │   ├── auth/                 # Authentication
│   │   │   ├── index.ts          # NextAuth configuration
│   │   │   └── helpers.ts        # getCurrentUser, getCurrentProfile
│   │   ├── db/index.ts           # Prisma client singleton
│   │   ├── recommendations/
│   │   │   └── engine.ts         # 7-factor weighted scoring
│   │   ├── skill-gap/
│   │   │   └── analyzer.ts       # Gap calculation + priorities
│   │   ├── learning-path/
│   │   │   └── generator.ts      # Topological sort path builder
│   │   └── utils/cn.ts           # Tailwind class merge utility
│   ├── components/ui/            # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   └── input.tsx
│   └── middleware.ts             # Route middleware
├── prisma/
│   ├── schema.prisma             # Database schema (15 models)
│   └── seed.ts                   # Seed data (42 skills, 62 resources, 5 assessments)
├── tests/
│   └── recommendations.test.ts   # 9 tests covering scoring & paths
├── .env.example                  # Environment template
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST/GET | `/api/auth/[...nextauth]` | NextAuth handlers (sign in/out/session) |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get current user profile |
| PUT | `/api/profile` | Update profile settings |

### Goals & Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/goals/analyze` | AI-analyze a career goal |
| POST | `/api/skill-gap/analyze` | Calculate skill gaps for a goal |

### Learning Path
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/learning-path` | Get user's learning paths |
| POST | `/api/learning-path/generate` | Generate a new AI-powered path |
| PATCH | `/api/learning-path/items/[id]` | Update item status |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations` | Get personalized resource recommendations |
| POST | `/api/recommendations/feedback` | Submit resource feedback |

### Assessments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assessments` | List available assessments |
| GET | `/api/assessments/[id]` | Get assessment with questions |
| POST | `/api/assessments/[id]/submit` | Submit quiz answers |

### Progress & Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress` | Get progress summary |
| POST | `/api/progress` | Log progress on a resource |
| POST | `/api/feedback` | Submit resource feedback |

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to AI assistant |
| GET | `/api/chat/history` | Get conversation history |

---

## Recommendation Engine

The engine scores each resource using 7 weighted factors:

```
Final Score = goalRelevance     * 0.25
            + skillGapRelevance * 0.25
            + prerequisiteMatch * 0.15
            + difficultyMatch   * 0.10
            + preferenceMatch   * 0.10
            + timeFit           * 0.05
            + feedbackAdjust    * 0.10
```

| Factor | Weight | Description |
|--------|--------|-------------|
| Goal Relevance | 25% | How well the resource aligns with active goals |
| Skill Gap Relevance | 25% | Does it teach skills the user needs most? |
| Prerequisite Match | 15% | Does the user have the prerequisites? |
| Difficulty Match | 10% | Appropriate challenge level? |
| Preference Match | 10% | Matches learning style / content type preference? |
| Time Fit | 5% | Fits within weekly time budget? |
| Feedback Adjustment | 10% | Boosted/penalized by past feedback on similar resources |

---

## Learning Path Generation

Paths are generated through a multi-step pipeline:

1. **Goal Analysis** - AI extracts required skills from the goal description
2. **Skill Gap Calculation** - Compare current vs. required proficiency levels
3. **Priority Assignment** - Critical > High > Medium > Low based on gap size
4. **Prerequisite Resolution** - Build dependency graph from 33 skill prerequisites
5. **Topological Sort** - Order skills respecting dependencies
6. **Resource Matching** - Find best resource for each skill using the scoring engine
7. **Phase Assignment** - Group into learning phases (Foundations, Core, Advanced, Specialization)
8. **Milestone Insertion** - Add milestone checkpoints between phases

---

## Adaptive Learning

The system adapts based on user interactions:

- **Assessment Results** - High scores unlock harder content; low scores suggest review material
- **Feedback** - "Too easy" increases difficulty; "Not relevant" reduces similar suggestions
- **Completion** - Completing items unlocks next items and updates skill levels
- **Progress** - Skipped items don't block subsequent unlockable content

---

## Security

- Password hashing with bcryptjs
- JWT-based session management
- Server-side authentication checks on all API routes
- User ownership verification (users can only access their own data)
- Input validation with Zod on all API endpoints
- No secrets exposed to client

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/recommendations.test.ts
```

### Test Coverage (9 tests)
- Recommendation scoring calculation
- Skill gap analysis with priority levels
- Prerequisite chain resolution
- Learning path ordering
- Edge cases (no skills, empty profile, etc.)

---

## Demo Account

After seeding the database, a demo account is available:

| Field | Value |
|-------|-------|
| Email | `demo@example.com` |
| Password | `password123` |

The demo account includes a pre-configured learner profile with interests, skills, and an active goal.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Run test suite |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio (GUI) |

---

## Seed Data Summary

| Category | Count | Details |
|----------|-------|---------|
| Skills | 42 | Across 7 categories (Web Dev, Data Science, ML, Cloud, DevOps, Design, Management) |
| Resources | 62 | Real URLs to Coursera, Udemy, freeCodeCamp, MDN, Kaggle, YouTube, etc. |
| Prerequisites | 33 | Skill dependency relationships |
| Assessments | 5 | Python, JavaScript, React, Data Science, ML |
| Questions | 25 | Multiple-choice with explanations |

---

## Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```

For deployment, ensure:
1. PostgreSQL is accessible from your hosting environment
2. `DATABASE_URL` points to your production database
3. `AUTH_SECRET` is a strong random value
4. `NEXTAUTH_URL` matches your production domain
5. AI provider API key is set (or use fallback mode)

---

## License

This project was built as part of the HCL Project initiative.
