import React, { useState, useEffect } from 'react';
import TaskList from './TaskList';
import TaskDetails from './TaskDetails';
import TaskCreateModal from './TaskCreateModal';
import TaskReports from './TaskReports';
import { getProjects } from '../../../service/project';
import { 
  getTasks, createTask, approveTask, completeTask, 
  acceptTask, rejectTask, startTask, submitTaskForReview,
  addChecklistItem, toggleChecklistItem as apiToggleChecklist,
  addTaskComment, getTaskComments
} from '../../../service/task';

export default function Tasks({ filter = 'all' }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // kanban, table, reports
  const [loading, setLoading] = useState(true);

  // Filtering list states
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Create Task Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchTasksList();
  }, []);

  const fetchTasksList = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      if (res?.success && Array.isArray(res.tasks) && res.tasks.length > 0) {
        const mapped = res.tasks.map((t, idx) => {
          const projStr = typeof t.projectId === 'object' ? (t.projectId?.projectName || t.projectId?.name) : (t.project || 'General Project');
          const assigneeStr = typeof t.assignedEmployee === 'object' 
            ? (t.assignedEmployee?.name || t.assignedEmployee?.fullName || t.assignedEmployee?.email) 
            : (t.assignee || (typeof t.assignedTo === 'object' ? (t.assignedTo?.name || t.assignedTo?.fullName) : t.assignedTo) || 'Assigned Staff');
          const deptStr = typeof t.departmentId === 'object' ? t.departmentId?.name : (t.dept || 'Architecture');

          return {
            id: t._id ? `TSK-${t._id.slice(-5).toUpperCase()}` : `TSK-${idx + 401}`,
            _id: t._id,
            title: t.taskName || t.title || 'Untitled Task',
            project: projStr || 'General Project',
            assignee: assigneeStr || 'Assigned Staff',
            dept: deptStr || 'Architecture',
            priority: t.priority || 'Medium',
            status: t.status || 'Pending',
            deadline: t.deadline ? new Date(t.deadline).toISOString().split('T')[0] : '2026-12-31',
            estTime: t.estimatedTime || 16,
            actualTime: t.totalWorkingTimeMinutes ? Math.round(t.totalWorkingTimeMinutes / 60) : 8,
            progress: t.status === 'Completed' ? 100 : (t.status === 'Review' || t.status === 'Approved' ? 80 : 40),
            delayFlag: t.isDelayed || false,
            description: t.description || 'Task assignment deliverable.',
            checklist: t.checklist || [],
            dependencies: t.dependsOn || [],
            comments: t.comments || [],
            attachments: t.attachments || [],
            timeLogs: []
          };
        });

        // Deduplicate tasks by _id / id
        const unique = [];
        const seen = new Set();
        mapped.forEach(item => {
          const key = item._id || item.id;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(item);
          }
        });
        setTasks(unique);
      } else {
        // Fallback to project milestones
        const projRes = await getProjects();
        if (projRes?.success && Array.isArray(projRes.projects)) {
          const loadedTasks = [];
          projRes.projects.forEach((proj, pIdx) => {
            const projName = proj.projectName || proj.name || 'Project';
            const milestones = proj.milestones || [];
            milestones.forEach((m, mIdx) => {
              loadedTasks.push({
                id: m._id ? `TSK-${m._id.slice(-5).toUpperCase()}` : `TSK-${pIdx + 1}0${mIdx + 1}`,
                _id: m._id,
                title: m.name || m.title || 'Task Target',
                project: projName,
                assignee: m.assignedTo?.name || m.assignedTo || 'Project Team',
                dept: 'Architecture',
                priority: proj.priority || 'Medium',
                status: m.isCompleted ? 'Completed' : 'In Progress',
                deadline: m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : '2026-12-31',
                estTime: 16,
                actualTime: m.isCompleted ? 16 : 8,
                progress: m.isCompleted ? 100 : (m.progressPercentage || 50),
                delayFlag: proj.isDelayed || false,
                description: `Milestone deliverable for project: ${projName}`,
                checklist: [
                  { id: 1, text: "Structural & architectural verification", checked: m.isCompleted }
                ],
                dependencies: [],
                comments: [],
                attachments: [],
                timeLogs: []
              });
            });
          });

          const unique = [];
          const seen = new Set();
          loadedTasks.forEach(item => {
            const key = item._id || item.id;
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(item);
            }
          });
          setTasks(unique);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch tasks list:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTaskSubmit = async (formData) => {
    const newId = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCreatedTask = {
      id: newId,
      title: formData.title || 'New Task',
      project: formData.project || 'General Project',
      assignee: formData.assignee || 'Assigned Staff',
      dept: formData.dept || 'Architecture',
      priority: formData.priority || 'Medium',
      status: "Pending",
      deadline: formData.deadline || '2026-12-31',
      estTime: parseFloat(formData.estTime) || 8,
      actualTime: 0,
      progress: 0,
      delayFlag: false,
      description: formData.description || '',
      checklist: [],
      dependencies: [],
      comments: [],
      attachments: [],
      timeLogs: []
    };

    setTasks(prev => {
      const exists = prev.some(t => t.title === newCreatedTask.title && t.project === newCreatedTask.project);
      return exists ? prev : [newCreatedTask, ...prev];
    });
    setIsCreateModalOpen(false);

    try {
      const res = await createTask({
        projectId: formData.projectId || formData.project,
        taskName: formData.title,
        description: formData.description,
        priority: formData.priority || 'Medium',
        departmentId: formData.departmentId || null,
        assignedEmployee: formData.assignedEmployee || formData.assignee,
        estimatedTime: parseFloat(formData.estTime) || 8,
        deadline: formData.deadline
      });

      if (res?.success) {
        fetchTasksList();
      }
    } catch (err) {
      console.warn("Backend notice for task creation sync:", err);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const targetTask = tasks.find(t => (t._id && t._id === taskId) || t.id === taskId);
    if (targetTask && targetTask._id) {
      try {
        if (newStatus === 'Accepted') await acceptTask(targetTask._id);
        else if (newStatus === 'In Progress') await startTask(targetTask._id);
        else if (newStatus === 'Review') await submitTaskForReview(targetTask._id);
        else if (newStatus === 'Approved') await approveTask(targetTask._id);
        else if (newStatus === 'Completed') await completeTask(targetTask._id);
      } catch (err) {
        console.warn("Backend status update notice:", err);
      }
    }

    const updated = tasks.map(t => {
      const isMatch = (t._id && targetTask?._id) ? (t._id === targetTask._id) : (t.id === taskId);
      if (isMatch) {
        return {
          ...t, 
          status: newStatus, 
          progress: newStatus === 'Completed' ? 100 : t.progress 
        };
      }
      return t;
    });
    setTasks(updated);
    if (selectedTask && ((selectedTask._id && targetTask?._id && selectedTask._id === targetTask._id) || selectedTask.id === taskId)) {
      setSelectedTask({ ...selectedTask, status: newStatus, progress: newStatus === 'Completed' ? 100 : selectedTask.progress });
    }
  };

  const handleUpdateTaskProgress = (taskId, newProgress) => {
    const updated = tasks.map(t => (t.id === taskId || t._id === taskId) ? {
      ...t, 
      progress: newProgress,
      status: newProgress === 100 ? 'Completed' : t.status 
    } : t);
    setTasks(updated);
    if (selectedTask && (selectedTask.id === taskId || selectedTask._id === taskId)) {
      setSelectedTask({ ...selectedTask, progress: newProgress, status: newProgress === 100 ? 'Completed' : selectedTask.status });
    }
  };

  const handleAddComment = async (taskId, message) => {
    const targetTask = tasks.find(t => t.id === taskId || t._id === taskId);
    if (targetTask && targetTask._id) {
      try {
        await addTaskComment(targetTask._id, message);
      } catch (err) {
        console.warn("Notice adding task comment:", err);
      }
    }
    const newComment = { author: "Super Admin", message, date: "Just now" };
    const updated = tasks.map(t => (t.id === taskId || t._id === taskId) ? {
      ...t, 
      comments: [...(t.comments || []), newComment]
    } : t);
    setTasks(updated);
    if (selectedTask && (selectedTask.id === taskId || selectedTask._id === taskId)) {
      setSelectedTask({ ...selectedTask, comments: [...(selectedTask.comments || []), newComment] });
    }
  };

  const handleToggleChecklist = (taskId, checklistId) => {
    const updated = tasks.map(t => {
      if (t.id === taskId || t._id === taskId) {
        const newChecklist = (t.checklist || []).map(item => item.id === checklistId ? { ...item, checked: !item.checked } : item);
        const completedCount = newChecklist.filter(c => c.checked).length;
        const autoProgress = newChecklist.length > 0 ? Math.round((completedCount / newChecklist.length) * 100) : t.progress;
        return { ...t, checklist: newChecklist, progress: autoProgress, status: autoProgress === 100 ? 'Completed' : t.status };
      }
      return t;
    });
    setTasks(updated);
    if (selectedTask && (selectedTask.id === taskId || selectedTask._id === taskId)) {
      const newChecklist = (selectedTask.checklist || []).map(item => item.id === checklistId ? { ...item, checked: !item.checked } : item);
      const completedCount = newChecklist.filter(c => c.checked).length;
      const autoProgress = newChecklist.length > 0 ? Math.round((completedCount / newChecklist.length) * 100) : selectedTask.progress;
      setSelectedTask({ ...selectedTask, checklist: newChecklist, progress: autoProgress, status: autoProgress === 100 ? 'Completed' : selectedTask.status });
    }
  };

  const displayTasks = tasks.filter(task => {
    if (filter === 'overdue') {
      return task.progress < 100 && (task.delayFlag || new Date(task.deadline) < new Date());
    }
    return true;
  });

  return (
    <div className="w-full font-sans">
      {selectedTask ? (
        <TaskDetails
          task={selectedTask}
          onBack={() => setSelectedTask(null)}
          onUpdateStatus={(newStatus) => handleUpdateTaskStatus(selectedTask.id, newStatus)}
          onUpdateProgress={(newProgress) => handleUpdateTaskProgress(selectedTask.id, newProgress)}
          onAddComment={(msg) => handleAddComment(selectedTask.id, msg)}
          onToggleChecklist={(checklistId) => handleToggleChecklist(selectedTask.id, checklistId)}
        />
      ) : viewMode === 'reports' ? (
        <TaskReports tasks={tasks} onBack={() => setViewMode('kanban')} />
      ) : (
        <TaskList
          tasks={displayTasks}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          projectFilter={projectFilter}
          setProjectFilter={setProjectFilter}
          deptFilter={deptFilter}
          setDeptFilter={setDeptFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onSelectTask={(task) => setSelectedTask(task)}
          onCreateTaskClick={() => setIsCreateModalOpen(true)}
          onCreateClick={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* CREATE TASK MODAL */}
      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTaskSubmit}
      />
    </div>
  );
}
