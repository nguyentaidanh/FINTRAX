

import { subDays } from 'date-fns/subDays';
import { Transaction, TransactionType, ExpenseCategory, User, Account, AccountType, TransactionStatus, RecurringTransaction, Frequency, Goal, Tag, GoalStatus } from '../types/types';

export const TAG_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#78716c'
];

// --- Users ---
export const INITIAL_USERS: User[] = [
  { 
    id: 'user-1', 
    name: 'Alex Doe', 
    email: 'alex.doe@example.com', 
    avatar: 'https://i.pravatar.cc/128?u=alex', 
    password: 'password123',
    notificationSettings: {
      reminders: {
        recurring: { enabled: true, daysBefore: 3 }
      },
      pagination: { itemsPerPage: 10 }
    }
  },
  { 
    id: 'user-2', 
    name: 'Jane Smith', 
    email: 'jane.smith@example.com', 
    avatar: 'https://i.pravatar.cc/128?u=jane', 
    password: 'password456',
    notificationSettings: {
      reminders: {
        recurring: { enabled: true, daysBefore: 5 }
      },
      pagination: { itemsPerPage: 10 }
    }
  }
];

// --- Data for User 1 (Alex Doe) ---
export const USER_1_ACCOUNTS: Account[] = [
    { id: 'acc-1-1', name: 'Main Bank Account', type: AccountType.BANK, balance: 10000, initialBalance: 10000 },
    { id: 'acc-1-2', name: 'Cash Wallet', type: AccountType.CASH, balance: 500, initialBalance: 500 },
];

export const USER_1_TAGS: Tag[] = [
  { id: 'tag-1-1', name: 'Salary', color: TAG_COLORS[4] },
  { id: 'tag-1-2', name: 'Freelance', color: TAG_COLORS[6] },
  { id: 'tag-1-3', name: 'Groceries', color: TAG_COLORS[1] },
  { id: 'tag-1-4', name: 'Utilities', color: TAG_COLORS[7] },
  { id: 'tag-1-5', name: 'Rent', color: TAG_COLORS[0] },
  { id: 'tag-1-6', name: 'Transportation', color: TAG_COLORS[3] },
  { id: 'tag-1-7', name: 'Entertainment', color: TAG_COLORS[9] },
  { id: 'tag-1-8', name: 'Office Supplies', color: TAG_COLORS[8] },
];

const txn1Date = new Date(new Date().setDate(1));
const txn2Date = new Date(new Date().setDate(2));
const txn3Date = new Date(new Date().setDate(3));
const txn4Date = new Date(new Date().setDate(5));
const txn5Date = new Date(new Date().setDate(10));
const txn6Date = new Date(new Date().setDate(11));

export const USER_1_TRANSACTIONS: Transaction[] = [
  { id: 'txn-1-1', type: TransactionType.INCOME, amount: 5000, description: 'Monthly Salary', date: txn1Date.toISOString(), tags: ['tag-1-1'], taxPercent: 15, amountAfterTax: 4250, status: TransactionStatus.PAID, accountId: 'acc-1-1', attachmentUrl: null, history: [{ date: txn1Date.toISOString(), change: 'Transaction created.' }] },
  { id: 'txn-1-2', type: TransactionType.EXPENSE, amount: 1200, description: 'Apartment Rent', date: txn2Date.toISOString(), tags: ['tag-1-5'], category: ExpenseCategory.FIXED, status: TransactionStatus.PAID, accountId: 'acc-1-1', attachmentUrl: null, history: [{ date: txn2Date.toISOString(), change: 'Transaction created.' }] },
  { id: 'txn-1-3', type: TransactionType.EXPENSE, amount: 350, description: 'Weekly Groceries', date: txn3Date.toISOString(), tags: ['tag-1-3'], category: ExpenseCategory.FLEXIBLE, status: TransactionStatus.PAID, accountId: 'acc-1-2', attachmentUrl: null, history: [{ date: txn3Date.toISOString(), change: 'Transaction created.' }] },
  { id: 'txn-1-4', type: TransactionType.EXPENSE, amount: 150, description: 'Electricity & Water Bill', date: txn4Date.toISOString(), tags: ['tag-1-4'], category: ExpenseCategory.FIXED, status: TransactionStatus.UNPAID, accountId: 'acc-1-1', attachmentUrl: null, history: [{ date: txn4Date.toISOString(), change: 'Transaction created.' }] },
  { id: 'txn-1-5', type: TransactionType.INCOME, amount: 750, description: 'Freelance Project', date: txn5Date.toISOString(), tags: ['tag-1-2'], taxPercent: 10, amountAfterTax: 675, status: TransactionStatus.PAID, accountId: 'acc-1-1', attachmentUrl: null, history: [{ date: txn5Date.toISOString(), change: 'Transaction created.' }] },
  { id: 'txn-1-6', type: TransactionType.EXPENSE, amount: 75, description: 'Printer Ink with Receipt', date: txn6Date.toISOString(), tags: ['tag-1-8'], category: ExpenseCategory.FLEXIBLE, status: TransactionStatus.PAID, accountId: 'acc-1-2', attachmentUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAR5JREFUeAHt2jEKwkAQBdGvUvR47gE+wh3sBSw8iMV6b2BjZ/cgdpfaESxEIgrZzU4iFPFLJvPe/jCYoP4j1Y8K8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgAx48a8CgA8zYj9A58TAYyA8+g17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN17yZg4yN1d1f0A1M2ZbOAAAAAElFTkSuQmCC', history: [{ date: txn6Date.toISOString(), change: 'Transaction created.' }] },
];

const lastMonth = new Date();
lastMonth.setMonth(lastMonth.getMonth() - 1);

export const USER_1_RECURRING_TRANSACTIONS: RecurringTransaction[] = [
    { id: 'rec-1-1', description: 'Monthly Rent', amount: 1200, type: TransactionType.EXPENSE, tags: ['tag-1-5'], accountId: 'acc-1-1', category: ExpenseCategory.FIXED, frequency: Frequency.MONTHLY, startDate: new Date(2023, 0, 2).toISOString(), endDate: null, lastGeneratedDate: subDays(new Date(new Date().setDate(2)),1).toISOString() },
    { id: 'rec-1-2', description: 'Weekly Groceries Budget', amount: 100, type: TransactionType.EXPENSE, tags: ['tag-1-3'], accountId: 'acc-1-2', category: ExpenseCategory.FLEXIBLE, frequency: Frequency.WEEKLY, startDate: new Date(2023, 0, 1).toISOString(), endDate: null, lastGeneratedDate: subDays(new Date(new Date().setDate(3)), 7).toISOString() },
];

export const USER_1_GOALS: Goal[] = [
    { id: 'goal-1-1', name: 'Summer Vacation', description: 'Family trip to Hawaii. Need to book flights and hotel.', targetAmount: 2000, currentAmount: 750, deadline: new Date(new Date().getFullYear(), 7, 31).toISOString(), icon: '✈️', status: GoalStatus.ACTIVE, history: [] },
    { id: 'goal-1-2', name: 'New Laptop', description: 'For work and personal projects. Eyeing the new MacBook Pro.', targetAmount: 1500, currentAmount: 1500, deadline: new Date(new Date().getFullYear(), 5, 30).toISOString(), icon: '💻', status: GoalStatus.COMPLETED, history: [] },
    { id: 'goal-1-3', name: 'Emergency Fund', description: 'Save up 3 months of living expenses for peace of mind.', targetAmount: 5000, currentAmount: 3200, deadline: new Date(new Date().getFullYear() + 1, 0, 1).toISOString(), icon: '🛡️', status: GoalStatus.ACTIVE, history: [] },
    { id: 'goal-1-4', name: 'Down Payment', description: 'Saving for a down payment on a house in the suburbs.', targetAmount: 10000, currentAmount: 2500, deadline: new Date(new Date().getFullYear() - 1, 11, 31).toISOString(), icon: '🏠', status: GoalStatus.OVERDUE, history: [] },
];

// --- Data for User 2 (Jane Smith) ---
export const USER_2_ACCOUNTS: Account[] = [
    { id: 'acc-2-1', name: 'Business Checking', type: AccountType.BANK, balance: 25000, initialBalance: 25000 },
    { id: 'acc-2-2', name: 'E-Wallet', type: AccountType.E_WALLET, balance: 1200, initialBalance: 1200 },
];

export const USER_2_TAGS: Tag[] = [
    { id: 'tag-2-1', name: 'Consulting', color: TAG_COLORS[5] },
    { id: 'tag-2-2', name: 'Software', color: TAG_COLORS[8] },
    { id: 'tag-2-3', name: 'Office Supplies', color: TAG_COLORS[2] },
    { id: 'tag-2-4', name: 'Travel', color: TAG_COLORS[10] },
    { id: 'tag-2-5', name: 'Client Dinner', color: TAG_COLORS[1] },
];

const txn2_1Date = new Date(new Date().setDate(4));
const txn2_2Date = new Date(new Date().setDate(6));
const txn2_3Date = new Date(new Date().setDate(9));
const txn2_4Date = new Date(new Date().setDate(12));

export const USER_2_TRANSACTIONS: Transaction[] = [
    { id: 'txn-2-1', type: TransactionType.INCOME, amount: 3200, description: 'Consulting Gig', date: txn2_1Date.toISOString(), tags: ['tag-2-1'], status: TransactionStatus.PAID, accountId: 'acc-2-1', attachmentUrl: null, history: [{ date: txn2_1Date.toISOString(), change: 'Transaction created.' }] },
    { id: 'txn-2-2', type: TransactionType.EXPENSE, amount: 250, description: 'Business Lunch', date: txn2_2Date.toISOString(), tags: ['tag-2-5'], category: ExpenseCategory.FLEXIBLE, status: TransactionStatus.PAID, accountId: 'acc-2-2', attachmentUrl: null, history: [{ date: txn2_2Date.toISOString(), change: 'Transaction created.' }] },
    { id: 'txn-2-3', type: TransactionType.EXPENSE, amount: 49, description: 'Productivity Software', date: txn2_3Date.toISOString(), tags: ['tag-2-2'], category: ExpenseCategory.FIXED, status: TransactionStatus.PAID, accountId: 'acc-2-1', attachmentUrl: null, history: [{ date: txn2_3Date.toISOString(), change: 'Transaction created.' }] },
    { id: 'txn-2-4', type: TransactionType.EXPENSE, amount: 600, description: 'Flight for Conference', date: txn2_4Date.toISOString(), tags: ['tag-2-4'], category: ExpenseCategory.FLEXIBLE, status: TransactionStatus.UNPAID, accountId: 'acc-2-1', attachmentUrl: null, history: [{ date: txn2_4Date.toISOString(), change: 'Transaction created.' }] },
];

export const USER_2_RECURRING_TRANSACTIONS: RecurringTransaction[] = [
    { id: 'rec-2-1', description: 'Productivity Software Suite', amount: 49, type: TransactionType.EXPENSE, tags: ['tag-2-2'], accountId: 'acc-2-1', category: ExpenseCategory.FIXED, frequency: Frequency.MONTHLY, startDate: new Date(2023, 0, 9).toISOString(), endDate: null, lastGeneratedDate: subDays(new Date(new Date().setDate(9)),1).toISOString() }
];

export const USER_2_GOALS: Goal[] = [
    { id: 'goal-2-1', name: 'Office Upgrade', description: 'New standing desk, ergonomic chair, and a second monitor.', targetAmount: 3000, currentAmount: 1250, deadline: new Date(new Date().getFullYear(), 11, 31).toISOString(), icon: '🏢', status: GoalStatus.ACTIVE, history: [] },
];