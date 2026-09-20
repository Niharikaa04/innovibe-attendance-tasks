'use client';

import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Database,
  Inbox,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react';

export function ServiceNotificationsView() {
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'CRITICAL' | 'OPERATIONS'>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [notifications, setNotifications] = useState([
    {
      id: 'notif_01',
      title: 'Battery Thermal Anomaly Alarm (AP39EF9012)',
      description: 'Vehicle BMS registered 68°C thermal spike. Automated cool-down protocol engaged.',
      time: '5 mins ago',
      category: 'CRITICAL',
      unread: true,
      icon: Flame,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      id: 'notif_02',
      title: 'SLA Overdue Warning — Ticket #BK-2026-0003',
      description: 'Service turnaround time exceeded target SLA by 35 mins. Manager action required.',
      time: '18 mins ago',
      category: 'OPERATIONS',
      unread: true,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      id: 'notif_03',
      title: 'Low Parts Stock Alert — Motor Controller (72V)',
      description: 'Central depot inventory dropped to 5 units (Reorder threshold: 10 units).',
      time: '42 mins ago',
      category: 'OPERATIONS',
      unread: true,
      icon: Database,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      id: 'notif_04',
      title: 'New Emergency Roadside Request #REQ-901',
      description: 'Customer Suresh Varma requested roadside assistance near Beach Road, Visakhapatnam.',
      time: '1 hour ago',
      category: 'OPERATIONS',
      unread: false,
      icon: Inbox,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast('All notifications marked as read!');
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'UNREAD') return n.unread;
    if (filterType === 'CRITICAL') return n.category === 'CRITICAL';
    if (filterType === 'OPERATIONS') return n.category === 'OPERATIONS';
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="space-y-5 text-left font-sans relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Operational System Notifications & Alerts Feed
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Real-time alerts for EV thermal anomalies, SLA overdues, low spare parts stock, and incoming service requests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Mark All Read</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs font-bold">
          {(['ALL', 'UNREAD', 'CRITICAL', 'OPERATIONS'] as const).map((ft) => (
            <button
              key={ft}
              type="button"
              onClick={() => setFilterType(ft)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-colors cursor-pointer ${
                filterType === ft ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {ft} {ft === 'UNREAD' && unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Roster */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-xs font-bold text-slate-500">
            No notifications matching current filter.
          </div>
        ) : (
          filteredNotifs.map((notif) => {
            const Icon = notif.icon;

            return (
              <div
                key={notif.id}
                onClick={() => handleToggleRead(notif.id)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  notif.unread
                    ? 'bg-white border-amber-300 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200/80 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`h-10 w-10 rounded-2xl border flex items-center justify-center shrink-0 ${notif.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900">{notif.title}</h3>
                      {notif.unread && (
                        <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{notif.description}</p>
                    <span className="text-[10px] text-slate-400 font-bold block pt-1">{notif.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleRead(notif.id);
                    }}
                    className="text-[10px] font-extrabold text-slate-500 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg"
                  >
                    {notif.unread ? 'Mark Read' : 'Unread'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
