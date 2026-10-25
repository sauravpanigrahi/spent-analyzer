import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://spent-analyzer-two.vercel.app";

const routeMetadata = {
  "/": {
    title: "Spend Analyzer | Personal Expense Tracker",
    description:
      "Track expenses, set category budgets, and review spending trends with Spend Analyzer. Create an account to save and organize transactions.",
    indexable: true,
  },
  "/login": {
    title: "Sign in | Spend Analyzer",
    description: "Sign in to access your private Spend Analyzer account.",
  },
  "/signup": {
    title: "Create an account | Spend Analyzer",
    description: "Create a Spend Analyzer account to save your transactions.",
  },
  "/forgot-password": {
    title: "Reset your password | Spend Analyzer",
    description: "Request a password reset for your Spend Analyzer account.",
  },
  "/profile-setup": {
    title: "Set up your profile | Spend Analyzer",
    description: "Complete your private Spend Analyzer account profile.",
  },
  "/dashboard": {
    title: "Dashboard | Spend Analyzer",
    description: "View your private spending dashboard.",
  },
  "/transactions": {
    title: "Transactions | Spend Analyzer",
    description: "Manage your private income and expense transactions.",
  },
  "/budgets": {
    title: "Budgets | Spend Analyzer",
    description: "Manage your private category budgets.",
  },
  "/analytics": {
    title: "Analytics | Spend Analyzer",
    description: "Review analytics for your private spending data.",
  },
  "/savings": {
    title: "Savings goals | Spend Analyzer",
    description: "Manage your private savings goals.",
  },
  "/settings": {
    title: "Settings | Spend Analyzer",
    description: "Manage your private Spend Analyzer account settings.",
  },
  "/security": {
    title: "Security | Spend Analyzer",
    description: "Manage security settings for your private account.",
  },
};

const setMetaContent = (selector, attribute, value) => {
  let element = document.head.querySelector(selector);
  if (!value) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("meta");
    const [key, name] = selector
      .match(/\[(name|property)="([^"]+)"\]/)
      .slice(1);
    element.setAttribute(key, name);
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
};

export const RouteMetadata = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const metadata = routeMetadata[pathname] || {
      title: "Page not found | Spend Analyzer",
      description: "The requested Spend Analyzer page could not be found.",
    };
    const canonicalUrl = metadata.indexable
      ? new URL(pathname, SITE_URL).href
      : null;

    document.documentElement.lang = "en";
    document.title = metadata.title;

    setMetaContent('meta[name="description"]', "content", metadata.description);
    setMetaContent(
      'meta[name="robots"]',
      "content",
      metadata.indexable
        ? "index, follow, max-image-preview:large"
        : "noindex, nofollow",
    );

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalUrl) {
      canonical?.remove();
    } else {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
    }

    const socialMetadata = metadata.indexable
      ? {
          'meta[property="og:type"]': "website",
          'meta[property="og:site_name"]': "Spend Analyzer",
          'meta[property="og:title"]': metadata.title,
          'meta[property="og:description"]': metadata.description,
          'meta[property="og:url"]': canonicalUrl,
          'meta[name="twitter:card"]': "summary",
          'meta[name="twitter:title"]': metadata.title,
          'meta[name="twitter:description"]': metadata.description,
        }
      : {
          'meta[property="og:type"]': null,
          'meta[property="og:site_name"]': null,
          'meta[property="og:title"]': null,
          'meta[property="og:description"]': null,
          'meta[property="og:url"]': null,
          'meta[name="twitter:card"]': null,
          'meta[name="twitter:title"]': null,
          'meta[name="twitter:description"]': null,
        };
    Object.entries(socialMetadata).forEach(([selector, value]) => {
      setMetaContent(selector, "content", value);
    });
  }, [pathname]);

  return null;
};
