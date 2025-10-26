import React, { useState, useRef } from 'react';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { toast } from '../ui/Toaster';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import Select from '../ui/Select';

const IconCamera = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>;

const ProfilePage: React.FC = () => {
  const { currentUser, updateUser, changePassword } = useAuth();
  const { t } = useI18n();

  if (!currentUser) {
    return <div>Loading profile...</div>;
  }
  
  const ProfileInfoCard = () => {
    const [avatar, setAvatar] = useState(currentUser.avatar);
    const [userName, setUserName] = useState(currentUser.name);
    const [userEmail, setUserEmail] = useState(currentUser.email);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        if (file.size > 1 * 1024 * 1024) { // 1MB limit
          toast(t('fileTooLarge').replace('2MB','1MB'), 'error');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setAvatar(reader.result as string);
        reader.readAsDataURL(file);
      }
    };

    const handleUpdateProfile = (e: React.FormEvent) => {
      e.preventDefault();
      updateUser({ ...currentUser, name: userName, email: userEmail, avatar: avatar });
      toast(t('profileInfoUpdated'), 'success');
    };

    return (
      <Card>
        <form onSubmit={handleUpdateProfile}>
            <CardHeader>
              <CardTitle>{t('userProfile')}</CardTitle>
              <CardDescription>{t('updateYourProfileInfo')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
                <div className="relative group flex-shrink-0">
                    <img src={avatar} alt="User avatar" className="w-24 h-24 rounded-full object-cover" />
                    <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <IconCamera />
                        <span className="sr-only">Change avatar</span>
                    </label>
                    <input id="avatar-upload" type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/png, image/jpeg" />
                </div>
                <p className="text-sm text-slate-500 text-center sm:text-left">{t('avatarUploadHelp')}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-6 dark:border-slate-700">
                <div>
                    <label htmlFor="userName" className="block text-sm font-medium mb-1">{t('fullName')}</label>
                    <Input id="userName" type="text" value={userName} onChange={e => setUserName(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="userEmail" className="block text-sm font-medium mb-1">{t('emailAddress')}</label>
                    <Input id="userEmail" type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} />
                </div>
              </div>

            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit">{t('saveChanges')}</Button>
            </CardFooter>
        </form>
      </Card>
    );
  };

  const PersonalDetailsCard = () => {
    const [phone, setPhone] = useState(currentUser.phone || '');
    const [dob, setDob] = useState(currentUser.dob || '');
    const [currency, setCurrency] = useState(currentUser.currency || 'USD');

    const handleUpdateDetails = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser({...currentUser, phone, dob, currency });
        toast(t('personalDetailsUpdated'), 'success');
    }
    
    return (
        <Card>
            <form onSubmit={handleUpdateDetails}>
                <CardHeader>
                    <CardTitle>{t('personalInformation')}</CardTitle>
                    <CardDescription>{t('managePersonalDetails')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="phone" className="block text-sm font-medium mb-1">{t('phone')}</label>
                          <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
                      </div>
                      <div>
                          <label htmlFor="dob" className="block text-sm font-medium mb-1">{t('dateOfBirth')}</label>
                          <Input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)} />
                      </div>
                    </div>
                    <div>
                        <label htmlFor="currency" className="block text-sm font-medium mb-1">{t('currency')}</label>
                        <Select id="currency" value={currency} onChange={e => setCurrency(e.target.value)}>
                            <option value="USD">{t('usd')}</option>
                            <option value="VND">{t('vnd')}</option>
                            <option value="EUR">{t('eur')}</option>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button type="submit">{t('saveChanges')}</Button>
                </CardFooter>
            </form>
        </Card>
    );
  }

  const SecurityCard = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isChanging, setIsChanging] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsChanging(true);
        if (newPassword !== confirmNewPassword) {
            toast(t('passwordsDoNotMatch'), 'error');
            setIsChanging(false);
            return;
        }
        const result = await changePassword(currentUser.id, currentPassword, newPassword);
        if (result.success) {
            toast(t('passwordUpdatedSuccess'), 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } else {
            toast(t('incorrectPassword'), 'error');
        }
        setIsChanging(false);
    }
      
    return (
        <Card>
            <form onSubmit={handlePasswordChange}>
                <CardHeader>
                    <CardTitle>{t('security')}</CardTitle>
                    <CardDescription>{t('updatePasswordPrompt')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">{t('currentPassword')}</label>
                        <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium mb-1">{t('newPassword')}</label>
                          <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                      </div>
                       <div>
                          <label htmlFor="confirmNewPassword" className="block text-sm font-medium mb-1">{t('confirmNewPassword')}</label>
                          <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
                      </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button type="submit" disabled={isChanging}>{t('changePassword')}</Button>
                </CardFooter>
            </form>
        </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <ProfileInfoCard />
      <PersonalDetailsCard />
      <SecurityCard />
    </div>
  );
};

export default ProfilePage;