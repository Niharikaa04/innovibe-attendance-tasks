'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  UserPlus,
  Calendar,
  Database,
  Search,
  CheckCircle2,
  Bell,
  Wrench,
  Truck,
  Sparkles,
} from 'lucide-react';

interface ServiceModalsAndDrawersProps {
  activeModal: string | null;
  onCloseModal: () => void;
  onSubmitNewTicket?: (ticketData: any) => void;
}

export function ServiceModalsAndDrawers({
  activeModal,
  onCloseModal,
  onSubmitNewTicket,
}: ServiceModalsAndDrawersProps) {
  // New ticket form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleModel, setVehicleModel] = useState('Ather 450X Apex');
  const [regNumber, setRegNumber] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [serviceType, setServiceType] = useState<'Service at Home' | 'Service at Center' | 'Roadside Assistance'>('Service at Center');
  const [symptoms, setSymptoms] = useState('');

  // Parts request state
  const [selectedComponent, setSelectedComponent] = useState('Brake Pad Assembly (Reg-B2)');
  const [customPartName, setCustomPartName] = useState('');
  const [customPartSpec, setCustomPartSpec] = useState('');
  const [partQuantity, setPartQuantity] = useState(1);
  const [partUrgency, setPartUrgency] = useState('Standard');
  const [partsToast, setPartsToast] = useState<string | null>(null);

  // Command search state
  const [searchQuery, setSearchQuery] = useState('');

  if (!activeModal) return null;

  const handlePartsSubmit = () => {
    const partTitle = selectedComponent === 'Other' ? customPartName || 'Custom Spare Part' : selectedComponent;
    onCloseModal();
    alert(`Requisition Submitted Successfully!\n\nPart: ${partTitle}\nQuantity: ${partQuantity}\nUrgency: ${partUrgency}${customPartSpec ? `\nSpec/No: ${customPartSpec}` : ''}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-left">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {activeModal === 'new-ticket' && <Plus className="h-5 w-5 text-blue-600" />}
            {activeModal === 'assign-tech' && <UserPlus className="h-5 w-5 text-indigo-600" />}
            {activeModal === 'create-appointment' && <Calendar className="h-5 w-5 text-amber-600" />}
            {activeModal === 'parts-request' && <Database className="h-5 w-5 text-purple-600" />}
            {activeModal === 'search' && <Search className="h-5 w-5 text-blue-600" />}
            {activeModal === 'notifications' && <Bell className="h-5 w-5 text-amber-600" />}

            <h3 className="text-lg font-extrabold text-slate-900">
              {activeModal === 'new-ticket' && 'Create New Service Ticket'}
              {activeModal === 'assign-tech' && 'Dispatch Technician'}
              {activeModal === 'create-appointment' && 'Schedule Appointment'}
              {activeModal === 'parts-request' && 'Raise Parts Requisition'}
              {activeModal === 'search' && 'Global Operations Search'}
              {activeModal === 'notifications' && 'Service Manager Notifications'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onCloseModal}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal 1: New Ticket */}
        {activeModal === 'new-ticket' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onSubmitNewTicket) {
                onSubmitNewTicket({
                  customerName,
                  customerPhone,
                  vehicleModel,
                  registrationNumber: regNumber || 'AP39XX9999',
                  serviceType,
                  location: customerAddress || 'Visakhapatnam Hub',
                  aiSuggestedFault: symptoms || 'Periodic Diagnostic Inspection Required',
                  aiEstimatedCost: serviceType === 'Service at Home' ? 249 : 499,
                  aiEstimatedTimeMins: 45,
                  urgency: 'MEDIUM',
                });
              }
              onCloseModal();
            }}
            className="space-y-4 text-xs font-semibold"
          >
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+91 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Registration Reg #</label>
                <input
                  type="text"
                  required
                  placeholder="AP39AB1234"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">EV Model</label>
                <select
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="Ather 450X Apex">Ather 450X Apex</option>
                  <option value="Ola S1 Pro Gen2">Ola S1 Pro Gen2</option>
                  <option value="TVS iQube ST">TVS iQube ST</option>
                  <option value="Hero Electric Nyx">Hero Electric Nyx</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="Service at Center">Service at Center (₹499)</option>
                  <option value="Service at Home">Service at Home (₹249)</option>
                  <option value="Roadside Assistance">Roadside Assistance (₹199)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Service Address / Location</label>
              <input
                type="text"
                required
                placeholder="e.g. Plot 42, Beach Road, Visakhapatnam"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reported Symptoms / Issues</label>
              <textarea
                rows={2}
                placeholder="Describe fault or customer complaint..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCloseModal}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Create & Run AI Diagnosis</span>
              </button>
            </div>
          </form>
        )}

        {/* Modal 2: Parts Request */}
        {activeModal === 'parts-request' && (
          <div className="space-y-4 text-xs font-semibold">
            <p className="text-slate-600 font-medium">Request urgent spare parts allocation from central depot.</p>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Component</label>
              <select
                value={selectedComponent}
                onChange={(e) => setSelectedComponent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-purple-500"
              >
                <option value="Brake Pad Assembly (Reg-B2)">Brake Pad Assembly (Reg-B2)</option>
                <option value="Battery Connector Cable (HV-72V)">Battery Connector Cable (HV-72V)</option>
                <option value="Motor Controller Subassembly">Motor Controller Subassembly</option>
                <option value="BMS Thermistor Sensor Module">BMS Thermistor Sensor Module</option>
                <option value="Other">Other (Custom Part Request)</option>
              </select>
            </div>

            {/* Dynamic Custom Part Info Boxes when "Other" is selected */}
            {selectedComponent === 'Other' && (
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-1.5 text-purple-900 font-extrabold text-xs">
                  <Database className="h-4 w-4 text-purple-600" />
                  <span>Custom Part Information</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-purple-800 uppercase tracking-wider mb-1">What Part is Required?</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rear Shock Absorber, High Voltage Fuse 40A, Speedometer Cable"
                    value={customPartName}
                    onChange={(e) => setCustomPartName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-purple-800 uppercase tracking-wider mb-1">Part Number / Specification (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. OEM-9942-X or 72V 40Ah Harness"
                    value={customPartSpec}
                    onChange={(e) => setCustomPartSpec(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Quantity and Priority Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Quantity Required</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={partQuantity}
                  onChange={(e) => setPartQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-purple-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Requisition Urgency</label>
                <select
                  value={partUrgency}
                  onChange={(e) => setPartUrgency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-purple-500"
                >
                  <option value="Standard">Standard Allocation</option>
                  <option value="Urgent">Urgent (Same Day)</option>
                  <option value="Emergency Critical">Emergency Critical (Express Depot Dispatch)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button onClick={onCloseModal} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={handlePartsSubmit}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md transition-colors"
              >
                Submit Requisition
              </button>
            </div>
          </div>
        )}

        {/* Modal 3: Inspect Ticket (Critical Diagnostic) */}
        {activeModal === 'inspect-ticket' && (
          <div className="space-y-4 text-xs text-left">
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-600 text-white font-extrabold shrink-0 mt-0.5">
                ⚡ 68°C
              </div>
              <div className="space-y-1">
                <div className="font-extrabold text-rose-900 text-sm">Critical BMS Thermal Warning</div>
                <p className="text-rose-700 text-xs font-medium">
                  BMS Thermistor Sensor #3 reading 68°C (Normal: &lt;45°C). Battery pack safety lockout triggered.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ticket Reference</span>
                <span className="font-extrabold text-slate-900">#BK-2026-0103</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Specialist</span>
                <span className="font-extrabold text-slate-900">Rahul Sharma (Tech ID: #101)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Bay</span>
                <span className="font-extrabold text-slate-900">Bay 04 (HV Battery Diagnostics)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Time in Queue</span>
                <span className="font-extrabold text-rose-600">42 Mins (Needs Inspection)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
              <div className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>AI Recommended Remediation</span>
              </div>
              <p className="text-xs text-indigo-800 font-medium">
                Perform manual cell voltage balancing & swap thermal probe module #3. Estimated repair time: 45 min.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCloseModal}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Battery Swap & Cell Balancing Requisition Approved!');
                  onCloseModal();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm"
              >
                Approve Battery Repair & Reassign
              </button>
            </div>
          </div>
        )}

        {/* Modal 4: View Job Progress (SLA Delay Audit) */}
        {activeModal === 'view-job-progress' && (
          <div className="space-y-4 text-xs text-left">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-600 text-white font-extrabold shrink-0 mt-0.5">
                +27m
              </div>
              <div className="space-y-1">
                <div className="font-extrabold text-amber-950 text-sm">Job #SV-10482 — SLA At Risk</div>
                <p className="text-amber-800 text-xs font-medium">
                  Ola S1 Pro Gen 2 • Controller realignment taking 27 min longer due to connector pin replacement.
                </p>
              </div>
            </div>

            {/* Live Progress Stage Stepper */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="text-xs font-extrabold text-slate-900 flex justify-between items-center">
                <span>Real-Time Stage Completion</span>
                <span className="text-blue-600">65% Progress</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>01:15 PM — Customer Check-in & Intake Completed</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>01:30 PM — OBD Telematics Diagnostic Sweep Passed</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 p-2 rounded-xl border border-blue-200">
                  <Wrench className="h-4 w-4 text-blue-600 animate-spin" />
                  <span>IN SERVICE — Motor Controller Realignment (Tech: Manoj Kumar)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 opacity-60">
                  <div className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px]">4</div>
                  <span>EST 02:20 PM — Quality Control Road Test & Safety Pass</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCloseModal}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('SLA Deadline Extended by +30 Mins. Customer notified via automated SMS update.');
                  onCloseModal();
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-sm"
              >
                Extend SLA (+30 Min) & Notify Customer
              </button>
            </div>
          </div>
        )}

        {/* Fallback modal content */}
        {activeModal !== 'new-ticket' && activeModal !== 'parts-request' && activeModal !== 'inspect-ticket' && activeModal !== 'view-job-progress' && (
          <div className="space-y-4 text-xs font-semibold text-left">
            <p className="text-slate-600">Command Center Action initialized.</p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button onClick={onCloseModal} className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold">Acknowledge</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
