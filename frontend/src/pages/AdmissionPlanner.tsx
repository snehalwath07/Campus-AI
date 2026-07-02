import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Sparkles, Compass, ArrowRight, Download, 
  CheckCircle, Bookmark, Edit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { plannerService } from '../services/planner';
import type { AdmissionRoadmap } from '../types';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const plannerSchema = z.object({
  preferredCourse: z.string().min(1, 'Course preference is required.'),
  preferredState: z.string().min(1, 'State preference is required.'),
  preferredCity: z.string().min(1, 'City preference is required.'),
  marks12: z.coerce.number().min(0, 'Marks must be positive.').max(100, 'Marks cannot exceed 100%.'),
  entranceScore: z.coerce.number().min(0, 'Entrance score must be positive.').optional(),
  category: z.string().min(1, 'Category is required.'),
  budget: z.coerce.number().min(0, 'Budget must be positive.'),
  preferredCollegeType: z.string().min(1, 'College Type preference is required.'),
});

type PlannerSchema = z.infer<typeof plannerSchema>;

export const AdmissionPlanner: React.FC = () => {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<AdmissionRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlannerSchema>({
    resolver: zodResolver(plannerSchema),
    defaultValues: {
      preferredCourse: '',
      preferredState: '',
      preferredCity: '',
      marks12: 0,
      entranceScore: 0,
      category: 'General',
      budget: 1000000,
      preferredCollegeType: 'All',
    },
  });

  // 1. Fetch saved roadmap on mount
  useEffect(() => {
    const fetchSaved = async () => {
      setIsLoading(true);
      try {
        const saved = await plannerService.getSaved();
        if (saved) {
          setRoadmap(saved);
        } else if (user) {
          // Prepopulate inputs from user profile preferences if no saved plan exists
          reset({
            preferredCourse: user.preferences?.preferred_course || '',
            preferredState: user.preferences?.preferred_state || '',
            preferredCity: user.preferences?.preferred_city || '',
            marks12: user.preferences?.marks_12 || 0,
            entranceScore: user.preferences?.entrance_score || 0,
            category: user.preferences?.category || 'General',
            budget: user.preferences?.budget || 1000000,
            preferredCollegeType: user.preferences?.preferred_college_type || 'All',
          });
        }
      } catch (err) {
        toast.error('Failed to load roadmap records.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSaved();
  }, [user, reset]);

  // 2. Submit form to generate roadmap
  const onSubmit = async (data: PlannerSchema) => {
    setIsSubmitting(true);
    try {
      const generated = await plannerService.generate({
        preferred_course: data.preferredCourse,
        preferred_state: data.preferredState,
        preferred_city: data.preferredCity,
        marks_12: data.marks12,
        entrance_score: data.entranceScore || 0,
        category: data.category,
        budget: data.budget,
        preferred_college_type: data.preferredCollegeType,
      });
      setRoadmap(generated);
      setIsEditing(false);
      toast.success('Your Admission Roadmap has been generated successfully!');
    } catch (err) {
      toast.error('Failed to generate roadmap timeline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Save current roadmap to DB
  const handleSaveRoadmap = async () => {
    if (!roadmap) return;
    setIsSaving(true);
    try {
      const saved = await plannerService.save({
        preferred_course: roadmap.preferred_course,
        preferred_state: roadmap.preferred_state,
        preferred_city: roadmap.preferred_city,
        roadmap: roadmap.roadmap,
      });
      setRoadmap(saved);
      toast.success('Roadmap saved to database successfully!');
    } catch (err) {
      toast.error('Failed to save roadmap.');
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Print / Download PDF
  const handleDownloadPDF = () => {
    toast.success('Preparing PDF print preview...');
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  return (
    <div className="relative min-h-screen w-screen bg-dark-bg flex flex-col overflow-x-hidden grid-bg print:bg-white print:text-black">
      {/* Background glows */}
      <div className="absolute inset-0 bg-glow-purple-1 pointer-events-none print:hidden" />
      <div className="absolute inset-0 bg-glow-purple-2 pointer-events-none print:hidden" />

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between shadow-lg print:hidden">
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
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-10 relative z-10 space-y-8 print:p-0 print:m-0">
        
        {/* Title Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 print:border-zinc-300">
          <div className="text-left space-y-1.5">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-secondary print:text-indigo-600">Admission Blueprint</span>
            <h1 className="text-3xl font-extrabold text-white print:text-black text-glow-purple flex items-center gap-2">
              Admission Planner <Compass className="h-6 w-6 text-brand-primary print:text-indigo-600" />
            </h1>
            <p className="text-xs text-zinc-400 print:text-zinc-600">
              Formulate step-by-step admissions roadmaps based on your board percentage and location.
            </p>
          </div>

          {roadmap && !isEditing && (
            <div className="flex gap-3 print:hidden">
              <Button
                onClick={() => setIsEditing(true)}
                variant="secondary"
                className="py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <Edit className="h-4 w-4" /> Edit Roadmap
              </Button>
              <Button
                onClick={handleDownloadPDF}
                variant="secondary"
                className="py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary" />
          </div>
        ) : !roadmap || isEditing ? (
          /* INPUT FORM */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 text-left max-w-2xl mx-auto space-y-6 print:hidden"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-zinc-200">Configure Admission Blueprint</h3>
              <p className="text-xs text-zinc-400">Specify preferences to evaluate eligibility benchmarks and plan admissions.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Preferred Course Stream"
                  type="text"
                  placeholder="B.Tech Computer Science"
                  error={errors.preferredCourse?.message}
                  disabled={isSubmitting}
                  {...register('preferredCourse')}
                />
                
                <Input
                  label="Preferred State Target"
                  type="text"
                  placeholder="Delhi"
                  error={errors.preferredState?.message}
                  disabled={isSubmitting}
                  {...register('preferredState')}
                />

                <Input
                  label="Preferred City"
                  type="text"
                  placeholder="New Delhi"
                  error={errors.preferredCity?.message}
                  disabled={isSubmitting}
                  {...register('preferredCity')}
                />

                <Input
                  label="12th Board Marks (%)"
                  type="number"
                  step="0.01"
                  placeholder="85.5"
                  error={errors.marks12?.message}
                  disabled={isSubmitting}
                  {...register('marks12')}
                />

                <Input
                  label="Entrance Score (JEE/NEET/CLAT - Optional)"
                  type="number"
                  placeholder="120"
                  error={errors.entranceScore?.message}
                  disabled={isSubmitting}
                  {...register('entranceScore')}
                />

                <div className="w-full flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Category Group
                  </label>
                  <select
                    className="w-full py-2.5 px-4 rounded-xl glass-input text-sm font-medium border border-zinc-800 focus:outline-none"
                    disabled={isSubmitting}
                    {...register('category')}
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

                <Input
                  label="Maximum Budget Limit (Rs/Year)"
                  type="number"
                  placeholder="300000"
                  error={errors.budget?.message}
                  disabled={isSubmitting}
                  {...register('budget')}
                />

                <div className="w-full flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Preferred College Type
                  </label>
                  <select
                    className="w-full py-2.5 px-4 rounded-xl glass-input text-sm font-medium border border-zinc-800 focus:outline-none"
                    disabled={isSubmitting}
                    {...register('preferredCollegeType')}
                  >
                    <option value="All">All Types</option>
                    <option value="Public">Government / Public Only</option>
                    <option value="Private">Private Deemed Only</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button type="submit" variant="primary" className="flex-1 font-bold" isLoading={isSubmitting}>
                  Generate Roadmap Timeline
                </Button>
                {roadmap && (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    variant="secondary"
                    className="font-bold flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </motion.div>
        ) : (
          /* ROADMAP OUTPUT TIMELINE */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Header info */}
            <div className="glass-card p-5 rounded-2xl border border-brand-primary/20 bg-zinc-950/20 text-left print:bg-zinc-50 print:border-zinc-300">
              <h3 className="text-sm font-bold text-zinc-200 print:text-black">Target Parameters:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-3 text-xs font-semibold text-zinc-400 print:text-zinc-700">
                <div>Course: <span className="text-zinc-200 print:text-black">{roadmap.preferred_course}</span></div>
                <div>Location: <span className="text-zinc-200 print:text-black">{roadmap.preferred_city}, {roadmap.preferred_state}</span></div>
                <div>Created: <span className="text-zinc-200 print:text-black">{new Date(roadmap.created_at).toLocaleDateString()}</span></div>
                
                {/* Save button block (Hidden during printing) */}
                <div className="col-span-2 sm:col-span-1 text-right flex justify-end print:hidden">
                  <button
                    onClick={handleSaveRoadmap}
                    disabled={isSaving}
                    className="flex items-center gap-1 text-[10px] uppercase font-bold text-brand-secondary hover:text-white transition-colors cursor-pointer"
                  >
                    <Bookmark className="h-3.5 w-3.5" /> {isSaving ? 'Saving...' : 'Save Roadmap'}
                  </button>
                </div>
              </div>
            </div>

            {/* Vertical timeline timeline rendering */}
            <div className="relative text-left pl-6 sm:pl-8 py-2">
              {/* Connecting Vertical Timeline Line */}
              <div className="absolute left-3.5 sm:left-4 top-0 bottom-0 w-0.5 bg-zinc-800 print:bg-zinc-300 pointer-events-none" />

              <div className="space-y-10">
                {roadmap.roadmap.map((step) => {
                  const isActive = step.status === 'active';
                  const isCompleted = step.status === 'completed';
                  return (
                    <div key={step.step} className="relative flex flex-col gap-2 group">
                      
                      {/* Step Indicator Sphere */}
                      <div
                        className={`absolute -left-10.5 sm:-left-12 top-0 h-8 w-8 rounded-full border flex items-center justify-center text-xs font-extrabold shadow-lg ${
                          isActive
                            ? 'bg-brand-primary border-brand-secondary text-white shadow-brand-primary/20 animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4.5 w-4.5" />
                        ) : (
                          step.step
                        )}
                      </div>

                      {/* Content block */}
                      <div className="glass-card p-5 rounded-2xl border border-white/5 group-hover:border-brand-primary/20 transition-colors bg-zinc-950/20 print:bg-white print:border-zinc-200">
                        <h3 className={`text-base font-bold flex items-center gap-2 ${isActive ? 'text-brand-secondary print:text-indigo-600' : 'text-zinc-200 print:text-black'}`}>
                          {step.title}
                          {isActive && (
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-secondary bg-brand-primary/10 border border-brand-primary/20 py-0.5 px-2 rounded-full print:hidden">
                              Active Task
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-zinc-400 print:text-zinc-700 leading-relaxed mt-2">
                          {step.details}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AdmissionPlanner;
