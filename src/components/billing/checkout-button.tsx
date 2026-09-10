"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Button } from "@/components/ui/button";

interface CheckoutButtonProps {
  planId: string;
  pricePaise: number;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  className?: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
}

export function CheckoutButton({ planId, label = "Upgrade Now", variant = "default", className, user }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    if (!user) {
      // Direct to login/register if unauthenticated
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(`/register?returnUrl=${encodeURIComponent("/pricing")}` as any);
      return;
    }

    setLoading(true);
    try {
      // 1. Create order on our server
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (!res.ok) {
        throw new Error("Failed to initialize checkout.");
      }

      const { orderId, amount, currency, key } = await res.json();

      // 2. Open Razorpay Popup
      const options = {
        key,
        amount,
        currency,
        name: "Mock Test Portal",
        description: "Premium Access Pass",
        order_id: orderId,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        theme: {
          color: "#0f172a", // Slate 900
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const err = await verifyRes.json();
              throw new Error(err.error || "Failed to verify payment");
            }

            alert("Payment successful! Your All-Access Pass has been activated.");
            router.push("/dashboard/tests");
            router.refresh();
          } catch (verifyErr) {
            console.error("Verification failed:", verifyErr);
            alert("Payment received! It may take a minute for access to show up.");
            router.push("/dashboard");
            router.refresh();
          }
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const razorpay = new (window as any).Razorpay(options);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        alert("Payment failed. Please try again.");
      });

      razorpay.open();

    } catch (err) {
      console.error(err);
      alert("Something went wrong initializing the checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Button 
        onClick={handlePayment} 
        disabled={loading} 
        variant={variant}
        className={className}
      >
        {loading ? "Processing..." : label}
      </Button>
    </>
  );
}
