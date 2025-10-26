import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useI18n } from '../../hooks/useI18n';
import { toast } from '../ui/Toaster';

const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordReset } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await sendPasswordReset(email);
    toast(t('passwordResetSent'), 'success');
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl text-center">{t('passwordReset')}</CardTitle>
            <CardDescription className="text-center">{t('passwordResetPrompt')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email">{t('emailAddress')}</label>
              <Input
                id="email"
                type="email"
                placeholder="accountDemo@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('sending') : t('sendResetLink')}
            </Button>
            <div className="text-center text-sm">
              <Link to="/login" className="text-primary-600 hover:underline dark:text-primary-400">
                {t('backToLogin')}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
