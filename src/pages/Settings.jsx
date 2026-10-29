import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notifyError } from "../utils/notifications";
import { usePreferences } from "../context/PreferencesContext";
import { useTranslation } from "react-i18next";
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
  Shield,
  Monitor,
  Moon,
  Sun,
  Globe,
  Trash2,
} from "lucide-react";

export const Settings = () => {
  const { user, updateProfile, getProfile, deleteAccount } = useAuth();
  const { setPreference, currency, language } = usePreferences();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    currency: "INR",
    language: "en-US",
  });
  const [errors, setErrors] = useState({});
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handlePreferenceChange = async (key, value) => {
    setFormData((current) => ({ ...current, [key]: value }));
    const previousValue = key === "currency" ? currency : language;
    const result = await setPreference(key, value);
    if (!result.success) {
      setFormData((current) => ({ ...current, [key]: previousValue }));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const result = await getProfile();
      if (!isMounted) return;

      if (result.success && result.profile) {
        setFormData((current) => ({
          ...current,
          name: result.profile.name || user?.user_metadata?.full_name || "",
          email: result.profile.email || user?.email || "",
          currency: result.profile.currency || "INR",
          language: result.profile.language || "en-US",
        }));
      } else if (!result.success) {
        setErrors({});
      }

      setIsProfileLoading(false);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [getProfile, user]);

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
    if (!validate()) {
      notifyError(t("validation.correctFields"));
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      const result = await updateProfile(formData);
      if (!result.success) return;
    } catch {
      notifyError(t("errors.profileUpdate"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    setErrors({});
    setDeletingAccount(true);
  };

  const confirmDeleteAccount = async () => {
    setErrors({});
    setIsDeletingAccount(true);

    try {
      const result = await deleteAccount();
      if (!result.success) {
        return;
      }

      setDeletingAccount(false);
      navigate("/login", { replace: true });
    } catch {
      notifyError(t("errors.accountDelete"));
    } finally {
      setIsDeletingAccount(false);
    }
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
            <span>{t("common.backToDashboard")}</span>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {t("settings.title")}
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {t("settings.description")}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {t("settings.profile")}
                </h2>
                <Link
                  to="/security"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  {t("settings.securitySettings")}
                </Link>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={t("common.name")}
                  type="text"
                  placeholder={t("settings.namePlaceholder")}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  error={errors.name}
                  leftIcon={<User className="h-4 w-4" />}
                  autoComplete="name"
                  required
                  disabled={isProfileLoading}
                />

                <Input
                  label={t("common.email")}
                  type="email"
                  placeholder={t("settings.emailPlaceholder")}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  error={errors.email}
                  leftIcon={<Mail className="h-4 w-4" />}
                  autoComplete="email"
                  required
                  disabled
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      {t("common.currency")}
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) =>
                        handlePreferenceChange("currency", e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
                      disabled={isProfileLoading}
                    >
                      <option value="INR">INR - Indian Rupee</option>
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
                      {t("common.language")}
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) =>
                        handlePreferenceChange("language", e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
                      disabled={isProfileLoading}
                    >
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español (España)</option>
                      <option value="fr-FR">Français (France)</option>
                      <option value="de-DE">Deutsch (Deutschland)</option>
                      <option value="ja-JP">日本語 (日本)</option>
                    </select>
                  </div>
                </div>


                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={isSaving || isProfileLoading}
                >
                  <SettingsIcon className="h-4 w-4" />
                  {t("common.saveChanges")}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {user && !user.email.includes("demo@spendanalyzer.com") && (
          <Card className="mt-6">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>{t("common.account")}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteAccount}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                {t("common.deleteAccount")}
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
                      {t("common.memberSince")}{" "}
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {t("settings.deleteWarning")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Modal
          isOpen={deletingAccount}
          onClose={() => setDeletingAccount(false)}
          title={t("common.deleteAccount")}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-neutral-600 dark:text-neutral-400">
              {t("settings.confirmDelete")}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeletingAccount(false)}
                disabled={isDeletingAccount}
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteAccount}
                loading={isDeletingAccount}
              >
                {t("common.deleteAccount")}
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
