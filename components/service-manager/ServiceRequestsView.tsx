'use client';

import React, { useState } from 'react';
import {
  Inbox,
  Clock,
  MapPin,
  Phone,
  User,
  Plus,
  CheckCircle2,
  AlertCircle,
  Truck,
} from 'lucide-react';

export function ServiceRequestsView() {
  const [requests, setRequests] = useState([
    {
      id: 'REQ-901',
      customer: 'Suresh Varma',
      phone: '+91 98765 11122',
      serviceType: 'Roadside Assistance',
      vehicle: 'Ather 450X (AP39XX1234)',
      address: 'Near Beach Road Light House, Visakhapatnam',
      time: '10 mins ago',
      urgency: 'HIGH',
      price: '₹199',
    },
    {
      id: 'REQ-902',
      customer: 'Kavita Sharma',
      phone: '+91 98765 33344',
      serviceType: 'Doorstep General Service',
      vehicle: 'Ola S1 Pro (AP39YY5678)',
      address: 'Plot 18, Gajuwaka Main Hub',
      time: '25 mins ago',
      urgency: 'MEDIUM',
      price: '₹249',
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleConvertTicket = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setToastMessage(`Converted Request ${id} to active Service Ticket!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-5 text-left font-sans relative">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-blue-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Doorstep & Emergency Service Requests Queue
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Incoming customer app requests for doorstep diagnostics, home maintenance, and roadside assistance
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
            {requests.length} Pending Requests
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-xs font-bold text-slate-500">
            No pending incoming service requests. All customer requests converted!
          </div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-blue-700 text-xs">{r.id}</span>
                  <span className="font-extrabold text-slate-900 text-sm">{r.serviceType}</span>
                  <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {r.price}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-semibold">{r.vehicle} • Owner: {r.customer} ({r.phone})</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {r.address}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleConvertTicket(r.id)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Convert to Service Ticket</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
