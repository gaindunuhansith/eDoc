"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  CalendarDays, Clock, Building2, Video, 
  XCircle, Trash2, Edit, CreditCard 
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

import { useGetMyPatientProfile } from "@/api/patientApi";
import { useStore } from "@/store/store";
import {
  useGetAppointmentsByPatient,
  useCancelAppointment,
  useDeleteAppointment,
  type Appointment,
  type AppointmentStatus,
  type PaymentStatus
} from "@/api/appointmentApi";
import { useGetMyFeedback } from "@/api/feedbackApi";
import { MessageSquare, Star } from "lucide-react";
import { ModifyAppointmentDialog } from "./ModifyAppointmentDialog";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING:   { label: "Pending",   className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-100 text-blue-800 border-blue-200" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800 border-green-200" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
  REJECTED:  { label: "Rejected",  className: "bg-gray-200 text-gray-800 border-gray-300" },
  NO_SHOW:   { label: "No Show",   className: "bg-orange-100 text-orange-800 border-orange-200" },
};

const PAYMENT_BADGE: Record<PaymentStatus, { label: string; className: string }> = {
  NOT_REQUIRED: { label: "Not Req.", className: "bg-gray-100 text-gray-600 border-gray-200" },
  PENDING:      { label: "Pay Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  SUCCESS:      { label: "Paid", className: "bg-green-100 text-green-800 border-green-200" },
  FAILED:       { label: "Failed", className: "bg-red-100 text-red-800 border-red-200" },
};

type TabFilter = "ALL" | "UPCOMING" | "COMPLETED" | "CANCELLED";

const UPCOMING_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED"];
const CANCELLED_STATUSES: AppointmentStatus[] = ["CANCELLED", "REJECTED", "NO_SHOW"];

function filterAppointments(list: Appointment[], tab: TabFilter): Appointment[] {
  switch (tab) {
    case "UPCOMING": {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // start of today
      return list.filter((a) => {
        if (!UPCOMING_STATUSES.includes(a.status)) return false;
        const apptDate = new Date(a.appointmentDate);
        return apptDate >= now;
      });
    }
    case "COMPLETED":  return list.filter((a) => a.status === "COMPLETED");
    case "CANCELLED":  return list.filter((a) => CANCELLED_STATUSES.includes(a.status));
    default:           return list;
  }
}

function formatDateDisplay(dateStr: string) {
  try {
    return format(new Date(dateStr), "EEEE, MMMM d yyyy");
  } catch(e) {
    return dateStr;
  }
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse shadow-sm">
          <CardContent className="h-56 bg-gray-50/70 p-4" />
        </Card>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppointmentsHistoryPage() {
  const router = useRouter();

  const [tab, setTab] = useState<TabFilter>("ALL");
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [modifyTarget, setModifyTarget] = useState<Appointment | null>(null);

  const user = useStore((s) => s.user);
  const { data: patient, isLoading: patientLoading } = useGetMyPatientProfile();
  const patientId = patient?.id ? String(patient.id) : "";

  // Fetch patient appointments only
  const { data: appointmentsRaw = [], isLoading: apptLoading } =
    useGetAppointmentsByPatient(patientId);

  const { data: feedbackData } = useGetMyFeedback();

  // Build a set of appointment IDs that already have feedback submitted
  const feedbackedAppointmentIds = new Set(
    (feedbackData || []).map((f) => String(f.appointmentId))
  );

  // Sort most recent first
  const appointments = [...appointmentsRaw].sort((a, b) => {
    return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
  });

  const cancelMutation = useCancelAppointment();
  const deleteMutation = useDeleteAppointment();

  const isLoading = patientLoading || apptLoading;
  const patientAppointments = appointments.filter(
    (appointment) => String(appointment.patientId) === patientId
  );
  const filtered = filterAppointments(patientAppointments, tab);

  // -- Handlers --
  const handleCancelConfirm = () => {
    if (!cancelTarget) return;
    cancelMutation.mutate(
      { id: cancelTarget.id, reason: cancelReason || "Cancelled by patient" },
      {
        onSuccess: () => {
          toast.success("Appointment cancelled successfully.");
          setCancelTarget(null);
          setCancelReason("");
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || "Failed to cancel appointment";
          toast.error(msg);
          setCancelTarget(null);
          setCancelReason("");
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget || !patientId) return;
    deleteMutation.mutate(
      { id: deleteTarget.id },
      {
        onSuccess: () => {
          toast.success("Appointment permanently removed from history.");
          setDeleteTarget(null);
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || "Failed to remove appointment";
          toast.error(msg);
          setDeleteTarget(null);
        },
      }
    );
  };

  const handleProceedToPay = (appt: Appointment) => {
    router.push(`/patient/confirm-order?appointmentId=${appt.id}`);
  };

  const handleModify = (apptId: string) => {
    // For modifying, we route to a dedicated "modify" wizard using the same flow.
    // If not implemented, we would toast an info message here.
    toast.success("Modify feature coming next!");
    // Example: router.push(`/patient/appointments/book?edit=${apptId}`);
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-md-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment History</h1>
          <p className="text-gray-500 mt-1 text-sm pt-1">
            View and manage your past and upcoming consultations.
          </p>
        </div>
        <Button
          onClick={() => router.push("/patient/appointments/book")}
          className="shrink-0 font-medium"
        >
          + Book New Appointment
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabFilter)}>
        <TabsList className="bg-gray-100/80 p-1">
          <TabsTrigger value="ALL" className="px-6 py-2">All</TabsTrigger>
          <TabsTrigger value="UPCOMING" className="px-6 py-2">Upcoming</TabsTrigger>
          <TabsTrigger value="COMPLETED" className="px-6 py-2">Completed</TabsTrigger>
          <TabsTrigger value="CANCELLED" className="px-6 py-2">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content Loading */}
      {isLoading ? (
        <CardsSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-2xl text-gray-400">
          <CalendarDays className="h-16 w-16 mb-4 text-gray-300" />
          <p className="font-semibold text-xl text-gray-600">No appointments found</p>
          <p className="text-sm mt-2">
            {tab === "ALL"
              ? "You haven't booked any appointments yet."
              : `No appointments match the '${tab}' filter.`}
          </p>
          {tab === "ALL" && (
            <Button onClick={() => router.push("/patient/appointments/book")} variant="outline" className="mt-6 border-dashed">
              Book your first consultation
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((appt) => {
            const statusBadge = STATUS_BADGE[appt.status];
            const payStatus = appt.paymentStatus || "NOT_REQUIRED";
            const paymentBadge = PAYMENT_BADGE[payStatus];

            return (
              <Card key={appt.id} className="hover:shadow-md transition-all flex flex-col border border-gray-200">
                <CardHeader className="pb-3 border-b border-gray-100 p-5 bg-white relative">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className={`px-2.5 py-0.5 rounded-full ${statusBadge.className}`}>
                      {statusBadge.label}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full ${paymentBadge.className}`}>
                      {paymentBadge.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg flex flex-col gap-1">
                    <span className="font-bold text-gray-900 text-xl tracking-tight">
                      Dr. {appt.doctorName || "Unknown"}
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {appt.doctorSpecialty || "General"}
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 flex-1 space-y-4 text-sm text-gray-700 bg-white">
                  <div className="flex gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl flex items-center justify-center shrink-0">
                      <CalendarDays className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">{formatDateDisplay(appt.appointmentDate)}</p>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
                        <Clock className="w-4 h-4 text-gray-400" /> {appt.timeSlot}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 py-2 px-3 bg-gray-50 rounded-lg">
                    {appt.type === "VIDEO" ? (
                      <Video className="w-4 h-4 text-purple-500 shrink-0" />
                    ) : (
                      <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                    )}
                    <span className="font-medium text-gray-700">{appt.type === "VIDEO" ? "Video Consultation" : "In-Person Visit"}</span>
                  </div>

                  {/* Doctor Notes Box */}
                  {appt.status === "COMPLETED" && appt.doctorNotes && (
                    <div className="mt-2 p-3.5 bg-green-50 border border-green-100 rounded-lg text-sm text-gray-700">
                      <span className="block font-semibold mb-1.5 text-gray-900">Doctor's Evaluation:</span>
                      <p className="line-clamp-3 leading-relaxed">{appt.doctorNotes}</p>
                    </div>
                  )}

                  {/* Video Join Button */}
                  {appt.status === "CONFIRMED" && appt.videoSessionLink && (
                    <div className="pt-2">
                       <Button 
                         onClick={() => window.open(appt.videoSessionLink, "_blank")}
                         className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                       >
                          <Video className="w-4 h-4 mr-2" /> Join Video Session
                       </Button>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-4 border-t bg-gray-50 flex gap-3 flex-wrap">
                  {appt.status === "CONFIRMED" && (appt.paymentStatus === "PENDING" || appt.paymentStatus === "FAILED") && (
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      onClick={() => handleProceedToPay(appt)}
                    >
                      <CreditCard className="w-4 h-4 mr-2" /> Proceed to Pay
                    </Button>
                  )}

                  {appt.status === "PENDING" && (
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <Button 
                        variant="outline" 
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setCancelTarget(appt)}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Cancel
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        onClick={() => setModifyTarget(appt)}
                      >
                        <Edit className="w-4 h-4 mr-2" /> Modify
                      </Button>
                    </div>
                  )}

                  {appt.status === "COMPLETED" && (
                    <div className="flex flex-col gap-2 w-full">
                      {!feedbackedAppointmentIds.has(String(appt.id)) ? (
                        <Button
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                          onClick={() =>
                            router.push(
                              `/patient/feedback/submit/${appt.id}?doctorId=${appt.doctorId}&doctorName=${encodeURIComponent(appt.doctorName || "")}`
                            )
                          }
                        >
                          <MessageSquare className="w-4 h-4 mr-2" /> Leave Feedback
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full text-green-700 border-green-200 bg-green-50 hover:bg-green-100"
                          disabled
                        >
                          <Star className="w-4 h-4 mr-2 fill-green-500 text-green-500" /> Feedback Submitted
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full text-gray-500 hover:text-red-600 hover:bg-red-50 border-transparent shadow-none"
                        onClick={() => setDeleteTarget(appt)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Remove from history
                      </Button>
                    </div>
                  )}

                  {(appt.status === "CANCELLED" || appt.status === "REJECTED" || appt.status === "NO_SHOW") && (
                    <Button
                      variant="ghost"
                      className="w-full text-gray-500 hover:text-red-600 hover:bg-red-50 border-transparent shadow-none"
                      onClick={() => setDeleteTarget(appt)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Remove from history
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Dialog */}
      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 pt-2">
              Are you sure you want to cancel your appointment with 
              <span className="font-semibold text-gray-900 flex px-1"> Dr. {cancelTarget?.doctorName}?</span>
              If you wish, please provide a reason for cancellation (optional).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-3">
            <Textarea
              className="w-full resize-none placeholder:text-gray-400"
              placeholder="E.g. Not feeling well, unexpected schedule conflict..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              disabled={cancelMutation.isPending}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>Close</AlertDialogCancel>
            <Button 
              variant="destructive" 
              onClick={handleCancelConfirm}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete/Remove Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="sm:max-w-md border-red-50">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
               <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">Remove from History</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-500 pt-2">
              This will permanently delete this appointment record from your history.
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center pt-4">
            <AlertDialogCancel disabled={deleteMutation.isPending} className="w-full sm:w-auto">Keep It</AlertDialogCancel>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="w-full sm:w-auto"
            >
              {deleteMutation.isPending ? "Removing..." : "Yes, Remove"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modify Dialog */}
      <ModifyAppointmentDialog 
        appointment={modifyTarget}
        open={!!modifyTarget}
        onOpenChange={(open) => !open && setModifyTarget(null)}
      />
    </div>
  );
}