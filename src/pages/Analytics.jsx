import { useMemo } from "react";
import { useTransactions } from "../context/TransactionContext";
import { useBudgets, useBudgetCalculations } from "../context/BudgetContext";
import {
  getMonthlyComparison,
  getCategoryTotals,
  calculateTotals,
  filterTransactionsByDate,
  getDateRange,
} from "../utils/helpers";
import { categories } from "../data/mockData";
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
import { Select } from "../components/ui/Select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanels,
  TabsPanel,
} from "../components/ui/Tabs";
import { formatCurrency, formatDate } from "../utils/helpers";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  DollarSign,
  CreditCard,
  Target,
  Wallet,
  PiggyBank,
} from "lucide-react";

export const Analytics = () => {
  const { t } = useTranslation();
  const {
    transactions,
    filters,
    setFilters,
    categoryTotals,
    incomeCategoryTotals,
    monthlyComparison,
  } = useTransactions();
  const { budgets } = useBudgets();
  const { budgetProgress, categoryBudgets } =
    useBudgetCalculations(transactions);

  const dateRangeOptions = [
    { value: "this-month", label: t("transactions.thisMonth") },
    { value: "last-3-months", label: t("transactions.lastThreeMonths") },
    { value: "last-6-months", label: t("transactions.lastSixMonths") },
    { value: "this-year", label: t("transactions.thisYear") },
    { value: "custom", label: t("transactions.customRange") },
  ];

  const { start, end } = getDateRange(filters.dateRange);
  const filteredTxns = useMemo(
    () => filterTransactionsByDate(transactions, start, end),
    [transactions, filters.dateRange],
  );
  const totals = useMemo(() => calculateTotals(filteredTxns), [filteredTxns]);
  const dailyData = useMemo(() => {
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const dailyData = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const key = date.toISOString().split("T")[0];
      dailyData[key] = { date: key, income: 0, expenses: 0 };
    }
    filteredTxns.forEach((txn) => {
      if (dailyData[txn.date]) {
        if (txn.type === "income") dailyData[txn.date].income += txn.amount;
        else dailyData[txn.date].expenses += txn.amount;
      }
    });
    return Object.values(dailyData).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }, [filteredTxns, start, end]);

  const avgDailySpending = useMemo(() => {
    const expenseDays = dailyData.filter((d) => d.expenses > 0).length;
    return expenseDays > 0 ? totals.expenses / expenseDays : 0;
  }, [dailyData, totals.expenses]);

  const savingsRate =
    totals.income > 0
      ? ((totals.income - totals.expenses) / totals.income) * 100
      : 0;

  const topCategories = useMemo(
    () => categoryTotals.slice(0, 10),
    [categoryTotals],
  );

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {t("analytics.title")}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            {t("analytics.overview")}
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
            placeholder={t("dashboard.timeRange")}
            leftIcon={<Calendar className="h-4 w-4" />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {t("analytics.averageDailySpending")}
                </p>
                <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(avgDailySpending)}
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
                  {t("common.savingsRate")}
                </p>
                <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                  {savingsRate.toFixed(1)}%
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
                  {t("common.totalIncome")}
                </p>
                <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(totals.income)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {t("common.totalExpenses")}
                </p>
                <p className="mt-1 text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(totals.expenses)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t("analytics.overviewTab")}</TabsTrigger>
          <TabsTrigger value="spending">{t("analytics.spendingTab")}</TabsTrigger>
          <TabsTrigger value="income">{t("common.income")}</TabsTrigger>
          <TabsTrigger value="budgets">{t("navigation.budgets")}</TabsTrigger>
        </TabsList>

        <TabsPanels>
          <TabsPanel value="overview">
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
          </TabsPanel>

          <TabsPanel value="spending">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("analytics.categoryBreakdown")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategorySpendingChart
                    categoryTotals={categoryTotals}
                    categories={categories}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("analytics.dailySpendingPattern")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <DailySpendingChart dailyData={dailyData} />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.topCategories")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topCategories.map((item, index) => {
                  const catInfo = categories.find(
                    (c) => c.id === item.category,
                  );
                  const percentage =
                    totals.expenses > 0
                      ? (item.amount / totals.expenses) * 100
                      : 0;
                  return (
                    <div
                      key={item.category}
                      className="flex items-center gap-4"
                    >
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
                      <div className="text-right w-28">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(item.amount)}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsPanel>

          <TabsPanel value="income">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("analytics.incomeSources")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategorySpendingChart
                    categoryTotals={incomeCategoryTotals}
                    categories={categories}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("analytics.monthlyIncomeTrend")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MonthlyTrendChart data={monthlyComparison} />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{t("analytics.incomeByCategory")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {incomeCategoryTotals.map((item, index) => {
                  const catInfo = categories.find(
                    (c) => c.id === item.category,
                  );
                  const percentage =
                    totals.income > 0 ? (item.amount / totals.income) * 100 : 0;
                  return (
                    <div
                      key={item.category}
                      className="flex items-center gap-4"
                    >
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
                              backgroundColor: catInfo?.color || "#22c55e",
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-right w-28">
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          +{formatCurrency(item.amount)}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsPanel>

          <TabsPanel value="budgets">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("analytics.budgetPerformance")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryBudgets.map((budget) => {
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
                            <span
                              className={`badge ${progress.isOverBudget ? "badge-danger" : progress.isNearLimit ? "badge-warning" : "badge-success"}`}
                            >
                              {progress.isOverBudget
                                ? "Over"
                                : progress.isNearLimit
                                  ? "Warning"
                                  : "Good"}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {formatCurrency(progress.spent)} /{" "}
                            {formatCurrency(budget.amount)}
                          </span>
                        </div>
                        <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
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
                        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                          <span>{progress.percentage.toFixed(1)}% used</span>
                          <span
                            className={
                              progress.remaining < 0
                                ? "text-red-500"
                                : "text-green-500"
                            }
                          >
                            {progress.remaining < 0 ? "Over by" : "Remaining"}{" "}
                            {formatCurrency(Math.abs(progress.remaining))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("analytics.budgetVsActual")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <IncomeVsExpenseChart data={monthlyComparison} />
                </CardContent>
              </Card>
            </div>
          </TabsPanel>
        </TabsPanels>
      </Tabs>
    </div>
  );
};
