import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import { authService } from '../services/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PasswordStrength from '../components/ui/PasswordStrength';

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type ResetSchema = z.infer<typeof resetSchema>;

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetSchema>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const passwordVal = watch('password', '');

  const onSubmit = async (data: ResetSchema) => {
    if (!token) {
      toast.error('The password reset token is missing from the URL.');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword({
        token,
        password: data.password,
      });
      setIsSuccess(true);
      toast.success('Your password has been successfully updated.');
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Failed to reset password. The link may have expired or is invalid.';
      if (err.response && err.response.data) {
        const detail = err.response.data.detail;
        errMsg = typeof detail === 'string' ? detail : errMsg;
      }
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Invalid Reset URL</h2>
        <p className="text-sm text-zinc-400 mb-6">
          This password reset request lacks a valid session token. Please request another reset link.
        </p>
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-2 text-xs text-brand-secondary hover:text-brand-secondary/80 font-bold transition-colors"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3 text-glow-purple">Password Updated</h2>
        <p className="text-sm text-zinc-400 leading-relaxed mb-8">
          Your credentials have been successfully updated. You can now use your new password to sign in.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 text-sm font-bold bg-brand-primary hover:bg-brand-primary/95 text-white py-2.5 px-6 rounded-xl transition-colors w-full shadow-lg shadow-brand-primary/25"
        >
          Sign In Now
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="text-center"
    >
      <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 text-glow-purple">
        Reset Password
      </h2>
      <p className="text-sm text-zinc-400 mb-8">
        Create a new secure password for your CampusAI account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-4.5 w-4.5" />}
            error={errors.password?.message}
            disabled={isLoading}
            {...register('password')}
          />
          <PasswordStrength password={passwordVal} />
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="h-4.5 w-4.5" />}
          error={errors.confirmPassword?.message}
          disabled={isLoading}
          {...register('confirmPassword')}
        />

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
          Update Password
        </Button>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 font-semibold transition-colors mt-6"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel and Back
        </Link>
      </form>
    </motion.div>
  );
};

export default ResetPassword;
