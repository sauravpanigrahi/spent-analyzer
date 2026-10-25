import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  isWithinInterval,
  differenceInDays,
} from "date-fns";
import { getCategoryById } from "../data/mockData";
import { notifyWarning } from "./notifications";

export const formatCurrency = (amount, currency = "", language = "") => {
  let profile = {};
  try {
    const activeUserId = sessionStorage.getItem(
      "spend_analyzer_active_user_id",
    );
    if (activeUserId) {
      profile = JSON.parse(
        localStorage.getItem(`spend_analyzer_profile_${activeUserId}`) || "{}",
      );
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Could not read saved currency preferences:", error.name);
    }
    notifyWarning("Saved currency preferences could not be read.", {
      toastId: "currency-preferences-read-warning",
      dedupeForMs: 60000,
    });
  }

  const selectedCurrency = currency || profile.currency || "INR";

  const selectedLanguage =
    language || profile.language || profile.locale || "en-IN";

  try {
    return new Intl.NumberFormat(selectedLanguage, {
      style: "currency",
      currency: selectedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Currency formatting failed:", error.name);
    }
    notifyWarning(
      "Your currency preference couldn't be applied. Showing the amount with its currency code instead.",
      { toastId: "currency-format-warning", dedupeForMs: 60000 },
    );
    return `${selectedCurrency} ${Number(amount).toFixed(2)}`;
  }
};

export const formatNumber = (number, locale = "en-US") => {
  return new Intl.NumberFormat(locale).format(number);
};

export const formatDate = (date, formatStr = "MMM d, yyyy") => {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr);
};

export const formatDateShort = (date) => formatDate(date, "MMM d");
export const formatDateLong = (date) => formatDate(date, "MMMM d, yyyy");
export const formatMonthYear = (date) => formatDate(date, "MMMM yyyy");

export const getDateRange = (filter) => {
  const now = new Date();
  switch (filter) {
    case "this-week":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "this-month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "last-3-months":
      return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
    case "last-6-months":
      return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) };
    case "this-year":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31),
      };
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
};

export const filterTransactionsByDate = (transactions, startDate, endDate) => {
  return transactions.filter((txn) => {
    const txnDate = parseISO(txn.date);
    return isWithinInterval(txnDate, { start: startDate, end: endDate });
  });
};

export const calculateTotals = (transactions) => {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  return {
    income,
    expenses,
    balance: income - expenses,
    savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
  };
};

export const getCategoryTotals = (transactions, type = "expense") => {
  const filtered = transactions.filter((t) => t.type === type);
  const totals = {};
  filtered.forEach((txn) => {
    if (!totals[txn.category]) {
      totals[txn.category] = 0;
    }
    totals[txn.category] += txn.amount;
  });
  return Object.entries(totals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

export const getDailyTotals = (transactions, startDate, endDate) => {
  const days = differenceInDays(endDate, startDate) + 1;
  const dailyData = {};

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const key = format(date, "yyyy-MM-dd");
    dailyData[key] = { date: key, income: 0, expenses: 0 };
  }

  transactions.forEach((txn) => {
    const key = txn.date;
    if (dailyData[key]) {
      if (txn.type === "income") {
        dailyData[key].income += txn.amount;
      } else {
        dailyData[key].expenses += txn.amount;
      }
    }
  });

  return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
};

export const getMonthlyComparison = (transactions, months = 6) => {
  const now = new Date();
  const data = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(subMonths(now, i));
    const monthTransactions = filterTransactionsByDate(
      transactions,
      monthStart,
      monthEnd,
    );
    const totals = calculateTotals(monthTransactions);
    data.push({
      month: format(monthStart, "MMM yyyy"),
      monthKey: format(monthStart, "yyyy-MM"),
      income: totals.income,
      expenses: totals.expenses,
      savings: totals.balance,
    });
  }

  return data;
};

export const calculateBudgetProgress = (budget, transactions) => {
  const { start, end } = getDateRange("this-month");
  const relevantTransactions = filterTransactionsByDate(
    transactions,
    start,
    end,
  );

  let spent = 0;
  if (budget.category) {
    spent = relevantTransactions
      .filter((t) => t.type === "expense" && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
  } else {
    spent = relevantTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  }

  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  const remaining = budget.amount - spent;
  const isOverBudget = spent > budget.amount;
  const isNearLimit = percentage >= budget.alertThreshold && !isOverBudget;

  return {
    spent,
    remaining,
    percentage: Math.min(percentage, 100),
    isOverBudget,
    isNearLimit,
    status: isOverBudget ? "over" : isNearLimit ? "warning" : "good",
  };
};

export const generateInsights = (transactions, budgets) => {
  const insights = [];
  const { start, end } = getDateRange("this-month");
  const monthlyTransactions = filterTransactionsByDate(
    transactions,
    start,
    end,
  );
  const totals = calculateTotals(monthlyTransactions);

  // Savings rate insight
  if (totals.savingsRate >= 20) {
    insights.push({
      type: "success",
      title: "Great Savings Rate!",
      description: `You're saving ${totals.savingsRate.toFixed(1)}% of your income this month. Keep it up!`,
      icon: "TrendingUp",
    });
  } else if (totals.savingsRate > 0) {
    insights.push({
      type: "info",
      title: "Room for Improvement",
      description: `Your savings rate is ${totals.savingsRate.toFixed(1)}%. Try to aim for 20% or more.`,
      icon: "Target",
    });
  } else if (totals.savingsRate < 0) {
    insights.push({
      type: "warning",
      title: "Spending Exceeds Income",
      description: `You've spent ${formatCurrency(Math.abs(totals.balance))} more than you earned this month.`,
      icon: "AlertTriangle",
    });
  }

  // Top category insight
  const categoryTotals = getCategoryTotals(monthlyTransactions, "expense");
  if (categoryTotals.length > 0) {
    const topCategory = categoryTotals[0];
    const categoryInfo = getCategoryById(topCategory.category);
    insights.push({
      type: "info",
      title: "Top Spending Category",
      description: `${categoryInfo?.name || topCategory.category} accounts for ${formatCurrency(topCategory.amount)} (${((topCategory.amount / totals.expenses) * 100).toFixed(1)}% of expenses)`,
      icon: "PieChart",
    });
  }

  // Budget alerts
  budgets.forEach((budget) => {
    const progress = calculateBudgetProgress(budget, transactions);
    if (progress.isOverBudget) {
      insights.push({
        type: "danger",
        title: "Budget Exceeded",
        description: `${budget.name} is over budget by ${formatCurrency(Math.abs(progress.remaining))}`,
        icon: "AlertCircle",
      });
    } else if (progress.isNearLimit) {
      insights.push({
        type: "warning",
        title: "Budget Warning",
        description: `${budget.name} is at ${progress.percentage.toFixed(0)}% of limit`,
        icon: "AlertTriangle",
      });
    }
  });

  // Recurring expenses
  const recurringExpenses = monthlyTransactions.filter(
    (t) => t.type === "expense" && t.isRecurring,
  );
  const recurringTotal = recurringExpenses.reduce(
    (sum, t) => sum + t.amount,
    0,
  );
  if (recurringTotal > 0) {
    insights.push({
      type: "info",
      title: "Recurring Expenses",
      description: `You have ${recurringExpenses.length} recurring expenses totaling ${formatCurrency(recurringTotal)}/month`,
      icon: "Repeat",
    });
  }

  return insights;
};

export const exportToCSV = (transactions) => {
  const headers = [
    "Date",
    "Title",
    "Amount",
    "Type",
    "Category",
    "Payment Method",
    "Notes",
    "Recurring",
  ];
  const escapeCell = (value) => {
    let cell = value == null ? "" : String(value);
    if (/^[\u0000-\u0020]*[=+\-@]/.test(cell)) {
      cell = `'${cell}`;
    }
    return `"${cell.replace(/"/g, '""')}"`;
  };

  const rows = transactions.map((txn) => [
    txn.date,
    txn.title,
    txn.amount,
    txn.type,
    txn.category,
    txn.paymentMethod,
    txn.notes || "",
    txn.isRecurring ? "Yes" : "No",
  ]);
  const csv = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ].join("\n");
  return csv;
};

export const parseCSV = (csvText) => {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const character = csvText[i];

    if (inQuotes) {
      if (character === '"' && csvText[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (character === '"') {
        inQuotes = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      inQuotes = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && csvText[i + 1] === "\n") i += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.trim())) rows.push(row);
  }

  if (inQuotes || rows.length < 2) return [];

  const headers = rows[0].map((header) =>
    header.replace(/^\uFEFF/, "").toLowerCase().replace(/[^a-z]/g, ""),
  );
  const transactions = [];

  for (const values of rows.slice(1)) {
    const txn = Object.fromEntries(
      headers.map((header, index) => [header, values[index]?.trim() || ""]),
    );
    const amount = Number(txn.amount);
    const type = txn.type.toLowerCase();
    const date = txn.date || new Date().toISOString().split("T")[0];

    if (
      !txn.title ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !["income", "expense"].includes(type) ||
      Number.isNaN(Date.parse(date))
    ) {
      continue;
    }

    transactions.push({
      title: txn.title,
      amount,
      type,
      category: txn.category || "other",
      date,
      paymentMethod: txn.paymentmethod || "cash",
      notes: txn.notes || "",
      isRecurring: txn.recurring?.toLowerCase() === "yes",
      recurringFrequency: null,
    });
  }

  return transactions;
};

export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
