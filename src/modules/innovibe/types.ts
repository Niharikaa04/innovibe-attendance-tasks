// ---------------------------------------------------------------------------
// InnoVibe Attendance & Tasks — shared types
// ---------------------------------------------------------------------------

export type Role = 'ceo' | 'admin' | 'manager' | 'hr' | 'lead' | 'employee' | 'intern';

export const MANAGER_ROLES: Role[] = ['ceo', 'admin', 'manager', 'hr', 'lead'];

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url?: string | null;
  email?: string | null;
  role: Role;
}

// ------------------------------- Attendance --------------------------------

export type AttendanceStatus =
  | 'not_checked_in'
  | 'working'
  | 'checked_out'
  | 'absent'
  | 'on_leave';

export interface AttendanceRecord {
  id: string;
  user_id: string;
  work_date: string;          // YYYY-MM-DD
  check_in: string | null;    // ISO
  check_out: string | null;   // ISO
  status: AttendanceStatus;
  total_working_minutes: number;
  is_late: boolean;
  is_early_departure: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamAttendanceRow {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  role: Role;
  status: AttendanceStatus;
  check_in: string | null;
  check_out: string | null;
  total_working_minutes: number;
  is_late: boolean;
}

export interface AttendanceOverview {
  total_employees: number;
  present: number;
  working: number;
  checked_out: number;
  absent: number;
  late_arrivals: number;
  attendance_percent: number;
}

export interface WorkSettings {
  id: number;
  timezone: string;
  work_start: string;
  work_end: string;
  late_grace_minutes: number;
  full_day_minutes: number;
  half_day_minutes: number;
}

// ---------------------------------- Tasks ----------------------------------

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed';

export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'completed'];
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  blocked: 'Blocked',
  completed: 'Completed',
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = {
  not_checked_in: 'Not checked in',
  working: 'Working',
  checked_out: 'Checked out',
  absent: 'Absent',
  on_leave: 'On leave',
};

export interface Task {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  created_by: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;    // YYYY-MM-DD
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // joined, optional
  assignee?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
  creator?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
}

export interface TaskInput {
  title: string;
  description?: string | null;
  assigned_to?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_date?: string | null;
}

/**
 * Used only when creating a task: carries one or more employee ids. The
 * database still stores one row per assignee (a "task for 3 people" is 3
 * independently trackable tasks, each with its own status) — this type
 * exists so the create flow can submit them together from one form.
 */
export interface TaskCreateInput extends Omit<TaskInput, 'assigned_to'> {
  assignees: string[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
}

export type ActivityAction =
  | 'created'
  | 'status_changed'
  | 'priority_changed'
  | 'reassigned'
  | 'due_date_changed'
  | 'edited'
  | 'commented'
  | 'completed';

export interface TaskActivity {
  id: string;
  task_id: string;
  user_id: string | null;
  action: ActivityAction;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
}

export interface TaskOverview {
  total: number;
  todo: number;
  in_progress: number;
  blocked: number;
  completed: number;
  overdue: number;
  due_today: number;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  assignee?: string | 'all' | 'me';
  due?: 'all' | 'today' | 'week' | 'overdue';
}

// ------------------------------ Notifications ------------------------------

export interface AppNotification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  title: string | null;
  body: string | null;
  link: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

// ---------------------------------------- Leaves ----------------------------------------

export type LeaveType = 'sick' | 'casual' | 'earned' | 'unpaid';
export type LeaveStatus =
  | 'pending' | 'approved' | 'rejected' | 'cancellation_requested' | 'cancelled';

export const LEAVE_TYPES: LeaveType[] = ['sick', 'casual', 'earned', 'unpaid'];

export const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
  sick: 'Sick leave',
  casual: 'Casual leave',
  earned: 'Earned leave',
  unpaid: 'Unpaid leave',
};

export const LEAVE_STATUS_LABEL: Record<LeaveStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancellation_requested: 'Cancellation requested',
  cancelled: 'Cancelled',
};

export interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type: LeaveType;
  start_date: string;   // YYYY-MM-DD
  end_date: string;     // YYYY-MM-DD
  days: number;
  is_half_day: boolean;
  reason: string | null;
  status: LeaveStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  cancel_requested_by: string | null;
  cancel_requested_at: string | null;
  cancel_reviewed_by: string | null;
  cancel_reviewed_at: string | null;
  cancel_review_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaveApplyInput {
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason?: string | null;
  half_day?: boolean;
}

export interface LeaveBalanceRow {
  leave_type: LeaveType;
  annual_days: number;
  accrued_days: number;
  carried_forward: number;
  used_days: number;
  pending_days: number;
  remaining: number;
}

export interface LeaveOverview {
  pending_count: number;
  cancellation_requested_count: number;
  on_leave_today: number;
}

// -------------------------------- Async state -------------------------------

export interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}