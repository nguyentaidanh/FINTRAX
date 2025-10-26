import React, { useMemo, useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useData } from '../../hooks/useData';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import PeriodComparisonChart from '../charts/PeriodComparisonChart';
import { TransactionType, Tag } from '@/src/types/types';
import { useI18n } from '../../hooks/useI18n';
import Select from '../ui/Select';
import { formatCurrency } from '../../utils/formatters';
// FIX: Changed date-fns deep imports to top-level imports to resolve "not callable" errors.
import { format } from 'date-fns';
import GoalContributionsChart from '../charts/GoalContributionsChart';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { enUS } from 'date-fns/locale';
import { vi } from 'date-fns/locale';


const StatCard: React.FC<{ title: string; value: string; description: string, icon: React.ReactNode }> = ({ title, value, description, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-slate-500">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </CardContent>
  </Card>
);

const IconSavings = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2Z"/><path d="M12 8v4h4"/></svg>;

const AiSummaryDisplay: React.FC<{ summary: string }> = ({ summary }) => {
    const formattedSummary = summary.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') return null;
      // Basic markdown for bolding
      const parts = paragraph.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={index} className="mb-2">
          {parts.map((part, i) => 
            part.startsWith('**') && part.endsWith('**') ? 
            <strong key={i}>{part.slice(2, -2)}</strong> : 
            part
          )}
        </p>
      );
    });
  
    return <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">{formattedSummary}</div>;
};


const AnalysisPage: React.FC = () => {
  const { transactions, goals, tags } = useData();
  const { currentUser } = useAuth();
  const { t, locale } = useI18n();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateFnsLocale = locale === 'vi' ? vi : enUS;

  const availableYears = useMemo(() => {
    if (transactions.length === 0) return [new Date().getFullYear()];
    const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [transactions]);

  const yearlyData = useMemo(() => {
    const yearTransactions = transactions.filter(t => new Date(t.date).getFullYear() === selectedYear);

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const monthDate = new Date(selectedYear, i, 1);
        const monthName = format(monthDate, 'MMM', { locale: dateFnsLocale });
        return { name: monthName, income: 0, expense: 0 };
    });

    const quarterlyData = [
        { name: 'Q1', income: 0, expense: 0 },
        { name: 'Q2', income: 0, expense: 0 },
        { name: 'Q3', income: 0, expense: 0 },
        { name: 'Q4', income: 0, expense: 0 },
    ];
    
    let totalIncome = 0;
    let totalExpense = 0;
    let totalSaved = 0;

    yearTransactions.forEach(t => {
        const date = new Date(t.date);
        const monthIndex = date.getMonth();
        const quarterIndex = Math.floor(monthIndex / 3);

        if (t.type === TransactionType.INCOME) {
            monthlyData[monthIndex].income += t.amount;
            quarterlyData[quarterIndex].income += t.amount;
            totalIncome += t.amount;
        } else {
            monthlyData[monthIndex].expense += t.amount;
            quarterlyData[quarterIndex].expense += t.amount;
            totalExpense += t.amount;
        }
    });

    goals.forEach(goal => {
        goal.history?.forEach(item => {
            if (item.change === 'increase') {
                const itemDate = new Date(item.date);
                if (itemDate.getFullYear() === selectedYear) {
                    totalSaved += item.amount;
                }
            }
        });
    });

    return {
        hasData: yearTransactions.length > 0 || totalSaved > 0,
        monthlyData,
        quarterlyData,
        totalIncome,
        totalExpense,
        totalBalance: totalIncome - totalExpense,
        totalSaved,
    };
  }, [transactions, goals, selectedYear, dateFnsLocale]);
  
  const handleGenerateSummary = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setAiSummary(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const topExpenseTags = transactions
            .filter(t => t.type === TransactionType.EXPENSE && new Date(t.date).getFullYear() === selectedYear)
            .flatMap(t => t.tags.map(tagId => ({ tagId, amount: t.amount })))
            .reduce((acc, { tagId, amount }) => {
                acc[tagId] = (acc[tagId] || 0) + amount;
                return acc;
            }, {} as { [key: string]: number });
        
        const top5Tags = Object.entries(topExpenseTags)
            .sort(([, a], [, b]) => Number(b) - Number(a))
            .slice(0, 5)
            .map(([tagId, amount]) => ({
                name: tags.find(t => t.id === tagId)?.name || 'Unknown',
                amount
            }));

        const prompt = `
            You are a friendly and insightful financial advisor. Analyze the following financial data for the year ${selectedYear} and provide a concise, easy-to-understand summary for the user.
            The currency is ${currentUser?.currency || 'USD'}.

            **Financial Data:**
            - **Total Income:** ${formatCurrency(yearlyData.totalIncome)}
            - **Total Expenses:** ${formatCurrency(yearlyData.totalExpense)}
            - **Net Balance (Income - Expenses):** ${formatCurrency(yearlyData.totalBalance)}
            - **Total Saved Towards Goals:** ${formatCurrency(yearlyData.totalSaved)}
            - **Top 5 Expense Categories:** ${JSON.stringify(top5Tags)}
            - **Monthly Breakdown:** ${JSON.stringify(yearlyData.monthlyData)}

            **Your Task:**
            1.  Start with a brief, encouraging overview of their financial year.
            2.  Analyze their income vs. expenses. Is their net balance positive or negative?
            3.  Point out any significant spending trends from their top categories. For example, which category did they spend the most on?
            4.  Comment on their progress towards financial goals. Is the amount they saved significant?
            5.  Provide one or two clear, actionable insights or suggestions for improvement based on the data.
            6.  Keep the summary to 3-4 short paragraphs. Use markdown for bolding to highlight key terms.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        setAiSummary(response.text);

    } catch (err) {
        console.error("Error generating AI summary:", err);
        setError(t('aiSummaryError'));
    } finally {
        setIsGenerating(false);
    }
  }, [selectedYear, yearlyData, transactions, goals, currentUser, t, tags]);

  // Reset summary when year changes
  React.useEffect(() => {
    setAiSummary(null);
    setError(null);
  }, [selectedYear]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('financialAnalysis')}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t('analysisDescription')}</p>
        </div>
        <div className="flex items-center gap-2">
            <label htmlFor="year-select" className="text-sm font-medium">{t('year')}:</label>
            <Select 
                id="year-select"
                value={selectedYear} 
                onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
            >
                {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>{t('aiFinancialSummary')}</CardTitle>
            <CardDescription>{t('aiSummaryDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[150px] flex items-center justify-center">
            {!aiSummary && !isGenerating && !error && (
                <Button onClick={handleGenerateSummary} disabled={!yearlyData.hasData}>
                    {t('generateAiSummary')}
                </Button>
            )}
            {isGenerating && (
                 <div className="flex flex-col items-center gap-2 text-slate-500">
                    <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>{t('generating')}</span>
                </div>
            )}
            {error && (
                <div className="text-center text-red-500">
                    <p>{error}</p>
                    <Button onClick={handleGenerateSummary} variant="link" className="mt-2">{t('tryAgain')}</Button>
                </div>
            )}
            {aiSummary && <AiSummaryDisplay summary={aiSummary} />}
        </CardContent>
      </Card>

      {yearlyData.hasData ? (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title={t('incomeForYear')} value={formatCurrency(yearlyData.totalIncome)} description={t('forTheYear').replace('{year}', String(selectedYear))} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>} />
                <StatCard title={t('expenseForYear')} value={formatCurrency(yearlyData.totalExpense)} description={t('forTheYear').replace('{year}', String(selectedYear))} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>} />
                <StatCard title={t('balanceForYear')} value={formatCurrency(yearlyData.totalBalance)} description={t('forTheYear').replace('{year}', String(selectedYear))} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>} />
                <StatCard title={t('totalSavedForYear')} value={formatCurrency(yearlyData.totalSaved)} description={t('forTheYear').replace('{year}', String(selectedYear))} icon={<IconSavings />} />
            </div>
            
            <Card>
                <CardHeader>
                <CardTitle>{t('monthlyAnalysis')}</CardTitle>
                <CardDescription>{t('incomeVsExpenseBar')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <PeriodComparisonChart data={yearlyData.monthlyData} />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                <CardTitle>{t('quarterlyAnalysis')}</CardTitle>
                <CardDescription>{t('quarterly')} {t('comparison')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <PeriodComparisonChart data={yearlyData.quarterlyData} />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('goalContributions')}</CardTitle>
                    <CardDescription>{t('monthlyContributionsToGoals')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <GoalContributionsChart goals={goals} year={selectedYear} />
                </CardContent>
            </Card>
        </div>
      ) : (
        <Card>
            <CardContent className="flex items-center justify-center h-48">
                <p className="text-slate-500">{t('noDataForYear').replace('{year}', String(selectedYear))}</p>
            </CardContent>
        </Card>
      )}

    </div>
  );
};

export default AnalysisPage;