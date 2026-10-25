import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Layout } from "./components/layout/Layout";

const Landing = lazy(() =>
  import("./pages/Landing").then((module) => ({ default: module.Landing })),
);
const Login = lazy(() =>
  import("./pages/Login").then((module) => ({ default: module.Login })),
);
const Signup = lazy(() =>
  import("./pages/Signup").then((module) => ({ default: module.Signup })),
);
const ForgotPassword = lazy(() =>
  import("./pages/ForgotPassword").then((module) => ({
    default: module.ForgotPassword,
  })),
);
const ResetPassword = lazy(() =>
  import("./pages/ResetPassword").then((module) => ({
    default: module.ResetPassword,
  })),
);
const EmailConfirmation = lazy(() =>
  import("./pages/EmailConfirmation").then((module) => ({
    default: module.EmailConfirmation,
  })),
);
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({
    default: module.Dashboard,
  })),
);
const Transactions = lazy(() =>
  import("./pages/Transactions").then((module) => ({
    default: module.Transactions,
  })),
);
const Budgets = lazy(() =>
  import("./pages/Budgets").then((module) => ({ default: module.Budgets })),
);
const Analytics = lazy(() =>
  import("./pages/Analytics").then((module) => ({
    default: module.Analytics,
  })),
);
const Savings = lazy(() =>
  import("./pages/Savings").then((module) => ({ default: module.Savings })),
);
const Settings = lazy(() =>
  import("./pages/Settings").then((module) => ({ default: module.Settings })),
);
const Security = lazy(() =>
  import("./pages/Security").then((module) => ({ default: module.Security })),
);
const ProfileSetup = lazy(() =>
  import("./pages/profilesetup").then((module) => ({
    default: module.ProfileSetup,
  })),
);
const NotFound = lazy(() =>
  import("./pages/NotFound").then((module) => ({ default: module.NotFound })),
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    children
  );
};

const App = () => {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950"
          role="status"
          aria-label="Loading page"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/email-confirmed" element={<EmailConfirmation />} />
        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/security" element={<Security />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
