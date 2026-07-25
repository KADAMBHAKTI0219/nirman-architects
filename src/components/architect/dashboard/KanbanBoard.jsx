import React from 'react';
import Card from '../../common/Card';
import TaskBoard from '../../common/TaskBoard';

const architectTasks = [
  { id: 201, title: "Draft First Floor Plan Column Layouts", project: "Central Office Tower", assignee: "Sarah Connor", dueDate: "2026-07-25", priority: "High", status: "In Progress", isOverdue: false },
  { id: 202, title: "HVAC Duct Sizing & Layout Drafts", project: "Smart City Mall", assignee: "Sarah Connor", dueDate: "2026-07-20", priority: "High", status: "Pending", isOverdue: true },
  { id: 203, title: "Lobby Interior Rendering & Material Scheme", project: "Oceanic Luxury Villas", assignee: "Sarah Connor", dueDate: "2026-07-30", priority: "Medium", status: "Accepted", isOverdue: false },
  { id: 204, title: "Landscape Layout Plan Rev B", project: "Oceanic Luxury Villas", assignee: "Sarah Connor", dueDate: "2026-08-05", priority: "Low", status: "Review", isOverdue: false },
  { id: 205, title: "Soil Mechanics Foundation Report Verification", project: "Metro Station Phase 3", assignee: "Sarah Connor", dueDate: "2026-07-15", priority: "Medium", status: "Completed", isOverdue: false }
];

export default function KanbanBoard() {
  return (
    <Card title="My Work Tasks Kanban" subtitle="Pending → Accepted → In Progress → Review → Approved → Completed">
      <TaskBoard initialTasks={architectTasks} />
    </Card>
  );
}
