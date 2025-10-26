import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType, ExpenseCategory, Tag, TransactionStatus, Account } from '../types/types';
import { useData } from '../hooks/useData';
import { toast } from './ui/Toaster';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Badge from './ui/Badge';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import { TAG_COLORS } from '../constants/constants';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

type SuggestedTag = {
    id?: string;
    name: string;
    color: string;
    isNew: boolean;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, transactionToEdit }) => {
  const { addTransaction, updateTransaction, tags, accounts, addTag } = useData();
  const { currentUser } = useAuth();
  const { t } = useI18n();
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.FLEXIBLE);
  const [taxPercent, setTaxPercent] = useState('');
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.PAID);
  const [accountId, setAccountId] = useState<string>('');
  const [attachment, setAttachment] = useState<string | null>(null);

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedAiTags, setSuggestedAiTags] = useState<SuggestedTag[]>([]);
  const isInitialEditLoad = useRef(false);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(String(transactionToEdit.amount));
      setDescription(transactionToEdit.description);
      setDate(new Date(transactionToEdit.date).toISOString().split('T')[0]);
      setSelectedTags(transactionToEdit.tags);
      setCategory(transactionToEdit.category || ExpenseCategory.FLEXIBLE);
      setTaxPercent(transactionToEdit.taxPercent ? String(transactionToEdit.taxPercent) : '');
      setStatus(transactionToEdit.status);
      setAccountId(transactionToEdit.accountId);
      setAttachment(transactionToEdit.attachmentUrl || null);
      isInitialEditLoad.current = true;
    } else {
      // Reset form
      setType(TransactionType.EXPENSE);
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedTags([]);
      setCategory(ExpenseCategory.FLEXIBLE);
      setTaxPercent('');
      setStatus(TransactionStatus.PAID);
      setAccountId(accounts.length > 0 ? accounts[0].id : '');
      setAttachment(null);
      isInitialEditLoad.current = false;
    }
    // Clear AI suggestions when modal opens/changes
    setSuggestedAiTags([]);
    setIsSuggesting(false);
  }, [transactionToEdit, isOpen, accounts]);

  const handleSuggestTags = async () => {
    if (!description || description.length <= 3) return;
    setIsSuggesting(true);
    setSuggestedAiTags([]);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const existingTagsForPrompt = tags.map(({ name, color }) => ({ name, color }));
        const expenseCategoriesForPrompt = Object.values(ExpenseCategory);

        const prompt = `You are an intelligent financial assistant. Your primary function is to provide highly accurate and context-aware tag and category suggestions for financial transactions.

**Analyze the following transaction in detail:**
- **Description:** "${description}"
- **Type:** ${type}
- **Amount:** ${amount || 'not specified'} (Currency: ${currentUser?.currency || 'USD'})

**Use the following context to provide your suggestions:**
1.  **Existing User Tags:** Suggest from this list if a suitable tag already exists. Avoid creating duplicates.
    \`\`\`json
    ${JSON.stringify(existingTagsForPrompt)}
    \`\`\`
2.  **New Tag Creation:** If no existing tag is a good fit, you may suggest up to 3 new tags. For each new tag, you MUST assign a color from the available list. Choose colors that are not heavily used.
    **Available Colors:** ${JSON.stringify(TAG_COLORS)}
3.  **Category Suggestion:** If the transaction type is '${TransactionType.EXPENSE}', you MUST suggest the most appropriate category from the list below. For '${TransactionType.INCOME}', the category should be \`null\`.
    **Expense Categories:** ${JSON.stringify(expenseCategoriesForPrompt)}

**Response Format:**
You MUST respond with ONLY a JSON object that strictly adheres to the provided schema. Do not include any other text or explanations. The JSON object must contain:
- A \`suggestions\` key: an array of tag objects.
- An optional \`category\` key: a string (one of the expense categories) or \`null\`.
Each tag object in the \`suggestions\` array must have:
- \`name\` (string)
- \`color\` (string)
- \`isNew\` (boolean)`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    color: { type: Type.STRING },
                                    isNew: { type: Type.BOOLEAN },
                                },
                                required: ['name', 'color', 'isNew'],
                            }
                        },
                        category: {
                            type: Type.STRING
                        }
                    },
                    required: ['suggestions'],
                }
            }
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        
        if (result.suggestions && Array.isArray(result.suggestions)) {
             const processedSuggestions = result.suggestions.map((sugg: any) => {
                const existingTag = tags.find(t => t.name.toLowerCase() === sugg.name.toLowerCase());
                if (existingTag) {
                    return { ...existingTag, isNew: false };
                } else {
                    return { name: sugg.name, color: sugg.color, isNew: true };
                }
            });
            setSuggestedAiTags(processedSuggestions);
        }
        
        if (type === TransactionType.EXPENSE && result.category) {
            const suggestedCategory = result.category as ExpenseCategory;
            if (Object.values(ExpenseCategory).includes(suggestedCategory)) {
                setCategory(suggestedCategory);
            }
        }

    } catch (error) {
        console.error("Error suggesting tags:", error);
        toast("Could not get AI suggestions.", "error");
    } finally {
        setIsSuggesting(false);
    }
  };

  useEffect(() => {
    if (isInitialEditLoad.current) {
        isInitialEditLoad.current = false;
        return;
    }

    const handler = setTimeout(() => {
        handleSuggestTags();
    }, 700);

    return () => {
        clearTimeout(handler);
    };
  }, [description, type, amount, currentUser]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };
  
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast(t('fileTooLarge'), 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleSelectSuggestedTag = (tag: SuggestedTag) => {
    if (tag.id) { // Existing tag
        handleTagToggle(tag.id);
        return;
    }

    // New tag suggestion
    const alreadyCreatedTag = tags.find(t => t.name.toLowerCase() === tag.name.toLowerCase());

    if (alreadyCreatedTag) {
        handleTagToggle(alreadyCreatedTag.id);
    } else {
        const newTag = addTag({ name: tag.name, color: tag.color });
        setSelectedTags(prev => [...prev, newTag.id]);
        setSuggestedAiTags(prev => prev.map(s => 
            s.name.toLowerCase() === newTag.name.toLowerCase() 
            ? { ...newTag, isNew: false } 
            : s
        ));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || selectedTags.length === 0 || !accountId) {
      toast(t('fillRequiredFields'), 'error');
      return;
    }

    const numAmount = parseFloat(amount);
    const numTax = taxPercent ? parseFloat(taxPercent) : undefined;
    
    let amountAfterTax: number | undefined;
    if (type === TransactionType.INCOME && numTax !== undefined) {
      amountAfterTax = numAmount * (1 - numTax / 100);
    }
    
    const transactionData = {
      type,
      amount: numAmount,
      description,
      date: new Date(date).toISOString(),
      tags: selectedTags,
      status,
      accountId,
      attachmentUrl: attachment,
      ...(type === TransactionType.EXPENSE && { category }),
      ...(type === TransactionType.INCOME && { taxPercent: numTax, amountAfterTax }),
    };

    if (transactionToEdit) {
      // FIX: Spread the existing transaction to preserve fields like history.
      updateTransaction({ ...transactionToEdit, ...transactionData });
      toast(t('transactionUpdatedSuccess'), 'success');
    } else {
      addTransaction(transactionData);
      toast(t('transactionAddedSuccess'), 'success');
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transactionToEdit ? t('editTransaction') : t('addTransaction')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('account')}</label>
              <Select value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
                <option value="" disabled>{t('selectAccount')}</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('type')}</label>
              <Select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
                <option value={TransactionType.EXPENSE}>{t('expense')}</option>
                <option value={TransactionType.INCOME}>{t('income')}</option>
              </Select>
            </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('description')}</label>
          <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Groceries" required />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('amount')}</label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('date')}</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
        </div>

        {type === TransactionType.INCOME && (
          <div>
            <label className="block text-sm font-medium mb-1">{t('taxPercent')}</label>
            <Input type="number" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} placeholder="e.g., 15" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {type === TransactionType.EXPENSE && (
              <div>
                <label className="block text-sm font-medium mb-1">{t('category')}</label>
                <Select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
                  {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{t(cat)}</option>)}
                </Select>
              </div>
            )}
            <div>
                <label className="block text-sm font-medium mb-1">{t('status')}</label>
                <Select value={status} onChange={(e) => setStatus(e.target.value as TransactionStatus)}>
                  {Object.values(TransactionStatus).map(s => <option key={s} value={s}>{t(s.toLowerCase())}</option>)}
                </Select>
            </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('tags')}</label>
          <div className="flex flex-wrap gap-2 p-2 border rounded-md dark:border-slate-700 max-h-28 overflow-y-auto">
            {tags.length > 0 ? tags.map(tag => (
              <button key={tag.id} type="button" onClick={() => handleTagToggle(tag.id)}>
                <Badge
                  style={{ backgroundColor: tag.color, color: '#fff' }}
                  className={`cursor-pointer ${selectedTags.includes(tag.id) ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-slate-800' : 'opacity-60 hover:opacity-100'}`}
                >
                  {tag.name}
                </Badge>
              </button>
            )) : <p className="text-xs text-slate-500">{t('noTagsAvailable')}</p>}
          </div>
        </div>

        {(isSuggesting || suggestedAiTags.length > 0) && (
            <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                    {t('suggestedTags')}
                    {isSuggesting && (
                        <svg className="animate-spin h-4 w-4 text-primary-500 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    )}
                </label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 min-h-[40px]">
                    {suggestedAiTags.map((tag, index) => (
                        <button key={`${tag.name}-${index}`} type="button" onClick={() => handleSelectSuggestedTag(tag)}>
                            <Badge
                                style={{ backgroundColor: tag.color, color: '#fff' }}
                                className={`cursor-pointer relative transition-all ${selectedTags.includes(tag.id!) ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-slate-800' : 'opacity-80 hover:opacity-100'}`}
                            >
                                {tag.name}
                                {tag.isNew && !tags.some(t => t.id === tag.id) && (
                                    <span className="absolute -top-1.5 -right-2 text-xs font-bold text-amber-400 transform rotate-12">new</span>
                                )}
                            </Badge>
                        </button>
                    ))}
                </div>
            </div>
        )}
        
        <div>
            <label className="block text-sm font-medium mb-1">{t('attachment')}</label>
            <Input type="file" onChange={handleAttachmentChange} accept="image/*,.pdf" />
            {attachment && <a href={attachment} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline mt-2 inline-block">{t('viewAttachment')}</a>}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button type="submit">{transactionToEdit ? t('saveChanges') : t('addTransaction')}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTransactionModal;