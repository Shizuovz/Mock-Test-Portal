import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyPayment } from "@/lib/payments/verify-payment";
import { checkRateLimit, buildRateLimitKey } from "@/lib/security/rate-limit";
import { z } from "zod";

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
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

    // Rate limiting: 10 verify attempts per 5 minutes
    const rateLimitKey = buildRateLimitKey("payment_verify", "user", user.id);
    const isAllowed = await checkRateLimit({
      key: rateLimitKey,
      limit: 10,
      windowSeconds: 300,
    });

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please wait." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = verifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 });
    }

    const result = await verifyPayment({
      userId: user.id,
      razorpayOrderId: parsed.data.razorpayOrderId,
      razorpayPaymentId: parsed.data.razorpayPaymentId,
      razorpaySignature: parsed.data.razorpaySignature,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API] verify payment unhandled error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
