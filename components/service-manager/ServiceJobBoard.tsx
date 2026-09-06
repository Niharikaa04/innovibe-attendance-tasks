'use client';

import React, { useState } from 'react';
import { ServiceTicket } from '../../lib/types';
import {
  CheckSquare,
  Clock,
  User,
  Wrench,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ServiceJobBoardProps {
  tickets: ServiceTicket[];
  onUpdateJobStatus: (ticketId: string, newStatus: string) => void;
}

export function ServiceJobBoard({ tickets, onUpdateJobStatus }: ServiceJobBoardProps) {
  const columns = [
    { key: 'PENDING', title: 'NEW', color: 'border-blue-400 text-blue-800 bg-blue-50' },
    { key: 'TECHNICIAN_ASSIGNED', title: 'ASSIGNED', color: 'border-indigo-400 text-indigo-800 bg-indigo-50' },
    { key: 'IN_PROGRESS', title: 'IN SERVICE', color: 'border-purple-400 text-purple-800 bg-purple-50' },
    { key: 'QUALITY_CHECK', title: 'QUALITY CHECK', color: 'border-amber-400 text-amber-800 bg-amber-50' },
    { key: 'READY', title: 'READY', color: 'border-teal-400 text-teal-800 bg-teal-50' },
    { key: 'COMPLETED', title: 'COMPLETED', color: 'border-emerald-400 text-emerald-800 bg-emerald-50' },
  ];

  // Map ticket status to column keys (or fallback logic)
  const getColumnKey = (status: string) => {
    if (status === 'PENDING' || status === 'AI_DIAGNOSED') return 'PENDING';
    if (status === 'TECHNICIAN_ASSIGNED') return 'TECHNICIAN_ASSIGNED';
    if (status === 'IN_PROGRESS' || status === 'QUOTED') return 'IN_PROGRESS';
    if (status === 'QUALITY_CHECK') return 'QUALITY_CHECK';
    if (status === 'READY') return 'READY';
    if (status === 'COMPLETED') return 'COMPLETED';
    return 'PENDING';
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <CheckSquare className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Live Service Job Board
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Real-time operational Kanban lifecycle tracking from receipt to ready delivery
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
          6 Lifecycle Stages Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 min-h-[380px]">
        {columns.map((col) => {
          const colTickets = tickets.filter((t) => getColumnKey(t.status) === col.key);

          return (
            <div
              key={col.key}
              className="bg-slate-50/70 rounded-2xl p-3 border border-slate-200/70 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${col.color}`}>
                  <span>{col.title}</span>
                  <span className="h-4 w-4 rounded-full bg-white flex items-center justify-center font-bold text-[9px] shadow-2xs">
                    {colTickets.length}
                  </span>
                </div>

                <div className="mt-3 space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
                  {colTickets.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 font-medium text-[11px] border border-dashed border-slate-200 rounded-xl">
                      No jobs in {col.title}
                    </div>
                  ) : (
                    colTickets.map((tkt) => (
                      <div
                        key={tkt.id}
                        className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-2 text-left"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono font-extrabold text-blue-700">{tkt.ticketNumber}</span>
                          <span className="font-bold text-slate-400">{tkt.serviceType}</span>
                        </div>

                        <div>
                          <p className="text-xs font-extrabold text-slate-900 leading-tight">{tkt.customerName}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{tkt.vehicleModel} ({tkt.registrationNumber})</p>
                        </div>

                        <div className="text-[10px] text-slate-600 font-semibold flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-slate-400" />
                            {tkt.assignedTechnician || 'Unassigned'}
                          </span>
                          <span className="font-bold text-purple-700">{tkt.aiEstimatedTimeMins}m</span>
                        </div>

                        {/* Status Transition Control */}
                        <div className="pt-1 flex items-center justify-between">
                          {col.key !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => {
                                const nextStatus =
                                  col.key === 'PENDING'
                                    ? 'TECHNICIAN_ASSIGNED'
                                    : col.key === 'TECHNICIAN_ASSIGNED'
                                    ? 'IN_PROGRESS'
                                    : col.key === 'IN_PROGRESS'
                                    ? 'QUALITY_CHECK'
                                    : col.key === 'QUALITY_CHECK'
                                    ? 'READY'
                                    : 'COMPLETED';
                                onUpdateJobStatus(tkt.id, nextStatus);
                              }}
                              className="w-full text-center py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] transition-colors flex items-center justify-center gap-1"
                            >
                              <span>Move Next</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
