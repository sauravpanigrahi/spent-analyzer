import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { formatCurrency } from "../../utils/helpers";
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
  totals,
  savingsRate,
  budgets,
  transactions,
}) => {
  const overallBudget = budgets.find((b) => !b.category);
  const budgetProgress = overallBudget?.progress || {
    spent: 0,
    remaining: 0,
    percentage: 0,
  };

  const monthlyIncome = totals.income;
  const monthlyExpenses = totals.expenses;
  const monthlyBalance = totals.balance;

  const prevMonthIncome = 5200;
  const prevMonthExpenses = 2800;
  const prevMonthBalance = prevMonthIncome - prevMonthExpenses;

  const incomeChange =
    prevMonthIncome > 0
      ? ((monthlyIncome - prevMonthIncome) / prevMonthIncome) * 100
      : 0;
  const expenseChange =
    prevMonthExpenses > 0
      ? ((monthlyExpenses - prevMonthExpenses) / prevMonthExpenses) * 100
      : 0;
  const balanceChange =
    prevMonthBalance !== 0
      ? ((monthlyBalance - prevMonthBalance) / Math.abs(prevMonthBalance)) * 100
      : 0;
  const savingsChange = 2.5;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Income"
        value={formatCurrency(monthlyIncome)}
        change={incomeChange}
        changeLabel="vs last month"
        icon={DollarSign}
        variant="income"
      />
      <StatCard
        title="Total Expenses"
        value={formatCurrency(monthlyExpenses)}
        change={expenseChange}
        changeLabel="vs last month"
        icon={CreditCard}
        variant="expense"
      />
      <StatCard
        title="Remaining Budget"
        value={formatCurrency(budgetProgress.remaining)}
        change={balanceChange}
        changeLabel="vs last month"
        icon={Wallet}
        variant="default"
      />
      <StatCard
        title="Savings Rate"
        value={`${savingsRate.toFixed(1)}%`}
        change={savingsChange}
        changeLabel="vs last month"
        icon={PiggyBank}
        variant="savings"
      />
    </div>
  );
};

import { CreditCard } from "lucide-react";
