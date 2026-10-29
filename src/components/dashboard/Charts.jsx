import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { formatCurrency, formatDateShort } from "../../utils/helpers";
import { useTranslation } from "react-i18next";
import { getCategoryLabel } from "../../utils/labels";

const COLORS = [
  "#22c55e",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#0ea5e9",
];

export const MonthlyTrendChart = ({ data }) => {
  const { t } = useTranslation();
  if (!data || data.length === 0) {
    return (
      <Card className="h-[300px]">
        <CardContent className="flex h-full items-center justify-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            {t("common.noData")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("charts.monthlyExpenseTrends")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e5e5"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#737373" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#737373" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  formatCurrency(value).replace(/\.00$/, "")
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelFormatter={(label) => label}
                formatter={(value, name) => [
                  formatCurrency(value),
                  name === "income" ? t("common.income") : t("common.expenses"),
                ]}
              />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(value) =>
                  value === "income" ? t("common.income") : t("common.expenses")
                }
              />
              <Area
                type="monotone"
                dataKey="income"
                name={t("common.income")}
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.1}
                strokeWidth={2}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name={t("common.expenses")}
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.1}
                strokeWidth={2}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const IncomeVsExpenseChart = ({ data }) => {
  const { t } = useTranslation();
  if (!data || data.length === 0) {
    return (
      <Card className="h-[300px]">
        <CardContent className="flex h-full items-center justify-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            {t("common.noData")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("charts.incomeVsExpenses")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e5e5"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#737373" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#737373" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  formatCurrency(value).replace(/\.00$/, "")
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelFormatter={(label) => label}
                formatter={(value, name) => [
                  formatCurrency(value),
                  name === "income" ? t("common.income") : t("common.expenses"),
                ]}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar
                dataKey="income"
                name={t("common.income")}
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                maxBarWidth={40}
              />
              <Bar
                dataKey="expenses"
                name={t("common.expenses")}
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                maxBarWidth={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const CategorySpendingChart = ({ categoryTotals, categories }) => {
  const { t } = useTranslation();
  if (!categoryTotals || categoryTotals.length === 0) {
    return (
      <Card className="h-[300px]">
        <CardContent className="flex h-full items-center justify-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            {t("charts.noSpendingData")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = categoryTotals.map((item, index) => ({
    ...item,
    name: getCategoryLabel(
      item.category,
      categories.find((c) => c.id === item.category)?.name,
      t,
    ),
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("charts.spendingByCategory")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="amount"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
                labelStyle={{ fontSize: 12, fontWeight: 500 }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value, name) => [formatCurrency(value), name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const DailySpendingChart = ({ dailyData }) => {
  const { t } = useTranslation();
  if (!dailyData || dailyData.length === 0) {
    return (
      <Card className="h-[300px]">
        <CardContent className="flex h-full items-center justify-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            {t("common.noData")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("charts.dailySpending")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={dailyData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e5e5"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#737373" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatDateShort(value)}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#737373" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  formatCurrency(value).replace(/\.00$/, "")
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelFormatter={(label) => formatDateShort(label)}
                formatter={(value, name) => [
                  formatCurrency(value),
                  name === "income" ? "Income" : "Expenses",
                ]}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
