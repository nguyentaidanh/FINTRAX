import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useI18n } from '../../hooks/useI18n';
import { Tag, Transaction, TransactionType } from '@/src/types/types';

interface ChartData {
  name: string;
  value: number;
  color: string;
  // FIX: Add index signature to be compatible with recharts' data type.
  [key: string]: any;
}

const processDataForChart = (transactions: Transaction[], tags: Tag[], type: TransactionType): ChartData[] => {
  const tagAmounts: { [key: string]: number } = {};
  
  transactions
    .filter(t => t.type === type)
    .forEach(t => {
      t.tags.forEach(tagId => {
        if (!tagAmounts[tagId]) {
          tagAmounts[tagId] = 0;
        }
        tagAmounts[tagId] += t.amount;
      });
    });

  return Object.entries(tagAmounts).map(([tagId, amount]) => {
    const tag = tags.find(t => t.id === tagId);
    return {
      name: tag ? tag.name : 'Uncategorized',
      value: amount,
      color: tag ? tag.color : '#64748b',
    };
  });
};

const TagDistributionChart: React.FC<{ transactions: Transaction[], tags: Tag[] }> = ({ transactions, tags }) => {
  const { t } = useI18n();
  const incomeData = processDataForChart(transactions, tags, TransactionType.INCOME);
  const expenseData = processDataForChart(transactions, tags, TransactionType.EXPENSE);

  const renderPieChart = (data: ChartData[]) => (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            borderColor: '#475569',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: '#cbd5e1' }}
          formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
        />
        <Legend 
          wrapperStyle={{fontSize: "12px", paddingTop: "20px"}} 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
        />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div className="flex flex-col items-center">
        <h4 className="text-md font-semibold mb-2 text-slate-800 dark:text-slate-200">{t('income')}</h4>
        {incomeData.length > 0 ? renderPieChart(incomeData) : (
          <div className="flex items-center justify-center h-[250px] text-slate-500 text-sm">{t('noIncomeData')}</div>
        )}
      </div>
      <div className="flex flex-col items-center">
        <h4 className="text-md font-semibold mb-2 text-slate-800 dark:text-slate-200">{t('expense')}</h4>
        {expenseData.length > 0 ? renderPieChart(expenseData) : (
          <div className="flex items-center justify-center h-[250px] text-slate-500 text-sm">{t('noExpenseData')}</div>
        )}
      </div>
    </div>
  );
};

export default TagDistributionChart;