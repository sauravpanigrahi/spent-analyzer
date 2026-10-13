import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import {
  ArrowRight,
  CheckCircle2,
  BarChart3,
  CreditCard,
  Target,
  PiggyBank,
  Shield,
  Users,
  Zap,
  Globe,
  Lock,
  Smartphone,
  Monitor,
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
    description: "Your data stays in your browser. No database, no tracking.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Built with modern tech for instant interactions and smooth animations.",
  },
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "50K+", label: "Transactions Tracked" },
  { value: "$2M+", label: "Money Managed" },
  { value: "99%", label: "User Satisfaction" },
];

export const Landing = () => {
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
              <Link
                to="#features"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
              >
                Features
              </Link>
              <Link
                to="#how-it-works"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
              >
                How It Works
              </Link>
              <Link
                to="#pricing"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
              >
                Pricing
              </Link>
            </div>
            <div className="flex items-center gap-3">
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
                <span>New: AI-Powered Insights & Recurring Transactions</span>
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
                budgets, and actionable insights. No database required — your
                data stays private in your browser.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in">
                <Link to="/signup">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Start Free — No Credit Card
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    View Demo Dashboard
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400 animate-in">
                Demo mode available • No account required • Data stored locally
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400">
                    {stat.label}
                  </div>
                </div>
              ))}
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
                Join thousands of users who have transformed their financial
                habits with Spend Analyzer. Start free today — no credit card
                required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto bg-white text-primary-600 hover:bg-primary-50"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-white text-white hover:bg-primary-500"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Try Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li>
                  <Link
                    to="/dashboard"
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/transactions"
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Transactions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/budgets"
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Budgets
                  </Link>
                </li>
                <li>
                  <Link
                    to="/analytics"
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Legal
              </h4>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500 dark:text-neutral-400">
            <p>&copy; 2025 Spend Analyzer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
