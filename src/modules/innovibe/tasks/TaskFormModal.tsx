import { useEffect, useState } from 'react';
import { Button, Field, Modal } from '../ui/ui';
import { useInnoVibe } from '../provider';
import { readableError, useToast } from '../lib/toast';
import {
  PRIORITY_LABEL, STATUS_LABEL, TASK_PRIORITIES, TASK_STATUSES,
} from '../types';
import type { Task, TaskInput } from '../types';

export function TaskFormModal({
  open, task, onClose, onSubmit,
}: {
  open: boolean;
  /** Pass a task to edit it; omit to create a new one. */
  task?: Task | null;
  onClose: () => void;
  /**
   * `assignees` is the full set of selected employee ids when creating a new
   * task (length 1 for a single pick, or more for a multi-assign). It is
   * undefined when editing an existing task, since editing always targets
   * the one row being edited — use `input.assigned_to` in that case.
   */
  onSubmit: (input: TaskInput, assignees?: string[]) => Promise<unknown>;
}) {
  const { people, userId, isManager } = useInnoVibe();
  const toast = useToast();
  const editing = !!task;

  const [form, setForm] = useState<TaskInput>({
    title: '', description: '', assigned_to: userId ?? '', priority: 'medium',
    status: 'todo', due_date: '',
  });
  const [assignees, setAssignees] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitleError(null);
    setForm(task ? {
      title: task.title,
      description: task.description ?? '',
      assigned_to: task.assigned_to ?? '',
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ?? '',
    } : {
      title: '', description: '', assigned_to: isManager ? '' : (userId ?? ''),
      priority: 'medium', status: 'todo', due_date: '',
    });
    setAssignees(task ? [] : (isManager ? [] : (userId ? [userId] : [])));
  }, [open, task, userId, isManager]);

  const set = <K extends keyof TaskInput>(k: K, v: TaskInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title.trim()) {
      setTitleError('Give the task a title so people know what to do.');
      return;
    }
    if (!editing && isManager && assignees.length === 0) {
      setTitleError('Pick at least one person to assign this to.');
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        await onSubmit({ ...form, title: form.title.trim() });
      } else {
        await onSubmit({ ...form, title: form.title.trim() }, assignees);
      }
      toast.success(
        editing ? 'Task updated'
          : assignees.length > 1 ? `Task created for ${assignees.length} people` : 'Task created',
      );
      onClose();
    } catch (e) {
      toast.error(readableError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      title={editing ? 'Edit task' : 'New task'}
      onClose={onClose}
      width={620}
      footer={(
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={busy} onClick={submit}>
            {editing ? 'Save changes' : 'Create task'}
          </Button>
        </>
      )}
    >
      <Field label="Title" error={titleError ?? undefined}>
        <input
          className="iv-input"
          value={form.title}
          maxLength={200}
          placeholder="Prepare monthly vehicle report"
          onChange={(e) => { set('title', e.target.value); setTitleError(null); }}
          autoFocus
        />
      </Field>

      <Field label="Details" hint="What does done look like?">
        <textarea
          className="iv-input iv-input--area"
          rows={4}
          value={form.description ?? ''}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Include the battery section and last month's PDI numbers."
        />
      </Field>

      <div className="iv-formgrid">
        <Field
          label={!editing && isManager ? 'Assign to (select one or more)' : 'Assign to'}
          hint={
            !isManager ? 'You can only create tasks for yourself.'
              : !editing ? 'Hold Ctrl (Windows) or Cmd (Mac) to select multiple people.'
                : undefined
          }
        >
          {!editing && isManager ? (
            <select
              className="iv-input"
              multiple
              size={Math.min(6, Math.max(3, people.length))}
              value={assignees}
              onChange={(e) => {
                const picked = Array.from(e.target.selectedOptions).map((o) => o.value);
                setAssignees(picked);
              }}
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name ?? 'Unnamed'}{p.id === userId ? ' (you)' : ''}
                </option>
              ))}
            </select>
          ) : (
            <select
              className="iv-input"
              value={form.assigned_to ?? ''}
              disabled={!isManager}
              onChange={(e) => set('assigned_to', e.target.value)}
            >
              <option value="">Unassigned</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name ?? 'Unnamed'}{p.id === userId ? ' (you)' : ''}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field label="Priority">
          <select className="iv-input" value={form.priority}
                  onChange={(e) => set('priority', e.target.value as TaskInput['priority'])}>
            {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
          </select>
        </Field>

        <Field label="Status">
          <select className="iv-input" value={form.status}
                  onChange={(e) => set('status', e.target.value as TaskInput['status'])}>
            {TASK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </Field>

        <Field label="Due date">
          <input className="iv-input" type="date" value={form.due_date ?? ''}
                 onChange={(e) => set('due_date', e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
