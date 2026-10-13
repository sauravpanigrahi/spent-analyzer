import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { mockBudgets, mockSavingsGoals } from "../data/mockData";
import {
  calculateBudgetProgress,
  filterTransactionsByDate,
  getDateRange,
  generateId,
} from "../utils/helpers";

const BudgetContext = createContext(null);

export const BudgetProvider = ({ children }) => {
  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem("spend_analyzer_budgets");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return mockBudgets;
      }
    }
    return mockBudgets;
  });

  const [savingsGoals, setSavingsGoals] = useState(() => {
    const saved = localStorage.getItem("spend_analyzer_savings_goals");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return mockSavingsGoals;
      }
    }
    return mockSavingsGoals;
  });

  useEffect(() => {
    localStorage.setItem("spend_analyzer_budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(
      "spend_analyzer_savings_goals",
      JSON.stringify(savingsGoals),
    );
  }, [savingsGoals]);

  const addBudget = useCallback((budget) => {
    const newBudget = {
      ...budget,
      id: generateId(),
      alertThreshold: budget.alertThreshold || 80,
    };
    setBudgets((prev) => [...prev, newBudget]);
    return newBudget;
  }, []);

  const updateBudget = useCallback((id, updates) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    );
  }, []);

  const deleteBudget = useCallback((id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addSavingsGoal = useCallback((goal) => {
    const newGoal = {
      ...goal,
      id: generateId(),
      currentAmount: goal.currentAmount || 0,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
    return newGoal;
  }, []);

  const updateSavingsGoal = useCallback((id, updates) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    );
  }, []);

  const deleteSavingsGoal = useCallback((id) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const addToSavingsGoal = useCallback((id, amount) => {
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g,
      ),
    );
  }, []);

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        savingsGoals,
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
