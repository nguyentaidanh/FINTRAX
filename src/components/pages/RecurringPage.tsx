
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import Card, { CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { useI18n } from '../../hooks/useI18n';
import AddRecurringTransactionModal from '../AddRecurringTransactionModal';
import RecurringTransactionList from '../RecurringTransactionList';
import { RecurringTransaction } from '@/src/types/types';
import { useAuth } from '../../hooks/useAuth';
import Pagination from '../ui/Pagination';

const RecurringPage: React.FC = () => {
  const { recurringTransactions } = useData();
  const { currentUser } = useAuth();
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<RecurringTransaction | null>(null);

  // Pagination
  const itemsPerPage = currentUser?.notificationSettings?.pagination?.itemsPerPage || 10;
  const [currentPage, setCurrentPage] = useState(1);

  const sortedRecurringTransactions = useMemo(() => {
    // Sort by next due date, which needs to be calculated
    return [...recurringTransactions].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [recurringTransactions]);

  const totalPages = Math.ceil(sortedRecurringTransactions.length / itemsPerPage);
  const paginatedRecurringTransactions = sortedRecurringTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  const handleEditTemplate = (template: RecurringTransaction) => {
    setTemplateToEdit(template);
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setTemplateToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{t('manageRecurring')}</CardTitle>
            <CardDescription>{t('recurringDescription')}</CardDescription>
          </div>
          <Button onClick={handleOpenModal}>{t('addRecurring')}</Button>
        </CardHeader>
        <CardContent className="p-0">
            <RecurringTransactionList 
                recurringTransactions={paginatedRecurringTransactions} 
                onEdit={handleEditTemplate}
            />
        </CardContent>
        {totalPages > 1 && (
            <CardFooter className="p-0">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </CardFooter>
        )}
      </Card>

      <AddRecurringTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        templateToEdit={templateToEdit} 
      />
    </div>
  );
};

export default RecurringPage;
