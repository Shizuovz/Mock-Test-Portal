import { Metadata } from "next";
import Link from "next/link";
import { getAvailablePlans, getCurrentUserAccess } from "@/lib/billing/billing-service";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Check, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing & Plans — All-Access Pass | Mock Test Portal",
  description: "Prepare with authentic CBT mock tests for NSSB, SSC & NPSC. Start free or unlock all test series for 12 months for ₹499.",
};

export default async function PricingPage() {
  const plans = await getAvailablePlans();
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userProfile = null;
  let activePlanCode = "free";
  let subscriptionExpiry: string | null = null;
  let freeRemaining = 1;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone_number")
      .eq("id", user.id)
      .single();

    userProfile = {
      name: profile?.full_name || user.email?.split("@")[0] || "User",
      email: user.email || "",
      phone: profile?.phone_number || "",
    };

    const access = await getCurrentUserAccess(user.id);
    if (access.active) {
      activePlanCode = access.planCode;
      subscriptionExpiry = access.expiresAt;
    } else {
      freeRemaining = access.freeAttemptsRemaining ?? 0;
    }
  }

  // Authoritative paid plan (defaults to ₹499 All-Access Pass)
  const allAccessPlan = plans.find((p) => p.code === "all_access_12m") || plans[0];
  const isSubscriber = activePlanCode !== "free";

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-16 px-4 md:px-6 text-[#0F172A]">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Transparent Student Pricing
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-[#0F172A]">
            Prepare Without Limits
          </h1>
          <p className="mt-3 text-base text-[#64748B] max-w-2xl mx-auto">
            Take 1 free test as a guest, unlock 3 more with a free account, or get unlimited access to all NSSB, SSC &amp; NPSC test series for 12 months.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {/* Card 1: Free Preparation Tier */}
          <Card className="flex flex-col border border-[#E2E8F0] bg-white rounded-2xl shadow-xs relative">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-[#F1F5F9] px-2.5 py-1 text-xs font-bold text-[#475467]">
                  Free Tier
                </span>
                <span className="text-xs font-semibold text-[#16A34A]">No Card Required</span>
              </div>
              <CardTitle className="mt-3 text-2xl font-bold text-[#0F172A]">Free Access</CardTitle>
              <CardDescription className="text-sm text-[#64748B]">
                Experience real exam conditions before upgrading
              </CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#0F172A]">₹0</span>
                <span className="text-xs font-medium text-[#64748B]">/ forever</span>
              </div>
            </CardHeader>

            <CardContent className="p-8 pt-4 flex-grow">
              <div className="border-t border-[#F1F5F9] pt-4 space-y-3.5 text-sm text-[#334155]">
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <span><strong>1 Free Mock Test</strong> as a Guest (no sign-up required)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <span><strong>3 Additional Free Mocks</strong> when you create a free account</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>Official timer simulation &amp; real-time autosave</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>Authentic negative marking &amp; server-side scoring</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>Detailed answer keys &amp; KaTeX math explanations</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-8 pt-0">
              {isSubscriber ? (
                <Button variant="outline" className="w-full text-[#64748B]" disabled>
                  Included in your All-Access Pass
                </Button>
              ) : user ? (
                <Button variant="outline" className="w-full text-[#0F172A] border-[#CBD5E1]" asChild>
                  <Link href="/dashboard/tests">
                    {freeRemaining > 0 ? `Use Free Tests (${freeRemaining} Left)` : "Free Quota Completed"}
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" className="w-full text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]" asChild>
                  <Link href="/register">
                    Create Free Account (3 Tests) ➔
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Card 2: All-Access 12-Month Pass (Featured) */}
          <Card className="flex flex-col border-2 border-[#4F46E5] bg-white rounded-2xl shadow-xl relative overflow-hidden">
            {/* Top Ribbon */}
            <div className="bg-[#4F46E5] text-white py-1.5 px-4 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Zap className="h-3.5 w-3.5 fill-current" /> Recommended • Best Value
            </div>

            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-[#EEF2FF] px-2.5 py-1 text-xs font-bold text-[#4F46E5]">
                  12-Month Pass
                </span>
                <span className="text-xs font-semibold text-[#64748B]">Single Payment • No Auto-Renewal</span>
              </div>
              <CardTitle className="mt-3 text-2xl font-bold text-[#0F172A]">All-Access Unlimited Pass</CardTitle>
              <CardDescription className="text-sm text-[#64748B]">
                Full syllabus mastery for serious candidates
              </CardDescription>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-[#0F172A]">₹499</span>
                <span className="text-xs font-medium text-[#64748B]">/ 1 Year Full Access</span>
              </div>
            </CardHeader>

            <CardContent className="p-8 pt-4 flex-grow">
              <div className="border-t border-[#F1F5F9] pt-4 space-y-3.5 text-sm text-[#334155]">
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#4F46E5] shrink-0 mt-0.5" />
                  <span><strong>Unlimited mock tests</strong> across NSSB, SSC CGL &amp; NPSC series</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#4F46E5] shrink-0 mt-0.5" />
                  <span><strong>Unlimited test reattempts</strong> &amp; historical performance tracking</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#4F46E5] shrink-0 mt-0.5" />
                  <span><strong>Advanced Pacing Diagnostics</strong> (Time Traps &amp; Quick Wins breakdown)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#4F46E5] shrink-0 mt-0.5" />
                  <span><strong>Printable Scorecard</strong> &amp; PDF solution report export</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#4F46E5] shrink-0 mt-0.5" />
                  <span><strong>Instant access to all new tests</strong> published during your 12 months</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#4F46E5] shrink-0 mt-0.5" />
                  <span>Priority WhatsApp student query support</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-8 pt-0">
              {isSubscriber ? (
                <div className="w-full text-center p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-xs font-semibold text-[#065F46]">
                  ✓ Active Pass (Valid until {subscriptionExpiry ? new Date(subscriptionExpiry).toLocaleDateString() : "Active"})
                </div>
              ) : allAccessPlan ? (
                <CheckoutButton
                  planId={allAccessPlan.id}
                  pricePaise={allAccessPlan.pricePaise}
                  label="Unlock All-Access Pass (₹499) ➔"
                  variant="default"
                  className="w-full bg-[#4F46E5] hover:bg-[#4338CA] py-6 text-sm font-bold shadow-md transition"
                  user={userProfile || undefined}
                />
              ) : (
                <Button disabled className="w-full">
                  Plan unavailable
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Security and Trust Badges */}
        <div className="mt-14 border-t border-[#E2E8F0] pt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs text-[#64748B]">
          <div className="flex flex-col items-center">
            <ShieldCheck className="h-6 w-6 text-[#16A34A] mb-2" />
            <strong className="text-[#0F172A] font-semibold">100% Safe &amp; Secure</strong>
            <span className="mt-0.5">Encrypted payment processing via Razorpay (UPI, Cards, NetBanking)</span>
          </div>
          <div className="flex flex-col items-center">
            <Zap className="h-6 w-6 text-[#4F46E5] mb-2" />
            <strong className="text-[#0F172A] font-semibold">Instant Access Activation</strong>
            <span className="mt-0.5">Your unlimited test pass is immediately activated upon payment</span>
          </div>
          <div className="flex flex-col items-center">
            <Check className="h-6 w-6 text-[#0F172A] mb-2" />
            <strong className="text-[#0F172A] font-semibold">No Recurring Charges</strong>
            <span className="mt-0.5">One-time payment for 365 days. No unexpected renewals.</span>
          </div>
        </div>
      </div>
    </main>
  );
}
