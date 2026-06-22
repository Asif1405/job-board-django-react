import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "./guards";
import RootLayout from "@/components/layout/RootLayout";
import { Spinner } from "@/components/ui/Spinner";

// ── Lazy page imports ──────────────────────────────────────────────────────
const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/RegisterPage"));
const JobListPage = lazy(() => import("@/features/jobs/JobListPage"));
const JobDetailPage = lazy(() => import("@/features/jobs/JobDetailPage"));
const MyApplicationsPage = lazy(
  () => import("@/features/applications/MyApplicationsPage")
);
const EmployerDashboardPage = lazy(
  () => import("@/features/dashboard/EmployerDashboardPage")
);
const PostJobPage = lazy(() => import("@/features/dashboard/PostJobPage"));
const ManageApplicationsPage = lazy(
  () => import("@/features/dashboard/ManageApplicationsPage")
);
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

const wrap = (el: React.ReactNode) => (
  <Suspense
    fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    }
  >
    {el}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // ── Public routes ──────────────────────────────────────────────────
      { index: true, element: wrap(<HomePage />) },
      { path: "jobs", element: wrap(<JobListPage />) },
      { path: "jobs/:slug", element: wrap(<JobDetailPage />) },

      // ── Guest-only routes ───────────────────────��──────────────────────
      {
        element: <GuestRoute />,
        children: [
          { path: "login", element: wrap(<LoginPage />) },
          { path: "register", element: wrap(<RegisterPage />) },
        ],
      },

      // ── Candidate routes ───────────────────────────────────────────────
      {
        element: <ProtectedRoute allowedRoles={["candidate"]} />,
        children: [
          { path: "applications", element: wrap(<MyApplicationsPage />) },
        ],
      },

      // ── Employer routes ────────────────────────────────────────────────
      {
        element: <ProtectedRoute allowedRoles={["employer"]} />,
        children: [
          { path: "dashboard", element: wrap(<EmployerDashboardPage />) },
          { path: "dashboard/post-job", element: wrap(<PostJobPage />) },
          {
            path: "dashboard/jobs/:jobId/applications",
            element: wrap(<ManageApplicationsPage />),
          },
        ],
      },

      // ── 404 ────────────────────────────────────────────────────────────
      { path: "*", element: wrap(<NotFoundPage />) },
    ],
  },
]);
