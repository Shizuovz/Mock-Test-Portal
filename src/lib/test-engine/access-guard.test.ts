import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

function loadLocalEnv() {
  if (fs.existsSync(".env.local")) {
    const text = fs.readFileSync(".env.local", "utf8");
    for (const line of text.split("\n")) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    }
  }
}

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

describe("Robust Server-Side Access Guard & Concurrency", () => {
  const client = createClient(supabaseUrl!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  it("handles simultaneous concurrent requests by returning the identical attempt and incrementing credit exactly once", async () => {
    const { data: tests } = await client
      .from("tests")
      .select("id, duration_minutes")
      .eq("is_published", true)
      .limit(1);

    expect(tests).toBeDefined();
    expect(tests!.length).toBeGreaterThan(0);
    const testId = tests![0].id;
    const durationMinutes = tests![0].duration_minutes;

    const guestSessionId = crypto.randomUUID();

    // 1. Send two simultaneous requests when no resumable attempt exists
    const [res1, res2] = await Promise.all([
      client.rpc("start_guest_free_attempt", {
        p_guest_session_id: guestSessionId,
        p_test_id: testId,
      }),
      client.rpc("start_guest_free_attempt", {
        p_guest_session_id: guestSessionId,
        p_test_id: testId,
      }),
    ]);

    expect(res1.error).toBeNull();
    expect(res2.error).toBeNull();
    expect(res1.data).toBeDefined();
    expect(res2.data).toBeDefined();

    // Both must return the identical attempt ID
    expect(res1.data.id).toBe(res2.data.id);

    // Verify server-side calculated duration
    const startedAt = new Date(res1.data.started_at).getTime();
    const expiresAt = new Date(res1.data.expires_at).getTime();
    const diffMinutes = Math.round((expiresAt - startedAt) / (60 * 1000));
    expect(diffMinutes).toBe(durationMinutes);

    // Verify only 1 row exists in test_attempts
    const { data: attempts } = await client
      .from("test_attempts")
      .select("id")
      .eq("guest_session_id", guestSessionId);
    expect(attempts?.length).toBe(1);

    // Verify guest session has exactly 1 attempt consumed
    const { data: session } = await client
      .from("guest_sessions")
      .select("free_attempts_used, free_attempt_limit")
      .eq("id", guestSessionId)
      .single();
    expect(session?.free_attempts_used).toBe(1);

    // Attempting a second different test as guest must fail with GUEST_ATTEMPT_LIMIT_REACHED
    // First let's complete the active attempt so it's not resumable
    await client
      .from("test_attempts")
      .update({ status: "submitted", submitted_at: new Date().toISOString() })
      .eq("id", res1.data.id);

    const { error: limitErr } = await client.rpc("start_guest_free_attempt", {
      p_guest_session_id: guestSessionId,
      p_test_id: testId,
    });
    expect(limitErr).toBeDefined();
    expect(limitErr?.message).toContain("GUEST_ATTEMPT_LIMIT_REACHED");

    // Cleanup
    await client.from("test_attempts").delete().eq("guest_session_id", guestSessionId);
    await client.from("guest_sessions").delete().eq("id", guestSessionId);
  }, 25000);

  it("enforces strict database check constraint on identity and access_type", async () => {
    const { data: tests } = await client
      .from("tests")
      .select("id")
      .eq("is_published", true)
      .limit(1);
    const testId = tests![0].id;
    const now = new Date();
    const later = new Date(now.getTime() + 10 * 60 * 1000);

    // 1. Invalid: guest_session_id with access_type = 'subscription'
    const guestSessionId = crypto.randomUUID();
    await client.from("guest_sessions").insert({ id: guestSessionId });

    const { error: err1 } = await client.from("test_attempts").insert({
      guest_session_id: guestSessionId,
      user_id: null,
      test_id: testId,
      access_type: "subscription",
      status: "in_progress",
      started_at: now.toISOString(),
      expires_at: later.toISOString(),
    });
    expect(err1).toBeDefined();
    expect(err1?.message).toContain("test_attempts_identity_access_type_check");

    // 2. Invalid: user_id with access_type = 'guest_free'
    const dummyEmail = `test_constraint_${Date.now()}@example.com`;
    const { data: userAuth } = await client.auth.admin.createUser({
      email: dummyEmail,
      password: "Password123!",
      email_confirm: true,
    });
    const userId = userAuth.user!.id;

    const { error: err2 } = await client.from("test_attempts").insert({
      user_id: userId,
      guest_session_id: null,
      test_id: testId,
      access_type: "guest_free",
      status: "in_progress",
      started_at: now.toISOString(),
      expires_at: later.toISOString(),
    });
    expect(err2).toBeDefined();
    expect(err2?.message).toContain("test_attempts_identity_access_type_check");

    // Cleanup
    await client.from("guest_sessions").delete().eq("id", guestSessionId);
    await client.from("user_entitlements").delete().eq("user_id", userId);
    await client.auth.admin.deleteUser(userId);
  }, 20000);

  it("provisions user_entitlements via trigger and isolates subscription attempts from free credits", async () => {
    const { data: tests } = await client
      .from("tests")
      .select("id")
      .eq("is_published", true)
      .limit(1);
    const testId = tests![0].id;

    const dummyEmail = `test_sub_flow_${Date.now()}@example.com`;
    const { data: userAuth } = await client.auth.admin.createUser({
      email: dummyEmail,
      password: "Password123!",
      email_confirm: true,
    });
    const userId = userAuth.user!.id;

    // Verify auto-provisioned entitlements
    const { data: ent } = await client
      .from("user_entitlements")
      .select("*")
      .eq("user_id", userId)
      .single();
    expect(ent).toBeDefined();
    expect(ent.free_attempt_limit).toBe(3);
    expect(ent.free_attempts_used).toBe(0);

    // Calling subscription attempt without active subscription fails
    const { error: subErr1 } = await client.rpc("start_subscription_attempt", {
      p_user_id: userId,
      p_test_id: testId,
    });
    expect(subErr1).toBeDefined();
    expect(subErr1?.message).toContain("NO_ACTIVE_SUBSCRIPTION");

    // Add active subscription
    const now = new Date(Date.now() - 60000);
    const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    await client.from("subscriptions").insert({
      user_id: userId,
      status: "active",
      starts_at: now.toISOString(),
      expires_at: expires.toISOString(),
    });

    // Start subscription attempt
    const { data: subAttempt, error: subErr2 } = await client.rpc(
      "start_subscription_attempt",
      {
        p_user_id: userId,
        p_test_id: testId,
      },
    );
    expect(subErr2).toBeNull();
    expect(subAttempt.access_type).toBe("subscription");

    // Calling again returns the resumable attempt
    const { data: resumedAttempt } = await client.rpc("start_subscription_attempt", {
      p_user_id: userId,
      p_test_id: testId,
    });
    expect(resumedAttempt.id).toBe(subAttempt.id);

    // Confirm free_attempts_used is STILL 0
    const { data: entAfter } = await client
      .from("user_entitlements")
      .select("free_attempts_used")
      .eq("user_id", userId)
      .single();
    expect(entAfter?.free_attempts_used).toBe(0);

    // Cleanup
    await client.from("test_attempts").delete().eq("user_id", userId);
    await client.from("subscriptions").delete().eq("user_id", userId);
    await client.from("user_entitlements").delete().eq("user_id", userId);
    await client.auth.admin.deleteUser(userId);
  }, 25000);
});
