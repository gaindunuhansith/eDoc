"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Video,
  Building2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useGetMyDoctorProfile } from "@/api/doctorApi";
import {
  useGetAppointmentsByDoctor,
  useUpdateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
} from "@/api/appointmentApi";
import { useCreateSession } from "@/api/telemedicineApi";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING:   { label: "Pending",   className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-100  text-blue-800  border-blue-200"  },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800 border-green-200" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100   text-red-800   border-red-200"   },
  REJECTED:  { label: "Rejected",  className: "bg-red-100   text-red-800   border-red-200"   },
  NO_SHOW:   { label: "No Show",   className: "bg-gray-100  text-gray-600  border-gray-200"  },
};

type TabFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

function filterList(list: Appointment[], tab: TabFilter): Appointment[] {
  switch (tab) {
    case "PENDING":   return list.filter((a) => a.status === "PENDING");
    case "CONFIRMED": return list.filter((a) => a.status === "CONFIRMED");
    case "COMPLETED": return list.filter((a) => a.status === "COMPLETED");
    case "CANCELLED": return list.filter((a) => ["CANCELLED", "REJECTED", "NO_SHOW"].includes(a.status));
    default:          return list;
  }
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-border/60">
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Reject Dialog ────────────────────────────────────────────────────────────

function RejectDialog({
  open,
  onClose,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Appointment</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="reject-reason">Reason (optional)</Label>
          <Textarea
            id="reject-reason"
            placeholder="Let the patient know why this slot doesn't work..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Rejecting…" : "Reject Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Appointment Card ─────────────────────────────────────────────────────────

function AppointmentCard({ appt, onAccept, onReject, onComplete, onGoToSession }: {
  appt: Appointment;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onComplete: (id: string) => void;
  onGoToSession: (id: string) => void;
}) {
  const badge = STATUS_BADGE[appt.status];

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <User className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="font-medium text-sm truncate">Patient ID: {appt.patientId}</span>
        </div>
        <Badge className={`shrink-0 text-xs border ${badge.className}`}>{badge.label}</Badge>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Date / Time / Type row */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {formatDate(appt.appointmentDate)} &nbsp;({appt.dayOfWeek})
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {appt.timeSlot}
          </span>
          <span className="flex items-center gap-1.5">
            {appt.type === "VIDEO"
              ? <Video className="w-3.5 h-3.5" />
              : <Building2 className="w-3.5 h-3.5" />}
            {appt.type === "VIDEO" ? "Video Call" : "In-Person"}
          </span>
        </div>

        {/* Reason */}
        {appt.reasonForVisit && (
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <Stethoscope className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span className="italic">{appt.reasonForVisit}</span>
          </div>
        )}

        {/* Doctor notes */}
        {appt.doctorNotes && (
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{appt.doctorNotes}</span>
          </div>
        )}

        {/* Cancellation / rejection reason */}
        {appt.cancellationReason && (
          <p className="text-xs text-red-600 italic">Reason: {appt.cancellationReason}</p>
        )}

        {/* Accept / Reject — only for PENDING */}
        {appt.status === "PENDING" && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="gap-1.5 h-8 text-xs bg-green-600 hover:bg-green-700"
              onClick={() => onAccept(appt.id)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-8 text-xs border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => onReject(appt.id)}
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </Button>
          </div>
        )}

        {/* Mark as Completed — only for CONFIRMED */}
        {appt.status === "CONFIRMED" && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="gap-1.5 h-8 text-xs bg-blue-600 hover:bg-blue-700"
              onClick={() => onComplete(appt.id)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark as Completed
            </Button>
            {appt.type === "VIDEO" && (
              <Button
                size="sm"
                className="gap-1.5 h-8 text-xs bg-violet-600 hover:bg-violet-700"
                onClick={() => onGoToSession(appt.id)}
              >
                <Video className="h-3.5 w-3.5" />
                Go to Session
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabFilter>("ALL");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [acceptId, setAcceptId] = useState<string | null>(null);
  const [completeId, setCompleteId] = useState<string | null>(null);

  const { data: doctor, isLoading: doctorLoading } = useGetMyDoctorProfile();
  const { data: appointments = [], isLoading: apptLoading } =
    useGetAppointmentsByDoctor(doctor?.id ?? "");
  const updateStatus = useUpdateAppointmentStatus();
  const createSession = useCreateSession();

  const isLoading = doctorLoading || (!!doctor?.id && apptLoading);

  const confirmAccept = () => {
    if (!acceptId) return;
    const appt = appointments.find((a) => a.id === acceptId);
    updateStatus.mutate(
      { id: acceptId, update: { status: "CONFIRMED" } },
      {
        onSuccess: () => {
          toast.success("Appointment confirmed. Patient has been notified.");
          if (appt?.type === "VIDEO") {
            createSession.mutate(
              { appointmentId: appt.id, doctorId: appt.doctorId, patientId: appt.patientId },
              {
                onSuccess: () => toast.success("Video session created."),
                onError: () => toast.error("Appointment confirmed but failed to create video session."),
              }
            );
          }
        },
        onError: () => toast.error("Failed to confirm appointment."),
      }
    );
    setAcceptId(null);
  };

  const confirmReject = (reason: string) => {
    if (!rejectId) return;
    updateStatus.mutate(
      { id: rejectId, update: { status: "REJECTED", cancellationReason: reason } },
      {
        onSuccess: () => toast.success("Appointment rejected. Patient has been notified."),
        onError: () => toast.error("Failed to reject appointment."),
      }
    );
    setRejectId(null);
  };

  const confirmComplete = () => {
    if (!completeId) return;
    updateStatus.mutate(
      { id: completeId, update: { status: "COMPLETED" } },
      {
        onSuccess: () => toast.success("Appointment marked as completed. Patient has been notified."),
        onError: () => toast.error("Failed to complete appointment."),
      }
    );
    setCompleteId(null);
  };

  const sorted = [...appointments].sort(
    (a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
  );
  const filtered = filterList(sorted, tab);

  const counts = {
    ALL:       appointments.length,
    PENDING:   appointments.filter((a) => a.status === "PENDING").length,
    CONFIRMED: appointments.filter((a) => a.status === "CONFIRMED").length,
    COMPLETED: appointments.filter((a) => a.status === "COMPLETED").length,
    CANCELLED: appointments.filter((a) => ["CANCELLED", "REJECTED", "NO_SHOW"].includes(a.status)).length,
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Appointments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review and manage your patient appointments
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabFilter)}>
        <TabsList className="flex-wrap h-auto gap-1">
          {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as TabFilter[]).map((t) => (
            <TabsTrigger key={t} value={t} className="text-xs">
              {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
              {counts[t] > 0 && (
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                  {counts[t]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <CardSkeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No appointments found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appt={appt}
              onAccept={setAcceptId}
              onReject={setRejectId}
              onComplete={setCompleteId}
              onGoToSession={(id) => router.push(`/doctor/telemedicine/session/${id}`)}
            />
          ))}
        </div>
      )}

      {/* Accept confirm dialog */}
      <AlertDialog open={!!acceptId} onOpenChange={(v) => !v && setAcceptId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              The patient will be notified via email and SMS that their appointment is confirmed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmAccept}
            >
              Yes, Accept
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject dialog */}
      <RejectDialog
        open={!!rejectId}
        onClose={() => setRejectId(null)}
        onConfirm={confirmReject}
        isPending={updateStatus.isPending}
      />

      {/* Complete confirm dialog */}
      <AlertDialog open={!!completeId} onOpenChange={(v) => !v && setCompleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Completed?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the appointment as completed and notify the patient. The patient will be able to leave feedback after this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 hover:bg-blue-700"
              onClick={confirmComplete}
            >
              Yes, Mark Completed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

