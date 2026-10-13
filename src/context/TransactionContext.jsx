import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { mockTransactions } from "../data/mockData";
import {
  calculateTotals,
  getCategoryTotals,
  getMonthlyComparison,
  filterTransactionsByDate,
  getDateRange,
  exportToCSV,
  parseCSV,
  generateId,
} from "../utils/helpers";

const TransactionContext = createContext(null);

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("spend_analyzer_transactions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return mockTransactions;
      }
    }
    return mockTransactions;
  });

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
    localStorage.setItem(
      "spend_analyzer_transactions",
      JSON.stringify(transactions),
    );
  }, [transactions]);

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
      let aVal, bVal;
      if (filters.sortBy === "date") {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      } else if (filters.sortBy === "amount") {
        aVal = a.amount;
        bVal = b.amount;
      } else {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      }
      return filters.sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [transactions, filters]);

  const addTransaction = useCallback((transaction) => {
    const newTxn = {
      ...transaction,
      id: generateId(),
      date: transaction.date || new Date().toISOString().split("T")[0],
    };
    setTransactions((prev) => [newTxn, ...prev]);
    return newTxn;
  }, []);

  const updateTransaction = useCallback((id, updates) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const importTransactions = useCallback((csvText) => {
    const parsed = parseCSV(csvText);
    if (parsed.length > 0) {
      setTransactions((prev) => [...parsed, ...prev]);
      return { success: true, count: parsed.length };
    }
    return { success: false, error: "No valid transactions found in CSV" };
  }, []);

  const exportTransactions = useCallback(() => {
    return exportToCSV(transactions);
  }, [transactions]);

  const getTransactionById = useCallback(
    (id) => {
      return transactions.find((t) => t.id === id);
    },
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
