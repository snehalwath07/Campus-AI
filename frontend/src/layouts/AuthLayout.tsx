import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles, MapPin, BookOpen, Compass } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-screen bg-dark-bg flex items-center justify-center overflow-hidden grid-bg">
      {/* Background glow meshes */}
      <div className="absolute inset-0 bg-glow-purple-1 pointer-events-none" />
      <div className="absolute inset-0 bg-glow-purple-2 pointer-events-none" />
      <div className="absolute inset-0 bg-glow-purple-3 pointer-events-none" />

      {/* Main container */}
      <div className="relative z-10 w-full max-w-6xl min-h-[680px] m-4 lg:m-8 grid grid-cols-1 lg:grid-cols-12 glass-panel rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Left Side: Branding & Premium Animation (Hidden on mobile/tablet) */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5 bg-gradient-to-br from-indigo-950/20 via-zinc-950/40 to-purple-950/20">
          
          {/* Ambient light inside left pane */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-brand-primary/10 filter blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-brand-secondary/5 filter blur-3xl pointer-events-none" />

          {/* Logo & Header */}
          <div className="relative z-20 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/30">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                CampusAI <Sparkles className="h-4 w-4 text-brand-secondary animate-pulse" />
              </span>
            </div>
          </div>

          {/* Interactive Abstract Admission Illustration */}
          <div className="relative z-10 my-8 flex items-center justify-center flex-1">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Central glowing core */}
              <motion.div 
                animate={{ scale: [1, 1.08, 1], rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute w-40 h-40 rounded-full bg-gradient-to-tr from-brand-primary/20 to-purple-500/20 border border-brand-primary/30 filter blur-xl"
              />
              
              {/* Floating College admission cards (Glassmorphic Mockups) */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -left-4 w-40 p-3.5 rounded-2xl glass-card text-left flex items-start gap-3 border border-white/10"
              >
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-brand-secondary">
                  <Compass className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-brand-secondary">AI Guide</div>
                  <div className="text-[11px] font-semibold text-zinc-200 leading-tight">Every College</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-2 -right-4 w-44 p-3.5 rounded-2xl glass-card text-left flex items-start gap-3 border border-white/10"
              >
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">API Active</div>
                  <div className="text-[11px] font-semibold text-zinc-200 leading-tight">Every Course</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.03, 1], rotate: [0, 2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 p-4 rounded-2xl glass-card text-center border border-white/15 shadow-xl shadow-black/40"
              >
                <div className="mx-auto w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-secondary mb-2">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="text-xs font-bold text-zinc-100">India Admissions</div>
                <div className="text-[10px] text-zinc-400 mt-1">One Central Platform</div>
              </motion.div>
            </div>
          </div>

          {/* Tagline & Info */}
          <div className="relative z-20 text-left">
            <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
              India's AI Admission Assistant
            </h1>
            <p className="text-xs text-brand-secondary font-semibold mt-1 uppercase tracking-widest">
              One Platform. Every College. Every Course.
            </p>
            <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
              Simplify your educational journey with CampusAI. Get personalized insights, validation checks, and seamless admissions.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 flex flex-col justify-center p-8 sm:p-12 md:p-16 relative bg-zinc-950/20">
          {/* Logo visible only on mobile/tablet */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="h-8 w-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">CampusAI</span>
          </div>

          {/* Form Content wrapper */}
          <div className="w-full max-w-md mx-auto">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
