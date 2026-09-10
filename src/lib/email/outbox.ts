import { Resend } from "resend";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { renderPurchaseReceiptHtml, PurchaseReceiptPayload } from "./templates/purchase-receipt";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || "Mock Test Portal <onboarding@resend.dev>";

export interface ProcessOutboxResult {
  processed: number;
  succeeded: number;
  failed: number;
}

/**
 * Processes pending transactional emails from public.email_outbox.
 * Asynchronous, idempotent, and resilient against SMTP/API outages.
 */
export async function processEmailOutbox(batchLimit = 10): Promise<ProcessOutboxResult> {
  const supabase = createSupabaseAdminClient();

  const { data: pendingEmails, error } = await supabase
    .from("email_outbox")
    .select("*")
    .eq("status", "pending")
    .lt("attempts", 5)
    .order("created_at", { ascending: true })
    .limit(batchLimit);

  if (error || !pendingEmails || pendingEmails.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  let succeeded = 0;
  let failed = 0;

  const resend = resendApiKey ? new Resend(resendApiKey) : null;

  for (const item of pendingEmails) {
    try {
      if (!resend) {
        console.warn(`[EmailOutbox] RESEND_API_KEY missing. Simulating delivery to ${item.recipient_email}`);
        await supabase
          .from("email_outbox")
          .update({ status: "sent", sent_at: new Date().toISOString(), attempts: item.attempts + 1 })
          .eq("id", item.id);
        succeeded++;
        continue;
      }

      let subject = "Notification from Mock Test Portal";
      let html = "<p>Notification</p>";

      if (item.template_type === "purchase_receipt") {
        subject = "Payment Receipt: Your All-Access Pass is Active";
        html = renderPurchaseReceiptHtml(item.payload as PurchaseReceiptPayload);
      }

      const sendResult = await resend.emails.send({
        from: emailFrom,
        to: item.recipient_email,
        subject,
        html,
        headers: {
          "X-Entity-Ref-ID": item.idempotency_key,
        },
      });

      if (sendResult.error) {
        throw new Error(sendResult.error.message);
      }

      await supabase
        .from("email_outbox")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          attempts: item.attempts + 1,
        })
        .eq("id", item.id);

      succeeded++;
    } catch (sendErr: any) {
      console.error(`[EmailOutbox] Failed sending email ${item.id} to ${item.recipient_email}:`, sendErr);
      failed++;

      await supabase
        .from("email_outbox")
        .update({
          attempts: item.attempts + 1,
          last_error: sendErr.message || "Unknown delivery error",
          status: item.attempts + 1 >= 5 ? "failed" : "pending",
        })
        .eq("id", item.id);
    }
  }

  return { processed: pendingEmails.length, succeeded, failed };
}
