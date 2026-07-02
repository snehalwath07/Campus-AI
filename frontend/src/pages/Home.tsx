import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Sparkles, GraduationCap, Search, Cpu, Stethoscope,
  Briefcase, Scale, Palette, Coins, FlaskConical, PenTool,
  Building, Pill, Compass, Clock, MapPin, ChevronRight,
  CheckCircle, ArrowUpRight, Github, Twitter, Linkedin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

// Mock explore history
interface HistoryItem {
  id: string;
  college: string;
  course: string;
  lastViewed: string;
}

// Stream definitions
interface StreamItem {
  name: string;
  icon: React.ReactNode;
  count: string;
  color: string;
}

// Popular college definitions
interface CollegeItem {
  id: string;
  name: string;
  state: string;
  initials: string;
  gradient: string;
}

export const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Home');

  // Search history state (interactive)
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: '1', college: 'IIT Delhi', course: 'B.Tech Computer Science', lastViewed: '2 hours ago' },
    { id: '2', college: 'IIM Ahmedabad', course: 'MBA (General Management)', lastViewed: '1 day ago' },
  ]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed.');
    }
  };

  // Redirection helpers
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a query or selection to consult.');
      return;
    }
    navigate(`/ai-chat?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleChipClick = (query: string) => {
    navigate(`/ai-chat?q=${encodeURIComponent(query)}`);
  };

  const handleClearHistory = () => {
    setHistory([]);
    toast.success('Search history cleared.');
  };

  // Nav menu links
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "AI Counselor", path: "/ai-chat" },
    { label: "Admission Planner", path: "/planner" },
    { label: "Compare Colleges", path: "/compare" },
    { label: "Saved Colleges", path: "/saved" },
    { label: "Profile", path: "/profile" }
  ];

  // Stream Cards (Section 2)
  const streams: StreamItem[] = [
    { name: 'Engineering', icon: <Cpu className="h-5 w-5" />, count: '2,400+ Colleges', color: 'from-blue-500/20 to-indigo-500/20 text-blue-400' },
    { name: 'Medical', icon: <Stethoscope className="h-5 w-5" />, count: '600+ Colleges', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400' },
    { name: 'Management', icon: <Briefcase className="h-5 w-5" />, count: '1,800+ Colleges', color: 'from-purple-500/20 to-pink-500/20 text-purple-400' },
    { name: 'Law', icon: <Scale className="h-5 w-5" />, count: '450+ Colleges', color: 'from-amber-500/20 to-orange-500/20 text-amber-400' },
    { name: 'Arts', icon: <Palette className="h-5 w-5" />, count: '1,200+ Colleges', color: 'from-pink-500/20 to-rose-500/20 text-pink-400' },
    { name: 'Commerce', icon: <Coins className="h-5 w-5" />, count: '1,500+ Colleges', color: 'from-yellow-500/20 to-amber-500/20 text-yellow-400' },
    { name: 'Science', icon: <FlaskConical className="h-5 w-5" />, count: '2,000+ Colleges', color: 'from-cyan-500/20 to-sky-500/20 text-cyan-400' },
    { name: 'Design', icon: <PenTool className="h-5 w-5" />, count: '300+ Colleges', color: 'from-violet-500/20 to-purple-500/20 text-violet-400' },
    { name: 'Architecture', icon: <Building className="h-5 w-5" />, count: '280+ Colleges', color: 'from-indigo-500/20 to-blue-500/20 text-indigo-400' },
    { name: 'Pharmacy', icon: <Pill className="h-5 w-5" />, count: '800+ Colleges', color: 'from-rose-500/20 to-red-500/20 text-rose-400' },
  ];

  // Popular Colleges (Section 4)
  const popularColleges: CollegeItem[] = [
    { id: '1', name: 'IIT Delhi', state: 'Delhi', initials: 'IITD', gradient: 'from-indigo-600 to-blue-500' },
    { id: '2', name: 'IIT Bombay', state: 'Maharashtra', initials: 'IITB', gradient: 'from-purple-600 to-indigo-500' },
    { id: '3', name: 'IIM Ahmedabad', state: 'Gujarat', initials: 'IIMA', gradient: 'from-amber-600 to-orange-500' },
    { id: '4', name: 'AIIMS New Delhi', state: 'Delhi', initials: 'AIIMS', gradient: 'from-teal-600 to-emerald-500' },
    { id: '5', name: 'NLSIU Bengaluru', state: 'Karnataka', initials: 'NLS', gradient: 'from-rose-600 to-pink-500' },
    { id: '6', name: 'BITS Pilani', state: 'Rajasthan', initials: 'BITS', gradient: 'from-sky-600 to-blue-500' },
  ];

  // Popular search tags (Section 1)
  const searchChips = [
    'Engineering Colleges',
    'Medical Colleges',
    'MBA Colleges',
    'Law Colleges',
    'Computer Science',
    'AI & Data Science',
    'BCA',
    'BBA'
  ];

  // Recommended streams (Section 5)
  const recommendations = [
    { stream: 'Computer Science', reason: 'Based on your interest in software design indicators.' },
    { stream: 'AI & Data Science', reason: 'Based on your focus on mathematical modeling.' },
    { stream: 'Cyber Security', reason: 'High demand area matching technological aptitude.' },
    { stream: 'BCA', reason: 'Great practical learning track for programming.' },
    { stream: 'BBA', reason: 'Aligns with organizational leadership markers.' }
  ];

  // Journey steps (Section 6)
  const journeySteps = [
    { id: 'explore', name: 'Explore Colleges', active: true, desc: 'Find parameters' },
    { id: 'shortlist', name: 'Shortlist', active: false, desc: 'Add favorites' },
    { id: 'compare', name: 'Compare', active: false, desc: 'Side-by-side checks' },
    { id: 'plan', name: 'Plan', active: false, desc: 'Track deadlines' },
    { id: 'apply', name: 'Apply', active: false, desc: 'Central applications' }
  ];

  return (
    <div className="relative min-h-screen w-screen bg-dark-bg flex flex-col overflow-x-hidden grid-bg">
      {/* Background glow meshes */}
      <div className="absolute inset-0 bg-glow-purple-1 pointer-events-none" />
      <div className="absolute inset-0 bg-glow-purple-2 pointer-events-none pb-40" />

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between shadow-lg">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-md shadow-brand-primary/25">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1">
            CampusAI <Sparkles className="h-3.5 w-3.5 text-brand-secondary animate-pulse" />
          </span>
        </div>

        {/* Desktop Menu links */}
        <div className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((tab) => {
            const isActive = tab.label === activeTab;
            return (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveTab(tab.label);
                  navigate(tab.path);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all relative ${isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-brand-primary/10 border border-brand-primary/20 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Profile Avatar & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8.5 w-8.5 rounded-full bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-xs font-bold text-brand-secondary">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <span className="hidden sm:inline text-xs font-bold text-zinc-300">
              {user?.full_name || 'Student'}
            </span>
          </div>

          <Button
            onClick={handleLogout}
            variant="ghost"
            className="py-1.5 px-3 rounded-lg flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/10 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-10 md:py-16 space-y-16 relative z-10">

        {/* SECTION 1: Welcome Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8 max-w-3xl mx-auto"
        >
          <div className="space-y-3">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-brand-secondary text-[11px] font-bold tracking-wide uppercase"
            >
              <Compass className="h-3.5 w-3.5" /> India's Central Admission hub
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Hi, <span className="text-brand-secondary text-glow-purple">{user?.full_name || 'Student'}</span> 👋
            </h1>
            <p className="text-lg text-zinc-300 font-semibold">
              Welcome back to CampusAI
            </p>
            <p className="text-sm text-zinc-400">
              Your AI Admission Assistant • One Platform. Every College. Every Course.
            </p>
          </div>

          {/* Search bar container */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Ask about any college, course or admission..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-4 pl-13 pr-24 rounded-2xl glass-input text-base font-medium shadow-xl border border-white/8 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold py-2 px-5 rounded-xl text-xs transition-colors shadow-lg shadow-brand-primary/20 flex items-center gap-1 cursor-pointer"
              >
                Search <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>

          {/* Popular search chips */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
              Popular Searches
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
              {searchChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="py-1 px-3 rounded-lg bg-white/3 hover:bg-white/7 border border-white/5 hover:border-brand-primary/20 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* SECTION 3: Continue Exploring (Conditional search history) */}
        <AnimatePresence>
          {history.length > 0 && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 text-left overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-secondary" /> Continue Exploring
                </h3>
                <button
                  onClick={handleClearHistory}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Clear History
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl glass-card flex items-center justify-between border border-white/5 group"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-brand-secondary">{item.course}</div>
                      <div className="text-sm font-bold text-white">{item.college}</div>
                      <div className="text-[10px] text-zinc-500 font-medium">Last viewed {item.lastViewed}</div>
                    </div>
                    <button
                      onClick={() => handleChipClick(`Tell me about ${item.college} ${item.course}`)}
                      className="h-9 w-9 rounded-xl bg-white/3 hover:bg-brand-primary group-hover:bg-brand-primary/10 border border-white/5 group-hover:border-brand-primary/30 flex items-center justify-center text-zinc-400 group-hover:text-brand-secondary transition-all cursor-pointer"
                    >
                      <ChevronRight className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* SECTION 2: Explore by Stream */}
        <section className="space-y-6 text-left">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">
            Explore by Stream
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {streams.map((stream, idx) => (
              <motion.button
                key={stream.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileHover={{ y: -6, scale: 1.015 }}
                onClick={() => handleChipClick(`Show me top ${stream.name} colleges in India`)}
                className="p-5 rounded-2xl glass-card text-left border border-white/5 flex flex-col justify-between gap-4 cursor-pointer group h-36"
              >
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stream.color} border border-white/5 w-fit`}>
                  {stream.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">
                    {stream.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                    {stream.count}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* SECTION 4: Popular Colleges */}
        <section className="space-y-6 text-left">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">
            Popular Colleges
          </h3>
          {/* Horizontal scroll viewport wrapper */}
          <div className="relative w-full">
            <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth">
              {popularColleges.map((college) => (
                <div
                  key={college.id}
                  className="snap-start shrink-0 w-64 p-5 rounded-2xl glass-card border border-white/5 flex flex-col gap-4 shadow-xl"
                >
                  {/* College Image Placeholder (Gradient overlay logo block) */}
                  <div className={`h-32 rounded-xl bg-gradient-to-tr ${college.gradient} flex items-center justify-center text-2xl font-black text-white/40 tracking-wider shadow-inner relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                    <span className="relative z-10 select-none text-glow-purple">{college.initials}</span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-zinc-200">{college.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" /> {college.state}, India
                    </p>
                  </div>

                  <Button
                    onClick={() => handleChipClick(`Tell me about ${college.name}`)}
                    variant="secondary"
                    className="w-full py-1.5 text-xs font-bold bg-white/4 border-white/5 hover:bg-white/8 hover:text-white"
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: Recommended For You */}
        <section className="space-y-6 text-left">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">
            Recommended For You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {recommendations.map((item) => (
              <div
                key={item.stream}
                className="p-5 rounded-2xl glass-card border border-white/5 flex flex-col justify-between gap-3 bg-zinc-950/20"
              >
                <div>
                  <span className="text-[9px] font-bold text-brand-secondary bg-brand-primary/10 border border-brand-primary/20 py-0.5 px-2 rounded-full uppercase tracking-wider">
                    Recommended
                  </span>
                  <h4 className="text-sm font-bold text-white mt-2.5">{item.stream}</h4>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: Admission Journey */}
        <section className="space-y-8 text-left">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">
            Your Admission Journey
          </h3>
          <div className="relative py-4">
            {/* Connecting Timeline Line */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-0 right-0 h-0.5 bg-zinc-800 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 relative z-10">
              {journeySteps.map((step, idx) => (
                <div
                  key={step.id}
                  className="flex md:flex-col items-center md:text-center gap-4 md:gap-3"
                >
                  {/* Step node sphere */}
                  <div
                    className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-extrabold shrink-0 shadow-lg ${step.active
                      ? 'bg-brand-primary border-brand-secondary text-white shadow-brand-primary/30 animate-pulse'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}
                  >
                    {step.active ? (
                      <CheckCircle className="h-4.5 w-4.5 text-white" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  <div className="space-y-0.5 text-left md:text-center">
                    <h4 className={`text-xs font-bold ${step.active ? 'text-brand-secondary' : 'text-zinc-400'}`}>
                      {step.name}
                    </h4>
                    <p className="text-[9px] text-zinc-500 font-semibold">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* SECTION 7: FOOTER */}
      <footer className="mt-auto w-full glass-panel border-t border-white/5 py-10 px-6 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-zinc-950/45">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand-primary flex items-center justify-center text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">CampusAI</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-medium mt-1">
            India's AI Admission Assistant • © 2026
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-zinc-400">
          <a href="#about" className="hover:text-zinc-200 transition-colors">About</a>
          <a href="#privacy" className="hover:text-zinc-200 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-zinc-200 transition-colors">Terms of Service</a>
          <a href="#contact" className="hover:text-zinc-200 transition-colors">Contact</a>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4 text-zinc-400">
          <a href="#twitter" className="hover:text-white transition-colors">
            <Twitter className="h-4.5 w-4.5" />
          </a>
          <a href="#github" className="hover:text-white transition-colors">
            <Github className="h-4.5 w-4.5" />
          </a>
          <a href="#linkedin" className="hover:text-white transition-colors">
            <Linkedin className="h-4.5 w-4.5" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
