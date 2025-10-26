
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { Transaction, TransactionType } from '@/src/types/types';

interface ChartData {
  name: string;
  income: number;
  expense: number;
}

const processDataForChart = (transactions: Transaction[]): ChartData[] => {
  const monthlyData: { [key: string]: { income: number; expense: number } } = {};

  transactions.forEach(t => {
    const month = new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expense: 0 };
    }
    if (t.type === TransactionType.INCOME) {
      monthlyData[month].income += t.amount;
    } else {
      monthlyData[month].expense += t.amount;
    }
  });

  return Object.entries(monthlyData)
    .map(([name, values]) => ({ name, ...values }))
    .sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
};

const MonthlyComparisonChart: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const data = processDataForChart(transactions);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.5)" />
        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
        <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => formatCurrency(value as number)} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            borderColor: '#475569',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: '#cbd5e1' }}
          formatter={(value) => formatCurrency(value as number)}
        />
        <Legend wrapperStyle={{fontSize: "14px"}} />
        <Bar dataKey="income" fill="#22c55e" name="Income" />
        <Bar dataKey="expense" fill="#ef4444" name="Expense" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyComparisonChart;