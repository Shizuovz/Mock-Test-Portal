import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPaymentOrder } from "@/lib/payments/create-order";
import { checkRateLimit, buildRateLimitKey } from "@/lib/security/rate-limit";
import { z } from "zod";

const createOrderSchema = z.object({
  planId: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate Limiting (5 requests per 5 minutes per user)
    const rateLimitKey = buildRateLimitKey("payment_create", "user", user.id);
    const isAllowed = await checkRateLimit({
      key: rateLimitKey,
      limit: 5,
      windowSeconds: 300,
    });

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many checkout requests. Please wait a few minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const result = await createPaymentOrder({
      userId: user.id,
      userEmail: user.email || "",
      planId: parsed.data.planId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API] create-order unhandled error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
