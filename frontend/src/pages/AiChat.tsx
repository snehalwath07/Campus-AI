import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  GraduationCap, Send, Bot, User, Trash2,
  MessageSquare, Plus, Copy, Heart, CreditCard,
  MapPin, ArrowRight, Sparkle
} from 'lucide-react';
import { chatService } from '../services/chat';
import { savedService } from '../services/saved';
import type { ChatSession, ChatMessage, College } from '../types';

export const AiChat: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') || '';

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Track bookmarked college IDs locally to show active states
  const [savedCollegeIds, setSavedCollegeIds] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch sessions & bookmarked colleges on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const sessList = await chatService.getSessions();
        setSessions(sessList);

        // Fetch saved colleges to map bookmark states
        const savedList = await savedService.getAll();
        setSavedCollegeIds(savedList.map(s => s.college_id));

        // If there is an initial query from Section 1/Chips redirect, trigger submit
        if (initialQuery.trim()) {
          // Clear query param from URL so refresh doesn't trigger query again
          setSearchParams({});
          handleAskQuestion(initialQuery);
        } else if (sessList.length > 0) {
          // Open latest session by default
          loadSession(sessList[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    initData();
  }, [initialQuery]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 2. Load session messages
  const loadSession = async (id: string) => {
    setActiveSessionId(id);
    setIsLoading(true);
    try {
      const data = await chatService.getSessionById(id);
      setMessages(data.messages);
    } catch (err) {
      toast.error('Failed to load conversation details.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. New Chat triggers
  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInputValue('');
  };

  // 4. Submit query
  const handleAskQuestion = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Add user message locally for immediate responsiveness
    const nowIso = new Date().toISOString();
    const tempUserMsg: ChatMessage = {
      sender: 'student',
      message: queryText,
      timestamp: nowIso
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatService.ask(queryText, activeSessionId || undefined);

      // Update session ID if a new session was created
      if (!activeSessionId) {
        setActiveSessionId(response.session_id);
        // Refresh session list
        const updatedList = await chatService.getSessions();
        setSessions(updatedList);
      }

      // Append AI response
      const tempAiMsg: ChatMessage = {
        sender: 'ai',
        message: response.response,
        timestamp: nowIso,
        structured_data: response.structured_data
      };
      setMessages(prev => [...prev, tempAiMsg]);
    } catch (err) {
      toast.error('AI counselor is temporarily unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Delete thread
  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatService.deleteSession(id);
      setSessions(sessions.filter(s => s.id !== id));
      if (activeSessionId === id) {
        handleNewChat();
      }
      toast.success('Chat history thread deleted.');
    } catch (err) {
      toast.error('Failed to delete history thread.');
    }
  };

  // 6. Copy text to clipboard
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Response copied to clipboard.');
  };

  // 7. Save / Bookmark College
  const handleBookmarkCollege = async (college: College) => {
    const id = college._id || college.id;
    if (!id) return;

    const isBookmarked = savedCollegeIds.includes(id);
    try {
      if (isBookmarked) {
        await savedService.unsave(id);
        setSavedCollegeIds(savedCollegeIds.filter(cid => cid !== id));
        toast.success('College removed from bookmarks.');
      } else {
        await savedService.save(id);
        setSavedCollegeIds([...savedCollegeIds, id]);
        toast.success('College added to bookmarks successfully!');
      }
    } catch (err) {
      toast.error('Failed to update bookmark status.');
    }
  };

  // Regex-based lightweight markdown formatter
  const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let content = line;
      const isBullet = line.trim().startsWith('*') || line.trim().startsWith('-');
      if (isBullet) {
        content = line.trim().substring(1).trim();
      }

      const parts = content.split('**');
      const renderedParts = parts.map((part, index) => {
        if (index % 2 === 1) {
          return <strong key={index} className="text-zinc-100 font-extrabold">{part}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc pl-1 text-zinc-300 text-xs my-0.5 leading-relaxed text-left">
            {renderedParts}
          </li>
        );
      }
      return (
        <p key={idx} className="text-zinc-300 text-xs my-1.5 leading-relaxed text-left">
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <div className="relative min-h-screen w-screen bg-dark-bg flex overflow-hidden grid-bg text-left">
      {/* Ambient background glows */}
      <div className="absolute inset-0 bg-glow-purple-1 pointer-events-none" />

      {/* SIDEBAR (Conversation history) */}
      <aside className={`relative z-20 h-screen border-r border-white/5 bg-zinc-950/70 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden border-r-0'
        }`}>
        {/* Header logo block */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand-primary flex items-center justify-center text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">CampusAI</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-zinc-500 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Collapse
          </button>
        </div>

        {/* New chat button */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-brand-secondary" /> New Counselor Chat
          </button>
        </div>

        {/* History Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-none">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-3 block mb-2">History Threads</span>
          {sessions.length === 0 ? (
            <span className="text-[10px] text-zinc-600 italic px-3 block py-2">No threads started yet.</span>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.id === activeSessionId;
              return (
                <div
                  key={sess.id}
                  onClick={() => loadSession(sess.id)}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between gap-2 group cursor-pointer transition-colors ${isActive ? 'bg-brand-primary/10 border border-brand-primary/20 text-white' : 'hover:bg-white/3 text-zinc-400'
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    <span className="text-xs font-semibold truncate select-none leading-tight">{sess.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(sess.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-0.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Console footer link */}
        <div className="p-4 border-t border-white/5 bg-zinc-950/25">
          <Link
            to="/home"
            className="flex items-center justify-center gap-1.5 text-xs text-brand-secondary hover:text-brand-secondary/80 font-bold transition-colors"
          >
            Exit Workspace <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>

      {/* CHAT VIEWSPACE */}
      <section className="flex-1 h-screen flex flex-col relative z-10 min-w-0">

        {/* Top toolbar */}
        <header className="p-4 border-b border-white/5 bg-zinc-950/25 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-zinc-300 cursor-pointer"
              >
                Show History
              </button>
            )}
            <div className="flex items-center gap-2 text-white">
              <Bot className="h-4.5 w-4.5 text-brand-secondary animate-pulse" />
              <span className="text-sm font-bold">AI Counselor Chat</span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-black text-brand-secondary bg-brand-primary/10 border border-brand-primary/20 py-0.5 px-3.5 rounded-full select-none">
            Hybrid Engine
          </span>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scrollbar-none">
          {messages.length === 0 ? (
            /* WELCOME HERO */
            <div className="h-full flex flex-col items-center justify-center max-w-lg mx-auto text-center space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center text-brand-secondary">
                <Bot className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white text-glow-purple flex items-center justify-center gap-2">
                  CampusAI Counselor <Sparkle className="h-4.5 w-4.5 text-brand-secondary" />
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                  Consult the AI counselor on admission eligibility, fee structures, application deadlines, and structured database queries.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-4">
                <button
                  onClick={() => handleAskQuestion("Tell me about IIT Delhi B.Tech admission")}
                  className="p-3.5 rounded-xl border border-white/5 hover:border-brand-primary/20 bg-zinc-950/20 text-xs text-zinc-300 font-semibold hover:text-white transition-all text-left flex flex-col justify-between h-20 cursor-pointer"
                >
                  <span>IIT Delhi process</span>
                  <ArrowRight className="h-3.5 w-3.5 self-end text-zinc-600" />
                </button>
                <button
                  onClick={() => handleAskQuestion("Compare BITS Pilani and IIT Bombay")}
                  className="p-3.5 rounded-xl border border-white/5 hover:border-brand-primary/20 bg-zinc-950/20 text-xs text-zinc-300 font-semibold hover:text-white transition-all text-left flex flex-col justify-between h-20 cursor-pointer"
                >
                  <span>Compare BITS & IITB</span>
                  <ArrowRight className="h-3.5 w-3.5 self-end text-zinc-600" />
                </button>
              </div>
            </div>
          ) : (
            /* CONVERSATION MESSAGES LIST */
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((msg, index) => {
                const isAi = msg.sender === 'ai';
                return (
                  <div key={index} className={`flex gap-4 ${isAi ? 'justify-start' : 'justify-end text-right'}`}>

                    {/* Icon */}
                    {isAi && (
                      <div className="h-8 w-8 rounded-lg bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-secondary shrink-0 select-none">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div className="max-w-[85%] space-y-4">
                      <div className={`p-4 rounded-2xl border text-xs shadow-md ${isAi
                        ? 'bg-zinc-900/60 border-white/5 text-zinc-300'
                        : 'bg-brand-primary text-white border-brand-secondary shadow-brand-primary/10'
                        }`}>

                        {/* Message payload */}
                        <div className="space-y-2 select-text">{renderMessageContent(msg.message)}</div>

                        {/* Clipboard copy for AI response */}
                        {isAi && (
                          <div className="mt-2.5 pt-2 border-t border-white/5 flex justify-end">
                            <button
                              onClick={() => handleCopyText(msg.message)}
                              className="text-[9px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Copy className="h-3 w-3" /> Copy Response
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Structured College Card if present */}
                      {isAi && msg.structured_data && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-card p-5 rounded-2xl border border-brand-primary/25 bg-zinc-950/45 text-left space-y-4 shadow-xl relative overflow-hidden"
                        >
                          {/* Corner Save Heart */}
                          <button
                            onClick={() => handleBookmarkCollege(msg.structured_data!)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Heart
                              className={`h-5 w-5 ${savedCollegeIds.includes(msg.structured_data?._id || msg.structured_data?.id || "")
                                ? "text-red-500 fill-red-500 animate-pulse"
                                : "text-zinc-700"
                                }`}
                            />
                          </button>

                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-brand-secondary bg-brand-primary/10 border border-brand-primary/20 py-0.5 px-2.5 rounded-full uppercase tracking-wider">
                              {msg.structured_data?.college_type || "College"}
                            </span>
                            <h3 className="text-base font-extrabold text-white pt-1">
                              {msg.structured_data?.name || "Unknown College"}
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {msg.structured_data?.city || "Unknown"},{" "}
                              {msg.structured_data?.state || ""}
                            </p>
                          </div>

                          <div className="h-[1px] w-full bg-zinc-800/80" />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1 text-left">
                              <h4 className="font-bold text-zinc-300">Admission Process:</h4>
                              <p className="text-zinc-400 text-[11px] leading-relaxed">
                                {msg.structured_data?.admission_process || "Not Available"}
                              </p>
                            </div>
                            <div className="space-y-1 text-left">
                              <h4 className="font-bold text-zinc-300">Eligibility:</h4>
                              <p className="text-zinc-400 text-[11px] leading-relaxed">
                                {msg.structured_data?.eligibility || "Not Available"}
                              </p>
                            </div>
                            <div className="space-y-1 text-left">
                              <h4 className="font-bold text-zinc-300">Required Documents:</h4>
                              <ul className="list-disc pl-4 text-zinc-400 text-[11px] space-y-0.5">
                                {(msg.structured_data?.required_documents ?? [])
                                  .slice(0, 3)
                                  .map((d: string) => (
                                    <li key={d}>{d}</li>
                                  ))}
                                {(msg.structured_data?.required_documents?.length ?? 0) > 3 && (
                                  <li>
                                    +{" "}
                                    {(msg.structured_data?.required_documents?.length ?? 0) - 3}{" "}
                                    more
                                  </li>
                                )}
                              </ul>
                            </div>
                            <div className="space-y-1 text-left">
                              <h4 className="font-bold text-zinc-300 flex items-center gap-1">
                                <CreditCard className="h-3.5 w-3.5" />
                                Fees Structure:
                              </h4>
                              <p className="text-zinc-200 font-bold text-[11px]">
                                {msg.structured_data?.approximate_fees
                                  ? `Rs. ${msg.structured_data.approximate_fees.toLocaleString()}/year`
                                  : "Not Available"}
                              </p>
                            </div>
                          </div>

                          <div className="h-[1px] w-full bg-zinc-800/80" />

                          <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                            <span>
                              Website:{" "}
                              {msg.structured_data?.official_website ? (
                                <a
                                  href={msg.structured_data.official_website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-brand-secondary hover:underline"
                                >
                                  {msg.structured_data.official_website.replace("https://", "")}
                                </a>
                              ) : (
                                "Not Available"
                              )}
                            </span>
                            <span>
                              Contact:{" "}
                              {msg.structured_data?.contact_information
                                ? msg.structured_data.contact_information.split("|")[0]
                                : "Not Available"}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Student Icon */}
                    {!isAi && (
                      <div className="h-8 w-8 rounded-lg bg-brand-secondary/20 border border-brand-secondary/30 flex items-center justify-center text-brand-secondary shrink-0 select-none">
                        <User className="h-4 w-4" />
                      </div>
                    )}

                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-zinc-950/45 border-t border-white/5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskQuestion(inputValue);
            }}
            className="relative max-w-3xl mx-auto flex items-center"
          >
            <input
              type="text"
              placeholder="Consult AI Counselor about courses, documents or colleges..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="w-full py-3.5 pl-4 pr-16 rounded-2xl glass-input text-xs font-semibold border border-zinc-800 shadow-xl"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white disabled:bg-zinc-800 disabled:text-zinc-600 transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="text-center text-[10px] text-zinc-600 mt-2 font-medium">
            CampusAI answers queries based on official colleges database structures. Powered by Gemini fallback.
          </div>
        </div>

      </section>
    </div>
  );
};

export default AiChat;
