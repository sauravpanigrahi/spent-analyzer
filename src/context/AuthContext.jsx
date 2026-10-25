import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../DB/supabaseclient";
import {
  getAuthErrorMessage,
  getAuthErrorType,
  getAuthRedirectUrl,
} from "../utils/authErrors";
import {
  getSafeErrorMessage,
  notifyError,
  notifyInfo,
  notifySuccess,
  notifyWarning,
} from "../utils/notifications";

const AuthContext = createContext(null);
const authFailure = (error, action, extra = {}) => ({
  success: false,
  error: getAuthErrorMessage(error, action),
  errorType: getAuthErrorType(error),
  ...extra,
});
const reportAuthFailure = (error, action, extra = {}) => {
  const result = authFailure(error, action, extra);
  notifyError(result.error);
  return result;
};
const reportOperationFailure = (error, fallback, extra = {}) => {
  const message =
    typeof error === "string"
      ? error
      : getSafeErrorMessage(error, fallback);
  notifyError(message);
  return { success: false, error: message, ...extra };
};
const normalizeUser = (authUser) =>
  authUser
    ? { ...authUser, name: authUser.user_metadata?.full_name || "" }
    : null;
const clearLegacyLocalData = () => {
  [
    "spend_analyzer_transactions",
    "spend_analyzer_budgets",
    "spend_analyzer_savings_goals",
    "spend_analyzer_user",
    "spend_analyzer_demo",
    "userProfile",
  ].forEach((key) => localStorage.removeItem(key));
};
const setActiveUserStorageScope = (userId, clearWhenSignedOut = false) => {
  const previousUserId = sessionStorage.getItem(
    "spend_analyzer_active_user_id",
  );

  if (userId && previousUserId && previousUserId !== userId) {
    clearLegacyLocalData();
  } else if (!userId && clearWhenSignedOut) {
    clearLegacyLocalData();
  }

  if (userId) {
    sessionStorage.setItem("spend_analyzer_active_user_id", userId);
  } else {
    sessionStorage.removeItem("spend_analyzer_active_user_id");
  }
};
const synchronizeUserStorageScope = (userId, clearWhenSignedOut = false) => {
  try {
    setActiveUserStorageScope(userId, clearWhenSignedOut);
  } catch {
    notifyWarning(
      "Some saved data on this device couldn't be synchronized with your account.",
      { toastId: "account-storage-scope-warning", dedupeForMs: 60000 },
    );
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY") {
        try {
          sessionStorage.setItem("spent_analyzer_password_recovery", "true");
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error(
              "Could not save password recovery state:",
              error.name,
            );
          }
        }
      }
      if (event === "SIGNED_OUT") {
        try {
          sessionStorage.removeItem("spent_analyzer_password_recovery");
        } catch {
          notifyWarning(
            "The local password recovery state couldn't be cleared.",
            { toastId: "password-recovery-storage-warning" },
          );
        }
      }

      synchronizeUserStorageScope(
        session?.user?.id,
        event === "SIGNED_OUT",
      );
      setUser(normalizeUser(session?.user));
      setIsAuthenticated(!!session?.user);
      setIsLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;

        if (error) {
          notifyError(getAuthErrorMessage(error, "auth"), {
            toastId: "initial-session-error",
          });
        }
        const session = error ? null : data.session;

        synchronizeUserStorageScope(session?.user?.id);
        setUser(normalizeUser(session?.user));
        setIsAuthenticated(!!session?.user);
        setIsLoading(false);
      })
      .catch((error) => {
        if (!mounted) return;
        notifyError(getSafeErrorMessage(error, "We couldn't verify your session."), {
          toastId: "initial-session-error",
        });
        setIsLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return reportAuthFailure(error, "login", {
          requiresEmailVerification:
            getAuthErrorType(error) === "email_not_confirmed",
        });
      }

      const { data: profile, error: profileError } = await supabase
        .from("profilesetup")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        return reportOperationFailure(
          profileError,
          "We couldn't load your profile. Please try again.",
        );
      }

      return {
        success: true,
        user: data.user,
        requiresProfileSetup: !profile,
      };
    } catch (error) {
      return reportAuthFailure(error, "login");
    } finally {
      setIsLoading(false);
    }
  }, []);


  const signup = useCallback(async (name, email, password) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: getAuthRedirectUrl("/email-confirmed"),
        },
      });

      if (error) {
        return reportAuthFailure(error, "signup", {
          possibleAccountCreated: getAuthErrorType(error) === "rate_limited",
        });
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        requiresEmailConfirmation: !data.session,
      };
    } catch (error) {
      return reportAuthFailure(error, "signup", {
        possibleAccountCreated: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resendVerificationEmail = useCallback(async (email) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: getAuthRedirectUrl("/email-confirmed"),
        },
      });
      if (error) {
        return reportAuthFailure(error, "resend");
      }
      notifyInfo(
        "If this email needs verification, a new link will arrive shortly.",
      );
      return {
        success: true,
        message:
          "If this email needs verification, a new verification link will arrive shortly. Check your spam or junk folder too.",
      };
    } catch (error) {
      return reportAuthFailure(error, "resend");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return reportOperationFailure(
          error,
          "We couldn't sign you out. Please try again.",
        );
      }

      setUser(null);
      setIsAuthenticated(false);
      let localCleanupFailed = false;
      try {
        sessionStorage.removeItem("spend_analyzer_active_user_id");
        clearLegacyLocalData();
      } catch {
        localCleanupFailed = true;
      }

      if (localCleanupFailed) {
        notifyWarning(
          "You were signed out, but some saved data could not be cleared from this device.",
        );
      } else {
        notifySuccess("You have been signed out.");
      }
      return { success: true };
    } catch (error) {
      return reportOperationFailure(
        error,
        "We couldn't sign you out. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  
  const updateProfile = useCallback(async (updates) => {
    try {
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        return reportOperationFailure(
          authError,
          "We couldn't verify your session. Please sign in again.",
        );
      }

      if (!currentUser) {
        return reportOperationFailure(
          "Please log in again.",
          "Please log in again.",
        );
      }

      const profileUpdates = {};
      if (updates.name !== undefined) {
        profileUpdates.name = updates.name.trim();
      }
      if (updates.language !== undefined || updates.locale !== undefined) {
        profileUpdates.language = updates.language ?? updates.locale;
      }
      if (updates.currency !== undefined) {
        profileUpdates.currency = updates.currency;
      }

      if (Object.keys(profileUpdates).length === 0) {
        return reportOperationFailure(
          "No profile changes were provided.",
          "No profile changes were provided.",
        );
      }

      const { data, error } = await supabase
        .from("profilesetup")
        .update(profileUpdates)
        .eq("id", currentUser.id)
        .select()
        .maybeSingle();

      if (error) {
        return reportOperationFailure(error, "We couldn't update your profile.");
      }

      if (!data) {
        return reportOperationFailure(
          "No profile row found. Complete profile setup first.",
          "No profile row found. Complete profile setup first.",
        );
      }

      if (updates.name !== undefined) {
        const { data: updatedUser, error: metadataError } =
          await supabase.auth.updateUser({
            data: { full_name: updates.name.trim() },
          });

        if (metadataError) {
          notifyWarning(
            "Your profile was saved, but the account name could not be synchronized.",
          );
          return {
            success: true,
            profile: data,
            warning: "Account name sync failed.",
          };
        }

        if (updatedUser.user) {
          setUser(normalizeUser(updatedUser.user));
        }
      }
      let profileCacheFailed = false;
      try {
        localStorage.setItem(
          `spend_analyzer_profile_${currentUser.id}`,
          JSON.stringify(data),
        );
      } catch {
        profileCacheFailed = true;
      }
      if (profileCacheFailed) {
        notifyWarning(
          "Your profile was updated, but preferences could not be saved on this device.",
        );
      } else {
        notifySuccess("Profile updated successfully.");
      }
      return { success: true, profile: data };
    } catch (error) {
      return reportOperationFailure(error, "We couldn't update your profile.");
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        return reportOperationFailure(
          authError,
          "We couldn't verify your session. Please sign in again.",
        );
      }
      if (!currentUser) {
        return reportOperationFailure("Please log in again.", "Please log in again.");
      }

      const { error: functionError } =
        await supabase.functions.invoke("delete-account");

      if (functionError) {
        return reportOperationFailure(
          functionError,
          "We couldn't delete your account. Please try again.",
        );
      }

      const { error: signOutError } = await supabase.auth.signOut({
        scope: "local",
      });

      let localCleanupFailed = false;
      try {
        localStorage.removeItem(`spend_analyzer_budgets:${currentUser.id}`);
        localStorage.removeItem(
          `spend_analyzer_savings_goals:${currentUser.id}`,
        );
        localStorage.removeItem(`spend_analyzer_profile_${currentUser.id}`);
        sessionStorage.removeItem("spend_analyzer_active_user_id");
      } catch {
        localCleanupFailed = true;
      }
      setUser(null);
      setIsAuthenticated(false);

      if (signOutError || localCleanupFailed) {
        notifyWarning(
          signOutError
            ? "Your account was deleted, but this device session could not be closed. Please sign in again."
            : "Your account was deleted, but some data could not be cleared from this device.",
        );
      } else {
        notifySuccess("Your account has been deleted.");
      }
      return {
        success: true,
        warning:
          signOutError || localCleanupFailed
            ? "Some local cleanup could not be completed."
            : undefined,
      };
    } catch (error) {
      return reportOperationFailure(
        error,
        "We couldn't delete your account. Please try again.",
      );
    }
  }, []);

  const getProfile = useCallback(async () => {
    try {
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        return reportOperationFailure(
          authError,
          "We couldn't verify your session. Please sign in again.",
        );
      }

      if (!currentUser) {
        return reportOperationFailure("Please log in again.", "Please log in again.");
      }

      const { data, error } = await supabase
        .from("profilesetup")
        .select("name, email, language, currency")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) {
        return reportOperationFailure(error, "We couldn't load your profile.");
      }

      return { success: true, profile: data };
    } catch (error) {
      return reportOperationFailure(error, "We couldn't load your profile.");
    }
  }, []);

const profileadd = useCallback(
  async (email, name, language, currency) => {
    try {
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        return reportOperationFailure(
          authError,
          "We couldn't verify your session. Please sign in again.",
        );
      }

      if (!currentUser) {
        return reportOperationFailure(
          "Please log in before setting up your profile.",
          "Please log in before setting up your profile.",
        );
      }

      const { data, error } = await supabase
        .from("profilesetup")
        .upsert(
          {
            id: currentUser.id,
            name,
            email: currentUser.email || email,
            language,
            currency,
          },
          { onConflict: "id" },
        )
        .select()
        .single();

      if (error) {
        return reportOperationFailure(error, "We couldn't set up your profile.");
      }

      let profileCacheFailed = false;
      try {
        localStorage.setItem(
          `spend_analyzer_profile_${currentUser.id}`,
          JSON.stringify(data),
        );
      } catch {
        profileCacheFailed = true;
      }
      if (profileCacheFailed) {
        notifyWarning(
          "Your profile is set up, but preferences could not be saved on this device.",
        );
      } else {
        notifySuccess("Your profile is set up.");
      }
      return { success: true, data };
    } catch (error) {
      return reportOperationFailure(error, "We couldn't set up your profile.");
    }
  },
  [],
);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setIsLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user?.email) {
        return reportOperationFailure(
          userError || "Please log in again.",
          "Please log in again.",
        );
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: currentPassword,
      });

      if (verifyError) {
        return reportOperationFailure(
          verifyError,
          "Current password is incorrect.",
        );
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return reportOperationFailure(error, "We couldn't change your password.");
      }

      notifySuccess("Your password was changed.");
      return { success: true };
    } catch (error) {
      return reportOperationFailure(error, "We couldn't change your password.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthRedirectUrl("/reset-password"),
      });

      if (error) {
        return reportAuthFailure(error, "reset-email");
      }

      return {
        success: true,
        message:
          "If an account matches that email, a password reset link will be sent. Check your inbox and spam or junk folder.",
      };
    } catch (error) {
      return reportAuthFailure(error, "reset-email");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (newPassword) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return reportAuthFailure(error, "password-update");
      }

      return { success: true, user: data.user };
    } catch (error) {
      return reportAuthFailure(error, "password-update");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        resendVerificationEmail,
        logout,
        deleteAccount,
        updateProfile,
        getProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        profileadd,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
