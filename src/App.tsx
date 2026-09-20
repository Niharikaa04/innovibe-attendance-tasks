import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';

import {
  InnoVibeProvider,
  ToastHost,
  AttendancePage,
  TasksPage,
  NotificationBell,
  NotificationsPage,
  SettingsPage,
  OfficeDashboardSection,
  DashboardKpiRow,
  IvIcon,
  useInnoVibe,
} from './modules/innovibe';
import type { IvIconName } from './modules/innovibe';

import './modules/innovibe/styles/innovibe.css';
import './App.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

type Page =
  | 'dashboard'
  | 'my-attendance'
  | 'team-attendance'
  | 'my-tasks'
  | 'team-tasks'
  | 'notifications'
  | 'settings';

const PAGE_TITLE: Record<Page, string> = {
  dashboard: 'Dashboard',
  'my-attendance': 'My Attendance',
  'team-attendance': 'Team Attendance',
  'my-tasks': 'My Tasks',
  'team-tasks': 'Team Tasks',
  notifications: 'Notifications',
  settings: 'Settings',
};

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** "ceo" -> "CEO", "hr" -> "HR", "lead" -> "Lead", "employee" -> "Employee" */
function formatRole(role?: string | null): string {
  if (!role) return 'Employee';
  const text = role.replace(/_/g, ' ');
  if (['ceo', 'hr'].includes(text.toLowerCase())) return text.toUpperCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, next) => {
        setSession(next);
      },
    );

    return () => sub.subscription.unsubscribe();
  }, []);

  if (checkingSession) {
    return (
      <div className="iv-boot">
        <span className="iv-spinner" aria-hidden="true" />
        <p>Loading InnoVibe…</p>
      </div>
    );
  }

  if (!session) {
    return <SignIn onSignedIn={setSession} />;
  }

  return (
    <InnoVibeProvider
      supabase={supabase}
      userId={session.user.id}
    >
      <ToastHost>
        <OfficeShell
          onSignOut={() => supabase.auth.signOut()}
        />
      </ToastHost>
    </InnoVibeProvider>
  );
}

// ---------------------------------------------------------------------------

function OfficeShell({
  onSignOut,
}: {
  onSignOut: () => void;
}) {
  const { profile, isManager } = useInnoVibe();

  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  // True when the Tasks page was opened from "New Task" on the dashboard,
  // so it should show the create-task form straight away.
  const [startNewTask, setStartNewTask] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileMenuOpen) return undefined;

    const onDoc = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onDoc);

    return () => {
      document.removeEventListener('mousedown', onDoc);
    };
  }, [profileMenuOpen]);

  // Close the mobile menu with the Escape key.
  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };

    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [sidebarOpen]);

  const fullName = profile?.full_name ?? '';
  const firstName = fullName.trim().split(/\s+/)[0] ?? '';

  const initials = (fullName || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const goTo = (p: Page) => {
    setPage(p);
    setStartNewTask(false);
    setSidebarOpen(false);
    setProfileMenuOpen(false);
  };

  const openNewTask = () => {
    setStartNewTask(true);
    setPage(isManager ? 'team-tasks' : 'my-tasks');
    setSidebarOpen(false);
    setProfileMenuOpen(false);
  };

  return (
    <div className="iv-app">
      {sidebarOpen && (
        <div
          className="iv-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`iv-sidebar ${
          sidebarOpen ? 'is-open' : ''
        }`}
      >
        {/* Sidebar Logo */}
        <div className="iv-brand-row">
          <img
            src="/assets/logo.png"
            alt="InnoVibe Care.EV"
            className="iv-brand-row__logo"
          />
        </div>

        <nav className="iv-navgroup" aria-label="Main">
          <span className="iv-navgroup__label">Main</span>

          <NavItem
            icon="dashboard"
            label="Dashboard"
            active={page === 'dashboard'}
            onClick={() => goTo('dashboard')}
          />
        </nav>

        <nav className="iv-navgroup" aria-label="Attendance">
          <span className="iv-navgroup__label">
            Attendance
          </span>

          <NavItem
            icon="clock"
            label="My Attendance"
            active={page === 'my-attendance'}
            onClick={() => goTo('my-attendance')}
          />

          {isManager && (
            <NavItem
              icon="users"
              label="Team Attendance"
              active={page === 'team-attendance'}
              onClick={() => goTo('team-attendance')}
            />
          )}
        </nav>

        <nav className="iv-navgroup" aria-label="Tasks">
          <span className="iv-navgroup__label">Tasks</span>

          <NavItem
            icon="check-square"
            label="My Tasks"
            active={page === 'my-tasks'}
            onClick={() => goTo('my-tasks')}
          />

          {isManager && (
            <NavItem
              icon="clipboard"
              label="Team Tasks"
              active={page === 'team-tasks'}
              onClick={() => goTo('team-tasks')}
            />
          )}
        </nav>

        <nav className="iv-navgroup" aria-label="Communication">
          <span className="iv-navgroup__label">
            Communication
          </span>

          <NavItem
            icon="bell"
            label="Notifications"
            active={page === 'notifications'}
            onClick={() => goTo('notifications')}
          />
        </nav>

        <nav className="iv-navgroup" aria-label="Settings">
          <span className="iv-navgroup__label">Settings</span>

          <NavItem
            icon="settings"
            label="Settings"
            active={page === 'settings'}
            onClick={() => goTo('settings')}
          />

          <NavItem
            icon="log-out"
            label="Logout"
            active={false}
            onClick={onSignOut}
          />
        </nav>
      </aside>

      <div className="iv-main">
        <header className="iv-topbar">
          <button
            className="iv-topbar__menu"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={sidebarOpen}
          >
            <IvIcon name="menu" size={18} />
          </button>

          <h2 className="iv-topbar__title">
            {PAGE_TITLE[page]}
          </h2>

          <div
            className="iv-topbar__search"
            role="search"
          >
            <IvIcon name="search" size={16} />
            <input
              type="search"
              placeholder="Search employees, tasks, or anything..."
              aria-label="Search employees, tasks, or anything"
            />
          </div>

          <div className="iv-topbar__spacer" />

          <div className="iv-topbar__actions">
            <NotificationBell
              onOpenTask={() =>
                setPage(
                  isManager ? 'team-tasks' : 'my-tasks',
                )
              }
            />

            <div
              className="iv-profilemenu"
              ref={profileMenuRef}
            >
              <button
                className="iv-profilebtn"
                onClick={() =>
                  setProfileMenuOpen((v) => !v)
                }
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >
                <span
                  className="iv-userchip"
                  aria-hidden="true"
                >
                  {initials || '?'}
                </span>

                <span className="iv-profilebtn__text">
                  <strong>
                    {fullName || 'Signed in'}
                  </strong>
                  <em>{formatRole(profile?.role)}</em>
                </span>

                <span className="iv-profilebtn__chev">
                  <IvIcon name="chevron-down" size={16} />
                </span>
              </button>

              {profileMenuOpen && (
                <div
                  className="iv-profilemenu__panel"
                  role="menu"
                >
                  <div className="iv-profilemenu__who">
                    <strong>
                      {fullName || 'Signed in'}
                    </strong>

                    <span>
                      {formatRole(profile?.role)}
                    </span>
                  </div>

                  <button
                    className="iv-profilemenu__item"
                    onClick={() => goTo('settings')}
                  >
                    <IvIcon name="settings" size={16} /> Settings
                  </button>

                  <button
                    className="iv-profilemenu__item iv-profilemenu__item--danger"
                    onClick={onSignOut}
                  >
                    <IvIcon name="log-out" size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="iv-content">
          {page === 'dashboard' && (
            <DashboardHome
              firstName={firstName}
              onOpenTasks={() =>
                goTo(
                  isManager ? 'team-tasks' : 'my-tasks',
                )
              }
              onOpenAttendance={() =>
                goTo(
                  isManager
                    ? 'team-attendance'
                    : 'my-attendance',
                )
              }
              onNewTask={openNewTask}
              onOpenNotifications={() => goTo('notifications')}
              onOpenSettings={() => goTo('settings')}
            />
          )}

          {page === 'my-attendance' && (
            <AttendancePage
              key="my-attendance"
              initialTab="me"
            />
          )}

          {page === 'team-attendance' && isManager && (
            <AttendancePage
              key="team-attendance"
              initialTab="team"
            />
          )}

          {page === 'my-tasks' && (
            <TasksPage
              key="my-tasks"
              initialAssignee="me"
              startWithNewTask={startNewTask}
            />
          )}

          {page === 'team-tasks' && isManager && (
            <TasksPage
              key="team-tasks"
              initialAssignee="all"
              startWithNewTask={startNewTask}
            />
          )}

          {page === 'notifications' && (
            <NotificationsPage
              onOpenTask={() =>
                goTo(
                  isManager ? 'team-tasks' : 'my-tasks',
                )
              }
            />
          )}

          {page === 'settings' && (
            <SettingsPage onSignOut={onSignOut} />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: IvIconName;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`iv-navitem ${
        active ? 'is-active' : ''
      }`}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      <span
        className="iv-navitem__icon"
        aria-hidden="true"
      >
        <IvIcon name={icon} size={18} />
      </span>

      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------

function DashboardHome({
  firstName,
  onOpenTasks,
  onNewTask,
  onOpenAttendance,
  onOpenNotifications,
  onOpenSettings,
}: {
  firstName: string;
  onOpenTasks: () => void;
  onNewTask: () => void;
  onOpenAttendance: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
}) {
  // Keep the date card correct if the tab stays open past midnight.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(
      () => setNow(new Date()),
      60000,
    );

    return () => window.clearInterval(id);
  }, []);

  const weekday = now.toLocaleDateString('en-US', {
    weekday: 'long',
  });

  const dateText = `${weekday}, ${now.getDate()} ${
    MONTHS[now.getMonth()]
  } ${now.getFullYear()}`;

  return (
    <div className="iv-page">
      <div className="iv-welcome">
        <div className="iv-welcome__text">
          <h1 className="iv-welcome__title">
            {firstName
              ? `Welcome back, ${firstName}!`
              : 'Welcome back!'}
          </h1>

          <p className="iv-welcome__sub">
            Here's what's happening across InnoVibe
            Office today.
          </p>
        </div>

        <div className="iv-datecard">
          <span
            className="iv-datecard__icon"
            aria-hidden="true"
          >
            <IvIcon name="calendar" size={20} />
          </span>

          <div>
            <div className="iv-datecard__day">
              {dateText}
            </div>

            <div className="iv-datecard__hint">
              Have a productive day!
            </div>
          </div>
        </div>
      </div>

      <DashboardKpiRow />

      <OfficeDashboardSection
        onOpenAttendance={onOpenAttendance}
        onOpenTasks={onOpenTasks}
        onNewTask={onNewTask}
        onOpenTask={onOpenTasks}
        onOpenNotifications={onOpenNotifications}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------

function SignIn({
  onSignedIn,
}: {
  onSignedIn: (s: Session) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    setBusy(true);
    setError(null);

    const { data, error: err } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setBusy(false);

    if (err) {
      setError(
        err.message.toLowerCase().includes('invalid login')
          ? 'Incorrect email or password. Please try again.'
          : err.message,
      );

      return;
    }

    if (data.session) {
      onSignedIn(data.session);
    }
  };

  const forgotPassword = async () => {
    if (!email) {
      setError(
        'Enter your email above first, then tap "Forgot password?".',
      );

      return;
    }

    setError(null);

    const { error: err } =
      await supabase.auth.resetPasswordForEmail(email);

    if (err) {
      setError(err.message);
      return;
    }

    setResetSent(true);
  };

  return (
    <div className="iv-boot">
      <form
        className="iv-signin"
        onSubmit={submit}
      >
        {/* Login Logo */}
        <img
          src="/assets/logo.png"
          alt="InnoVibe Care.EV"
          className="iv-signin__logo"
        />

        <h1>Welcome back</h1>

        <p>
          Sign in to your InnoVibe Office account.
        </p>

        {error && (
          <div className="iv-error">
            <p>{error}</p>
          </div>
        )}

        {resetSent && (
          <div className="iv-notice-inline">
            Password reset link sent to{' '}
            <strong>{email}</strong>. Check your inbox.
          </div>
        )}

        <label>
          Email

          <input
            className="iv-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@innovibe.com"
            required
            autoFocus
          />
        </label>

        <label>
          Password

          <div className="iv-passwordfield">
            <input
              className="iv-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <button
              type="button"
              className="iv-passwordfield__toggle"
              onClick={() =>
                setShowPassword((v) => !v)
              }
              aria-label={
                showPassword
                  ? 'Hide password'
                  : 'Show password'
              }
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
        </label>

        <button
          type="button"
          className="iv-forgotlink"
          onClick={forgotPassword}
        >
          Forgot password?
        </button>

        <button
          className="iv-btn iv-btn--primary iv-btn--lg"
          type="submit"
          disabled={busy}
        >
          {busy ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default App;