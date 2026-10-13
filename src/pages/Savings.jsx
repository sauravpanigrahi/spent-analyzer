import { SavingsGoalsList } from "../components/savings/SavingsGoalsList";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { formatCurrency } from "../utils/helpers";
import { useBudgets } from "../context/BudgetContext";
import { useTransactions } from "../context/TransactionContext";
import {
  Target,
  TrendingUp,
  PiggyBank,
  DollarSign,
  Calendar,
  Flag,
} from "lucide-react";

export const Savings = () => {
  const { savingsGoals } = useBudgets();
  const { filteredTransactions, totals } = useTransactions();

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress =
    totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Savings Goals
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Track your progress towards financial goals
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Total Saved
                </p>
                <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalSaved)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <PiggyBank className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Total Target
                </p>
                <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalTarget)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
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
                  Overall Progress
                </p>
                <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {overallProgress.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
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
                <p className="mt-1 text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(totalTarget - totalSaved)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SavingsGoalsList />
    </div>
  );
};
