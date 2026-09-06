'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Search,
  UserCheck,
  Zap,
  Wrench,
  ChevronRight,
  X,
  Sparkles,
  AlertCircle,
  Clock,
  RotateCcw,
  Check,
  Image as ImageIcon,
  Activity,
  History,
  TrendingUp,
  Award,
  BarChart2,
  Sliders,
} from 'lucide-react';
import { ApiGateway } from '../../lib/api-client';

export type CheckStatus = 'PASS' | 'ATTENTION' | 'FAIL' | 'N_A';

export interface QaCheckItem {
  category: 'BATTERY & BMS' | 'ELECTRICAL' | 'MECHANICAL' | 'SAFETY';
  title: string;
  status: CheckStatus;
}

export function ServiceQualityControlView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'PASSED' | 'FLAGGED'>('ALL');
  const [selectedAudit, setSelectedAudit] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'checklist' | 'telemetry' | 'evidence' | 'history'>('checklist');

  // Interactive Modals State
  const [selectedTechInsight, setSelectedTechInsight] = useState<any | null>(null);
  const [selectedAlertModal, setSelectedAlertModal] = useState<any | null>(null);
  const [kpiModal, setKpiModal] = useState<{ title: string; content: string; metrics: any[] } | null>(null);

  // Technician Quality Insights Data
  const techInsights = [
    {
      name: 'Rahul Sharma',
      completed: 24,
      firstPass: '96%',
      rework: 1,
      qcScore: 98,
      specialty: 'EV Powertrain & BMS Diagnostics',
      reworkReason: 'Minor torque bolt tightening',
      trainingStatus: 'Advanced Certified',
    },
    {
      name: 'Suresh Kumar',
      completed: 19,
      firstPass: '89%',
      rework: 2,
      qcScore: 92,
      specialty: 'Brake Systems & Hydraulics',
      reworkReason: 'Side-stand cutoff switch sensor alignment',
      trainingStatus: 'Refresher Scheduled',
    },
    {
      name: 'Manoj Kumar',
      completed: 31,
      firstPass: '97%',
      rework: 1,
      qcScore: 99,
      specialty: 'High Voltage Electronics & Wiring',
      reworkReason: 'Tail lamp connector clip replacement',
      trainingStatus: 'Lead QA Master',
    },
    {
      name: 'Priya Singh',
      completed: 15,
      firstPass: '93%',
      rework: 1,
      qcScore: 95,
      specialty: 'General Doorstep Service & Suspension',
      reworkReason: 'Tyre pressure calibration delta',
      trainingStatus: 'Standard Certified',
    },
  ];

  // Needs Attention Attention Cards
  const attentionAlerts = [
    {
      id: 'CRITICAL-01',
      title: 'EV-2048 (Ather 450X) — Battery Diagnostic Validation Failed',
      desc: 'BMS thermistor reading 68°C • Safety cutoff active',
      type: 'CRITICAL',
      color: 'bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100/80',
      vehicle: 'Ather 450X (EV-2048)',
      actionText: 'Execute Thermal Override',
      details: 'BMS Thermal Sensor 2 registered 68°C during peak load test. Automated cool-down fan protocol engaged. Recommended manual thermistor harness replacement before release gate clearance.',
    },
    {
      id: 'REWORK-02',
      title: 'BK-2026-0002 — Brake Adjustment Failed QC',
      desc: 'Brake torque below 10 Nm cutoff limit • Rework required by Suresh Kumar',
      type: 'REWORK REQUIRED',
      color: 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100/80',
      vehicle: 'Ola S1 Pro Gen 2 (BK-2026-0002)',
      actionText: 'Dispatch Rework to Suresh',
      details: 'Front caliper torque measured 8.5 Nm (Threshold: 12 Nm). Rework ticket automatically queued for Technician Suresh Kumar for recalibration.',
    },
    {
      id: 'PENDING-03',
      title: 'BK-2026-0003 — Post-Service QC Validation Pending',
      desc: 'Technician completed service 12 min ago • Ready for release gate inspection',
      type: 'PENDING QC',
      color: 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100/80',
      vehicle: 'TVS iQube ST (BK-2026-0003)',
      actionText: 'Open Review Checklist',
      auditId: 'QA-2026-103',
      details: 'Technician Priya Singh completed brake pad replacement & fluid top-up. Awaiting Manager final release gate checklist sign-off.',
    },
  ];

  const [qaAudits, setQaAudits] = useState([
    {
      id: 'QA-2026-101',
      ticketId: 'BK-2026-0001',
      vehicle: 'Ather 450X Apex (AP39AB1234)',
      technician: 'Rahul Sharma',
      serviceType: 'Service at Center',
      status: 'PASSED',
      score: '98%',
      date: 'Today, 02:15 PM',
      completionTime: 'Today, 02:00 PM',
      releaseGate: 'READY FOR DELIVERY',
      aiDiagnosis: 'BMS thermistor sensor drift & brake caliper alignment required',
      repairPerformed: 'Replaced thermistor harness & recalibrated caliper to 12 Nm',
      qcValidationNote: 'All thermal parameters & brake response within optimal thresholds',
      beforeAfter: [
        { metric: 'Battery Health (SoH)', before: '78%', after: '94%' },
        { metric: 'BMS Fault Logs', before: '3 Errors', after: '0 Errors' },
        { metric: 'Brake Response Rate', before: '74%', after: '96%' },
      ],
      history: [
        { time: '01:30 PM', event: 'Service Completed by Rahul Sharma' },
        { time: '01:45 PM', event: 'QC Audit Initialized by Service Manager' },
        { time: '02:15 PM', event: 'All Mandatory Safety Checks PASSED (100%)' },
        { time: '02:15 PM', event: 'Vehicle Status Updated to READY FOR DELIVERY' },
      ],
      checklist: [
        { category: 'BATTERY & BMS', title: 'Battery State of Health (SoH)', status: 'PASS' },
        { category: 'BATTERY & BMS', title: 'Cell Balance Voltage Delta (< 0.05V)', status: 'PASS' },
        { category: 'BATTERY & BMS', title: 'BMS CAN-Bus Telemetry Communication', status: 'PASS' },
        { category: 'BATTERY & BMS', title: 'Pack Temperature under Load (< 45°C)', status: 'PASS' },
        { category: 'BATTERY & BMS', title: 'High Voltage Connector Latching', status: 'PASS' },
        { category: 'BATTERY & BMS', title: 'HV Insulation Resistance (> 500 kΩ)', status: 'PASS' },
        { category: 'ELECTRICAL', title: 'Wiring Harness & Terminal Tightness', status: 'PASS' },
        { category: 'ELECTRICAL', title: 'Motor Controller Phase Signals', status: 'PASS' },
        { category: 'ELECTRICAL', title: 'Charging Port Lock & LED Status', status: 'PASS' },
        { category: 'ELECTRICAL', title: 'Headlight, Tail Light & Turn Indicators', status: 'PASS' },
        { category: 'ELECTRICAL', title: 'Digital Touch Dashboard Display', status: 'PASS' },
        { category: 'MECHANICAL', title: 'Front & Rear Brake Response', status: 'PASS' },
        { category: 'MECHANICAL', title: 'Telescopic Suspension Damping', status: 'PASS' },
        { category: 'MECHANICAL', title: 'Tyre Pressure (Front 30 PSI / Rear 32 PSI)', status: 'PASS' },
        { category: 'MECHANICAL', title: 'Motor Rotor Noise & Bearing Play', status: 'PASS' },
        { category: 'SAFETY', title: 'High-Voltage Isolation Safety Test', status: 'PASS' },
        { category: 'SAFETY', title: 'Emergency Side-Stand Cutoff Switch', status: 'PASS' },
        { category: 'SAFETY', title: 'Battery Enclosure Mechanical Mounting', status: 'PASS' },
      ],
    },
    {
      id: 'QA-2026-102',
      ticketId: 'BK-2026-0002',
      vehicle: 'Ola S1 Pro Gen 2 (AP39CD5678)',
      technician: 'Suresh Kumar',
      serviceType: 'Roadside Assistance',
      status: 'FLAGGED',
      score: '74%',
      date: 'Today, 01:40 PM',
      completionTime: 'Today, 01:25 PM',
      releaseGate: 'REWORK REQUIRED',
      aiDiagnosis: 'BMS cell imbalance warning & side-stand sensor failure',
      repairPerformed: 'Cleared fault codes & flashed sensor firmware',
      qcValidationNote: 'Side-stand cutoff switch failed emergency release test',
      beforeAfter: [
        { metric: 'Battery Health (SoH)', before: '82%', after: '88%' },
        { metric: 'BMS Fault Logs', before: '4 Errors', after: '1 Error' },
        { metric: 'Brake Response Rate', before: '80%', after: '82%' },
      ],
      history: [
        { time: '01:25 PM', event: 'Roadside Service Completed by Suresh Kumar' },
        { time: '01:35 PM', event: 'QC Audit Started' },
        { time: '01:40 PM', event: 'Safety Check FAILED: Side-stand cutoff switch intermittent' },
        { time: '01:40 PM', event: 'Status set to REWORK REQUIRED (Hold for Release)' },
      ],
      checklist: [
        { category: 'BATTERY & BMS', title: 'Battery State of Health (SoH)', status: 'PASS' },
        { category: 'BATTERY & BMS', title: 'Cell Balance Voltage Delta (< 0.05V)', status: 'ATTENTION' },
        { category: 'BATTERY & BMS', title: 'BMS CAN-Bus Telemetry Communication', status: 'PASS' },
        { category: 'ELECTRICAL', title: 'Wiring Harness & Terminal Tightness', status: 'PASS' },
        { category: 'MECHANICAL', title: 'Front & Rear Brake Response', status: 'PASS' },
        { category: 'SAFETY', title: 'Emergency Side-Stand Cutoff Switch', status: 'FAIL' },
        { category: 'SAFETY', title: 'High-Voltage Isolation Safety Test', status: 'PASS' },
      ],
    },
    {
      id: 'QA-2026-103',
      ticketId: 'BK-2026-0003',
      vehicle: 'TVS iQube ST (AP39EF9012)',
      technician: 'Priya Singh',
      serviceType: 'Service at Home',
      status: 'PENDING',
      score: 'Pending',
      date: 'Awaiting Audit (15m)',
      completionTime: 'Today, 02:10 PM',
      releaseGate: 'PENDING QC RELEASE',
      aiDiagnosis: 'Brake caliper adjustment & periodic maintenance check',
      repairPerformed: 'Adjusted brake pads & replaced brake fluid',
      qcValidationNote: 'Pending final safety inspection',
      beforeAfter: [
        { metric: 'Battery Health (SoH)', before: '91%', after: '91%' },
        { metric: 'BMS Fault Logs', before: '0 Errors', after: '0 Errors' },
        { metric: 'Brake Response Rate', before: '65%', after: '92%' },
      ],
      history: [
        { time: '02:10 PM', event: 'Home Service Completed by Priya Singh' },
        { time: '02:12 PM', event: 'QC Audit Queued for Manager Release Gate' },
      ],
      checklist: [
        { category: 'BATTERY & BMS', title: 'Battery State of Health (SoH)', status: 'PASS' },
        { category: 'BATTERY & BMS', title: 'Cell Balance Voltage Delta (< 0.05V)', status: 'PASS' },
        { category: 'ELECTRICAL', title: 'Wiring Harness & Terminal Tightness', status: 'PASS' },
        { category: 'MECHANICAL', title: 'Front & Rear Brake Response', status: 'PASS' },
        { category: 'SAFETY', title: 'High-Voltage Isolation Safety Test', status: 'PASS' },
      ],
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateCheckStatus = (catIndex: number, newStatus: CheckStatus) => {
    if (!selectedAudit) return;
    const updatedChecklist = [...selectedAudit.checklist];
    updatedChecklist[catIndex].status = newStatus;
    
    const passedCount = updatedChecklist.filter((c) => c.status === 'PASS').length;
    const totalValid = updatedChecklist.filter((c) => c.status !== 'N_A').length;
    const newScore = totalValid > 0 ? `${Math.round((passedCount / totalValid) * 100)}%` : '100%';

    const updatedAudit = { ...selectedAudit, checklist: updatedChecklist, score: newScore };
    setSelectedAudit(updatedAudit);
    setQaAudits((prev) => prev.map((a) => (a.id === updatedAudit.id ? updatedAudit : a)));
  };

  const handleApproveQa = async (id: string) => {
    const audit = qaAudits.find((a) => a.id === id);
    if (!audit) return;

    const hasFailures = audit.checklist.some((c: any) => c.status === 'FAIL');
    if (hasFailures) {
      alert('Cannot approve QA Certificate while safety/mandatory checks are marked FAIL! Please flag re-work.');
      return;
    }

    const updated = qaAudits.map((a) =>
      a.id === id
        ? {
            ...a,
            status: 'PASSED',
            score: '100%',
            releaseGate: 'READY FOR DELIVERY',
            history: [
              ...a.history,
              { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: 'QA Approved & Released for Delivery by Manager' },
            ],
          }
        : a
    );

    setQaAudits(updated);
    if (audit.ticketId) {
      await ApiGateway.updateJobStatus(audit.ticketId, 'READY');
    }
    setSelectedAudit(null);
    showToast(`QA Audit ${id} Approved! Vehicle status updated to READY FOR DELIVERY.`);
  };

  const handleFlagRework = async (id: string) => {
    const audit = qaAudits.find((a) => a.id === id);
    if (!audit) return;

    const updated = qaAudits.map((a) =>
      a.id === id
        ? {
            ...a,
            status: 'FLAGGED',
            releaseGate: 'REWORK REQUIRED',
            history: [
              ...a.history,
              { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: 'Flagged for Rework by Service Manager' },
            ],
          }
        : a
    );

    setQaAudits(updated);
    if (audit.ticketId) {
      await ApiGateway.updateJobStatus(audit.ticketId, 'IN_PROGRESS');
      await ApiGateway.assignTechnician(audit.technician, audit.ticketId);
    }
    setSelectedAudit(null);
    showToast(`QA Audit ${id} Flagged! Rework dispatched to ${audit.technician}.`);
  };

  const filteredAudits = qaAudits.filter((a) => {
    const matchesSearch =
      a.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || a.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-5 text-left font-sans relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Enhanced KPI Area */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Quality Control & Release Gate Command Center
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Validation of completed service jobs, safety release gate, EV battery checks, and technician rework dispatch
              </p>
            </div>
          </div>

          {/* Interactive KPI Metrics Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() =>
                setKpiModal({
                  title: 'QUALITY AUDIT PASS RATE (98.2%)',
                  content: 'Pass rate calculates total vehicle release audits passing all safety & telemetry checks on first evaluation.',
                  metrics: [
                    { label: 'Target Threshold', val: '95.0%' },
                    { label: 'Current Month Pass Rate', val: '98.2%' },
                    { label: 'Total Audits Evaluated', val: '142 Vehicles' },
                  ],
                })
              }
              className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Pass Rate: 98.2%
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('PENDING')}
              className={`px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                filterStatus === 'PENDING'
                  ? 'bg-amber-900 text-white border-amber-900'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              Pending QA: {qaAudits.filter((a) => a.status === 'PENDING').length}
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('FLAGGED')}
              className={`px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                filterStatus === 'FLAGGED'
                  ? 'bg-rose-900 text-white border-rose-900'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              Flagged: {qaAudits.filter((a) => a.status === 'FLAGGED').length}
            </button>

            <button
              type="button"
              onClick={() =>
                setKpiModal({
                  title: 'FIRST-PASS SUCCESS YIELD (94.6%)',
                  content: 'First-pass yield measures vehicles requiring ZERO rework or technician callbacks after service completion.',
                  metrics: [
                    { label: 'First-Pass Yield', val: '94.6%' },
                    { label: 'Rework Rate', val: '5.4%' },
                    { label: 'Average Re-inspection SLA', val: '18 min' },
                  ],
                })
              }
              className="px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer"
            >
              First-Pass Success: 94.6%
            </button>

            <button
              type="button"
              onClick={() =>
                setKpiModal({
                  title: 'AVERAGE QC TURNAROUND TIME (12 min)',
                  content: 'Measures time taken from technician job completion to Service Manager final release gate certificate issuance.',
                  metrics: [
                    { label: 'SLA Target', val: '15 min' },
                    { label: 'Current Average', val: '12 min' },
                    { label: 'Fastest Audit', val: '6 min' },
                  ],
                })
              }
              className="px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              Avg QC Time: 12 min
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Ticket, Vehicle, Service Type or Tech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden text-slate-900 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            {(['ALL', 'PENDING', 'PASSED', 'FLAGGED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl font-extrabold capitalize transition-colors cursor-pointer ${
                  filterStatus === st ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Quality Control Attention States Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {attentionAlerts.map((alt) => (
          <div
            key={alt.id}
            onClick={() => {
              if (alt.auditId) {
                const found = qaAudits.find((a) => a.id === alt.auditId);
                if (found) setSelectedAudit(found);
              } else {
                setSelectedAlertModal(alt);
              }
            }}
            className={`p-4 rounded-2xl border space-y-1.5 transition-all cursor-pointer shadow-2xs ${alt.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 border border-current">
                {alt.type}
              </span>
              <span className="text-[10px] font-bold font-mono underline">{alt.id} →</span>
            </div>
            <h4 className="text-xs font-extrabold leading-snug">{alt.title}</h4>
            <p className="text-[11px] font-medium opacity-90">{alt.desc}</p>
          </div>
        ))}
      </div>

      {/* Main QA Inspection Table & Technician Quality Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* QC Table (2 Columns wide) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Quality Release Gate Audit Roster
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              Showing {filteredAudits.length} Audits
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-wider">
                  <th className="pb-3 px-3">QC ID / AUDIT ID</th>
                  <th className="pb-3 px-3">VEHICLE / TICKET</th>
                  <th className="pb-3 px-3">SERVICE TECHNICIAN</th>
                  <th className="pb-3 px-3">SERVICE TYPE</th>
                  <th className="pb-3 px-3">SCORE</th>
                  <th className="pb-3 px-3">STATUS</th>
                  <th className="pb-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-sans">
                {filteredAudits.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSelectedAudit(a)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-3 font-mono font-bold text-teal-700">{a.id}</td>
                    
                    <td className="py-3.5 px-3">
                      <p className="font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors leading-tight">
                        {a.vehicle}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 font-bold">{a.ticketId}</p>
                    </td>

                    <td className="py-3.5 px-3 font-extrabold text-slate-800">{a.technician}</td>

                    {/* Fixed Service Type Badge Formatting */}
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-[10px] whitespace-nowrap inline-block">
                        {a.serviceType}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-black text-slate-900">{a.score}</td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border whitespace-nowrap inline-block ${
                          a.status === 'PASSED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : a.status === 'FLAGGED'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        ● {a.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAudit(a);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-teal-600 font-extrabold text-xs transition-colors flex items-center gap-1 ml-auto whitespace-nowrap"
                      >
                        <span>Review Checklist</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Technician Quality Performance Insights */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-purple-600" />
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Technician Quality Insights
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Operational Audit</span>
          </div>

          <div className="space-y-2.5">
            {techInsights.map((t) => (
              <div
                key={t.name}
                onClick={() => setSelectedTechInsight(t)}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-purple-50/50 hover:border-purple-300 transition-all cursor-pointer space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs group-hover:text-purple-700 transition-colors">
                    {t.name}
                  </span>
                  <span className="text-xs font-black text-emerald-600">Score: {t.qcScore}%</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-500 font-medium">
                  <div>Jobs: <strong className="text-slate-900">{t.completed}</strong></div>
                  <div>1st-Pass: <strong className="text-emerald-700">{t.firstPass}</strong></div>
                  <div>Rework: <strong className="text-rose-700">{t.rework}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL 1: Review Checklist & QC Detail Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-teal-600">
                <FileCheck className="h-5 w-5" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">QC Review & Release Gate — {selectedAudit.id}</h3>
                  <p className="text-xs font-mono text-slate-400 font-bold">{selectedAudit.vehicle} • {selectedAudit.ticketId}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAudit(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Technician</span>
                <span className="font-extrabold text-slate-900">{selectedAudit.technician}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Service Type</span>
                <span className="font-extrabold text-slate-900">{selectedAudit.serviceType}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Completion Time</span>
                <span className="font-extrabold text-slate-900">{selectedAudit.completionTime}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200">
                <span className="text-[9px] font-bold text-teal-800 uppercase block">Release Gate</span>
                <span className="font-black text-teal-950">{selectedAudit.releaseGate}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-extrabold pb-1">
              {[
                { id: 'checklist', label: 'Multi-Category Checklist' },
                { id: 'telemetry', label: 'AI Validation & Metrics' },
                { id: 'history', label: 'QC History Timeline' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    activeTab === tab.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: Extended Categorized Review Checklist */}
            {activeTab === 'checklist' && (
              <div className="space-y-4">
                {['BATTERY & BMS', 'ELECTRICAL', 'MECHANICAL', 'SAFETY'].map((catName) => {
                  const categoryItems = selectedAudit.checklist.filter((c: any) => c.category === catName);
                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={catName} className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">{catName}</h4>
                      <div className="space-y-1.5">
                        {categoryItems.map((item: any) => {
                          const globalIdx = selectedAudit.checklist.findIndex((c: any) => c.title === item.title);

                          return (
                            <div key={item.title} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-800">{item.title}</span>

                              <div className="flex items-center gap-1">
                                {(['PASS', 'ATTENTION', 'FAIL', 'N_A'] as CheckStatus[]).map((st) => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleUpdateCheckStatus(globalIdx, st)}
                                    className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold transition-colors cursor-pointer ${
                                      item.status === st
                                        ? st === 'PASS'
                                          ? 'bg-emerald-600 text-white'
                                          : st === 'ATTENTION'
                                          ? 'bg-amber-500 text-white'
                                          : st === 'FAIL'
                                          ? 'bg-rose-600 text-white'
                                          : 'bg-slate-700 text-white'
                                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {st.replace('_', '/')}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: AI Diagnosis & Telemetry */}
            {activeTab === 'telemetry' && (
              <div className="space-y-4 text-xs font-sans">
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <span>AI Diagnosis & Repair Validation</span>
                  </div>

                  <div className="space-y-1 text-slate-700">
                    <p><strong>Original AI Diagnosis:</strong> {selectedAudit.aiDiagnosis}</p>
                    <p><strong>Technician Repair Performed:</strong> {selectedAudit.repairPerformed}</p>
                    <p className="text-indigo-950 font-semibold"><strong>Post-Service QC Validation:</strong> {selectedAudit.qcValidationNote}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Before / After Service Measurements</span>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedAudit.beforeAfter.map((m: any) => (
                      <div key={m.metric} className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                        <span className="text-[9px] text-slate-400 font-bold block">{m.metric}</span>
                        <p className="text-xs font-bold text-rose-700">Before: {m.before}</p>
                        <p className="text-xs font-black text-emerald-600">After: {m.after}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: QC History Timeline */}
            {activeTab === 'history' && (
              <div className="space-y-3 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Audit History Log</span>
                <div className="space-y-2">
                  {selectedAudit.history.map((h: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono font-bold text-indigo-700">{h.time}</span>
                      <span className="font-semibold text-slate-800">{h.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Score: <strong className="text-slate-900 font-black">{selectedAudit.score}</strong>
              </span>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleFlagRework(selectedAudit.id)}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-extrabold text-xs hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Flag Re-Work & Dispatch</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveQa(selectedAudit.id)}
                  className="px-5 py-2 rounded-xl bg-teal-600 text-white font-extrabold text-xs hover:bg-teal-700 shadow-md flex items-center gap-1 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Approve QA & Release Gate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Technician Quality Scorecard Modal */}
      {selectedTechInsight && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                <h3 className="text-base font-extrabold text-slate-900">{selectedTechInsight.name} — Quality Scorecard</h3>
              </div>
              <button onClick={() => setSelectedTechInsight(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-purple-800 uppercase">Overall Quality Rating</span>
              <p className="text-3xl font-black text-purple-950">{selectedTechInsight.qcScore}%</p>
              <span className="text-[10px] font-extrabold bg-purple-200 text-purple-900 px-2.5 py-0.5 rounded-full">
                {selectedTechInsight.trainingStatus}
              </span>
            </div>

            <div className="space-y-2 text-xs font-medium text-slate-700">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500">Core Specialty:</span>
                <strong className="text-slate-900">{selectedTechInsight.specialty}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500">Completed Jobs:</span>
                <strong className="text-slate-900">{selectedTechInsight.completed} Vehicles</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500">First-Pass Yield:</span>
                <strong className="text-emerald-700">{selectedTechInsight.firstPass}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500">Primary Rework Trigger:</span>
                <strong className="text-rose-700">{selectedTechInsight.reworkReason}</strong>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTechInsight(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold cursor-pointer"
              >
                Close Scorecard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Needs Attention Alert Modal */}
      {selectedAlertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-base font-extrabold text-slate-900">{selectedAlertModal.id} — Attention Alert</h3>
              </div>
              <button onClick={() => setSelectedAlertModal(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1.5 text-xs">
              <p className="font-extrabold text-rose-950">{selectedAlertModal.vehicle}</p>
              <p className="text-rose-900 font-medium">{selectedAlertModal.details}</p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedAlertModal(null)}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-700 cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedAlertModal(null);
                  showToast(`Action Triggered: ${selectedAlertModal.actionText}`);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-extrabold shadow-md cursor-pointer"
              >
                {selectedAlertModal.actionText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: KPI Analytics Metric Breakdown Modal */}
      {kpiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-600">
                <BarChart2 className="h-5 w-5" />
                <h3 className="text-sm font-extrabold text-slate-900">{kpiModal.title}</h3>
              </div>
              <button onClick={() => setKpiModal(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">{kpiModal.content}</p>

            <div className="grid grid-cols-3 gap-2">
              {kpiModal.metrics.map((m: any) => (
                <div key={m.label} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block">{m.label}</span>
                  <p className="text-sm font-black text-slate-900">{m.val}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setKpiModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold cursor-pointer"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
