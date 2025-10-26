import React, { useState, useEffect } from 'react';
import { Goal, GoalStatus } from '../types/types';
import { useData } from '../hooks/useData';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { useI18n } from '../hooks/useI18n';
import { toast } from './ui/Toaster';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit: Goal | null;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, goalToEdit }) => {
  const { addGoal, updateGoal } = useData();
  const { t } = useI18n();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('🎯');

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setDescription(goalToEdit.description || '');
      setTargetAmount(String(goalToEdit.targetAmount));
      setCurrentAmount(String(goalToEdit.currentAmount));
      setDeadline(new Date(goalToEdit.deadline).toISOString().split('T')[0]);
      setIcon(goalToEdit.icon);
    } else {
      setName('');
      setDescription('');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('');
      setIcon('🎯');
    }
  }, [goalToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline) {
      toast(t('fillRequiredFields'), 'error');
      return;
    }

    const goalData = {
      name,
      description,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      deadline: new Date(deadline).toISOString(),
      icon,
    };

    if (goalToEdit) {
      updateGoal({ ...goalToEdit, ...goalData });
      toast(t('goalUpdatedSuccess'), 'success');
    } else {
      addGoal(goalData);
      toast(t('goalAddedSuccess'), 'success');
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goalToEdit ? t('editGoal') : t('addNewGoal')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="goalName" className="block text-sm font-medium mb-1">{t('goalName')}</label>
          <Input id="goalName" type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('goalNamePlaceholder')} required />
        </div>
        <div>
            <label htmlFor="goalDescription" className="block text-sm font-medium mb-1">{t('description')}</label>
            <textarea
                id="goalDescription"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add a short note about your goal..."
                rows={3}
                className="flex w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-primary-500 dark:focus:ring-offset-slate-900"
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="targetAmount" className="block text-sm font-medium mb-1">{t('targetAmount')}</label>
            <Input id="targetAmount" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="0.00" required step="0.01" />
          </div>
          <div>
            <label htmlFor="currentAmount" className="block text-sm font-medium mb-1">{t('currentAmount')}</label>
            <Input id="currentAmount" type="number" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} placeholder="0.00" required step="0.01" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium mb-1">{t('deadline')}</label>
              <Input id="deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="icon" className="block text-sm font-medium mb-1">Icon</label>
              <Input id="icon" type="text" value={icon} onChange={e => setIcon(e.target.value)} maxLength={2} />
            </div>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button type="submit">{goalToEdit ? t('saveChanges') : t('addNewGoal')}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddGoalModal;