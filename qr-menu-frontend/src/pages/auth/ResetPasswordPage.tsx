import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useToast } from '../../hooks/useToast';
import { authApi } from '../../api/auth.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Lock, QrCode, ArrowLeft } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      showToast('Invalid or missing reset token. Please request a new link.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        token,
        new_password: data.password,
        confirm_password: data.confirmPassword,
      });
      showToast('Password updated successfully! Please sign in.', 'success');
      navigate('/login');
    } catch (err: unknown) {
      let msg = 'Failed to reset password. The link may have expired.';
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || msg;
      }
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-purple-600 text-white rounded-2xl shadow-lg mb-2">
            <QrCode className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Set New Password</h1>
          <p className="text-xs text-slate-500">
            Choose a strong new password for your account
          </p>
        </div>

        {!token && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs text-center space-y-2">
            <p className="font-bold">Invalid Reset Link</p>
            <p>This reset link is missing a token. Please request a new password reset.</p>
            <Link to="/forgot-password" className="inline-block pt-1 font-bold text-red-600 hover:underline">
              Request New Link
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="New Password"
              type="password"
              icon={Lock}
              placeholder="At least 8 chars, 1 uppercase, 1 symbol"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Input
              label="Confirm New Password"
              type="password"
              icon={Lock}
              placeholder="Repeat your new password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full py-3"
            isLoading={isLoading}
            disabled={!token}
          >
            Save New Password
          </Button>
        </form>

        <div className="text-center pt-2">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};