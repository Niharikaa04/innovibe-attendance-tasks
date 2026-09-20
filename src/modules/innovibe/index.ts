// ---------------------------------------------------------------------------
// Public surface of the InnoVibe Attendance & Tasks module.
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
export {
  NotificationBell,
  useNotifications,
} from './notifications/NotificationBell';

export { NotificationsPage } from './notifications/NotificationsPage';

// Settings
export { SettingsPage } from './settings/SettingsPage';

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
} from './dashboard/DashboardWidgets';

// Icons
export { IvIcon } from './ui/icons';
export type { IvIconName } from './ui/icons';

// Shared UI primitives
export * from './ui/ui';

export * from './types';

export * as ivTime from './lib/time';

export {
  useRealtime,
  useChannelId,
  applyChange,
} from './lib/realtime';