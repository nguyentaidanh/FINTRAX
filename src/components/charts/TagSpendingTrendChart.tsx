import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { Tag, Transaction, TransactionType } from '@/src/types/types';

interface ChartData {
  name: string; // Month name
  [key: string]: any; // Tag names as keys
}

const processDataForChart = (transactions: Transaction[], tags: Tag[]): { data: ChartData[], topTags: Tag[] } => {
  // 1. Calculate total spending per tag to find top 5
  const tagTotals: { [key: string]: number } = {};
  transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .forEach(t => {
      t.tags.forEach(tagId => {
        tagTotals[tagId] = (tagTotals[tagId] || 0) + t.amount;
      });
    });

  const topTagIds = Object.entries(tagTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id);
    
  const topTags = tags.filter(t => topTagIds.includes(t.id));

  // 2. Filter transactions for the last 6 months & top tags
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const relevantTransactions = transactions.filter(t =>
    t.type === TransactionType.EXPENSE && new Date(t.date) >= sixMonthsAgo
  );

  // 3. Group by month and aggregate tag spending
  const monthlyData: { [key: string]: { [tagId: string]: number } } = {};

  relevantTransactions.forEach(t => {
    const month = new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (!monthlyData[month]) monthlyData[month] = {};
    
    t.tags.forEach(tagId => {
      if (topTagIds.includes(tagId)) {
        monthlyData[month][tagId] = (monthlyData[month][tagId] || 0) + t.amount;
      }
    });
  });

  // 4. Format for Recharts
  const chartData = Object.entries(monthlyData).map(([month, tagData]) => {
    const monthEntry: ChartData = { name: month };
    topTags.forEach(tag => {
      monthEntry[tag.name] = tagData[tag.id] || 0;
    });
    return monthEntry;
  }).sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());

  return { data: chartData, topTags };
};

const TagSpendingTrendChart: React.FC<{ transactions: Transaction[], tags: Tag[] }> = ({ transactions, tags }) => {
  const { data, topTags } = processDataForChart(transactions, tags);
  
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-500">No expense data from the last 6 months to display.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
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
        {topTags.map(tag => (
          <Bar key={tag.id} dataKey={tag.name} stackId="a" fill={tag.color} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TagSpendingTrendChart;