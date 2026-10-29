import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Modal } from "../ui/Modal";
import { categories, paymentMethods } from "../../data/mockData";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { notifyError } from "../../utils/notifications";
import { useTranslation } from "react-i18next";
import { getCategoryLabel, getPaymentMethodLabel } from "../../utils/labels";
import {
  X,
  Calendar,
  DollarSign,
  CreditCard,
  Tag,
  MessageSquare,
  Repeat,
} from "lucide-react";

export const TransactionForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "credit-card",
    notes: "",
    isRecurring: false,
    recurringFrequency: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        amount: initialData.amount?.toString() || "",
        type: initialData.type || "expense",
        category: initialData.category || "",
        date: initialData.date || new Date().toISOString().split("T")[0],
        paymentMethod: initialData.paymentMethod || "credit-card",
        notes: initialData.notes || "",
        isRecurring: initialData.isRecurring || false,
        recurringFrequency: initialData.recurringFrequency || null,
      });
    } else {
      setFormData({
        title: "",
        amount: "",
        type: "expense",
        category: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "credit-card",
        notes: "",
        isRecurring: false,
        recurringFrequency: null,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = t("validation.titleRequired");
    if (!formData.amount || parseFloat(formData.amount) <= 0)
      newErrors.amount = t("validation.amountRequired");
    if (!formData.category) newErrors.category = t("validation.categoryRequired");
    if (!formData.date) newErrors.date = t("validation.dateRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
      });
    } else {
      notifyError(t("validation.correctTransactionFields"));
    }
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: getCategoryLabel(c.id, c.name, t),
  }));
  const paymentOptions = paymentMethods.map((p) => ({
    value: p.id,
    label: getPaymentMethodLabel(p.id, p.name, t),
  }));
  const recurringOptions = [
    { value: null, label: t("transactions.notRecurring") },
    { value: "daily", label: t("transactions.daily") },
    { value: "weekly", label: t("transactions.weekly") },
    { value: "monthly", label: t("transactions.monthly") },
    { value: "quarterly", label: t("transactions.quarterly") },
    { value: "yearly", label: t("transactions.yearly") },
  ];

  const typeOptions = [
    { value: "expense", label: t("common.expenses") },
    { value: "income", label: t("common.income") },
  ];

  const filteredCategories = categories.filter((c) => {
    if (formData.type === "income") {
      return ["salary", "freelance", "investments", "other-income"].includes(
        c.id,
      );
    }
    return !["salary", "freelance", "investments", "other-income"].includes(
      c.id,
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        initialData
          ? t("transactions.edit")
          : t("transactions.add")
      }
      size="lg"
      blurBackdrop={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t("transactions.title")}
            placeholder={t("transactions.titlePlaceholder")}
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            error={errors.title}
            leftIcon={<Tag className="h-4 w-4" />}
            required
          />
          <div className="relative">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              {t("common.amount")}
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
                placeholder="0.00"
                required
              />
            </div>
            {errors.amount && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {errors.amount}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={t("common.type")}
            options={typeOptions}
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value, category: "" })
            }
            error={errors.type}
            leftIcon={<Repeat className="h-4 w-4" />}
          />
          <Select
            label={t("common.category")}
            options={filteredCategories.map((c) => ({
              value: c.id,
              label: getCategoryLabel(c.id, c.name, t),
            }))}
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            error={errors.category}
            placeholder={t("transactions.selectCategory")}
            leftIcon={<Tag className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              {t("common.date")}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
                required
              />
            </div>
            {errors.date && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {errors.date}
              </p>
            )}
          </div>
          <Select
            label={t("transactions.paymentMethod")}
            options={paymentOptions}
            value={formData.paymentMethod}
            onChange={(e) =>
              setFormData({ ...formData, paymentMethod: e.target.value })
            }
            leftIcon={<CreditCard className="h-4 w-4" />}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            {t("transactions.notesOptional")}
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
            placeholder={t("transactions.notesPlaceholder")}
          />
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
          <input
            type="checkbox"
            id="recurring"
            checked={formData.isRecurring}
            onChange={(e) =>
              setFormData({
                ...formData,
                isRecurring: e.target.checked,
                recurringFrequency: e.target.checked ? "monthly" : null,
              })
            }
            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <label
            htmlFor="recurring"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer"
          >
            {t("transactions.recurring")}
          </label>
        </div>

        {formData.isRecurring && (
          <Select
            label={t("transactions.frequency")}
            options={recurringOptions.filter((o) => o.value)}
            value={formData.recurringFrequency}
            onChange={(e) =>
              setFormData({ ...formData, recurringFrequency: e.target.value })
            }
            leftIcon={<Repeat className="h-4 w-4" />}
          />
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary" loading={isLoading}>
            {initialData ? t("common.update") : t("common.add")}{" "}
            {t("transactions.title")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
