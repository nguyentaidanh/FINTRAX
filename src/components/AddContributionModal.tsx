import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { useI18n } from '../hooks/useI18n';
import { toast } from './ui/Toaster';
import { formatCurrency } from '../utils/formatters';
import Select from './ui/Select';
import { Goal } from '../types/types';

interface AddContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
}

const AddContributionModal: React.FC<AddContributionModalProps> = ({ isOpen, onClose, goal }) => {
  const { accounts, addOrRemoveGoalContribution } = useData();
  const { t } = useI18n();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'increase' | 'decrease'>('increase');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [validationMessage, setValidationMessage] = useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setType('increase');
      setValidationMessage('');
      setIsSubmitDisabled(false);
      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      } else {
        setSelectedAccountId('');
      }
    }
  }, [isOpen, accounts]);

  useEffect(() => {
    if (!goal) return;

    setValidationMessage('');
    setIsSubmitDisabled(false);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

    if (type === 'increase') {
        if (selectedAccount && numAmount > selectedAccount.balance) {
            setValidationMessage(t('insufficientFunds').replace('{accountName}', selectedAccount.name));
            setIsSubmitDisabled(true);
            return;
        }
        
        const remaining = goal.targetAmount - goal.currentAmount;
        if (remaining > 0 && numAmount > remaining) {
            setValidationMessage(t('contributionAdjustedIncrease').replace('{amount}', formatCurrency(remaining)));
        }

    } else { // decrease
        const maxWithdrawal = goal.currentAmount;
        if (numAmount > maxWithdrawal) {
            setValidationMessage(t('contributionAdjustedDecrease').replace('{amount}', formatCurrency(maxWithdrawal)));
        }
    }
  }, [amount, type, selectedAccountId, goal, accounts, t]);


  if (!goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contributionAmount = parseFloat(amount);
    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      toast('Please enter a valid contribution amount.', 'error');
      return;
    }
    if (!selectedAccountId) {
        toast('Please select an account.', 'error');
        return;
    }
    
    addOrRemoveGoalContribution(goal.id, contributionAmount, selectedAccountId, type);
    
    toast(t('contributionSuccess'), 'success');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('manageContribution')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex rounded-md shadow-sm bg-white dark:bg-slate-900">
            <button
                type="button"
                onClick={() => setType('increase')}
                className={`px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-l-md w-1/2 transition-colors ${type === 'increase' ? 'bg-primary-600 text-white border-primary-600' : 'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
                {t('increase')}
            </button>
            <button
                type="button"
                onClick={() => setType('decrease')}
                className={`px-4 py-2 text-sm font-medium border-t border-b border-r border-slate-300 dark:border-slate-600 rounded-r-md w-1/2 transition-colors ${type === 'decrease' ? 'bg-primary-600 text-white border-primary-600' : 'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
                {t('decrease')}
            </button>
        </div>

        <div>
          <label htmlFor="contributionAmount" className="block text-sm font-medium mb-1">{t('contributionAmount')}</label>
          <Input 
            id="contributionAmount" 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            placeholder="0.00" 
            step="0.01"
            required 
            autoFocus
          />
          {validationMessage && (
            <p className={`text-xs mt-2 ${isSubmitDisabled ? 'text-red-500' : 'text-slate-500'}`}>
                {validationMessage}
            </p>
          )}
        </div>

        <div>
            <label htmlFor="account" className="block text-sm font-medium mb-1">{t('account')}</label>
            <Select id="account" value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} required>
            {accounts.length > 0 ? (
                accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>)
            ) : (
                <option value="" disabled>No accounts available</option>
            )}
            </Select>
        </div>
        
        <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('contributionCreatesTransaction').replace('{type}', type === 'increase' ? t('expense') : t('income'))}
        </p>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button type="submit" disabled={!selectedAccountId || isSubmitDisabled}>{t('confirm')}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddContributionModal;
