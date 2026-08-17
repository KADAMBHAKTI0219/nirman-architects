import React, { useState, useEffect } from 'react';
import { 
  Star, MessageSquare, CheckCircle2, Clock, ThumbsUp, Send, RefreshCw, 
  HelpCircle, AlertCircle, Award, Sparkles 
} from 'lucide-react';
import Card from '../../common/Card';
import { 
  getActiveFeedbackCategories, 
  getPendingFeedbackPrompts, 
  submitClientFeedback, 
  skipFeedbackPrompt, 
  getMyFeedbackHistory 
} from '../../../service/crm/feedback';
import { useToast } from '../../../context/ToastContext';
import { FieldError } from '../../../utils/validation';

export default function CustomerFeedback() {
  const [categories, setCategories] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Feedback Form State
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, promptRes, histRes] = await Promise.all([
        getActiveFeedbackCategories(),
        getPendingFeedbackPrompts(),
        getMyFeedbackHistory()
      ]);

      if (catRes && catRes.categories) setCategories(catRes.categories);
      
      let pendingList = [];
      if (promptRes && promptRes.prompts) pendingList = promptRes.prompts;
      else if (Array.isArray(promptRes)) pendingList = promptRes;
      setPrompts(pendingList);
      if (pendingList.length > 0) setSelectedPrompt(pendingList[0]);

      let histList = [];
      if (histRes && histRes.history) histList = histRes.history;
      else if (Array.isArray(histRes)) histList = histRes;
      setHistory(histList);

    } catch (err) {
      console.warn("Notice loading feedback data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const { showToast } = useToast();
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!comments.trim()) {
      setFieldErrors({ comments: 'Please enter your feedback comments before submitting.' });
      showToast('Please enter your feedback comments before submitting.', 'error');
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    setSubmitSuccess('');
    try {
      const promptId = selectedPrompt?._id || selectedPrompt?.id || 'general';
      const payload = {
        rating,
        categoryId: selectedCategoryId,
        comments: comments.trim()
      };

      const res = await submitClientFeedback(promptId, payload);
      if (res && (res.success || res._id)) {
        showToast('Thank you! Your feedback has been submitted successfully.', 'success');
        setSubmitSuccess('Thank you! Your feedback has been submitted successfully.');
        setComments('');
        setRating(5);
        setTimeout(() => setSubmitSuccess(''), 4000);
        await loadData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to submit feedback.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipPrompt = async (promptId) => {
    try {
      await skipFeedbackPrompt(promptId);
      loadData();
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200 w-full max-w-[1400px] mx-auto pb-12">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Client Feedback & Review</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Share your experience on design deliverables, structural milestones & team execution to help us refine quality.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-200 transition-colors cursor-pointer"
          title="Refresh Feedback"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-dark' : ''}`} />
        </button>
      </div>

      {/* 2. FEEDBACK SUBMISSION & HISTORY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT 2-COLUMNS: SUBMIT FEEDBACK FORM */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card 
            title="Submit Milestone Feedback" 
            subtitle="Rate our architectural execution, 3D renderings & engineering precision"
          >
            {submitSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-5 pt-2 text-xs font-bold text-slate-700">
              
              {/* STAR RATING PICKER */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Overall Satisfaction Rating (1 to 5 Stars) <span className="text-rose-500">*</span>
                </label>
                
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-2xl transition-all scale-100 hover:scale-110 focus:outline-none cursor-pointer"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                            : 'text-slate-200 fill-slate-100'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-black text-slate-800">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* CATEGORY SELECTOR */}
              {categories.length > 0 && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Feedback Category
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                  >
                    <option value="">Select category tag...</option>
                    {categories.map(c => (
                      <option key={c._id || c.id} value={c._id || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* COMMENTS TEXTAREA */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Your Detailed Review / Comments <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Share feedback on drawings quality, timeline compliance, architectural details, or site communication..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-2xl bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer border border-brand-secondary/40"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting Feedback...' : 'Submit Feedback'}</span>
                </button>
              </div>

            </form>
          </Card>

        </div>

        {/* RIGHT COLUMN: HISTORY & SUBMITTED REVIEWS */}
        <div className="space-y-6">
          
          <Card title="My Feedback History" subtitle="Previous reviews submitted for your active projects">
            <div className="space-y-4 pt-2">
              {history.length > 0 ? (
                history.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            className={`w-3.5 h-3.5 ${
                              star <= (item.rating || 5) 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-slate-200 fill-slate-100'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Submitted'}
                      </span>
                    </div>

                    <p className="text-slate-800 font-semibold leading-relaxed">
                      "{item.comments || item.feedbackText || item.review}"
                    </p>

                    {item.categoryName && (
                      <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-150">
                        {item.categoryName}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs font-bold space-y-2">
                  <Award className="w-8 h-8 mx-auto text-slate-300" />
                  <p>No previous feedback submitted yet.</p>
                </div>
              )}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
}
