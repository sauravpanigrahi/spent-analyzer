import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/Card";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export const Login = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setError("");
    const result = await login(
      formData.email,
      formData.password,
      formData.remember,
    );

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    const result = await login("demo@spendanalyzer.com", "demo1234", true);
    if (result.success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="font-semibold text-xl text-neutral-900 dark:text-neutral-100">
              Spend Analyzer
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Welcome back
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Sign in to your account to continue
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            {error && (
              <div
                className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-2 text-sm"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={errors.email}
                leftIcon={<Mail className="h-4 w-4" />}
                autoComplete="email"
                required
              />

              <div className="relative">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={(e) =>
                      setFormData({ ...formData, remember: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-neutral-900 text-neutral-500">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  type="button"
                  leftIcon={<Mail className="h-4 w-4" />}
                >
                  Google
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  leftIcon={<Users className="h-4 w-4" />}
                >
                  GitHub
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-3">
                <strong>Demo Mode:</strong> Try the app instantly
              </p>
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleDemoLogin}
                loading={isLoading}
              >
                <CheckCircle2 className="h-4 w-4" />
                Continue as Demo User
              </Button>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-2">
                Email: demo@spendanalyzer.com • Password: demo1234
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Sign up
          </Link>
        </p>

        <div className="mt-8 text-center">
          <Link
            to="/dashboard"
            className="text-sm text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            ← Back to Dashboard (Demo)
          </Link>
        </div>
      </div>
    </div>
  );
};

import { BarChart3, Users } from "lucide-react";
