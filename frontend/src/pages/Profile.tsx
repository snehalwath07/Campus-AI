import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { 
  GraduationCap, Sparkles, User, Mail, ShieldCheck, 
  Edit3, Save, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profile';
import type { UserPreferences } from '../types';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters.').max(100),
  preferredState: z.string().min(1, 'Preferred State is required.'),
  preferredCity: z.string().min(1, 'Preferred City is required.'),
  preferredCourse: z.string().min(1, 'Preferred Course is required.'),
  category: z.string().min(1, 'Category is required.'),
  budget: z.coerce.number().min(0, 'Budget must be positive.'),
  marks12: z.coerce.number().min(0, 'Marks must be positive.').max(100, 'Marks cannot exceed 100%.'),
  entranceScore: z.coerce.number().min(0, 'Entrance Score must be positive.').optional(),
  preferredCollegeType: z.string().min(1, 'Preferred College Type is required.'),
});

type ProfileSchema = z.infer<typeof profileSchema>;

export const Profile: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      preferredState: '',
      preferredCity: '',
      preferredCourse: '',
      category: 'General',
      budget: 0,
      marks12: 0,
      entranceScore: 0,
      preferredCollegeType: 'All',
    },
  });

  // Prepopulate form on mount or when user data loads
  useEffect(() => {
    if (user) {
      reset({
        fullName: user.full_name,
        preferredState: user.preferences?.preferred_state || '',
        preferredCity: user.preferences?.preferred_city || '',
        preferredCourse: user.preferences?.preferred_course || '',
        category: user.preferences?.category || 'General',
        budget: user.preferences?.budget || 0,
        marks12: user.preferences?.marks_12 || 0,
        entranceScore: user.preferences?.entrance_score || 0,
        preferredCollegeType: user.preferences?.preferred_college_type || 'All',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileSchema) => {
    setIsLoading(true);
    try {
      const preferencesPayload: UserPreferences = {
        preferred_state: data.preferredState,
        preferred_city: data.preferredCity,
        preferred_course: data.preferredCourse,
        category: data.category,
        budget: data.budget,
        marks_12: data.marks12,
        entrance_score: data.entranceScore || 0,
        preferred_college_type: data.preferredCollegeType,
      };

      await profileService.update({
        full_name: data.fullName,
        preferences: preferencesPayload,
      });

      await checkAuth(); // Reload context
      setIsEditing(false);
      toast.success('Profile details updated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update profile settings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-dark-bg flex flex-col overflow-x-hidden grid-bg">
      {/* Background glow meshes */}
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
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-10 relative z-10 space-y-8">
        
        {/* Title Block */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="text-left space-y-1.5">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-secondary">Settings</span>
            <h1 className="text-3xl font-extrabold text-white text-glow-purple flex items-center gap-2">
              Student Profile <User className="h-6 w-6 text-brand-primary" />
            </h1>
            <p className="text-xs text-zinc-400">
              Manage your academic credentials, preference targets, and budget filters.
            </p>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="secondary"
              className="py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" /> Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Details Layout */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left Card: Account Card (Initials, static items) */}
            <div className="md:col-span-4 glass-card p-6 rounded-3xl border border-white/5 flex flex-col items-center gap-4 text-center">
              <div className="h-20 w-20 rounded-full bg-brand-primary/10 border-2 border-brand-primary flex items-center justify-center text-2xl font-black text-brand-secondary shadow-lg shadow-brand-primary/20">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
              </div>
              
              <div className="space-y-1 w-full">
                <h3 className="text-lg font-bold text-white leading-tight">
                  {user?.full_name || 'Student'}
                </h3>
                <p className="text-xs text-zinc-500 font-semibold flex items-center justify-center gap-1">
                  <Mail className="h-3.5 w-3.5 shrink-0" /> {user?.email}
                </p>
              </div>

              <div className="h-[1px] w-full bg-zinc-800 my-1" />

              <div className="w-full flex items-center gap-2 justify-center text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-3 rounded-full">
                <ShieldCheck className="h-4 w-4 shrink-0" /> Verified Student Account
              </div>
            </div>

            {/* Right Card: Fields Editor (Form) */}
            <div className="md:col-span-8 glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2 text-left">
                Academic & Preference Metrics
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Full name (Editable only in edit mode) */}
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Aarav Sharma"
                  disabled={!isEditing || isLoading}
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />

                {/* Email (Always Readonly) */}
                <div className="w-full flex flex-col gap-1.5 text-left opacity-60">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-4.5 w-4.5 pointer-events-none" />
                    <input
                      type="text"
                      value={user?.email || ''}
                      readOnly
                      disabled
                      className="w-full py-2.5 pl-11 pr-4 rounded-xl glass-input text-sm font-medium border border-zinc-800 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Course Preference */}
                <Input
                  label="Preferred Course"
                  type="text"
                  placeholder="B.Tech Computer Science"
                  disabled={!isEditing || isLoading}
                  error={errors.preferredCourse?.message}
                  {...register('preferredCourse')}
                />

                {/* Preferred State */}
                <Input
                  label="Preferred State"
                  type="text"
                  placeholder="Maharashtra"
                  disabled={!isEditing || isLoading}
                  error={errors.preferredState?.message}
                  {...register('preferredState')}
                />

                {/* Preferred City */}
                <Input
                  label="Preferred City"
                  type="text"
                  placeholder="Mumbai"
                  disabled={!isEditing || isLoading}
                  error={errors.preferredCity?.message}
                  {...register('preferredCity')}
                />

                {/* Category Dropdown */}
                <div className="w-full flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Category Group
                  </label>
                  <select
                    disabled={!isEditing || isLoading}
                    className="w-full py-2.5 px-4 rounded-xl glass-input text-sm font-medium border border-zinc-800 focus:outline-none disabled:opacity-50"
                    {...register('category')}
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

                {/* Budget input */}
                <Input
                  label="Approximate Budget (Rs/Year)"
                  type="number"
                  placeholder="300000"
                  disabled={!isEditing || isLoading}
                  error={errors.budget?.message}
                  {...register('budget')}
                />

                {/* Marks input */}
                <Input
                  label="12th Board Marks (%)"
                  type="number"
                  step="0.01"
                  placeholder="85.50"
                  disabled={!isEditing || isLoading}
                  error={errors.marks12?.message}
                  {...register('marks12')}
                />

                {/* Entrance Score */}
                <Input
                  label="Entrance Score (Optional)"
                  type="number"
                  placeholder="120"
                  disabled={!isEditing || isLoading}
                  error={errors.entranceScore?.message}
                  {...register('entranceScore')}
                />

                {/* College type */}
                <div className="w-full flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Preferred College Type
                  </label>
                  <select
                    disabled={!isEditing || isLoading}
                    className="w-full py-2.5 px-4 rounded-xl glass-input text-sm font-medium border border-zinc-800 focus:outline-none disabled:opacity-50"
                    {...register('preferredCollegeType')}
                  >
                    <option value="All">All types</option>
                    <option value="Public">Government / Public Only</option>
                    <option value="Private">Private Deemed Only</option>
                  </select>
                </div>

              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-4 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 font-bold flex items-center justify-center gap-2"
                    isLoading={isLoading}
                  >
                    <Save className="h-4 w-4" /> Save Profile Details
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset to user values
                      if (user) {
                        reset({
                          fullName: user.full_name,
                          preferredState: user.preferences?.preferred_state || '',
                          preferredCity: user.preferences?.preferred_city || '',
                          preferredCourse: user.preferences?.preferred_course || '',
                          category: user.preferences?.category || 'General',
                          budget: user.preferences?.budget || 0,
                          marks12: user.preferences?.marks_12 || 0,
                          entranceScore: user.preferences?.entrance_score || 0,
                          preferredCollegeType: user.preferences?.preferred_college_type || 'All',
                        });
                      }
                    }}
                    variant="secondary"
                    className="flex-1 font-bold"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              )}

            </div>

          </div>
        </form>

      </main>
    </div>
  );
};

export default Profile;
