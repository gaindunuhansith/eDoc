"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CreditCard,
  Check,
  X,
  ChevronRight as ChevronRightIcon,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useGetMyPaymentHistory, usePollPaymentByOrder, downloadInvoice, type PaymentStatus } from "@/api/paymentApi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const PAGE_SIZE = 10;

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function truncateId(id: string) {
  if (!id) return "—";
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

const statusLabel: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  SUCCESS: "Completed",
  FAILED: "Failed",
};

const statusClass: Record<PaymentStatus, string> = {
  SUCCESS: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400",
  PENDING: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400",
  FAILED: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400",
};

// ─── Webhook poll modal ──────────────────────────────────────────────────────

const POLL_TIMEOUT_MS = 45_000;

function PaymentPollModalInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const orderId = searchParams.get("order_id") ?? "";
  const [open, setOpen] = useState(!!orderId);
  const [polling, setPolling] = useState(!!orderId);
  const [timedOut, setTimedOut] = useState(false);

  const { data } = usePollPaymentByOrder(orderId, polling);
  const status = data?.status;

  // Stop polling once finalised
  useEffect(() => {
    if (status === "SUCCESS" || status === "FAILED") setPolling(false);
  }, [status]);

  // Timeout safety valve
  useEffect(() => {
    if (!orderId) return;
    const t = setTimeout(() => {
      setPolling(false);
      setTimedOut(true);
    }, POLL_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [orderId]);

  const handleClose = () => {
    setOpen(false);
    // Refresh payment history so the new status shows in the table
    qc.invalidateQueries({ queryKey: ["payment", "history"] });
    // Strip PayHere query params from the URL
    const url = new URL(window.location.href);
    ["order_id", "payment_id", "status_code"].forEach((k) => url.searchParams.delete(k));
    router.replace(url.pathname + (url.search || ""));
  };

  if (!orderId || !open) return null;

  const isLoading = !timedOut && (status === "PENDING" || !status);
  const isSuccess = status === "SUCCESS";
  const isFailed = status === "FAILED" || timedOut;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !isLoading) handleClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md text-center p-8 border-none shadow-2xl gap-0 rounded-2xl"
      >
        <DialogTitle className="sr-only">Payment Status</DialogTitle>
        <DialogDescription className="sr-only">Waiting for payment confirmation</DialogDescription>

        {isLoading && (
          <>
            <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center border-[3px] border-border mt-2 mb-6">
              <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
            </div>
            <div className="space-y-3 mb-8">
              <h2 className="text-[22px] font-semibold text-foreground tracking-tight">
                Processing Payment
              </h2>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                Please wait while we confirm your payment with PayHere&hellip;
              </p>
            </div>
          </>
        )}

        {isSuccess && (
          <>
            <div className="mx-auto w-14 h-14 text-emerald-500 rounded-full flex items-center justify-center border-[3px] border-emerald-500 mt-2 mb-6 shadow-sm">
              <Check className="w-8 h-8 stroke-3" />
            </div>
            <div className="space-y-3 mb-8">
              <h2 className="text-[22px] font-semibold text-foreground tracking-tight">
                Payment Confirmed
              </h2>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                Your appointment has been successfully paid.
              </p>
            </div>
            <div className="flex justify-center border-t border-border/40 pt-4 -mx-8 -mb-4">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground text-sm font-medium gap-1 h-auto py-2"
                onClick={handleClose}
              >
                Done <ChevronRightIcon className="w-4 h-4 ml-1 opacity-70" />
              </Button>
            </div>
          </>
        )}

        {isFailed && (
          <>
            <div className="mx-auto w-14 h-14 text-rose-500 rounded-full flex items-center justify-center border-[3px] border-rose-500 mt-2 mb-6">
              <X className="w-8 h-8" />
            </div>
            <div className="space-y-3 mb-8">
              <h2 className="text-[22px] font-semibold text-foreground tracking-tight">
                {timedOut ? "Confirmation Timed Out" : "Payment Failed"}
              </h2>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                {timedOut
                  ? "We couldn't confirm your payment in time. Check your transaction history below."
                  : "Your payment was not successful. Please try again."}
              </p>
            </div>
            <div className="flex justify-center border-t border-border/40 pt-4 -mx-8 -mb-4">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground text-sm font-medium gap-1 h-auto py-2"
                onClick={handleClose}
              >
                Close <ChevronRightIcon className="w-4 h-4 ml-1 opacity-70" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PaymentPollModal() {
  return (
    <Suspense fallback={null}>
      <PaymentPollModalInner />
    </Suspense>
  );
}

// ─── Payments page ────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, isError } = useGetMyPaymentHistory(page, PAGE_SIZE);

  const handleDownloadInvoice = async (id: string) => {
    try {
      const response = await downloadInvoice(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download invoice:", error);
      toast.error("Failed to download invoice. Please try again.");
    }
  };

  const filtered = useMemo(() => {
    if (!data?.content) return [];
    return data.content.filter((tx) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        tx.id.toLowerCase().includes(q) ||
        (tx.orderId ?? "").toLowerCase().includes(q) ||
        String(tx.appointmentId ?? "").includes(q);
      const matchesStatus =
        statusFilter === "all" || tx.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const startRow = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const endRow = Math.min((page + 1) * PAGE_SIZE, totalElements);

  const pageNumbers = useMemo(() => {
    const pages: (number | "…")[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (page > 2) pages.push("…");
      for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pages.push(i);
      if (page < totalPages - 3) pages.push("…");
      pages.push(totalPages - 1);
    }
    return pages;
  }, [totalPages, page]);

  return (
    <div className="w-full h-full p-6 lg:p-10 space-y-8">
      <PaymentPollModal />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Recent Transactions</h2>
      </div>

      <div className="flex flex-col space-y-6 w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or appointment"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-9 border-border/60 bg-background hover:border-border transition-colors h-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v); setPage(0); }}
            >
              <SelectTrigger className="w-35 border-border/60 bg-background hover:bg-muted/50 transition-colors h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SUCCESS">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-border/60 bg-muted/20 hover:bg-muted/20">
                <TableHead className="w-12 text-center px-4">
                  <Checkbox className="border-border/60 w-4 h-4" />
                </TableHead>
                <TableHead className="text-muted-foreground font-medium py-4">Appointment</TableHead>
                <TableHead className="text-muted-foreground font-medium py-4">Transaction ID</TableHead>
                <TableHead className="text-muted-foreground font-medium py-4">Payment Date</TableHead>
                <TableHead className="text-muted-foreground font-medium py-4">Amount</TableHead>
                <TableHead className="text-muted-foreground font-medium py-4 hidden md:table-cell">Receipt #</TableHead>
                <TableHead className="text-muted-foreground font-medium py-4">Status</TableHead>
                <TableHead className="text-muted-foreground font-medium py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <AlertCircle className="w-6 h-6 text-rose-500" />
                      <p className="text-sm">Failed to load transactions. Please try again.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && filtered.map((tx) => (
                <TableRow key={tx.id} className="border-border/60 hover:bg-muted/10 transition-colors group">
                  <TableCell className="text-center px-4">
                    <Checkbox className="border-border/60 w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </TableCell>
                  <TableCell className="py-4">
                    <p className="font-semibold text-foreground text-sm" title={tx.appointmentId}>
                      {tx.appointmentId ? `Appointment #${truncateId(tx.appointmentId)}` : "—"}
                    </p>
                  </TableCell>
                  <TableCell className="py-4 text-sm font-medium text-foreground" title={tx.orderId ?? tx.id}>
                    {truncateId(tx.orderId ?? tx.id)}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-sm text-foreground font-medium">{formatDate(tx.createdAt)}</div>
                    <div className="text-xs text-muted-foreground">{formatTime(tx.createdAt)}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-sm font-semibold text-foreground">
                      {formatAmount(tx.amount, tx.currency)}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-xs text-muted-foreground font-mono hidden md:table-cell max-w-45 truncate" title={tx.id}>
                    {truncateId(tx.id)}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col items-start gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium pointer-events-none capitalize shadow-sm",
                          statusClass[tx.status]
                        )}
                      >
                        {statusLabel[tx.status]}
                      </Badge>
                      {tx.status === "PENDING" && tx.appointmentId && (
                        <Button
                          size="sm"
                          className="h-7 px-3 text-xs gap-1.5"
                          onClick={() => router.push(`/patient/confirm-order?appointmentId=${tx.appointmentId}`)}
                        >
                          <CreditCard className="w-3 h-3" />
                          Complete Payment
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                      disabled={tx.status !== "SUCCESS"}
                      onClick={() => handleDownloadInvoice(tx.id)}
                      title="Download Invoice"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            {totalElements === 0
              ? "No transactions"
              : <>Showing <span className="font-medium text-foreground">{startRow}–{endRow}</span> of <span className="font-medium text-foreground">{totalElements}</span> transactions</>
            }
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-border/60 bg-background hover:bg-muted/50 transition-colors disabled:opacity-50"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {pageNumbers.map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === page ? "secondary" : "ghost"}
                    size="sm"
                    className="h-9 w-9 p-0 font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setPage(p as number)}
                  >
                    {(p as number) + 1}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-border/60 bg-background hover:bg-muted/50 transition-colors disabled:opacity-50"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
