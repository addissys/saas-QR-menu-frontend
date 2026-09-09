import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useAuthStore } from '../../store/useAuthStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, QrCode, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setServerError('');
    try {
      await login(data.email, data.password);
      showToast('Welcome back! Signed in successfully.', 'success');
      const user = useAuthStore.getState().user;
      if (user?.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      } else if (user?.role === 'CAFE_OWNER' && user?.isOnboardingCompleted === false) {
        navigate('/restaurants');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      let msg = 'Invalid credentials. Please try again.';
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || msg;
      }
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500 rounded-full blur-[140px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600 rounded-full blur-[140px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-amber-500/10 p-8 space-y-6 relative z-10 border border-slate-100"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>

        <div className="text-center space-y-2">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            className="inline-flex p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/25 mb-1 cursor-pointer"
          >
            <QrCode className="h-8 w-8" />
          </motion.div>
          <h1 className="text-2xl font-black text-slate-900">Sign In to Account</h1>
          <p className="text-xs text-slate-500">
            Enter your email address and password to access your portal
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-700">
              {serverError}
            </p>
          )}
          <div>
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="owner@restaurant.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Input
              label="Password"
              type="password"
              showPasswordToggle
              icon={Lock}
              placeholder="Your password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-semibold text-amber-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20"
              isLoading={isLoading}
            >
              Sign In to Portal
            </Button>
          </motion.div>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have a restaurant account?{' '}
          <Link to="/register" className="font-bold text-amber-600 hover:underline">
            Register Business
          </Link>
        </div>
      </motion.div>
    </div>
  );
};