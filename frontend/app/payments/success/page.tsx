"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(true);

  const orderId = useMemo(() => searchParams.get("order_id") ?? "", [searchParams]);

  const buildDashboardUrl = () =>
    orderId
      ? `/patient?payment=success&order_id=${encodeURIComponent(orderId)}`
      : "/patient?payment=success";

  const handleContinue = () => {
    router.replace(buildDashboardUrl());
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace(buildDashboardUrl());
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [router, orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-md text-center p-8 border-none shadow-2xl gap-0 rounded-2xl"
        >
          <DialogTitle className="sr-only">Payment Successful</DialogTitle>
          <DialogDescription className="sr-only">
            Your payment has been completed successfully.
          </DialogDescription>

          <div className="mx-auto w-14 h-14 text-emerald-500 rounded-full flex items-center justify-center border-[3px] border-emerald-500 mt-2 mb-6 shadow-sm">
            <Check className="w-8 h-8 stroke-3" />
          </div>

          <div className="space-y-3 mb-8">
            <h2 className="text-[22px] font-semibold text-foreground tracking-tight">
              Payment Successful
            </h2>
            <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
              Your payment is marked as successful.
              {orderId ? ` Order ID: ${orderId}` : ""}
            </p>
          </div>

          <div className="flex justify-center border-t border-border/40 pt-4 -mx-8 -mb-4">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground text-sm font-medium gap-1 h-auto py-2"
              onClick={handleContinue}
            >
              Okay <ChevronRight className="w-4 h-4 ml-1 opacity-70" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
