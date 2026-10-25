import { useState } from "react";
import { useTransactions } from "../context/TransactionContext";
import { TransactionList } from "../components/transactions/TransactionList";
import { TransactionForm } from "../components/transactions/TransactionForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { formatCurrency } from "../utils/helpers";
import { notifyError, notifySuccess } from "../utils/notifications";
import {
  Plus,
  Download,
  Upload,
  Filter,
  CreditCard,
  DollarSign,
  Wallet,
  TrendingUp,
} from "lucide-react";

export const Transactions = () => {
  const {
    filteredTransactions,
    totals,
    exportTransactions,
    importTransactions,
    addTransaction,
    updateTransaction,
    isLoading: isTransactionsLoading,
  } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);

  const handleAdd = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEdit = (txn) => {
    setEditingTransaction(txn);
    setShowForm(true);
  };

  const handleFormSubmit = async (data) => {
    setIsSavingTransaction(true);

    try {
      const result = editingTransaction
        ? await updateTransaction(editingTransaction.id, data)
        : await addTransaction(data);

      if (!result.success) {
        return result;
      }

      setShowForm(false);
      setEditingTransaction(null);
      return result;
    } catch {
      notifyError("We couldn't save this transaction. Please try again.");
      return { success: false };
    } finally {
      setIsSavingTransaction(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        importTransactions(String(event.target?.result || ""))
          .then((result) => {
            if (result.success) {
              setShowImport(false);
            }
          })
          .catch(() =>
            notifyError("We couldn't import these transactions. Please try again."),
          );
      };
      reader.onerror = () =>
        notifyError("We couldn't read that file. Select a valid CSV and try again.");
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    try {
      const csv = exportTransactions();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      notifySuccess("Transactions exported.");
    } catch {
      notifyError("We couldn't export your transactions. Please try again.");
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Transactions
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Manage your income and expenses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImport(true)}
            leftIcon={<Upload className="h-4 w-4" />}
          >
            Import CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            onClick={handleAdd}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Total Income
                </p>
                <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totals.income)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
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
                  Total Expenses
                </p>
                <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(totals.expenses)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Net Balance
                </p>
                <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(totals.balance)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
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
                  Savings Rate
                </p>
                <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totals.savingsRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TransactionList onEdit={handleEdit} />

      <TransactionForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTransaction}
        isLoading={isSavingTransaction || isTransactionsLoading}
      />

      <Modal
        isOpen={showImport}
        onClose={() => {
          setShowImport(false);
        }}
        title="Import Transactions"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Upload a CSV file with your transactions. The file should include
            columns for: Date, Title, Amount, Type, Category, Payment Method,
            Notes, Recurring.
          </p>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <Button
              variant="secondary"
              onClick={() => {
                setShowImport(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
