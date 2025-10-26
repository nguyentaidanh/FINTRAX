import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useI18n } from '../../hooks/useI18n';
import { toast } from '../ui/Toaster';

const RegisterPage: React.FC = () => {
  const { register, currentUser } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast(t('passwordsDoNotMatch'), 'error');
      return;
    }
    if (!termsAccepted) {
      toast('You must accept the terms and conditions.', 'error');
      return;
    }
    setIsLoading(true);
    const success = await register(name, email, password, dob);
    if (success) {
      toast(t('registrationSuccess'), 'success');
      // Navigation is handled by the effect
    } else {
      toast(t('emailInUse'), 'error');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl text-center">{t('createAnAccount')}</CardTitle>
            <CardDescription className="text-center">{t('startManagingFinances')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name">{t('fullName')}</label>
                <Input id="name" type="text" placeholder="Alex Doe" required value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading}/>
              </div>
              <div className="space-y-2">
                <label htmlFor="dob">{t('dateOfBirth')}</label>
                <Input id="dob" type="date" required value={dob} onChange={(e) => setDob(e.target.value)} disabled={isLoading} />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email">{t('emailAddress')}</label>
              <Input id="email" type="email" placeholder="alex.doe@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="password">{t('password')}</label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}/>
              </div>
               <div className="space-y-2">
                <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
                <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} />
              </div>
            </div>
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400">{t('termsOfService')}</label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading || !termsAccepted}>
              {isLoading ? t('registering') : t('register')}
            </Button>
            <div className="text-center text-sm">
              {t('alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-primary-600 hover:underline dark:text-primary-400">
                {t('login')}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;