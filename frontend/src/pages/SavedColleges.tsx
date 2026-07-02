import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Sparkles, Search, Trash2, ArrowUpDown, 
  ArrowRight, ShieldAlert, Heart, Calendar, ArrowUpRight, 
  MapPin, CheckSquare, Square
} from 'lucide-react';
import { savedService } from '../services/saved';
import type { SavedCollege } from '../types';
import Button from '../components/ui/Button';

export const SavedColleges: React.FC = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<SavedCollege[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'saved_at' | 'fees'>('saved_at');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const fetchBookmarks = async () => {
    setIsLoading(true);
    try {
      const data = await savedService.getAll();
      setBookmarks(data);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load saved colleges.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemove = async (collegeId: string) => {
    try {
      await savedService.unsave(collegeId);
      setBookmarks(bookmarks.filter(b => b.college_id !== collegeId));
      setSelectedForCompare(selectedForCompare.filter(id => id !== collegeId));
      toast.success('College removed from bookmarks.');
    } catch (err) {
      toast.error('Failed to remove bookmark.');
    }
  };

  // Toggle selection for comparison
  const handleToggleCompare = (collegeId: string) => {
    if (selectedForCompare.includes(collegeId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== collegeId));
    } else {
      if (selectedForCompare.length >= 2) {
        toast.warning('You can compare a maximum of 2 colleges side-by-side.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, collegeId]);
    }
  };

  const handleTriggerCompare = () => {
    if (selectedForCompare.length !== 2) {
      toast.error('Please select exactly 2 colleges to compare.');
      return;
    }
    // Navigate to compare page with college IDs as search params
    const colA = selectedForCompare[0];
    const colB = selectedForCompare[1];
    navigate(`/compare?colA=${colA}&colB=${colB}`);
  };

  // Filter and Sort bookmarks
  const filteredBookmarks = bookmarks.filter(item => {
    if (!item.college_details) return false;
    const name = item.college_details.name.toLowerCase();
    const type = item.college_details.college_type.toLowerCase();
    const city = item.college_details.city.toLowerCase();
    const state = item.college_details.state.toLowerCase();
    const s = searchTerm.toLowerCase();
    return name.includes(s) || type.includes(s) || city.includes(s) || state.includes(s);
  });

  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
    if (!a.college_details || !b.college_details) return 0;
    if (sortBy === 'name') {
      return a.college_details.name.localeCompare(b.college_details.name);
    } else if (sortBy === 'fees') {
      return a.college_details.approximate_fees - b.college_details.approximate_fees;
    } else {
      return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime();
    }
  });

  return (
    <div className="relative min-h-screen w-screen bg-dark-bg flex flex-col overflow-x-hidden grid-bg">
      {/* Glow meshes */}
      <div className="absolute inset-0 bg-glow-purple-1 pointer-events-none" />
      <div className="absolute inset-0 bg-glow-purple-2 pointer-events-none" />

      {/* HEADER NAVBAR */}
      <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between shadow-lg">
        <Link to="/home" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-md shadow-brand-primary/25">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1">
            CampusAI <Sparkles className="h-3.5 w-3.5 text-brand-secondary animate-pulse" />
          </span>
        </Link>
        <Link
          to="/home"
          className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowRight className="h-4 w-4 rotate-180" /> Back to Console
        </Link>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-10 relative z-10 space-y-8">
        
        {/* Title Block */}
        <div className="text-left space-y-1.5">
          <span className="text-xs uppercase font-bold tracking-widest text-brand-secondary">Bookmarks</span>
          <h1 className="text-3xl font-extrabold text-white text-glow-purple flex items-center gap-2">
            Saved Colleges <Heart className="h-6 w-6 text-brand-primary fill-brand-primary" />
          </h1>
          <p className="text-xs text-zinc-400">
            Keep track of shortlists and perform quick side-by-side comparison checks.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-zinc-950/45 p-4 rounded-2xl border border-white/5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-4.5 w-4.5" />
            <input
              type="text"
              placeholder="Search by college name, stream, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-11 pr-4 rounded-xl glass-input text-xs font-medium border border-zinc-800"
            />
          </div>

          {/* Sort & Compare */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
              <ArrowUpDown className="h-4 w-4 shrink-0" /> Sort
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-lg py-1.5 px-3.5 focus:outline-none focus:border-brand-primary cursor-pointer"
              >
                <option value="saved_at">Date Saved</option>
                <option value="name">Name</option>
                <option value="fees">Fees</option>
              </select>
            </div>

            {selectedForCompare.length === 2 && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Button
                  onClick={handleTriggerCompare}
                  variant="primary"
                  className="py-1.5 px-4 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-primary/25"
                >
                  Compare Selected (2) <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bookmarks Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-56 rounded-2xl border border-white/5 bg-zinc-950/20 animate-pulse" />
            ))}
          </div>
        ) : sortedBookmarks.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl glass-panel border border-white/5 space-y-4 max-w-lg mx-auto">
            <div className="mx-auto h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-200">No Saved Colleges Found</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You haven't bookmarked any colleges yet. Go to the Home Page or ask the AI Counselor to find colleges, then bookmark them to display here.
            </p>
            <div className="pt-2">
              <Link
                to="/home"
                className="inline-flex items-center gap-1 text-xs text-brand-secondary font-bold hover:underline"
              >
                Explore Colleges now <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatePresence>
              {sortedBookmarks.map((item) => {
                const college = item.college_details!;
                const isSelected = selectedForCompare.includes(item.college_id);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="p-5 rounded-2xl glass-card border border-white/5 flex flex-col justify-between gap-4 group relative overflow-hidden"
                  >
                    {/* Select box for compare */}
                    <button
                      onClick={() => handleToggleCompare(item.college_id)}
                      className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4.5 w-4.5 text-brand-secondary" />
                      ) : (
                        <Square className="h-4.5 w-4.5 text-zinc-700" />
                      )}
                    </button>

                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-brand-secondary bg-brand-primary/10 border border-brand-primary/20 py-0.5 px-2.5 rounded-full uppercase tracking-wider">
                        {college.college_type}
                      </span>
                      <h3 className="text-base font-bold text-zinc-100 group-hover:text-brand-secondary transition-colors text-left pt-1">
                        {college.name}
                      </h3>
                      <p className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1 text-left">
                        <MapPin className="h-3 w-3 shrink-0" /> {college.city}, {college.state}
                      </p>
                      <p className="text-xs text-zinc-400 line-clamp-3 text-left leading-relaxed">
                        {college.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="h-[1px] w-full bg-zinc-800" />
                      
                      <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Saved:</span>
                        <span>{new Date(item.saved_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/ai-chat?q=Tell me about ${college.name}`}
                          className="flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold bg-brand-primary/10 border border-brand-primary/25 text-brand-secondary hover:bg-brand-primary hover:text-white transition-all text-center flex items-center justify-center gap-1"
                        >
                          Consult AI <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleRemove(item.college_id)}
                          className="py-1.5 px-2.5 rounded-lg border border-red-500/10 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                          title="Remove bookmark"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedColleges;
