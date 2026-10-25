import { getIcon } from "../utils/icons";
import { useMemo } from "react";
import { useTransactions } from "../context/TransactionContext";
import { useBudgets, useBudgetCalculations } from "../context/BudgetContext";
import {
  generateInsights,
  getDateRange,
  filterTransactionsByDate,
  getDailyTotals,
} from "../utils/helpers";
import { categories } from "../data/mockData";
import { StatCard, DashboardStats } from "../components/dashboard/StatCards";
import {
  MonthlyTrendChart,
  IncomeVsExpenseChart,
  CategorySpendingChart,
  DailySpendingChart,
} from "../components/dashboard/Charts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Badge, StatusBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { formatCurrency, formatDate } from "../utils/helpers";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Wallet,
  PiggyBank,
  Target,
  PieChart,
  BarChart3,
  LineChart,
  Calendar,
  Filter,
  Download,
  Upload,
  Plus,
} from "lucide-react";

export const Dashboard = () => {
  const {
    transactions,
    filteredTransactions,
    filters,
    setFilters,
    totals,
    categoryTotals,
    incomeCategoryTotals,
    monthlyComparison,
    exportTransactions,
  } = useTransactions();
  const { budgets } = useBudgets();
  const { budgetProgress, overallBudget, categoryBudgets, overallProgress } =
    useBudgetCalculations(transactions);

  const insights = useMemo(
    () => generateInsights(filteredTransactions, budgets),
    [filteredTransactions, budgets],
  );

  const dateRangeOptions = [
    { value: "this-week", label: "This Week" },
    { value: "this-month", label: "This Month" },
    { value: "last-3-months", label: "Last 3 Months" },
    { value: "last-6-months", label: "Last 6 Months" },
    { value: "this-year", label: "This Year" },
    { value: "custom", label: "Custom Range" },
  ];

  const { start, end } = getDateRange(filters.dateRange);
  const dailyData = useMemo(
    () => getDailyTotals(filteredTransactions, start, end),
    [filteredTransactions, filters.dateRange],
  );

  const recentTransactions = filteredTransactions.slice(0, 5);
  const topCategories = categoryTotals.slice(0, 5);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Dashboard
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Overview of your financial health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            options={dateRangeOptions}
            value={filters.dateRange}
            onChange={(e) =>
              setFilters({ ...filters, dateRange: e.target.value })
            }
            className="w-44"
            placeholder="Time Range"
            leftIcon={<Calendar className="h-4 w-4" />}
          />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      <DashboardStats
        budgets={budgets}
        transactions={transactions}
        monthlyComparison={monthlyComparison}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTrendChart data={monthlyComparison} />
        <IncomeVsExpenseChart data={monthlyComparison} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategorySpendingChart
          categoryTotals={categoryTotals}
          categories={categories}
        />
        <DailySpendingChart dailyData={dailyData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => {}}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <p className="text-neutral-500 dark:text-neutral-400">
                          No transactions yet
                        </p>
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((txn) => {
                      const catInfo = categories.find(
                        (c) => c.id === txn.category,
                      );
                      const Icon = catInfo?.icon
                        ? getIcon(catInfo.icon)
                        : null;
                      return (
                        <tr
                          key={txn.id}
                          className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                        >
                          <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                            {formatDate(txn.date, "MMM d")}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-xl ${txn.type === "income" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                              >
                                {Icon ? (
                                  <Icon
                                    className={`h-4 w-4 ${txn.type === "income" ? "text-green-600" : "text-red-600"}`}
                                  />
                                ) : (
                                  <span
                                    className={`text-xs font-medium ${txn.type === "income" ? "text-green-600" : "text-red-600"}`}
                                  >
                                    {txn.type === "income" ? "+" : "-"}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                  {txn.title}
                                </p>
                                {txn.isRecurring && (
                                  <Badge variant="info" size="xs">
                                    Recurring
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                            <Badge
                              variant="neutral"
                              className="gap-1"
                              style={{
                                backgroundColor: `${catInfo?.color}20`,
                                color: catInfo?.color,
                              }}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: catInfo?.color }}
                              />
                              {catInfo?.name || txn.category}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`font-semibold ${txn.type === "income" ? "text-green-600" : "text-red-600"}`}
                            >
                              {txn.type === "income" ? "+" : "-"}
                              {formatCurrency(txn.amount)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.length === 0 ? (
              <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">
                Add transactions to see insights
              </p>
            ) : (
              insights.map((insight, index) => {
                const Icon = insight.icon
                  ? getIcon(insight.icon)
                  : null;
                const iconColors = {
                  success:
                    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                  warning:
                    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
                  danger:
                    "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                  info: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                };
                return (
                  <div
                    key={index}
                    className="flex gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800"
                  >
                    <div
                      className={`p-2 rounded-xl ${iconColors[insight.type]}`}
                    >
                      {Icon ? (
                        <Icon className="h-5 w-5" />
                      ) : insight.type === "success" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : insight.type === "warning" ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : insight.type === "danger" ? (
                        <AlertCircle className="h-5 w-5" />
                      ) : (
                        <TrendingUp className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {insight.title}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCategories.length === 0 ? (
              <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">
                No spending data
              </p>
            ) : (
              topCategories.map((item, index) => {
                const catInfo = categories.find((c) => c.id === item.category);
                const percentage =
                  totals.expenses > 0
                    ? (item.amount / totals.expenses) * 100
                    : 0;
                return (
                  <div key={item.category} className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-xl ${catInfo ? `bg-[${catInfo.color}20]` : "bg-neutral-100"} dark:bg-neutral-800`}
                    >
                      <span
                        className="h-5 w-5 rounded"
                        style={{ backgroundColor: catInfo?.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {catInfo?.name || item.category}
                      </p>
                      <div className="h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: catInfo?.color || "#6366f1",
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right w-24">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(item.amount)}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryBudgets.length === 0 ? (
              <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">
                No budgets set
              </p>
            ) : (
              categoryBudgets.map((budget) => {
                const progress = budget.progress;
                const catInfo = categories.find(
                  (c) => c.id === budget.category,
                );
                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: catInfo?.color }}
                        />
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {catInfo?.name || budget.category}
                        </span>
                        <StatusBadge status={progress.status} />
                      </div>
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {formatCurrency(progress.spent)} /{" "}
                        {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress.isOverBudget
                            ? "bg-red-500"
                            : progress.isNearLimit
                              ? "bg-yellow-500"
                              : "bg-primary-600"
                        }`}
                        style={{
                          width: `${Math.min(progress.percentage, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
