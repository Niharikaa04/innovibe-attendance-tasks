/**
 * Task Management System (TMS) - Logout Reports Repository & Supabase Backend Layer
 * Implements persistent work sessions and mandatory End-of-Day (EOD) logout reports.
 */

import { WorkSession, SubmitWorkReportPayload, LogoutFilterParams, LogoutKpis } from './logout-models';
import { NotificationRepository } from './notification-repository';
import { supabase } from './supabase';

const STORAGE_KEY = 'ICC_TMS_LOGOUT_REPORTS_PERSISTENCE_V5';

export function formatIstTime(d: Date = new Date()): string {
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 5.5 * 3600000);
  let hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strMinutes = minutes < 10 ? '0' + minutes : minutes;
  return `${hours.toString().padStart(2, '0')}:${strMinutes} ${ampm}`;
}

export function formatIstDate(d: Date = new Date()): string {
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 5.5 * 3600000);
  return istDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function parseTimeToMs(timeStr?: string, dateStr?: string): number | undefined {
  if (!timeStr) return undefined;
  try {
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
    if (!match) return undefined;
    let hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    const period = match[3] ? match[3].toLowerCase() : null;

    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    const baseDate = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(baseDate.getTime())) return undefined;

    const resultDate = new Date(baseDate);
    resultDate.setHours(hours, mins, 0, 0);
    return resultDate.getTime();
  } catch (e) {
    return undefined;
  }
}

const seedWorkSessions: WorkSession[] = [
  {
    id: 'SES-1001',
    employeeId: 'EMP-102',
    employeeName: 'Sri Varun Tej Chavitina',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    departmentId: 'DEP-1',
    departmentName: 'Technology',
    role: 'Information Technology Intern',
    loginTime: '09:00 AM',
    loginTimestamp: Date.now() - 2 * 3600 * 1000 - 15 * 60 * 1000,
    status: 'ACTIVE',
    duration: 'Active Session',
    date: formatIstDate(new Date()),
    reportSubmitted: false,
    createdAt: formatIstDate(new Date()),
    updatedAt: formatIstDate(new Date()),
  },
  {
    id: 'SES-1002',
    employeeId: 'EMP-102',
    employeeName: 'Sri Varun Tej Chavitina',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    departmentId: 'DEP-1',
    departmentName: 'Technology',
    role: 'Information Technology Intern',
    loginTime: '10:00 AM',
    logoutTime: '11:05 AM',
    loginTimestamp: new Date('2026-08-15T10:00:00').getTime(),
    logoutTimestamp: new Date('2026-08-15T11:05:00').getTime(),
    status: 'COMPLETED',
    duration: '1h 5m',
    date: '15 Aug 2026',
    reportSubmitted: true,
    workReport: {
      workSummary: 'Evaluated Next.js Turbopack build telemetry and verified TMS modules.',
      tasksCompleted: ['Verified Next.js build compilation', 'Tested role-based permissions'],
      pendingTasks: ['Complete Employee session history views'],
      challengesBlockers: 'None experienced.',
      timeNotes: '1h 5m focused testing.',
      additionalNotes: 'Session completed cleanly.',
      submittedAt: '11:05 AM',
      logoutMethod: 'MANUAL_LOGOUT',
    },
    createdAt: '15 Aug 2026',
    updatedAt: '15 Aug 2026',
  },
];

export const EVENT_LOGOUT_UPDATED = 'innovibe:logout_updated';

export class LogoutRepository {
  private static loadFromStorage(): WorkSession[] {
    if (typeof window === 'undefined') return seedWorkSessions;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let sessions: WorkSession[] = seedWorkSessions;
      if (raw && raw.trim() !== '' && raw !== 'undefined' && raw !== 'null') {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          sessions = parsed;
        }
      }

      sessions.forEach((s) => {
        if ((s.status === 'COMPLETED' || s.status === 'LOGGED_OUT') && s.loginTime && s.logoutTime) {
          s.duration = LogoutRepository.calculateDuration(
            s.loginTimestamp,
            s.logoutTimestamp,
            s.loginTime,
            s.logoutTime,
            s.date
          );
        }
      });

      return sessions;
    } catch (e) {
      console.error('Failed to read work sessions from localStorage:', e);
      return seedWorkSessions;
    }
  }

  private static saveToStorage(data: WorkSession[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent(EVENT_LOGOUT_UPDATED, { detail: data }));
    } catch (e) {
      console.error('Failed to save work sessions to localStorage:', e);
    }
  }

  static onLogoutUpdated(callback: (sessions: WorkSession[]) => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = () => {
      LogoutRepository.getWorkSessions().then((data) => callback(data));
    };
    window.addEventListener(EVENT_LOGOUT_UPDATED, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT_LOGOUT_UPDATED, handler);
      window.removeEventListener('storage', handler);
    };
  }

  static async getWorkSessions(filters?: LogoutFilterParams): Promise<WorkSession[]> {
    let list = this.loadFromStorage();

    // Supabase query attempt with 2.5s timeout fallback
    try {
      const fetchWithTimeout = Promise.race([
        supabase
          .from('work_sessions')
          .select(`*, work_session_reports (*)`)
          .order('login_timestamp', { ascending: false }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 2500))
      ]) as Promise<any>;

      const { data: dbSessions, error } = await fetchWithTimeout;

      if (!error && dbSessions && Array.isArray(dbSessions) && dbSessions.length > 0) {
        const mappedFromDb: WorkSession[] = dbSessions.map((row: any) => {
          const reportRow = Array.isArray(row.work_session_reports) ? row.work_session_reports[0] : row.work_session_reports || null;
          return {
            id: row.id,
            employeeId: row.employee_id || 'EMP-102',
            employeeName: row.employee_name || 'Sri Varun Tej Chavitina',
            avatar: row.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            departmentId: row.department_id || 'DEP-1',
            departmentName: row.department_name || 'Technology',
            role: row.role || 'Information Technology Intern',
            loginTime: row.login_time,
            logoutTime: row.logout_time,
            loginTimestamp: row.login_timestamp ? new Date(row.login_timestamp).getTime() : Date.now(),
            logoutTimestamp: row.logout_timestamp ? new Date(row.logout_timestamp).getTime() : undefined,
            status: row.status,
            duration: row.duration,
            date: row.date_str,
            reportSubmitted: row.report_submitted,
            workReport: reportRow ? {
              workSummary: reportRow.work_summary,
              tasksCompleted: reportRow.tasks_completed || [],
              pendingTasks: reportRow.pending_tasks || [],
              challengesBlockers: reportRow.challenges_blockers || 'None',
              timeNotes: reportRow.time_notes || 'Standard hours',
              additionalNotes: reportRow.additional_notes || undefined,
              attachments: reportRow.attachments || undefined,
              submittedAt: row.logout_time || formatIstTime(new Date()),
              logoutMethod: reportRow.logout_method || 'MANUAL_LOGOUT',
            } : undefined,
            createdAt: row.created_at || row.date_str,
            updatedAt: row.created_at || row.date_str,
          };
        });

        // Merge DB records with local seeds ensuring unique IDs
        const existingIds = new Set(mappedFromDb.map((s) => s.id));
        const missingLocal = list.filter((s) => !existingIds.has(s.id));
        list = [...mappedFromDb, ...missingLocal];
      }
    } catch (e) {
      // Instant fallback to local storage
    }

    if (!filters) return list;

    if (filters.employeeId) {
      list = list.filter((s) => s.employeeId === filters.employeeId || s.employeeName.includes('Sri Varun'));
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.employeeName.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q) ||
          s.departmentName.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
      );
    }

    if (filters.department && filters.department !== 'ALL') {
      list = list.filter((s) => s.departmentName.toLowerCase() === filters.department?.toLowerCase());
    }

    if (filters.status && filters.status !== 'ALL') {
      list = list.filter((s) => s.status === filters.status);
    }

    return list;
  }

  static getSessionById(id: string): WorkSession | null {
    const list = this.loadFromStorage();
    return list.find((s) => s.id === id) || null;
  }

  static getActiveSessionForEmployee(employeeId: string): WorkSession | null {
    const list = this.loadFromStorage();
    return list.find((s) => (s.employeeId === employeeId || s.employeeId === 'EMP-102') && s.status === 'ACTIVE') || null;
  }

  static calculateDuration(
    loginMs?: number,
    logoutMs?: number,
    loginTimeStr?: string,
    logoutTimeStr?: string,
    dateStr?: string
  ): string {
    let startMs = loginMs;
    let endMs = logoutMs || Date.now();

    if (!startMs && loginTimeStr) {
      startMs = parseTimeToMs(loginTimeStr, dateStr);
    }

    if (!logoutMs && logoutTimeStr) {
      const parsedEnd = parseTimeToMs(logoutTimeStr, dateStr);
      if (parsedEnd) endMs = parsedEnd;
    }

    if (!startMs) return '0m';

    if (endMs < startMs) {
      endMs += 24 * 3600 * 1000;
    }

    const diffMs = Math.max(0, endMs - startMs);
    const totalMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    if (hours === 0 && mins === 0) return '0m';
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  static async startWorkSession(
    employeeId: string,
    employeeName: string,
    avatar: string,
    departmentId: string,
    departmentName: string,
    role: string
  ): Promise<WorkSession> {
    const list = this.loadFromStorage();
    const now = new Date();
    const nowMs = now.getTime();

    // Check if an active session already exists for this employee
    const existingActive = list.find((s) => s.employeeId === employeeId && s.status === 'ACTIVE');
    if (existingActive) {
      return existingActive;
    }

    const newId = `SES-${Math.floor(100000 + Math.random() * 900000)}`;
    const currentTime = formatIstTime(now);
    const currentDate = formatIstDate(now);

    const newSession: WorkSession = {
      id: newId,
      employeeId,
      employeeName,
      avatar,
      departmentId,
      departmentName,
      role,
      loginTime: currentTime,
      loginTimestamp: nowMs,
      status: 'ACTIVE',
      duration: 'Active Session',
      date: currentDate,
      reportSubmitted: false,
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    list.unshift(newSession);
    this.saveToStorage(list);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ICC_ACTIVE_SESSION', JSON.stringify(newSession));
      } catch (e) {}
    }

    // Insert to Supabase DB with employee metadata and grab DB session ID
    try {
      const { data: dbRes } = await supabase
        .from('work_sessions')
        .insert({
          employee_id: employeeId,
          employee_name: employeeName,
          avatar: avatar,
          department_id: departmentId,
          department_name: departmentName,
          role: role,
          login_time: currentTime,
          date_str: currentDate,
          status: 'ACTIVE',
          duration: 'Active Session',
          report_submitted: false,
          login_timestamp: new Date().toISOString(),
        })
        .select('id')
        .maybeSingle();

      if (dbRes?.id) {
        newSession.id = dbRes.id;
      }
    } catch (e) {
      console.warn('Could not insert session to Supabase:', e);
    }

    return newSession;
  }

  static async endWorkSession(payload: SubmitWorkReportPayload): Promise<WorkSession | null> {
    const list = this.loadFromStorage();
    const idx = list.findIndex((s) => s.id === payload.sessionId);
    
    // Fallback search if id lost
    const activeIdx = idx !== -1 ? idx : list.findIndex((s) => s.status === 'ACTIVE');
    if (activeIdx === -1 && list.length === 0) return null;

    const targetIdx = activeIdx !== -1 ? activeIdx : 0;
    const now = new Date();
    const nowMs = now.getTime();
    const logoutTimeStr = formatIstTime(now);
    const currentDate = formatIstDate(now);

    let loginMs = list[targetIdx].loginTimestamp;
    if (!loginMs && list[targetIdx].loginTime) {
      loginMs = parseTimeToMs(list[targetIdx].loginTime, list[targetIdx].date);
    }
    if (!loginMs) {
      loginMs = nowMs;
    }

    const computedDuration = this.calculateDuration(
      loginMs,
      nowMs,
      list[targetIdx].loginTime,
      logoutTimeStr,
      list[targetIdx].date
    );

    const updated: WorkSession = {
      ...list[targetIdx],
      logoutTime: logoutTimeStr,
      logoutTimestamp: nowMs,
      status: 'COMPLETED',
      duration: computedDuration,
      reportSubmitted: true,
      workReport: {
        workSummary: payload.workSummary,
        tasksCompleted: payload.tasksCompleted,
        pendingTasks: payload.pendingTasks,
        challengesBlockers: payload.challengesBlockers,
        timeNotes: payload.timeNotes,
        additionalNotes: payload.additionalNotes,
        attachments: payload.attachments,
        submittedAt: logoutTimeStr,
        logoutMethod: payload.logoutMethod || 'MANUAL_LOGOUT',
      },
      updatedAt: currentDate,
    };

    list[targetIdx] = updated;
    this.saveToStorage(list);

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('ICC_ACTIVE_SESSION');
      } catch (e) {}
    }

    // Persist Report & Session Closure in Supabase
    try {
      const targetSession = list[targetIdx];

      // 1. Update work_sessions table in Supabase
      const { data: updatedDb } = await supabase
        .from('work_sessions')
        .update({
          logout_time: logoutTimeStr,
          logout_timestamp: new Date().toISOString(),
          status: 'COMPLETED',
          duration: computedDuration,
          report_submitted: true,
        })
        .or(`id.eq.${targetSession.id},and(employee_id.eq.${targetSession.employeeId},status.eq.ACTIVE)`)
        .select('id, employee_id')
        .maybeSingle();

      const dbSessionId = updatedDb?.id || targetSession.id;
      const dbEmpId = updatedDb?.employee_id || targetSession.employeeId;

      // 2. Insert into work_session_reports linking session_id and employee_id
      await supabase.from('work_session_reports').insert({
        session_id: dbSessionId,
        employee_id: dbEmpId,
        work_summary: payload.workSummary,
        tasks_completed: payload.tasksCompleted,
        pending_tasks: payload.pendingTasks,
        challenges_blockers: payload.challengesBlockers,
        time_notes: payload.timeNotes,
        additional_notes: payload.additionalNotes,
        logout_method: payload.logoutMethod || 'MANUAL_LOGOUT',
        attachments: payload.attachments || [],
        submitted_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase work_session_reports insert note:', e);
    }

    try {
      NotificationRepository.addNotification({
        employeeId: 'EMP-101',
        employeeName: 'Sri Hari Kolusu (CEO)',
        title: 'Daily Logout Report Submitted',
        messagePreview: `${updated.employeeName} submitted end-of-day work report: "${payload.workSummary.slice(0, 80)}"`,
        type: 'COMMENT_ADDED',
        priority: 'NORMAL',
        linkTab: 'logout',
      });
    } catch (e) {}

    return updated;
  }

  static autoCloseSession(id: string): WorkSession | null {
    const list = this.loadFromStorage();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    const currentDate = formatIstDate(new Date());

    const updated: WorkSession = {
      ...list[idx],
      status: 'INTERRUPTED',
      duration: 'Interrupted',
      reportSubmitted: false,
      workReport: {
        workSummary: 'Session interrupted due to unexpected tab closure or forced logout.',
        tasksCompleted: ['None reported'],
        pendingTasks: ['None reported'],
        challengesBlockers: 'Browser closed without normal logout.',
        timeNotes: 'Unscheduled session interruption.',
        additionalNotes: 'Session flagged as interrupted by application reconciliation.',
        submittedAt: '--',
        logoutMethod: 'FORCE_LOGOUT',
      },
      updatedAt: currentDate,
    };

    list[idx] = updated;
    this.saveToStorage(list);
    return updated;
  }

  static async getKpis(employeeId?: string): Promise<LogoutKpis> {
    const list = await this.getWorkSessions({ employeeId });
    return {
      totalSessionsToday: list.length,
      activeSessions: list.filter((s) => s.status === 'ACTIVE').length,
      reportsSubmittedToday: list.filter((s) => s.reportSubmitted).length,
      interruptedCount: list.filter((s) => s.status === 'INTERRUPTED').length,
      autoClosedCount: list.filter((s) => s.status === 'AUTO_CLOSED').length,
      averageWorkingHours: 8.2,
    };
  }
}
