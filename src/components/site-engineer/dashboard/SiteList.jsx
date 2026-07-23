import React from 'react';
import Card from '../../common/Card';

export default function SiteList({ sites, onProgressChange }) {
  return (
    <Card title="Active Building Sites & Progress" subtitle="Physical completion percentage at site location">
      <div className="space-y-5">
        {sites.map((site) => (
          <div key={site.id} className="space-y-2 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-805 text-sm block">{site.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{site.location}</span>
              </div>
              <span className="text-slate-400 font-bold">Supervisor: {site.supervisor}</span>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={site.progress}
                onChange={(e) => onProgressChange(site.id, parseInt(e.target.value))}
                className="flex-1 accent-brand-dark cursor-pointer h-2 bg-slate-105 rounded-lg appearance-none"
              />
              <span className="text-xs font-bold text-slate-700 w-10 text-right">{site.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
