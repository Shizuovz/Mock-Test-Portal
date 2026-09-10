import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserAccess } from "@/lib/billing/billing-service";
import { CheckCircle2, ShieldCheck, Receipt, Sparkles, Calendar, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Billing & Receipts | Mock Test Portal",
  description: "Manage your subscription, view payment history, and download payment receipts.",
};

export default async function BillingDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const access = await getCurrentUserAccess(user.id);

  // Fetch past payments with snapshots
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const isSubscribed = access.active;
  const expiryDate = access.expiresAt
    ? new Date(access.expiresAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-10 px-4 md:px-8 text-[#0F172A]">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Subscription &amp; Payments
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0F172A]">
            Billing &amp; Receipts
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Review your active portal entitlements and access historical payment receipts.
          </p>
        </div>

        {/* Active Plan Card */}
        <Card className="rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
          <CardHeader className="p-6 md:p-8 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Current Membership
                </span>
                <CardTitle className="mt-1 text-2xl font-bold text-[#0F172A]">
                  {isSubscribed ? "All-Access Pass (12 Months)" : "Free Preparation Tier"}
                </CardTitle>
                <CardDescription className="text-sm text-[#64748B]">
                  {isSubscribed
                    ? `Unlimited access to all NSSB, SSC & NPSC test series and solutions.`
                    : `You have ${access.freeAttemptsRemaining ?? 0} free mock test credit(s) remaining.`}
                </CardDescription>
              </div>

              {isSubscribed ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#059669]">
                  <CheckCircle2 className="h-4 w-4" /> Active Subscription
                </span>
              ) : (
                <Link href="/pricing">
                  <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs rounded-lg px-4 py-2">
                    Upgrade to All-Access (₹499)
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>

          {isSubscribed && (
            <CardContent className="p-6 md:p-8 pt-0 border-t border-[#F1F5F9] mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[#64748B]" />
                  <div>
                    <p className="text-xs text-[#64748B]">Subscription Validity</p>
                    <p className="font-semibold text-[#0F172A]">Valid until {expiryDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#059669]" />
                  <div>
                    <p className="text-xs text-[#64748B]">Entitlement Tier</p>
                    <p className="font-semibold text-[#0F172A]">Full Unrestricted Mock Access</p>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Transaction History & Receipts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[#4F46E5]" /> Payment History
            </h2>
            <span className="text-xs text-[#64748B]">
              Official payment receipts for subscription purchases
            </span>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
            {payments && payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#0F172A]">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    <tr>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {payments.map((p) => {
                      const date = new Date(p.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      });
                      const amountFormatted = (p.amount_paise / 100).toFixed(2);

                      return (
                        <tr key={p.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-4 px-4 font-medium text-[#334155]">{date}</td>
                          <td className="py-4 px-4 font-semibold text-[#0F172A]">
                            {p.plan_name || "All-Access Pass"}
                          </td>
                          <td className="py-4 px-4 font-mono text-xs text-[#64748B]">
                            {p.provider_order_id || p.id.slice(0, 12)}
                          </td>
                          <td className="py-4 px-4 font-bold text-[#0F172A]">
                            ₹{amountFormatted}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                p.status === "captured"
                                  ? "bg-[#ECFDF5] text-[#059669]"
                                  : p.status === "pending"
                                  ? "bg-[#FEF9C3] text-[#A16207]"
                                  : "bg-[#FEF2F2] text-[#DC2626]"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-[#64748B]">
                <Receipt className="mx-auto h-8 w-8 text-[#CBD5E1] mb-2" />
                <p>No billing transactions found.</p>
                <Link href="/pricing" className="text-[#4F46E5] font-semibold hover:underline mt-1 inline-block">
                  View Available Plans →
                </Link>
              </div>
            )}
          </div>
          <p className="text-xs text-[#94A3B8] text-center">
            * Documents generated represent official payment receipts. Need assistance? Contact{" "}
            <a href="mailto:support@mocktestportal.com" className="text-[#4F46E5] hover:underline">
              support@mocktestportal.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
