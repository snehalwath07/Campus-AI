import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  GraduationCap, Sparkles, Scale, ArrowRight, Download, 
  MapPin, Globe, CreditCard, Award, ListTodo, Compass, 
  FileText, CheckCircle
} from 'lucide-react';
import { collegesService } from '../services/colleges';
import type { College } from '../types';
import Button from '../components/ui/Button';

export const CompareColleges: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialColA = searchParams.get('colA') || '';
  const initialColB = searchParams.get('colB') || '';

  const [colleges, setColleges] = useState<College[]>([]);
  const [collegeA, setCollegeA] = useState<College | null>(null);
  const [collegeB, setCollegeB] = useState<College | null>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Fetch all colleges on mount
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const list = await collegesService.getAll();
        setColleges(list);
        
        // Setup initial selections from query parameters
        if (initialColA) {
          const matchedA = list.find(c => c._id === initialColA || c.id === initialColA);
          if (matchedA) setCollegeA(matchedA);
        }
        if (initialColB) {
          const matchedB = list.find(c => c._id === initialColB || c.id === initialColB);
          if (matchedB) setCollegeB(matchedB);
        }
      } catch (err) {
        toast.error('Failed to load colleges database.');
      }
    };
    fetchAll();
  }, [initialColA, initialColB]);

  // Generate comparison summary dynamically when both colleges change
  useEffect(() => {
    if (collegeA && collegeB) {
      generateSummary();
    } else {
      setAiSummary('');
    }
  }, [collegeA, collegeB]);

  const generateSummary = async () => {
    if (!collegeA || !collegeB) return;
    setIsGeneratingSummary(true);
    try {
      // Create a smart client-side comparison reasoning prompt
      const summaryText = 
        `Comparison Summary: ${collegeA.name} is a ${collegeA.college_type} institute located in ${collegeA.city}, ` +
        `with approximate fees of Rs. ${collegeA.approximate_fees.toLocaleString()}/year. ` +
        `Conversely, ${collegeB.name} is located in ${collegeB.city} with fees of Rs. ${collegeB.approximate_fees.toLocaleString()}/year. ` +
        `For academic entry, ${collegeA.name} eligibility is: "${collegeA.eligibility}", whereas ${collegeB.name} is: "${collegeB.eligibility}". ` +
        `Decision Guide: Choose ${collegeA.name} if you prioritize its location in ${collegeA.state} or lower fee structures. Choose ${collegeB.name} for its course offerings in ${collegeB.courses.slice(0, 2).join(', ')}.`;
      
      setAiSummary(summaryText);
    } catch (err) {
      setAiSummary('Comparison summary could not be generated. Please review parameters.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleExportPDF = () => {
    if (!collegeA || !collegeB) {
      toast.error('Please select both colleges to export.');
      return;
    }
    toast.success(`Preparing PDF download for comparison of ${collegeA.name} vs ${collegeB.name}...`);
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  // Difference highlight checking
  const isDifferent = (key: keyof College) => {
    if (!collegeA || !collegeB) return false;
    const valA = String(collegeA[key] || '');
    const valB = String(collegeB[key] || '');
    return valA.toLowerCase() !== valB.toLowerCase();
  };

  const highlightFees = () => {
    if (!collegeA || !collegeB) return '';
    if (collegeA.approximate_fees > collegeB.approximate_fees) {
      return { colA: 'text-amber-400 font-semibold', colB: 'text-emerald-400 font-semibold' };
    } else if (collegeA.approximate_fees < collegeB.approximate_fees) {
      return { colA: 'text-emerald-400 font-semibold', colB: 'text-amber-400 font-semibold' };
    }
    return { colA: '', colB: '' };
  };

  const feeHighlights = highlightFees();

  return (
    <div className="relative min-h-screen w-screen bg-dark-bg flex flex-col overflow-x-hidden grid-bg print:bg-white print:text-black">
      {/* Background glow meshes */}
      <div className="absolute inset-0 bg-glow-purple-1 pointer-events-none print:hidden" />
      <div className="absolute inset-0 bg-glow-purple-2 pointer-events-none print:hidden" />

      {/* HEADER NAVBAR (Hidden during printing) */}
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
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-10 relative z-10 space-y-8 print:p-0 print:m-0">
        
        {/* Title Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 print:border-zinc-300">
          <div className="text-left space-y-1.5">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-secondary print:text-indigo-600">Decision Room</span>
            <h1 className="text-3xl font-extrabold text-white print:text-black text-glow-purple flex items-center gap-2">
              Compare Colleges <Scale className="h-6 w-6 text-brand-primary print:text-indigo-600" />
            </h1>
            <p className="text-xs text-zinc-400 print:text-zinc-600">
              Evaluate parameters, eligibility cut-offs, and fee details side-by-side.
            </p>
          </div>

          {collegeA && collegeB && (
            <Button
              onClick={handleExportPDF}
              variant="secondary"
              className="py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 print:hidden"
            >
              <Download className="h-4 w-4" /> Export as PDF
            </Button>
          )}
        </div>

        {/* SELECTORS GRID (Hidden during printing) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-950/45 p-5 rounded-2xl border border-white/5 print:hidden">
          {/* Select College A */}
          <div className="flex flex-col gap-2 text-left">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Select College A</label>
            <select
              value={collegeA ? (collegeA._id || collegeA.id) : ''}
              onChange={(e) => {
                const matched = colleges.find(c => c._id === e.target.value || c.id === e.target.value);
                setCollegeA(matched || null);
              }}
              className="w-full py-2.5 px-4 rounded-xl glass-input text-sm font-semibold border border-zinc-800 cursor-pointer"
            >
              <option value="">-- Choose first institution --</option>
              {colleges
                .filter(c => c._id !== (collegeB?._id || collegeB?.id))
                .map(col => (
                  <option key={col._id || col.id} value={col._id || col.id}>{col.name} ({col.college_type})</option>
                ))}
            </select>
          </div>

          {/* Select College B */}
          <div className="flex flex-col gap-2 text-left">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Select College B</label>
            <select
              value={collegeB ? (collegeB._id || collegeB.id) : ''}
              onChange={(e) => {
                const matched = colleges.find(c => c._id === e.target.value || c.id === e.target.value);
                setCollegeB(matched || null);
              }}
              className="w-full py-2.5 px-4 rounded-xl glass-input text-sm font-semibold border border-zinc-800 cursor-pointer"
            >
              <option value="">-- Choose second institution --</option>
              {colleges
                .filter(c => c._id !== (collegeA?._id || collegeA?.id))
                .map(col => (
                  <option key={col._id || col.id} value={col._id || col.id}>{col.name} ({col.college_type})</option>
                ))}
            </select>
          </div>
        </div>

        {/* COMPARISON RESULTS */}
        {!collegeA || !collegeB ? (
          <div className="text-center py-20 p-8 rounded-3xl glass-panel border border-white/5 space-y-4 max-w-lg mx-auto print:hidden">
            <div className="mx-auto h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
              <Compass className="h-6 w-6 text-brand-primary" />
            </div>
            <h3 className="text-base font-bold text-zinc-200">Comparison Ready</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Select both institutions from the dropdown panels above, or trigger comparing from your bookmarks page to see side-by-side analytics.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* AI Summary Block */}
            <div className="p-5 rounded-2xl glass-card border border-brand-primary/20 bg-zinc-950/20 text-left relative overflow-hidden print:bg-zinc-50 print:border-zinc-300">
              <div className="absolute top-0 right-0 bg-brand-primary/10 text-brand-secondary text-[9px] font-bold uppercase tracking-wider py-1 px-3.5 rounded-bl-xl border-l border-b border-brand-primary/15 print:hidden">
                AI Summary
              </div>
              <div className="flex items-center gap-2 text-zinc-200 print:text-zinc-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Compass className="h-4.5 w-4.5 text-brand-secondary print:text-indigo-600 animate-pulse" /> Decision Advisor Summary
              </div>
              <p className="text-xs text-zinc-300 print:text-zinc-700 leading-relaxed">
                {isGeneratingSummary ? 'Analyzing college profiles...' : aiSummary}
              </p>
            </div>

            {/* Comparison Grid Table */}
            <div className="rounded-2xl border border-white/5 overflow-hidden shadow-2xl print:border-zinc-300">
              <table className="w-full border-collapse text-xs text-left">
                <thead>
                  <tr className="bg-zinc-900/80 border-b border-white/5 text-zinc-200 print:bg-zinc-100 print:text-black print:border-zinc-300">
                    <th className="p-4 w-1/4 font-bold border-r border-white/5 print:border-zinc-300">Feature</th>
                    <th className="p-4 w-3/8 font-bold border-r border-white/5 print:border-zinc-300">{collegeA.name}</th>
                    <th className="p-4 w-3/8 font-bold">{collegeB.name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-zinc-200 print:text-zinc-900">
                  
                  {/* Location */}
                  <tr className={`hover:bg-white/1 print:hover:bg-transparent ${isDifferent('city') ? 'bg-brand-primary/2 print:bg-indigo-50/30' : ''}`}>
                    <td className="p-4 font-semibold text-zinc-400 print:text-zinc-600 border-r border-white/5 print:border-zinc-300 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /> Location
                    </td>
                    <td className="p-4 border-r border-white/5 print:border-zinc-300">{collegeA.city}, {collegeA.state}</td>
                    <td className="p-4">{collegeB.city}, {collegeB.state}</td>
                  </tr>

                  {/* Ownership/Type */}
                  <tr className={`hover:bg-white/1 print:hover:bg-transparent ${isDifferent('college_type') ? 'bg-brand-primary/2 print:bg-indigo-50/30' : ''}`}>
                    <td className="p-4 font-semibold text-zinc-400 print:text-zinc-600 border-r border-white/5 print:border-zinc-300 flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 shrink-0" /> Ownership
                    </td>
                    <td className="p-4 border-r border-white/5 print:border-zinc-300">{collegeA.college_type}</td>
                    <td className="p-4">{collegeB.college_type}</td>
                  </tr>

                  {/* Fees */}
                  <tr className="hover:bg-white/1 print:hover:bg-transparent">
                    <td className="p-4 font-semibold text-zinc-400 print:text-zinc-600 border-r border-white/5 print:border-zinc-300 flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 shrink-0" /> Approx. Fees
                    </td>
                    <td className={`p-4 border-r border-white/5 print:border-zinc-300 ${feeHighlights ? (feeHighlights as any).colA : ''}`}>
                      Rs. {collegeA.approximate_fees.toLocaleString()}/year
                    </td>
                    <td className={`p-4 ${feeHighlights ? (feeHighlights as any).colB : ''}`}>
                      Rs. {collegeB.approximate_fees.toLocaleString()}/year
                    </td>
                  </tr>

                  {/* Courses */}
                  <tr className="hover:bg-white/1 print:hover:bg-transparent">
                    <td className="p-4 font-semibold text-zinc-400 print:text-zinc-600 border-r border-white/5 print:border-zinc-300 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 shrink-0" /> Courses Offered
                    </td>
                    <td className="p-4 border-r border-white/5 print:border-zinc-300">
                      <ul className="list-disc pl-4 space-y-1">
                        {collegeA.courses.map(c => <li key={c}>{c}</li>)}
                      </ul>
                    </td>
                    <td className="p-4">
                      <ul className="list-disc pl-4 space-y-1">
                        {collegeB.courses.map(c => <li key={c}>{c}</li>)}
                      </ul>
                    </td>
                  </tr>

                  {/* Eligibility */}
                  <tr className={`hover:bg-white/1 print:hover:bg-transparent ${isDifferent('eligibility') ? 'bg-brand-primary/2 print:bg-indigo-50/30' : ''}`}>
                    <td className="p-4 font-semibold text-zinc-400 print:text-zinc-600 border-r border-white/5 print:border-zinc-300 flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0" /> Eligibility
                    </td>
                    <td className="p-4 border-r border-white/5 print:border-zinc-300 leading-relaxed">{collegeA.eligibility}</td>
                    <td className="p-4 leading-relaxed">{collegeB.eligibility}</td>
                  </tr>

                  {/* Process */}
                  <tr className={`hover:bg-white/1 print:hover:bg-transparent ${isDifferent('admission_process') ? 'bg-brand-primary/2 print:bg-indigo-50/30' : ''}`}>
                    <td className="p-4 font-semibold text-zinc-400 print:text-zinc-600 border-r border-white/5 print:border-zinc-300 flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5 shrink-0" /> Admission Process
                    </td>
                    <td className="p-4 border-r border-white/5 print:border-zinc-300 leading-relaxed">{collegeA.admission_process}</td>
                    <td className="p-4 leading-relaxed">{collegeB.admission_process}</td>
                  </tr>

                  {/* Documents */}
                  <tr className="hover:bg-white/1 print:hover:bg-transparent">
                    <td className="p-4 font-semibold text-zinc-400 print:text-zinc-600 border-r border-white/5 print:border-zinc-300 flex items-center gap-1.5">
                      <ListTodo className="h-3.5 w-3.5 shrink-0" /> Required Documents
                    </td>
                    <td className="p-4 border-r border-white/5 print:border-zinc-300">
                      <ul className="list-disc pl-4 space-y-1">
                        {collegeA.required_documents.map(d => <li key={d}>{d}</li>)}
                      </ul>
                    </td>
                    <td className="p-4">
                      <ul className="list-disc pl-4 space-y-1">
                        {collegeB.required_documents.map(d => <li key={d}>{d}</li>)}
                      </ul>
                    </td>
                  </tr>

                  {/* Website */}
                  <tr className="hover:bg-white/1 print:hover:bg-transparent">
                    <td className="p-4 font-semibold text-zinc-400 print:text-zinc-600 border-r border-white/5 print:border-zinc-300 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 shrink-0" /> Official Website
                    </td>
                    <td className="p-4 border-r border-white/5 print:border-zinc-300">
                      <a href={collegeA.official_website} target="_blank" rel="noreferrer" className="text-brand-secondary hover:underline">
                        {collegeA.official_website.replace('https://', '')}
                      </a>
                    </td>
                    <td className="p-4">
                      <a href={collegeB.official_website} target="_blank" rel="noreferrer" className="text-brand-secondary hover:underline">
                        {collegeB.official_website.replace('https://', '')}
                      </a>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default CompareColleges;
