import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { Tag } from '@/src/types/types';
import { TAG_COLORS } from '../../constants/constants';
import { toast } from '../ui/Toaster';
import { useI18n } from '../../hooks/useI18n';

const TagsPage: React.FC = () => {
  const { tags, addTag, updateTag, deleteTag } = useData();
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagToEdit, setTagToEdit] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState(TAG_COLORS[0]);
  
  const handleOpenModal = (tag?: Tag) => {
    if (tag) {
      setTagToEdit(tag);
      setTagName(tag.name);
      setTagColor(tag.color);
    } else {
      setTagToEdit(null);
      setTagName('');
      setTagColor(TAG_COLORS[0]);
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName) {
      toast('Tag name cannot be empty.', 'error');
      return;
    }
    
    if (tagToEdit) {
      updateTag({ ...tagToEdit, name: tagName, color: tagColor });
      toast('Tag updated successfully!', 'success');
    } else {
      addTag({ name: tagName, color: tagColor });
      toast('Tag added successfully!', 'success');
    }
    handleCloseModal();
  };

  const handleDelete = (tagId: string) => {
    if (window.confirm('Are you sure you want to delete this tag? This will remove it from all associated transactions.')) {
      deleteTag(tagId);
      toast('Tag deleted.', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
            <CardTitle>{t('yourTags')}</CardTitle>
            <Button onClick={() => handleOpenModal()}>{t('addNewTag')}</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tags.map(tag => (
              <div key={tag.id} className="p-4 border rounded-lg flex items-center justify-between dark:border-slate-700">
                <Badge style={{ backgroundColor: tag.color, color: '#fff' }}>{tag.name}</Badge>
                <div className="space-x-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(tag)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(tag.id)}>
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={tagToEdit ? t('editTag') : t('addNewTag')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tagName" className="block text-sm font-medium mb-1">{t('tagName')}</label>
            <Input id="tagName" type="text" value={tagName} onChange={e => setTagName(e.target.value)} placeholder="e.g., Groceries" required/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('color')}</label>
            <div className="flex flex-wrap gap-2">
              {TAG_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setTagColor(color)}
                  className={`w-8 h-8 rounded-full ${tagColor === color ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-slate-800' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>{t('cancel')}</Button>
            <Button type="submit">{tagToEdit ? t('saveChanges') : t('addTag')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TagsPage;