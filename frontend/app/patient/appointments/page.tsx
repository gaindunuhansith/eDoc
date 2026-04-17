"use client";

import { useState } from "react";
import { CalendarDays, Clock, Stethoscope, Video, Building2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useGetMyPatientProfile } from "@/api/patientApi";
import { BookAppointmentDialog } from "./BookAppointmentDialog";
import {
  useGetAppointmentsByPatient,
  useCancelAppointment,
  type Appointment,
  type AppointmentStatus,
} from "@/api/appointmentApi";
import { useGetFeedbackByAppointment, useGetFeedbackByPatient } from "@/api/feedbackApi";
import { MessageSquare, Star } from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING:   { label: "Pending",   className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-100 text-blue-800 border-blue-200" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800 border-green-200" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
  REJECTED:  { label: "Rejected",  className: "bg-red-100 text-red-800 border-red-200" },
  NO_SHOW:   { label: "No Show",   className: "bg-gray-100 text-gray-600 border-gray-200" },
};

type TabFilter = "ALL" | "UPCOMING" | "COMPLETED" | "CANCELLED";

const UPCOMING_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED"];
const CANCELLED_STATUSES: AppointmentStatus[] = ["CANCELLED", "REJECTED", "NO_SHOW"];

function filterAppointments(list: Appointment[], tab: TabFilter): Appointment[] {
  switch (tab) {
    case "UPCOMING":   return list.filter((a) => UPCOMING_STATUSES.includes(a.status));
    case "COMPLETED":  return list.filter((a) => a.status === "COMPLETED");
    case "CANCELLED":  return list.filter((a) => CANCELLED_STATUSES.includes(a.status));
    default:           return list;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [tab, setTab] = useState<TabFilter>("ALL");
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const router = useRouter();

  const { data: patient, isLoading: patientLoading } = useGetMyPatientProfile();
  const patientId = patient?.id ? String(patient.id) : "";

  const { data: appointments = [], isLoading: apptLoading } =
    useGetAppointmentsByPatient(patientId);

  const { data: feedbackData, isLoading: feedbackLoading, error: feedbackError } = useGetFeedbackByPatient(patient?.id ? String(patient.id) : "");

  const cancelMutation = useCancelAppointment();

  const isLoading = patientLoading || apptLoading;
  const filtered = filterAppointments(appointments, tab);

  const handleCancel = () => {
    if (!cancelTarget) return;
    cancelMutation.mutate(
      { id: cancelTarget.id, reason: "Cancelled by patient" },
      {
        onSuccess: () => {
          toast.success("Appointment cancelled");
          setCancelTarget(null);
        },
        onError: () => {
          toast.error("Failed to cancel appointment");
          setCancelTarget(null);
        },
      }
    );
  };

  const canCancel = (status: AppointmentStatus) =>
    status === "PENDING" || status === "CONFIRMED";

  // Check if feedback exists for an appointment
  const checkFeedbackExists = (appointmentId: string) => {
    if (feedbackLoading || feedbackError) return false; // Show button while loading or on error
    if (!feedbackData) return false;
    return feedbackData.some(feedback => feedback.appointmentId === Number(appointmentId));
  };

  const handleLeaveFeedback = (appointment: Appointment) => {
    // Validate appointment data
    if (!appointment.id || !appointment.doctorId) {
      toast.error("Invalid appointment data. Please refresh and try again.");
      return;
    }

    // Check if feedback already exists (double-check)
    if (checkFeedbackExists(appointment.id.toString())) {
      toast.error("Feedback already exists for this appointment.");
      return;
    }

    // Navigate to feedback creation with appointment data
    router.push(`/patient/feedback/submit/${appointment.id}?doctorId=${appointment.doctorId}&doctorName=${appointment.doctorName || 'Doctor'}`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Appointments</h1>
          <p className="text-gray-500 mt-1 text-sm">View and manage your appointments</p>
        </div>
        <Button
          onClick={() => setBookingOpen(true)}
          disabled={!patientId}
          className="shrink-0"
        >
          + Book Appointment
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabFilter)}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="UPCOMING">Upcoming</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Feedback Summary */}
      {filtered.some(appt => appt.status === "COMPLETED") && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Feedback Summary</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-blue-700">
                  {filtered.filter(appt => appt.status === "COMPLETED" && checkFeedbackExists(appt.id)).length} of{" "}
                  {filtered.filter(appt => appt.status === "COMPLETED").length} completed appointments have feedback
                </span>
                {(() => {
                  const completedCount = filtered.filter(appt => appt.status === "COMPLETED").length;
                  const feedbackCount = filtered.filter(appt => appt.status === "COMPLETED" && checkFeedbackExists(appt.id)).length;
                  const percentage = completedCount > 0 ? Math.round((feedbackCount / completedCount) * 100) : 0;
                  return (
                    <span className={`font-medium ${percentage === 100 ? 'text-green-600' : percentage >= 50 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {percentage}% completion rate
                    </span>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="bg-white border border-gray-200 shadow-none">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-base font-medium text-gray-700">
            {filtered.length} appointment{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CalendarDays className="h-10 w-10 mb-3 opacity-40" />
              <p className="font-medium">No appointments found</p>
              <p className="text-sm mt-1">
                {tab === "ALL"
                  ? "You have no appointments yet."
                  : `No ${tab.toLowerCase()} appointments.`}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Doctor</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time Slot</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fee</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Feedback</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((appt) => {
                  const badge = STATUS_BADGE[appt.status];
                  return (
                    <TableRow key={appt.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-gray-400 shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {appt.doctorName ?? "—"}
                            </p>
                            {appt.doctorSpecialty && (
                              <p className="text-xs text-gray-500">{appt.doctorSpecialty}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                          {formatDate(appt.appointmentDate)}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">
                          {appt.dayOfWeek.charAt(0) + appt.dayOfWeek.slice(1).toLowerCase()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {appt.timeSlot}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          {appt.type === "VIDEO" ? (
                            <Video className="h-3.5 w-3.5 text-purple-500" />
                          ) : (
                            <Building2 className="h-3.5 w-3.5 text-blue-500" />
                          )}
                          {appt.type === "VIDEO" ? "Video" : "In Person"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-800">
                        {appt.consultationFee != null
                          ? `LKR ${appt.consultationFee.toLocaleString()}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {appt.status === "COMPLETED" ? (
                          checkFeedbackExists(appt.id) ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium">Submitted</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-orange-600">
                              <Star className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium">Pending</span>
                            </div>
                          )
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {canCancel(appt.status) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-3"
                            onClick={() => setCancelTarget(appt)}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Cancel
                          </Button>
                        )}
                        {appt.status === "COMPLETED" && !checkFeedbackExists(appt.id) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-8 px-3"
                            onClick={() => handleLeaveFeedback(appt)}
                          >
                            <Star className="h-3.5 w-3.5 mr-1" />
                            Leave Feedback
                          </Button>
                        )}
                        {appt.status === "COMPLETED" && checkFeedbackExists(appt.id) && (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Feedback Submitted
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Book Appointment Dialog */}
      <BookAppointmentDialog
        patientId={patientId}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your appointment with{" "}
              <span className="font-medium text-gray-900">
                {cancelTarget?.doctorName ?? "this doctor"}
              </span>{" "}
              on{" "}
              <span className="font-medium text-gray-900">
                {cancelTarget ? formatDate(cancelTarget.appointmentDate) : ""}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelMutation.isPending ? "Cancelling…" : "Yes, Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
