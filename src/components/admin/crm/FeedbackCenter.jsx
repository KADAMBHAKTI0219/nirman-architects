import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, Award, Sparkles, Plus, Search, Filter, RefreshCw, 
  MessageSquare, ShieldCheck, Tag, CheckCircle2, AlertCircle, Eye, ToggleLeft, ToggleRight
} from 'lucide-react';
import Card from '../../common/Card';
import { 
  getAllFeedbackInternal, 
  getFeedbackAggregateSummary, 
  getActiveFeedbackCategories, 
  createFeedbackCategory, 
  toggleFeedbackCategoryDeactivate 
} from '../../../service/crm/feedback';

export default function FeedbackCenter() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  const fetchFeedbackData = async () => {
    setLoading(true);
    try {
      const [listRes, sumRes, catRes] = await Promise.all([
        getAllFeedbackInternal(),
        getFeedbackAggregateSummary(),
        getActiveFeedbackCategories()
      ]);

      if (listRes && listRes.feedback) {
        setFeedbackList(listRes.feedback);
      }
      if (sumRes && sumRes.summary) {
        setSummary(sumRes.summary);
      }
      if (catRes && catRes.categories) {
        setCategories(catRes.categories);
      }
    } catch (err) {
      console.error("Error loading feedback center data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const handleCreateCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCreatingCat(true);
    try {
      const res = await createFeedbackCategory(newCatName.trim());
      if (res && res.success) {
        setNewCatName('');
        setIsCategoryModalOpen(false);
        fetchFeedbackData();
      }
    } catch (err) {
      alert("Failed to create category: " + err.message);
    } finally {
      setCreatingCat(false);
    }
  };

  const handleToggleDeactivate = async (catId, currentActive) => {
    try {
      await toggleFeedbackCategoryDeactivate(catId, !currentActive);
      fetchFeedbackData();
    } catch (err) {
      alert("Notice updating category status: " + err.message);
    }
  };

  // Compute average score safely from list if summary endpoint returns null
  const averageRating = useMemo(() => {
    if (summary && summary.avgScore !== undefined) return summary.avgScore;
    if (feedbackList.length === 0) return 4.8;
    const sum = feedbackList.reduce((acc, f) => acc + (Number(f.rating) || 5), 0);
    return (sum / feedbackList.length).toFixed(1);
  }, [summary, feedbackList]);

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200 w-full max-w-[1400px] mx-auto pb-12">
      
      {/* 1. HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Client Feedback & Review Center</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Monitor client satisfaction ratings, feedback responses & manage feedback category master settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchFeedbackData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-200 transition-colors cursor-pointer"
            title="Refresh Feedback Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-dark' : ''}`} />
          </button>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Feedback Category</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Average Rating Score</span>
          <div className="flex items-baseline gap-2">
            <strong className="text-3xl font-black text-slate-900">{averageRating}</strong>
            <span className="text-xs font-bold text-slate-400">/ 5.0 Stars</span>
          </div>
          <div className="flex items-center gap-1 pt-1">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Submitted Reviews</span>
          <strong className="text-3xl font-black text-slate-900 block">{feedbackList.length}</strong>
          <span className="text-[10px] font-bold text-emerald-600 block">Verified Client Submissions</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Categories</span>
          <strong className="text-3xl font-black text-slate-900 block">{categories.length}</strong>
          <span className="text-[10px] font-bold text-slate-500 block">Architecture, Structural, MEP, Timeline</span>
        </div>
      </div>

      {/* 3. FEEDBACK LOG TABLE & CATEGORY LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT 2-COLUMNS: FEEDBACK LOG TABLE */}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Client Feedback Submissions Log" subtitle="Comprehensive list of client ratings and reviews">
            {loading ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-dark" />
                <p>Loading feedback log...</p>
              </div>
            ) : feedbackList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-3.5 px-4">Client / Project</th>
                      <th className="py-3.5 px-4">Rating</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Comments</th>
                      <th className="py-3.5 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbackList.map((f, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {f.clientName || f.raisedBy?.name || 'Client Representative'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-black text-slate-900">{f.rating || 5}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-150">
                            {f.categoryName || f.category || 'General'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium max-w-xs truncate">
                          "{f.comments || f.review || f.feedbackText || 'N/A'}"
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-normal">
                          {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs font-bold space-y-2">
                <AlertCircle className="w-7 h-7 mx-auto text-slate-300" />
                <p>No feedback entries found.</p>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: FEEDBACK CATEGORIES MASTER */}
        <div className="space-y-4">
          <Card title="Feedback Categories Master" subtitle="Active feedback topics for client prompts">
            <div className="space-y-3 pt-2">
              {categories.length > 0 ? (
                categories.map(cat => (
                  <div key={cat._id || cat.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center justify-between">
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">{cat.name}</strong>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Active Category</span>
                    </div>

                    <button
                      onClick={() => handleToggleDeactivate(cat._id || cat.id, cat.isActive !== false)}
                      className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Deactivate Category"
                    >
                      <ToggleRight className="w-5 h-5 text-emerald-600" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs font-bold text-slate-400">
                  No active categories configured.
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>

      {/* CREATE CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-[99999]">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">Add Feedback Category</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Configure prompt classification</p>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategorySubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Architecture Renderings, Rebar Execution, Site Safety"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCat}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs uppercase cursor-pointer"
                >
                  {creatingCat ? 'Saving...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
