import { useBudgets, useBudgetCalculations } from "../context/BudgetContext";
import { useTransactions } from "../context/TransactionContext";
import { BudgetList } from "../components/budgets/BudgetList";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { formatCurrency } from "../utils/helpers";
import {
  Plus,
  Target,
  TrendingUp,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const Budgets = () => {
  const { filteredTransactions } = useTransactions();
  const {
    budgets,
    overallBudget,
    categoryBudgets,
    overallProgress,
    totalBudgeted,
    totalSpent,
  } = useBudgetCalculations(filteredTransactions);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Budgets
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Track your spending against budget limits
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Total Budgeted
                </p>
                <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(totalBudgeted)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <Target className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Total Spent
                </p>
                <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Remaining
                </p>
                <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalBudgeted - totalSpent)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Utilization
                </p>
                <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {totalBudgeted > 0
                    ? ((totalSpent / totalBudgeted) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Plus className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {overallBudget && (
        <Card className="border-primary-200 dark:border-primary-800 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Overall Monthly Budget
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Total budget across all categories
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(overallProgress.spent)} /{" "}
                  {formatCurrency(overallBudget.amount)}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {formatCurrency(overallProgress.remaining)} remaining
                </p>
              </div>
            </div>
            <div className="mt-4 h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallProgress.isOverBudget
                    ? "bg-red-500"
                    : overallProgress.isNearLimit
                      ? "bg-yellow-500"
                      : "bg-primary-600"
                }`}
                style={{
                  width: `${Math.min(overallProgress.percentage, 100)}%`,
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                {overallProgress.isOverBudget && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                {overallProgress.isNearLimit &&
                  !overallProgress.isOverBudget && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                {!overallProgress.isOverBudget &&
                  !overallProgress.isNearLimit && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                <span className="font-medium">
                  {overallProgress.percentage.toFixed(1)}% used
                </span>
              </span>
              <span
                className={`font-medium ${overallProgress.isOverBudget ? "text-red-600" : overallProgress.isNearLimit ? "text-yellow-600" : "text-green-600"}`}
              >
                {overallProgress.isOverBudget
                  ? "Over Budget"
                  : overallProgress.isNearLimit
                    ? "Near Limit"
                    : "On Track"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <BudgetList />
    </div>
  );
};
