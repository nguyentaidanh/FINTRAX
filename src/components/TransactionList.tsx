
import React, { useState } from 'react';
import { Transaction, TransactionType, TransactionStatus } from '../types/types';
import { useData } from '../hooks/useData';
import { formatCurrency, formatDate } from '../utils/formatters';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { useI18n } from '../hooks/useI18n';
import Modal from './ui/Modal';
import { toast } from './ui/Toaster';

type SortKey = 'description' | 'amount' | 'date' | 'status';
type SortDirection = 'asc' | 'desc';

interface TransactionListProps {
  transactions: Transaction[];
  onViewDetails: (transaction: Transaction) => void;
  onSort?: (key: SortKey) => void;
  sortKey?: SortKey;
  sortDirection?: SortDirection;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

const getStatusBadgeClass = (status: TransactionStatus) => {
    switch (status) {
        case TransactionStatus.PAID: return 'bg-green-500 text-white';
        case TransactionStatus.UNPAID: return 'bg-yellow-500 text-white';
        case TransactionStatus.DEBT: return 'bg-red-500 text-white';
        case TransactionStatus.INSTALLMENT: return 'bg-blue-500 text-white';
        default: return 'bg-slate-500 text-white';
    }
}

const IconPaperclip = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>;

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onViewDetails, onSort, sortKey, sortDirection, selectedIds, onSelectionChange }) => {
  const { deleteTransaction, getTagById, getAccountById } = useData();
  const { t } = useI18n();
  const displayedTransactions = transactions;
  
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [transactionToDeleteId, setTransactionToDeleteId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setTransactionToDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (transactionToDeleteId) {
      deleteTransaction(transactionToDeleteId);
      toast(t('transactionDeletedSuccess'), 'success');
    }
    setIsDeleteConfirmOpen(false);
    setTransactionToDeleteId(null);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange && selectedIds) {
      const pageIds = displayedTransactions.map(t => t.id);
      if (e.target.checked) {
        const newSelection = [...new Set([...selectedIds, ...pageIds])];
        onSelectionChange(newSelection);
      } else {
        onSelectionChange(selectedIds.filter(id => !pageIds.includes(id)));
      }
    }
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (onSelectionChange && selectedIds) {
      if (e.target.checked) {
        onSelectionChange([...selectedIds, id]);
      } else {
        onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
      }
    }
  };

  if (displayedTransactions.length === 0) {
    return <p className="text-slate-500 text-center py-8">{t('noTransactionsFound')}</p>
  }

  const SortableHeader: React.FC<{ sortableKey: SortKey; translationKey: string; }> = ({ sortableKey, translationKey }) => {
    if (!onSort) {
      return <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t(translationKey)}</th>;
    }
    
    const isActive = sortKey === sortableKey;
    const icon = isActive ? (sortDirection === 'asc' ? '▲' : '▼') : '';

    return (
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" onClick={() => onSort(sortableKey)} aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <div className="flex items-center">{t(translationKey)}{isActive && <span className="ml-1 text-[10px]">{icon}</span>}</div>
      </th>
    );
  };

  const allOnPageSelected = displayedTransactions.length > 0 && displayedTransactions.every(t => selectedIds?.includes(t.id));
  const someOnPageSelected = displayedTransactions.some(t => selectedIds?.includes(t.id)) && !allOnPageSelected;
  
  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700/70">
            <tr>
              {onSelectionChange && (
                <th scope="col" className="px-6 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 dark:bg-slate-700 dark:checked:bg-primary-500"
                    checked={!!allOnPageSelected}
                    ref={el => { if (el) el.indeterminate = !!someOnPageSelected; }}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              <SortableHeader sortableKey="description" translationKey="thDescription" />
              <SortableHeader sortableKey="amount" translationKey="thAmount" />
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('thTags')}</th>
              <SortableHeader sortableKey="date" translationKey="thDate" />
              <SortableHeader sortableKey="status" translationKey="thStatus" />
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('thActions')}</span></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {displayedTransactions.map((transaction) => {
              const account = getAccountById(transaction.accountId);
              return (
                <tr 
                  key={transaction.id} 
                  onClick={() => onViewDetails(transaction)} 
                  className={`transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selectedIds?.includes(transaction.id) ? 'bg-primary-50 dark:bg-slate-700' : ''}`}
                >
                  {onSelectionChange && (
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 dark:bg-slate-700 dark:checked:bg-primary-500"
                        checked={selectedIds?.includes(transaction.id)}
                        onChange={(e) => handleSelectOne(e, transaction.id)}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                        {transaction.attachmentUrl && (
                            <a href={transaction.attachmentUrl} target="_blank" rel="noopener noreferrer" className="mr-2 text-slate-400 hover:text-primary-500" onClick={(e) => e.stopPropagation()}>
                                <IconPaperclip />
                            </a>
                        )}
                        <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{transaction.description}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {account ? `${account.name} · ${formatCurrency(account.balance)}` : 'N/A'}
                            </div>
                        </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${transaction.type === TransactionType.INCOME ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {transaction.tags.map(tagId => {
                        const tag = getTagById(tagId);
                        if (!tag) return null;
                        return <Badge key={tag.id} style={{ backgroundColor: tag.color, color: '#fff' }}>{tag.name}</Badge>
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(transaction.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Badge className={getStatusBadgeClass(transaction.status)}>{t(transaction.status.toLowerCase())}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2" onClick={(e) => e.stopPropagation()}>
                     <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 dark:hover:text-red-400" onClick={() => handleDeleteClick(transaction.id)}>{t('delete')}</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title={t('confirmDeletionTitle')}>
        <div>
          <p>{t('confirmDeleteTransaction')}</p>
          <div className="flex justify-end space-x-2 pt-6">
            <Button type="button" variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>{t('cancel')}</Button>
            <Button type="button" variant="destructive" onClick={handleConfirmDelete}>{t('delete')}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TransactionList;
