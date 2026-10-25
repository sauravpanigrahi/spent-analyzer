import { useBudgetCalculations } from "../context/BudgetContext";
import { useTransactions } from "../context/TransactionContext";
import { BudgetList } from "../components/budgets/BudgetList";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  calculateTotals,
  filterTransactionsByDate,
  formatCurrency,
  getDateRange,
} from "../utils/helpers";
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
  const { transactions } = useTransactions();
  const {
    overallBudget,
    totalBudgeted,
  } = useBudgetCalculations(transactions);
  const displayedTotalBudgeted = overallBudget?.amount ?? totalBudgeted;
  const { start, end } = getDateRange("this-month");
  const monthlyTotals = calculateTotals(
    filterTransactionsByDate(transactions, start, end),
  );
  const netExpense = monthlyTotals.expenses - monthlyTotals.income;
  const remaining = displayedTotalBudgeted - monthlyTotals.expenses;
  const utilization =
    displayedTotalBudgeted > 0
      ? (monthlyTotals.expenses / displayedTotalBudgeted) * 100
      : 0;

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
                  {formatCurrency(displayedTotalBudgeted)}
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
                  {formatCurrency(monthlyTotals.expenses)}
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
                  {formatCurrency(remaining)}
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
                  {utilization}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Plus className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BudgetList />
    </div>
  );
};
