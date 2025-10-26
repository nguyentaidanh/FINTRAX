
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../hooks/useData';
import TransactionList from '../TransactionList';
import Card, { CardHeader, CardContent, CardFooter } from '../ui/Card';
import AddTransactionModal from '../AddTransactionModal';
import { Transaction, TransactionType, TransactionStatus, Tag } from '@/src/types/types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { toast } from '../ui/Toaster';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { useI18n } from '../../hooks/useI18n';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import TransactionDetailModal from '../TransactionDetailModal';
import Pagination from '../ui/Pagination';
import { useAuth } from '../../hooks/useAuth';

type SortKey = 'description' | 'amount' | 'date' | 'status';
type SortDirection = 'asc' | 'desc';

const IconX = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const TransactionsPage: React.FC = () => {
  const { transactions, getTagById, getAccountById, tags, importTransactions, deleteMultipleTransactions } = useData();
  const { currentUser } = useAuth();
  const { t } = useI18n();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);

  // Filters
  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination
  const itemsPerPage = currentUser?.notificationSettings?.pagination?.itemsPerPage || 10;
  const [currentPage, setCurrentPage] = useState(1);

  const sortedAndFilteredTransactions = useMemo(() => {
    let filtered = transactions.filter(t => {
      const textMatch = t.description.toLowerCase().includes(filterText.toLowerCase());
      const typeMatch = filterType === 'all' || t.type === filterType;
      const startDateMatch = !filterStartDate || new Date(t.date) >= new Date(filterStartDate);
      const endDateMatch = !filterEndDate || new Date(t.date) <= new Date(filterEndDate);
      const minAmountMatch = !filterMinAmount || t.amount >= parseFloat(filterMinAmount);
      const maxAmountMatch = !filterMaxAmount || t.amount <= parseFloat(filterMaxAmount);
      const tagsMatch = filterTags.length === 0 || filterTags.every(tagId => t.tags.includes(tagId));

      return textMatch && typeMatch && startDateMatch && endDateMatch && minAmountMatch && maxAmountMatch && tagsMatch;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'date': comparison = new Date(b.date).getTime() - new Date(a.date).getTime(); break;
        case 'amount': comparison = b.amount - a.amount; break;
        case 'description': comparison = a.description.localeCompare(b.description); break;
        case 'status': comparison = a.status.localeCompare(b.status); break;
        default: return 0;
      }
      return sortDirection === 'asc' ? comparison * -1 : comparison;
    });
  }, [transactions, filterText, filterType, sortKey, sortDirection, filterStartDate, filterEndDate, filterMinAmount, filterMaxAmount, filterTags]);
  
  const totalPages = Math.ceil(sortedAndFilteredTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedAndFilteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, filterType, filterStartDate, filterEndDate, filterMinAmount, filterMaxAmount, filterTags]);
  
  // Clear selection when filters or page change to avoid confusion
  useEffect(() => {
    setSelectedTransactionIds([]);
  }, [filterText, filterType, filterStartDate, filterEndDate, filterMinAmount, filterMaxAmount, filterTags, currentPage]);

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };
  
  const handleStartEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(false);
    setIsAddModalOpen(true);
  };
  
  const handleOpenAddModal = () => {
    setSelectedTransaction(null);
    setIsAddModalOpen(true);
  };
  
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection(key === 'date' ? 'desc' : 'asc');
    }
  };
  
  const handleTagFilterToggle = (tagId: string) => {
      setFilterTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  }

  const handleExportCSV = () => {
    if (sortedAndFilteredTransactions.length === 0) {
      toast(t('noTransactionsToExport'), 'info');
      return;
    }
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Status', 'Account', 'Tags'];
    const rows = sortedAndFilteredTransactions.map(t => {
      const tagNames = t.tags.map(tagId => getTagById(tagId)?.name || 'Unknown').join('; ');
      const accountName = getAccountById(t.accountId)?.name || 'Unknown';
      return [formatDate(t.date), t.description, t.amount, t.type, t.category || '', t.status, accountName, tagNames]
        .map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast(t('csvExportStarted'), 'success');
  };
  
  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            // A simple CSV parser. Assumes specific column order and no commas in fields.
            const rows = text.split('\n').slice(1); // Skip header
            const newTransactions = rows.filter(row => row.trim() !== '').map(row => {
                const [date, description, amount, type, category, status, accountName, tagsStr] = row.split(',');
                // This is a simplified import. A real app would need more robust validation and mapping.
                const account = tags.find(t => t.name === accountName.trim());
                const importedTags = tagsStr.split(';').map(tn => tags.find(t => t.name === tn.trim())?.id).filter(Boolean) as string[];

                return {
                    date: new Date(date).toISOString(),
                    description,
                    amount: parseFloat(amount),
                    type: type as TransactionType,
                    category,
                    status: status as TransactionStatus,
                    accountId: account ? account.id : '',
                    tags: importedTags,
                } as Omit<Transaction, 'id'>;
            });

            importTransactions(newTransactions);
            toast(`${newTransactions.length} ${t('transactionsImported')}`, 'success');
            setIsImportModalOpen(false);
        } catch (error) {
            toast(t('csvImportError'), 'error');
            console.error(error);
        }
    };
    reader.readAsText(file);
  }

  const handleBulkDelete = () => {
    const confirmationMessage = t('confirmBulkDelete').replace('{count}', String(selectedTransactionIds.length));
    if (window.confirm(confirmationMessage)) {
      deleteMultipleTransactions(selectedTransactionIds);
      toast(t('bulkDeleteSuccess'), 'success');
      setSelectedTransactionIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {selectedTransactionIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border dark:border-slate-700 animate-fade-in">
          <span className="text-sm font-medium">
            {selectedTransactionIds.length} {t('selected')}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              {t('deleteSelected')}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedTransactionIds([])} aria-label="Clear selection">
              <IconX />
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input placeholder={t('filterByDescription')} value={filterText} onChange={e => setFilterText(e.target.value)} />
                    <Select value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="all">{t('allTypes')}</option>
                        <option value="income">{t('income')}</option>
                        <option value="expense">{t('expense')}</option>
                    </Select>
                    <Input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
                    <Input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
                    <Input type="number" placeholder={t('minAmount')} value={filterMinAmount} onChange={e => setFilterMinAmount(e.target.value)} />
                    <Input type="number" placeholder={t('maxAmount')} value={filterMaxAmount} onChange={e => setFilterMaxAmount(e.target.value)} />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">{t('filterByTags')}</label>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md dark:border-slate-700">
                        {tags.map(tag => (
                          <button key={tag.id} type="button" onClick={() => handleTagFilterToggle(tag.id)}>
                            <Badge style={{ backgroundColor: tag.color, color: '#fff' }} className={`cursor-pointer ${filterTags.includes(tag.id) ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-slate-800' : 'opacity-60 hover:opacity-100'}`}>
                              {tag.name}
                            </Badge>
                          </button>
                        ))}
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <TransactionList 
            transactions={paginatedTransactions} 
            onViewDetails={handleViewDetails} 
            onSort={handleSort} 
            sortKey={sortKey} 
            sortDirection={sortDirection}
            selectedIds={selectedTransactionIds}
            onSelectionChange={setSelectedTransactionIds}
          />
        </CardContent>
        {totalPages > 1 && (
            <CardFooter className="p-0">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </CardFooter>
        )}
      </Card>

      <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} transactionToEdit={selectedTransaction}/>
      
      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        transaction={selectedTransaction}
        onEdit={handleStartEdit}
      />

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title={t('importTransactionsTitle')}>
        <div>
            <p className="text-sm text-slate-500 mb-4">{t('importInstructions')}</p>
            <Input type="file" accept=".csv" onChange={e => e.target.files && handleImportFile(e.target.files[0])} />
            <p className="text-xs text-slate-400 mt-2">{t('csvFormatNote')}</p>
        </div>
      </Modal>
    </div>
  );
};

export default TransactionsPage;
