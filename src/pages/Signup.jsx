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
  User,
  AlertCircle,
  CheckCircle2,
  Shield,
} from "lucide-react";

export const Signup = () => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculateStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const getStrengthLabel = (strength) => {
    if (strength < 30) return "Weak";
    if (strength < 60) return "Fair";
    if (strength < 80) return "Good";
    return "Strong";
  };

  const getStrengthColor = (strength) => {
    if (strength < 30) return "#ef4444";
    if (strength < 60) return "#eab308";
    if (strength < 80) return "#3b82f6";
    return "#22c55e";
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setError("");
    const result = await signup(
      formData.name.trim(),
      formData.email.trim(),
      formData.password,
    );

    if (!result.success) {
      setError(result.error || "Signup failed. Please try again.");
      return;
    }

    if (result.requiresEmailConfirmation) {
      navigate("/login", {
        replace: true,
        state: {
          message: "Account created! Please verify your email, then log in.",
          email: formData.email,
        },
      });
      return;
    }

    navigate("/profile-setup", { replace: true });
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    setPasswordStrength(calculateStrength(value));
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
            Create your account
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Start tracking your finances today
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
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                error={errors.name}
                leftIcon={<User className="h-4 w-4" />}
                autoComplete="name"
                required
              />

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
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
                    autoComplete="new-password"
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

              {formData.password && (
                <div className="space-y-2">
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${passwordStrength}%`,
                        backgroundColor: getStrengthColor(passwordStrength),
                      }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Password strength:{" "}
                    <span
                      className="font-medium"
                      style={{ color: getStrengthColor(passwordStrength) }}
                    >
                      {getStrengthLabel(passwordStrength)}
                    </span>
                  </p>
                </div>
              )}

              <div className="relative">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-neutral-600 dark:text-neutral-400"
                >
                  I agree to the{" "}
                  <Link
                    href="#"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="#"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isLoading}
              >
                <Shield className="h-4 w-4" />
                Create Account
              </Button>
            </form>

            {/* <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-neutral-900 text-neutral-500">
                    Or sign up with
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
            </div> */}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Sign in
          </Link>
        </p>

        <div className="mt-8 text-center">
          <Link
            to="/dashboard"
            className="text-sm text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

import { BarChart3, Users } from "lucide-react";
