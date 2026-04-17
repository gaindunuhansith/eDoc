"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CreditCard,
  User,
  Calendar,
  Hash,
  MapPin,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useGetPaymentById, type PaymentStatus } from "@/api/paymentApi";

const statusLabel: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  SUCCESS: "Completed",
  FAILED: "Failed",
};

const statusClass: Record<PaymentStatus, string> = {
  SUCCESS:
    "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400",
  PENDING:
    "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400",
  FAILED:
    "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400",
};

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {label}
      </span>
      <span
        className={cn(
          "text-sm text-foreground break-all",
          mono && "font-mono"
        )}
      >
        {value || "—"}
      </span>
    </div>
  );
}

export default function AdminPaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, isError } = useGetPaymentById(id ?? "");

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-10">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-10 text-muted-foreground">
        <AlertCircle className="w-7 h-7 text-rose-500" />
        <p className="text-sm">Failed to load payment details.</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 lg:p-10 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Payment Details
          </h2>
          <p className="text-sm text-muted-foreground font-mono mt-0.5 truncate">
            {data.id as unknown as string}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-sm font-medium shadow-sm shrink-0",
            statusClass[data.status]
          )}
        >
          {statusLabel[data.status]}
        </Badge>
      </div>

      {/* Amount Hero */}
      <div className="rounded-xl border border-border/60 bg-muted/20 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-background border border-border/60 flex items-center justify-center shadow-sm">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Amount
            </p>
            <p className="text-2xl font-bold text-foreground">
              {formatAmount(data.amount, data.currency)}
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>
            Created:{" "}
            <span className="text-foreground font-medium">
              {formatDateTime(data.createdAt)}
            </span>
          </p>
          {data.updatedAt && (
            <p className="mt-0.5">
              Updated:{" "}
              <span className="text-foreground font-medium">
                {formatDateTime(data.updatedAt)}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Info */}
        <div className="rounded-xl border border-border/60 bg-background p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Hash className="w-4 h-4 text-muted-foreground" />
            Transaction Info
          </div>
          <Separator className="bg-border/40" />
          <div className="grid grid-cols-1 gap-4">
            <InfoRow label="Payment ID" value={data.id as unknown as string} mono />
            <InfoRow label="Order ID" value={data.orderId} mono />
            <InfoRow label="PayHere ID" value={data.payhereId} mono />
            <InfoRow
              label="Appointment ID"
              value={
                data.appointmentId
                  ? `#${data.appointmentId}`
                  : null
              }
            />
          </div>
        </div>

        {/* User Info */}
        <div className="rounded-xl border border-border/60 bg-background p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <User className="w-4 h-4 text-muted-foreground" />
            User Info
          </div>
          <Separator className="bg-border/40" />
          <div className="grid grid-cols-1 gap-4">
            <InfoRow label="User ID" value={data.userId} mono />
            {data.billing && (
              <>
                <InfoRow label="Full Name" value={data.billing.fullName} />
                <InfoRow label="Email" value={data.billing.email} />
                <InfoRow label="Phone" value={data.billing.phone} />
              </>
            )}
          </div>
        </div>

        {/* Billing Address */}
        {data.billing && (data.billing.address || data.billing.city || data.billing.country) && (
          <div className="rounded-xl border border-border/60 bg-background p-6 space-y-5 lg:col-span-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Billing Address
            </div>
            <Separator className="bg-border/40" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InfoRow label="Address" value={data.billing.address} />
              <InfoRow label="City" value={data.billing.city} />
              <InfoRow label="Country" value={data.billing.country} />
            </div>
          </div>
        )}
      </div>

      {/* Transaction Logs */}
      {data.transactionLogs && data.transactionLogs.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-background p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Transaction Log
            <span className="ml-1 text-xs text-muted-foreground font-normal">
              ({data.transactionLogs.length} events)
            </span>
          </div>
          <Separator className="bg-border/40" />
          <div className="space-y-3">
            {data.transactionLogs.map((log) => (
              <div
                key={log.id as unknown as string}
                className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 rounded-lg bg-muted/30 border border-border/40 px-4 py-3"
              >
                <div className="shrink-0 text-xs text-muted-foreground font-mono whitespace-nowrap">
                  {formatDateTime(log.createdAt)}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium text-foreground">{log.event}</p>
                  {log.rawPayload && (
                    <pre className="text-xs text-muted-foreground bg-muted/60 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(log.rawPayload), null, 2);
                        } catch {
                          return log.rawPayload;
                        }
                      })()}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
