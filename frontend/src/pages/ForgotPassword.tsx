import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, ArrowLeft, ExternalLink } from 'lucide-react';
import { authService } from '../services/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
});

type ForgotSchema = z.infer<typeof forgotSchema>;

export const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ message: string; resetUrl?: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotSchema>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotSchema) => {
    setIsLoading(true);
    setSuccessInfo(null);
    try {
      const response = await authService.forgotPassword(data.email);
      setSuccessInfo({
        message: response.message,
        resetUrl: response.reset_url,
      });
      toast.success('Password reset link generated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (successInfo) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3 text-glow-purple">Reset Link Generated</h2>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6">
          {successInfo.message}
        </p>

        {successInfo.resetUrl && (
          <div className="p-4 rounded-2xl glass-card text-left border border-brand-primary/20 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-brand-primary/10 text-brand-secondary text-[9px] font-bold uppercase tracking-wider py-1 px-3.5 rounded-bl-xl border-l border-b border-brand-primary/15">
              Testing Mode
            </div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Reset URL</div>
            <p className="text-xs text-brand-secondary break-all font-mono select-all bg-zinc-950/50 p-2.5 rounded-lg border border-white/5">
              {window.location.origin + successInfo.resetUrl}
            </p>
            <div className="mt-3 flex justify-end">
              <Link
                to={successInfo.resetUrl}
                className="flex items-center gap-1.5 text-xs text-white font-bold bg-brand-primary/80 hover:bg-brand-primary py-1.5 px-3 rounded-lg transition-colors shadow-lg shadow-brand-primary/20"
              >
                Go to Reset Page <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 font-semibold transition-colors mt-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
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
        Recover Password
      </h2>
      <p className="text-sm text-zinc-400 mb-8">
        Enter your email address and we'll generate a secure password reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Registered Email"
          type="email"
          placeholder="name@college.edu.in"
          icon={<Mail className="h-4.5 w-4.5" />}
          error={errors.email?.message}
          disabled={isLoading}
          {...register('email')}
        />

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
          Send Reset Link
        </Button>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 font-semibold transition-colors mt-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
        </Link>
      </form>
    </motion.div>
  );
};

export default ForgotPassword;
