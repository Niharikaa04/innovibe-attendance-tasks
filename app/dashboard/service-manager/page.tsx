'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRole } from '../../../components/RoleContext';
import { mockServiceTickets, mockTechnicians, mockVehicles } from '../../../lib/mock-data';
import { ServiceTicket, Technician } from '../../../lib/types';
import { useSearchParams } from 'next/navigation';

import { ServiceManagerHeader } from '../../../components/service-manager/ServiceManagerHeader';
import { ServiceKpiGrid } from '../../../components/service-manager/ServiceKpiGrid';
import { NeedsAttentionAlerts } from '../../../components/service-manager/NeedsAttentionAlerts';
import { ServiceDispatchWorkbench } from '../../../components/service-manager/ServiceDispatchWorkbench';
import { ServiceJobBoard } from '../../../components/service-manager/ServiceJobBoard';
import { TechnicianControlCenter } from '../../../components/service-manager/TechnicianControlCenter';
import { AppointmentsAndBays } from '../../../components/service-manager/AppointmentsAndBays';
import { EvDiagnosticsAndParts } from '../../../components/service-manager/EvDiagnosticsAndParts';
import { ServiceAnalyticsAndSla } from '../../../components/service-manager/ServiceAnalyticsAndSla';
import { ServiceModalsAndDrawers } from '../../../components/service-manager/ServiceModalsAndDrawers';
import { ServiceVehiclesView } from '../../../components/service-manager/ServiceVehiclesView';
import { ServiceQualityControlView } from '../../../components/service-manager/ServiceQualityControlView';
import { ServiceCustomersView } from '../../../components/service-manager/ServiceCustomersView';
import { ServiceRequestsView } from '../../../components/service-manager/ServiceRequestsView';
import { ServiceReportsView } from '../../../components/service-manager/ServiceReportsView';
import { ServiceNotificationsView } from '../../../components/service-manager/ServiceNotificationsView';
import { ServiceSettingsView } from '../../../components/service-manager/ServiceSettingsView';
import { ServiceProfileView } from '../../../components/service-manager/ServiceProfileView';
import { ServiceKypView } from '../../../components/service-manager/ServiceKypView';
import { ServiceAppointmentsView } from '../../../components/service-manager/ServiceAppointmentsView';
import { ServiceBaysView } from '../../../components/service-manager/ServiceBaysView';

import { ApiGateway } from '../../../lib/api-client';

function ServiceManagerDashboardContent() {
  const { currentProfile } = useRole();
  const searchParams = useSearchParams();
  const activeModule = searchParams ? searchParams.get('module') : null;

  // Master State
  const [tickets, setTickets] = useState<ServiceTicket[]>(mockServiceTickets);
  const [technicians, setTechnicians] = useState<Technician[]>(mockTechnicians);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('tkt_101');
  const [currentCenter, setCurrentCenter] = useState<string>('Vizag Service Center');
  const [activeKpiFilter, setActiveKpiFilter] = useState<string | null>(null);
  const [overviewTab, setOverviewTab] = useState<'all' | 'kyp' | 'techs' | 'analytics'>('all');

  // Modal State
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Fetch live technicians on mount
  useEffect(() => {
    ApiGateway.getTechnicians().then((liveTechs) => {
      if (liveTechs && liveTechs.length > 0) {
        setTechnicians(liveTechs);
      }
    });
  }, []);

  // Assign job handler connected to FastAPI Backend API
  const handleAssignJob = async (ticketId: string, techName: string) => {
    // Optimistic UI state update
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, assignedTechnician: techName, status: 'TECHNICIAN_ASSIGNED' } : t))
    );

    // Resolve technician ID
    const targetTech = technicians.find((tech) => tech.name === techName || tech.id === techName);
    const techId = targetTech ? targetTech.id : 'tech_1';

    // Call live FastAPI assignment endpoint
    await ApiGateway.assignTechnician(techId, ticketId);
  };

  // Update job status handler connected to FastAPI Backend API
  const handleUpdateJobStatus = async (ticketId: string, newStatus: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus as any } : t))
    );
    await ApiGateway.updateJobStatus(ticketId, newStatus);
  };

  // Add new ticket handler
  const handleCreateNewTicket = (ticketData: any) => {
    const newTkt: ServiceTicket = {
      id: `tkt_${Date.now()}`,
      ticketNumber: `BK-2026-0${tickets.length + 1}`,
      customerName: ticketData.customerName,
      customerPhone: ticketData.customerPhone,
      vehicleModel: ticketData.vehicleModel,
      registrationNumber: ticketData.registrationNumber,
      serviceType: ticketData.serviceType,
      status: 'PENDING',
      aiSuggestedFault: ticketData.aiSuggestedFault,
      aiEstimatedCost: ticketData.aiEstimatedCost,
      aiEstimatedTimeMins: ticketData.aiEstimatedTimeMins,
      location: 'Visakhapatnam Hub',
      createdAt: 'Just now',
      urgency: ticketData.urgency || 'MEDIUM',
    };

    setTickets((prev) => [newTkt, ...prev]);
    setSelectedTicketId(newTkt.id);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Top Header Command Bar (Hidden in Profile view) */}
      {activeModule !== 'profile' && (
        <ServiceManagerHeader
          currentCenter={currentCenter}
          onCenterChange={setCurrentCenter}
          onOpenQuickAction={(action) => setActiveModal(action)}
        />
      )}

      {/* Sub-module Views or Full Command Center */}
      {activeModule === 'tickets' ? (
        <div className="space-y-6">
          <ServiceDispatchWorkbench
            tickets={tickets}
            technicians={technicians}
            selectedTicketId={selectedTicketId}
            onSelectTicket={setSelectedTicketId}
            onAssignJob={handleAssignJob}
          />
        </div>
      ) : activeModule === 'dispatch' ? (
        <div className="space-y-6">
          <TechnicianControlCenter technicians={technicians} />
        </div>
      ) : activeModule === 'vehicles' ? (
        <div className="space-y-6">
          <ServiceVehiclesView />
        </div>
      ) : activeModule === 'active-jobs' ? (
        <div className="space-y-6" key="active-jobs">
          <ServiceJobBoard tickets={tickets} onUpdateJobStatus={handleUpdateJobStatus} />
        </div>
      ) : activeModule === 'appointments' ? (
        <div className="space-y-6" key="appointments">
          <ServiceAppointmentsView />
        </div>
      ) : activeModule === 'bays' ? (
        <div className="space-y-6" key="bays">
          <ServiceBaysView />
        </div>
      ) : activeModule === 'diagnostics' ? (
        <div className="space-y-6" key="diagnostics">
          <EvDiagnosticsAndParts viewMode="diagnostics" />
        </div>
      ) : activeModule === 'parts' ? (
        <div className="space-y-6" key="parts">
          <EvDiagnosticsAndParts viewMode="parts" />
        </div>
      ) : activeModule === 'qc' ? (
        <div className="space-y-6" key="qc">
          <ServiceQualityControlView />
        </div>
      ) : activeModule === 'customers' ? (
        <div className="space-y-6" key="customers">
          <ServiceCustomersView />
        </div>
      ) : activeModule === 'requests' ? (
        <div className="space-y-6" key="requests">
          <ServiceRequestsView />
        </div>
      ) : activeModule === 'performance' ? (
        <div className="space-y-6" key="performance">
          <ServiceAnalyticsAndSla />
        </div>
      ) : activeModule === 'reports' ? (
        <div className="space-y-6" key="reports">
          <ServiceReportsView />
        </div>
      ) : activeModule === 'notifications' ? (
        <div className="space-y-6" key="notifications">
          <ServiceNotificationsView />
        </div>
      ) : activeModule === 'settings' ? (
        <div className="space-y-6" key="settings">
          <ServiceSettingsView />
        </div>
      ) : activeModule === 'profile' ? (
        <div className="space-y-6" key="profile">
          <ServiceProfileView />
        </div>
      ) : activeModule === 'kyp' ? (
        <div className="space-y-6" key="kyp">
          <ServiceKypView />
        </div>
      ) : (
        /* Default Full Command Center Overview — Uncluttered & Spacious Layout */
        <div className="space-y-7">
          {/* 1. KPI Row */}
          <ServiceKpiGrid
            onSelectKpiFilter={(filterKey) =>
              setActiveKpiFilter(activeKpiFilter === filterKey ? null : filterKey)
            }
            activeFilter={activeKpiFilter}
          />

          {/* 2. Needs Attention Critical Bar */}
          <NeedsAttentionAlerts
            onSelectAlert={(type, id) => {
              if (type === 'CRITICAL_DIAGNOSTIC') {
                setSelectedTicketId('tkt_103');
                setActiveModal('inspect-ticket');
              } else if (type === 'SLA_RISK') {
                setActiveModal('view-job-progress');
              } else if (type === 'PARTS_BLOCKER') {
                setActiveModal('parts-request');
              }
            }}
          />

          {/* 3. Spacious Overview Operational Hub Filter Bar */}
          <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setOverviewTab('all')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  overviewTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ Dispatch & Job Board
              </button>

              <button
                type="button"
                onClick={() => setOverviewTab('kyp')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  overviewTab === 'kyp'
                    ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📊 KYP — Operational Intelligence
              </button>

              <button
                type="button"
                onClick={() => setOverviewTab('techs')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  overviewTab === 'techs'
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👥 Technicians & Service Bays
              </button>

              <button
                type="button"
                onClick={() => setOverviewTab('analytics')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  overviewTab === 'analytics'
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📊 Diagnostics & SLA Analytics
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-medium px-2">
              Viewing <span className="font-extrabold text-slate-700">{currentCenter}</span> Command Stream
            </div>
          </div>

          {/* 4. Tab Content View */}
          {overviewTab === 'all' && (
            <div className="space-y-7 animate-in fade-in duration-200">
              {/* Main Workbench (Ticket Queue + AI Advisor + AI Dispatcher) */}
              <ServiceDispatchWorkbench
                tickets={tickets}
                technicians={technicians}
                selectedTicketId={selectedTicketId}
                onSelectTicket={setSelectedTicketId}
                onAssignJob={handleAssignJob}
              />

              {/* Live Service Job Board */}
              <ServiceJobBoard tickets={tickets} onUpdateJobStatus={handleUpdateJobStatus} />
            </div>
          )}

          {overviewTab === 'kyp' && (
            <div className="space-y-7 animate-in fade-in duration-200" key="overview-kyp">
              <ServiceKypView />
            </div>
          )}

          {overviewTab === 'techs' && (
            <div className="space-y-7 animate-in fade-in duration-200">
              {/* Technician Status Control Center */}
              <TechnicianControlCenter technicians={technicians} />

              {/* Today's Appointments & Service Bays */}
              <AppointmentsAndBays />
            </div>
          )}

          {overviewTab === 'analytics' && (
            <div className="space-y-7 animate-in fade-in duration-200">
              {/* EV Diagnostics & Parts Inventory */}
              <EvDiagnosticsAndParts />

              {/* Service Performance Analytics & SLA */}
              <ServiceAnalyticsAndSla />
            </div>
          )}
        </div>
      )}

      {/* Global Modals & Drawers */}
      <ServiceModalsAndDrawers
        activeModal={activeModal}
        onCloseModal={() => setActiveModal(null)}
        onSubmitNewTicket={handleCreateNewTicket}
      />
    </div>
  );
}

export default function ServiceManagerDashboard() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-xs text-slate-500 font-bold bg-[#F7F9FC] min-h-screen">
          Loading Service Operations Command Center...
        </div>
      }
    >
      <ServiceManagerDashboardContent />
    </Suspense>
  );
}
