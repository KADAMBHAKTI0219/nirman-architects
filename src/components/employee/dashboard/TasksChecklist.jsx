import React from 'react';
import Card from '../../common/Card';
import { CheckCircle } from 'lucide-react';

export default function TasksChecklist({ tasks, onToggleTask }) {
  return (
    <Card title="My Work Tasks Checklist" subtitle="Check off completed design and research tasks">
      <div className="space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            onClick={() => onToggleTask(task.id)}
            className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
              task.completed 
                ? 'bg-emerald-50/20 border-emerald-105 text-slate-500' 
                : 'bg-white border-slate-100 hover:border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 flex items-center justify-center rounded-lg border transition-all ${
                task.completed 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'border-slate-300'
              }`}>
                {task.completed && <CheckCircle className="w-3.5 h-3.5 text-white fill-emerald-500" />}
              </div>
              <span className={`text-xs font-semibold ${task.completed ? 'line-through text-slate-400' : ''}`}>
                {task.title}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Due: {task.deadline}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
