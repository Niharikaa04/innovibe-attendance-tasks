'use client';

import React from 'react';
import {
  ClipboardList,
  Wrench,
  CheckCircle2,
  Users,
  Clock,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

interface ServiceKpiGridProps {
  onSelectKpiFilter: (filterKey: string) => void;
  activeFilter?: string | null;
}

export function ServiceKpiGrid({ onSelectKpiFilter, activeFilter }: ServiceKpiGridProps) {
  const kpis = [
    {
      key: 'open-tickets',
      title: 'OPEN SERVICE TICKETS',
      value: '18',
      context: '↓ 3 today',
      isPositive: true,
      subtext: '4 tickets awaiting dispatch',
      icon: ClipboardList,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      sparklineColor: 'text-blue-500',
    },
    {
      key: 'active-jobs',
      title: 'ACTIVE JOBS',
      value: '12',
      context: '4 in queue',
      isPositive: true,
      subtext: '8 in progress across 5 bays',
      icon: Wrench,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      sparklineColor: 'text-indigo-500',
    },
    {
      key: 'completed-today',
      title: 'COMPLETED TODAY',
      value: '27',
      context: '78% on-time',
      isPositive: true,
      subtext: '+5 vs yesterday average',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      sparklineColor: 'text-emerald-500',
    },
    {
      key: 'technicians-active',
      title: 'TECHNICIANS ACTIVE',
      value: '8 / 10',
      context: '80% deployed',
      isPositive: true,
      subtext: '2 available for dispatch',
      icon: Users,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      sparklineColor: 'text-amber-500',
    },
    {
      key: 'avg-service-time',
      title: 'AVG SERVICE TIME',
      value: '2h 18m',
      context: '↓ 12 min',
      isPositive: true,
      subtext: 'Target: 2h 30m maximum',
      icon: Clock,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      sparklineColor: 'text-purple-500',
    },
    {
      key: 'sla-compliance',
      title: 'SLA COMPLIANCE',
      value: '92%',
      context: '↑ 4.8%',
      isPositive: true,
      subtext: '3 jobs currently at SLA risk',
      icon: ShieldCheck,
      iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
      sparklineColor: 'text-teal-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 text-left">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isSelected = activeFilter === kpi.key;

        return (
          <div
            key={kpi.key}
            onClick={() => onSelectKpiFilter(kpi.key)}
            className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-2xs flex flex-col justify-between group ${
              isSelected
                ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block truncate">
                  {kpi.title}
                </span>
                <div className={`h-8 w-8 rounded-xl border flex items-center justify-center shrink-0 ${kpi.iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-2">
                <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {kpi.value}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className={`font-extrabold flex items-center gap-0.5 ${kpi.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {kpi.context.includes('↑') ? (
                  <TrendingUp className="h-3 w-3" />
                ) : kpi.context.includes('↓') ? (
                  <TrendingDown className="h-3 w-3" />
                ) : null}
                <span>{kpi.context}</span>
              </span>

              <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
