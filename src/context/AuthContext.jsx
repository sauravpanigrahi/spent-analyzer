import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../DB/supabaseclient";

const AuthContext = createContext(null);
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

      setActiveUserStorageScope(
        session?.user?.id,
        event === "SIGNED_OUT",
      );
      setUser(normalizeUser(session?.user));
      setIsAuthenticated(!!session?.user);
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;

      const session = error ? null : data.session;

      setActiveUserStorageScope(session?.user?.id);
      setUser(normalizeUser(session?.user));
      setIsAuthenticated(!!session?.user);
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
        return { success: false, error: error.message };
      }

      const { data: profile, error: profileError } = await supabase
        .from("profilesetup")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      return {
        success: true,
        user: data.user,
        requiresProfileSetup: !profile,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Login failed",
      };
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
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      requiresEmailConfirmation: !data.session,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Signup failed",
    };
  } finally {
    setIsLoading(false);
  }
}, []);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      setUser(null);
      setIsAuthenticated(false);
      sessionStorage.removeItem("spend_analyzer_active_user_id");
      clearLegacyLocalData();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Logout failed",
      };
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
        return {
          success: false,
          error: `Authentication failed: ${authError.message}`,
        };
      }

      if (!currentUser) {
        return { success: false, error: "Please log in again." };
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
        return { success: false, error: "No profile changes were provided." };
      }

      const { data, error } = await supabase
        .from("profilesetup")
        .update(profileUpdates)
        .eq("id", currentUser.id)
        .select()
        .maybeSingle();

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data) {
        return {
          success: false,
          error: "No profile row found. Complete profile setup first.",
        };
      }

      if (updates.name !== undefined) {
        const { data: updatedUser, error: metadataError } =
          await supabase.auth.updateUser({
            data: { full_name: updates.name.trim() },
          });

        if (metadataError) {
          return {
            success: true,
            profile: data,
            warning: `Profile saved, but account name sync failed: ${metadataError.message}`,
          };
        }

        if (updatedUser.user) {
          setUser(normalizeUser(updatedUser.user));
        }
      }
      localStorage.setItem(
        `spend_analyzer_profile_${currentUser.id}`,
        JSON.stringify(data),
      );
      return { success: true, profile: data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Profile update failed.",
      };
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        return { success: false, error: authError.message };
      }
      if (!currentUser) {
        return { success: false, error: "Please log in again." };
      }

      const { error: functionError } =
        await supabase.functions.invoke("delete-account");

      if (functionError) {
        return { success: false, error: functionError.message };
      }

      const { error: signOutError } = await supabase.auth.signOut({
        scope: "local",
      });

      localStorage.removeItem(`spend_analyzer_budgets:${currentUser.id}`);
      localStorage.removeItem(
        `spend_analyzer_savings_goals:${currentUser.id}`,
      );
      localStorage.removeItem(`spend_analyzer_profile_${currentUser.id}`);
      sessionStorage.removeItem("spend_analyzer_active_user_id");
      setUser(null);
      setIsAuthenticated(false);

      return {
        success: true,
        warning: signOutError?.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Could not delete account.",
      };
    }
  }, []);

  const getProfile = useCallback(async () => {
    try {
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!currentUser) {
        return { success: false, error: "Please log in again." };
      }

      const { data, error } = await supabase
        .from("profilesetup")
        .select("name, email, language, currency")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, profile: data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Could not load your profile.",
      };
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
        return { success: false, error: authError.message };
      }

      if (!currentUser) {
        return {
          success: false,
          error: "Please log in before setting up your profile.",
        };
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
        return { success: false, error: error.message };
      }

      localStorage.setItem(
        `spend_analyzer_profile_${currentUser.id}`,
        JSON.stringify(data),
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Profile setup failed.",
      };
    }
  },
  [],
);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user?.email) {
      return {
        success: false,
        error: "Please log in again.",
      };
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword,
    });

    if (verifyError) {
      return {
        success: false,
        error: "Current password is incorrect.",
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: "If the account exists, a reset email will be sent.",
    };
  }, []);

  const resetPassword = useCallback(async (_token, newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
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
