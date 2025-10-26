import React, { useState, useEffect } from 'react';
import { RecurringTransaction, TransactionType, ExpenseCategory, Frequency } from '../types/types';
import { useData } from '../hooks/useData';
import { toast } from './ui/Toaster';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Badge from './ui/Badge';
import { useI18n } from '../hooks/useI18n';
import { subDays } from 'date-fns/subDays';
// FIX: Changed date-fns import to use submodule import for compatibility.

interface AddRecurringTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateToEdit?: RecurringTransaction | null;
}

const AddRecurringTransactionModal: React.FC<AddRecurringTransactionModalProps> = ({ isOpen, onClose, templateToEdit }) => {
  const { addRecurringTransaction, updateRecurringTransaction, tags, accounts } = useData();
  const { t } = useI18n();
  
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.FLEXIBLE);
  const [accountId, setAccountId] = useState<string>('');
  const [frequency, setFrequency] = useState<Frequency>(Frequency.MONTHLY);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (templateToEdit) {
      setType(templateToEdit.type);
      setAmount(String(templateToEdit.amount));
      setDescription(templateToEdit.description);
      setSelectedTags(templateToEdit.tags);
      setCategory(templateToEdit.category || ExpenseCategory.FLEXIBLE);
      setAccountId(templateToEdit.accountId);
      setFrequency(templateToEdit.frequency);
      setStartDate(new Date(templateToEdit.startDate).toISOString().split('T')[0]);
      setEndDate(templateToEdit.endDate ? new Date(templateToEdit.endDate).toISOString().split('T')[0] : '');
    } else {
      // Reset form
      setType(TransactionType.EXPENSE);
      setAmount('');
      setDescription('');
      setSelectedTags([]);
      setCategory(ExpenseCategory.FLEXIBLE);
      setAccountId(accounts.length > 0 ? accounts[0].id : '');
      setFrequency(Frequency.MONTHLY);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
    }
  }, [templateToEdit, isOpen, accounts]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || selectedTags.length === 0 || !accountId || !startDate) {
      toast(t('fillRequiredFields'), 'error');
      return;
    }

    const numAmount = parseFloat(amount);
    
    // Set lastGeneratedDate to the day before the start date so the first occurrence is generated correctly.
    const lastGeneratedDate = subDays(new Date(startDate), 1).toISOString();
    
    const recurringData = {
      type,
      amount: numAmount,
      description,
      tags: selectedTags,
      accountId,
      frequency,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : null,
      lastGeneratedDate,
      ...(type === TransactionType.EXPENSE && { category }),
    };

    if (templateToEdit) {
      // For updates, we should preserve the original lastGeneratedDate if the schedule hasn't changed fundamentally
      const updatedData = { ...templateToEdit, ...recurringData, lastGeneratedDate: templateToEdit.lastGeneratedDate };
      updateRecurringTransaction(updatedData);
      toast(t('recurringTransactionUpdatedSuccess'), 'success');
    } else {
      addRecurringTransaction(recurringData);
      toast(t('recurringTransactionAddedSuccess'), 'success');
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={templateToEdit ? t('editRecurring') : t('addRecurring')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('account')}</label>
              <Select value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
                <option value="" disabled>{t('selectAccount')}</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('type')}</label>
              <Select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
                <option value={TransactionType.EXPENSE}>{t('expense')}</option>
                <option value={TransactionType.INCOME}>{t('income')}</option>
              </Select>
            </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('description')}</label>
          <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Monthly Rent" required />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('amount')}</label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('frequency')}</label>
              <Select value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
                {Object.values(Frequency).map(f => <option key={f} value={f}>{t(f.toLowerCase())}</option>)}
              </Select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('startDate')}</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('endDate')}</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
        </div>
        
        {type === TransactionType.EXPENSE && (
          <div>
            <label className="block text-sm font-medium mb-1">{t('category')}</label>
            <Select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
              {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{t(cat)}</option>)}
            </Select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">{t('tags')}</label>
          <div className="flex flex-wrap gap-2 p-2 border rounded-md dark:border-slate-700 max-h-28 overflow-y-auto">
            {tags.length > 0 ? tags.map(tag => (
              <button key={tag.id} type="button" onClick={() => handleTagToggle(tag.id)}>
                <Badge
                  style={{ backgroundColor: tag.color, color: '#fff' }}
                  className={`cursor-pointer ${selectedTags.includes(tag.id) ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-slate-800' : 'opacity-60 hover:opacity-100'}`}
                >
                  {tag.name}
                </Badge>
              </button>
            )) : <p className="text-xs text-slate-500">{t('noTagsAvailable')}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button type="submit">{templateToEdit ? t('saveChanges') : t('addRecurring')}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddRecurringTransactionModal;