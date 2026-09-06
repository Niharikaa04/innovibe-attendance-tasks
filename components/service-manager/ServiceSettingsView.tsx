'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Clock,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Save,
  Wrench,
  Users,
  Smartphone,
  Sliders,
  Calendar,
  Building,
} from 'lucide-react';

export function ServiceSettingsView() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings State with LocalStorage Persistence
  const [slaTargetMinutes, setSlaTargetMinutes] = useState(150);
  const [autoDispatchEnabled, setAutoDispatchEnabled] = useState(true);
  const [maxJobsPerTech, setMaxJobsPerTech] = useState(5);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [whatsappAlertsEnabled, setWhatsappAlertsEnabled] = useState(true);
  const [workingHoursStart, setWorkingHoursStart] = useState('08:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('20:00');
  const [weekendOps, setWeekendOps] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('innovibe_service_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.slaTargetMinutes) setSlaTargetMinutes(parsed.slaTargetMinutes);
        if (parsed.autoDispatchEnabled !== undefined) setAutoDispatchEnabled(parsed.autoDispatchEnabled);
        if (parsed.maxJobsPerTech) setMaxJobsPerTech(parsed.maxJobsPerTech);
        if (parsed.smsAlertsEnabled !== undefined) setSmsAlertsEnabled(parsed.smsAlertsEnabled);
        if (parsed.whatsappAlertsEnabled !== undefined) setWhatsappAlertsEnabled(parsed.whatsappAlertsEnabled);
        if (parsed.workingHoursStart) setWorkingHoursStart(parsed.workingHoursStart);
        if (parsed.workingHoursEnd) setWorkingHoursEnd(parsed.workingHoursEnd);
        if (parsed.weekendOps !== undefined) setWeekendOps(parsed.weekendOps);
      } catch (e) {
        // ignore parse error
      }
    }
  }, []);

  const handleSaveSettings = () => {
    const settingsObj = {
      slaTargetMinutes,
      autoDispatchEnabled,
      maxJobsPerTech,
      smsAlertsEnabled,
      whatsappAlertsEnabled,
      workingHoursStart,
      workingHoursEnd,
      weekendOps,
    };
    localStorage.setItem('innovibe_service_settings', JSON.stringify(settingsObj));
    setToastMessage('Service Center Settings & SLA Rules saved successfully!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-5 text-left font-sans relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Service Operations & SLA Settings Desk
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Configure SLA targets, technician auto-dispatch rules, max workload limits, and automated customer notification alerts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Save className="h-4 w-4" />
            <span>Save Configurations</span>
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* SLA & Turnaround Targets */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Clock className="h-5 w-5" />
            <h2 className="text-sm font-extrabold text-slate-900">SLA Turnaround Time Thresholds</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Default Target Turnaround Time (Minutes)</label>
              <input
                type="number"
                value={slaTargetMinutes}
                onChange={(e) => setSlaTargetMinutes(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-hidden focus:border-indigo-400"
              />
              <span className="text-[10px] text-slate-400 font-medium">Currently set to {Math.floor(slaTargetMinutes / 60)}h {slaTargetMinutes % 60}m</span>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-900 font-medium">
              Overdue warning flags automatically trigger when remaining turnaround drops under 30 minutes.
            </div>
          </div>
        </div>

        {/* Technician Workload & Auto-Dispatch */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <Users className="h-5 w-5" />
            <h2 className="text-sm font-extrabold text-slate-900">Technician Dispatch Rules</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-extrabold text-slate-900 block">Automated AI Technician Dispatch</span>
                <span className="text-[10px] text-slate-500 font-medium">Auto-assign tickets based on tech proximity & skills</span>
              </div>

              <input
                type="checkbox"
                checked={autoDispatchEnabled}
                onChange={(e) => setAutoDispatchEnabled(e.target.checked)}
                className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Max Concurrent Active Jobs per Technician</label>
              <input
                type="number"
                value={maxJobsPerTech}
                onChange={(e) => setMaxJobsPerTech(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-hidden focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Customer Notification Channels */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sky-600">
            <Smartphone className="h-5 w-5" />
            <h2 className="text-sm font-extrabold text-slate-900">Customer Communication Channels</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-extrabold text-slate-900 block">Automated SMS Status Updates</span>
                <span className="text-[10px] text-slate-500 font-medium">Send SMS to customer when job status changes</span>
              </div>

              <input
                type="checkbox"
                checked={smsAlertsEnabled}
                onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                className="h-4 w-4 rounded accent-sky-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-extrabold text-slate-900 block">WhatsApp Invoice & Service Certs</span>
                <span className="text-[10px] text-slate-500 font-medium">Send QA certificates directly via WhatsApp</span>
              </div>

              <input
                type="checkbox"
                checked={whatsappAlertsEnabled}
                onChange={(e) => setWhatsappAlertsEnabled(e.target.checked)}
                className="h-4 w-4 rounded accent-sky-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours & Center Shifts */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-purple-600">
            <Building className="h-5 w-5" />
            <h2 className="text-sm font-extrabold text-slate-900">Service Center Operating Hours</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Shift Opening Time</label>
                <input
                  type="time"
                  value={workingHoursStart}
                  onChange={(e) => setWorkingHoursStart(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Shift Closing Time</label>
                <input
                  type="time"
                  value={workingHoursEnd}
                  onChange={(e) => setWorkingHoursEnd(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-extrabold text-slate-900 block">24/7 Weekend Emergency Operations</span>
                <span className="text-[10px] text-slate-500 font-medium">Enable roadside assistance dispatch on weekends</span>
              </div>

              <input
                type="checkbox"
                checked={weekendOps}
                onChange={(e) => setWeekendOps(e.target.checked)}
                className="h-4 w-4 rounded accent-purple-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
