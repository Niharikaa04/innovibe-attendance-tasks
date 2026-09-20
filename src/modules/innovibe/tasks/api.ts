import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Task, TaskActivity, TaskComment, TaskInput, TaskOverview, TaskStatus, TaskPriority,
} from '../types';

const TASK_COLUMNS = '*';

export const tasksApi = {
  async list(sb: SupabaseClient, opts: { assignedTo?: string } = {}): Promise<Task[]> {
    // RLS already limits rows to: assigned to me, created by me, or all (manager).
    let q = sb.from('tasks').select(TASK_COLUMNS).order('created_at', { ascending: false });
    if (opts.assignedTo) q = q.eq('assigned_to', opts.assignedTo);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Task[];
  },

  async get(sb: SupabaseClient, id: string): Promise<Task | null> {
    const { data, error } = await sb.from('tasks').select(TASK_COLUMNS).eq('id', id).maybeSingle();
    if (error) throw error;
    return (data as Task) ?? null;
  },

  async create(sb: SupabaseClient, input: TaskInput, createdBy: string): Promise<Task> {
    const { data, error } = await sb.from('tasks').insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      assigned_to: input.assigned_to || null,
      created_by: createdBy,
      priority: input.priority ?? 'medium',
      status: input.status ?? 'todo',
      due_date: input.due_date || null,
    }).select(TASK_COLUMNS).single();
    if (error) throw error;
    return data as Task;
  },

  async update(sb: SupabaseClient, id: string, patch: Partial<TaskInput>): Promise<Task> {
    const body: Record<string, unknown> = {};
    if (patch.title !== undefined) body.title = patch.title.trim();
    if (patch.description !== undefined) body.description = patch.description?.trim() || null;
    if (patch.assigned_to !== undefined) body.assigned_to = patch.assigned_to || null;
    if (patch.priority !== undefined) body.priority = patch.priority;
    if (patch.status !== undefined) body.status = patch.status;
    if (patch.due_date !== undefined) body.due_date = patch.due_date || null;

    const { data, error } = await sb.from('tasks').update(body).eq('id', id)
      .select(TASK_COLUMNS).single();
    if (error) throw error;
    return data as Task;
  },

  setStatus(sb: SupabaseClient, id: string, status: TaskStatus) {
    return tasksApi.update(sb, id, { status });
  },

  setPriority(sb: SupabaseClient, id: string, priority: TaskPriority) {
    return tasksApi.update(sb, id, { priority });
  },

  async remove(sb: SupabaseClient, id: string): Promise<void> {
    const { error } = await sb.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  async overview(sb: SupabaseClient, userId?: string | null): Promise<TaskOverview> {
    const { data, error } = await sb.rpc('iv_task_overview', { p_user: userId ?? null });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return (row ?? {
      total: 0, todo: 0, in_progress: 0, blocked: 0, completed: 0, overdue: 0, due_today: 0,
    }) as TaskOverview;
  },

  // ----------------------------- comments ---------------------------------
  async comments(sb: SupabaseClient, taskId: string): Promise<TaskComment[]> {
    const { data, error } = await sb.from('task_comments').select('*')
      .eq('task_id', taskId).order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as TaskComment[];
  },

  async addComment(
    sb: SupabaseClient, taskId: string, userId: string, content: string,
  ): Promise<TaskComment> {
    const { data, error } = await sb.from('task_comments')
      .insert({ task_id: taskId, user_id: userId, content: content.trim() })
      .select('*').single();
    if (error) throw error;
    return data as TaskComment;
  },

  async deleteComment(sb: SupabaseClient, id: string): Promise<void> {
    const { error } = await sb.from('task_comments').delete().eq('id', id);
    if (error) throw error;
  },

  // ----------------------------- activity ---------------------------------
  async activity(sb: SupabaseClient, taskId: string): Promise<TaskActivity[]> {
    const { data, error } = await sb.from('task_activity').select('*')
      .eq('task_id', taskId).order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return (data ?? []) as TaskActivity[];
  },

  async recentActivity(sb: SupabaseClient, limit = 12): Promise<TaskActivity[]> {
    const { data, error } = await sb.from('task_activity').select('*')
      .order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return (data ?? []) as TaskActivity[];
  },
};
