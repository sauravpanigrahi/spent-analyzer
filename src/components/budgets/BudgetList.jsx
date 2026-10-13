import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge, StatusBadge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { formatCurrency, calculateBudgetProgress } from "../../utils/helpers";
import { getCategoryById } from "../../data/mockData";
import {
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Target,
} from "lucide-react";
import { useBudgets, useBudgetCalculations } from "../../context/BudgetContext";
import { useTransactions } from "../../context/TransactionContext";

export const BudgetList = () => {
  const { budgets, deleteBudget, addBudget, updateBudget } = useBudgets();
  const { filteredTransactions } = useTransactions();
  const { budgetProgress, overallBudget, categoryBudgets, overallProgress } =
    useBudgetCalculations(filteredTransactions);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleDelete = (id) => setDeleteId(id);
  const confirmDelete = () => {
    if (deleteId) {
      deleteBudget(deleteId);
      setDeleteId(null);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingBudget(null);
    setShowForm(true);
  };

  const handleFormSubmit = (data) => {
    if (editingBudget) {
      updateBudget(editingBudget.id, data);
    } else {
      addBudget(data);
    }
    setShowForm(false);
    setEditingBudget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Budgets
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400">
            Track your spending against budget limits
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleAdd}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Budget
        </Button>
      </div>

      {overallBudget && (
        <Card className="border-primary-200 dark:border-primary-800">
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
              <StatusBadge status={overallProgress.status} />
              <span className="font-medium">
                {overallProgress.percentage.toFixed(1)}% used
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryBudgets.map((budget) => {
          const progress = budget.progress;
          const catInfo = getCategoryById(budget.category);
          const Icon = catInfo?.icon
            ? require("lucide-react").default[catInfo.icon]
            : null;

          return (
            <Card
              key={budget.id}
              className={`relative ${progress.isOverBudget ? "border-red-200 dark:border-red-800" : progress.isNearLimit ? "border-yellow-200 dark:border-yellow-800" : ""}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${catInfo ? `bg-[${catInfo.color}20]` : "bg-neutral-100"} dark:bg-neutral-800`}
                    >
                      {Icon ? (
                        <Icon
                          className={`h-5 w-5 ${catInfo ? `text-[${catInfo.color}]` : "text-neutral-500"}`}
                        />
                      ) : (
                        <div
                          className="h-5 w-5 rounded"
                          style={{ backgroundColor: catInfo?.color }}
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {catInfo?.name || budget.category}
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Monthly budget
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(budget)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Spent
                    </span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(progress.spent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Budget
                    </span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Remaining
                    </span>
                    <span
                      className={`font-medium ${progress.remaining < 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {formatCurrency(progress.remaining)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progress.isOverBudget
                        ? "bg-red-500"
                        : progress.isNearLimit
                          ? "bg-yellow-500"
                          : "bg-primary-600"
                    }`}
                    style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <StatusBadge status={progress.status} />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {progress.percentage.toFixed(0)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {categoryBudgets.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="flex h-64 items-center justify-center">
              <div className="text-center">
                <Target className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No category budgets yet
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                  Create budgets for specific categories to track spending
                </p>
                <Button
                  variant="primary"
                  onClick={handleAdd}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Create Budget
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingBudget(null);
        }}
        title={editingBudget ? "Edit Budget" : "Create Budget"}
        size="md"
      >
        <BudgetForm
          initialData={editingBudget}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingBudget(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Budget"
        description="Are you sure you want to delete this budget? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

import { useState } from "react";

const BudgetForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    period: "monthly",
    category: "",
    alertThreshold: 80,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        amount: initialData.amount.toString(),
        period: initialData.period,
        category: initialData.category || "",
        alertThreshold: initialData.alertThreshold || 80,
      });
    } else {
      setFormData({
        name: "",
        amount: "",
        period: "monthly",
        category: "",
        alertThreshold: 80,
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      amount: parseFloat(formData.amount),
      period: formData.period,
      category: formData.category || null,
      alertThreshold: parseInt(formData.alertThreshold),
    });
  };

  const categories = [
    { value: "", label: "Overall Budget (All Categories)" },
    { value: "food", label: "Food & Dining" },
    { value: "transport", label: "Transportation" },
    { value: "shopping", label: "Shopping" },
    { value: "entertainment", label: "Entertainment" },
    { value: "health", label: "Health & Fitness" },
    { value: "education", label: "Education" },
    { value: "utilities", label: "Utilities" },
    { value: "housing", label: "Housing" },
    { value: "insurance", label: "Insurance" },
    { value: "personal", label: "Personal Care" },
    { value: "travel", label: "Travel" },
    { value: "gifts", label: "Gifts & Donations" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          Budget Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
          placeholder="e.g., Monthly Food Budget"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          Amount
        </label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
          placeholder="0.00"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          Period
        </label>
        <select
          value={formData.period}
          onChange={(e) => setFormData({ ...formData, period: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          Alert Threshold (%)
        </label>
        <input
          type="number"
          min="50"
          max="100"
          value={formData.alertThreshold}
          onChange={(e) =>
            setFormData({ ...formData, alertThreshold: e.target.value })
          }
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? "Update" : "Create"} Budget
        </Button>
      </div>
    </form>
  );
};
