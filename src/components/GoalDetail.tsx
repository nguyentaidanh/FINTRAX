import React from 'react';
import { Goal, GoalStatus } from '../types/types';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from './ui/Card';
import Button from './ui/Button';
import { useI18n } from '../hooks/useI18n';
import { formatCurrency, formatDate } from '../utils/formatters';
// FIX: Changed date-fns deep imports to top-level imports to resolve "not callable" errors.
import { differenceInCalendarDays, isPast } from 'date-fns';

interface GoalDetailProps {
  goal: Goal;
  onBack: () => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
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


const GoalDetail: React.FC<GoalDetailProps> = ({ goal, onBack, onEdit, onDelete, onAddContribution, onConfirm }) => {
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
    <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 sm:gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </Button>
                    <div className="flex items-center">
                        <span className="text-4xl">{goal.icon}</span>
                        <CardTitle className="inline align-middle ml-2 text-2xl">{goal.name}</CardTitle>
                    </div>
                </div>
                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${displayStatusInfo.className}`}>
                    {displayStatusInfo.text}
                </span>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            {goal.description ? (
                <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{t('description')}</h4>
                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{goal.description}</p>
                </div>
            ) : (
                <p className="text-sm text-slate-500">{t('noDescription')}</p>
            )}
            <div className="border-t dark:border-slate-700 pt-6 space-y-3">
                 <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(goal.currentAmount)}</span>
                        <span className="text-slate-500 dark:text-slate-400">{t('of')} {formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                        <div className="bg-primary-600 h-4 rounded-full text-center text-white text-xs flex items-center justify-center" style={{ width: `${progress > 100 ? 100 : progress}%` }}>
                            {progress.toFixed(0)}%
                        </div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span className="font-semibold">{t('progress')}</span>
                        <span>{renderDeadlineText()}</span>
                    </div>
                </div>
                <div className="text-center text-sm pt-2">
                    <span className="text-slate-500 dark:text-slate-400">{t('deadline')}: </span>
                    <span className="font-semibold">{formatDate(goal.deadline)}</span>
                </div>
            </div>

            <div className="border-t dark:border-slate-700 pt-6">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('contributionHistory')}</h4>
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                    {(goal.history && goal.history.length > 0) ? (
                        goal.history.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md">
                                <div>
                                    <p className={`font-medium capitalize ${item.change === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {t(item.change)}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(item.date)}</p>
                                </div>
                                <p className={`font-semibold text-lg ${item.change === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {item.change === 'increase' ? '+' : '-'} {formatCurrency(item.amount)}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">{t('noContributions')}</p>
                    )}
                </div>
            </div>

        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
            {isPendingConfirmation ? (
                <>
                    <Button variant="outline" size="sm" onClick={() => onAddContribution(goal)}>{t('addContribution')}</Button>
                    <Button onClick={() => onConfirm(goal)}>{t('confirm')}</Button>
                </>
            ) : (
                <>
                    <Button variant="outline" size="sm" onClick={() => onAddContribution(goal)} disabled={isFinalState}>{t('addContribution')}</Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(goal)} disabled={isFinalState}>{t('edit')}</Button>
                    {displayStatusInfo.status === GoalStatus.OVERDUE && (
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => onDelete(goal.id)}>{t('delete')}</Button>
                    )}
                </>
            )}
        </CardFooter>
    </Card>
  );
};

export default GoalDetail;