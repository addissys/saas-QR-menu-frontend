import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Store, User, Mail, Lock, Phone, QrCode, ArrowLeft } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register({ businessName, fullName, email, password, phone });
      showToast('Account registered successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast('Registration failed', 'error');
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
          <h1 className="text-2xl font-black text-slate-900">Register Restaurant</h1>
          <p className="text-xs text-slate-500">
            Create your multi-branch digital menu SaaS account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Business / Restaurant Name *"
            placeholder="e.g. Bella Italia Bistro"
            icon={Store}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />

          <Input
            label="Owner Full Name *"
            placeholder="John Doe"
            icon={User}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Work Email Address *"
            type="email"
            placeholder="owner@restaurant.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            placeholder="+1 (555) 019-2834"
            icon={Phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Password *"
            type="password"
            placeholder="At least 6 characters"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20"
              isLoading={isLoading}
            >
              Create Business Portal
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