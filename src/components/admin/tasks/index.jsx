import React, { useState } from 'react';
import TaskList from './TaskList';
import TaskDetails from './TaskDetails';
import TaskCreateModal from './TaskCreateModal';
import TaskReports from './TaskReports';

const INITIAL_TASKS = [
  {
    id: "TSK-401",
    title: "Detail the staircase treads & balustrades blueprints",
    project: "Central Office Tower",
    assignee: "Sarah Connor",
    dept: "Architecture",
    priority: "High",
    status: "In Progress",
    deadline: "2026-07-28",
    estTime: 16,
    actualTime: 10,
    progress: 60,
    delayFlag: false,
    description: "Prepare high-fidelity drafting layout for concrete staircase balustrades, tread dimensions, risers, and structural reinforcement details matching local building codes.",
    checklist: [
      { id: 1, text: "Verify riser dimensions & clear headroom", checked: true },
      { id: 2, text: "Refine balustrade anchor bracket welds", checked: true },
      { id: 3, text: "Coordinate with MEP shafts layout plan", checked: false },
      { id: 4, text: "Print final drawing to DWG catalog", checked: false }
    ],
    dependencies: ["MEP Core Shaft sign-off", "GFC Foundation Release"],
    comments: [
      { author: "Sarah Connor", message: "Staircase dimensions updated on CAD grid.", date: "10 mins ago" },
      { author: "Alice Smith", message: "MEP core alignment looks clean, Proceeding.", date: "1 hour ago" }
    ],
    attachments: [
      { name: "Staircase_Details_V1.1.dwg", size: "3.4 MB" },
      { name: "Headroom_Logistics.pdf", size: "1.2 MB" }
    ],
    timeLogs: [
      { date: "2026-07-22", hours: 6, activity: "MEP core alignment" },
      { date: "2026-07-23", hours: 4, activity: "CAD grid refinement" }
    ]
  },
  {
    id: "TSK-402",
    title: "HVAC Duct Sizing & Layout Drafts",
    project: "Smart City Mall",
    assignee: "Alice Smith",
    dept: "Engineering",
    priority: "Critical",
    status: "Review",
    deadline: "2026-07-25",
    estTime: 24,
    actualTime: 20,
    progress: 80,
    delayFlag: false,
    description: "Model standard duct routing schedules and CFM flow distributions across floors 1-3. Ensure no conflicts with fire sprinkler piping routes.",
    checklist: [
      { id: 1, text: "CFM calculations signed off by Lead PM", checked: true },
      { id: 2, text: "Coordinate routing around service elevator shafts", checked: true },
      { id: 3, text: "Verify fire dampers location maps", checked: false }
    ],
    dependencies: ["Architectural structural layout V2"],
    comments: [
      { author: "John Wick", message: "Duct sizing CFM ratings require administrative signoff.", date: "1 hour ago" }
    ],
    attachments: [
      { name: "HVAC_Schematic_Layout.dwg", size: "5.8 MB" }
    ],
    timeLogs: [
      { date: "2026-07-21", hours: 8, activity: "Duct routing layout model" },
      { date: "2026-07-22", hours: 12, activity: "Fire dampener coordination" }
    ]
  },
  {
    id: "TSK-403",
    title: "Soil Mechanics Foundation Report Verification",
    project: "Central Office Tower",
    assignee: "Bob Johnson",
    dept: "Engineering",
    priority: "Medium",
    status: "Completed",
    deadline: "2026-07-20",
    estTime: 8,
    actualTime: 8,
    progress: 100,
    delayFlag: false,
    description: "Verify local bearing capacity calculations and silt test results on foundation trial pits prior to core footing casting.",
    checklist: [
      { id: 1, text: "Inspect trial pit soil core samples", checked: true },
      { id: 2, text: "Review laboratory compaction logs", checked: true }
    ],
    dependencies: [],
    comments: [
      { author: "Bob Johnson", message: "Silt logs compact. Soil density verified.", date: "3 days ago" }
    ],
    attachments: [
      { name: "Geotechnical_Report_Central.pdf", size: "2.1 MB" }
    ],
    timeLogs: [
      { date: "2026-07-19", hours: 8, activity: "Pit sample inspections & lab tests" }
    ]
  },
  {
    id: "TSK-404",
    title: "Sourcing replacement glass panel brackets",
    project: "Smart City Mall",
    assignee: "Frank Castle",
    dept: "Procurement",
    priority: "Critical",
    status: "Pending",
    deadline: "2026-07-15",
    estTime: 12,
    actualTime: 14,
    progress: 40,
    delayFlag: true,
    description: "Source anchor brackets and structural double-glazed panel fittings from alternate vendors to resume curtain wall mounting.",
    checklist: [
      { id: 1, text: "Log RFQ requests to list of alternate local fabricators", checked: true },
      { id: 2, text: "Compare material fatigue threshold logs", checked: false }
    ],
    dependencies: ["Anchor brackets design sign-off"],
    comments: [
      { author: "John Wick", message: "Specialized glass vendor delayed bracket delivery by two weeks.", date: "2 days ago" }
    ],
    attachments: [
      { name: "Bracket_Spec_Fatigue.pdf", size: "0.8 MB" }
    ],
    timeLogs: [
      { date: "2026-07-14", hours: 8, activity: "RFQ distribution" },
      { date: "2026-07-15", hours: 6, activity: "Vendor contract negotiations" }
    ]
  }
];

export default function Tasks({ filter = 'all' }) {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // kanban, table, reports

  const displayTasks = tasks.filter(task => {
    if (filter === 'overdue') {
      return task.progress < 100 && (task.delayFlag || new Date(task.deadline) < new Date());
    }
    return true;
  });

  // Filtering list states
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Create Task Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateTaskSubmit = (formData) => {
    const newId = tasks.length > 0 ? `TSK-${Math.max(...tasks.map(t => parseInt(t.id.split('-')[1]))) + 1}` : "TSK-401";
    const createdTask = {
      id: newId,
      title: formData.title,
      project: formData.project,
      assignee: formData.assignee,
      dept: formData.dept,
      priority: formData.priority,
      status: "Pending",
      deadline: formData.deadline,
      estTime: parseFloat(formData.estTime) || 8,
      actualTime: 0,
      progress: 0,
      delayFlag: false,
      description: formData.description,
      checklist: [],
      dependencies: formData.dependencies ? formData.dependencies.split(',').map(s=>s.trim()) : [],
      comments: [],
      attachments: [],
      timeLogs: []
    };

    setTasks(prev => [createdTask, ...prev]);
    setIsCreateModalOpen(false);
    alert(`Task ${newId} assigned successfully to ${formData.assignee}!`);
  };

  const handleUpdateTask = (updatedTask) => {
    // If the task deadline is past and status is not completed, toggle delayFlag
    const isOverdue = new Date(updatedTask.deadline) < new Date() && updatedTask.status !== 'Completed';
    const finalTask = { ...updatedTask, delayFlag: isOverdue };

    setTasks(prev => prev.map(t => t.id === finalTask.id ? finalTask : t));
    
    // Maintain state in modal
    if (selectedTask && selectedTask.id === finalTask.id) {
      setSelectedTask(finalTask);
    }
  };

  return (
    <div className="space-y-6">
      
      {viewMode === 'reports' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Task Analytics Roster</h2>
              <p className="text-xs text-slate-400">Time logs analysis, completion ratios, and workload tracking</p>
            </div>
            <button
              onClick={() => setViewMode('kanban')}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-3xs"
            >
              Back to Task Board
            </button>
          </div>
          <TaskReports tasks={tasks} />
        </div>
      ) : (
        <TaskList 
          tasks={displayTasks}
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          projectFilter={projectFilter}
          setProjectFilter={setProjectFilter}
          deptFilter={deptFilter}
          setDeptFilter={setDeptFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          onSelectTask={handleSelectTask}
          onCreateTaskClick={() => setIsCreateModalOpen(true)}
        />
      )}

      {selectedTask && (
        <TaskDetails 
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
        />
      )}

      <TaskCreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTaskSubmit}
      />

    </div>
  );

  function handleSelectTask(task) {
    setSelectedTask(task);
  }
}
