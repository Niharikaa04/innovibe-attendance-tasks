'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Calendar,
  X,
  ChevronRight,
  DollarSign,
  AlertTriangle,
  Star,
  UserCheck,
  MessageSquare,
  Award,
  ThumbsUp,
} from 'lucide-react';

export function ServiceAnalyticsAndSla() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  // Modal States
  const [slaModalType, setSlaModalType] = useState<string | null>(null);
  const [valueModalType, setValueModalType] = useState<string | null>(null);
  const [selectedTechReview, setSelectedTechReview] = useState<any | null>(null);

  // Dynamic Chart Heights based on timeRange
  const chartData = {
    today: [
      { time: '08:00', height: 'h-[40%]', label: '4 Jobs' },
      { time: '10:00', height: 'h-[75%]', label: '8 Jobs' },
      { time: '12:00', height: 'h-[90%]', label: '11 Jobs' },
      { time: '14:00', height: 'h-[60%]', label: '6 Jobs' },
      { time: '16:00', height: 'h-[80%]', label: '9 Jobs' },
    ],
    week: [
      { time: 'Mon', height: 'h-[55%]', label: '24 Jobs' },
      { time: 'Tue', height: 'h-[70%]', label: '31 Jobs' },
      { time: 'Wed', height: 'h-[95%]', label: '42 Jobs' },
      { time: 'Thu', height: 'h-[80%]', label: '36 Jobs' },
      { time: 'Fri', height: 'h-[65%]', label: '28 Jobs' },
    ],
    month: [
      { time: 'Week 1', height: 'h-[60%]', label: '140 Jobs' },
      { time: 'Week 2', height: 'h-[85%]', label: '185 Jobs' },
      { time: 'Week 3', height: 'h-[90%]', label: '192 Jobs' },
      { time: 'Week 4', height: 'h-[75%]', label: '165 Jobs' },
      { time: 'Week 5', height: 'h-[45%]', label: '95 Jobs' },
    ],
  };

  // Technician Customer Ratings & Reviews Data
  const technicianRatings = [
    {
      id: 'tech_01',
      name: 'Rahul Sharma',
      role: 'Senior EV Specialist',
      rating: 4.9,
      reviewCount: 48,
      completedJobs: 24,
      slaCompliance: '98.2%',
      firstTimeFix: '97.5%',
      topReview: 'Fixed my Ather BMS thermal warning quickly. Extremely knowledgeable and polite!',
      recentReviews: [
        { customer: 'Vikramaditya R.', rating: 5, date: 'Today, 02:30 PM', comment: 'Super fast BMS diagnostic scan and cable replacement.' },
        { customer: 'Sanjay Verma', rating: 5, date: 'Yesterday', comment: 'Very clean service at center. Solved brake squeak.' },
        { customer: 'Meera Nair', rating: 4, date: '12-Aug-2026', comment: 'Good work on motor controller calibration.' },
      ],
    },
    {
      id: 'tech_02',
      name: 'Suresh Kumar',
      role: 'Mobile Field Technician',
      rating: 4.8,
      reviewCount: 36,
      completedJobs: 19,
      slaCompliance: '94.0%',
      firstTimeFix: '92.0%',
      topReview: 'Arrived for roadside emergency assistance in 15 mins. Saved my trip!',
      recentReviews: [
        { customer: 'Ananya Deshmukh', rating: 5, date: 'Today, 01:15 PM', comment: 'On-time roadside emergency assistance!' },
        { customer: 'Ramesh Babu', rating: 4, date: 'Yesterday', comment: 'Prompt battery connector fix near Beach Road.' },
      ],
    },
    {
      id: 'tech_03',
      name: 'Manoj Kumar',
      role: 'Lead QA & High-Voltage Tech',
      rating: 5.0,
      reviewCount: 52,
      completedJobs: 31,
      slaCompliance: '99.1%',
      firstTimeFix: '98.8%',
      topReview: 'Outstanding diagnostic check. Vehicle runs smooth as brand new!',
      recentReviews: [
        { customer: 'Karthik Raja', rating: 5, date: 'Today, 03:00 PM', comment: 'Flawless quality audit certificate issued.' },
        { customer: 'Deepak Patel', rating: 5, date: '13-Aug-2026', comment: 'Master technician. Solved complex CAN-bus error.' },
      ],
    },
    {
      id: 'tech_04',
      name: 'Priya Singh',
      role: 'Doorstep Maintenance Specialist',
      rating: 4.9,
      reviewCount: 29,
      completedJobs: 15,
      slaCompliance: '96.5%',
      firstTimeFix: '95.0%',
      topReview: 'Doorstep brake fluid service was prompt, neat, and highly professional.',
      recentReviews: [
        { customer: 'Kavita Sharma', rating: 5, date: 'Today, 11:45 AM', comment: 'Punctual home visit and thorough brake check.' },
        { customer: 'Arun Kumar', rating: 4, date: '11-Aug-2026', comment: 'Clean work and explained maintenance tips well.' },
      ],
    },
  ];

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Top 3 SLA & Revenue Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* SLA Monitor — Clickable */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Service SLA Monitor
                </h2>
                <p className="text-xs text-slate-500 font-medium">Turnaround SLA compliance tracking</p>
              </div>
            </div>
            <span className="text-xs font-black text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
              92% Overall
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div
              onClick={() => setSlaModalType('ON_TIME')}
              className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/60 transition-all cursor-pointer space-y-0.5 group"
            >
              <span className="text-[9px] font-black uppercase text-emerald-700">ON TIME</span>
              <p className="text-xl font-black text-emerald-900 group-hover:scale-105 transition-transform">82%</p>
              <span className="text-[9px] text-emerald-600 font-bold">24 Jobs</span>
            </div>

            <div
              onClick={() => setSlaModalType('AT_RISK')}
              className="p-3 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100/60 transition-all cursor-pointer space-y-0.5 group"
            >
              <span className="text-[9px] font-black uppercase text-amber-700">AT RISK</span>
              <p className="text-xl font-black text-amber-900 group-hover:scale-105 transition-transform">3</p>
              <span className="text-[9px] text-amber-700 font-bold">&lt; 30m Left</span>
            </div>

            <div
              onClick={() => setSlaModalType('OVERDUE')}
              className="p-3 rounded-2xl bg-rose-50 border border-rose-200 hover:bg-rose-100/60 transition-all cursor-pointer space-y-0.5 group"
            >
              <span className="text-[9px] font-black uppercase text-rose-700">OVERDUE</span>
              <p className="text-xl font-black text-rose-900 group-hover:scale-105 transition-transform">1</p>
              <span className="text-[9px] text-rose-700 font-bold">Requires Action</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Target Turnaround Time:</span>
              <span className="font-extrabold text-slate-900">2 Hours 30 Mins</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">First-Time Fix Rate:</span>
              <span className="font-extrabold text-emerald-600">94.8% (Target 90%)</span>
            </div>
          </div>
        </div>

        {/* Performance Chart & Metrics */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Service Performance
                </h2>
                <p className="text-xs text-slate-500 font-medium">Throughput & technician efficiency</p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-extrabold">
              {(['today', 'week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`px-2 py-0.5 rounded-lg capitalize transition-colors ${
                    timeRange === range ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-32 flex items-end justify-between gap-2 pt-4 font-mono text-[10px]">
            {chartData[timeRange].map((item) => (
              <div
                key={item.time}
                onClick={() => alert(`Throughput at ${item.time}: ${item.label}`)}
                className="flex-1 flex flex-col items-center gap-1 h-full justify-end cursor-pointer group"
              >
                <span className="text-slate-400 font-bold group-hover:text-purple-600 transition-colors">{item.time}</span>
                <div
                  className={`w-full bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t-lg transition-all duration-300 group-hover:brightness-125 ${item.height}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Service Value Summary — Clickable Cards */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <IndianRupee className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Service Value Summary
                </h2>
                <p className="text-xs text-slate-500 font-medium">Daily completed & pending job valuation</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 font-sans">
            <div
              onClick={() => setValueModalType('COMPLETED')}
              className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-100/70 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase block group-hover:text-emerald-950">
                  Today's Completed Value
                </span>
                <p className="text-lg font-black text-slate-900">₹14,850</p>
              </div>
              <span className="text-xs font-extrabold text-emerald-700 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 group-hover:bg-emerald-50">
                27 Jobs
              </span>
            </div>

            <div
              onClick={() => setValueModalType('PENDING')}
              className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 hover:bg-blue-100/70 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase block group-hover:text-blue-950">
                  Pending In-Service Value
                </span>
                <p className="text-lg font-black text-slate-900">₹6,420</p>
              </div>
              <span className="text-xs font-extrabold text-blue-700 bg-white px-2.5 py-1 rounded-xl border border-blue-200 group-hover:bg-blue-50">
                12 Jobs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* NEW SECTION: Individual Technician Performance & Customer Ratings */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Star className="h-4 w-4 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Technician Performance & Customer Ratings Ledger
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Customer satisfaction scores (1-5★), SLA compliance, first-time fix rates, and verified customer feedback
              </p>
            </div>
          </div>

          <span className="text-xs font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full w-fit">
            Overall Rating: 4.9 ★ (165 Reviews)
          </span>
        </div>

        {/* Technician Cards Roster */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {technicianRatings.map((tech) => (
            <div
              key={tech.id}
              onClick={() => setSelectedTechReview(tech)}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all cursor-pointer space-y-3 flex flex-col justify-between group shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-amber-700 transition-colors leading-tight">
                      {tech.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{tech.role}</p>
                  </div>
                  
                  <div className="px-2 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black flex items-center gap-1 shrink-0">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
                    <span>{tech.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-400 font-bold block">SLA Compliance</span>
                    <span className="font-extrabold text-emerald-600">{tech.slaCompliance}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-400 font-bold block">1st-Time Fix</span>
                    <span className="font-extrabold text-indigo-600">{tech.firstTimeFix}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200 text-[11px] text-slate-600 italic font-medium leading-snug">
                  "{tech.topReview}"
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{tech.completedJobs} Jobs Completed</span>
                <span className="text-amber-700 group-hover:underline flex items-center gap-0.5">
                  <span>{tech.reviewCount} Reviews</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: SLA Breakdown Modal */}
      {slaModalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                SLA Status: <span className="underline">{slaModalType}</span>
              </h3>
              <button onClick={() => setSlaModalType(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {slaModalType === 'OVERDUE' ? (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                  <span className="font-extrabold text-rose-950">Job #BK-2026-0003 — OVERDUE</span>
                  <p className="text-[11px] text-slate-600">Delayed by 35 mins due to motor controller waiting.</p>
                </div>
              ) : slaModalType === 'AT_RISK' ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                    <p className="font-bold">Job #BK-2026-0004 — 18 mins left</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                    <p className="font-bold">Job #BK-2026-0007 — 24 mins left</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <p className="font-bold">24 Active Jobs running smoothly within target SLA limits.</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSlaModalType(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs"
              >
                Close SLA Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Service Value Revenue Breakup Modal */}
      {valueModalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                {valueModalType === 'COMPLETED' ? "Today's Completed Revenue Breakup" : 'Pending In-Service Revenue Valuation'}
              </h3>
              <button onClick={() => setValueModalType(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-700">Doorstep Roadside Services (14x ₹199)</span>
                <span className="font-bold text-slate-900">₹2,786</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-700">Home Diagnostic Packages (8x ₹249)</span>
                <span className="font-bold text-slate-900">₹1,992</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-700">Garage Full Servicing (5x ₹499 + Parts)</span>
                <span className="font-bold text-slate-900">₹10,072</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setValueModalType(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs"
              >
                Close Valuation Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Detailed Customer Reviews Modal */}
      {selectedTechReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 text-left max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
                  <Star className="h-5 w-5 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedTechReview.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedTechReview.role} • {selectedTechReview.reviewCount} Verified Ratings</p>
                </div>
              </div>

              <button onClick={() => setSelectedTechReview(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Average Customer Rating</span>
                <p className="text-2xl font-black text-amber-950 flex items-center gap-1">
                  {selectedTechReview.rating} <span className="text-amber-500 text-lg">★★★★★</span>
                </p>
              </div>

              <div className="text-right text-xs space-y-0.5">
                <p className="font-extrabold text-slate-900">SLA: {selectedTechReview.slaCompliance}</p>
                <p className="font-extrabold text-emerald-700">1st-Fix: {selectedTechReview.firstTimeFix}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider text-slate-400">
                Recent Verified Customer Reviews
              </h4>

              {selectedTechReview.recentReviews.map((rev: any, idx: number) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">{rev.customer}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{rev.date}</span>
                  </div>
                  <div className="text-amber-500 text-xs">{"★".repeat(rev.rating)}</div>
                  <p className="text-slate-600 font-medium text-[11px] pt-0.5">"{rev.comment}"</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTechReview(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs cursor-pointer"
              >
                Close Customer Reviews
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
