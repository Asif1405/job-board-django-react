# JobBoard — Frontend

React 19 SPA built with **Bun**, **Rsbuild**, **Tailwind CSS**, **shadcn/ui**, **Zustand**, and **TanStack Query**.

---

## Stack

| Tool | Purpose |
|---|---|
| **React 19** | UI framework |
| **Bun** | Package manager + runtime |
| **Rsbuild** | Bundler (Rspack-based, Vite-compatible API) |
| **TypeScript** | Type safety |
| **React Router v6** | Client-side routing |
| **TanStack Query v5** | Server-state, caching, mutations |
| **Zustand v5** | Client-state (auth, persisted to localStorage) |
| **Axios** | HTTP client with JWT interceptors |
| **React Hook Form + Zod** | Forms + validation |
| **Tailwind CSS v3** | Utility-first styling |
| **Radix UI** | Accessible headless primitives |
| **lucide-react** | Icons |

---

## Project Structure

```
src/
├── api/              # Axios API wrappers (auth, jobs, applications)
├── components/
│   ├── layout/       # RootLayout, Navbar, Footer
│   └── ui/           # Button, Input, Card, Badge, Spinner, Toast…
├── features/
│   ├── auth/         # LoginPage, RegisterPage, useAuth hooks
│   ├── jobs/         # JobListPage, JobDetailPage, JobCard, JobFilters, useJobs
│   ├── applications/ # MyApplicationsPage, ApplyModal, useApplications
│   └── dashboard/    # EmployerDashboardPage, PostJobPage, ManageApplicationsPage
├── lib/
│   ├── axios.ts      # Axios instance + silent refresh interceptor
│   └── utils.ts      # cn(), formatSalary(), formatDate(), timeAgo()
├── pages/            # HomePage, NotFoundPage
├── routes/           # Router, ProtectedRoute, GuestRoute
├── store/
│   └── authStore.ts  # Zustand auth store (persisted)
├── styles/
│   └── globals.css   # Tailwind directives + CSS variables (shadcn theme)
├── types/            # All shared TypeScript interfaces
├── App.tsx           # QueryClientProvider + RouterProvider
└── main.tsx          # React root mount
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.1
- Backend API running at `http://localhost:8000`

### Install

```bash
cd frontend
bun install
```

### Dev server

```bash
bun run dev
# → http://localhost:3000
# API proxied → http://localhost:8000/api
```

### Build

```bash
bun run build
# output → frontend/dist/
```

### Type check

```bash
bun run type-check
```

---

## Environment

The dev server proxies `/api` → `http://localhost:8000` (configured in `rsbuild.config.ts`).

For production, set your API base URL via the proxy or update `src/lib/axios.ts` `baseURL`.

---

## Auth Flow

1. User logs in → backend returns `{ access, refresh, user }`
2. Tokens + user stored in `localStorage` via Zustand `persist`
3. Every Axios request attaches `Authorization: Bearer <access>`
4. On 401 → interceptor silently POSTs to `/api/v1/auth/token/refresh/`
5. On refresh failure → `logout()` called, user redirected to `/login`

---

## Route Map

| Path | Component | Guard |
|---|---|---|
| `/` | `HomePage` | public |
| `/jobs` | `JobListPage` | public |
| `/jobs/:slug` | `JobDetailPage` | public |
| `/login` | `LoginPage` | guest only |
| `/register` | `RegisterPage` | guest only |
| `/applications` | `MyApplicationsPage` | candidate |
| `/dashboard` | `EmployerDashboardPage` | employer |
| `/dashboard/post-job` | `PostJobPage` | employer |
| `/dashboard/jobs/:jobId/applications` | `ManageApplicationsPage` | employer |
