import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const startTime = Date.now();
  let dbStatus: "connected" | "unreachable" = "unreachable";
  let latencyMs = 0;

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("system_settings").select("key").limit(1);

    latencyMs = Date.now() - startTime;
    if (!error) {
      dbStatus = "connected";
    }
  } catch (err) {
    dbStatus = "unreachable";
    latencyMs = Date.now() - startTime;
  }

  const isHealthy = dbStatus === "connected";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      services: {
        database: dbStatus,
        latencyMs,
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
