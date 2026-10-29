import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCooldown } from "../hooks/useCooldown";
import { notifyError } from "../utils/notifications";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
import {
  Mail,
  CheckCircle2,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export const ForgotPassword = () => {
  const { t } = useTranslation();
  const { forgotPassword, isLoading } = useAuth();
  const { secondsRemaining, startCooldown } = useCooldown();
  const submitting = useRef(false);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const validate = () => {
    if (!email.trim()) {
      notifyError("Email is required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      notifyError("Enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || submitting.current || secondsRemaining > 0) return;
    if (!validate()) return;

    startCooldown();
    submitting.current = true;
    try {
      const result = await forgotPassword(email.trim());

      if (result.success) {
        setSuccess(true);
        setMessage(result.message);
      }
    } catch {
      notifyError("We couldn't connect. Check your internet connection and try again.");
    } finally {
      submitting.current = false;
    }
  };

  const handleResend = async () => {
    if (isLoading || submitting.current || secondsRemaining > 0) return;
    startCooldown();
    submitting.current = true;
    try {
      const result = await forgotPassword(email.trim());
      if (result.success) {
        setMessage(result.message);
      }
    } catch {
      notifyError("We couldn't connect. Check your internet connection and try again.");
    } finally {
      submitting.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{t("common.backToSignIn")}</span>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {t("auth.forgotPassword")}
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              {t("auth.forgotPasswordDescription")}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {success ? (
              <div className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Check Your Email
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  {message} For your security, this message does not confirm
                  whether an account exists for that address.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mb-3 w-full"
                  loading={isLoading}
                  disabled={secondsRemaining > 0}
                  onClick={handleResend}
                >
                  {secondsRemaining > 0
                    ? `Resend available in ${secondsRemaining}s`
                    : "Resend reset email"}
                </Button>
                <Link to="/login">
                  <Button variant="primary" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={t("common.email")}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                  autoComplete="email"
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading || secondsRemaining > 0}
                >
                  <RotateCcw className="h-4 w-4" />
                  {secondsRemaining > 0
                    ? `Try again in ${secondsRemaining}s`
                    : t("auth.sendResetLink")}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
