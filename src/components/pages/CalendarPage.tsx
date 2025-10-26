import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { Transaction, TransactionType } from '@/src/types/types';
// FIX: Changed date-fns imports to use submodule imports to resolve module resolution errors.
import { format, endOfMonth, endOfWeek, eachDayOfInterval, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import Button from '../ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Modal from '../ui/Modal';
import { useI18n } from '../../hooks/useI18n';
import TransactionList from '../TransactionList';
import AddTransactionModal from '../AddTransactionModal';
import { formatDate } from '../../utils/formatters';
import TransactionDetailModal from '../TransactionDetailModal';
// Remove duplicate import as startOfWeek is already imported in the date-fns imports above
import { enUS, vi } from 'date-fns/locale';

const CalendarPage: React.FC = () => {
  const { transactions } = useData();
  const { t, locale } = useI18n();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isAddTxnModalOpen, setIsAddTxnModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const transactionsByDate = useMemo(() => {
    const grouped: { [key: string]: Transaction[] } = {};
    transactions.forEach(t => {
      const dateKey = format(new Date(t.date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(t);
    });
    return grouped;
  }, [transactions]);

  const dateFnsLocale = locale === 'vi' ? vi : enUS;

  const start = startOfWeek(startOfMonth(currentDate), { locale: dateFnsLocale });
  const end = endOfWeek(endOfMonth(currentDate), { locale: dateFnsLocale });
  const days = eachDayOfInterval({ start, end });

  const nextMonth = () => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() - 1)));

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsDayModalOpen(true);
  };
  
  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDayModalOpen(false); // Close day detail modal
    setIsDetailModalOpen(true); // Open transaction detail modal
  };

  const handleStartEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(false); // Close detail modal
    setIsAddTxnModalOpen(true); // Open edit modal
  };
  
  const weekDays = [...Array(7).keys()].map(i => {
    const date = startOfWeek(new Date(), { locale: dateFnsLocale });
    date.setDate(date.getDate() + i);
    return format(date, 'EEE', { locale: dateFnsLocale });
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <Button variant="ghost" onClick={prevMonth}>&lt;</Button>
          <CardTitle className="text-xl text-center sm:text-left">{format(currentDate, 'MMMM yyyy', { locale: dateFnsLocale })}</CardTitle>
          <Button variant="ghost" onClick={nextMonth}>&gt;</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs sm:text-sm text-slate-500 border-b pb-2 mb-2">
            {weekDays.map(dayName => <div key={dayName}>{dayName}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayTransactions = transactionsByDate[dateKey] || [];
              const income = dayTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
              const expense = dayTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);

              return (
                <div
                  key={day.toString()}
                  onClick={() => handleDayClick(day)}
                  className={`
                    h-20 sm:h-28 rounded-md p-1 sm:p-2 flex flex-col cursor-pointer transition-colors
                    ${!isSameMonth(day, currentDate) ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500' : 'bg-white dark:bg-slate-800'}
                    ${isToday(day) ? 'border-2 border-primary-500' : 'border border-slate-200 dark:border-slate-700'}
                    hover:bg-slate-100 dark:hover:bg-slate-700
                  `}
                >
                  <span className={`font-semibold text-sm ${isToday(day) ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-auto text-[10px] sm:text-xs overflow-hidden">
                    {income > 0 && <div className="text-green-500 truncate">+ {income.toFixed(0)}</div>}
                    {expense > 0 && <div className="text-red-500 truncate">- {expense.toFixed(0)}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Modal isOpen={isDayModalOpen} onClose={() => setIsDayModalOpen(false)} title={`${t('transactionsFor')} ${formatDate(selectedDate.toISOString())}`}>
          <TransactionList transactions={transactionsByDate[format(selectedDate, 'yyyy-MM-dd')] || []} onViewDetails={handleViewDetails} />
        </Modal>
      )}

      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
            setIsDetailModalOpen(false);
            if (selectedDate) setIsDayModalOpen(true); // Re-open day modal
        }}
        transaction={selectedTransaction}
        onEdit={handleStartEdit}
      />

      <AddTransactionModal 
        isOpen={isAddTxnModalOpen} 
        onClose={() => {
          setIsAddTxnModalOpen(false);
          setSelectedTransaction(null);
        }} 
        transactionToEdit={selectedTransaction}
      />
    </div>
  );
};

export default CalendarPage;