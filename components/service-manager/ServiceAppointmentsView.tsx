'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Phone,
  MapPin,
  X,
  ChevronRight,
} from 'lucide-react';

export function ServiceAppointmentsView() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'CONFIRMED' | 'IN_SERVICE' | 'UNASSIGNED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const appointmentsList = [
    { id: 'APT-101', time: '08:30 AM', vehicle: 'Ather 450X Apex (AP39AB1234)', customer: 'Rajesh K', phone: '+91 98765 11111', service: 'High Voltage BMS Thermal Check', tech: 'Rahul Sharma', status: 'IN_SERVICE', slot: 'Morning Slot 1', type: 'Depot Drop-Off' },
    { id: 'APT-102', time: '09:45 AM', vehicle: 'Ola S1 Pro Gen 2 (AP39CD5678)', customer: 'Sneha P', phone: '+91 98765 22222', service: 'Periodic General Maintenance (10,000 km)', tech: 'Suresh Kumar', status: 'CONFIRMED', slot: 'Morning Slot 2', type: 'Depot Drop-Off' },
    { id: 'APT-103', time: '11:00 AM', vehicle: 'TVS iQube ST (AP39EF9012)', customer: 'Anand V', phone: '+91 98765 33333', service: 'Brake Pad Replacement & Caliper Tuning', tech: 'Unassigned', status: 'UNASSIGNED', slot: 'Midday Slot 1', type: 'Doorstep Service' },
    { id: 'APT-104', time: '12:30 PM', vehicle: 'Hero Vida V1 Pro (AP39GH3456)', customer: 'Kiran B', phone: '+91 98765 44444', service: 'Motor Controller Firmware Flash (v3.2)', tech: 'Priya Singh', status: 'CONFIRMED', slot: 'Midday Slot 2', type: 'Depot Drop-Off' },
    { id: 'APT-105', time: '02:15 PM', vehicle: 'Ather 450S (AP39IJ7890)', customer: 'Venkat R', phone: '+91 98765 55555', service: 'Charger Sync Error Diagnostics', tech: 'Manoj Kumar', status: 'CONFIRMED', slot: 'Afternoon Slot 1', type: 'Doorstep Service' },
    { id: 'APT-106', time: '03:45 PM', vehicle: 'Ola S1 Air (AP39KL1234)', customer: 'Deepak M', phone: '+91 98765 66666', service: 'Tire Pressure Sensor Recalibration', tech: 'Unassigned', status: 'UNASSIGNED', slot: 'Afternoon Slot 2', type: 'Depot Drop-Off' },
  ];

  const filteredAppointments = appointmentsList.filter((apt) => {
    const matchesFilter = filterType === 'ALL' || apt.status === filterType;
    const matchesSearch =
      apt.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 shadow-2xs">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Appointments & Customer Schedules
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-200 uppercase">
                  6 Slots Today
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-0.5">
                Manage customer drop-off bookings, doorstep slots, technician assignments, and service time windows.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => showToast('New appointment booking modal opened')}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Book New Appointment</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search vehicle, customer, service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-hidden focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl text-xs font-bold shrink-0">
            {(['ALL', 'CONFIRMED', 'IN_SERVICE', 'UNASSIGNED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterType(st)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  filterType === st
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* APPOINTMENTS GRID / TABLE */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900">Today's Appointment Schedule ({filteredAppointments.length})</h2>
          <span className="text-xs text-slate-400 font-medium">Auto-synced with Customer App</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-wider">
                <th className="pb-3 px-3">SLOT TIME</th>
                <th className="pb-3 px-3">VEHICLE & OWNER</th>
                <th className="pb-3 px-3">SERVICE REQUEST</th>
                <th className="pb-3 px-3">TYPE</th>
                <th className="pb-3 px-3">ASSIGNED TECH</th>
                <th className="pb-3 px-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredAppointments.map((apt) => (
                <tr
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  className="hover:bg-amber-50/50 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-slate-900 block group-hover:text-amber-700">{apt.time}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{apt.slot}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-extrabold text-slate-900 group-hover:text-amber-800">{apt.vehicle}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{apt.customer} • {apt.phone}</p>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-700">{apt.service}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {apt.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-extrabold text-indigo-700">{apt.tech}</td>
                  <td className="py-3.5 px-3 text-right">
                    <span
                      className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
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

      {/* APPOINTMENT DETAILS MODAL */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-600">
                <CalendarIcon className="h-5 w-5" />
                <h3 className="text-base font-black text-slate-900">{selectedAppointment.id} — Appointment Details</h3>
              </div>
              <button onClick={() => setSelectedAppointment(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-[10px] font-black text-amber-800 uppercase block">SLOT & TIME</span>
                <p className="font-extrabold text-slate-900 text-sm">{selectedAppointment.time} ({selectedAppointment.slot})</p>
                <p className="text-[10px] text-slate-500 font-medium">Service Mode: {selectedAppointment.type}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">VEHICLE DETAILS</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedAppointment.vehicle}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">CUSTOMER CONTACT</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedAppointment.customer}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{selectedAppointment.phone}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase block">SERVICE REQUEST</span>
                <p className="font-bold text-slate-900">{selectedAppointment.service}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-700 cursor-pointer"
              >
                Close Window
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Confirmed slot for ${selectedAppointment.vehicle}`);
                  setSelectedAppointment(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
