import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";
import { Modal, ConfirmDialog } from "../ui/Modal";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { getCategoryById, getPaymentMethodById, categories, paymentMethods } from "../../data/mockData";
import {
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  X,
} from "lucide-react";
import { useTransactions } from "../../context/TransactionContext";

export const TransactionList = () => {
  const {
    filteredTransactions,
    filters,
    setFilters,
    deleteTransaction,
    exportTransactions,
    totals,
    categoryTotals,
  } = useTransactions();

  const [deleteId, setDeleteId] = useState(null);
  const [showExport, setShowExport] = useState(false);

  const handleDelete = (id) => setDeleteId(id);
  const confirmDelete = () => {
    if (deleteId) {
      deleteTransaction(deleteId);
      setDeleteId(null);
    }
  };

  const getTypeBadge = (type) => (
    <Badge variant={type === "income" ? "success" : "danger"} size="sm">
      {type === "income" ? "Income" : "Expense"}
    </Badge>
  );

  const getCategoryInfo = (categoryId) => {
    const cat = getCategoryById(categoryId);
    return cat
      ? { name: cat.name, color: cat.color, icon: cat.icon }
      : { name: categoryId, color: "#6366f1", icon: "MoreHorizontal" };
  };

  const getPaymentMethodInfo = (methodId) => {
    const method = getPaymentMethodById(methodId);
    return method ? method.name : methodId;
  };

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
  ];

  const dateRangeOptions = [
    { value: "this-week", label: "This Week" },
    { value: "this-month", label: "This Month" },
    { value: "last-3-months", label: "Last 3 Months" },
    { value: "last-6-months", label: "Last 6 Months" },
    { value: "this-year", label: "This Year" },
    { value: "custom", label: "Custom Range" },
  ];

  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "amount", label: "Amount" },
  ];

  const hasActiveFilters =
    filters.search ||
    filters.category !== "all" ||
    filters.type !== "all" ||
    filters.dateRange !== "this-month";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="max-w-xs"
            leftIcon={<Search className="h-4 w-4" />}
          />
          <Select
            options={categoryOptions}
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="w-48"
          />
          <Select
            options={typeOptions}
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-40"
          />
          <Select
            options={dateRangeOptions}
            value={filters.dateRange}
            onChange={(e) =>
              setFilters({ ...filters, dateRange: e.target.value })
            }
            className="w-44"
          />
          {filters.dateRange === "custom" && (
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.customStartDate}
                onChange={(e) =>
                  setFilters({ ...filters, customStartDate: e.target.value })
                }
                className="w-40"
                placeholder="Start"
              />
              <Input
                type="date"
                value={filters.customEndDate}
                onChange={(e) =>
                  setFilters({ ...filters, customEndDate: e.target.value })
                }
                className="w-40"
                placeholder="End"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select
            options={sortOptions}
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="w-36"
            placeholder="Sort by"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setFilters({
                ...filters,
                sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
              })
            }
            aria-label={
              filters.sortOrder === "asc" ? "Sort descending" : "Sort ascending"
            }
          >
            {filters.sortOrder === "asc" ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExport(true)}
          >
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => {}}>
            Add Transaction
          </Button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge
              variant="info"
              onRemove={() => setFilters({ ...filters, search: "" })}
            >
              Search: {filters.search}
            </Badge>
          )}
          {filters.category !== "all" && (
            <Badge
              variant="primary"
              onRemove={() => setFilters({ ...filters, category: "all" })}
            >
              Category: {getCategoryInfo(filters.category).name}
            </Badge>
          )}
          {filters.type !== "all" && (
            <Badge
              variant="neutral"
              onRemove={() => setFilters({ ...filters, type: "all" })}
            >
              Type: {filters.type}
            </Badge>
          )}
          {filters.dateRange !== "this-month" && (
            <Badge
              variant="neutral"
              onRemove={() =>
                setFilters({ ...filters, dateRange: "this-month" })
              }
            >
              {
                dateRangeOptions.find((o) => o.value === filters.dateRange)
                  ?.label
              }
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setFilters({
                search: "",
                category: "all",
                type: "all",
                dateRange: "this-month",
                customStartDate: "",
                customEndDate: "",
                sortBy: "date",
                sortOrder: "desc",
              })
            }
          >
            Clear all
          </Button>
        </div>
      )}

      <Card>
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
                        <p className="text-neutral-500 dark:text-neutral-400">
                          No transactions found
                        </p>
                        <p className="text-sm text-neutral-400 dark:text-neutral-500">
                          Try adjusting your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((txn) => {
                    const catInfo = getCategoryInfo(txn.category);
                    const Icon = catInfo.icon
                      ? require("lucide-react").default[catInfo.icon]
                      : null;
                    return (
                      <tr
                        key={txn.id}
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                          {formatDate(txn.date, "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-xl ${txn.type === "income" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                            >
                              {Icon ? (
                                <Icon
                                  className={`h-5 w-5 ${txn.type === "income" ? "text-green-600" : "text-red-600"}`}
                                />
                              ) : (
                                <span
                                  className={`text-sm font-medium ${txn.type === "income" ? "text-green-600" : "text-red-600"}`}
                                >
                                  {txn.type === "income" ? "+" : "-"}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                {txn.title}
                              </p>
                              {txn.notes && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-xs">
                                  {txn.notes}
                                </p>
                              )}
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
                              backgroundColor: `${catInfo.color}20`,
                              color: catInfo.color,
                            }}
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: catInfo.color }}
                            />
                            {catInfo.name}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                          {getPaymentMethodInfo(txn.paymentMethod)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`font-semibold ${txn.type === "income" ? "text-green-600" : "text-red-600"}`}
                          >
                            {txn.type === "income" ? "+" : "-"}
                            {formatCurrency(txn.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {}}
                              aria-label="Edit transaction"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(txn.id)}
                              aria-label="Delete transaction"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length > 0 && (
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {filteredTransactions.length} transaction
                  {filteredTransactions.length !== 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-green-600 font-medium">
                    +{formatCurrency(totals.income)}
                  </span>
                  <span className="text-red-600 font-medium">
                    -{formatCurrency(totals.expenses)}
                  </span>
                  <span
                    className={`font-semibold ${totals.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    = {formatCurrency(totals.balance)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />

      <Modal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title="Export Transactions"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Export {filteredTransactions.length} transaction
            {filteredTransactions.length !== 1 ? "s" : ""} to CSV format.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowExport(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const csv = exportTransactions();
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                setShowExport(false);
              }}
            >
              Download CSV
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
