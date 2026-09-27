
// ============================================================================
// InnoVibe — create-employee edge function
// ============================================================================
//
// Lets an authorized person (CEO / Admin / Manager / HR / Lead) create a new
// employee from the InnoVibe frontend.
//
// The service-role key NEVER reaches the browser.
//
// Flow:
// 1. Read caller's Supabase Auth token.
// 2. Verify caller.
// 3. Check caller's role in the database.
// 4. Validate submitted fields.
// 5. Check duplicate User ID and email.
// 6. Create Supabase Auth user.
// 7. Create/update public.profiles.
// 8. Roll back Auth user if profile creation fails.
// 9. Return a clean response.
// ============================================================================

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// -----------------------------------------------------------------------------
// Roles allowed to create employees
// -----------------------------------------------------------------------------

const AUTHORIZED_CREATOR_ROLES = [
  "ceo",
  "admin",
  "manager",
  "hr",
  "lead",
];

// -----------------------------------------------------------------------------
// Roles that can be assigned to a new employee
// -----------------------------------------------------------------------------

const CREATABLE_ROLES = [
  "employee",
  "intern",
  "lead",
  "hr",
  "manager",
];

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

const EMPLOYEE_ID_PATTERN = /^[A-Za-z0-9._-]{2,40}$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// -----------------------------------------------------------------------------
// JSON response helper
// -----------------------------------------------------------------------------

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

// -----------------------------------------------------------------------------
// Error response helper
// -----------------------------------------------------------------------------

function fail(message: string, status = 400): Response {
  return json(
    {
      error: message,
    },
    status,
  );
}

// ============================================================================
// EDGE FUNCTION
// ============================================================================

Deno.serve(async (req: Request): Promise<Response> => {
  // ---------------------------------------------------------------------------
  // CORS preflight
  // ---------------------------------------------------------------------------

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  // ---------------------------------------------------------------------------
  // Only POST is allowed
  // ---------------------------------------------------------------------------

  if (req.method !== "POST") {
    return fail("Method not allowed.", 405);
  }

  // ---------------------------------------------------------------------------
  // Supabase environment variables
  // ---------------------------------------------------------------------------

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

  const SERVICE_ROLE_KEY = Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY",
  );

  const ANON_KEY = Deno.env.get(
    "SUPABASE_ANON_KEY",
  );

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
    console.error(
      "create-employee: missing Supabase environment variables.",
    );

    return fail(
      "Server is not configured correctly.",
      500,
    );
  }

  // ---------------------------------------------------------------------------
  // Read caller's access token
  // ---------------------------------------------------------------------------

  const authHeader = req.headers.get("Authorization") ?? "";

  const callerToken = authHeader
    .replace(/^Bearer\s+/i, "")
    .trim();

  if (!callerToken) {
    return fail(
      "You are not authorized to create employees.",
      401,
    );
  }

  // ---------------------------------------------------------------------------
  // Client using the caller's JWT
  // ---------------------------------------------------------------------------

  const callerClient = createClient(
    SUPABASE_URL,
    ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${callerToken}`,
        },
      },
    },
  );

  // ---------------------------------------------------------------------------
  // Admin client
  //
  // IMPORTANT:
  // This key exists ONLY inside the Edge Function.
  // It is never sent to the frontend.
  // ---------------------------------------------------------------------------

  const admin = createClient(
    SUPABASE_URL,
    SERVICE_ROLE_KEY,
  );

  // ===========================================================================
  // 1. Identify the caller
  // ===========================================================================

  const {
    data: callerAuth,
    error: callerAuthError,
  } = await callerClient.auth.getUser();

  if (callerAuthError || !callerAuth?.user) {
    return fail(
      "You are not authorized to create employees.",
      401,
    );
  }

  // ===========================================================================
  // 2. Check caller's role from the database
  // ===========================================================================

  const {
    data: callerProfile,
    error: callerProfileError,
  } = await admin
    .from("profiles")
    .select("role")
    .eq("id", callerAuth.user.id)
    .maybeSingle();

  if (callerProfileError) {
    console.error(
      "create-employee: caller profile lookup failed:",
      callerProfileError.message,
    );

    return fail(
      "Unable to verify your account. Please try again.",
      500,
    );
  }

  const callerRole = (
    callerProfile?.role ?? "employee"
  ).toLowerCase();

  if (!AUTHORIZED_CREATOR_ROLES.includes(callerRole)) {
    return fail(
      "You are not authorized to create employees.",
      403,
    );
  }

  // ===========================================================================
  // 3. Read request body
  // ===========================================================================

  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return fail(
      "Invalid request.",
      400,
    );
  }

  // ===========================================================================
  // 4. Validate fields
  // ===========================================================================

  const fullName = String(
    body.full_name ?? "",
  ).trim();

  const employeeId = String(
    body.employee_id ?? "",
  ).trim();

  const email = String(
    body.email ?? "",
  ).trim().toLowerCase();

  const role = String(
    body.role ?? "",
  ).trim().toLowerCase();

  const password = String(
    body.password ?? "",
  );

  // Full name
  if (!fullName) {
    return fail(
      "Full name is required.",
    );
  }

  // Employee ID
  if (
    !employeeId ||
    !EMPLOYEE_ID_PATTERN.test(employeeId)
  ) {
    return fail(
      "User ID must be 2–40 characters (letters, numbers, dot, dash, underscore).",
    );
  }

  // Email
  if (
    !email ||
    !EMAIL_PATTERN.test(email)
  ) {
    return fail(
      "Enter a valid email address.",
    );
  }

  // Role
  if (!CREATABLE_ROLES.includes(role)) {
    return fail(
      "Choose a valid role.",
    );
  }

  // Password
  if (
    !password ||
    password.length < 8
  ) {
    return fail(
      "Password must contain at least 8 characters.",
    );
  }

  // ===========================================================================
  // 5. Check duplicate User ID
  // ===========================================================================

  const {
    data: existingByEmployeeId,
    error: employeeIdCheckError,
  } = await admin
    .from("profiles")
    .select("id")
    .ilike("employee_id", employeeId)
    .maybeSingle();

  if (employeeIdCheckError) {
    console.error(
      "create-employee: employee ID lookup failed:",
      employeeIdCheckError.message,
    );

    return fail(
      "Unable to check the User ID. Please try again.",
      500,
    );
  }

  if (existingByEmployeeId) {
    return fail(
      "User ID already exists.",
      409,
    );
  }

  // ===========================================================================
  // 6. Check duplicate email
  // ===========================================================================

  const {
    data: existingByEmail,
    error: emailCheckError,
  } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (emailCheckError) {
    console.error(
      "create-employee: email lookup failed:",
      emailCheckError.message,
    );

    return fail(
      "Unable to check the email address. Please try again.",
      500,
    );
  }

  if (existingByEmail) {
    return fail(
      "Email is already registered.",
      409,
    );
  }

  // ===========================================================================
  // 7. Create Supabase Auth user
  // ===========================================================================

  const {
    data: created,
    error: createError,
  } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,

    user_metadata: {
      full_name: fullName,
    },
  });

  if (createError || !created?.user) {
    const message = (
      createError?.message ?? ""
    ).toLowerCase();

    if (
      message.includes("already") ||
      message.includes("registered") ||
      message.includes("exists")
    ) {
      return fail(
        "Email is already registered.",
        409,
      );
    }

    console.error(
      "create-employee: auth user creation failed:",
      createError?.message,
    );

    return fail(
      "Unable to create employee account.",
      500,
    );
  }

  const newUserId = created.user.id;

  // ===========================================================================
  // 8. Create/update employee profile
  //
  // IMPORTANT:
  // email is explicitly saved here.
  // ===========================================================================

  const {
    error: profileError,
  } = await admin
    .from("profiles")
    .upsert(
      {
        id: newUserId,
        full_name: fullName,
        employee_id: employeeId,
        email: email,
        role: role,
        status: "active",
      },
      {
        onConflict: "id",
      },
    );

  // ===========================================================================
  // 9. Roll back Auth user if profile creation fails
  // ===========================================================================

  if (profileError) {
    console.error(
      "create-employee: profile upsert failed. Rolling back Auth user:",
      profileError.message,
    );

    await admin.auth.admin.deleteUser(
      newUserId,
    );

    if (profileError.code === "23505") {
      return fail(
        "User ID or email already exists.",
        409,
      );
    }

    return fail(
      "Employee profile could not be saved.",
      500,
    );
  }

  // ===========================================================================
  // 10. Success
  // ===========================================================================

  return json({
    success: true,

    employee: {
      id: newUserId,
      full_name: fullName,
      employee_id: employeeId,
      email: email,
      role: role,
      status: "active",
    },
  });
});