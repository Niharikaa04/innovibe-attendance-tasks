'use client';

import React, { useState, useEffect } from 'react';
import { ServiceTicket, Technician } from '../../lib/types';
import {
  Sparkles,
  UserPlus,
  Clock,
  IndianRupee,
  CheckCircle2,
  Check,
  Search,
  Filter,
  AlertCircle,
  Wrench,
  ShieldCheck,
  Zap,
  ChevronRight,
  Info,
  Layers,
  MapPin,
  RefreshCw,
  Cpu,
  X,
} from 'lucide-react';

interface ServiceDispatchWorkbenchProps {
  tickets: ServiceTicket[];
  technicians: Technician[];
  selectedTicketId: string;
  onSelectTicket: (ticketId: string) => void;
  onAssignJob: (ticketId: string, technicianName: string) => void;
}

export function ServiceDispatchWorkbench({
  tickets,
  technicians,
  selectedTicketId,
  onSelectTicket,
  onAssignJob,
}: ServiceDispatchWorkbenchProps) {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnosisStep, setDiagnosisStep] = useState<number>(5); // 1 to 5 steps
  const [selectedTechForModal, setSelectedTechForModal] = useState<Technician | null>(null);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  // Trigger brief AI diagnostic animation when selected ticket changes
  useEffect(() => {
    setIsDiagnosing(true);
    setDiagnosisStep(1);

    const step1 = setTimeout(() => setDiagnosisStep(2), 150);
    const step2 = setTimeout(() => setDiagnosisStep(3), 300);
    const step3 = setTimeout(() => setDiagnosisStep(4), 450);
    const step4 = setTimeout(() => {
      setDiagnosisStep(5);
      setIsDiagnosing(false);
    }, 600);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);
    };
  }, [selectedTicketId]);

  // Filter tickets
  const filteredTickets = tickets.filter((tkt) => {
    const matchesSearch =
      tkt.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tkt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tkt.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tkt.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'ALL') return true;
    if (filterType === 'CRITICAL') return tkt.urgency === 'EMERGENCY' || tkt.urgency === 'HIGH';
    if (filterType === 'HOME') return tkt.serviceType === 'Service at Home';
    if (filterType === 'CENTER') return tkt.serviceType === 'Service at Center';
    if (filterType === 'RSA') return tkt.serviceType === 'Roadside Assistance';
    if (filterType === 'UNASSIGNED') return !tkt.assignedTechnician || tkt.status === 'PENDING';
    if (filterType === 'ASSIGNED') return tkt.status === 'TECHNICIAN_ASSIGNED' || tkt.status === 'IN_PROGRESS';
    return true;
  });

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Service Dispatch Workbench
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
            Real-time Queue & AI Engine
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Ticket Queue (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span>Service Ticket Queue</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {filteredTickets.length}
              </span>
            </h3>
          </div>

          {/* Search & Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket, reg, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-extrabold">
              {['ALL', 'CRITICAL', 'UNASSIGNED', 'HOME', 'CENTER', 'RSA'].map((ft) => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setFilterType(ft)}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    filterType === ft
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Queue List */}
          <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredTickets.map((tkt) => {
              const isSelected = tkt.id === selectedTicket.id;

              return (
                <div
                  key={tkt.id}
                  onClick={() => onSelectTicket(tkt.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-blue-700">{tkt.ticketNumber}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        tkt.urgency === 'EMERGENCY'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : tkt.urgency === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}
                    >
                      {tkt.serviceType}
                    </span>
                  </div>

                  <div className="mt-1.5 space-y-1">
                    <p className="text-xs font-extrabold text-slate-900">{tkt.customerName}</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {tkt.vehicleModel} • <span className="font-mono text-slate-700 font-bold">{tkt.registrationNumber}</span>
                    </p>
                    <p className="text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                      <span>{tkt.location || 'Srinivasa Nagar, Visakhapatnam'}</span>
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                    <span>{tkt.createdAt}</span>
                    {tkt.assignedTechnician ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" /> {tkt.assignedTechnician}
                      </span>
                    ) : (
                      <span className="text-purple-700 font-extrabold flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-purple-600" /> AI Recommended
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: AI Service Advisor (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">AI Service Advisor</h3>
                <p className="text-[10px] text-purple-700 font-bold">Deep Neural Diagnostics</p>
              </div>
            </div>
            <span className="font-mono text-xs font-extrabold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
              {selectedTicket.ticketNumber}
            </span>
          </div>

          {/* AI Diagnostic Flow Animation Indicator */}
          {isDiagnosing ? (
            <div className="p-6 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-4 text-center">
              <RefreshCw className="h-6 w-6 text-purple-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-purple-900">
                  {diagnosisStep === 1 && 'Analyzing vehicle telemetry...'}
                  {diagnosisStep === 2 && 'Interpreting service symptoms...'}
                  {diagnosisStep === 3 && 'Matching diagnostic patterns...'}
                  {diagnosisStep === 4 && 'Estimating repair requirements...'}
                  {diagnosisStep === 5 && 'Generating AI diagnosis...'}
                </p>
                <div className="w-full bg-purple-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full transition-all duration-150"
                    style={{ width: `${(diagnosisStep / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Vehicle & Customer Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{selectedTicket.customerName}</span>
                  <span className="text-[10px] font-mono text-slate-500">{selectedTicket.customerPhone}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {selectedTicket.vehicleModel} ({selectedTicket.registrationNumber})
                </p>
                <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-500">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span>{selectedTicket.location}</span>
                </div>
              </div>

              {/* AI Suggested Fault Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/80 via-white to-blue-50/50 border border-purple-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">
                    AI SUGGESTED FAULT DIAGNOSIS
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                    Confidence: 94%
                  </span>
                </div>

                <p className="text-sm font-extrabold text-slate-900 leading-snug">
                  {selectedTicket.aiSuggestedFault}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-purple-100 font-sans">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Est. Cost</span>
                    <p className="text-base font-black text-slate-900 flex items-center gap-0.5 mt-0.5">
                      <IndianRupee className="h-3.5 w-3.5 text-emerald-600" /> ₹{selectedTicket.aiEstimatedCost}
                    </p>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Est. Repair Time</span>
                    <p className="text-base font-black text-slate-900 flex items-center gap-0.5 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-blue-600" /> {selectedTicket.aiEstimatedTimeMins} mins
                    </p>
                  </div>
                </div>
              </div>

              {/* Required Skills & Parts */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Required Skills</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                      BMS Diagnostics
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200">
                      HV Wiring
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                      Ather Master
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Parts</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    Thermistor Sensor B2 • High Temp Wiring Harness
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Dispatcher & Technician Match (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <UserPlus className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">AI Dispatcher</h3>
                <p className="text-[10px] text-blue-600 font-bold">Technician Match Ranking</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Proximity & Skills</span>
          </div>

          <div className="space-y-3">
            {technicians.map((tech, idx) => {
              const isAssigned = selectedTicket.assignedTechnician === tech.name;
              const matchScore = idx === 0 ? 98 : idx === 1 ? 89 : 82;

              return (
                <div
                  key={tech.id}
                  className={`p-3.5 rounded-2xl border transition-all text-left space-y-2.5 ${
                    isAssigned
                      ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900">{tech.name}</span>
                        {idx === 0 && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                            AI Top Pick
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{tech.skills.join(' • ')}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-purple-700">{matchScore}%</span>
                      <span className="text-[9px] block text-slate-400 font-bold">Match</span>
                    </div>
                  </div>

                  {/* Explainable AI Match Meter */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] space-y-1 font-semibold text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Proximity: <strong>{tech.distanceKm || (idx + 1) * 1.4} km</strong></span>
                      <span>Active Jobs: <strong>{tech.activeJobsCount}</strong></span>
                      <span>Rating: <strong className="text-amber-600">★ {tech.customerRating || 4.9}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold text-slate-500">
                      Status: <strong className="text-emerald-600">{tech.status}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedTechForModal(tech)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                        isAssigned
                          ? 'bg-emerald-600 text-white shadow-xs flex items-center gap-1'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                      }`}
                    >
                      {isAssigned ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Assigned
                        </>
                      ) : (
                        'Assign Job'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assign Job Modal: Select Unassigned Ticket for Technician */}
      {selectedTechForModal && (
        <AssignJobModal
          technician={selectedTechForModal}
          tickets={tickets}
          initialSelectedTicketId={selectedTicketId}
          onClose={() => setSelectedTechForModal(null)}
          onConfirmAssignment={(ticketId, techName) => {
            onAssignJob(ticketId, techName);
            onSelectTicket(ticketId);
            setSelectedTechForModal(null);
          }}
        />
      )}
    </div>
  );
}

interface AssignJobModalProps {
  technician: Technician;
  tickets: ServiceTicket[];
  initialSelectedTicketId: string;
  onClose: () => void;
  onConfirmAssignment: (ticketId: string, techName: string) => void;
}

function AssignJobModal({
  technician,
  tickets,
  initialSelectedTicketId,
  onClose,
  onConfirmAssignment,
}: AssignJobModalProps) {
  // Find unassigned or pending tickets first
  const unassignedTickets = tickets.filter(
    (t) => !t.assignedTechnician || t.status === 'PENDING' || t.status === 'AI_DIAGNOSED'
  );
  
  // Available tickets list (unassigned first, then others)
  const availableTickets = unassignedTickets.length > 0 ? unassignedTickets : tickets;

  const [chosenTicketId, setChosenTicketId] = useState<string>(() => {
    if (availableTickets.some((t) => t.id === initialSelectedTicketId)) {
      return initialSelectedTicketId;
    }
    return availableTickets[0]?.id || initialSelectedTicketId;
  });

  const chosenTicket = tickets.find((t) => t.id === chosenTicketId) || availableTickets[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-left">
      <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Dispatch Job to {technician.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Select an unassigned service ticket for technician assignment
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selected Technician Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900">{technician.name}</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                ● {technician.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Skills: {technician.skills.join(' • ')}
            </p>
          </div>
          <div className="text-right text-[11px] font-semibold text-slate-600">
            <p>Proximity: <strong className="text-blue-700 font-extrabold">{technician.distanceKm || 1.8} km</strong></p>
            <p>Active Jobs: <strong>{technician.activeJobsCount}</strong></p>
          </div>
        </div>

        {/* Unassigned Service Tickets Selection */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <span>Unassigned Service Tickets ({availableTickets.length})</span>
            </label>
            <span className="text-[10px] font-bold text-blue-600">Select 1 ticket to assign</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {availableTickets.map((tkt) => {
              const isSelected = tkt.id === chosenTicketId;

              return (
                <div
                  key={tkt.id}
                  onClick={() => setChosenTicketId(tkt.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="unassignedTicket"
                    checked={isSelected}
                    onChange={() => setChosenTicketId(tkt.id)}
                    className="mt-1 text-blue-600 focus:ring-blue-500 h-4 w-4 shrink-0"
                  />

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-blue-700">{tkt.ticketNumber}</span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          tkt.urgency === 'EMERGENCY'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : tkt.urgency === 'HIGH'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}
                      >
                        {tkt.serviceType}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{tkt.customerName} ({tkt.customerPhone})</p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {tkt.vehicleModel} • Reg: <strong className="font-mono text-slate-700">{tkt.registrationNumber}</strong>
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-rose-700 font-bold mt-1 bg-rose-50/70 border border-rose-100 px-2 py-0.5 rounded-lg w-fit">
                        <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                        <span>Address: <strong className="text-slate-800 font-semibold">{tkt.location || 'Srinivasa Nagar, Visakhapatnam'}</strong></span>
                      </div>
                    </div>

                    <div className="pt-1 text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                      <span className="text-purple-700 font-bold">AI Diagnosis: {tkt.aiSuggestedFault}</span>
                      <span className="text-slate-400">{tkt.createdAt}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explainable AI Suitability Preview */}
        {chosenTicket && (
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> AI Recommendation Score
              </span>
              <span className="text-xs font-black text-purple-900 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                98% Skill & Proximity Match
              </span>
            </div>
            <p className="text-[11px] text-purple-950 font-medium">
              {technician.name} is top certified for <strong>{chosenTicket.vehicleModel}</strong> with active availability.
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              if (chosenTicket) {
                onConfirmAssignment(chosenTicket.id, technician.name);
              }
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all"
          >
            <Check className="h-4 w-4" />
            <span>Confirm & Dispatch Job</span>
          </button>
        </div>
      </div>
    </div>
  );
}

