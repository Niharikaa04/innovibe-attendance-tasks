'use client';

import React from 'react';
import {
  AlertTriangle,
  Clock,
  Database,
  ChevronRight,
  UserCheck,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';

interface NeedsAttentionAlertsProps {
  onSelectAlert: (alertType: string, id: string) => void;
}

export function NeedsAttentionAlerts({ onSelectAlert }: NeedsAttentionAlertsProps) {
  const alerts = [
    {
      id: 'alt_1',
      category: 'HIGH PRIORITY',
      type: 'CRITICAL_DIAGNOSTIC',
      title: 'Vehicle EV-2048 — Battery Diagnostic Failure',
      details: 'BMS thermistor reading 68°C • Waiting for manual inspection 42 min',
      assigned: 'Rahul Sharma',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: ShieldAlert,
      iconColor: 'text-rose-600',
      actionText: 'Inspect Ticket',
    },
    {
      id: 'alt_2',
      category: 'SLA AT RISK',
      type: 'SLA_RISK',
      title: 'Job #SV-10482 — Estimated Completion Delayed',
      details: 'Expected 02:30 PM • Current delay: 27 min due to controller realignment',
      assigned: 'Manoj Kumar',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
      icon: Clock,
      iconColor: 'text-amber-600',
      actionText: 'View Job Progress',
    },
    {
      id: 'alt_3',
      category: 'PARTS SHORTAGE',
      type: 'PARTS_BLOCKER',
      title: 'Brake Pad Assembly (Reg-B2) — Out of Stock',
      details: '2 active center jobs currently waiting on parts allocation from main depot',
      assigned: 'Inventory Desk',
      badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-200',
      icon: Database,
      iconColor: 'text-indigo-600',
      actionText: 'Parts Desk',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Needs Attention <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Operational bottlenecks requiring immediate Service Manager intervention
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200/70 px-3 py-1 rounded-full">
          3 Items Require Action
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {alerts.map((alt) => {
          const Icon = alt.icon;

          return (
            <div
              key={alt.id}
              onClick={() => onSelectAlert(alt.type, alt.id)}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${alt.badgeBg}`}>
                    {alt.category}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <UserCheck className="h-3 w-3" /> {alt.assigned}
                  </span>
                </div>

                <h3 className="text-xs font-extrabold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                  {alt.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  {alt.details}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAlert(alt.type, alt.id);
                  }}
                  className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer group-hover:underline"
                >
                  <span>{alt.actionText}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
