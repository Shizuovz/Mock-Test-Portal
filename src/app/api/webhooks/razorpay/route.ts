import { NextResponse } from "next/server";
import { verifyAndProcessWebhook } from "@/lib/payments/verify-webhook";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const result = await verifyAndProcessWebhook({
      rawBody,
      signature,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ message: result.message }, { status: result.status });
  } catch (error: any) {
    console.error("[Webhooks] Unhandled webhook route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
