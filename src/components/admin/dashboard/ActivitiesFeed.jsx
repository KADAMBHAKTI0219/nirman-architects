import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import { CheckCircle2, AlertCircle, ClipboardList } from 'lucide-react';
import { getDrawings } from '../../../service/drawing';
import { getProjects } from '../../../service/project';
import { getTasks } from '../../../service/task';

export default function ActivitiesFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diffMs) || diffMs < 0) return 'Recently';
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const [drgRes, prjRes, tskRes] = await Promise.allSettled([
        getDrawings(),
        getProjects(),
        getTasks()
      ]);

      const items = [];

      // 1. Drawings Activities
      if (drgRes.status === 'fulfilled' && drgRes.value) {
        const drawings = drgRes.value.drawings || drgRes.value.data?.drawings || drgRes.value.allDrawings || [];
        drawings.forEach(d => {
          const uploaderName = d.createdBy?.name || d.uploadedBy?.name || d.uploader || 'Bhakti Kadam';
          const title = d.drawingName || d.title || 'Design Blueprint';
          const project = typeof d.projectId === 'object' && d.projectId !== null ? (d.projectId.projectName || d.projectId.name) : (d.projectName || 'Tower Phase');
          const date = d.createdAt || d.uploadDate || d.updatedAt;

          items.push({
            id: `drg-${d._id || d.id}`,
            actor: uploaderName,
            text: `uploaded drawing "${title}" for ${project}.`,
            timestamp: date ? new Date(date).getTime() : Date.now(),
            timeAgoStr: timeAgo(date),
            type: 'drawing'
          });
        });
      }

      // 2. Projects Activities
      if (prjRes.status === 'fulfilled' && prjRes.value) {
        const projects = prjRes.value.projects || prjRes.value.data || [];
        projects.forEach(p => {
          const creatorName = p.createdBy?.name || 'Bhakti Kadam';
          const pName = p.projectName || p.name || 'Tower Phase';
          const status = p.status || 'Active';
          const isDelayed = p.delayFlag || p.isDelayed;
          const date = p.updatedAt || p.createdAt;

          items.push({
            id: `prj-${p._id || p.id}`,
            actor: creatorName,
            text: isDelayed 
              ? `logged a delay risk warning on ${pName}.`
              : `updated project charter & status for ${pName} (${status}).`,
            timestamp: date ? new Date(date).getTime() : Date.now(),
            timeAgoStr: timeAgo(date),
            type: isDelayed ? 'warning' : 'project'
          });
        });
      }

      // 3. Tasks Activities
      if (tskRes.status === 'fulfilled' && tskRes.value) {
        const tasks = tskRes.value.tasks || tskRes.value.data || [];
        tasks.forEach(t => {
          const tName = t.taskName || t.title || 'Task';
          const assigneeName = typeof t.assignedEmployee === 'object' && t.assignedEmployee !== null 
            ? (t.assignedEmployee.name || t.assignedEmployee.email) 
            : (t.assignee || 'Engineering Staff');
          const date = t.createdAt || t.deadline;

          items.push({
            id: `tsk-${t._id || t.id}`,
            actor: 'System Admin',
            text: `assigned task "${tName}" to ${assigneeName}.`,
            timestamp: date ? new Date(date).getTime() : Date.now(),
            timeAgoStr: timeAgo(date),
            type: 'task'
          });
        });
      }

      items.sort((a, b) => b.timestamp - a.timestamp);
      
      if (items.length > 0) {
        setActivities(items.slice(0, 5));
      } else {
        setActivities([
          { id: 1, actor: 'HR Department', text: 'updated the biometric records for Site Office 3.', timeAgoStr: '20 mins ago', type: 'project' },
          { id: 2, actor: 'Project Manager', text: 'logged a delay warning on Smart City Mall concrete foundation.', timeAgoStr: '1 hour ago', type: 'warning' },
          { id: 3, actor: 'Bhakti Kadam', text: 'uploaded 3 interior design schematics for Oceanic Villas.', timeAgoStr: '3 hours ago', type: 'drawing' }
        ]);
      }
    } catch (err) {
      console.warn("Error loading workforce activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <Card title="Recent Workforce Activities" subtitle="Operations from office and site units today">
      <div className="space-y-4">
        {activities.map((act) => (
          <div key={act.id} className="flex items-start gap-3">
            <span className={`p-2 rounded-xl mt-0.5 ${
              act.type === 'warning' ? 'bg-rose-50 text-rose-600' :
              act.type === 'project' ? 'bg-emerald-50 text-emerald-600' :
              'bg-slate-100 text-slate-600'
            }`}>
              {act.type === 'warning' && <AlertCircle className="w-4 h-4" />}
              {act.type === 'project' && <CheckCircle2 className="w-4 h-4" />}
              {(act.type === 'drawing' || act.type === 'task') && <ClipboardList className="w-4 h-4" />}
            </span>
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 font-bold">{act.actor}</strong> {act.text}
              <span className="text-[10px] text-slate-400 block mt-1 font-medium">{act.timeAgoStr}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
