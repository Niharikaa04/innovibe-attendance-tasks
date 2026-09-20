'use client';

import React, { useState } from 'react';
import {
  Zap,
  Database,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Box,
  X,
  Activity,
  Check,
  PackageCheck,
  Flame,
  Cpu,
} from 'lucide-react';

interface EvDiagnosticsAndPartsProps {
  viewMode?: 'diagnostics' | 'parts' | 'both';
}

export function EvDiagnosticsAndParts({ viewMode = 'both' }: EvDiagnosticsAndPartsProps) {
  const [partsStock, setPartsStock] = useState([
    { name: 'Brake Pads (Front/Rear)', stock: 42, status: 'OPTIMAL', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { name: 'Battery Connector Cable', stock: 12, status: 'LOW STOCK', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { name: 'Motor Controller (72V)', stock: 5, status: 'CRITICAL', color: 'bg-rose-100 text-rose-800 border-rose-300' },
    { name: 'BMS Sensor Module B2', stock: 18, status: 'OPTIMAL', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  ]);

  const [blockedJobs, setBlockedJobs] = useState([
    { ticketId: 'BK-2026-0003', vehicle: 'iQube ST (AP39EF9012)', partNeeded: 'Motor Controller (72V)', waitingTime: '1h 12m', status: 'BLOCKED' },
    { ticketId: 'BK-2026-0004', vehicle: 'Hero Electric (AP39GH3456)', partNeeded: 'Battery Connector Cable', waitingTime: '35m', status: 'BLOCKED' },
  ]);

  // CAN-Bus Telemetry Packets
  const telemetryLogs = [
    { packetId: '0x18F00100', subsystem: 'BMS Pack A', parameter: 'Total Voltage', value: '74.2 V', status: 'NOMINAL' },
    { packetId: '0x18F00200', subsystem: 'BMS Pack A', parameter: 'Cell Temperature Delta', value: '1.4 °C', status: 'NOMINAL' },
    { packetId: '0x18F00300', subsystem: 'MCU Controller', parameter: 'MOSFET Temperature', value: '56.0 °C', status: 'WARNING' },
    { packetId: '0x18F00400', subsystem: 'Motor Drive', parameter: 'Phase A Current', value: '42.8 A', status: 'NOMINAL' },
    { packetId: '0x18F00500', subsystem: 'Charger Port', parameter: 'Isolation Resistance', value: '850 kΩ', status: 'NOMINAL' },
  ];

  // Interactive Modal States
  const [selectedTelemetry, setSelectedTelemetry] = useState<any | null>(null);
  const [coolDownModalOpen, setCoolDownModalOpen] = useState(false);
  const [selectedPartStock, setSelectedPartStock] = useState<any | null>(null);
  const [expediteModalJob, setExpediteModalJob] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExpediteConfirm = (ticketId: string) => {
    setBlockedJobs((prev) => prev.filter((bj) => bj.ticketId !== ticketId));
    setExpediteModalJob(null);
    showToast(`Successfully allocated spare part and unblocked Job ${ticketId}!`);
  };

  return (
    <div className="relative font-sans text-left space-y-5">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODE 1: DEDICATED EV DIAGNOSTICS VIEW ONLY */}
      {viewMode === 'diagnostics' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    EV Diagnostics & Subsystem CAN-Bus Stream
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Real-time CAN-bus telemetry, battery State-of-Health (SoH), motor thermals, and BMS diagnostic protocols
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                ● CAN-Bus Active (96.4% Health Score)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Subsystem Telemetry Metric Cards */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-slate-400">
                Core EV Telemetry Subsystems
              </h2>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div
                  onClick={() =>
                    setSelectedTelemetry({
                      title: 'BATTERY STATE OF HEALTH (SoH)',
                      value: '94.2%',
                      status: 'Optimal Cell Temp (32°C)',
                      details: 'Pack voltage: 74.2V • Cell Delta: 0.02V • Cycles: 142 • Isolation Resistance: 850 kΩ',
                      icon: Activity,
                      color: 'text-emerald-600',
                    })
                  }
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all cursor-pointer space-y-1 group"
                >
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 group-hover:text-emerald-700">BATTERY SOH</span>
                  <p className="text-2xl font-black text-emerald-600">94.2%</p>
                  <span className="text-[10px] font-bold text-slate-500">Optimal Cell Temp</span>
                </div>

                <div
                  onClick={() =>
                    setSelectedTelemetry({
                      title: 'MOTOR EFFICIENCY STREAM',
                      value: '98.1%',
                      status: 'Rotor Dynamic OK',
                      details: 'RPM: 4,800 • Torque Output: 26 Nm • Phase Current: 42A • Bearings Noise: Normal',
                      icon: Cpu,
                      color: 'text-blue-600',
                    })
                  }
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer space-y-1 group"
                >
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 group-hover:text-blue-700">MOTOR EFF</span>
                  <p className="text-2xl font-black text-blue-600">98.1%</p>
                  <span className="text-[10px] font-bold text-slate-500">Rotor Dynamic OK</span>
                </div>

                <div
                  onClick={() =>
                    setSelectedTelemetry({
                      title: 'BMS CONTROLLER HEALTH',
                      value: '92.0%',
                      status: 'Firmware v4.2 Active',
                      details: 'Thermal Sensor 2: Active • Overcharge Cutoff: Verified • Balancing Current: 150mA',
                      icon: Zap,
                      color: 'text-indigo-600',
                    })
                  }
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all cursor-pointer space-y-1 group"
                >
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 group-hover:text-indigo-700">BMS HEALTH</span>
                  <p className="text-2xl font-black text-indigo-600">92.0%</p>
                  <span className="text-[10px] font-bold text-slate-500">Firmware v4.2</span>
                </div>

                <div
                  onClick={() =>
                    setSelectedTelemetry({
                      title: 'MAIN CONTROLLER TEMPERATURE',
                      value: '56°C',
                      status: 'Thermal Watch Warning',
                      details: 'MOSFET Temp: 56°C • Heatsink Fan: 65% Duty Cycle • Maximum Safe Threshold: 75°C',
                      icon: Flame,
                      color: 'text-amber-600',
                    })
                  }
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-amber-50/50 hover:border-amber-300 transition-all cursor-pointer space-y-1 group"
                >
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 group-hover:text-amber-700">CONTROLLER</span>
                  <p className="text-2xl font-black text-amber-600">56°C</p>
                  <span className="text-[10px] font-bold text-amber-700">Thermal Watch</span>
                </div>
              </div>

              {/* Thermal Anomaly Banner */}
              <div
                onClick={() => setCoolDownModalOpen(true)}
                className="p-4 rounded-2xl bg-rose-50 border border-rose-200 hover:bg-rose-100/60 transition-all cursor-pointer flex items-start gap-3 text-xs group"
              >
                <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-rose-950 group-hover:text-rose-700">Battery Thermal Anomaly Detected</h4>
                    <span className="text-[10px] font-bold text-rose-700 underline">Execute Cool-Down Protocol →</span>
                  </div>
                  <p className="text-slate-600 font-medium text-[11px]">
                    Vehicle AP39EF9012 BMS temperature exceeded 68°C threshold. Automated cool-down protocol engaged.
                  </p>
                </div>
              </div>
            </div>

            {/* Live CAN-Bus Packet Stream Table */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  Live CAN-Bus Telemetry Packets <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </h2>
                <button
                  type="button"
                  onClick={() => showToast('Refreshed CAN-Bus Packet Stream!')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Refresh Packet Feed
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-wider">
                      <th className="pb-2.5 px-2">PACKET ID</th>
                      <th className="pb-2.5 px-2">SUBSYSTEM</th>
                      <th className="pb-2.5 px-2">PARAMETER</th>
                      <th className="pb-2.5 px-2">VALUE</th>
                      <th className="pb-2.5 px-2 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-sans">
                    {telemetryLogs.map((log) => (
                      <tr key={log.packetId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-2 font-mono font-bold text-indigo-700 text-[11px]">{log.packetId}</td>
                        <td className="py-3 px-2 font-extrabold text-slate-900">{log.subsystem}</td>
                        <td className="py-3 px-2 text-slate-600 font-medium">{log.parameter}</td>
                        <td className="py-3 px-2 font-mono font-bold text-slate-900">{log.value}</td>
                        <td className="py-3 px-2 text-right">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              log.status === 'NOMINAL'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: DEDICATED PARTS & INVENTORY VIEW ONLY */}
      {viewMode === 'parts' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    Parts Inventory & Depot Allocation Command Center
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Spare parts availability, job blockers, central depot stock levels, and urgent requisition dispatch
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full">
                {blockedJobs.length} Jobs Waiting on Stock
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Stock Level Cards */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-slate-400">
                Central Service Hub Inventory Levels
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {partsStock.map((p) => (
                  <div
                    key={p.name}
                    onClick={() => setSelectedPartStock(p)}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-slate-900 leading-tight group-hover:text-purple-700">{p.name}</p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${p.color}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-[10px] font-bold">Current Stock</span>
                      <span className="text-base font-black text-slate-900">{p.stock} Units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Jobs Blocked by Parts Queue */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight text-rose-700">
                  ⚠️ JOBS BLOCKED BY PARTS (MANAGER ACTION)
                </h2>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  {blockedJobs.length} Active Blockers
                </span>
              </div>

              <div className="space-y-3">
                {blockedJobs.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>All service tickets fully allocated with spare parts!</span>
                  </div>
                ) : (
                  blockedJobs.map((bj) => (
                    <div
                      key={bj.ticketId}
                      className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-rose-900">{bj.ticketId}</span>
                          <span className="font-extrabold text-slate-900">{bj.vehicle}</span>
                        </div>
                        <p className="text-[11px] text-rose-800 font-semibold mt-1">
                          Waiting for: <strong className="underline">{bj.partNeeded}</strong> ({bj.waitingTime})
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpediteModalJob(bj)}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1"
                      >
                        <span>Expedite Part</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: COMBINED OVERVIEW GRID (FOR OVERVIEW PAGE) */}
      {viewMode === 'both' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column: EV Intelligence */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    EV Diagnostics & Health Stream
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Live CAN-bus telemetry diagnostic subsystem status
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                ● 96.4% Health Score
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div
                onClick={() =>
                  setSelectedTelemetry({
                    title: 'BATTERY STATE OF HEALTH (SoH)',
                    value: '94.2%',
                    status: 'Optimal Cell Temp (32°C)',
                    details: 'Pack voltage: 74.2V • Cell Delta: 0.02V • Cycles: 142 • Isolation Resistance: 850 kΩ',
                    icon: Activity,
                    color: 'text-emerald-600',
                  })
                }
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all cursor-pointer space-y-1 group"
              >
                <span className="text-[9px] font-extrabold uppercase text-slate-400 group-hover:text-emerald-700">BATTERY SOH</span>
                <p className="text-xl font-black text-emerald-600">94.2%</p>
                <span className="text-[9px] font-bold text-slate-500">Optimal Cell Temp</span>
              </div>

              <div
                onClick={() =>
                  setSelectedTelemetry({
                    title: 'MOTOR EFFICIENCY STREAM',
                    value: '98.1%',
                    status: 'Rotor Dynamic OK',
                    details: 'RPM: 4,800 • Torque Output: 26 Nm • Phase Current: 42A • Bearings Noise: Normal',
                    icon: Cpu,
                    color: 'text-blue-600',
                  })
                }
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer space-y-1 group"
              >
                <span className="text-[9px] font-extrabold uppercase text-slate-400 group-hover:text-blue-700">MOTOR EFF</span>
                <p className="text-xl font-black text-blue-600">98.1%</p>
                <span className="text-[9px] font-bold text-slate-500">Rotor Dynamic OK</span>
              </div>

              <div
                onClick={() =>
                  setSelectedTelemetry({
                    title: 'BMS CONTROLLER HEALTH',
                    value: '92.0%',
                    status: 'Firmware v4.2 Active',
                    details: 'Thermal Sensor 2: Active • Overcharge Cutoff: Verified • Balancing Current: 150mA',
                    icon: Zap,
                    color: 'text-indigo-600',
                  })
                }
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all cursor-pointer space-y-1 group"
              >
                <span className="text-[9px] font-extrabold uppercase text-slate-400 group-hover:text-indigo-700">BMS HEALTH</span>
                <p className="text-xl font-black text-indigo-600">92.0%</p>
                <span className="text-[9px] font-bold text-slate-500">Firmware v4.2</span>
              </div>

              <div
                onClick={() =>
                  setSelectedTelemetry({
                    title: 'MAIN CONTROLLER TEMPERATURE',
                    value: '56°C',
                    status: 'Thermal Watch Warning',
                    details: 'MOSFET Temp: 56°C • Heatsink Fan: 65% Duty Cycle • Maximum Safe Threshold: 75°C',
                    icon: Flame,
                    color: 'text-amber-600',
                  })
                }
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-amber-50/50 hover:border-amber-300 transition-all cursor-pointer space-y-1 group"
              >
                <span className="text-[9px] font-extrabold uppercase text-slate-400 group-hover:text-amber-700">CONTROLLER</span>
                <p className="text-xl font-black text-amber-600">56°C</p>
                <span className="text-[9px] font-bold text-amber-700">Thermal Watch</span>
              </div>
            </div>

            <div
              onClick={() => setCoolDownModalOpen(true)}
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 hover:bg-rose-100/60 transition-all cursor-pointer flex items-start gap-3 text-xs group"
            >
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-rose-950 group-hover:text-rose-700">Battery Thermal Anomaly Detected</h4>
                  <span className="text-[10px] font-bold text-rose-700 underline">Execute Cool-Down Protocol →</span>
                </div>
                <p className="text-slate-600 font-medium text-[11px]">
                  Vehicle AP39EF9012 BMS temperature exceeded 68°C threshold. Automated cool-down protocol engaged.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Parts & Inventory Blockers */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Parts Inventory & Job Blockers
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Spare parts availability and jobs waiting on inventory allocation
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                {blockedJobs.length} Jobs Blocked
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {partsStock.map((p) => (
                <div
                  key={p.name}
                  onClick={() => setSelectedPartStock(p)}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <p className="font-extrabold text-slate-900 leading-tight group-hover:text-blue-700">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold">{p.stock} units available</p>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${p.color}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">
                ⚠️ JOBS BLOCKED BY PARTS (REQUIRES MANAGER ACTION)
              </span>

              <div className="space-y-2">
                {blockedJobs.length === 0 ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>All parts allocated! No jobs currently blocked.</span>
                  </div>
                ) : (
                  blockedJobs.map((bj) => (
                    <div
                      key={bj.ticketId}
                      className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-rose-900">{bj.ticketId}</span>
                          <span className="font-extrabold text-slate-900">{bj.vehicle}</span>
                        </div>
                        <p className="text-[11px] text-rose-800 font-semibold mt-0.5">
                          Waiting for: <strong className="underline">{bj.partNeeded}</strong> ({bj.waitingTime})
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpediteModalJob(bj)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1"
                      >
                        <span>Expedite Part</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Telemetry Diagnostics Breakdown */}
      {selectedTelemetry && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <selectedTelemetry.icon className={`h-5 w-5 ${selectedTelemetry.color}`} />
                <h3 className="text-sm font-black text-slate-900">{selectedTelemetry.title}</h3>
              </div>
              <button onClick={() => setSelectedTelemetry(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Current Sensor Output</span>
              <p className={`text-3xl font-black ${selectedTelemetry.color}`}>{selectedTelemetry.value}</p>
              <p className="text-xs font-bold text-slate-700">{selectedTelemetry.status}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-indigo-700">Telemetry Log Output</span>
              <p className="text-[11px] font-mono text-indigo-950 font-semibold">{selectedTelemetry.details}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTelemetry(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs"
              >
                Close Subsystem Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Thermal Anomaly Cool-down Protocol */}
      {coolDownModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <Flame className="h-5 w-5" />
                <h3 className="text-base font-extrabold text-slate-900">EV Thermal Anomaly Cool-Down Protocol</h3>
              </div>
              <button onClick={() => setCoolDownModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-2">
              <p className="font-extrabold text-rose-950">Target Vehicle: TVS iQube ST (AP39EF9012)</p>
              <p className="text-rose-900 font-medium">
                BMS temperature reached <strong>68°C</strong>. Thermal emergency limits active. Aux fans set to 100% duty cycle.
              </p>
            </div>

            <div className="space-y-2 text-xs font-semibold text-slate-700">
              <p>Recommended Actions:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Engage active coolant circulation pump</li>
                <li>Limit charging current to 0A until pack drops below 45°C</li>
                <li>Dispatch mobile thermal technician if temperature exceeds 72°C</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setCoolDownModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCoolDownModalOpen(false);
                  showToast('Automated Cool-Down Fan Override Triggered! Temperature dropping...');
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5"
              >
                <Zap className="h-4 w-4" />
                <span>Trigger Manual Fan Override</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Stock Item Reorder */}
      {selectedPartStock && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Box className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">{selectedPartStock.name}</h3>
              </div>
              <button onClick={() => setSelectedPartStock(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Available Central Depot Stock</span>
                <p className="text-xl font-black text-slate-900">{selectedPartStock.stock} Units</p>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${selectedPartStock.color}`}>
                {selectedPartStock.status}
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setSelectedPartStock(null)} className="px-4 py-2 rounded-xl border text-xs font-bold">
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedPartStock(null);
                  showToast(`Reorder requisition placed for 10x ${selectedPartStock.name}!`);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5"
              >
                <PackageCheck className="h-4 w-4" />
                <span>Reorder Stock (10 Units)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Expedite Part Job Allocation */}
      {expediteModalJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-rose-600" />
                <h3 className="text-sm font-black text-slate-900">Expedite Part for {expediteModalJob.ticketId}</h3>
              </div>
              <button onClick={() => setExpediteModalJob(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-1">
              <p className="font-extrabold text-slate-900">{expediteModalJob.vehicle}</p>
              <p className="text-rose-900 font-semibold">
                Required Part: <strong className="underline">{expediteModalJob.partNeeded}</strong>
              </p>
              <p className="text-[10px] text-slate-500">Waiting in queue for {expediteModalJob.waitingTime}</p>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Confirm priority allocation from reserve emergency inventory to unblock this service ticket.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setExpediteModalJob(null)} className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-700">
                Cancel
              </button>
              <button
                onClick={() => handleExpediteConfirm(expediteModalJob.ticketId)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Confirm & Allocate Part</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
