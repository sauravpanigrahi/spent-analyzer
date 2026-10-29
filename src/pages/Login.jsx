import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCooldown } from "../hooks/useCooldown";
import {
  notifyError,
  notifyInfo,
  notifySuccess,
} from "../utils/notifications";
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
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export const Login = () => {
  const { t } = useTranslation();
  const { login, resendVerificationEmail, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { secondsRemaining, startCooldown } = useCooldown();
  const submitting = useRef(false);

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [requiresEmailVerification, setRequiresEmailVerification] =
    useState(false);
  const [message, setMessage] = useState(
    location.state?.message ||
      (new URLSearchParams(location.search).has("verified")
        ? "Your email is verified. Please sign in to continue."
        : ""),
  );
  useEffect(() => {
    if (message) {
      notifyInfo(message, { toastId: `login-message:${message}` });
    }
  }, [message]);

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = t("validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = t("validation.invalidEmail");
    }

    if (!formData.password) {
      newErrors.password = t("validation.passwordRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || submitting.current) return;

    if (!validate()) {
      notifyError(t("validation.correctSigninFields"));
      return;
    }

    setRequiresEmailVerification(false);
    setMessage("");

    submitting.current = true;
    try {
      const result = await login(formData.email.trim(), formData.password);

      if (!result.success) {
        setRequiresEmailVerification(!!result.requiresEmailVerification);
        return;
      }

      if (result.requiresProfileSetup) {
        navigate("/profile-setup", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
      notifySuccess("Signed in successfully.");
    } catch {
      notifyError("We couldn't sign you in right now. Please try again.");
    } finally {
      submitting.current = false;
    }
  };

  const handleResendVerification = async () => {
    if (isLoading || submitting.current || secondsRemaining > 0) return;
    startCooldown();
    submitting.current = true;
    try {
      const result = await resendVerificationEmail(formData.email.trim());
      if (!result.success) return;
    } catch {
      notifyError("We couldn't send a verification email. Please try again later.");
    } finally {
      submitting.current = false;
    }
  };

  const handleDemoLogin = async () => {
    if (isLoading || submitting.current) return;
    submitting.current = true;
    try {
      const result = await login("demo@spendanalyzer.com", "demo1234", true);
      if (result.success) {
        navigate("/dashboard");
        notifySuccess("Signed in successfully.");
      }
    } catch {
      notifyError("We couldn't sign you in right now. Please try again.");
    } finally {
      submitting.current = false;
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
          {t("auth.welcome")}
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {t("auth.signInToContinue")}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            {requiresEmailVerification && (
              <div className="mb-6 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading || secondsRemaining > 0}
                  onClick={handleResendVerification}
                >
                  {secondsRemaining > 0
                    ? `Resend available in ${secondsRemaining}s`
                    : "Resend verification email"}
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t("common.email")}
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
                  {t("auth.password")}
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
                      showPassword
                        ? t("auth.hidePassword")
                        : t("auth.showPassword")
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

            {/* <div className="mt-6">
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
            </div> */}
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
            to="/"
            className="text-sm text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

import { BarChart3, Users } from "lucide-react";
