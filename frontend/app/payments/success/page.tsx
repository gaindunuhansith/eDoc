"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentSuccessRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams();
    const orderId = searchParams.get("order_id");
    const paymentId = searchParams.get("payment_id");
    const statusCode = searchParams.get("status_code");
    if (orderId) params.set("order_id", orderId);
    if (paymentId) params.set("payment_id", paymentId);
    if (statusCode) params.set("status_code", statusCode);
    const qs = params.toString();
    router.replace(`/patient/payments${qs ? `?${qs}` : ""}`);
  }, [router, searchParams]);

  return null;
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessRedirect />
    </Suspense>
  );
}
