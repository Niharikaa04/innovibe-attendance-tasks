'use client';

import React from 'react';
import {
  Calendar,
  Layers,
  Clock,
  User,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export function AppointmentsAndBays() {
  const appointments = [
    { time: '09:00 AM', vehicle: 'Ather 450X (AP39AB1234)', customer: 'User 1', service: 'Battery Health Check', tech: 'Rahul Sharma', status: 'IN_SERVICE' },
    { time: '10:30 AM', vehicle: 'Ola S1 Pro (AP39CD5678)', customer: 'User 2', service: 'Periodic General Service', tech: 'Suresh Kumar', status: 'CONFIRMED' },
    { time: '11:15 AM', vehicle: 'TVS iQube (AP39EF9012)', customer: 'User 3', service: 'Brake Inspection & Caliper', tech: 'Unassigned', status: 'UNASSIGNED' },
    { time: '12:30 PM', vehicle: 'Hero Electric (AP39GH3456)', customer: 'User 4', service: 'Motor Controller Tuning', tech: 'Priya Singh', status: 'CONFIRMED' },
  ];

  const bays = [
    { id: 'BAY 01', status: 'AVAILABLE', vehicle: 'None', tech: 'Unassigned', job: 'Ready for Next Vehicle', usage: '0%' },
    { id: 'BAY 02', status: 'OCCUPIED', vehicle: 'AP39AB1234 (Ather 450X)', tech: 'Rahul Sharma', job: 'Battery Diagnostics', usage: '84%' },
    { id: 'BAY 03', status: 'OCCUPIED', vehicle: 'AP39CD5678 (Ola S1)', tech: 'Manoj Kumar', job: 'General Service', usage: '62%' },
    { id: 'BAY 04', status: 'CLEANING', vehicle: 'AP39EF9012', tech: 'Sanitation Team', job: 'Post-Service Wash', usage: '20%' },
    { id: 'BAY 05', status: 'MAINTENANCE', vehicle: 'Hydraulic Hoist Calib', tech: 'Facility Staff', job: 'Lift Calibration', usage: '0%' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-left">
      {/* Left Column: Today's Appointments */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Today's Appointments
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Scheduled customer drop-offs and doorstep service slots
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            4 Scheduled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-wider">
                <th className="pb-2.5 px-2">TIME</th>
                <th className="pb-2.5 px-2">VEHICLE & OWNER</th>
                <th className="pb-2.5 px-2">SERVICE TYPE</th>
                <th className="pb-2.5 px-2">ASSIGNED TECH</th>
                <th className="pb-2.5 px-2 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-sans">
              {appointments.map((apt, i) => (
                <tr
                  key={i}
                  className="hover:bg-blue-50/60 transition-colors cursor-pointer group"
                  onClick={() => alert(`Appointment Slot: ${apt.time} for ${apt.vehicle} (${apt.service})`)}
                >
                  <td className="py-3 px-2 font-mono font-bold text-slate-900 text-[11px] group-hover:text-blue-700">{apt.time}</td>
                  <td className="py-3 px-2">
                    <p className="font-extrabold text-slate-900 leading-tight group-hover:text-blue-800">{apt.vehicle}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{apt.customer}</p>
                  </td>
                  <td className="py-3 px-2 font-semibold text-slate-700">{apt.service}</td>
                  <td className="py-3 px-2 font-extrabold text-indigo-700">{apt.tech}</td>
                  <td className="py-3 px-2 text-right">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        apt.status === 'IN_SERVICE'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : apt.status === 'UNASSIGNED'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column: Service Bay Management */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Service Bay Management
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Live bay utilization, occupancy status, and throughput capacity
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
            75% Utilization Rate
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bays.map((bay) => (
            <div
              key={bay.id}
              onClick={() => alert(`Service Bay: ${bay.id}\nStatus: ${bay.status}\nAssigned Vehicle: ${bay.vehicle}\nTechnician: ${bay.tech}`)}
              className={`p-3.5 rounded-2xl border transition-all text-left space-y-2 cursor-pointer group hover:shadow-xs hover:-translate-y-0.5 ${
                bay.status === 'OCCUPIED'
                  ? 'bg-blue-50/50 border-blue-300 hover:border-blue-400'
                  : bay.status === 'AVAILABLE'
                  ? 'bg-emerald-50/50 border-emerald-300 hover:border-emerald-400'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-slate-900 group-hover:text-purple-700 transition-colors">{bay.id}</span>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    bay.status === 'OCCUPIED'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : bay.status === 'AVAILABLE'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  ● {bay.status}
                </span>
              </div>

              <div>
                <p className="text-xs font-extrabold text-slate-900 group-hover:text-purple-900">{bay.job}</p>
                <p className="text-[10px] text-slate-500 font-medium">{bay.vehicle} • Tech: {bay.tech}</p>
              </div>

              {bay.status === 'OCCUPIED' && (
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: bay.usage }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
