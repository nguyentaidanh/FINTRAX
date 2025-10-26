
import React from 'react';
import Button from './Button';
import { useI18n } from '../../hooks/useI18n';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, className }) => {
    const { t } = useI18n();
    
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={`flex items-center justify-between px-4 py-3 sm:px-6 ${className}`}>
            <div className="flex-1 flex justify-between sm:hidden">
                <Button variant="outline" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                    {t('previous')}
                </Button>
                <Button variant="outline" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    {t('next')}
                </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        {t('pageIndicator').replace('{currentPage}', String(currentPage)).replace('{totalPages}', String(totalPages))}
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-l-md"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            {t('previous')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-r-md"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            {t('next')}
                        </Button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
