import { useState } from 'react';
import { MyAttendancePanel } from './MyAttendancePanel';
import { AttendanceHistory } from './AttendanceHistory';
import { TeamAttendanceBoard } from './TeamAttendanceBoard';
import { useInnoVibe } from '../provider';
import { Button, Drawer } from '../ui/ui';

/**
 * Drop-in page. Employees see their own day and history. Managers get a
 * second tab with the whole team; clicking a member opens their history.
 */
export function AttendancePage({
  initialTab = 'me',
}: { initialTab?: 'me' | 'team' } = {}) {
  const { isManager, userId } = useInnoVibe();
  const [tab, setTab] = useState<'me' | 'team'>(initialTab);
  const [person, setPerson] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="iv-page">
      <div className="iv-page__head">
        <div>
          <h1 className="iv-page__title">Attendance</h1>
          <p className="iv-page__sub">Check in, check out, and see where the day went.</p>
        </div>
        {isManager && (
          <div className="iv-tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'me'}
              className={`iv-tabs__btn ${tab === 'me' ? 'is-active' : ''}`}
              onClick={() => setTab('me')}>My day</button>
            <button role="tab" aria-selected={tab === 'team'}
              className={`iv-tabs__btn ${tab === 'team' ? 'is-active' : ''}`}
              onClick={() => setTab('team')}>Team</button>
          </div>
        )}
      </div>

      {tab === 'me' ? (
        <div className="iv-grid iv-grid--sidebar">
          <MyAttendancePanel />
          <AttendanceHistory userId={userId} />
        </div>
      ) : (
        <TeamAttendanceBoard onSelectPerson={(id, name) => setPerson({ id, name })} />
      )}

      <Drawer
        open={!!person}
        title={person ? `${person.name}` : ''}
        onClose={() => setPerson(null)}
      >
        {person && <AttendanceHistory userId={person.id} personName={person.name} />}
        <div className="iv-drawer__foot">
          <Button onClick={() => setPerson(null)}>Close</Button>
        </div>
      </Drawer>
    </div>
  );
}
