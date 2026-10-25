import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../DB/supabaseclient";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
import { CheckCircle2, Lock } from "lucide-react";
import {
  getSafeErrorMessage,
  notifyError,
  notifyWarning,
} from "../utils/notifications";

const RECOVERY_SESSION_KEY = "spent_analyzer_password_recovery";

export const ResetPassword = () => {
  const { resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const submitting = useRef(false);
  const [status, setStatus] = useState("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    let recoveryDetected = false;
    const clearSensitiveUrl = () => {
      window.history.replaceState(
        window.history.state,
        document.title,
        window.location.pathname,
      );
    };
    const query = new URLSearchParams(window.location.search);
    const linkError = query.get("error_code") || query.get("error");

    if (linkError) {
      setStatus("invalid");
      notifyError(
        "This reset link has expired or is no longer valid. Request a new reset email.",
        { toastId: "invalid-password-reset-link" },
      );
      clearSensitiveUrl();
      return undefined;
    }

    try {
      recoveryDetected =
        sessionStorage.getItem(RECOVERY_SESSION_KEY) === "true" ||
        new URLSearchParams(window.location.hash.slice(1)).get("type") ===
          "recovery";
    } catch (storageError) {
      if (import.meta.env.DEV) {
        console.error(
          "Could not read password recovery state:",
          storageError.name,
        );
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        recoveryDetected = true;
        if (active) setStatus("ready");
      }
    });

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        clearSensitiveUrl();
        if (sessionError) {
          setStatus("invalid");
          notifyError(
            getSafeErrorMessage(
              sessionError,
              "We couldn't verify this reset link. Request a new reset email.",
            ),
            { toastId: "invalid-password-reset-link" },
          );
          return;
        }
        if (data.session && recoveryDetected) {
          setStatus("ready");
          return;
        }
        setStatus("invalid");
        notifyError(
          "This reset link is missing, expired, or invalid. Request a new reset email.",
          { toastId: "invalid-password-reset-link" },
        );
      })
      .catch((error) => {
        if (active) {
          setStatus("invalid");
          notifyError(
            getSafeErrorMessage(
              error,
              "We couldn't verify this reset link. Request a new reset email.",
            ),
            { toastId: "invalid-password-reset-link" },
          );
        }
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting.current || isLoading || status !== "ready") return;
    if (password.length < 8) {
      notifyError("Your password must be at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      notifyError("The passwords do not match.");
      return;
    }

    submitting.current = true;
    try {
      const result = await resetPassword(password);
      if (!result.success) {
        return;
      }

      try {
        sessionStorage.removeItem(RECOVERY_SESSION_KEY);
      } catch (storageError) {
        if (import.meta.env.DEV) {
          console.error(
            "Could not clear password recovery state:",
            storageError.name,
          );
        }
      }

      let signOutError;
      try {
        ({ error: signOutError } = await supabase.auth.signOut({
          scope: "local",
        }));
      } catch {
        signOutError = new Error("Could not sign out.");
      }
      if (signOutError) {
        setStatus("updated");
        setSuccessMessage(
          "Your password was changed. Sign out before signing in again.",
        );
        notifyWarning(
          "Your password was changed, but this device session couldn't be closed.",
        );
        return;
      }

      navigate("/login", {
        replace: true,
        state: { message: "Password updated. Please sign in with your new password." },
      });
    } catch {
      notifyError("We couldn't update your password. Please try again.");
    } finally {
      submitting.current = false;
    }
  };

  const finishSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut({
        scope: "local",
      });
      if (signOutError) {
        notifyError("We couldn't close this session. Please try again.");
        return;
      }
      navigate("/login", {
        replace: true,
        state: {
          message: "Password updated. Please sign in with your new password.",
        },
      });
    } catch {
      notifyError("We couldn't close this session. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Reset your password
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Choose a new password for your account.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            {status === "checking" && (
              <p
                className="text-center text-sm text-neutral-600 dark:text-neutral-400"
                role="status"
              >
                Checking your secure reset link...
              </p>
            )}
            {status === "invalid" && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Request a fresh reset email to continue.
                </p>
                <Link
                  to="/forgot-password"
                  className="inline-block font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Request a new reset link
                </Link>
              </div>
            )}
            {status === "updated" && (
              <div className="space-y-4 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-green-600 dark:text-green-400" />
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {successMessage}
                </p>
                <Button
                  type="button"
                  className="w-full"
                  loading={isSigningOut}
                  disabled={isSigningOut}
                  onClick={finishSignOut}
                >
                  Sign out and continue
                </Button>
              </div>
            )}
            {status === "ready" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="New password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  helperText="Use at least 8 characters."
                  leftIcon={<Lock className="h-4 w-4" />}
                  required
                  minLength={8}
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  autoComplete="new-password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  required
                  minLength={8}
                />
                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading || submitting.current}
                >
                  Update password
                </Button>
              </form>
            )}
            <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Back to sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};
