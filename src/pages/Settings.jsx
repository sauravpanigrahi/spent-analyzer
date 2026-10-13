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
  User,
  Mail,
  Lock,
  Settings as SettingsIcon,
  AlertCircle,
  CheckCircle2,
  Shield,
  Monitor,
  Moon,
  Sun,
  Globe,
  Trash2,
} from "lucide-react";

export const Settings = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currency: user?.currency || "USD",
    locale: user?.locale || "en-US",
    theme: user?.theme || "system",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSuccessMessage("");
    const result = await updateProfile(formData);

    if (result.success) {
      setSuccessMessage("Profile updated successfully!");
    } else {
      setSuccessMessage("Update failed. Please try again.");
    }
  };

  const handleDeleteAccount = () => {
    setDeletingAccount(true);
  };

  const confirmDeleteAccount = () => {
    // In a real app, this would call an API
    // For demo, we'll just clear localStorage
    localStorage.removeItem("spend_analyzer_user");
    localStorage.removeItem("spend_analyzer_demo");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Settings
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Manage your account and preferences
          </p>
        </div>

        {successMessage && (
          <div
            className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-2 text-sm"
            role="alert"
          >
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Profile
                </h2>
                <Link
                  to="/security"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Security Settings
                </Link>
              </div>

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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) =>
                        setFormData({ ...formData, currency: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Language
                    </label>
                    <select
                      value={formData.locale}
                      onChange={(e) =>
                        setFormData({ ...formData, locale: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español (España)</option>
                      <option value="fr-FR">Français (France)</option>
                      <option value="de-DE">Deutsch (Deutschland)</option>
                      <option value="ja-JP">日本語 (日本)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Theme Preference
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="theme-system"
                        value="system"
                        checked={formData.theme === "system"}
                        onChange={(e) =>
                          setFormData({ ...formData, theme: e.target.value })
                        }
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label
                        htmlFor="theme-system"
                        className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
                      >
                        System
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="theme-light"
                        value="light"
                        checked={formData.theme === "light"}
                        onChange={(e) =>
                          setFormData({ ...formData, theme: e.target.value })
                        }
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label
                        htmlFor="theme-light"
                        className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
                      >
                        Light
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="theme-dark"
                        value="dark"
                        checked={formData.theme === "dark"}
                        onChange={(e) =>
                          setFormData({ ...formData, theme: e.target.value })
                        }
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label
                        htmlFor="theme-dark"
                        className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
                      >
                        Dark
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={isLoading}
                >
                  <SettingsIcon className="h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {user && !user.email.includes("demo@spendanalyzer.com") && (
          <Card className="mt-6">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Account</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteAccount}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Delete Account
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {user.name}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {user.email}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      Member since{" "}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Deleting your account will permanently remove all your data.
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Modal
          isOpen={deletingAccount}
          onClose={() => setDeletingAccount(false)}
          title="Delete Account"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-neutral-600 dark:text-neutral-400">
              Are you sure you want to delete your account? This action cannot
              be undone and will permanently delete all your data.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeletingAccount(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteAccount}
                loading={deletingAccount}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

import { ArrowLeft } from "lucide-react";
import { Modal } from "../components/ui/Modal";
