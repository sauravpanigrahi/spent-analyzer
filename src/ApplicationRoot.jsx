import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { TransactionProvider } from "./context/TransactionContext";
import { BudgetProvider } from "./context/BudgetContext";
import { ThemeProvider } from "./context/ThemeContext";
import {
  AnalyticsConsent,
  GoogleAnalytics,
} from "./components/analytics/GoogleAnalytics";
import { RouteMetadata } from "./components/seo/RouteMetadata";
import { AppErrorBoundary } from "./components/feedback/AppErrorBoundary";
import { GlobalErrorNotifications } from "./components/feedback/GlobalErrorNotifications";

export const ApplicationRoot = () => (
  <AppErrorBoundary>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TransactionProvider>
            <BudgetProvider>
              <App />
              <RouteMetadata />
              <GoogleAnalytics />
              <AnalyticsConsent />
              <GlobalErrorNotifications />
            </BudgetProvider>
          </TransactionProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </AppErrorBoundary>
);
