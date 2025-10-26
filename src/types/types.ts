
// --- Enums ---
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum ExpenseCategory {
  FIXED = 'fixed',
  FLEXIBLE = 'flexible',
  INVESTMENT = 'investment',
  SAVINGS = 'savings',
  OTHER = 'other',
}

export enum AccountType {
  BANK = 'Bank Account',
  CASH = 'Cash',
  E_WALLET = 'E-Wallet',
}

export enum TransactionStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
  DEBT = 'Debt',
  INSTALLMENT = 'Installment',
}

export enum Frequency {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
}

export enum GoalStatus {
    ACTIVE = 'Active',
    COMPLETED = 'Completed',
    OVERDUE = 'Overdue',
}


// --- Interfaces ---

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface UserNotificationSettings {
  reminders: {
    recurring: {
      enabled: boolean;
      daysBefore: number;
    }
  };
  pagination?: {
    itemsPerPage: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  dob?: string;
  phone?: string;
  currency?: string;
  notificationSettings?: UserNotificationSettings;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  initialBalance: number;
}

export interface TransactionHistory {
  date: string;
  change: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  tags: string[];
  status: TransactionStatus;
  accountId: string;
  category?: ExpenseCategory;
  taxPercent?: number;
  amountAfterTax?: number;
  attachmentUrl?: string | null;
  history?: TransactionHistory[];
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  tags: string[];
  accountId: string;
  category?: ExpenseCategory;
  frequency: Frequency;
  startDate: string;
  endDate: string | null;
  lastGeneratedDate: string;
}

export interface GoalHistory {
  date: string;
  change: 'increase' | 'decrease';
  amount: number;
  transactionId: string;
}

export interface Goal {
    id: string;
    name: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    icon: string;
    status: GoalStatus;
    history?: GoalHistory[];
}

export interface Notification {
    id: string;
    message: string;
    date: string;
    read: boolean;
    linkTo?: string;
}
