import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../DB/supabaseclient";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Target,
  PiggyBank,
  Shield,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description:
      "Visualize your spending patterns with interactive charts and personalized insights.",
  },
  {
    icon: CreditCard,
    title: "Transaction Management",
    description:
      "Add, edit, and categorize transactions with powerful filtering and search.",
  },
  {
    icon: Target,
    title: "Budget Tracking",
    description:
      "Set budgets for categories and get alerts when you approach limits.",
  },
  {
    icon: PiggyBank,
    title: "Savings Goals",
    description: "Create and track progress towards your financial goals.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your financial data is protected by authenticated, user-scoped access.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Built with modern tech for instant interactions and smooth animations.",
  },
];

export const Landing = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [platformStats, setPlatformStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const loadPlatformStats = async () => {
      const { data, error } = await supabase.rpc("get_public_platform_stats");

      if (!isCurrent) return;
      if (error) {
        setStatsError(error.message);
        setStatsLoading(false);
        return;
      }

      const stats = Array.isArray(data) ? data[0] : data;
      if (
        !stats ||
        !Number.isFinite(Number(stats.registered_users)) ||
        !Number.isFinite(Number(stats.transactions_tracked)) ||
        !Number.isFinite(Number(stats.money_managed))
      ) {
        setStatsError("Supabase returned invalid platform statistics.");
        setStatsLoading(false);
        return;
      }

      setPlatformStats(stats);
      setStatsLoading(false);
    };

    loadPlatformStats().catch((error) => {
      if (isCurrent) {
        setStatsError(error.message || "Could not load platform statistics.");
        setStatsLoading(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  const formattedStats = platformStats
    ? [
        {
          value: new Intl.NumberFormat("en-US").format(
            Number(platformStats.registered_users),
          ),
          label: "Registered Users",
        },
        {
          value: new Intl.NumberFormat("en-US").format(
            Number(platformStats.transactions_tracked),
          ),
          label: "Transactions Tracked",
        },
        {
          value: new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(Number(platformStats.money_managed)),
          label: "Money Managed",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary-600 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-xl text-neutral-900 dark:text-neutral-100">
                Spend Analyzer
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
              >
                How It Works
              </a>
            </div>
            <div className="flex items-center gap-3">
              {!isAuthLoading &&
                (isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button variant="primary" size="sm">
                      {user?.name?.trim() ||
                        user?.email?.split("@")[0] ||
                        "Dashboard"}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button variant="primary" size="sm">
                        Get Started Free
                      </Button>
                    </Link>
                  </>
                ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 text-sm font-medium mb-6 animate-in">
                <Zap className="h-4 w-4" />
                <span>Expense tracking, budgets, and savings goals</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-6 animate-in">
                Take Control of Your{" "}
                <span className="text-primary-600 dark:text-primary-400">
                  Finances
                </span>{" "}
                with Confidence
              </h1>
              <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto animate-in">
                A modern expense tracker with beautiful dashboards, smart
                budgets, and actionable insights. Sign in to securely save and
                access your transactions across sessions.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in">
                <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    {isAuthenticated
                      ? "Open Dashboard"
                      : "Start Free — No Credit Card"}
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400 animate-in">
                Secure account access • Your data is private to you
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {(statsLoading
                ? [
                    { value: "...", label: "Registered Users" },
                    { value: "...", label: "Transactions Tracked" },
                    { value: "...", label: "Money Managed" },
                  ]
                : formattedStats
              ).map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400">
                    {stat.label}
                  </div>
                  {stat.label === "Money Managed" && platformStats && (
                    <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Total value of saved transactions
                    </div>
                  )}
                </div>
              ))}
              {statsError && (
                <p
                  className="col-span-full text-center text-sm text-red-600 dark:text-red-400"
                  role="status"
                >
                  Live platform statistics are unavailable: {statsError}
                </p>
              )}
            </div>
          </div>
        </section>

        <section id="features" className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Everything You Need to{" "}
                <span className="text-primary-600 dark:text-primary-400">
                  Master Your Money
                </span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Powerful features designed for modern financial management.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="card-hover h-full">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 mb-4 w-fit">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="py-20 lg:py-32 bg-white dark:bg-neutral-900"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Get started in three simple steps.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Add Transactions",
                  description:
                    "Log income and expenses with categories, payment methods, and notes. Import from CSV or add manually.",
                },
                {
                  step: "02",
                  title: "Set Budgets",
                  description:
                    "Create monthly budgets for categories. Get visual progress bars and alerts when you near limits.",
                },
                {
                  step: "03",
                  title: "Analyze & Save",
                  description:
                    "View interactive charts, get personalized insights, and track savings goals to build wealth.",
                },
              ].map((item, index) => (
                <div key={index} className="text-center relative">
                  <div className="absolute left-1/2 -translate-x-1/2 top-0 text-5xl font-bold text-neutral-200 dark:text-neutral-800">
                    {item.step}
                  </div>
                  <div className="relative z-10 pt-16">
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 md:p-16 text-center text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Take Control?
              </h2>
              <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
                Track your spending, manage budgets, and understand your
                financial habits. Create an account to get started.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto bg-white text-primary-600 hover:bg-primary-50"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    {isAuthenticated ? "Open Dashboard" : "Get Started Free"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-primary-600 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-xl text-neutral-900 dark:text-neutral-100">
                  Spend Analyzer
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                Modern expense tracking for the financially conscious.
              </p>
            </div>
            <nav aria-label="Explore Spend Analyzer">
              <h2 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Product
              </h2>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li>
                  <a
                    href="#features"
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    How it works
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500 dark:text-neutral-400">
            <p>&copy; {new Date().getFullYear()} Spend Analyzer.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
