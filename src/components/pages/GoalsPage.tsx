import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../hooks/useData';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useI18n } from '../../hooks/useI18n';
import { Goal, GoalStatus } from '@/src/types/types';
import GoalCard from '../GoalCard';
import AddGoalModal from '../AddGoalModal';
import AddContributionModal from '../AddContributionModal';
import { toast } from '../ui/Toaster';
// FIX: Changed date-fns deep imports to top-level imports to resolve "not callable" errors.
import { isPast } from 'date-fns';
import GoalDetail from '../GoalDetail';
import ConfirmGoalModal from '../ConfirmGoalModal';
import Pagination from '../ui/Pagination';
import { useAuth } from '../../hooks/useAuth';

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


const StatusSummaryCard: React.FC<{ title: string; count: number; onClick: () => void; isActive: boolean; }> = ({ title, count, onClick, isActive }) => (
    <Card 
        onClick={onClick} 
        className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-primary-500' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
    >
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold">{count}</div>
        </CardContent>
    </Card>
);

const GoalsPage: React.FC = () => {
  const { goals, deleteGoal } = useData();
  const { t } = useI18n();
  const { currentUser } = useAuth();

  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isAddContributionModalOpen, setIsAddContributionModalOpen] = useState(false);
  const [isConfirmGoalModalOpen, setIsConfirmGoalModalOpen] = useState(false);
  
  const [goalToManage, setGoalToManage] = useState<Goal | null>(null);
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);

  const handleOpenAddGoalModal = (goal?: Goal) => {
    setGoalToManage(goal || null);
    setIsAddGoalModalOpen(true);
  };

  const handleOpenContributionModal = (goal: Goal) => {
    setGoalToManage(goal);
    setIsAddContributionModalOpen(true);
  };
  
  const handleOpenConfirmModal = (goal: Goal) => {
    setGoalToManage(goal);
    setIsConfirmGoalModalOpen(true);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (window.confirm(t('confirmDeleteGoal'))) {
      deleteGoal(goalId);
      toast(t('goalDeletedSuccess'), 'success');
      setView('list');
    }
  };

  const handleSelectGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setView('detail');
  };
  
  const handleBackToList = () => {
    setSelectedGoal(null);
    setView('list');
  };
  
  const statusCounts = useMemo(() => {
    return goals.reduce((acc, goal) => {
        const displayStatus = getDisplayStatus(goal);
        if (displayStatus === GoalStatus.ACTIVE || displayStatus === 'PendingConfirmation') {
             acc.Active +=1;
        } else if (displayStatus === GoalStatus.OVERDUE) {
            acc.Overdue += 1;
        } else if (displayStatus === GoalStatus.COMPLETED) {
            acc.Completed += 1;
        }
        acc.all += 1;
        return acc;
    }, { Active: 0, Overdue: 0, Completed: 0, all: 0 });
  }, [goals]);

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
        const displayStatus = getDisplayStatus(goal);
        let statusMatch = true;
        if (statusFilter !== 'all') {
            if (statusFilter === 'active') {
                statusMatch = displayStatus === GoalStatus.ACTIVE || displayStatus === 'PendingConfirmation';
            } else {
                statusMatch = displayStatus.toLowerCase() === statusFilter;
            }
        }
        const searchMatch = goal.name.toLowerCase().includes(searchTerm.toLowerCase());
        return statusMatch && searchMatch;
    });
  }, [goals, statusFilter, searchTerm]);
  
  const itemsPerPage = currentUser?.notificationSettings?.pagination?.itemsPerPage || 10;
  const totalPages = Math.ceil(filteredGoals.length / itemsPerPage);
  const paginatedGoals = filteredGoals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {view === 'list' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatusSummaryCard title={t('allGoals')} count={statusCounts.all} onClick={() => setStatusFilter('all')} isActive={statusFilter === 'all'} />
            <StatusSummaryCard title={t('active')} count={statusCounts.Active} onClick={() => setStatusFilter('active')} isActive={statusFilter === 'active'} />
            <StatusSummaryCard title={t('overdue')} count={statusCounts.Overdue} onClick={() => setStatusFilter('overdue')} isActive={statusFilter === 'overdue'} />
            <StatusSummaryCard title={t('completed')} count={statusCounts.Completed} onClick={() => setStatusFilter('completed')} isActive={statusFilter === 'completed'} />
          </div>

          <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>{t('goals')}</CardTitle>
                        <CardDescription>{t('goalTrackingDescription')}</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenAddGoalModal()}>{t('addNewGoal')}</Button>
                </div>
                <div className="mt-4 flex">
                    <Input 
                        placeholder={t('searchGoalPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>
            </CardHeader>
            <CardContent>
                {paginatedGoals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedGoals.map(goal => (
                            <GoalCard 
                                key={goal.id} 
                                goal={goal} 
                                onSelect={handleSelectGoal}
                                onAddContribution={handleOpenContributionModal}
                                onConfirm={handleOpenConfirmModal}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        <p>{t('noGoalsMatchFilters')}</p>
                    </div>
                )}
            </CardContent>
            {totalPages > 1 && (
                <CardFooter className="p-0">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </CardFooter>
            )}
          </Card>
        </>
      )}

      {view === 'detail' && selectedGoal && (
        <GoalDetail 
            goal={selectedGoal}
            onBack={handleBackToList}
            onEdit={handleOpenAddGoalModal}
            onDelete={handleDeleteGoal}
            onAddContribution={handleOpenContributionModal}
            onConfirm={handleOpenConfirmModal}
        />
      )}
      
      <AddGoalModal 
        isOpen={isAddGoalModalOpen} 
        onClose={() => setIsAddGoalModalOpen(false)} 
        goalToEdit={goalToManage} 
      />

      <AddContributionModal
        isOpen={isAddContributionModalOpen}
        onClose={() => setIsAddContributionModalOpen(false)}
        goal={goalToManage}
      />
      
      <ConfirmGoalModal
        isOpen={isConfirmGoalModalOpen}
        onClose={() => setIsConfirmGoalModalOpen(false)}
        goal={goalToManage}
        onConfirm={() => setView('list')}
      />
    </div>
  );
};

export default GoalsPage;