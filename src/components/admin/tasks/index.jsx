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
  addTaskComment, getTaskComments, deleteTask
} from '../../../service/task';
import { useToast } from '../../../context/ToastContext';

export default function Tasks({ filter = 'all' }) {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // cards, table, reports
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
        setTasks([]);
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
      timeLogs: [],
      actualStartTime: formData.actualStartTime || null,
      completionTime: formData.completionTime || null,
      totalWorkingTimeMinutes: formData.totalWorkingTimeMinutes ? parseInt(formData.totalWorkingTimeMinutes, 10) : null,
      idleTimeMinutes: formData.idleTimeMinutes ? parseInt(formData.idleTimeMinutes, 10) : null,
      productivityScore: formData.productivityScore ? parseInt(formData.productivityScore, 10) : null
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
        deadline: formData.deadline,
        actualStartTime: formData.actualStartTime || null,
        completionTime: formData.completionTime || null,
        totalWorkingTimeMinutes: formData.totalWorkingTimeMinutes ? parseInt(formData.totalWorkingTimeMinutes, 10) : null,
        idleTimeMinutes: formData.idleTimeMinutes ? parseInt(formData.idleTimeMinutes, 10) : null,
        productivityScore: formData.productivityScore ? parseInt(formData.productivityScore, 10) : null
      });

      if (res?.success) {
        fetchTasksList();
      }
    } catch (err) {
      console.warn("Backend notice for task creation sync:", err);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const targetTask = tasks.find(t => 
      (t._id && (t._id === taskId || t.id === taskId)) || 
      (t.id && (t.id === taskId || t._id === taskId))
    );
    
    const updated = tasks.map(t => {
      const isMatch = (t._id && targetTask?._id && t._id === targetTask._id) || 
                      (t.id && targetTask?.id && t.id === targetTask.id) ||
                      (t._id === taskId || t.id === taskId);
      if (isMatch) {
        return {
          ...t, 
          status: newStatus, 
          progress: newStatus === 'Completed' ? 100 : (newStatus === 'Approved' ? 80 : (newStatus === 'Review' ? 60 : (newStatus === 'In Progress' ? 40 : (newStatus === 'Accepted' ? 20 : t.progress))))
        };
      }
      return t;
    });

    setTasks(updated);

    if (selectedTask) {
      setSelectedTask(prev => ({ 
        ...prev, 
        status: newStatus, 
        progress: newStatus === 'Completed' ? 100 : (newStatus === 'Approved' ? 80 : (newStatus === 'Review' ? 60 : (newStatus === 'In Progress' ? 40 : (newStatus === 'Accepted' ? 20 : prev?.progress))))
      }));
    }

    const realId = targetTask?._id || taskId;
    if (realId) {
      try {
        if (newStatus === 'Accepted') await acceptTask(realId);
        else if (newStatus === 'In Progress') await startTask(realId);
        else if (newStatus === 'Review') await submitTaskForReview(realId);
        else if (newStatus === 'Approved') await approveTask(realId);
        else if (newStatus === 'Completed') await completeTask(realId);
        else if (newStatus === 'Rejected') await rejectTask(realId);
        else await updateTask(realId, { status: newStatus });
      } catch (err) {
        console.warn("Backend status update notice:", err);
      }
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

  const handleDeleteTask = async (taskId) => {
    const target = tasks.find(t => t.id === taskId || t._id === taskId);
    const taskTitle = target?.title || target?.taskName || 'Task';
    if (!window.confirm(`Are you sure you want to delete task "${taskTitle}"?`)) return;
    try {
      const res = await deleteTask(taskId);
      if (res && res.success !== false) {
        setTasks(prev => prev.filter(t => t.id !== taskId && t._id !== taskId));
        showToast(`Task "${taskTitle}" deleted successfully!`, "warning", "Task Deleted", true);
        if (selectedTask && (selectedTask.id === taskId || selectedTask._id === taskId)) {
          setSelectedTask(null);
        }
      } else {
        showToast(res?.message || "Failed to delete task.", "error");
      }
    } catch (err) {
      showToast(err.message || "Failed to delete task.", "error");
    }
  };

  const displayTasks = tasks.filter(task => {
    if (filter === 'overdue') {
      return task.progress < 100 && (task.delayFlag || new Date(task.deadline) < new Date());
    }
    return true;
  });

  return (
    <div className="w-full font-sans relative">
      {viewMode === 'reports' ? (
        <TaskReports tasks={tasks} onBack={() => setViewMode('cards')} />
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
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* TASK DETAILS MODAL OVERLAY */}
      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          onBack={() => setSelectedTask(null)}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={(newStatus) => handleUpdateTaskStatus(selectedTask._id || selectedTask.id, newStatus)}
          onUpdateProgress={(newProgress) => handleUpdateTaskProgress(selectedTask._id || selectedTask.id, newProgress)}
          onAddComment={(msg) => handleAddComment(selectedTask._id || selectedTask.id, msg)}
          onToggleChecklist={(checklistId) => handleToggleChecklist(selectedTask._id || selectedTask.id, checklistId)}
          onDeleteTask={handleDeleteTask}
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
