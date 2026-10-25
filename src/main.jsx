import React from "react";
import ReactDOM from "react-dom/client";
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
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TransactionProvider>
            <BudgetProvider>
              <App />
              <RouteMetadata />
              <GoogleAnalytics />
              <AnalyticsConsent />
            </BudgetProvider>
          </TransactionProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
