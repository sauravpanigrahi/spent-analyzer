import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui/Badge";
import {
  calculateBudgetProgress,
  filterTransactionsByDate,
  formatCurrency,
  getDateRange,
} from "../../utils/helpers";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Wallet,
  DollarSign,
  PiggyBank,
  Target,
} from "lucide-react";

export const StatCard = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  variant = "default",
  className = "",
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  const iconColors = {
    default:
      "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
    income:
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    expense: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    savings: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    budget:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {title}
            </p>
            <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {value}
            </p>
            {change !== undefined && (
              <div className="mt-2 flex items-center gap-1">
                {isPositive && (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                )}
                {isNegative && (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                {!isPositive && !isNegative && change === 0 && (
                  <Minus className="h-4 w-4 text-neutral-400" />
                )}
                <span
                  className={`text-sm font-medium ${isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-neutral-500"}`}
                >
                  {isPositive ? "+" : ""}
                  {change?.toFixed(1)}%
                </span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {changeLabel}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${iconColors[variant]}`}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DashboardStats = ({
  budgets = [],
  transactions = [],
  monthlyComparison = [],
}) => {
  const { t } = useTranslation();
  const { start, end } = getDateRange("this-month");
  const currentMonthTransactions = filterTransactionsByDate(
    transactions,
    start,
    end,
  );
  const previousMonth = subMonths(new Date(), 1);
  const previousMonthTransactions = filterTransactionsByDate(
    transactions,
    startOfMonth(previousMonth),
    endOfMonth(previousMonth),
  );
  const currentMonth = monthlyComparison.find((month) => {
    const [year, monthNumber] = month.monthKey.split("-").map(Number);
    const now = new Date();
    return year === now.getFullYear() && monthNumber === now.getMonth() + 1;
  });
  const previousMonthStats = monthlyComparison.find((month) => {
    const [year, monthNumber] = month.monthKey.split("-").map(Number);
    return (
      year === previousMonth.getFullYear() &&
      monthNumber === previousMonth.getMonth() + 1
    );
  });

  const monthlyIncome = currentMonth?.income || 0;
  const monthlyExpenses = currentMonth?.expenses || 0;
  const prevMonthIncome = previousMonthStats?.income || 0;
  const prevMonthExpenses = previousMonthStats?.expenses || 0;
  const currentBalance = monthlyIncome - monthlyExpenses;
  const previousBalance = prevMonthIncome - prevMonthExpenses;
  const hasPreviousMonthTransactions =
    previousMonthTransactions.length > 0;

  const overallBudget = budgets.find((budget) => !budget.category);
  const categoryBudgets = budgets.filter((budget) => budget.category);
  const currentRemaining = overallBudget
    ? calculateBudgetProgress(overallBudget, currentMonthTransactions).remaining
    : categoryBudgets.reduce(
        (sum, budget) =>
          sum +
          calculateBudgetProgress(budget, currentMonthTransactions).remaining,
        0,
      );
  const previousRemaining = overallBudget
    ? overallBudget.amount - prevMonthExpenses
    : categoryBudgets.reduce((sum, budget) => {
        const categoryExpenses = previousMonthTransactions
          .filter(
            (transaction) =>
              transaction.type === "expense" &&
              transaction.category === budget.category,
          )
          .reduce((total, transaction) => total + transaction.amount, 0);
        return sum + budget.amount - categoryExpenses;
      }, 0);

  const percentageChange = (current, previous) =>
    !hasPreviousMonthTransactions || previous === 0
      ? 0
      : ((current - previous) / Math.abs(previous)) * 100;
  const incomeChange = percentageChange(monthlyIncome, prevMonthIncome);
  const expenseChange = -percentageChange(monthlyExpenses, prevMonthExpenses);
  const remainingChange = percentageChange(currentRemaining, previousRemaining);
  const currentSavingsRate =
    monthlyIncome > 0 ? (currentBalance / monthlyIncome) * 100 : 0;
  const previousSavingsRate =
    prevMonthIncome > 0
      ? (previousBalance / prevMonthIncome) * 100
      : 0;
  const savingsChange = percentageChange(
    currentSavingsRate,
    previousSavingsRate,
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title={t("common.totalIncome")}
        value={formatCurrency(monthlyIncome)}
        change={incomeChange}
        changeLabel={t("common.vsLastMonth")}
        icon={DollarSign}
        variant="income"
      />
      <StatCard
        title={t("common.totalExpenses")}
        value={formatCurrency(monthlyExpenses)}
        change={expenseChange}
        changeLabel={t("common.vsLastMonth")}
        icon={CreditCard}
        variant="expense"
      />
      <StatCard
        title={t("common.remainingBudget")}
        value={formatCurrency(currentRemaining)}
        change={remainingChange}
        changeLabel={t("common.vsLastMonth")}
        icon={Wallet}
        variant="default"
      />
      <StatCard
        title={t("common.savingsRate")}
        value={`${currentSavingsRate.toFixed(1)}%`}
        change={savingsChange}
        changeLabel={t("common.vsLastMonth")}
        icon={PiggyBank}
        variant="savings"
      />
    </div>
  );
};

import { CreditCard } from "lucide-react";
