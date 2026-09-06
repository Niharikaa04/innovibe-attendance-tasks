'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Layers,
  Wrench,
  Database,
  ShieldCheck,
  Flame,
  ChevronRight,
  Filter,
  RefreshCw,
  X,
  Building,
  User,
  ArrowRight,
  Activity,
  Zap,
  Inbox,
  AlertCircle,
} from 'lucide-react';

export function ServiceKypView() {
  const [timeFilter, setTimeFilter] = useState<'TODAY' | '7 DAYS' | '30 DAYS' | 'CUSTOM'>('TODAY');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Drill-down Modal State
  const [activeDrillDown, setActiveDrillDown] = useState<{
    title: string;
    subtitle: string;
    items: any[];
    type: 'jobs' | 'techs' | 'bays' | 'parts' | 'customers' | 'qc';
  } | null>(null);

  // Trend Metric Toggles
  const [trendToggles, setTrendToggles] = useState({
    received: true,
    completed: true,
    pending: true,
    delayed: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Operational KPIs
  const kpis = [
    { title: 'ACTIVE JOBS', value: '24', change: '+3 today', color: 'text-slate-900', bg: 'bg-white', border: 'border-slate-200/80', filterType: 'active' },
    { title: 'COMPLETED TODAY', value: '18', change: '84% target', color: 'text-emerald-600', bg: 'bg-white', border: 'border-slate-200/80', filterType: 'completed' },
    { title: 'PENDING', value: '6', change: 'In Queue', color: 'text-amber-600', bg: 'bg-white', border: 'border-slate-200/80', filterType: 'pending' },
    { title: 'ON-TIME COMPLETION', value: '87%', change: 'SLA Compliant', color: 'text-blue-600', bg: 'bg-white', border: 'border-slate-200/80', filterType: 'ontime' },
    { title: 'AVG TURNAROUND', value: '2h 18m', change: '-9m vs target', color: 'text-purple-600', bg: 'bg-white', border: 'border-slate-200/80', filterType: 'tat' },
    { title: 'TECH UTILIZATION', value: '84%', change: 'Optimal load', color: 'text-teal-600', bg: 'bg-white', border: 'border-slate-200/80', filterType: 'utilization' },
  ];

  // Pipeline Stages
  const pipelineStages = [
    { id: 'new', name: 'NEW', count: 4, percent: '10%', color: 'bg-blue-500', textColor: 'text-blue-700', bgSoft: 'bg-blue-50 border-blue-200' },
    { id: 'waiting', name: 'WAITING', count: 6, percent: '15%', color: 'bg-amber-500', textColor: 'text-amber-700', bgSoft: 'bg-amber-50 border-amber-200' },
    { id: 'assigned', name: 'ASSIGNED', count: 5, percent: '12%', color: 'bg-indigo-500', textColor: 'text-indigo-700', bgSoft: 'bg-indigo-50 border-indigo-200' },
    { id: 'in_service', name: 'IN SERVICE', count: 8, percent: '20%', color: 'bg-teal-500', textColor: 'text-teal-700', bgSoft: 'bg-teal-50 border-teal-200' },
    { id: 'qc', name: 'QUALITY CONTROL', count: 2, percent: '5%', color: 'bg-purple-500', textColor: 'text-purple-700', bgSoft: 'bg-purple-50 border-purple-200' },
    { id: 'completed', name: 'COMPLETED', count: 18, percent: '38%', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgSoft: 'bg-emerald-50 border-emerald-200' },
  ];

  // Technician Roster
  const technicians = [
    { id: 't1', name: 'Rahul Sharma', status: 'WORKING', activeJobs: 3, completed: 8, utilization: 87, avgTat: '1h 45m', delayed: 0, currentJob: 'Ather 450X BMS Diagnostics' },
    { id: 't2', name: 'Suresh Kumar', status: 'WORKING', activeJobs: 2, completed: 6, utilization: 71, avgTat: '2h 10m', delayed: 1, currentJob: 'Ola S1 Pro Motor Tuning' },
    { id: 't3', name: 'Priya Singh', status: 'AVAILABLE', activeJobs: 1, completed: 9, utilization: 94, avgTat: '1h 30m', delayed: 0, currentJob: 'TVS iQube Doorstep Service' },
    { id: 't4', name: 'Manoj Kumar', status: 'WORKING', activeJobs: 3, completed: 7, utilization: 89, avgTat: '1h 55m', delayed: 0, currentJob: 'Hero Electric Brake Overhaul' },
  ];

  // Service Bays Data
  const serviceBays = [
    { id: 'BAY-01', name: 'Bay 01 (HV Power)', status: 'OCCUPIED', vehicle: 'Ather 450X (AP39AB1234)', tech: 'Rahul Sharma', job: 'Battery Diagnostics', duration: '45 mins' },
    { id: 'BAY-02', name: 'Bay 02 (General)', status: 'OCCUPIED', vehicle: 'Ola S1 Pro (AP39CD5678)', tech: 'Manoj Kumar', job: 'Brake Inspection', duration: '30 mins' },
    { id: 'BAY-03', name: 'Bay 03 (Express)', status: 'AVAILABLE', vehicle: 'None', tech: 'Unassigned', job: 'Ready for Next Vehicle', duration: '0 mins' },
    { id: 'BAY-04', name: 'Bay 04 (QC Gate)', status: 'OCCUPIED', vehicle: 'TVS iQube (AP39EF9012)', tech: 'Priya Singh', job: 'Final Road Audit', duration: '15 mins' },
    { id: 'BAY-05', name: 'Bay 05 (Sanitation)', status: 'CLEANING', vehicle: 'Hero Electric', tech: 'Facility Staff', job: 'Post-Service Wash', duration: '10 mins' },
    { id: 'BAY-06', name: 'Bay 06 (Maintenance)', status: 'MAINTENANCE', vehicle: 'Hoist Calibration', tech: 'Depot Team', job: 'Lift Calibration', duration: '2 hours' },
  ];

  // Stage Turnaround Times (TAT Breakdown)
  const tatBreakdown = [
    { stage: 'Waiting Queue', duration: '18 min', target: '15 min', status: 'WARNING' },
    { stage: 'AI Diagnosis', duration: '12 min', target: '15 min', status: 'OPTIMAL' },
    { stage: 'Technician Execution', duration: '74 min', target: '90 min', status: 'OPTIMAL' },
    { stage: 'Quality Control Check', duration: '18 min', target: '20 min', status: 'OPTIMAL' },
    { stage: 'Customer Delivery & Handover', duration: '16 min', target: '15 min', status: 'OPTIMAL' },
  ];

  // Mock Tickets for Stage Filter Drill-Downs
  const mockJobsByStage: Record<string, any[]> = {
    new: [
      { id: 'BK-2026-009', vehicle: 'Ather 450S', customer: 'Anand R', issue: 'Range Drop Warning', time: '5 mins ago' },
      { id: 'BK-2026-010', vehicle: 'Ola S1 Air', customer: 'Kavita M', issue: 'Brake Noise', time: '12 mins ago' },
    ],
    waiting: [
      { id: 'BK-2026-003', vehicle: 'TVS iQube ST', customer: 'Suresh V', issue: 'Throttle Lag', time: '18 mins ago' },
      { id: 'BK-2026-007', vehicle: 'Hero Vida V1', customer: 'Deepak K', issue: 'Charger Sync Error', time: '25 mins ago' },
      { id: 'BK-2026-008', vehicle: 'Ather 450X Apex', customer: 'Meera S', issue: 'Tire Pressure Sensor Fault', time: '32 mins ago' },
    ],
    assigned: [
      { id: 'BK-2026-002', vehicle: 'Ola S1 Pro Gen 2', customer: 'Rohan P', tech: 'Suresh Kumar', issue: 'Roadside Battery Stall' },
      { id: 'BK-2026-004', vehicle: 'Hero Electric', customer: 'Lakshmi G', tech: 'Manoj Kumar', issue: 'General Periodic Maintenance' },
    ],
    in_service: [
      { id: 'BK-2026-001', vehicle: 'Ather 450X Apex', customer: 'Rahul S', tech: 'Rahul Sharma', issue: 'BMS Thermal Spike' },
      { id: 'BK-2026-005', vehicle: 'TVS iQube', customer: 'Venkat R', tech: 'Priya Singh', issue: 'Doorstep Battery Replacement' },
    ],
    qc: [
      { id: 'BK-2026-006', vehicle: 'Ola S1 Pro', customer: 'Gautam N', tech: 'Priya Singh', issue: 'Final Quality Check' },
    ],
    completed: [
      { id: 'BK-2026-000', vehicle: 'Ather 450X', customer: 'Kiran B', tech: 'Rahul Sharma', issue: 'Completed Routine Check' },
    ],
  };

  const handleStageClick = (stageId: string, stageName: string) => {
    const jobs = mockJobsByStage[stageId] || [];
    setActiveDrillDown({
      title: `${stageName} Service Jobs`,
      subtitle: `Viewing all ${jobs.length} jobs currently in ${stageName} stage`,
      items: jobs,
      type: 'jobs',
    });
  };

  const handleKpiClick = (kpi: any) => {
    let items = mockJobsByStage.waiting.concat(mockJobsByStage.in_service);
    if (kpi.filterType === 'completed') items = mockJobsByStage.completed;
    if (kpi.filterType === 'pending') items = mockJobsByStage.waiting;

    setActiveDrillDown({
      title: `${kpi.title} Breakdown`,
      subtitle: `Detailed operational log for ${kpi.title} (${kpi.value})`,
      items: items,
      type: 'jobs',
    });
  };

  return (
    <div className="space-y-6 text-left font-sans relative bg-[#F8FAFC] min-h-screen p-2 sm:p-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BANNER: KYP OPERATIONAL INTELLIGENCE DESK */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 shadow-2xs">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  KYP — Know Your Performance
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold border border-indigo-200 uppercase">
                  Service Center Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-0.5">
                Understand the operational performance of your service center and all activities happening under your control.
              </p>
            </div>
          </div>

          {/* Time Range Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl shrink-0 text-xs font-bold">
            {(['TODAY', '7 DAYS', '30 DAYS', 'CUSTOM'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => {
                  setTimeFilter(tf);
                  showToast(`Updated KYP Metrics for ${tf}`);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  timeFilter === tf
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 1: OPERATIONAL OVERVIEW KPIs (6 CARDS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            onClick={() => handleKpiClick(kpi)}
            className="p-4 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-2xs transition-all cursor-pointer space-y-1.5 text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{kpi.title}</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </div>
            <p className={`text-2xl font-black ${kpi.color} tracking-tight`}>{kpi.value}</p>
            <span className="text-[10px] font-bold text-slate-500 block">{kpi.change}</span>
          </div>
        ))}
      </div>

      {/* SECTION 2: SERVICE ACTIVITY PIPELINE (INTERACTIVE STAGE FLOW) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Activity className="h-5 w-5" />
            <h2 className="text-sm font-extrabold text-slate-900">Service Activity Pipeline Flow</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Click any stage to filter active jobs</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {pipelineStages.map((st) => (
            <div
              key={st.id}
              onClick={() => handleStageClick(st.id, st.name)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 text-left hover:scale-[1.02] ${st.bgSoft} group shadow-2xs`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider ${st.textColor}`}>{st.name}</span>
                <span className="text-[10px] font-bold text-slate-400">{st.percent}</span>
              </div>

              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-slate-900">{st.count}</p>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-900 transition-transform group-hover:translate-x-1" />
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full ${st.color}`} style={{ width: st.percent }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: SERVICE JOB TREND & VOLUME GRAPH */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-purple-600">
            <TrendingUp className="h-5 w-5" />
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Jobs Received vs Completed Trend</h2>
              <p className="text-xs text-slate-500 font-medium">Visual throughput tracking for {timeFilter}</p>
            </div>
          </div>

          {/* Metric Toggle Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setTrendToggles({ ...trendToggles, received: !trendToggles.received })}
              className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                trendToggles.received ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 text-slate-400'
              }`}
            >
              ● Received (32)
            </button>

            <button
              onClick={() => setTrendToggles({ ...trendToggles, completed: !trendToggles.completed })}
              className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                trendToggles.completed ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 text-slate-400'
              }`}
            >
              ● Completed (18)
            </button>

            <button
              onClick={() => setTrendToggles({ ...trendToggles, pending: !trendToggles.pending })}
              className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                trendToggles.pending ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-slate-50 text-slate-400'
              }`}
            >
              ● Pending (6)
            </button>

            <button
              onClick={() => setTrendToggles({ ...trendToggles, delayed: !trendToggles.delayed })}
              className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                trendToggles.delayed ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-slate-50 text-slate-400'
              }`}
            >
              ● Delayed (2)
            </button>
          </div>
        </div>

        {/* Visual Bar Chart Comparison */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 items-end h-40 pt-4 px-2 border-b border-slate-200">
            {[
              { label: '08:00 AM', r: 4, c: 2, p: 2, d: 0 },
              { label: '10:00 AM', r: 7, c: 4, p: 3, d: 0 },
              { label: '12:00 PM', r: 8, c: 5, p: 3, d: 1 },
              { label: '02:00 PM', r: 6, c: 4, p: 2, d: 0 },
              { label: '04:00 PM', r: 5, c: 3, p: 2, d: 1 },
              { label: '06:00 PM', r: 2, c: 0, p: 2, d: 0 },
            ].map((slot, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
                <div className="flex items-end gap-1 h-full w-full justify-center">
                  {trendToggles.received && (
                    <div className="w-2.5 bg-blue-500 rounded-t-sm transition-all group-hover:bg-blue-600" style={{ height: `${slot.r * 12}%` }} title={`Received: ${slot.r}`} />
                  )}
                  {trendToggles.completed && (
                    <div className="w-2.5 bg-emerald-500 rounded-t-sm transition-all group-hover:bg-emerald-600" style={{ height: `${slot.c * 12}%` }} title={`Completed: ${slot.c}`} />
                  )}
                  {trendToggles.pending && (
                    <div className="w-2.5 bg-amber-500 rounded-t-sm transition-all group-hover:bg-amber-600" style={{ height: `${slot.p * 12}%` }} title={`Pending: ${slot.p}`} />
                  )}
                </div>
                <span className="text-[9px] font-bold text-slate-400">{slot.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-2">
            <span>Morning Shift Peak: 12:00 PM (8 Jobs Received)</span>
            <span className="text-emerald-700 font-extrabold">Overall Throughput Rate: 75%</span>
          </div>
        </div>
      </div>

      {/* SECTION 4: TECHNICIAN ACTIVITY & UTILIZATION GRAPH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Technician Operational Roster */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600">
              <Users className="h-5 w-5" />
              <h2 className="text-sm font-extrabold text-slate-900">Technician Activity & Workload</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">4 Active Specialists</span>
          </div>

          <div className="space-y-2.5">
            {technicians.map((tech) => (
              <div
                key={tech.id}
                onClick={() =>
                  setActiveDrillDown({
                    title: `Technician Workload — ${tech.name}`,
                    subtitle: `Current Status: ${tech.status} • Active Jobs: ${tech.activeJobs} • Utilization: ${tech.utilization}%`,
                    items: [
                      { label: 'Current Job', val: tech.currentJob },
                      { label: 'Completed Today', val: `${tech.completed} Jobs` },
                      { label: 'Average Turnaround', val: tech.avgTat },
                      { label: 'Delayed Tickets', val: `${tech.delayed} Jobs` },
                    ],
                    type: 'techs',
                  })
                }
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {tech.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900">{tech.name}</h3>
                    <p className="text-[10px] text-slate-500 font-medium truncate max-w-[180px]">{tech.currentJob}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                    tech.status === 'WORKING' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {tech.status}
                  </span>

                  <div className="text-right">
                    <p className="font-black text-slate-900 text-xs">{tech.utilization}%</p>
                    <p className="text-[9px] text-slate-400 font-bold">{tech.activeJobs} Active</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Technician Utilization Bar Graph */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-600">
              <Layers className="h-5 w-5" />
              <h2 className="text-sm font-extrabold text-slate-900">Capacity & Utilization Comparison</h2>
            </div>
            <span className="text-xs text-slate-400 font-bold">Target: 80-90%</span>
          </div>

          <div className="space-y-4 pt-2">
            {technicians.map((t) => (
              <div key={t.id} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-800">{t.name}</span>
                  <span className="text-slate-900">{t.utilization}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      t.utilization > 90 ? 'bg-rose-500' : t.utilization > 75 ? 'bg-teal-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${t.utilization}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-[11px] text-teal-900 font-semibold">
            ⚡ 3 technicians operating near capacity limit (&gt;85%). AI Dispatcher balancing incoming job assignments.
          </div>
        </div>
      </div>

      {/* SECTION 5: SERVICE BAY UTILIZATION & TAT BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Service Bay Utilization Grid */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-600">
              <Building className="h-5 w-5" />
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Service Bay Utilization</h2>
                <p className="text-xs text-slate-400 font-medium">12 Total Bays • 9 Occupied • 3 Available</p>
              </div>
            </div>
            <span className="text-sm font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              75% Utilized
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {serviceBays.map((bay) => (
              <div
                key={bay.id}
                onClick={() =>
                  setActiveDrillDown({
                    title: `Service Bay Details — ${bay.name}`,
                    subtitle: `Status: ${bay.status} • Occupied Duration: ${bay.duration}`,
                    items: [
                      { label: 'Vehicle Model', val: bay.vehicle },
                      { label: 'Assigned Tech', val: bay.tech },
                      { label: 'Current Activity', val: bay.job },
                      { label: 'Occupied Time', val: bay.duration },
                    ],
                    type: 'bays',
                  })
                }
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all hover:scale-105 shadow-2xs space-y-1 ${
                  bay.status === 'OCCUPIED'
                    ? 'bg-blue-50/80 border-blue-200'
                    : bay.status === 'AVAILABLE'
                    ? 'bg-emerald-50/80 border-emerald-200'
                    : 'bg-amber-50/80 border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-black uppercase">
                  <span className="text-slate-900">{bay.id}</span>
                  <span className={bay.status === 'OCCUPIED' ? 'text-blue-700' : 'text-emerald-700'}>
                    {bay.status}
                  </span>
                </div>
                <p className="text-xs font-extrabold text-slate-900 truncate">{bay.vehicle}</p>
                <p className="text-[9px] text-slate-500 font-bold">{bay.tech}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Service Turnaround Time Breakdown */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-600">
              <Clock className="h-5 w-5" />
              <h2 className="text-sm font-extrabold text-slate-900">Service Turnaround Breakdown (TAT)</h2>
            </div>
            <span className="text-xs text-slate-400 font-bold">Total Avg: 2h 18m</span>
          </div>

          <div className="space-y-3">
            {tatBreakdown.map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-extrabold text-slate-900 block">{item.stage}</span>
                  <span className="text-[10px] text-slate-400 font-medium">SLA Target: {item.target}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900">{item.duration}</span>
                  <span className={`h-2 w-2 rounded-full ${item.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 6: SLA PERFORMANCE & QUALITY CONTROL INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: SLA Performance */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="text-sm font-extrabold text-slate-900">SLA Performance Tracking</h2>
            </div>
            <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              87% On-Time
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div
              onClick={() => handleKpiClick({ title: 'ON TIME JOBS', value: '21', filterType: 'ontime' })}
              className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 cursor-pointer hover:scale-105 transition-transform"
            >
              <p className="text-[10px] font-black text-emerald-800 uppercase">ON TIME</p>
              <p className="text-2xl font-black text-emerald-950 mt-1">87%</p>
              <span className="text-[9px] font-bold text-emerald-700">21 Jobs</span>
            </div>

            <div
              onClick={() =>
                setActiveDrillDown({
                  title: 'SLA At Risk Jobs',
                  subtitle: 'Service jobs with less than 30 mins remaining SLA turnaround',
                  items: [
                    { id: 'BK-2026-002', vehicle: 'Ola S1 Pro', tech: 'Suresh Kumar', slaLeft: '12 mins left' },
                    { id: 'BK-2026-004', vehicle: 'Hero Electric', tech: 'Manoj Kumar', slaLeft: '24 mins left' },
                  ],
                  type: 'jobs',
                })
              }
              className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 cursor-pointer hover:scale-105 transition-transform"
            >
              <p className="text-[10px] font-black text-amber-800 uppercase">AT RISK</p>
              <p className="text-2xl font-black text-amber-950 mt-1">4</p>
              <span className="text-[9px] font-bold text-amber-700">&lt; 30m Left</span>
            </div>

            <div
              onClick={() =>
                setActiveDrillDown({
                  title: 'Overdue SLA Breached Jobs',
                  subtitle: 'Service jobs that exceeded target turnaround threshold',
                  items: [
                    { id: 'BK-2026-003', vehicle: 'TVS iQube ST', tech: 'Unassigned', overdueBy: '35 mins overdue' },
                  ],
                  type: 'jobs',
                })
              }
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 cursor-pointer hover:scale-105 transition-transform"
            >
              <p className="text-[10px] font-black text-rose-800 uppercase">OVERDUE</p>
              <p className="text-2xl font-black text-rose-950 mt-1">2</p>
              <span className="text-[9px] font-bold text-rose-700">Action Required</span>
            </div>
          </div>
        </div>

        {/* Right: Quality Performance (Connected to QC Module) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-600">
              <CheckCircle2 className="h-5 w-5" />
              <h2 className="text-sm font-extrabold text-slate-900">Quality Control Intelligence</h2>
            </div>
            <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              QC Pass: 98.2%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] font-black text-slate-400 uppercase block">QC PASS RATE</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">98.2%</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] font-black text-slate-400 uppercase block">FIRST PASS</span>
              <p className="text-xl font-black text-emerald-600 mt-0.5">94.6%</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] font-black text-slate-400 uppercase block">REWORK RATE</span>
              <p className="text-xl font-black text-amber-600 mt-0.5">5.4%</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] font-black text-slate-400 uppercase block">CRITICAL FAILS</span>
              <p className="text-xl font-black text-rose-600 mt-0.5">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7: PARTS IMPACT & CUSTOMER WAITING ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Parts & Inventory Impact */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-600">
              <Database className="h-5 w-5" />
              <h2 className="text-sm font-extrabold text-slate-900">Parts & Inventory Operational Impact</h2>
            </div>
            <span className="text-xs font-bold text-slate-400">Connected to Central Depot</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div
              onClick={() =>
                setActiveDrillDown({
                  title: 'Jobs Blocked by Spare Parts Availability',
                  subtitle: '3 Service tickets currently waiting for depot parts dispatch',
                  items: [
                    { id: 'BK-2026-002', vehicle: 'Ola S1 Pro', part: 'Motor Controller (72V)', delay: '42 mins delay' },
                    { id: 'BK-2026-005', vehicle: 'TVS iQube', part: 'Battery Connector Cable', delay: '25 mins delay' },
                  ],
                  type: 'parts',
                })
              }
              className="p-3 rounded-2xl bg-amber-50 border border-amber-200 cursor-pointer hover:scale-105 transition-transform"
            >
              <span className="text-[9px] font-black text-amber-800 uppercase block">BLOCKED JOBS</span>
              <p className="text-xl font-black text-amber-950 mt-0.5">3 Jobs</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] font-black text-slate-400 uppercase block">AVG PARTS DELAY</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">42 min</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] font-black text-slate-400 uppercase block">LOW STOCK ITEMS</span>
              <p className="text-xl font-black text-amber-600 mt-0.5">2</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] font-black text-slate-400 uppercase block">OUT OF STOCK</span>
              <p className="text-xl font-black text-rose-600 mt-0.5">1</p>
            </div>
          </div>
        </div>

        {/* Right: Customer Waiting Analytics */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sky-600">
              <Inbox className="h-5 w-5" />
              <h2 className="text-sm font-extrabold text-slate-900">Customer Waiting Analytics</h2>
            </div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
              4 Waiting Now
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] font-black text-slate-400 uppercase block">CURRENT WAITING</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">4</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] font-black text-slate-400 uppercase block">AVG WAIT TIME</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">18 min</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] font-black text-slate-400 uppercase block">LONGEST WAIT</span>
              <p className="text-xl font-black text-rose-600 mt-0.5">42 min</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[9px] font-black text-slate-400 uppercase block">ROADSIDE REQS</span>
              <p className="text-xl font-black text-indigo-600 mt-0.5">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 8: OPERATIONAL BOTTLENECK INTELLIGENCE */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-rose-600">
          <AlertCircle className="h-5 w-5" />
          <h2 className="text-sm font-extrabold text-slate-900">Identified Operational Bottlenecks</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider">BOTTLENECK: CAPACITY</span>
              <span className="text-[9px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">HIGH LOAD</span>
            </div>
            <h3 className="text-xs font-black text-amber-950">Technician Capacity Constraint</h3>
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              3 technicians (Rahul, Priya, Manoj) are operating above 85% utilization limits during peak shift.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider">BOTTLENECK: PARTS</span>
              <span className="text-[9px] font-extrabold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">STOCK BLOCK</span>
            </div>
            <h3 className="text-xs font-black text-rose-950">Motor Controller Availability</h3>
            <p className="text-xs text-rose-900 font-medium leading-relaxed">
              3 active service jobs are currently delayed waiting for Motor Controller (72V) stock dispatch.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-purple-800 uppercase tracking-wider">BOTTLENECK: QUEUE</span>
              <span className="text-[9px] font-extrabold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">QC QUEUE</span>
            </div>
            <h3 className="text-xs font-black text-purple-950">Quality Control Peak Inspection</h3>
            <p className="text-xs text-purple-900 font-medium leading-relaxed">
              QC inspection queue increased by 18% during afternoon shift; automated AI validation active.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 9: DATA-DRIVEN OPERATIONAL INSIGHTS */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3 text-left">
        <div className="flex items-center gap-2 text-indigo-600">
          <Zap className="h-5 w-5" />
          <h2 className="text-sm font-extrabold text-slate-900">Data-Driven Operational Insights</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Service volume increased 14% this week with 96.4% revenue collection.</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Average turnaround time improved by 9 minutes vs target SLA.</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Brake-related recalibration is the most common Quality Control rework item.</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Technician utilization reaches peak efficiency between 2 PM and 5 PM.</span>
          </div>
        </div>
      </div>

      {/* DRILL-DOWN MODAL */}
      {activeDrillDown && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 text-left max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">{activeDrillDown.title}</h3>
                <p className="text-xs text-slate-500 font-medium">{activeDrillDown.subtitle}</p>
              </div>
              <button onClick={() => setActiveDrillDown(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {activeDrillDown.items.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-semibold">
                  <div>
                    <span className="font-black text-slate-900 block">{item.id || item.label || item.name}</span>
                    <span className="text-[11px] text-slate-500">{item.vehicle || item.val || item.customer || item.issue}</span>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                    {item.tech || item.time || item.status || item.delay || item.slaLeft || 'Active'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveDrillDown(null)}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-700 cursor-pointer"
              >
                Close Operational View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
