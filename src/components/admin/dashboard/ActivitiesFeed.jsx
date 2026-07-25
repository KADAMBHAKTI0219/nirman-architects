import React from 'react';
import Card from '../../common/Card';
import { CheckCircle2, AlertCircle, ClipboardList } from 'lucide-react';

export default function ActivitiesFeed() {
  return (
    <Card title="Recent Workforce Activities" subtitle="Operations from office and site units today">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </span>
          <div className="text-xs text-slate-650">
            <strong>HR Department</strong> updated the biometric records for Site Office 3.
            <span className="text-[10px] text-slate-450 block mt-1">20 mins ago</span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="p-2 bg-rose-50 rounded-xl text-rose-600 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </span>
          <div className="text-xs text-slate-650">
            <strong>Project Manager</strong> logged a delay warning on Smart City Mall concrete foundation.
            <span className="text-[10px] text-slate-450 block mt-1">1 hour ago</span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="p-2 bg-slate-100 rounded-xl text-slate-605 mt-0.5">
            <ClipboardList className="w-4 h-4" />
          </span>
          <div className="text-xs text-slate-650">
            <strong>Sarah Connor</strong> uploaded 3 interior design schematics for Oceanic Villas.
            <span className="text-[10px] text-slate-450 block mt-1">3 hours ago</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
