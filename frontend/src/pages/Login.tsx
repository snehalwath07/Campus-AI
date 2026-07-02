import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean().default(false),
});

type LoginSchema = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
        remember_me: data.rememberMe,
      });
      
      login(response.access_token, response.user);
      toast.success('Welcome back to CampusAI!');
      navigate('/home');
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Failed to connect to authentication server.';
      if (err.response && err.response.data) {
        const detail = err.response.data.detail;
        errMsg = typeof detail === 'string' ? detail : 'Invalid login credentials.';
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
        Access Account
      </h2>
      <p className="text-sm text-zinc-400 mb-8">
        Welcome back! Log in to access your admission control center.
      </p>

      {serverError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-3 text-left">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@college.edu.in"
          icon={<Mail className="h-4.5 w-4.5" />}
          error={errors.email?.message}
          disabled={isLoading}
          {...register('email')}
        />

        <Input
          label="Security Credentials"
          type="password"
          placeholder="••••••••••••"
          icon={<Lock className="h-4.5 w-4.5" />}
          error={errors.password?.message}
          disabled={isLoading}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-zinc-300 font-semibold cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-800 bg-zinc-950/40 text-brand-primary focus:ring-0 focus:ring-offset-0 accent-brand-primary"
              disabled={isLoading}
              {...register('rememberMe')}
            />
            Remember Me
          </label>
          <Link
            to="/forgot-password"
            className="text-brand-secondary hover:text-brand-secondary/80 font-bold transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
          Sign In
        </Button>

        <div className="text-xs text-zinc-400 mt-6">
          New to CampusAI?{' '}
          <Link
            to="/signup"
            className="text-brand-secondary hover:text-brand-secondary/80 font-bold transition-colors"
          >
            Create student account
          </Link>
        </div>
      </form>
    </motion.div>
  );
};

export default Login;
