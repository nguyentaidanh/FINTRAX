
import React from 'react';
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { useI18n } from '../../hooks/useI18n';
import { formatCurrency } from '../../utils/formatters';
// FIX: Changed date-fns deep imports to top-level imports to resolve "not callable" errors.
import { isPast } from 'date-fns';
import { Goal, GoalStatus } from '@/src/types/types';

const getDisplayStatus = (goal: Goal): GoalStatus | 'PendingConfirmation' => {
    if (goal.status === GoalStatus.COMPLETED) {
        return goal.status;
    }
    if (goal.currentAmount >= goal.targetAmount) {
        return 'PendingConfirmation';
    }
    if (isPast(new Date(goal.deadline))) {
        return GoalStatus.OVERDUE;
    }
    return goal.status;
};

const GoalProgressChart: React.FC<{ goals: Goal[] }> = ({ goals }) => {
    const { t } = useI18n();

    const activeGoals = goals.filter(g => {
        const displayStatus = getDisplayStatus(g);
        return displayStatus === GoalStatus.ACTIVE || displayStatus === 'PendingConfirmation';
    });
    
    const totalCurrent = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const totalTarget = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);

    const progress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
    
    if (activeGoals.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-500 py-10">{t('noActiveGoals')}</div>;
    }
    
    const chartData = [
        {
          name: t('overallProgress'),
          value: totalCurrent,
          target: totalTarget,
          fill: '#0ea5e9',
        },
    ];

    return (
        <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="60%" 
                outerRadius="90%" 
                barSize={20} 
                data={chartData} 
                startAngle={90} 
                endAngle={-270}
            >
                <PolarAngleAxis
                    type="number"
                    domain={[0, totalTarget]}
                    angleAxisId={0}
                    tick={false}
                />
                <RadialBar
                    background
                    dataKey="value"
                    angleAxisId={0} 
                    cornerRadius={10}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        borderColor: '#475569',
                        borderRadius: '0.5rem',
                    }}
                    formatter={(value: number) => [formatCurrency(value), t('amountSaved')]}
                />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-current text-slate-900 dark:text-slate-100 text-3xl font-bold">
                    {`${progress.toFixed(0)}%`}
                </text>
                 <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" className="fill-current text-slate-500 dark:text-slate-400 text-sm">
                    {t('ofYourTarget')}
                </text>
            </RadialBarChart>
        </ResponsiveContainer>
    );
};

export default GoalProgressChart;
