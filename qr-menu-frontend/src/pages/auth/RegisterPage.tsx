import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { User, Mail, Lock, Phone, QrCode, ArrowLeft } from 'lucide-react';

// 1. Define the Validation Schema with Zod
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .length(10, 'Phone number must be exactly 10 characters')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // 2. Initialize React Hook Form with Zod Resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: data.phone || undefined,
      });
      showToast('Account created! Check your email to verify your account.', 'success');
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      let msg = 'Registration failed. Please try again.';
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || msg;
      }
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Animated Glows */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -right-20 w-96 h-96 bg-amber-500 rounded-full blur-[140px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 -left-20 w-96 h-96 bg-emerald-500 rounded-full blur-[140px] pointer-events-none"
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
          <h1 className="text-2xl font-black text-slate-900">Create Your Account</h1>
          <p className="text-xs text-slate-500">
            Register as a restaurant owner to get started
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="Full Name *"
              placeholder="John Doe"
              icon={User}
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-red-500 text-[11px] mt-1 font-medium">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Email Address *"
              type="email"
              placeholder="owner@restaurant.com"
              icon={Mail}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-red-500 text-[11px] mt-1 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Phone Number"
              placeholder="0911223344"
              icon={Phone}
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-red-500 text-[11px] mt-1 font-medium">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Password *"
              type="password"
              placeholder="At least 8 chars, 1 uppercase, 1 symbol"
              icon={Lock}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-red-500 text-[11px] mt-1 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Confirm Password *"
              type="password"
              placeholder="Repeat your password"
              icon={Lock}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-[11px] mt-1 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </motion.div>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-amber-600 hover:underline">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};