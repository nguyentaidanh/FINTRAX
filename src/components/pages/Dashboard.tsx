import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import MonthlyComparisonChart from '../charts/MonthlyComparisonChart';
import TagDistributionChart from '../charts/TagDistributionChart';
import TagSpendingTrendChart from '../charts/TagSpendingTrendChart';
import AddTransactionModal from '../AddTransactionModal';
import TransactionList from '../TransactionList';
import { Transaction, TransactionType } from '@/src/types/types';
import { formatCurrency } from '../../utils/formatters';
import { useI18n } from '../../hooks/useI18n';
import TransactionDetailModal from '../TransactionDetailModal';
import ComparisonCard from '../ComparisonCard';
// FIX: Changed date-fns imports to use submodule imports to resolve module resolution errors.
import { endOfMonth, endOfQuarter, isWithinInterval, startOfMonth, startOfQuarter, subMonths, subQuarters } from 'date-fns';

import GoalProgressChart from '../charts/GoalProgressChart';
import AccountBalancesModal from '../AccountBalancesModal';


const StatCard: React.FC<{ title: string; value: string; description: string, icon: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>> = ({ title, value, description, icon, ...props }) => (
  <Card {...props}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-slate-500">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </CardContent>
  </Card>
);

const IconWallet = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M4 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M18 12a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2Z"/></svg>;


const Dashboard: React.FC = () => {
  const { transactions, tags, goals, accounts } = useData();
  const { t } = useI18n();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAccountBalancesModalOpen, setIsAccountBalancesModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + (t.amountAfterTax ?? t.amount), 0);
    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const totalAssets = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    return { totalIncome, totalExpense, balance, totalAssets };
  }, [transactions, accounts]);
  
  const periodSummaries = useMemo(() => {
    const today = new Date();

    const calculateSummaryForPeriod = (startDate: Date, endDate: Date) => {
        const relevantTransactions = transactions.filter(t => isWithinInterval(new Date(t.date), { start: startDate, end: endDate }));
        const income = relevantTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + (t.amountAfterTax ?? t.amount), 0);
        const expense = relevantTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
        return { income, expense, balance: income - expense };
    };

    // Monthly
    const thisMonthStart = startOfMonth(today);
    const thisMonthEnd = endOfMonth(today);
    const lastMonthDate = subMonths(today, 1);
    const lastMonthStart = startOfMonth(lastMonthDate);
    const lastMonthEnd = endOfMonth(lastMonthDate);

    // Quarterly
    const thisQuarterStart = startOfQuarter(today);
    const thisQuarterEnd = endOfQuarter(today);
    const lastQuarterDate = subQuarters(today, 1);
    const lastQuarterStart = startOfQuarter(lastQuarterDate);
    const lastQuarterEnd = endOfQuarter(lastQuarterDate);

    return {
      thisMonth: calculateSummaryForPeriod(thisMonthStart, thisMonthEnd),
      lastMonth: calculateSummaryForPeriod(lastMonthStart, lastMonthEnd),
      thisQuarter: calculateSummaryForPeriod(thisQuarterStart, thisQuarterEnd),
      lastQuarter: calculateSummaryForPeriod(lastQuarterStart, lastQuarterEnd),
    };
  }, [transactions]);

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title={t('totalIncome')} value={formatCurrency(summary.totalIncome)} description={t('allTimeIncome')} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>} />
        <StatCard title={t('totalExpenses')} value={formatCurrency(summary.totalExpense)} description={t('allTimeExpenses')} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>} />
        <StatCard title={t('balance')} value={formatCurrency(summary.balance)} description={t('yourCurrentBalance')} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>} />
        <StatCard 
          title={t('totalAssets')} 
          value={formatCurrency(summary.totalAssets)} 
          description={t('sumOfAllAccounts')} 
          icon={<IconWallet />}
          onClick={() => setIsAccountBalancesModalOpen(true)}
          className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('periodComparison')}</CardTitle>
          <CardDescription>{t('monthly')} & {t('quarterly')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h4 className="text-md font-semibold mb-3 text-slate-800 dark:text-slate-200">{t('monthlyComparison')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ComparisonCard title={t('income')} metricType='income' currentValue={periodSummaries.thisMonth.income} previousValue={periodSummaries.lastMonth.income} periodDescription={t('vsLastMonth')} />
                    <ComparisonCard title={t('expense')} metricType='expense' currentValue={periodSummaries.thisMonth.expense} previousValue={periodSummaries.lastMonth.expense} periodDescription={t('vsLastMonth')} />
                    <ComparisonCard title={t('balance')} metricType='balance' currentValue={periodSummaries.thisMonth.balance} previousValue={periodSummaries.lastMonth.balance} periodDescription={t('vsLastMonth')} />
                </div>
            </div>
            <div className="border-t dark:border-slate-700 pt-6">
                 <h4 className="text-md font-semibold mb-3 text-slate-800 dark:text-slate-200">{t('quarterlyComparison')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ComparisonCard title={t('income')} metricType='income' currentValue={periodSummaries.thisQuarter.income} previousValue={periodSummaries.lastQuarter.income} periodDescription={t('vsLastQuarter')} />
                    <ComparisonCard title={t('expense')} metricType='expense' currentValue={periodSummaries.thisQuarter.expense} previousValue={periodSummaries.lastQuarter.expense} periodDescription={t('vsLastQuarter')} />
                    <ComparisonCard title={t('balance')} metricType='balance' currentValue={periodSummaries.thisQuarter.balance} previousValue={periodSummaries.lastQuarter.balance} periodDescription={t('vsLastQuarter')} />
                </div>
            </div>
        </CardContent>
      </Card>


      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('monthlyComparison')}</CardTitle>
            <CardDescription>{t('incomeVsExpenseBar')}</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyComparisonChart transactions={transactions} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('tagDistribution')}</CardTitle>
            <CardDescription>{t('incomeExpenseByTag')}</CardDescription>
          </CardHeader>
          <CardContent>
            <TagDistributionChart transactions={transactions} tags={tags} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('tagSpendingTrend')}</CardTitle>
          <CardDescription>{t('spendingByTopTags')}</CardDescription>
        </CardHeader>
        <CardContent>
            <TagSpendingTrendChart transactions={transactions} tags={tags} />
        </CardContent>
      </Card>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('recentTransactions')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* FIX: The TransactionList component does not accept a 'limit' prop. Sliced the transactions array to show only the 5 most recent items. */}
            <TransactionList transactions={transactions.slice(0, 5)} onViewDetails={handleViewDetails} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('overallGoalProgress')}</CardTitle>
            <CardDescription>{t('allActiveGoalsCombined')}</CardDescription>
          </CardHeader>
          <CardContent>
            <GoalProgressChart goals={goals} />
          </CardContent>
        </Card>
      </div>
      
      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        transactionToEdit={selectedTransaction}
      />

      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        transaction={selectedTransaction}
        onEdit={handleStartEdit}
      />

      <AccountBalancesModal 
        isOpen={isAccountBalancesModalOpen} 
        onClose={() => setIsAccountBalancesModalOpen(false)} 
        accounts={accounts} 
      />
    </div>
  );
};

export default Dashboard;