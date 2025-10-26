import React from 'react';
import Modal from './ui/Modal';
import { useI18n } from '../hooks/useI18n';
import { formatCurrency } from '../utils/formatters';
import { Account, AccountType } from '../types/types';

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

interface AccountBalancesModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
}

const AccountBalancesModal: React.FC<AccountBalancesModalProps> = ({ isOpen, onClose, accounts }) => {
  const { t } = useI18n();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('accountBalances')}>
      <div className="space-y-4">
        <ul className="divide-y divide-slate-200 dark:divide-slate-700 -mt-6">
          {accounts.map(account => (
            <li key={account.id} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-slate-500 dark:text-slate-400">
                    <AccountIcon type={account.type} />
                </span>
                <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{account.name}</p>
                    <p className="text-sm text-slate-500">{t(account.type.toLowerCase().replace(/ /g,''))}</p>
                </div>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {formatCurrency(account.balance)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
};

export default AccountBalancesModal;