import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notifyError, notifyInfo } from "../utils/notifications";
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
  Lock,
  Shield,
  AlertTriangle,
  Users,
  Mail,
  Settings as SettingsIcon,
} from "lucide-react";

export const Security = () => {
  const { user, changePassword, forgotPassword, isLoading, isDemoMode } =
    useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (strength < 30) return "bg-red-500";
    if (strength < 60) return "bg-yellow-500";
    if (strength < 80) return "bg-blue-500";
    return "bg-green-500";
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.currentPassword)
      newErrors.currentPassword = "Current password is required";
    if (!formData.newPassword)
      newErrors.newPassword = "New password is required";
    else if (formData.newPassword.length < 8)
      newErrors.newPassword = "New password must be at least 8 characters";
    if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      notifyError("Please correct the highlighted password fields.");
      return;
    }

    try {
      const result = await changePassword(
        formData.currentPassword,
        formData.newPassword,
      );
      if (!result.success) return;
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordStrength(0);
    } catch {
      notifyError("We couldn't change your password. Please try again.");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, newPassword: value });
    setPasswordStrength(calculateStrength(value));
  };

  const handleForgotPassword = async () => {
    if (isLoading) return;
    try {
      const result = await forgotPassword(user?.email || "");
      if (result.success) {
        notifyInfo(result.message);
      }
    } catch {
      notifyError("We couldn't process that request right now. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Settings</span>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Security Settings
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Manage your account security
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Change Password
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleForgotPassword}
                  loading={isLoading}
                  disabled={isLoading}
                  leftIcon={<Mail className="h-4 w-4" />}
                >
                  Forgot Password?
                </Button>
              </div>

              {isDemoMode && (
                <div className="p-4 rounded-xl bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 mb-4">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 min-w-0">
                    You're in demo mode. Password changes are not available for
                    demo accounts. Please{" "}
                    <Link
                      to="/signup"
                      className="font-medium text-yellow-600 hover:text-yellow-700"
                    >
                      sign up
                    </Link>
                    for a real account to enable this feature.
                  </span>
                </div>
              )}

              {!isDemoMode && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.currentPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        aria-label={
                          showCurrentPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        aria-label={
                          showNewPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  {formData.newPassword && (
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
                      Confirm New Password
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
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
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

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={isLoading}
                  >
                    <Lock className="h-4 w-4" />
                    Change Password
                  </Button>
                </form>
              )}

              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Account Activity
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6" />
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        Last Login
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Today at 2:30 PM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6" />
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        Active Sessions
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        1 session active
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <SettingsIcon className="h-6 w-6" />
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Coming soon
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import { ArrowLeft, Eye, EyeOff } from "lucide-react";
