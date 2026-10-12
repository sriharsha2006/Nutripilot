# 🥗 NutriPilot

**NutriPilot** is an AI-powered personal nutrition and meal planning web application built as a Foundations of AI Capstone project. It helps users achieve their dietary goals through smart meal plans, pantry management, real-time tracking, and analytics — all with a modern, responsive UI.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | Secure registration & login with JWT (HttpOnly cookies), rate-limited |
| 🧭 **Onboarding Wizard** | Multi-step profile setup — goals, diet, allergies, activity level |
| 📊 **Dashboard** | Daily nutrition summary, macro rings, hydration, and quick actions |
| 🗓️ **Meal Planner** | AI-generated weekly meal plan with drag-and-drop, lock, refresh & swap |
| 🍳 **Recipes** | Browse and create custom recipes; full cooking mode with step-by-step guide |
| 🥬 **Pantry** | Track pantry stock, expiry dates, and automatic leftover subtraction |
| 🛒 **Grocery List** | Auto-generated shopping list based on the active meal plan |
| 💧 **Daily Tracking** | Log water intake and weight; mark meals as eaten |
| 📈 **Progress Analytics** | Recharts-powered calorie, macro, weight & adherence charts (7d / 14d / 30d) |
| 📄 **Reports** | Generate, preview, and email weekly nutrition PDF reports |
| 🌟 **Recommendations** | Personalised meal and recipe recommendations based on profile |
| ⚙️ **Settings** | Account management, notification preferences, diet & allergy controls |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) + [Base UI](https://base-ui.com) |
| **Styling** | Tailwind CSS v4 |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Charts** | [Recharts](https://recharts.org) |
| **Forms** | React Hook Form + Zod validation |
| **Auth** | [jose](https://github.com/panva/jose) (JWT, HS256, HttpOnly cookies) |
| **Theming** | next-themes (dark / light mode) |
| **Unit Tests** | Vitest + jsdom |
| **E2E Tests** | Playwright |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or pnpm / yarn)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd FoAI_Capstone

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# JWT signing secret — change this to a strong random string in production
AUTH_SECRET=your-super-secret-key-here
```

> **Note:** If `AUTH_SECRET` is omitted, a default development key is used. Never use the default in production.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

A demo account is pre-seeded automatically on every server start:

| Field | Value |
|---|---|
| **Email** | `demo@nutripilot.app` |
| **Password** | `password123` |

---

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router pages & API routes
│   ├── (auth)/                 # Login & Register pages
│   ├── dashboard/              # Main dashboard
│   ├── onboarding/             # Multi-step profile wizard
│   ├── planner/                # Weekly meal planner
│   ├── recipes/                # Recipe browser & creator
│   ├── pantry/                 # Pantry management
│   ├── grocery/                # Grocery list
│   ├── tracking/               # Daily tracking (water, weight, meals)
│   ├── progress/               # Progress analytics & charts
│   ├── reports/                # Report generation & email
│   ├── recommendations/        # Personalised recommendations
│   ├── profile/                # User profile
│   ├── settings/               # Account & app settings
│   └── api/                    # REST API route handlers
│
├── components/                 # Reusable React components
│   ├── planner/                # MealCard, SwapModal, PlannerGrid
│   ├── recipes/                # CookingModeModal, RecipeCard
│   ├── reports/                # ReportPreviewModal
│   └── ui/                     # shadcn/ui base components
│
└── lib/
    ├── api/                    # Typed client-side API fetchers & type definitions
    ├── mock/                   # In-memory mock data layer (server-side)
    │   ├── auth.ts             # User store & JWT logic
    │   ├── planner.ts          # Recipe catalog & meal plan generation
    │   ├── tracking.ts         # Water & weight logs
    │   ├── pantry.ts           # Pantry items & expiry
    │   ├── recipes.ts          # Custom recipes
    │   ├── reports.ts          # Report generation
    │   ├── constraints.ts      # Allergy & dietary filtering
    │   └── profile.ts          # User profile & calculated nutrition
    ├── nutrition/              # Nutrition calculation engine (TDEE, macros)
    ├── email/                  # Email sending utilities
    └── pdf/                    # PDF report generation
```

---

## 🧪 Testing

### Unit Tests (Vitest)

```bash
npm run test          # Run all unit tests once
npm run test:watch    # Run in watch mode
```

### End-to-End Tests (Playwright)

```bash
# Ensure the dev server is running first
npm run dev

# In another terminal
npm run test:e2e
```

---

## ⚠️ Data Persistence

This project currently uses an **in-memory mock data layer** — there is no external database. All data (users, logs, plans) lives in server process memory and is **reset when the dev server restarts**.

This is by design for the Capstone prototype phase. The mock layer in `src/lib/mock/` is structured to be swapped out for a real database (e.g. PostgreSQL + Prisma) in a future phase.

---

## 📋 Functional Requirements Coverage

All 22 SRS functional requirements are implemented. See [`IMPLEMENTATION_STATUS.md`](./IMPLEMENTATION_STATUS.md) for the full traceability matrix.

---

## 📦 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:e2e` | Run E2E tests (Playwright) |

---

## 📄 License

This project was created as an academic Capstone submission and is intended for educational purposes.
