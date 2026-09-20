import { useCallback, useEffect, useMemo, useState } from 'react';
import { useInnoVibe } from '../provider';
import { applyChange, useChannelId, useRealtime } from '../lib/realtime';
import { readableError } from '../lib/toast';
import { tasksApi } from './api';
import { isOverdue, todayISO } from '../lib/time';
import type {
  Task, TaskActivity, TaskComment, TaskFilters, TaskInput, TaskOverview,
  TaskPriority, TaskStatus,
} from '../types';

const byNewest = (a: { created_at: string }, b: { created_at: string }) =>
  (a.created_at < b.created_at ? 1 : -1);

// ---------------------------------------------------------------------------
// useTasks — the list the current user is allowed to see, live
// ---------------------------------------------------------------------------
export function useTasks(initial: TaskFilters = {}) {
  const { supabase, userId } = useInnoVibe();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({
    search: '', status: 'all', priority: 'all', assignee: 'all', due: 'all', ...initial,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(await tasksApi.list(supabase));
      setError(null);
    } catch (e) {
      setError(readableError(e));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { void load(); }, [load]);

  const channelId = useChannelId('iv-tasks');
  const realtime = useRealtime(
    userId ? channelId : null,
    [{ table: 'tasks' }],
    (payload) => {
      // RLS applies to realtime too: a row you may not read never arrives.
      setTasks((cur) => applyChange<Task>(cur, payload, { sort: byNewest }));
    },
  );

  const visible = useMemo(() => {
    const q = (filters.search ?? '').trim().toLowerCase();
    return tasks.filter((t) => {
      if (filters.status && filters.status !== 'all' && t.status !== filters.status) return false;
      if (filters.priority && filters.priority !== 'all' && t.priority !== filters.priority) return false;
      if (filters.assignee === 'me' && t.assigned_to !== userId) return false;
      if (filters.assignee && !['all', 'me'].includes(filters.assignee) && t.assigned_to !== filters.assignee) return false;
      if (filters.due === 'today' && t.due_date !== todayISO()) return false;
      if (filters.due === 'overdue' && !isOverdue(t.due_date, t.status)) return false;
      if (filters.due === 'week') {
        if (!t.due_date) return false;
        const limit = new Date(); limit.setDate(limit.getDate() + 7);
        if (t.due_date > limit.toISOString().slice(0, 10)) return false;
      }
      if (q && !(`${t.title} ${t.description ?? ''}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [tasks, filters, userId]);

  const counts = useMemo<TaskOverview>(() => {
    const mine = tasks;
    return {
      total: mine.length,
      todo: mine.filter((t) => t.status === 'todo').length,
      in_progress: mine.filter((t) => t.status === 'in_progress').length,
      blocked: mine.filter((t) => t.status === 'blocked').length,
      completed: mine.filter((t) => t.status === 'completed').length,
      overdue: mine.filter((t) => isOverdue(t.due_date, t.status)).length,
      due_today: mine.filter((t) => t.due_date === todayISO() && t.status !== 'completed').length,
    };
  }, [tasks]);

  const myCounts = useMemo<TaskOverview>(() => {
    const mine = tasks.filter((t) => t.assigned_to === userId);
    return {
      total: mine.length,
      todo: mine.filter((t) => t.status === 'todo').length,
      in_progress: mine.filter((t) => t.status === 'in_progress').length,
      blocked: mine.filter((t) => t.status === 'blocked').length,
      completed: mine.filter((t) => t.status === 'completed').length,
      overdue: mine.filter((t) => isOverdue(t.due_date, t.status)).length,
      due_today: mine.filter((t) => t.due_date === todayISO() && t.status !== 'completed').length,
    };
  }, [tasks, userId]);

  // ------------------------------ mutations --------------------------------
  const create = async (input: TaskInput) => {
    if (!userId) throw new Error('Sign in first.');
    const created = await tasksApi.create(supabase, input, userId);
    setTasks((cur) => (cur.some((t) => t.id === created.id) ? cur : [created, ...cur]));
    return created;
  };

  const update = async (id: string, patch: Partial<TaskInput>) => {
    const prev = tasks;
    // Optimistic: the realtime UPDATE will confirm it a moment later.
    setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, ...patch } as Task : t)));
    try {
      return await tasksApi.update(supabase, id, patch);
    } catch (e) {
      setTasks(prev);
      throw e;
    }
  };

  const remove = async (id: string) => {
    const prev = tasks;
    setTasks((cur) => cur.filter((t) => t.id !== id));
    try {
      await tasksApi.remove(supabase, id);
    } catch (e) {
      setTasks(prev);
      throw e;
    }
  };

  return {
    tasks: visible,
    allTasks: tasks,
    counts,
    myCounts,
    filters,
    setFilters,
    loading,
    error,
    realtime,
    reload: load,
    create,
    update,
    remove,
    setStatus: (id: string, status: TaskStatus) => update(id, { status }),
    setPriority: (id: string, priority: TaskPriority) => update(id, { priority }),
  };
}

// ---------------------------------------------------------------------------
// useTaskThread — one task, its comments and its activity, all live
// ---------------------------------------------------------------------------
export function useTaskThread(taskId: string | null) {
  const { supabase, userId } = useInnoVibe();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [activity, setActivity] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!taskId) { setTask(null); setComments([]); setActivity([]); return; }
    setLoading(true);
    try {
      const [t, c, a] = await Promise.all([
        tasksApi.get(supabase, taskId),
        tasksApi.comments(supabase, taskId),
        tasksApi.activity(supabase, taskId),
      ]);
      setTask(t); setComments(c); setActivity(a); setError(null);
    } catch (e) {
      setError(readableError(e));
    } finally {
      setLoading(false);
    }
  }, [supabase, taskId]);

  useEffect(() => { void load(); }, [load]);

  const channelId = useChannelId('iv-task-thread');
  const realtime = useRealtime(
    taskId ? `${channelId}:${taskId}` : null,
    [
      { table: 'tasks', filter: taskId ? `id=eq.${taskId}` : undefined },
      { table: 'task_comments', filter: taskId ? `task_id=eq.${taskId}` : undefined },
      { table: 'task_activity', filter: taskId ? `task_id=eq.${taskId}` : undefined },
    ],
    (payload, sub) => {
      if (sub.table === 'tasks') {
        if (payload.eventType === 'DELETE') setTask(null);
        else setTask((cur) => ({ ...(cur ?? {}), ...(payload.new as Task) }));
      } else if (sub.table === 'task_comments') {
        setComments((cur) => applyChange<TaskComment>(cur, payload, {
          sort: (a, b) => (a.created_at > b.created_at ? 1 : -1),
        }));
      } else {
        setActivity((cur) => applyChange<TaskActivity>(cur, payload, { sort: byNewest }));
      }
    },
  );

  const addComment = async (content: string) => {
    if (!taskId || !userId) return;
    const saved = await tasksApi.addComment(supabase, taskId, userId, content);
    setComments((cur) => (cur.some((c) => c.id === saved.id) ? cur : [...cur, saved]));
  };

  const deleteComment = async (id: string) => {
    setComments((cur) => cur.filter((c) => c.id !== id));
    await tasksApi.deleteComment(supabase, id);
  };

  return { task, comments, activity, loading, error, realtime, reload: load, addComment, deleteComment };
}
