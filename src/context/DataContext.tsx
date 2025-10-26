import React, { createContext, useState, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { Tag, Transaction, Account, TransactionType, TransactionStatus, RecurringTransaction, Frequency, Notification, Goal, ExpenseCategory, GoalStatus, GoalHistory } from '../types/types';
import { 
    USER_1_TAGS, USER_1_TRANSACTIONS, USER_1_ACCOUNTS, USER_1_RECURRING_TRANSACTIONS, USER_1_GOALS,
    USER_2_TAGS, USER_2_TRANSACTIONS, USER_2_ACCOUNTS, USER_2_RECURRING_TRANSACTIONS, USER_2_GOALS,
    INITIAL_USERS 
} from '../constants/constants';
import { useAuth } from '../hooks/useAuth';
// FIX: Changed date-fns deep imports to top-level imports to resolve "not callable" errors.
import { addDays, addMonths, addWeeks, isAfter, differenceInCalendarDays, format } from 'date-fns';
import { toast } from '../components/ui/Toaster';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useI18n } from '../hooks/useI18n';

interface DataContextProps {
  tags: Tag[];
  transactions: Transaction[];
  accounts: Account[];
  recurringTransactions: RecurringTransaction[];
  notifications: Notification[];
  goals: Goal[];
  addTag: (tag: Omit<Tag, 'id'>) => Tag;
  updateTag: (tag: Tag) => void;
  deleteTag: (tagId: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'history'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
  deleteMultipleTransactions: (transactionIds: string[]) => void;
  getTagById: (tagId: string) => Tag | undefined;
  getAccountById: (accountId: string) => Account | undefined;
  addAccount: (account: Omit<Account, 'id' | 'balance'>) => void;
  updateAccount: (account: Omit<Account, 'balance'>) => void;
  deleteAccount: (accountId: string) => boolean;
  importTransactions: (transactions: Omit<Transaction, 'id' | 'history'>[]) => void;
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurringTransaction: (transaction: RecurringTransaction) => void;
  deleteRecurringTransaction: (transactionId: string) => void;
  markAllNotificationsAsRead: () => void;
  addGoal: (goal: Omit<Goal, 'id' | 'status'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (goalId: string) => void;
  confirmGoalCompletion: (goalId: string, fromAccountId: string) => void;
  addOrRemoveGoalContribution: (goalId: string, amount: number, accountId: string, type: 'increase' | 'decrease') => void;
}

export const DataContext = createContext<DataContextProps | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

const initializeAllUserData = () => {
    const user1 = INITIAL_USERS[0];
    const user2 = INITIAL_USERS[1];
    return {
        tags: { [user1.id]: USER_1_TAGS, [user2.id]: USER_2_TAGS },
        transactions: { [user1.id]: USER_1_TRANSACTIONS, [user2.id]: USER_2_TRANSACTIONS },
        accounts: { [user1.id]: USER_1_ACCOUNTS, [user2.id]: USER_2_ACCOUNTS },
        recurringTransactions: { [user1.id]: USER_1_RECURRING_TRANSACTIONS, [user2.id]: USER_2_RECURRING_TRANSACTIONS },
        goals: { [user1.id]: USER_1_GOALS, [user2.id]: USER_2_GOALS },
    }
}

const calculateAccountBalances = (accounts: Account[], transactions: Transaction[]): Account[] => {
    return accounts.map(account => {
        const balance = transactions
            .filter(t => t.accountId === account.id && t.status === TransactionStatus.PAID)
            .reduce((acc, t) => {
                if (t.type === TransactionType.INCOME) return acc + (t.amountAfterTax ?? t.amount);
                return acc - t.amount;
            }, account.initialBalance);
        return { ...account, balance };
    });
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  // FIX: Initialize the useI18n hook to get the translation function `t`.
  const { t } = useI18n();
  
  const [allData, setAllData] = useState<{
      tags: { [userId: string]: Tag[] };
      transactions: { [userId: string]: Transaction[] };
      accounts: { [userId: string]: Account[] };
      recurringTransactions: { [userId: string]: RecurringTransaction[] };
      goals: { [userId: string]: Goal[] };
  }>(initializeAllUserData);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generationHasRun = useRef(false);
  const notificationGenerationRun = useRef<{[key: string]: boolean}>({});

  const userTags = currentUser ? allData.tags[currentUser.id] || [] : [];
  const userTransactions = currentUser ? allData.transactions[currentUser.id] || [] : [];
  const userAccounts = currentUser ? allData.accounts[currentUser.id] || [] : [];
  const userRecurringTransactions = currentUser ? allData.recurringTransactions[currentUser.id] || [] : [];
  const userGoals = currentUser ? allData.goals[currentUser.id] || [] : [];

  const accountsWithCalculatedBalances = useMemo(() => {
    if (!currentUser) return [];
    return calculateAccountBalances(userAccounts, userTransactions);
  }, [userAccounts, userTransactions, currentUser]);

  const addTag = useCallback((tag: Omit<Tag, 'id'>): Tag => {
    if (!currentUser) throw new Error("User not found");
    const newTag = { ...tag, id: `tag-${Date.now()}` };
    setAllData(prev => ({ ...prev, tags: { ...prev.tags, [currentUser.id]: [...(prev.tags[currentUser.id] || []), newTag] }}));
    return newTag;
  }, [currentUser]);

  const updateTag = useCallback((updatedTag: Tag) => {
    if (!currentUser) return;
    setAllData(prev => ({ ...prev, tags: { ...prev.tags, [currentUser.id]: (prev.tags[currentUser.id] || []).map(tag => tag.id === updatedTag.id ? updatedTag : tag) }}));
  }, [currentUser]);

  const deleteTag = useCallback((tagId: string) => {
    if (!currentUser) return;
    setAllData(prev => ({
        ...prev,
        tags: { ...prev.tags, [currentUser.id]: (prev.tags[currentUser.id] || []).filter(tag => tag.id !== tagId) },
        transactions: { ...prev.transactions, [currentUser.id]: (prev.transactions[currentUser.id] || []).map(t => ({ ...t, tags: t.tags.filter(id => id !== tagId) }))}
    }));
  }, [currentUser]);
  
  const getTagById = useCallback((tagId: string) => userTags.find(tag => tag.id === tagId), [userTags]);
  const getAccountById = useCallback((accountId: string) => accountsWithCalculatedBalances.find(acc => acc.id === accountId), [accountsWithCalculatedBalances]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'history'>) => {
    if (!currentUser) return;
    const newTransaction: Transaction = {
        ...transaction,
        id: `txn-${Date.now()}`,
        history: [{ date: new Date(transaction.date).toISOString(), change: 'Transaction created.' }]
    };
    setAllData(prev => {
        const currentUserTxns = prev.transactions[currentUser.id] || [];
        const newTxns = [newTransaction, ...currentUserTxns].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return { ...prev, transactions: { ...prev.transactions, [currentUser.id]: newTxns }};
    });
  }, [currentUser]);
  
  const importTransactions = useCallback((transactionsToImport: Omit<Transaction, 'id' | 'history'>[]) => {
    if (!currentUser) return;
    setAllData(prev => {
      const newTxnsWithIds = transactionsToImport.map((t, i) => ({ 
        ...t, 
        id: `import-txn-${Date.now()}-${i}`,
        history: [{ date: new Date(t.date).toISOString(), change: 'Transaction imported.' }]
    }));
      const currentUserTxns = prev.transactions[currentUser.id] || [];
      const combinedTxns = [...newTxnsWithIds, ...currentUserTxns].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return { ...prev, transactions: { ...prev.transactions, [currentUser.id]: combinedTxns }};
    });
  }, [currentUser]);

  const updateTransaction = useCallback((updatedTransaction: Transaction) => {
    if (!currentUser) return;
    setAllData(prev => {
        const oldTxn = (prev.transactions[currentUser.id] || []).find(txn => txn.id === updatedTransaction.id);

        if (oldTxn) {
            const changes = [];
            if (oldTxn.amount !== updatedTransaction.amount) changes.push(`amount to ${formatCurrency(updatedTransaction.amount)}`);
            if (oldTxn.description !== updatedTransaction.description) changes.push('description');
            if (new Date(oldTxn.date).toISOString().split('T')[0] !== new Date(updatedTransaction.date).toISOString().split('T')[0]) changes.push('date');
            if (oldTxn.status !== updatedTransaction.status) changes.push(`status to ${updatedTransaction.status}`);
            if (oldTxn.accountId !== updatedTransaction.accountId) changes.push('account');
            if (JSON.stringify(oldTxn.tags.sort()) !== JSON.stringify(updatedTransaction.tags.sort())) changes.push('tags');
            if (oldTxn.category !== updatedTransaction.category) changes.push('category');
            if (oldTxn.attachmentUrl !== updatedTransaction.attachmentUrl) changes.push('attachment');
    
            let changeMessage = 'Transaction updated.';
            if (changes.length > 0) {
                changeMessage = `Updated ${changes.join(', ')}.`;
            }
            
            const newHistoryEntry = {
              date: new Date().toISOString(),
              change: changeMessage
            };
            
            updatedTransaction.history = [newHistoryEntry, ...(oldTxn.history || [])];
        }

        const newTransactions = (prev.transactions[currentUser.id] || []).map(txn => txn.id === updatedTransaction.id ? updatedTransaction : txn);
      
        return { ...prev, transactions: { ...prev.transactions, [currentUser.id]: newTransactions }};
    });
  }, [currentUser]);

  const deleteTransaction = useCallback((transactionId: string) => {
    if (!currentUser) return;
    setAllData(prev => ({ ...prev, transactions: { ...prev.transactions, [currentUser.id]: (prev.transactions[currentUser.id] || []).filter(txn => txn.id !== transactionId) }}));
  }, [currentUser]);

  const deleteMultipleTransactions = useCallback((transactionIds: string[]) => {
    if (!currentUser) return;
    setAllData(prev => ({ 
        ...prev, 
        transactions: { 
            ...prev.transactions, 
            [currentUser.id]: (prev.transactions[currentUser.id] || []).filter(txn => !transactionIds.includes(txn.id)) 
        }
    }));
  }, [currentUser]);

  const addAccount = useCallback((account: Omit<Account, 'id' | 'balance'>) => {
    if (!currentUser) return;
    const newAccount: Account = { ...account, id: `acc-${Date.now()}`, balance: account.initialBalance };
    setAllData(prev => ({ ...prev, accounts: { ...prev.accounts, [currentUser.id]: [...(prev.accounts[currentUser.id] || []), newAccount]}}));
  }, [currentUser]);

  const updateAccount = useCallback((updatedAccount: Omit<Account, 'balance'>) => {
    if (!currentUser) return;
    setAllData(prev => ({ ...prev, accounts: { ...prev.accounts, [currentUser.id]: (prev.accounts[currentUser.id] || []).map(acc => acc.id === updatedAccount.id ? { ...acc, ...updatedAccount } : acc) }}));
  }, [currentUser]);

  const deleteAccount = useCallback((accountId: string) => {
    if (!currentUser) return false;
    const transactionsUsingAccount = (allData.transactions[currentUser.id] || []).some(t => t.accountId === accountId);
    if (transactionsUsingAccount) {
      return false;
    }
    setAllData(prev => ({ ...prev, accounts: { ...prev.accounts, [currentUser.id]: (prev.accounts[currentUser.id] || []).filter(acc => acc.id !== accountId) }}));
    return true;
  }, [currentUser, allData.transactions]);

  const addRecurringTransaction = useCallback((transaction: Omit<RecurringTransaction, 'id'>) => {
    if (!currentUser) return;
    const newRecurring: RecurringTransaction = { ...transaction, id: `rec-${Date.now()}`};
    setAllData(prev => ({ ...prev, recurringTransactions: { ...prev.recurringTransactions, [currentUser.id]: [...(prev.recurringTransactions[currentUser.id] || []), newRecurring]}}));
  }, [currentUser]);

  const updateRecurringTransaction = useCallback((updatedTransaction: RecurringTransaction) => {
    if (!currentUser) return;
    setAllData(prev => ({ ...prev, recurringTransactions: { ...prev.recurringTransactions, [currentUser.id]: (prev.recurringTransactions[currentUser.id] || []).map(rec => rec.id === updatedTransaction.id ? updatedTransaction : rec) }}));
  }, [currentUser]);

  const deleteRecurringTransaction = useCallback((transactionId: string) => {
    if (!currentUser) return;
    setAllData(prev => ({ ...prev, recurringTransactions: { ...prev.recurringTransactions, [currentUser.id]: (prev.recurringTransactions[currentUser.id] || []).filter(rec => rec.id !== transactionId) }}));
  }, [currentUser]);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'status'>) => {
    if (!currentUser) return;
    const newGoal: Goal = { ...goal, id: `goal-${Date.now()}`, status: GoalStatus.ACTIVE, history: [] };
    setAllData(prev => ({ ...prev, goals: { ...prev.goals, [currentUser.id]: [...(prev.goals[currentUser.id] || []), newGoal] }}));
  }, [currentUser]);

  const updateGoal = useCallback((updatedGoal: Goal) => {
    if (!currentUser) return;
    setAllData(prev => ({ ...prev, goals: { ...prev.goals, [currentUser.id]: (prev.goals[currentUser.id] || []).map(g => g.id === updatedGoal.id ? updatedGoal : g) }}));
  }, [currentUser]);

  const deleteGoal = useCallback((goalId: string) => {
    if (!currentUser) return;
    setAllData(prev => ({ ...prev, goals: { ...prev.goals, [currentUser.id]: (prev.goals[currentUser.id] || []).filter(g => g.id !== goalId) }}));
  }, [currentUser]);
  
  const confirmGoalCompletion = useCallback((goalId: string, fromAccountId: string) => {
    if (!currentUser) return;
    setAllData(prev => {
      const userGoals = prev.goals[currentUser.id] || [];
      const goalToComplete = userGoals.find(g => g.id === goalId);
      if (!goalToComplete) return prev;

      // 1. Update goal status
      const updatedGoals = userGoals.map(g => g.id === goalId ? { ...g, status: GoalStatus.COMPLETED } : g);

      // 2. Create transaction
      const newTransaction: Omit<Transaction, 'id' | 'history'> = {
          type: TransactionType.EXPENSE,
          amount: goalToComplete.targetAmount,
          description: `Payment for goal: ${goalToComplete.name}`,
          date: new Date().toISOString(),
          tags: [], 
          status: TransactionStatus.PAID,
          accountId: fromAccountId,
          category: ExpenseCategory.SAVINGS,
      };
      
      const newTransactionWithId: Transaction = {
          ...newTransaction,
          id: `txn-goal-${Date.now()}`,
          history: [{ date: new Date().toISOString(), change: 'Transaction created from completed goal.' }]
      };
      
      const currentUserTxns = prev.transactions[currentUser.id] || [];
      const newTxns = [newTransactionWithId, ...currentUserTxns].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return {
        ...prev,
        goals: { ...prev.goals, [currentUser.id]: updatedGoals },
        transactions: { ...prev.transactions, [currentUser.id]: newTxns },
      };
    });
  }, [currentUser]);
  
  const addOrRemoveGoalContribution = useCallback((goalId: string, amount: number, accountId: string, type: 'increase' | 'decrease') => {
    if (!currentUser) return;

    const account = getAccountById(accountId);

    if (type === 'increase') {
        if (!account || amount > account.balance) {
            toast(t('insufficientFunds').replace('{accountName}', account?.name || 'the selected account'), 'error');
            return;
        }
    }

    setAllData(prev => {
        const userGoals = prev.goals[currentUser.id] || [];
        const goalToUpdate = userGoals.find(g => g.id === goalId);
        if (!goalToUpdate) return prev;

        let finalAmount = amount;
        
        if (type === 'increase') {
            const remaining = goalToUpdate.targetAmount - goalToUpdate.currentAmount;
            if (remaining <= 0) { 
                finalAmount = 0;
            } else {
                finalAmount = Math.min(amount, remaining);
            }
        } else { // decrease
            finalAmount = Math.min(amount, goalToUpdate.currentAmount);
        }
        
        if (finalAmount <= 0) {
            return prev;
        }

        // 1. Create transaction
        const transactionType = type === 'increase' ? TransactionType.EXPENSE : TransactionType.INCOME;
        const description = type === 'increase' 
            ? `Contribution to "${goalToUpdate.name}"`
            : `Withdrawal from "${goalToUpdate.name}"`;

        const newTransaction: Omit<Transaction, 'id' | 'history'> = {
            type: transactionType,
            amount: finalAmount,
            description: description,
            date: new Date().toISOString(),
            tags: [], 
            status: TransactionStatus.PAID,
            accountId: accountId,
            category: ExpenseCategory.SAVINGS,
        };
        
        const newTransactionWithId: Transaction = {
            ...newTransaction,
            id: `txn-goal-contrib-${Date.now()}`,
            history: [{ date: new Date().toISOString(), change: 'Transaction created from goal contribution.' }]
        };
        
        const currentUserTxns = prev.transactions[currentUser.id] || [];
        const newTxns = [newTransactionWithId, ...currentUserTxns].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // 2. Update goal
        const newCurrentAmount = type === 'increase'
            ? goalToUpdate.currentAmount + finalAmount
            : goalToUpdate.currentAmount - finalAmount;
        
        const newHistoryEntry: GoalHistory = {
            date: new Date().toISOString(),
            change: type,
            amount: finalAmount,
            transactionId: newTransactionWithId.id,
        };

        const updatedGoal = {
            ...goalToUpdate,
            currentAmount: Math.max(0, newCurrentAmount),
            history: [newHistoryEntry, ...(goalToUpdate.history || [])],
        };

        const updatedGoals = userGoals.map(g => g.id === goalId ? updatedGoal : g);

        return {
            ...prev,
            goals: { ...prev.goals, [currentUser.id]: updatedGoals },
            transactions: { ...prev.transactions, [currentUser.id]: newTxns },
        };
    });
  }, [currentUser, getAccountById, t]);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  }, []);

  useEffect(() => {
    if (currentUser && !generationHasRun.current) {
      const today = new Date();
      const templates = allData.recurringTransactions[currentUser.id] || [];
      const generatedTransactions: Omit<Transaction, 'id' | 'history'>[] = [];
      const updatedTemplates: RecurringTransaction[] = [];
      
      const getNextDate = (current: Date, frequency: Frequency): Date => {
        switch (frequency) {
          case Frequency.DAILY: return addDays(current, 1);
          case Frequency.WEEKLY: return addWeeks(current, 1);
          case Frequency.MONTHLY: return addMonths(current, 1);
          default: return current;
        }
      };

      templates.forEach(template => {
        let runnerDate = new Date(template.lastGeneratedDate);
        const endDate = template.endDate ? new Date(template.endDate) : null;
        
        while (true) {
          let nextDueDate = getNextDate(runnerDate, template.frequency);
          if (isAfter(nextDueDate, today)) {
            break; 
          }
          if (endDate && isAfter(nextDueDate, endDate)) {
            break;
          }
          
          generatedTransactions.push({
            type: template.type,
            amount: template.amount,
            description: template.description,
            date: nextDueDate.toISOString(),
            tags: template.tags,
            accountId: template.accountId,
            category: template.category,
            status: TransactionStatus.UNPAID,
          });
          runnerDate = nextDueDate;
        }
        updatedTemplates.push({ ...template, lastGeneratedDate: runnerDate.toISOString() });
      });

      if (generatedTransactions.length > 0) {
        setAllData(prev => {
          const newTxnsWithIds = generatedTransactions.map((t, i) => ({ 
              ...t,
              id: `gen-txn-${Date.now()}-${i}`,
              history: [{ date: new Date(t.date).toISOString(), change: 'Transaction generated from recurring template.' }]
            }));
          const currentUserTxns = prev.transactions[currentUser.id] || [];
          const combinedTxns = [...newTxnsWithIds, ...currentUserTxns].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          return {
            ...prev,
            transactions: { ...prev.transactions, [currentUser.id]: combinedTxns },
            recurringTransactions: { ...prev.recurringTransactions, [currentUser.id]: updatedTemplates }
          };
        });
        toast(`${generatedTransactions.length} recurring transaction(s) were generated.`, 'info');
      }
      generationHasRun.current = true;
    }
  }, [currentUser, allData.recurringTransactions]);

  useEffect(() => {
    if (currentUser && userRecurringTransactions.length > 0 && !notificationGenerationRun.current[currentUser.id]) {
      const settings = currentUser.notificationSettings?.reminders.recurring;
      if (!settings || !settings.enabled) return;

      const today = new Date();
      const newNotifications: Notification[] = [];

      const getNextDate = (current: Date, frequency: Frequency): Date => {
        switch (frequency) {
          case Frequency.DAILY: return addDays(current, 1);
          case Frequency.WEEKLY: return addWeeks(current, 1);
          case Frequency.MONTHLY: return addMonths(current, 1);
          default: return current;
        }
      };
      
      userRecurringTransactions.forEach(template => {
        const nextDueDate = getNextDate(new Date(template.lastGeneratedDate), template.frequency);
        const daysDiff = differenceInCalendarDays(nextDueDate, today);

        if (daysDiff >= 0 && daysDiff <= settings.daysBefore) {
          const message = `'${template.description}' is due ${daysDiff === 0 ? 'today' : `in ${daysDiff} day(s)`}.`;
          newNotifications.push({
            id: `notif-${template.id}-${format(nextDueDate, 'yyyy-MM-dd')}`,
            message,
            date: new Date().toISOString(),
            read: false,
            linkTo: '/recurring',
          });
        }
      });
      
      setNotifications(newNotifications);
      notificationGenerationRun.current[currentUser.id] = true;
    }
  }, [currentUser, userRecurringTransactions]);


  return (
    <DataContext.Provider value={{
      tags: userTags,
      transactions: userTransactions,
      accounts: accountsWithCalculatedBalances,
      recurringTransactions: userRecurringTransactions,
      notifications,
      goals: userGoals,
      addTag, updateTag, deleteTag,
      addTransaction, updateTransaction, deleteTransaction,
      deleteMultipleTransactions,
      getTagById, getAccountById,
      addAccount, updateAccount, deleteAccount,
      importTransactions,
      addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction,
      markAllNotificationsAsRead,
      addGoal, updateGoal, deleteGoal,
      confirmGoalCompletion,
      addOrRemoveGoalContribution,
    }}>
      {children}
    </DataContext.Provider>
  );
};