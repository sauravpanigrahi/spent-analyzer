import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../DB/supabaseclient";
import { Card, CardContent } from "../components/ui/Card";
import {
  getSafeErrorMessage,
  notifyError,
  notifySuccess,
} from "../utils/notifications";

export const EmailConfirmation = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const finishEmailConfirmation = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!active) return;
      window.history.replaceState(
        window.history.state,
        document.title,
        window.location.pathname,
      );
      if (sessionError || !session?.user) {
        navigate("/login", {
          replace: true,
          state: {
            message:
              "Your email link was processed. Sign in to continue, or request another verification email if needed.",
          },
        });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profilesetup")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!active) return;
      if (profileError) {
        setError(true);
        notifyError(
          getSafeErrorMessage(
            profileError,
            "Your email was confirmed, but we couldn't check your profile setup.",
          ),
          { toastId: "email-confirmation-profile-error" },
        );
        return;
      }

      notifySuccess("Your email was confirmed.");
      navigate(profile ? "/dashboard" : "/profile-setup", { replace: true });
    };

    finishEmailConfirmation().catch((error) => {
      if (active) {
        setError(true);
        notifyError(
          getSafeErrorMessage(
            error,
            "We couldn't complete email verification. Please sign in or request another verification email.",
          ),
          { toastId: "email-confirmation-error" },
        );
      }
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          {error ? (
            <>
              <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Email confirmation
              </h1>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                Continue to sign in or request another verification email.
              </p>
              <Link
                to="/login"
                className="mt-5 inline-block font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Continue to sign in
              </Link>
            </>
          ) : (
            <p
              className="text-sm text-neutral-600 dark:text-neutral-400"
              role="status"
            >
              Verifying your email and preparing your account...
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
};
