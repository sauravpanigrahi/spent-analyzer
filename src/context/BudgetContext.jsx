import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import {
  calculateBudgetProgress,
  generateId,
} from "../utils/helpers";
import {
  notifySuccess,
  notifyWarning,
} from "../utils/notifications";

const BudgetContext = createContext(null);

export const BudgetProvider = ({ children }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loadedUserId, setLoadedUserId] = useState(null);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user?.id) {
      setBudgets([]);
      setSavingsGoals([]);
      setLoadedUserId(null);
      return;
    }

    const userId = user.id;
    const loadUserData = (key) => {
      try {
        const saved = localStorage.getItem(`${key}:${userId}`);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(
            `Could not read saved ${key} for this account:`,
            error.name,
          );
        }
        notifyWarning(
          "Some saved planning data couldn't be read and may need to be entered again.",
          { toastId: "budget-data-read-warning", dedupeForMs: 60000 },
        );
        return [];
      }
    };

    setLoadedUserId(null);
    setBudgets(loadUserData("spend_analyzer_budgets"));
    setSavingsGoals(loadUserData("spend_analyzer_savings_goals"));
    setLoadedUserId(userId);
  }, [isAuthLoading, user?.id]);

  useEffect(() => {
    if (!user?.id || loadedUserId !== user.id) return;

    try {
      localStorage.setItem(
        `spend_analyzer_budgets:${user.id}`,
        JSON.stringify(budgets),
      );
      localStorage.setItem(
        `spend_analyzer_savings_goals:${user.id}`,
        JSON.stringify(savingsGoals),
      );
    } catch {
      notifyWarning(
        "Your latest planning changes couldn't be saved on this device. Check available storage.",
        { toastId: "budget-data-save-error", dedupeForMs: 60000 },
      );
    }
  }, [budgets, loadedUserId, savingsGoals, user?.id]);

  const visibleBudgets = loadedUserId === user?.id ? budgets : [];
  const visibleSavingsGoals = loadedUserId === user?.id ? savingsGoals : [];

  const addBudget = useCallback((budget) => {
    const newBudget = {
      ...budget,
      id: generateId(),
      alertThreshold: budget.alertThreshold || 80,
    };
    setBudgets((prev) => [...prev, newBudget]);
    notifySuccess("Budget created.");
    return newBudget;
  }, []);

  const updateBudget = useCallback((id, updates) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    );
    notifySuccess("Budget updated.");
  }, []);

  const deleteBudget = useCallback((id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    notifySuccess("Budget deleted.");
  }, []);

  const addSavingsGoal = useCallback((goal) => {
    const newGoal = {
      ...goal,
      id: generateId(),
      currentAmount: goal.currentAmount || 0,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
    notifySuccess("Savings goal created.");
    return newGoal;
  }, []);

  const updateSavingsGoal = useCallback((id, updates) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    );
    notifySuccess("Savings goal updated.");
  }, []);

  const deleteSavingsGoal = useCallback((id) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    notifySuccess("Savings goal deleted.");
  }, []);

  const addToSavingsGoal = useCallback((id, amount) => {
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g,
      ),
    );
    notifySuccess("Savings goal contribution added.");
  }, []);

  return (
    <BudgetContext.Provider
      value={{
        budgets: visibleBudgets,
        savingsGoals: visibleSavingsGoals,
        addBudget,
        updateBudget,
        deleteBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        addToSavingsGoal,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudgets must be used within a BudgetProvider");
  }
  return context;
};

export const useBudgetCalculations = (transactions) => {
  const { budgets } = useBudgets();

  const budgetProgress = useMemo(() => {
    return budgets.map((budget) => ({
      ...budget,
      progress: calculateBudgetProgress(budget, transactions),
    }));
  }, [budgets, transactions]);

  const overallBudget = budgetProgress.find((b) => !b.category);
  const categoryBudgets = budgetProgress.filter((b) => b.category);

  const totalBudgeted = categoryBudgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = categoryBudgets.reduce(
    (sum, b) => sum + b.progress.spent,
    0,
  );
  const overallProgress = overallBudget ? overallBudget.progress : null;

  return {
    budgetProgress,
    overallBudget,
    categoryBudgets,
    overallProgress,
    totalBudgeted,
    totalSpent,
  };
};
