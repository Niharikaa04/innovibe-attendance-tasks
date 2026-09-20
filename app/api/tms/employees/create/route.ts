import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      password,
      designation,
      departmentId,
      departmentName,
      userType,
      role = 'EMPLOYEE',
      joiningDate = new Date().toISOString().split('T')[0],
      avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    } = body;

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Email and full name are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password?.trim() || 'Emp@2026Secure';
    const employeeId = body.employeeId || `EMP-${Math.floor(100 + Math.random() * 900)}`;

    const serviceSupabase = getServiceSupabase();

    // 1. Create Supabase Auth user using Service Role
    const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
      email: cleanEmail,
      password: cleanPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: role,
        department_id: departmentId,
      },
    });

    if (authError && !authError.message.includes('already registered')) {
      console.error('Supabase Auth user creation error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const userId = authData?.user?.id || `usr-${Date.now()}`;

    // 2. Provision Employee Profile in public.profiles table
    const { data: profileData, error: profileError } = await serviceSupabase
      .from('profiles')
      .upsert({
        id: userId,
        employee_id: employeeId,
        full_name: fullName,
        email: cleanEmail,
        phone: phone || null,
        role: role,
        user_type: userType || 'EMPLOYEE',
        designation: designation || 'Team Member',
        department_id: departmentId || null,
        avatar: avatar,
        joining_date: joiningDate,
        account_status: 'ONLINE',
        productivity_score: 90,
        productivity_status: 'EXCELLENT',
        attendance_rate: 98,
      })
      .select()
      .single();

    if (profileError) {
      console.warn('Profile table insert warning:', profileError);
    }

    // 3. Initialize Leave Balance record
    await serviceSupabase.from('leave_balances').upsert({
      employee_id: userId,
      casual_leave_used: 0,
      casual_leave_total: 12,
      sick_leave_used: 0,
      sick_leave_total: 12,
      pto_used: 0,
      pto_total: 15,
      unpaid_leave_used: 0,
      unpaid_leave_total: 30,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        employeeId,
        fullName,
        email: cleanEmail,
        role,
        departmentName,
      },
    });
  } catch (err: any) {
    console.error('Employee creation API error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create employee.' }, { status: 500 });
  }
}
