import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
import { BarChart3 } from "lucide-react";
import { notifyError } from "../utils/notifications";

export const ProfileSetup = () => {
  const { user, isLoading, profileadd } = useAuth();
  const navigate = useNavigate();
  const submitting = useRef(false);

  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    language: "en-US",
    currency: "INR",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current || isLoading) return;

    if (!user) {
      notifyError("Please log in before setting up your profile.");
      return;
    }

    if (!formData.name.trim()) {
      notifyError("Please enter your name.");
      return;
    }

    if (!formData.language || !formData.currency) {
      notifyError("Please select your language and currency.");
      return;
    }

    submitting.current = true;
    setIsSaving(true);
    try {
      const result = await profileadd(
        formData.email,
        formData.name.trim(),
        formData.language,
        formData.currency,
      );
      if (result?.success) {
        navigate("/dashboard");
      }
    } catch {
      notifyError("We couldn't set up your profile. Please try again.");
    } finally {
      submitting.current = false;
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading profile...</div>;
  }

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
            Set up your profile
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Choose your preferred language and currency.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                autoComplete="name"
                required
              />
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border dark:bg-neutral-900"
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
                <label className="block text-sm font-medium mb-1.5">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border dark:bg-neutral-900"
                >
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español (España)</option>
                  <option value="fr-FR">Français (France)</option>
                  <option value="de-DE">Deutsch (Deutschland)</option>
                  <option value="ja-JP">日本語 (日本)</option>
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isLoading || isSaving}
                disabled={isLoading || isSaving}
              >
                Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
};
