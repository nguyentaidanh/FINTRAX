import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { Account, AccountType } from '@/src/types/types';
import { toast } from '../ui/Toaster';
import { useI18n } from '../../hooks/useI18n';
import { formatCurrency } from '../../utils/formatters';
import Select from '../ui/Select';

const AccountIcon: React.FC<{type: AccountType}> = ({ type }) => {
    switch (type) {
        case AccountType.BANK:
            return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21V3"/><path d="M5 21V12a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9"/><path d="M2 21h20"/></svg>;
        case AccountType.CASH:
            return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M12 12h.01"/></svg>;
        case AccountType.E_WALLET:
            return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v2"/><path d="M22 6V4c0-1.1-.9-2-2-2H4C2.9 2 2 2.9 2 4v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-2"/><path d="M2 12h20"/></svg>;
        default: return null;
    }
}

const AccountsPage: React.FC = () => {
  const { accounts, addAccount, updateAccount, deleteAccount } = useData();
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Omit<Account, 'balance'> | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>(AccountType.BANK);
  const [initialBalance, setInitialBalance] = useState('0');
  
  const handleOpenModal = (account?: Account) => {
    if (account) {
      setAccountToEdit(account);
      setAccountName(account.name);
      setAccountType(account.type);
      setInitialBalance(String(account.initialBalance));
    } else {
      setAccountToEdit(null);
      setAccountName('');
      setAccountType(AccountType.BANK);
      setInitialBalance('0');
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName) {
      toast(t('accountNameRequired'), 'error');
      return;
    }
    
    const balanceValue = parseFloat(initialBalance);
    if (isNaN(balanceValue)) {
        toast(t('invalidInitialBalance'), 'error');
        return;
    }

    if (accountToEdit) {
      updateAccount({ ...accountToEdit, name: accountName, type: accountType, initialBalance: balanceValue });
      toast(t('accountUpdatedSuccess'), 'success');
    } else {
      addAccount({ name: accountName, type: accountType, initialBalance: balanceValue });
      toast(t('accountAddedSuccess'), 'success');
    }
    handleCloseModal();
  };

  const handleDelete = (accountId: string) => {
    if (window.confirm(t('confirmDeleteAccount'))) {
      const success = deleteAccount(accountId);
      if (success) {
        toast(t('accountDeletedSuccess'), 'success');
      } else {
        toast(t('cannotDeleteAccount'), 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(account => (
          <Card key={account.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{account.name}</CardTitle>
              <div className="text-slate-500 dark:text-slate-400"><AccountIcon type={account.type} /></div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-xs text-slate-500">{t(account.type.toLowerCase().replace(' ',''))}</p>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(account.balance)}</p>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleOpenModal(account)}>{t('edit')}</Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(account.id)}>{t('delete')}</Button>
            </CardFooter>
          </Card>
        ))}
         <Card 
            className="flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors cursor-pointer min-h-[200px]"
            onClick={() => handleOpenModal()}
          >
            <div className="text-center text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-8 w-8 mb-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <p className="font-semibold">{t('addAccount')}</p>
            </div>
        </Card>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={accountToEdit ? t('editAccount') : t('addAccount')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="accountName" className="block text-sm font-medium mb-1">{t('accountName')}</label>
            <Input id="accountName" type="text" value={accountName} onChange={e => setAccountName(e.target.value)} placeholder={t('accountNamePlaceholder')} required/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('accountType')}</label>
            <Select value={accountType} onChange={e => setAccountType(e.target.value as AccountType)}>
                {Object.values(AccountType).map(type => (
                    // FIX: Ensure i18n key is properly formatted without spaces.
                    <option key={type} value={type}>{t(type.toLowerCase().replace(/ /g,''))}</option>
                ))}
            </Select>
          </div>
          <div>
            <label htmlFor="initialBalance" className="block text-sm font-medium mb-1">{t('initialBalance')}</label>
            <Input id="initialBalance" type="number" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} step="0.01" required/>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>{t('cancel')}</Button>
            <Button type="submit">{accountToEdit ? t('saveChanges') : t('addAccount')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AccountsPage;