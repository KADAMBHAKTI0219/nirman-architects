import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Clock, AlertTriangle, ChevronRight, Users, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../../../service/project';

export default function ProjectTimelineList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      if (res && res.success && Array.isArray(res.projects) && res.projects.length > 0) {
        const mapped = res.projects.map((p, idx) => {
          const progress = Number(p.progressPercentage || p.progressPercent || 0);
          const isDelayed = p.delayFlag || p.isDelayed || p.status === 'Delayed';
          
          let statusText = 'On Track';
          let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200/70';
          let color = 'from-emerald-500 to-teal-600';

          if (isDelayed) {
            statusText = 'Delayed / At Risk';
            badgeColor = 'bg-rose-50 text-rose-700 border-rose-200/70';
            color = 'from-rose-500 to-red-600';
          } else if (progress > 80) {
            statusText = 'Nearing Completion';
            badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200/70';
            color = 'from-indigo-500 to-purple-600';
          } else if (progress > 40) {
            statusText = 'In Progress';
            badgeColor = 'bg-sky-50 text-sky-700 border-sky-200/70';
            color = 'from-sky-500 to-blue-600';
          }

          const nextMs = Array.isArray(p.milestones) && p.milestones.length > 0
            ? p.milestones[0].name || p.milestones[0].title
            : 'Foundation Inspection & Structural Audit';

          return {
            id: p._id || p.id || idx,
            name: p.projectName || p.name || 'Architectural Project',
            phase: p.status || 'Active Phase',
            progress,
            deadline: p.estimatedCompletion ? new Date(p.estimatedCompletion).toISOString().split('T')[0] : (p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '2026-09-15'),
            status: statusText,
            color,
            badgeColor,
            nextMilestone: nextMs,
            team: [
              { name: p.createdBy?.name || "Bhakti Kadam", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80" },
              { name: "Project Lead", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" }
            ]
          };
        });
        setProjects(mapped);
      } else {
        setProjects([
          { 
            id: 1, 
            name: "Central Office Tower", 
            phase: "GFC Release Phase",
            progress: 75, 
            deadline: "2026-09-15", 
            status: "On Track", 
            color: "from-emerald-500 to-teal-600",
            badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
            nextMilestone: "Facade Inspection & Sealant Signoff",
            team: [
              { name: "Sarah Connor", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80" },
              { name: "John Doe", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" }
            ]
          },
          { 
            id: 2, 
            name: "Oceanic Luxury Villas", 
            phase: "Structural DWG",
            progress: 62, 
            deadline: "2026-10-30", 
            status: "On Track", 
            color: "from-sky-500 to-blue-600",
            badgeColor: "bg-sky-50 text-sky-700 border-sky-200/70",
            nextMilestone: "Basement Slab Concrete Pour",
            team: [
              { name: "Alice Smith", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" },
              { name: "Bob Johnson", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" }
            ]
          }
        ]);
      }
    } catch (e) {
      console.warn("Failed to fetch timeline projects", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title="Active Projects & Milestone Timelines" 
      subtitle="Track live completion rate, phase releases, and assigned team leads"
      headerAction={
        <button 
          onClick={() => navigate('/project-manager/projects')}
          className="text-xs font-black text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View Master Projects</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      }
    >
      <div className="space-y-4 pt-1">
        {loading ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-sky-500" />
            <p className="text-xs font-normal">Loading project timelines...</p>
          </div>
        ) : projects.map((p, idx) => (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            onClick={() => navigate('/project-manager/projects')}
            className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-3 group cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-sky-600 transition-colors">
                    {p.name}
                  </h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700 uppercase tracking-wider">
                    {p.phase}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Target: <strong className="text-slate-700">{p.deadline}</strong>
                  </span>
                  <span>&bull;</span>
                  <span className="truncate max-w-[240px]">
                    Next: <strong className="text-slate-700">{p.nextMilestone}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Team Avatars */}
                <div className="flex -space-x-2 overflow-hidden">
                  {p.team.map((member, mIdx) => (
                    <img
                      key={mIdx}
                      src={member.avatar}
                      alt={member.name}
                      title={member.name}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                    />
                  ))}
                </div>

                <span className={`font-bold px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider border ${p.badgeColor}`}>
                  {p.status}
                </span>
              </div>
            </div>

            {/* Progress Bar with animated fill */}
            <div className="flex items-center gap-3 pt-0.5">
              <div className="flex-1 bg-slate-200/80 h-2.5 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${p.color} rounded-full shadow-2xs`}
                />
              </div>
              <span className="text-xs font-black text-slate-800 min-w-[36px] text-right">
                {p.progress}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}


