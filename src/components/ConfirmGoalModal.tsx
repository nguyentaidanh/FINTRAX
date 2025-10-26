import React, { useState, useEffect } from 'react';
import { Goal } from '../types/types';
import { useData } from '../hooks/useData';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Select from './ui/Select';
import { useI18n } from '../hooks/useI18n';
import { toast } from './ui/Toaster';
import { formatCurrency } from '../utils/formatters';

interface ConfirmGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  goal: Goal | null;
}

const ConfirmGoalModal: React.FC<ConfirmGoalModalProps> = ({ isOpen, onClose, onConfirm, goal }) => {
  const { accounts, confirmGoalCompletion } = useData();
  const { t } = useI18n();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  useEffect(() => {
    if (accounts.length > 0) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, isOpen]);
  
  if (!goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) {
      toast('Please select an account.', 'error');
      return;
    }

    confirmGoalCompletion(goal.id, selectedAccountId);
    toast(t('goalCompletedAndTransactionCreated'), 'success');
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('confirmGoalCompletion')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p>
            {t('confirmGoalMessage').replace('{amount}', formatCurrency(goal.targetAmount))}
        </p>
        <div>
          <label htmlFor="account" className="block text-sm font-medium mb-1">{t('selectAccountForPayment')}</label>
          <Select id="account" value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} required>
            {accounts.length > 0 ? (
                accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>)
            ) : (
                <option value="" disabled>No accounts available</option>
            )}
          </Select>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button type="submit" disabled={!selectedAccountId}>{t('confirm')}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ConfirmGoalModal;