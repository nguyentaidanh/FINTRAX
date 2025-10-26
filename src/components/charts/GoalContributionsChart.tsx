
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useI18n } from '../../hooks/useI18n';
import { formatCurrency } from '../../utils/formatters';
import { format } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';
import { Goal } from '@/src/types/types';

interface ChartData {
  name: string;
  contributions: number;
}

const GoalContributionsChart: React.FC<{ goals: Goal[], year: number }> = ({ goals, year }) => {
    const { t, locale } = useI18n();
    const dateFnsLocale = locale === 'vi' ? vi : enUS;

    const monthlyData: ChartData[] = Array.from({ length: 12 }, (_, i) => {
        const monthDate = new Date(year, i, 1);
        const monthName = format(monthDate, 'MMM', { locale: dateFnsLocale });
        return { name: monthName, contributions: 0 };
    });

    let hasData = false;
    goals.forEach(goal => {
        goal.history?.forEach(item => {
            if (item.change === 'increase') {
                const itemDate = new Date(item.date);
                if (itemDate.getFullYear() === year) {
                    const monthIndex = itemDate.getMonth();
                    monthlyData[monthIndex].contributions += item.amount;
                    hasData = true;
                }
            }
        });
    });
    
    if (!hasData) {
        return <div className="flex items-center justify-center h-full text-slate-500">{t('noContributionsForYear').replace('{year}', String(year))}</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                    formatter={(value) => [formatCurrency(value as number), t('contributions')]}
                />
                <Bar dataKey="contributions" fill="#8b5cf6" name={t('contributions')} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default GoalContributionsChart;