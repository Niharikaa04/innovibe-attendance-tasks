// ---------------------------------------------------------------------------
// Public surface of the InnoVibe Attendance & Tasks module.
// Import only from here in the host app:
//   import { AttendancePage, TasksPage, InnoVibeProvider } from '@/modules/innovibe';
// ---------------------------------------------------------------------------

import './styles/innovibe.css';

export { InnoVibeProvider, useInnoVibe, useNameOf } from './provider';

export { ToastHost, useToast, readableError } from './lib/toast';

// Attendance
export { AttendancePage } from './attendance/AttendancePage';
export { MyAttendancePanel } from './attendance/MyAttendancePanel';
export { AttendanceHistory } from './attendance/AttendanceHistory';
export { TeamAttendanceBoard } from './attendance/TeamAttendanceBoard';
export {
  useMyAttendance,
  useTeamAttendance,
  useAttendanceHistory,
  useWorkSettings,
} from './attendance/hooks';
export { attendanceApi } from './attendance/api';

// Tasks
export { TasksPage } from './tasks/TasksPage';
export { TaskFormModal } from './tasks/TaskFormModal';
export { TaskDetailDrawer } from './tasks/TaskDetailDrawer';
export { useTasks, useTaskThread } from './tasks/hooks';
export { tasksApi } from './tasks/api';

// Notifications
export { NotificationBell, useNotifications } from './notifications/NotificationBell';
export { NotificationsPage } from './notifications/NotificationsPage';

// Settings
export { SettingsPage } from './settings/SettingsPage';

// Leaves
export { LeavesPage } from './leaves/LeavesPage';
export { LeaveFormModal } from './leaves/LeaveFormModal';
export {
  useMyLeaves,
  useTeamLeaves,
  useLeaveBalance,
} from './leaves/hooks';
export { leavesApi } from './leaves/api';

// Office Dashboard widgets
export {
  OfficeDashboardSection,
  DashboardKpiRow,
  KpiCard,
  AttendanceSummaryWidget,
  EmployeeStatusWidget,
  TaskSummaryWidget,
  PendingTasksWidget,
  OverdueTasksWidget,
  RecentActivityWidget,
  PendingLeavesWidget,
} from './dashboard/DashboardWidgets';

// Shared UI primitives
export * from './ui/ui';

export { IvIcon } from './ui/icons';
export type { IvIconName } from './ui/icons';

export * from './types';
export * as ivTime from './lib/time';
export { useRealtime, useChannelId, applyChange } from './lib/realtime';
