'use client';

import React, { useState } from 'react';
import { Technician } from '../../lib/types';
import {
  Users,
  CheckCircle2,
  Clock,
  Wrench,
  Star,
  Phone,
  MapPin,
  ChevronRight,
  X,
  Award,
  Zap,
} from 'lucide-react';

interface TechnicianControlCenterProps {
  technicians: Technician[];
}

export function TechnicianControlCenter({ technicians }: TechnicianControlCenterProps) {
  const [selectedTechDrawer, setSelectedTechDrawer] = useState<Technician | null>(null);

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'ON_JOB':
      case 'WORKING':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'BREAK':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4 text-left relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Technician Status & Control Center
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Live status, active workload, skill badges, and deployment control for center staff
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
          {technicians.length} Technicians Enrolled
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {technicians.map((tech) => {
          const isWorking = tech.status === 'ON_JOB' || tech.status === 'AVAILABLE';

          return (
            <div
              key={tech.id}
              onClick={() => setSelectedTechDrawer(tech)}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer space-y-3 group text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {tech.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">{tech.serviceCenter}</p>
                </div>

                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getStatusBadge(tech.status)}`}>
                  ● {tech.status}
                </span>
              </div>

              <div className="space-y-1.5 font-sans">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Active Jobs:</span>
                  <span className="font-extrabold text-slate-900">{tech.activeJobsCount} Jobs</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Monthly Fixing Rate:</span>
                  <span className="font-extrabold text-emerald-700">{tech.completedJobsMonth || 34} Fixed</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Rating:</span>
                  <span className="font-extrabold text-amber-600 flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-400" /> {tech.customerRating || 4.9}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {tech.skills.slice(0, 2).map((sk) => (
                    <span key={sk} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {sk}
                    </span>
                  ))}
                </div>

                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Technician Slide-over Drawer */}
      {selectedTechDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 space-y-5 shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{selectedTechDrawer.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedTechDrawer.serviceCenter}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTechDrawer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">CURRENT DEPLOYMENT STATUS</span>
                <p className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${selectedTechDrawer.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  {selectedTechDrawer.status}
                </p>
                <p className="text-xs text-slate-600">Phone: {selectedTechDrawer.phone}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Skills & Certifications</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTechDrawer.skills.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-800 font-extrabold text-xs border border-purple-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Performance Metrics</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Rating</span>
                    <span className="text-base font-black text-amber-600">★ {selectedTechDrawer.customerRating}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Completed Jobs</span>
                    <span className="text-base font-black text-slate-900">{selectedTechDrawer.completedJobsMonth || 34}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTechDrawer(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
