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

export const formatCurrency = (amount, currency = "USD", locale = "en-US") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
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
    headers.join(","),
    ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
  ].join("\n");
  return csv;
};

export const parseCSV = (csvText) => {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
  const transactions = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim());
    if (values.length >= headers.length) {
      const txn = {};
      headers.forEach((header, index) => {
        txn[header.toLowerCase().replace(" ", "")] = values[index];
      });
      transactions.push({
        id: `txn-${Date.now()}-${i}`,
        title: txn.title || "",
        amount: parseFloat(txn.amount) || 0,
        type: txn.type || "expense",
        category: txn.category || "other",
        date: txn.date || new Date().toISOString().split("T")[0],
        paymentMethod: txn.paymentmethod || "cash",
        notes: txn.notes || "",
        isRecurring: txn.recurring?.toLowerCase() === "yes",
        recurringFrequency: null,
      });
    }
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
