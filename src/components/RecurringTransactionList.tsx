import React from 'react';
import { RecurringTransaction, TransactionType, Frequency } from '../types/types';
import { useData } from '../hooks/useData';
import { formatCurrency, formatDate } from '../utils/formatters';
import Button from './ui/Button';
import { useI18n } from '../hooks/useI18n';
import { toast } from './ui/Toaster';
// FIX: Changed date-fns deep imports to top-level imports to resolve "not callable" errors.
import { addDays, addMonths, addWeeks } from 'date-fns';

interface RecurringTransactionListProps {
  recurringTransactions: RecurringTransaction[];
  onEdit: (template: RecurringTransaction) => void;
}

const getNextDueDate = (template: RecurringTransaction): Date => {
  const lastDate = new Date(template.lastGeneratedDate);
  switch (template.frequency) {
    case Frequency.DAILY: return addDays(lastDate, 1);
    case Frequency.WEEKLY: return addWeeks(lastDate, 1);
    case Frequency.MONTHLY: return addMonths(lastDate, 1);
    default: return lastDate;
  }
};

const RecurringTransactionList: React.FC<RecurringTransactionListProps> = ({ recurringTransactions, onEdit }) => {
  const { deleteRecurringTransaction, getAccountById } = useData();
  const { t } = useI18n();

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDeleteRecurring'))) {
      deleteRecurringTransaction(id);
      toast(t('recurringTransactionDeletedSuccess'), 'success');
    }
  };
  
  if (recurringTransactions.length === 0) {
    return <p className="text-slate-500 text-center py-8">{t('noRecurringFound')}</p>
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-700/70">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('thDescription')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('thAmount')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('frequency')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('nextDueDate')}</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('thActions')}</span></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {recurringTransactions.map((template) => {
            const account = getAccountById(template.accountId);
            const nextDueDate = getNextDueDate(template);
            return (
              <tr key={template.id}>
                <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{template.description}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {account ? account.name : 'N/A'}
                    </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${template.type === TransactionType.INCOME ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(template.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{t(template.frequency.toLowerCase())}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(nextDueDate.toISOString())}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                   <Button variant="ghost" size="sm" onClick={() => onEdit(template)}>{t('edit')}</Button>
                   <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 dark:hover:text-red-400" onClick={() => handleDelete(template.id)}>{t('delete')}</Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecurringTransactionList;