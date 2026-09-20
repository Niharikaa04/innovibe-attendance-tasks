'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Star,
  ChevronRight,
  X,
  CreditCard,
  Zap,
} from 'lucide-react';

export function ServiceCustomersView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const customers = [
    {
      id: 'cust_101',
      name: 'Vikramaditya Rathore',
      phone: '+91 90000 00001',
      email: 'vikram.rathore@outlook.com',
      address: 'Plot 42, Beach Road, Visakhapatnam',
      evModel: 'Ather 450X Apex (AP39AB1234)',
      membershipPlan: 'Pro Care AMC (₹999/yr)',
      totalSpend: '₹14,250',
      rating: 4.9,
      servicesCompleted: 6,
    },
    {
      id: 'cust_102',
      name: 'Ananya Deshmukh',
      phone: '+91 90000 00002',
      email: 'ananya.d@gmail.com',
      address: 'Sector 4, MVP Colony, Visakhapatnam',
      evModel: 'Ola S1 Pro Gen 2 (AP39CD5678)',
      membershipPlan: 'Standard AMC (₹499/yr)',
      totalSpend: '₹8,490',
      rating: 4.8,
      servicesCompleted: 4,
    },
    {
      id: 'cust_103',
      name: 'Karthik Raja',
      phone: '+91 90000 00003',
      email: 'karthik.raja@yahoo.com',
      address: 'Main Road, Kakinada Hub',
      evModel: 'TVS iQube ST (AP39EF9012)',
      membershipPlan: 'Essential Care (₹199/mo)',
      totalSpend: '₹4,120',
      rating: 5.0,
      servicesCompleted: 2,
    },
  ];

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.evModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 text-left font-sans relative">
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Customer Database & AMC Membership Ledger
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Customer contacts, enrolled vehicles, active AMC care packages, service history logs, and satisfaction ratings
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Customer Name, Phone, or EV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden text-slate-900 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Customer Roster Table */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-wider">
                <th className="pb-3 px-3">CUSTOMER NAME & CONTACT</th>
                <th className="pb-3 px-3">ENROLLED EV MODEL</th>
                <th className="pb-3 px-3">AMC CARE PLAN</th>
                <th className="pb-3 px-3">TOTAL SPEND</th>
                <th className="pb-3 px-3">RATING</th>
                <th className="pb-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-sans">
              {filteredCustomers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-3">
                    <p className="font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors leading-tight">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">{c.phone}</p>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-slate-800">{c.evModel}</td>

                  <td className="py-3.5 px-3">
                    <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                      {c.membershipPlan}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{c.totalSpend}</td>

                  <td className="py-3.5 px-3 font-black text-amber-600 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400" /> {c.rating}
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(c);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-sky-600 font-extrabold text-xs transition-colors flex items-center gap-1 ml-auto"
                    >
                      <span>View Profile</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">{selectedCustomer.name}</h3>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs font-medium">
              <p className="flex items-center gap-1.5 text-slate-700">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> {selectedCustomer.phone}
              </p>
              <p className="flex items-center gap-1.5 text-slate-700">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> {selectedCustomer.email}
              </p>
              <p className="flex items-center gap-1.5 text-slate-700">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> {selectedCustomer.address}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs space-y-1">
              <span className="text-[10px] font-bold text-indigo-800 uppercase">Active AMC Membership</span>
              <p className="font-extrabold text-indigo-950">{selectedCustomer.membershipPlan}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs"
              >
                Close Customer Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
