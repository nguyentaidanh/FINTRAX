import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Card, { CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useI18n } from '../../hooks/useI18n';
import { toast } from '../ui/Toaster';

const LoginPage: React.FC = () => {
  const { login, currentUser } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    if (!success) {
      toast(t('invalidCredentials'), 'error');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl text-center">{t('welcomeMessage')}</CardTitle>
            <CardDescription className="text-center">{t('loginPrompt')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className=" text-slate-900 dark:text-slate-100 ">{t('emailAddress')}</label>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className=" text-slate-900 dark:text-slate-100 ">{t('password')}</label>
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
                  {t('forgotPasswordLink')}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className=" text-slate-900 dark:text-slate-100 justify-center flex flex-col text-sm space-y-1">
              <span>Account demo: accountDemo@gmail.com</span>
              <span>Password demo: 123456</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('loggingIn') : t('login')}
            </Button>
            <div className="text-center text-sm  text-slate-900 dark:text-slate-100 ">
              {t('dontHaveAccount')}{' '}
              <Link to="/register" className="text-primary-600 hover:underline dark:text-primary-400">
                {t('signUp')}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
