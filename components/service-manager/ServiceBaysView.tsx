'use client';

import React, { useState } from 'react';
import {
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Plus,
  RefreshCw,
  Search,
  Building,
  Sliders,
  X,
  Activity,
  Zap,
} from 'lucide-react';

export function ServiceBaysView() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [bayFilter, setBayFilter] = useState<'ALL' | 'OCCUPIED' | 'AVAILABLE' | 'MAINTENANCE'>('ALL');
  const [selectedBay, setSelectedBay] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const allBays = [
    { id: 'BAY-01', name: 'Bay 01 (HV Power Specialist)', status: 'OCCUPIED', vehicle: 'Ather 450X Apex (AP39AB1234)', tech: 'Rahul Sharma', job: 'High Voltage BMS Diagnostics', occupiedTime: '45 mins', powerStatus: 'Active 72V Line', temp: '34°C' },
    { id: 'BAY-02', name: 'Bay 02 (General Maintenance)', status: 'OCCUPIED', vehicle: 'Ola S1 Pro Gen 2 (AP39CD5678)', tech: 'Manoj Kumar', job: 'Periodic Maintenance & Brake Flush', occupiedTime: '30 mins', powerStatus: 'Normal 230V', temp: '31°C' },
    { id: 'BAY-03', name: 'Bay 03 (Express Bay)', status: 'AVAILABLE', vehicle: 'None', tech: 'Unassigned', job: 'Ready for Next Incoming Vehicle', occupiedTime: '0 mins', powerStatus: 'Standby', temp: '29°C' },
    { id: 'BAY-04', name: 'Bay 04 (QC & Audit Gate)', status: 'OCCUPIED', vehicle: 'TVS iQube ST (AP39EF9012)', tech: 'Priya Singh', job: 'Final Quality Check & Road Audit', occupiedTime: '15 mins', powerStatus: 'Active 48V Line', temp: '32°C' },
    { id: 'BAY-05', name: 'Bay 05 (Washing & Sanitation)', status: 'MAINTENANCE', vehicle: 'Facility Wash Station', tech: 'Depot Team', job: 'High-Pressure Hose Calibration', occupiedTime: '1 hour', powerStatus: 'Off', temp: '28°C' },
    { id: 'BAY-06', name: 'Bay 06 (Hydraulic Hoist Heavy)', status: 'MAINTENANCE', vehicle: 'Lift Hoist Unit 2', tech: 'Maintenance Eng.', job: 'Hydraulic Cylinder Inspection', occupiedTime: '2 hours', powerStatus: 'Locked Out', temp: '30°C' },
    { id: 'BAY-07', name: 'Bay 07 (Fast Service)', status: 'AVAILABLE', vehicle: 'None', tech: 'Unassigned', job: 'Ready for Next Incoming Vehicle', occupiedTime: '0 mins', powerStatus: 'Standby', temp: '29°C' },
    { id: 'BAY-08', name: 'Bay 08 (Motor Tuning)', status: 'OCCUPIED', vehicle: 'Hero Vida V1 (AP39GH3456)', tech: 'Suresh Kumar', job: 'Regen Braking Firmware Tune', occupiedTime: '55 mins', powerStatus: 'Active 72V Line', temp: '36°C' },
    { id: 'BAY-09', name: 'Bay 09 (Doorstep Prep)', status: 'AVAILABLE', vehicle: 'None', tech: 'Unassigned', job: 'Ready for Mobile Van Charging', occupiedTime: '0 mins', powerStatus: 'Standby', temp: '28°C' },
    { id: 'BAY-10', name: 'Bay 10 (Wheel Alignment)', status: 'OCCUPIED', vehicle: 'Ather 450S (AP39IJ7890)', tech: 'Rahul Sharma', job: 'Front Fork & Axle Realignment', occupiedTime: '20 mins', powerStatus: 'Active Line', temp: '33°C' },
    { id: 'BAY-11', name: 'Bay 11 (Battery Swap)', status: 'OCCUPIED', vehicle: 'Ola S1 Air (AP39KL1234)', tech: 'Manoj Kumar', job: 'Battery Pack Swap Protocol', occupiedTime: '10 mins', powerStatus: 'Active 72V Line', temp: '35°C' },
    { id: 'BAY-12', name: 'Bay 12 (Emergency Bay)', status: 'AVAILABLE', vehicle: 'None', tech: 'Unassigned', job: 'Reserved for Roadside Assistance', occupiedTime: '0 mins', powerStatus: 'Standby', temp: '29°C' },
  ];

  const filteredBays = allBays.filter((b) => bayFilter === 'ALL' || b.status === bayFilter);

  return (
    <div className="space-y-6 text-left font-sans relative bg-[#F8FAFC] min-h-screen p-2 sm:p-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 shadow-2xs">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Service Bay Control Center
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold border border-purple-200 uppercase">
                  12 Physical Bays Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-0.5">
                Monitor real-time bay occupancy, hoist status, high-voltage line safety, and throughput capacity.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-black text-xs">
              6 Occupied (50%)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-xs">
              4 Available
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-black text-xs">
              2 Maintenance
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl shrink-0">
            {(['ALL', 'OCCUPIED', 'AVAILABLE', 'MAINTENANCE'] as const).map((bf) => (
              <button
                key={bf}
                type="button"
                onClick={() => setBayFilter(bf)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  bayFilter === bf
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {bf}
              </button>
            ))}
          </div>

          <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">
            Telemetry Refresh Rate: <span className="font-extrabold text-slate-700">Real-Time WebSocket Sync</span>
          </span>
        </div>
      </div>

      {/* 12 BAYS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBays.map((bay) => (
          <div
            key={bay.id}
            onClick={() => setSelectedBay(bay)}
            className={`p-4 rounded-3xl border text-left cursor-pointer transition-all hover:scale-[1.02] shadow-2xs space-y-3 flex flex-col justify-between ${
              bay.status === 'OCCUPIED'
                ? 'bg-white border-blue-200 hover:border-blue-400 hover:shadow-md'
                : bay.status === 'AVAILABLE'
                ? 'bg-white border-emerald-200 hover:border-emerald-400 hover:shadow-md'
                : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  {bay.id}
                </span>
                <span
                  className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                    bay.status === 'OCCUPIED'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : bay.status === 'AVAILABLE'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  ● {bay.status}
                </span>
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-xs leading-tight">{bay.name}</h3>
                <p className="text-[11px] font-extrabold text-indigo-700 pt-0.5 truncate">{bay.vehicle}</p>
                <p className="text-[10px] text-slate-500 font-medium pt-0.5">{bay.job}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>Tech: <span className="text-slate-800 font-extrabold">{bay.tech}</span></span>
              <span>Time: <span className="text-slate-800 font-extrabold">{bay.occupiedTime}</span></span>
            </div>
          </div>
        ))}
      </div>

      {/* BAY DETAILS MODAL */}
      {selectedBay && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-purple-600">
                <Layers className="h-5 w-5" />
                <h3 className="text-base font-black text-slate-900">{selectedBay.name} — Bay Control</h3>
              </div>
              <button onClick={() => setSelectedBay(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                <span className="text-[10px] font-black text-purple-800 uppercase block">STATUS & OCCUPANCY</span>
                <p className="font-extrabold text-slate-900 text-sm">{selectedBay.status} • Occupied {selectedBay.occupiedTime}</p>
                <p className="text-[10px] text-slate-500 font-medium">Power Line: {selectedBay.powerStatus} • Ambient Temp: {selectedBay.temp}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">ASSIGNED VEHICLE</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedBay.vehicle}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">ASSIGNED TECHNICIAN</span>
                  <p className="font-bold text-indigo-700 mt-0.5">{selectedBay.tech}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase block">CURRENT JOB ACTIVITY</span>
                <p className="font-bold text-slate-900">{selectedBay.job}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedBay(null)}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-700 cursor-pointer"
              >
                Close Window
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Updated configuration for ${selectedBay.id}`);
                  setSelectedBay(null);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                Save Bay Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
