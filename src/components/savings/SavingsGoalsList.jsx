import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { useState, useEffect } from "react";
import { Modal, ConfirmDialog } from "../ui/Modal";
import { formatCurrency } from "../../utils/helpers";
import {
  Plus,
  Edit,
  Trash2,
  Target,
  Flag,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useBudgets } from "../../context/BudgetContext";
import { notifyError } from "../../utils/notifications";

export const SavingsGoalsList = () => {
  const {
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addToSavingsGoal,
  } = useBudgets();
  const [editingGoal, setEditingGoal] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [addingToGoal, setAddingToGoal] = useState(null);

  const handleDelete = (id) => setDeleteId(id);
  const confirmDelete = () => {
    if (deleteId) {
      deleteSavingsGoal(deleteId);
      setDeleteId(null);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingGoal(null);
    setShowForm(true);
  };

  const handleFormSubmit = (data) => {
    if (editingGoal) {
      updateSavingsGoal(editingGoal.id, data);
    } else {
      addSavingsGoal(data);
    }
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleAddFunds = (goal) => {
    setAddingToGoal(goal);
    setShowAddFunds(true);
  };

  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addAmount, setAddAmount] = useState("");

  const confirmAddFunds = () => {
    const amount = Number(addAmount);
    if (!addingToGoal) return;
    if (!Number.isFinite(amount) || amount <= 0) {
      notifyError("Enter a contribution amount greater than zero.");
      return;
    }
    addToSavingsGoal(addingToGoal.id, amount);
    setShowAddFunds(false);
    setAddingToGoal(null);
    setAddAmount("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Savings Goals
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400">
            Track your progress towards financial goals
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleAdd}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Goal
        </Button>
      </div>

      {savingsGoals.length === 0 ? (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Target className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                No savings goals yet
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                Create a savings goal to start tracking your progress
              </p>
              <Button
                variant="primary"
                onClick={handleAdd}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Create Goal
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savingsGoals.map((goal) => {
            const progress =
              goal.targetAmount > 0
                ? (goal.currentAmount / goal.targetAmount) * 100
                : 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            const daysLeft = Math.ceil(
              (new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24),
            );
            const monthlyNeeded =
              daysLeft > 0 ? remaining / (daysLeft / 30) : remaining;

            return (
              <Card key={goal.id} className="relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r"
                  style={{
                    background: `linear-gradient(90deg, ${goal.color} 0%, ${goal.color}aa 100%)`,
                  }}
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-xl"
                        style={{ backgroundColor: `${goal.color}20` }}
                      >
                        <Flag
                          className="h-5 w-5"
                          style={{ color: goal.color }}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                          {goal.name}
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Target: {formatDate(goal.targetDate, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(goal.currentAmount)}
                        </span>
                        <span className="text-neutral-500 dark:text-neutral-400">
                          of {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor: goal.color,
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-neutral-500 dark:text-neutral-400">
                          Progress
                        </p>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {progress.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500 dark:text-neutral-400">
                          Remaining
                        </p>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(remaining)}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500 dark:text-neutral-400">
                          Days Left
                        </p>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {Math.max(0, daysLeft)}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500 dark:text-neutral-400">
                          Monthly Needed
                        </p>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(monthlyNeeded)}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleAddFunds(goal)}
                      leftIcon={<ArrowUp className="h-4 w-4" />}
                    >
                      Add Funds
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingGoal(null);
        }}
        title={editingGoal ? "Edit Goal" : "Create Savings Goal"}
        size="md"
      >
        <SavingsGoalForm
          initialData={editingGoal}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingGoal(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showAddFunds}
        onClose={() => {
          setShowAddFunds(false);
          setAddingToGoal(null);
          setAddAmount("");
        }}
        title="Add Funds to Goal"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Add funds to <strong>{addingToGoal?.name}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
              placeholder="0.00"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddFunds(false);
                setAddingToGoal(null);
                setAddAmount("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmAddFunds}
              disabled={!addAmount || parseFloat(addAmount) <= 0}
            >
              Add Funds
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Goal"
        description="Are you sure you want to delete this savings goal? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

import { formatDate } from "../../utils/helpers";

const SavingsGoalForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    category: "emergency",
    color: "#ef4444",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        targetAmount: initialData.targetAmount.toString(),
        currentAmount: initialData.currentAmount.toString(),
        targetDate: initialData.targetDate,
        category: initialData.category,
        color: initialData.color,
      });
    } else {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setFormData({
        name: "",
        targetAmount: "",
        currentAmount: "0",
        targetDate: nextMonth.toISOString().split("T")[0],
        category: "emergency",
        color: "#ef4444",
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const targetAmount = Number(formData.targetAmount);
    const currentAmount = Number(formData.currentAmount);
    if (!formData.name.trim()) {
      notifyError("Enter a name for this savings goal.");
      return;
    }
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      notifyError("Enter a target amount greater than zero.");
      return;
    }
    if (!Number.isFinite(currentAmount) || currentAmount < 0) {
      notifyError("Enter a current amount of zero or more.");
      return;
    }
    if (!formData.targetDate || Number.isNaN(new Date(formData.targetDate).getTime())) {
      notifyError("Choose a valid target date.");
      return;
    }
    onSubmit({
      name: formData.name,
      targetAmount,
      currentAmount,
      targetDate: formData.targetDate,
      category: formData.category,
      color: formData.color,
    });
  };

  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          Goal Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
          placeholder="e.g., Emergency Fund"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Target Amount
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.targetAmount}
            onChange={(e) =>
              setFormData({ ...formData, targetAmount: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Current Amount
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.currentAmount}
            onChange={(e) =>
              setFormData({ ...formData, currentAmount: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
            placeholder="0.00"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          Target Date
        </label>
        <input
          type="date"
          value={formData.targetDate}
          onChange={(e) =>
            setFormData({ ...formData, targetDate: e.target.value })
          }
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`h-8 w-8 rounded-xl border-2 transition-all ${
                formData.color === color
                  ? "border-neutral-900 dark:border-neutral-100 scale-110"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              aria-label={color}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? "Update" : "Create"} Goal
        </Button>
      </div>
    </form>
  );
};
