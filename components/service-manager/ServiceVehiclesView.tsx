'use client';

import React, { useState } from 'react';
import {
  Truck,
  Search,
  Filter,
  Zap,
  Activity,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  User,
  Wrench,
  Battery,
  MapPin,
  Calendar,
  X,
  CheckCircle2,
} from 'lucide-react';
import { mockVehicles } from '../../lib/mock-data';

export function ServiceVehiclesView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  const fleetVehicles = [
    {
      id: 'veh_101',
      model: 'Ather 450X Apex',
      brand: 'Ather',
      regNumber: 'AP39AB1234',
      vin: 'AT45XAP98239012389',
      ownerName: 'Vikramaditya Rathore',
      ownerContact: '+91 90000 00001',
      batterySoh: '94.2%',
      odometerKm: 14204,
      status: 'IN_SERVICE',
      activeTicket: 'BK-2026-0001',
      location: 'Kakinada Main Hub',
      lastService: '12-May-2026',
      telemetryAlert: 'Zone-B cell temperature elevated 42°C',
    },
    {
      id: 'veh_102',
      model: 'Ola S1 Pro Gen 2',
      brand: 'Ola Electric',
      regNumber: 'AP39CD5678',
      vin: 'OLA450XAP9823901290',
      ownerName: 'Ananya Deshmukh',
      ownerContact: '+91 90000 00002',
      batterySoh: '88.5%',
      odometerKm: 22100,
      status: 'DIAGNOSTIC_CHECK',
      activeTicket: 'BK-2026-0002',
      location: 'Visakhapatnam Hub',
      lastService: '04-Jan-2026',
      telemetryAlert: 'Software OTA flash required',
    },
    {
      id: 'veh_103',
      model: 'TVS iQube ST',
      brand: 'TVS',
      regNumber: 'AP39EF9012',
      vin: 'TVSST98239012389',
      ownerName: 'Karthik Raja',
      ownerContact: '+91 90000 00003',
      batterySoh: '91.0%',
      odometerKm: 9850,
      status: 'HEALTHY',
      activeTicket: 'None',
      location: 'Rajahmundry Hub',
      lastService: '20-Jun-2026',
      telemetryAlert: 'Normal Operation',
    },
    {
      id: 'veh_104',
      model: 'Hero Electric Optima',
      brand: 'Hero Electric',
      regNumber: 'AP39GH3456',
      vin: 'HEROOPT98239012389',
      ownerName: 'Sneha Reddy',
      ownerContact: '+91 90000 00004',
      batterySoh: '96.0%',
      odometerKm: 6400,
      status: 'PENDING_SERVICE',
      activeTicket: 'BK-2026-0004',
      location: 'Visakhapatnam Hub',
      lastService: '15-Feb-2026',
      telemetryAlert: 'Brake pad wear alert',
    },
    {
      id: 'veh_105',
      model: 'Bajaj Chetak Premium',
      brand: 'Bajaj',
      regNumber: 'AP39IJ7890',
      vin: 'CHETAK98239012389',
      ownerName: 'Rajesh Varma',
      ownerContact: '+91 90000 00005',
      batterySoh: '97.4%',
      odometerKm: 4200,
      status: 'HEALTHY',
      activeTicket: 'None',
      location: 'Kakinada Main Hub',
      lastService: '10-Jul-2026',
      telemetryAlert: 'Normal Operation',
    },
  ];

  const filteredVehicles = fleetVehicles.filter((v) => {
    const matchesSearch =
      v.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vin.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5 text-left font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Service Vehicles & Connected Fleet Telemetry
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Live battery health, odometer readings, active service tickets, and CAN-bus telemetry for customer EV fleet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Total Enrolled: {fleetVehicles.length}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Healthy: {fleetVehicles.filter((v) => v.status === 'HEALTHY').length}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              In Service: {fleetVehicles.filter((v) => v.status === 'IN_SERVICE' || v.status === 'DIAGNOSTIC_CHECK').length}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Reg No, VIN, Owner or Model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
            <span className="text-slate-400 font-bold text-[10px] uppercase">STATUS:</span>
            {['ALL', 'IN_SERVICE', 'DIAGNOSTIC_CHECK', 'HEALTHY', 'PENDING_SERVICE'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-extrabold capitalize transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicles Table / Roster */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-wider">
                <th className="pb-3 px-3">VEHICLE & REG NO</th>
                <th className="pb-3 px-3">OWNER / CUSTOMER</th>
                <th className="pb-3 px-3">BATTERY SOH</th>
                <th className="pb-3 px-3">ODOMETER</th>
                <th className="pb-3 px-3">HUB LOCATION</th>
                <th className="pb-3 px-3">STATUS</th>
                <th className="pb-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-sans">
              {filteredVehicles.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs shrink-0">
                        {v.brand[0]}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                          {v.model}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 font-bold">{v.regNumber}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <p className="font-extrabold text-slate-900 leading-tight">{v.ownerName}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{v.ownerContact}</p>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5 font-extrabold text-emerald-700">
                      <Zap className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{v.batterySoh}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-slate-700">
                    {v.odometerKm.toLocaleString()} km
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" /> {v.location}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        v.status === 'IN_SERVICE'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : v.status === 'DIAGNOSTIC_CHECK'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : v.status === 'HEALTHY'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      ● {v.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVehicle(v);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-blue-600 font-extrabold text-xs transition-colors flex items-center gap-1 ml-auto"
                    >
                      <span>Diagnostics</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vehicle Diagnostics Modal Drawer */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Truck className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedVehicle.model}</h3>
                  <p className="text-xs font-mono text-slate-400 font-bold">{selectedVehicle.regNumber} • {selectedVehicle.vin}</p>
                </div>
              </div>
              <button onClick={() => setSelectedVehicle(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Owner Name</span>
                <p className="font-extrabold text-slate-900">{selectedVehicle.ownerName}</p>
                <p className="text-[10px] text-slate-500">{selectedVehicle.ownerContact}</p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Battery State of Health</span>
                <p className="text-xl font-black text-emerald-700">{selectedVehicle.batterySoh}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-indigo-700">CAN-Bus Telemetry Alert</span>
              <p className="font-semibold text-slate-900">{selectedVehicle.telemetryAlert}</p>
            </div>

            <div className="space-y-2 text-xs font-medium text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Active Service Ticket:</span>
                <strong className="text-slate-900 font-mono">{selectedVehicle.activeTicket}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Service Center Location:</span>
                <strong className="text-slate-900">{selectedVehicle.location}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Total Odometer Reading:</span>
                <strong className="text-slate-900">{selectedVehicle.odometerKm.toLocaleString()} km</strong>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedVehicle(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs"
              >
                Close Telemetry Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
