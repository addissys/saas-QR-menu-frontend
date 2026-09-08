import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { MailCheck, QrCode, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import axios from 'axios';
import { authApi } from '../../api/auth.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const initialEmail = searchParams.get('email') ?? '';
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<'waiting' | 'verifying' | 'verified' | 'error'>('waiting');
  const [message, setMessage] = useState('Check your inbox for the verification link.');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isActive = true;
    setStatus('verifying');
    authApi.verifyEmail(token)
      .then(() => {
        if (!isActive) return;
        setStatus('verified');
        setMessage('Your email has been verified. You can now sign in.');
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        const apiMessage = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
        setStatus('error');
        setMessage(apiMessage || 'This verification link is invalid or has expired.');
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  const resendVerification = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;

    setIsResending(true);
    try {
      await authApi.resendVerification(email.trim());
      setMessage('A new verification email has been sent.');
      setStatus('waiting');
    } catch (error: unknown) {
      const apiMessage = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      setStatus('error');
      setMessage(apiMessage || 'Unable to resend the verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -right-20 w-96 h-96 bg-amber-500 rounded-full blur-[140px] pointer-events-none"
      />
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6 relative z-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>

        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/25">
            {status === 'verified' ? <CheckCircle2 className="h-8 w-8" /> : <QrCode className="h-8 w-8" />}
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {status === 'verified' ? 'Email Verified' : 'Verify Your Email'}
          </h1>
          <p className="text-xs text-slate-500">{message}</p>
        </div>

        {status === 'verifying' && (
          <p className="text-center text-xs font-semibold text-slate-500">Verifying your email...</p>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <XCircle className="h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {status !== 'verified' && (
          <form onSubmit={resendVerification} className="space-y-3 border-t border-slate-100 pt-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={MailCheck}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Button type="submit" variant="primary" size="md" className="w-full py-3" isLoading={isResending}>
              Resend Verification Email
            </Button>
          </form>
        )}

        {status === 'verified' && (
          <Link to="/login" className="block rounded-xl bg-amber-500 py-3 text-center text-sm font-extrabold text-slate-950 hover:bg-amber-400">
            Continue to Sign In
          </Link>
        )}

        <p className="text-center text-xs text-slate-500">
          Already verified?{' '}
          <Link to="/login" className="font-bold text-amber-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};
