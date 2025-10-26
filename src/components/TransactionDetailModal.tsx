import React from 'react';
import { Transaction, TransactionType, TransactionStatus } from '../types/types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useI18n } from '../hooks/useI18n';
import { formatCurrency, formatDate } from '../utils/formatters';
import Badge from './ui/Badge';
import { useData } from '../hooks/useData';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
  transaction: Transaction | null;
}

const IconArrowUpRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>;
const IconArrowDownLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="7" x2="7" y2="17"></line><polyline points="17 17 7 17 7 7"></polyline></svg>;

const getStatusBadgeClass = (status: TransactionStatus) => {
    switch (status) {
        case TransactionStatus.PAID: return 'bg-green-500 text-white';
        case TransactionStatus.UNPAID: return 'bg-yellow-500 text-white';
        case TransactionStatus.DEBT: return 'bg-red-500 text-white';
        case TransactionStatus.INSTALLMENT: return 'bg-blue-500 text-white';
        default: return 'bg-slate-500 text-white';
    }
}

// FIX: Update DetailItem to accept and apply a className prop.
const DetailItem: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
    <div className={className}>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{children}</div>
    </div>
);

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ isOpen, onClose, onEdit, transaction }) => {
  const { t } = useI18n();
  const { getTagById, getAccountById } = useData();

  if (!transaction) return null;
  
  const account = getAccountById(transaction.accountId);
  const isIncome = transaction.type === TransactionType.INCOME;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('transactionDetails')}>
      <div className="space-y-6">
        {/* --- Header Section --- */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isIncome ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                {isIncome ? <IconArrowUpRight className="w-6 h-6 text-green-500" /> : <IconArrowDownLeft className="w-6 h-6 text-red-500" />}
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{transaction.description}</h3>
                <p className={`font-bold text-3xl mt-1 ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                    {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                </p>
            </div>
        </div>

        {/* --- Details Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm border-t dark:border-slate-700 pt-4">
          <DetailItem label={t('account')}>{account?.name || 'N/A'}</DetailItem>
          <DetailItem label={t('date')}>{formatDate(transaction.date)}</DetailItem>
          <DetailItem label={t('status')}>
            <Badge className={getStatusBadgeClass(transaction.status)}>{t(transaction.status.toLowerCase())}</Badge>
          </DetailItem>
          {transaction.type === TransactionType.EXPENSE && transaction.category && (
            <DetailItem label={t('category')}>{t(transaction.category.toLowerCase())}</DetailItem>
          )}
          {transaction.type === TransactionType.INCOME && transaction.taxPercent != null && (
            <DetailItem label={t('taxPercent')}>{transaction.taxPercent}%</DetailItem>
          )}
           {transaction.type === TransactionType.INCOME && transaction.amountAfterTax != null && (
            <DetailItem label="Amount After Tax">{formatCurrency(transaction.amountAfterTax)}</DetailItem>
          )}
           <DetailItem label={t('tags')} className="sm:col-span-2">
                <div className="flex flex-wrap gap-1">
                    {transaction.tags.map(tagId => {
                        const tag = getTagById(tagId);
                        if (!tag) return null;
                        return <Badge key={tag.id} style={{ backgroundColor: tag.color, color: '#fff' }}>{tag.name}</Badge>
                    })}
                </div>
          </DetailItem>
        </div>

        {/* --- Attachment Section --- */}
        {transaction.attachmentUrl && (
          <div className="border-t dark:border-slate-700 pt-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('attachment')}</p>
            {transaction.attachmentUrl.startsWith('data:image/') ? (
              <a href={transaction.attachmentUrl} target="_blank" rel="noopener noreferrer" title="View full image">
                <img 
                  src={transaction.attachmentUrl} 
                  alt={t('attachment')} 
                  className="mt-1 rounded-md max-w-full h-auto max-h-64 object-contain border dark:border-slate-700 cursor-pointer hover:opacity-90 transition-opacity bg-slate-50 dark:bg-slate-900/50" 
                />
              </a>
            ) : (
              <a href={transaction.attachmentUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 hover:underline">{t('viewAttachment')}</a>
            )}
          </div>
        )}

        {/* --- History Timeline --- */}
        {(transaction.history || []).length > 0 && (
            <div className="border-t dark:border-slate-700 pt-4">
              <h4 className="font-semibold mb-4 text-slate-800 dark:text-slate-200">{t('history')}</h4>
              <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-6">
                {(transaction.history || []).map((entry, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-[35px] top-1.5 w-4 h-4 bg-primary-500 rounded-full border-4 border-white dark:border-slate-800"></div>
                    <p className="font-medium text-sm text-slate-700 dark:text-slate-300">{entry.change}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatDate(entry.date)}</p>
                  </div>
                ))}
              </div>
            </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-6 mt-4 border-t dark:border-slate-700">
        <Button variant="outline" onClick={onClose}>{t('close')}</Button>
        <Button onClick={() => onEdit(transaction)}>{t('edit')}</Button>
      </div>
    </Modal>
  );
};

export default TransactionDetailModal;
