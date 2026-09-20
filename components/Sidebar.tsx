'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useRole } from './RoleContext';
import { RoleType } from '../lib/types';
import {
  LayoutDashboard,
  CheckSquare,
  TrendingUp,
  Activity,
  BarChart3,
  Bot,
  AlertTriangle,
  AlertOctagon,
  Zap,
  MessageSquare,
  FileText,
  ShieldCheck,
  Shield,
  Crown,
  ChevronDown,
  ChevronRight,
  Lock,
  Layers,
  Code,
  Wrench,
  Users,
  Truck,
  Compass,
  Sparkles,
  Briefcase,
  UserCheck,
  ClipboardList,
  Clock,
  CalendarRange,
  IndianRupee,
  Award,
  GraduationCap,
  FolderOpen,
  Contact,
  Calendar,
  DoorOpen,
  Bell,
  Settings,
  CheckCircle2,
  Database,
  Camera,
  Volume2,
  User,
  HelpCircle,
  ClipboardCheck,
  Inbox,
} from 'lucide-react';

interface SubmenuItem {
  name: string;
  path: string;
  exactQuery: string;
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  badge?: string;
  badgeType?: 'default' | 'live' | 'rbac' | 'beta';
  exactQuery?: string;
  color?: string;
  isExpandable?: boolean;
  children?: SubmenuItem[];
}

interface NavCategory {
  title: string;
  items: NavItem[];
}

interface WorkspaceConfig {
  workspaceTitle: string;
  categories: NavCategory[];
}

const tmsSubmenuItems: SubmenuItem[] = [
  { name: 'Dashboard', path: '/dashboard/ceo?module=tms-dashboard', exactQuery: 'tms-dashboard' },
  { name: 'Tasks', path: '/dashboard/ceo?module=tms-tasks', exactQuery: 'tms-tasks' },
  { name: 'Attendance', path: '/dashboard/ceo?module=tms-attendance', exactQuery: 'tms-attendance' },
  { name: 'Departments', path: '/dashboard/ceo?module=tms-departments', exactQuery: 'tms-departments' },
  { name: 'Employees', path: '/dashboard/ceo?module=tms-employees', exactQuery: 'tms-employees' },
  { name: 'Leave Approvals', path: '/dashboard/ceo?module=tms-leave-approvals', exactQuery: 'tms-leave-approvals' },
  { name: 'Reports', path: '/dashboard/ceo?module=tms-reports', exactQuery: 'tms-reports' },
  { name: 'Logout Reports', path: '/dashboard/ceo?module=tms-logout-reports', exactQuery: 'tms-logout-reports' },
  { name: 'Announcements', path: '/dashboard/ceo?module=tms-announcements', exactQuery: 'tms-announcements' },
  { name: 'Notifications', path: '/dashboard/ceo?module=tms-notifications', exactQuery: 'tms-notifications' },
  { name: 'Settings', path: '/dashboard/ceo?module=tms-settings', exactQuery: 'tms-settings' },
];

const roleNavigationMap: Record<RoleType, WorkspaceConfig> = {
  CEO: {
    workspaceTitle: 'CEO Executive Suite',
    categories: [
      {
        title: 'EXECUTIVE SUITE',
        items: [
          { name: 'Executive Overview', path: '/dashboard/ceo', icon: LayoutDashboard },
          {
            name: 'TMS',
            path: '/dashboard/ceo?module=tms-dashboard',
            icon: CheckSquare,
            badge: 'HR',
            badgeType: 'live',
            isExpandable: true,
            children: tmsSubmenuItems,
          },
          { name: 'Business Performance', path: '/dashboard/ceo?module=business-performance', exactQuery: 'business-performance', icon: TrendingUp },
          { name: 'Fleet Intelligence', path: '/dashboard/ceo?module=fleet-intelligence', exactQuery: 'fleet-intelligence', icon: Activity },
          { name: 'Department Performance', path: '/dashboard/ceo?module=department-performance', exactQuery: 'department-performance', icon: BarChart3 },
        ],
      },
      {
        title: 'OPERATIONS & INTELLIGENCE',
        items: [
          { name: 'AI Command Center', path: '/dashboard/ai-command', icon: Bot, badge: 'Beta', badgeType: 'beta' },
          { name: 'Alerts & Risk Center', path: '/dashboard/ceo?module=alerts-risk', exactQuery: 'alerts-risk', icon: AlertTriangle, badge: 'Live', badgeType: 'live' },
          { name: 'Action Center', path: '/dashboard/ceo?module=action-center', exactQuery: 'action-center', icon: Zap },
          { name: 'Communication Hub', path: '/dashboard/ceo?module=communication-hub', exactQuery: 'communication-hub', icon: MessageSquare },
        ],
      },
      {
        title: 'GOVERNANCE & CONTROL',
        items: [
          { name: 'Reports & Analytics', path: '/dashboard/ceo?module=reports-analytics', exactQuery: 'reports-analytics', icon: FileText },
          { name: 'Role Access & Settings', path: '/dashboard/roles', icon: ShieldCheck, badge: 'RBAC', badgeType: 'rbac' },
        ],
      },
    ],
  },
  COO: {
    workspaceTitle: 'COO Operations Suite',
    categories: [
      {
        title: 'Core Operations',
        items: [
          { name: 'Operations Overview', path: '/dashboard/coo', icon: Activity, color: 'text-blue-600' },
          { name: 'Fleet Telematics', path: '/dashboard/coo?module=fleet-telematics', exactQuery: 'fleet-telematics', icon: Truck, color: 'text-emerald-600' },
          { name: 'Service & Maintenance', path: '/dashboard/coo?module=service-maintenance', exactQuery: 'service-maintenance', icon: Wrench, color: 'text-amber-600' },
          { name: 'Resource Allocation', path: '/dashboard/coo?module=resource-allocation', exactQuery: 'resource-allocation', icon: Users, color: 'text-purple-600' },
        ],
      },
      {
        title: 'Management & AI',
        items: [
          { name: 'AI Command Suite', path: '/dashboard/ai-command', icon: Bot, badge: 'AI', color: 'text-sky-600' },
          { name: 'Live Tracking Map', path: '/dashboard/coo?module=live-map', exactQuery: 'live-map', icon: Compass, color: 'text-indigo-600' },
          { name: 'Role Management', path: '/dashboard/roles', icon: ShieldCheck, color: 'text-rose-600' },
        ],
      },
    ],
  },
  CTO: {
    workspaceTitle: 'CTO Technology Workspace',
    categories: [
      {
        title: 'Software & Engineering',
        items: [
          { name: 'Technology Dashboard', path: '/dashboard/cto', icon: BarChart3, color: 'text-purple-600' },
          { name: 'Software Development', path: '/dashboard/cto?module=software-development', exactQuery: 'software-development', icon: Code, color: 'text-emerald-600' },
          { name: 'Telematics Overview', path: '/dashboard/cto?module=telematics', exactQuery: 'telematics', icon: Zap, color: 'text-amber-500' },
          { name: 'Sprint Management', path: '/dashboard/cto?module=sprint-management', exactQuery: 'sprint-management', icon: ClipboardList, color: 'text-emerald-600' },
          { name: 'Cybersecurity', path: '/dashboard/cto?module=cybersecurity', exactQuery: 'cybersecurity', icon: ShieldCheck, color: 'text-red-500' },
          { name: 'Integrations', path: '/dashboard/cto?module=integrations', exactQuery: 'integrations', icon: Layers, color: 'text-blue-600' },
        ],
      },
      {
        title: 'Governance & Analytics',
        items: [
          { name: 'Reports & Analytics', path: '/dashboard/cto?module=reports-analytics', exactQuery: 'reports-analytics', icon: FileText, color: 'text-purple-600' },
          { name: 'Notifications', path: '/dashboard/cto?module=notifications', exactQuery: 'notifications', icon: Bell, badge: '3', color: 'text-amber-500' },
          { name: 'AI Command Suite', path: '/dashboard/ai-command', icon: Bot, badge: 'n8n', color: 'text-sky-600' },
        ],
      },
    ],
  },
  HR: {
    workspaceTitle: 'HR Management Suite',
    categories: [
      {
        title: 'Core HR',
        items: [
          { name: 'HR Overview', path: '/dashboard/hr?view=dashboard', exactQuery: 'dashboard', icon: LayoutDashboard, color: 'text-pink-600' },
          { name: 'Employee Directory', path: '/dashboard/hr?view=employees', exactQuery: 'employees', icon: Users, color: 'text-blue-600' },
          { name: 'Attendance Matrix', path: '/dashboard/hr?view=attendance', exactQuery: 'attendance', icon: Clock, color: 'text-emerald-600' },
          { name: 'Leave Management', path: '/dashboard/hr?view=leaves', exactQuery: 'leaves', icon: CalendarRange, color: 'text-amber-600' },
          { name: 'Payroll Engine', path: '/dashboard/hr?view=payroll', exactQuery: 'payroll', icon: IndianRupee, color: 'text-purple-600' },
        ],
      },
      {
        title: 'Talent & Operations',
        items: [
          { name: 'Recruitment & Hiring', path: '/dashboard/hr?view=recruitment', exactQuery: 'recruitment', icon: Briefcase, color: 'text-indigo-600' },
          { name: 'Performance Review', path: '/dashboard/hr?view=performance', exactQuery: 'performance', icon: Award, color: 'text-yellow-600' },
          { name: 'Training & Skill Badges', path: '/dashboard/hr?view=training', exactQuery: 'training', icon: GraduationCap, color: 'text-teal-600' },
          { name: 'Documents & Contracts', path: '/dashboard/hr?view=documents', exactQuery: 'documents', icon: FolderOpen, color: 'text-rose-600' },
        ],
      },
    ],
  },
  TECHNICIAN: {
    workspaceTitle: 'Technician Portal',
    categories: [
      {
        title: 'Field Operations',
        items: [
          { name: 'Technician Dashboard', path: '/dashboard/technician?view=overview', exactQuery: 'overview', icon: Wrench, color: 'text-teal-600' },
          { name: 'My Assigned Tasks', path: '/dashboard/technician?view=tasks', exactQuery: 'tasks', icon: CheckSquare, color: 'text-blue-600' },
          { name: 'Service Checklists', path: '/dashboard/technician?view=checklists', exactQuery: 'checklists', icon: ClipboardList, color: 'text-teal-600' },
          { name: 'Service Completion', path: '/dashboard/technician?view=completion', exactQuery: 'completion', icon: CheckCircle2, color: 'text-green-600' },
        ],
      },
      {
        title: 'Inventory & Approvals',
        items: [
          { name: 'Spare Parts Requests', path: '/dashboard/technician?view=spares', exactQuery: 'spares', icon: Database, color: 'text-purple-600' },
          { name: 'Inventory Requests', path: '/dashboard/technician?view=inventory', exactQuery: 'inventory', icon: Layers, color: 'text-pink-600' },
          { name: 'Customer Signature', path: '/dashboard/technician?view=signature', exactQuery: 'signature', icon: UserCheck, color: 'text-emerald-700' },
          { name: 'Photo Uploads', path: '/dashboard/technician?view=photos', exactQuery: 'photos', icon: Camera, color: 'text-indigo-500' },
        ],
      },
      {
        title: 'HR & Administration',
        items: [
          { name: 'Attendance', path: '/dashboard/technician?view=attendance', exactQuery: 'attendance', icon: Clock, color: 'text-emerald-600' },
          { name: 'Leave Requests', path: '/dashboard/technician?view=leaves', exactQuery: 'leaves', icon: CalendarRange, color: 'text-rose-600' },
          { name: 'Performance Dashboard', path: '/dashboard/technician?view=performance', exactQuery: 'performance', icon: Award, color: 'text-yellow-600' },
          { name: 'Payroll', path: '/dashboard/technician?view=payroll', exactQuery: 'payroll', icon: IndianRupee, color: 'text-teal-700' },
          { name: 'Incentives', path: '/dashboard/technician?view=incentives', exactQuery: 'incentives', icon: Zap, color: 'text-amber-600' },
          { name: 'Training', path: '/dashboard/technician?view=training', exactQuery: 'training', icon: GraduationCap, color: 'text-purple-700' },
        ],
      },
      {
        title: 'Communication',
        items: [
          { name: 'Announcements', path: '/dashboard/technician?view=announcements', exactQuery: 'announcements', icon: Volume2, color: 'text-slate-500' },
          { name: 'Notifications', path: '/dashboard/technician?view=notifications', exactQuery: 'notifications', icon: Bell, color: 'text-orange-500' },
          { name: 'My Profile', path: '/dashboard/technician?view=profile', exactQuery: 'profile', icon: User, color: 'text-slate-600' },
        ],
      },
    ],
  },
  EMPLOYEE: {
    workspaceTitle: 'Employee Workspace',
    categories: [
      {
        title: 'Daily Operations',
        items: [
          { name: 'My Dashboard', path: '/dashboard/employee?view=dashboard', exactQuery: 'dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
          { name: 'My Daily Tasks', path: '/dashboard/employee?view=tasks', exactQuery: 'tasks', icon: CheckSquare, color: 'text-indigo-600' },
          { name: 'Attendance & Roster', path: '/dashboard/employee?view=attendance', exactQuery: 'attendance', icon: Clock, color: 'text-emerald-600' },
        ],
      },
      {
        title: 'Time & Reports',
        items: [
          { name: 'Leave & Time Off', path: '/dashboard/employee?view=leave', exactQuery: 'leave', icon: CalendarRange, color: 'text-amber-500' },
          { name: 'Logout Reports', path: '/dashboard/employee?view=logout-reports', exactQuery: 'logout-reports', icon: ClipboardCheck, color: 'text-violet-600' },
          { name: 'Employee Reports', path: '/dashboard/employee?view=reports', exactQuery: 'reports', icon: BarChart3, color: 'text-blue-600' },
        ],
      },
      {
        title: 'Workspace & Communication',
        items: [
          { name: 'Notice Board', path: '/dashboard/employee?view=announcements', exactQuery: 'announcements', icon: Bell, color: 'text-orange-500' },
          { name: 'Notifications', path: '/dashboard/employee?view=notifications', exactQuery: 'notifications', icon: Inbox, color: 'text-rose-500' },
          { name: 'My Profile', path: '/dashboard/employee?view=profile', exactQuery: 'profile', icon: User, color: 'text-slate-600' },
        ],
      },
      {
        title: 'TMS MANAGEMENT SUITE',
        items: [
          {
            name: 'TMS Operations & Staff',
            path: '/dashboard/ceo?module=tms-dashboard',
            icon: CheckSquare,
            badge: 'TMS',
            badgeType: 'live',
            isExpandable: true,
            children: tmsSubmenuItems,
          },
        ],
      },
    ],
  },
  SERVICE_MANAGER: {
    workspaceTitle: 'Service Operations Command Center',
    categories: [
      {
        title: 'SERVICE OPERATIONS',
        items: [
          { name: 'Service Overview', path: '/dashboard/service-manager', icon: LayoutDashboard, color: 'text-emerald-600' },
        ],
      },
      {
        title: 'SERVICE MANAGEMENT',
        items: [
          { name: 'Service Tickets', path: '/dashboard/service-manager?module=tickets', exactQuery: 'tickets', icon: ClipboardList, color: 'text-blue-600' },
          { name: 'Technician Dispatch', path: '/dashboard/service-manager?module=dispatch', exactQuery: 'dispatch', icon: UserCheck, color: 'text-indigo-600' },
          { name: 'Vehicles', path: '/dashboard/service-manager?module=vehicles', exactQuery: 'vehicles', icon: Truck, color: 'text-slate-600' },
          { name: 'Appointments', path: '/dashboard/service-manager?module=appointments', exactQuery: 'appointments', icon: Calendar, color: 'text-amber-600' },
          { name: 'Service Bays', path: '/dashboard/service-manager?module=bays', exactQuery: 'bays', icon: Layers, color: 'text-purple-600' },
        ],
      },
      {
        title: 'OPERATIONS',
        items: [
          { name: 'Active Jobs', path: '/dashboard/service-manager?module=active-jobs', exactQuery: 'active-jobs', icon: CheckSquare, color: 'text-emerald-600' },
          { name: 'EV Diagnostics', path: '/dashboard/service-manager?module=diagnostics', exactQuery: 'diagnostics', icon: Zap, color: 'text-indigo-600' },
          { name: 'Parts & Inventory', path: '/dashboard/service-manager?module=parts', exactQuery: 'parts', icon: Database, color: 'text-amber-500' },
          { name: 'Quality Control', path: '/dashboard/service-manager?module=qc', exactQuery: 'qc', icon: ShieldCheck, color: 'text-teal-600' },
        ],
      },
      {
        title: 'CUSTOMERS',
        items: [
          { name: 'Customers', path: '/dashboard/service-manager?module=customers', exactQuery: 'customers', icon: Users, color: 'text-sky-600' },
          { name: 'Service Requests', path: '/dashboard/service-manager?module=requests', exactQuery: 'requests', icon: Inbox, color: 'text-blue-500' },
        ],
      },
      {
        title: 'ANALYTICS',
        items: [
          { name: 'KYP Intelligence', path: '/dashboard/service-manager?module=kyp', exactQuery: 'kyp', icon: BarChart3, color: 'text-indigo-600', badge: 'LIVE' },
          { name: 'Service Performance', path: '/dashboard/service-manager?module=performance', exactQuery: 'performance', icon: TrendingUp, color: 'text-purple-600' },
          { name: 'Reports', path: '/dashboard/service-manager?module=reports', exactQuery: 'reports', icon: FileText, color: 'text-slate-600' },
        ],
      },
      {
        title: 'SYSTEM',
        items: [
          { name: 'Notifications', path: '/dashboard/service-manager?module=notifications', exactQuery: 'notifications', icon: Bell, color: 'text-amber-500', badge: '4' },
          { name: 'Profile', path: '/dashboard/service-manager?module=profile', exactQuery: 'profile', icon: User, color: 'text-indigo-600' },
        ],
      },
    ],
  },
};

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeRole, isSuperAdmin } = useRole();

  const getEffectiveRole = (): RoleType => {
    if (pathname.startsWith('/dashboard/hr')) return 'HR';
    if (pathname.startsWith('/dashboard/cto')) return 'CTO';
    if (pathname.startsWith('/dashboard/coo')) return 'COO';
    if (pathname.startsWith('/dashboard/service-manager')) return 'SERVICE_MANAGER';
    if (pathname.startsWith('/dashboard/technician')) return 'TECHNICIAN';
    if (pathname.startsWith('/dashboard/ceo')) return 'CEO';
    return activeRole;
  };

  const effectiveRole = getEffectiveRole();
  const currentModuleParam = searchParams ? (searchParams.get('module') || searchParams.get('view') || searchParams.get('tab')) : null;

  const currentWorkspace = roleNavigationMap[effectiveRole] || roleNavigationMap.CEO;

  // Check if current active route belongs to TMS
  const isTmsActive =
    currentModuleParam === 'tms' || (currentModuleParam ? currentModuleParam.startsWith('tms-') : false);

  const [isTmsExpanded, setIsTmsExpanded] = useState<boolean>(isTmsActive);

  useEffect(() => {
    if (isTmsActive) {
      setIsTmsExpanded(true);
    }
  }, [isTmsActive, currentModuleParam]);

  const isItemActive = (itemPath: string, exactQuery?: string) => {
    const [basePath] = itemPath.split('?');
    if (pathname !== basePath) return false;
    if (exactQuery) {
      if ((exactQuery === 'dashboard' || exactQuery === 'overview') && (!currentModuleParam || currentModuleParam === exactQuery)) {
        return true;
      }
      return currentModuleParam === exactQuery;
    }
    return !currentModuleParam;
  };

  const handleTmsParentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isTmsExpanded) {
      setIsTmsExpanded(true);
      router.push('/dashboard/ceo?module=tms-dashboard');
    } else {
      setIsTmsExpanded(!isTmsExpanded);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="w-60 bg-white border-r border-slate-200/90 h-[calc(100vh-61px)] sticky top-[61px] py-4 px-3 flex flex-col justify-between hidden md:flex text-left shrink-0 select-none overflow-y-auto">
      <div className="space-y-5">
        {/* Workspace Header */}
        <div>
          <div className="flex items-center justify-between px-2 mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 truncate">
              <Layers className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">{currentWorkspace.workspaceTitle}</span>
            </p>
            {mounted && isSuperAdmin ? (
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0" suppressHydrationWarning>
                SUPER ADMIN
              </span>
            ) : (
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 shrink-0" suppressHydrationWarning>
                {mounted ? activeRole : 'SERVICE_MANAGER'}
              </span>
            )}
          </div>
        </div>

          <div className="space-y-4">
            {currentWorkspace.categories.map((category) => (
              <div key={category.title} className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 mb-1.5">
                  {category.title}
                </p>
                <div className="space-y-1">
                  {category.items.map((item) => {
                  const Icon = item.icon;

                  if (item.isExpandable && item.children) {
                    return (
                      <div key={item.name} className="space-y-1">
                        {/* Parent Navigation Button (TMS) */}
                        <button
                          type="button"
                          onClick={handleTmsParentClick}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-apfel font-bold transition-all ${
                            isTmsActive
                              ? 'bg-gradient-to-r from-[#fef3c7] via-[#fde68a]/70 to-[#fef3c7] text-[#92400e] border border-[#fde68a]/80 shadow-2xs font-extrabold'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <Icon className={`h-4 w-4 shrink-0 ${isTmsActive ? 'text-[#d97706]' : 'text-slate-500'}`} />
                            <span className="truncate">{item.name}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.badge && (
                              <span className="font-apfel text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                                {item.badge}
                              </span>
                            )}
                            <ChevronDown
                              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                                isTmsExpanded ? 'rotate-180 text-[#d97706]' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {/* Submenu Items */}
                        {isTmsExpanded && (
                          <div className="ml-4 pl-3 border-l-2 border-amber-200/80 space-y-0.5 py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                            {item.children.map((child) => {
                              const isChildActive = currentModuleParam === child.exactQuery || (child.exactQuery === 'tms-dashboard' && currentModuleParam === 'tms');

                              return (
                                <Link
                                  key={child.name}
                                  href={child.path}
                                  className={`block px-3 py-1.5 rounded-xl text-[11px] font-apfel transition-all ${
                                    isChildActive
                                      ? 'bg-gradient-to-r from-[#fef3c7] via-[#fde68a]/90 to-[#fef3c7] text-[#92400e] font-extrabold border border-[#fde68a] shadow-2xs'
                                      : 'text-slate-500 hover:text-slate-900 hover:bg-[#fef3c7]/40 font-semibold'
                                  }`}
                                >
                                  {child.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const active = isItemActive(item.path, item.exactQuery);

                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(item.path);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group cursor-pointer ${
                        active
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm shadow-indigo-500/20 font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`h-4 w-4 shrink-0 transition-colors ${active ? 'text-white' : item.color || 'text-slate-500'}`} />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge ? (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          active
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {item.badge}
                        </span>
                      ) : (
                        !active && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Designation Privilege Status Card */}
      {mounted && isSuperAdmin ? (
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-left mt-4" suppressHydrationWarning>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-3.5 w-3.5 text-amber-600 fill-amber-600 shrink-0" />
            <span className="text-[11px] font-bold text-amber-900 truncate">Super Admin Controls</span>
          </div>
          <p className="text-[10px] text-amber-800/80 leading-normal font-medium">
            Full system permissions active across all roles and workspaces.
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-left mt-4" suppressHydrationWarning>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            <span className="text-[11px] font-bold text-slate-900 truncate">{mounted ? activeRole : 'SERVICE_MANAGER'} Workspace</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal font-medium">
            Dedicated scope navigation active for your session.
          </p>
        </div>
      )}
    </aside>
  );
}
