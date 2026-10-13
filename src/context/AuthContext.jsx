import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { mockUser } from "../data/mockData";

const AuthContext = createContext(null);

const DEMO_CREDENTIALS = {
  email: "demo@spendanalyzer.com",
  password: "demo1234",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      const savedUser = localStorage.getItem("spend_analyzer_user");
      const savedDemo = localStorage.getItem("spend_analyzer_demo");

      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem("spend_analyzer_user");
        }
      } else if (savedDemo === "true") {
        setUser(mockUser);
        setIsAuthenticated(true);
        setIsDemoMode(true);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password, remember = false) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (
      email === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password
    ) {
      const demoUser = { ...mockUser, email };
      setUser(demoUser);
      setIsAuthenticated(true);
      setIsDemoMode(true);
      if (remember) {
        localStorage.setItem("spend_analyzer_demo", "true");
        localStorage.setItem("spend_analyzer_user", JSON.stringify(demoUser));
      }
      setIsLoading(false);
      return { success: true, isDemo: true };
    }

    setIsLoading(false);
    return {
      success: false,
      error:
        "Invalid credentials. Use demo@spendanalyzer.com / demo1234 for demo access.",
    };
  }, []);

  const signup = useCallback(async (name, email, password) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatar: null,
      currency: "USD",
      locale: "en-US",
      theme: "system",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUser(newUser);
    setIsAuthenticated(true);
    setIsDemoMode(false);
    localStorage.setItem("spend_analyzer_user", JSON.stringify(newUser));
    localStorage.removeItem("spend_analyzer_demo");

    setIsLoading(false);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setIsDemoMode(false);
    localStorage.removeItem("spend_analyzer_user");
    localStorage.removeItem("spend_analyzer_demo");
  }, []);

  const updateProfile = useCallback(
    (updates) => {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("spend_analyzer_user", JSON.stringify(updatedUser));
      return { success: true };
    },
    [user],
  );

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (isDemoMode) {
        return {
          success: false,
          error:
            "Cannot change password in demo mode. Please sign up for a real account.",
        };
      }
      return { success: true };
    },
    [isDemoMode],
  );

  const forgotPassword = useCallback(async (email) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (email === DEMO_CREDENTIALS.email) {
      return {
        success: true,
        message: "Demo mode: Password reset email would be sent in production.",
      };
    }
    return {
      success: true,
      message: "If an account exists, a reset link has been sent.",
    };
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      message: "Password has been reset. Please log in with your new password.",
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isDemoMode,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
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
