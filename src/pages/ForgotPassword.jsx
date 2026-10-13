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
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Lock,
  RotateCcw,
} from "lucide-react";

export const ForgotPassword = () => {
  const { forgotPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const validate = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setError("");
    const result = await forgotPassword(email);

    if (result.success) {
      setSuccess(true);
      setMessage(result.message);
    } else {
      setError(result.error || "Failed to send reset email");
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
            <span>Back to Sign In</span>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Forgot Password?
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Enter your email and we'll send you a link to reset your password.
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
                  {message}
                </p>
                <Link to="/login">
                  <Button variant="primary" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div
                    className="p-4 rounded-xl bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-2 text-sm"
                    role="alert"
                  >
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Input
                  label="Email"
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
                >
                  <RotateCcw className="h-4 w-4" />
                  Send Reset Link
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

        <div className="mt-6 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            <strong>Demo Mode:</strong> Use demo@spendanalyzer.com
          </p>
        </div>
      </div>
    </div>
  );
};
