import React from 'react';
import { Goal, GoalStatus } from '../types/types';
import Card, { CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import { useI18n } from '../hooks/useI18n';
import { formatCurrency } from '../utils/formatters';
// FIX: Changed date-fns deep imports to top-level imports to resolve "not callable" errors.
import { differenceInCalendarDays, isPast } from 'date-fns';

interface GoalCardProps {
  goal: Goal;
  onSelect: (goal: Goal) => void;
  onAddContribution: (goal: Goal) => void;
  onConfirm: (goal: Goal) => void;
}

// FIX: Simplified logic to derive display status and resolve comparison errors.
const getDisplayStatusInfo = (goal: Goal, t: (key: string) => string) => {
    if (goal.status === GoalStatus.COMPLETED) {
        return { status: GoalStatus.COMPLETED, text: t('completed'), className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    }
    if (goal.currentAmount >= goal.targetAmount) {
        return { status: 'PendingConfirmation', text: 'Pending', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' };
    }
    if (isPast(new Date(goal.deadline))) {
        return { status: GoalStatus.OVERDUE, text: t('overdue'), className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
    }
    return { status: GoalStatus.ACTIVE, text: t('active'), className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
}


const GoalCard: React.FC<GoalCardProps> = ({ goal, onSelect, onAddContribution, onConfirm }) => {
  const { t } = useI18n();
  const progress = (goal.currentAmount / goal.targetAmount) * 100;

  const displayStatusInfo = getDisplayStatusInfo(goal, t);
  const isPendingConfirmation = displayStatusInfo.status === 'PendingConfirmation';
  const isFinalState = goal.status === GoalStatus.COMPLETED;

  const daysDiff = differenceInCalendarDays(new Date(goal.deadline), new Date());

  const renderDeadlineText = () => {
    if (goal.status === GoalStatus.COMPLETED) return <span className="text-green-500 font-semibold">{t('goalReached')}</span>;
    if (displayStatusInfo.status === GoalStatus.OVERDUE) {
      return <span className="text-red-500">{t('daysOverdue').replace('{days}', String(Math.abs(daysDiff)))}</span>;
    }
    return <span className="text-slate-500 dark:text-slate-400">{t('daysLeft').replace('{days}', String(daysDiff < 0 ? 0 : daysDiff))}</span>;
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex-grow cursor-pointer" onClick={() => onSelect(goal)}>
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                  <span className="text-3xl mr-2">{goal.icon}</span>
                  <CardTitle className="inline align-middle">{goal.name}</CardTitle>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${displayStatusInfo.className}`}>
                  {displayStatusInfo.text}
              </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {goal.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[40px]">{goal.description}</p>
          )}
          <div>
              <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(goal.currentAmount)}</span>
                  <span className="text-slate-500 dark:text-slate-400">{t('of')} {formatCurrency(goal.targetAmount)}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                  <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progress > 100 ? 100 : progress}%` }}></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                  <span>{progress.toFixed(0)}%</span>
                  <span>{renderDeadlineText()}</span>
              </div>
          </div>
        </CardContent>
      </div>
      <CardFooter className="flex justify-end space-x-2">
        {isPendingConfirmation ? (
            <>
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onAddContribution(goal); }} disabled={isFinalState}>{t('addContribution')}</Button>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); onConfirm(goal); }}>{t('confirm')}</Button>
            </>
        ) : (
             <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onAddContribution(goal); }} disabled={isFinalState}>{t('addContribution')}</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default GoalCard;