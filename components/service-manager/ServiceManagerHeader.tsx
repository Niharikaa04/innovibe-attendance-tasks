'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Sparkles,
  MapPin,
  Plus,
  UserPlus,
  Calendar,
  Truck,
  Database,
  Radio,
  Clock,
  ChevronDown,
  Layers,
} from 'lucide-react';

interface ServiceManagerHeaderProps {
  currentCenter: string;
  onCenterChange: (center: string) => void;
  onOpenQuickAction: (action: string) => void;
}

export function ServiceManagerHeader({
  currentCenter,
  onCenterChange,
  onOpenQuickAction,
}: ServiceManagerHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const centers = [
    'Vizag Service Center',
    'Kakinada Service Hub',
    'Bengaluru Service Hub',
    'Hyderabad Service Hub',
    'All Hubs',
  ];

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-5 lg:p-6 shadow-xs relative overflow-hidden text-left">
      {/* Background Decorative Element */}
      <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        {/* Left Info */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              Service Center Operational
            </span>

            {/* Service Center Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>{currentCenter}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 text-xs font-semibold text-slate-700">
                  {centers.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        onCenterChange(c);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between ${
                        currentCenter === c ? 'bg-blue-50/80 text-blue-700 font-extrabold' : ''
                      }`}
                    >
                      <span>{c}</span>
                      {currentCenter === c && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              Shift: Morning (08:00 - 16:00 IST)
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Service Operations Command Center
          </h1>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Monitor service activity, diagnose vehicle issues, dispatch technicians, and keep every job moving seamlessly.
          </p>
        </div>

        {/* Right Status Pill & AI Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          {/* Quick Metrics Bar */}
          <div className="bg-white/90 backdrop-blur-xs border border-slate-200/90 rounded-2xl p-3 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="px-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Jobs</p>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">12</p>
            </div>
            <div className="px-2 border-l border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Waiting</p>
              <p className="text-sm font-extrabold text-amber-600 mt-0.5">4</p>
            </div>
            <div className="px-2 border-l border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Techs Active</p>
              <p className="text-sm font-extrabold text-emerald-600 mt-0.5">8 / 10</p>
            </div>
            <div className="px-2 border-l border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Bays Free</p>
              <p className="text-sm font-extrabold text-indigo-600 mt-0.5">3 / 12</p>
            </div>
          </div>

          {/* AI Advisor Badge */}
          <div className="px-3.5 py-2.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-extrabold flex items-center gap-2 shadow-2xs">
            <Sparkles className="h-4 w-4 text-purple-600 animate-spin-slow" />
            <div className="text-left">
              <p className="text-[9px] text-purple-700 uppercase tracking-wider font-extrabold">AI ADVISOR</p>
              <p className="text-xs text-purple-950 font-black flex items-center gap-1">
                ● ONLINE <span className="text-[9px] font-normal text-purple-600">(v2.4 Ready)</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Toolbar */}
      <div className="mt-4 pt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">⚡ Quick Actions:</span>
          
          <button
            type="button"
            onClick={() => onOpenQuickAction('new-ticket')}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Ticket</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenQuickAction('assign-tech')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <UserPlus className="h-3.5 w-3.5 text-indigo-600" />
            <span>Dispatch Tech</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenQuickAction('create-appointment')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <Calendar className="h-3.5 w-3.5 text-amber-600" />
            <span>Appointment</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenQuickAction('parts-request')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <Database className="h-3.5 w-3.5 text-purple-600" />
            <span>Parts Request</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Radio className="h-3.5 w-3.5 text-emerald-500 animate-ping" />
          <span>Real-time Telemetry Sync Active</span>
        </div>
      </div>
    </div>
  );
}
