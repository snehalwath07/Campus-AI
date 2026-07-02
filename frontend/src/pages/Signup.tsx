import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PasswordStrength from '../components/ui/PasswordStrength';

const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Name must be at least 2 characters.')
      .max(100, 'Name must be less than 100 characters.'),
    email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type SignupSchema = z.infer<typeof signupSchema>;

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const passwordVal = watch('password', '');

  const onSubmit = async (data: SignupSchema) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const response = await authService.signup({
        full_name: data.fullName,
        email: data.email,
        password: data.password,
      });

      login(response.access_token, response.user);
      toast.success('Account created successfully! Welcome to CampusAI.');
      navigate('/home');
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Failed to create student account.';
      if (err.response && err.response.data) {
        const detail = err.response.data.detail;
        errMsg = typeof detail === 'string' ? detail : 'Invalid registration details.';
      }
      setServerError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="text-center"
    >
      <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 text-glow-purple">
        Create Account
      </h2>
      <p className="text-sm text-zinc-400 mb-6">
        Sign up to start your central college admission experience.
      </p>

      {serverError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-3 text-left">
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Aarav Sharma"
          icon={<User className="h-4.5 w-4.5" />}
          error={errors.fullName?.message}
          disabled={isLoading}
          {...register('fullName')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="aarav@college.edu.in"
          icon={<Mail className="h-4.5 w-4.5" />}
          error={errors.email?.message}
          disabled={isLoading}
          {...register('email')}
        />

        <div className="space-y-1">
          <Input
            label="Password"
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
          icon={<CheckCircle2 className="h-4.5 w-4.5" />}
          error={errors.confirmPassword?.message}
          disabled={isLoading}
          {...register('confirmPassword')}
        />

        <div className="text-left flex flex-col gap-1">
          <label className="flex items-start gap-2.5 text-xs text-zinc-300 font-semibold cursor-pointer select-none leading-relaxed">
            <input
              type="checkbox"
              className="h-4.5 w-4.5 rounded border-zinc-800 bg-zinc-950/40 text-brand-primary focus:ring-0 focus:ring-offset-0 accent-brand-primary mt-0.5 shrink-0"
              disabled={isLoading}
              {...register('acceptTerms')}
            />
            <span>
              I accept the{' '}
              <a href="#terms" className="text-brand-secondary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-brand-secondary hover:underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {errors.acceptTerms && (
            <span className="text-xs font-semibold text-red-400 mt-1">
              {errors.acceptTerms.message}
            </span>
          )}
        </div>

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
          Create Account
        </Button>

        <div className="text-xs text-zinc-400 mt-5">
          Already registered?{' '}
          <Link
            to="/login"
            className="text-brand-secondary hover:text-brand-secondary/80 font-bold transition-colors"
          >
            Sign in here
          </Link>
        </div>
      </form>
    </motion.div>
  );
};

export default Signup;
