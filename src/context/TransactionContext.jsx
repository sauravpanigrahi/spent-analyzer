import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "../DB/supabaseclient";
import { useAuth } from "./AuthContext";
import {
  calculateTotals,
  getCategoryTotals,
  getMonthlyComparison,
  filterTransactionsByDate,
  getDateRange,
  exportToCSV,
  parseCSV,
} from "../utils/helpers";

const TransactionContext = createContext(null);

const fromDatabase = (row) => ({
  id: row.id,
  title: row.title,
  amount: Number(row.amount),
  type: row.type,
  category: row.category,
  date: row.date,
  paymentMethod: row.payment_method,
  notes: row.notes || "",
  isRecurring: row.is_recurring,
  recurringFrequency: row.recurring_frequency,
});

const toDatabase = (transaction, userId) => ({
  user_id: userId,
  title: transaction.title.trim(),
  amount: transaction.amount,
  type: transaction.type,
  category: transaction.category,
  date: transaction.date,
  payment_method: transaction.paymentMethod,
  notes: transaction.notes || "",
  is_recurring: Boolean(transaction.isRecurring),
  recurring_frequency: transaction.isRecurring
    ? transaction.recurringFrequency
    : null,
});

export const TransactionProvider = ({ children }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [storedTransactions, setTransactions] = useState([]);
  const [loadedUserId, setLoadedUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    type: "all",
    dateRange: "this-month",
    customStartDate: "",
    customEndDate: "",
    sortBy: "date",
    sortOrder: "desc",
  });

  useEffect(() => {
    if (isAuthLoading) return undefined;

    if (!user?.id) {
      setTransactions([]);
      setLoadedUserId(null);
      setIsLoading(false);
      setLoadError("");
      return undefined;
    }

    let active = true;
    setTransactions([]);
    setLoadedUserId(null);
    setIsLoading(true);
    setLoadError("");

    const loadTransactions = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        setLoadError(error.message);
      } else {
        setTransactions(data.map(fromDatabase));
      }
      setLoadedUserId(user.id);
      setIsLoading(false);
    };

    loadTransactions().catch((error) => {
      if (!active) return;
      setLoadError(error.message || "Could not load transactions.");
      setLoadedUserId(user.id);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [isAuthLoading, user?.id]);

  const transactions =
    loadedUserId === user?.id ? storedTransactions : [];
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(search));
    }

    if (filters.category !== "all") {
      result = result.filter((t) => t.category === filters.category);
    }

    if (filters.type !== "all") {
      result = result.filter((t) => t.type === filters.type);
    }

    if (filters.dateRange !== "custom") {
      const { start, end } = getDateRange(filters.dateRange);
      result = filterTransactionsByDate(result, start, end);
    } else if (filters.customStartDate && filters.customEndDate) {
      result = filterTransactionsByDate(
        result,
        new Date(filters.customStartDate),
        new Date(filters.customEndDate),
      );
    }

    result.sort((a, b) => {
      const aValue =
        filters.sortBy === "amount"
          ? a.amount
          : new Date(a.date).getTime();
      const bValue =
        filters.sortBy === "amount"
          ? b.amount
          : new Date(b.date).getTime();
      return filters.sortOrder === "asc"
        ? aValue - bValue
        : bValue - aValue;
    });

    return result;
  }, [transactions, filters]);

  const addTransaction = useCallback(
    async (transaction) => {
      if (!user?.id) {
        return { success: false, error: "Please log in to add a transaction." };
      }

      try {
        const { data, error } = await supabase
          .from("transactions")
          .insert(
            toDatabase(
              {
                ...transaction,
                date: transaction.date || new Date().toISOString().split("T")[0],
              },
              user.id,
            ),
          )
          .select()
          .single();

        if (error) return { success: false, error: error.message };

        const savedTransaction = fromDatabase(data);
        setTransactions((previous) => [savedTransaction, ...previous]);
        return { success: true, transaction: savedTransaction };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Could not save transaction.",
        };
      }
    },
    [user?.id],
  );

  const updateTransaction = useCallback(
    async (id, updates) => {
      if (!user?.id) {
        return { success: false, error: "Please log in to edit a transaction." };
      }

      try {
        const { data, error } = await supabase
          .from("transactions")
          .update(toDatabase(updates, user.id))
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .maybeSingle();

        if (error) return { success: false, error: error.message };
        if (!data) {
          return {
            success: false,
            error: "Transaction not found or you do not have permission to edit it.",
          };
        }

        const updatedTransaction = fromDatabase(data);
        setTransactions((previous) =>
          previous.map((transaction) =>
            transaction.id === id ? updatedTransaction : transaction,
          ),
        );
        return { success: true, transaction: updatedTransaction };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Could not update transaction.",
        };
      }
    },
    [user?.id],
  );

  const deleteTransaction = useCallback(
    async (id) => {
      if (!user?.id) {
        return {
          success: false,
          error: "Please log in to delete a transaction.",
        };
      }

      try {
        const { data, error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id)
          .select("id")
          .maybeSingle();

        if (error) return { success: false, error: error.message };
        if (!data) {
          return {
            success: false,
            error: "Transaction not found or you do not have permission to delete it.",
          };
        }

        setTransactions((previous) =>
          previous.filter((transaction) => transaction.id !== id),
        );
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Could not delete transaction.",
        };
      }
    },
    [user?.id],
  );

  const importTransactions = useCallback(
    async (csvText) => {
      if (!user?.id) {
        return { success: false, error: "Please log in to import transactions." };
      }

      const parsed = parseCSV(csvText);
      if (parsed.length === 0) {
        return { success: false, error: "No valid transactions found in CSV." };
      }

      try {
        const { data, error } = await supabase
          .from("transactions")
          .insert(parsed.map((transaction) => toDatabase(transaction, user.id)))
          .select();

        if (error) return { success: false, error: error.message };

        const importedTransactions = data.map(fromDatabase);
        setTransactions((previous) => [...importedTransactions, ...previous]);
        return { success: true, count: importedTransactions.length };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Could not import transactions.",
        };
      }
    },
    [user?.id],
  );

  const exportTransactions = useCallback(
    () => exportToCSV(transactions),
    [transactions],
  );

  const getTransactionById = useCallback(
    (id) => transactions.find((transaction) => transaction.id === id),
    [transactions],
  );

  const totals = useMemo(
    () => calculateTotals(filteredTransactions),
    [filteredTransactions],
  );
  const categoryTotals = useMemo(
    () => getCategoryTotals(filteredTransactions, "expense"),
    [filteredTransactions],
  );
  const incomeCategoryTotals = useMemo(
    () => getCategoryTotals(filteredTransactions, "income"),
    [filteredTransactions],
  );
  const monthlyComparison = useMemo(
    () => getMonthlyComparison(transactions),
    [transactions],
  );

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isLoading,
        loadError,
        filteredTransactions,
        filters,
        setFilters,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        importTransactions,
        exportTransactions,
        getTransactionById,
        totals,
        categoryTotals,
        incomeCategoryTotals,
        monthlyComparison,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactions must be used within a TransactionProvider",
    );
  }
  return context;
};
