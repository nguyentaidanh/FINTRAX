import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';
import { formatCurrency } from '../utils/formatters';
import { useI18n } from '../hooks/useI18n';

interface ComparisonCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  periodDescription: string;
  metricType: 'income' | 'expense' | 'balance';
}

const ArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>;
const ArrowDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>;

const ComparisonCard: React.FC<ComparisonCardProps> = ({ title, currentValue, previousValue, periodDescription, metricType }) => {
    const { t } = useI18n();

    const calculatePercentageChange = () => {
        if (previousValue === 0) {
            return currentValue > 0 ? Infinity : 0;
        }
        return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
    };

    const change = calculatePercentageChange();
    const isPositive = change > 0;
    const isNegative = change < 0;

    let changeColor = 'text-slate-500 dark:text-slate-400';
    if (isPositive) {
        changeColor = metricType === 'expense' ? 'text-red-500' : 'text-green-500';
    } else if (isNegative) {
        changeColor = metricType === 'expense' ? 'text-green-500' : 'text-red-500';
    }

    const renderChange = () => {
        if (change === Infinity) {
            return <span className="text-green-500 flex items-center">New</span>;
        }
        if (isNaN(change) || previousValue === 0) {
            return <span className="text-slate-500">{t('noPriorData')}</span>;
        }
        return (
            <span className={`flex items-center font-semibold ${changeColor}`}>
                {isPositive && <ArrowUpIcon />}
                {isNegative && <ArrowDownIcon />}
                {change.toFixed(1)}%
            </span>
        );
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(currentValue)}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    {renderChange()}
                    <span>{periodDescription}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default ComparisonCard;
