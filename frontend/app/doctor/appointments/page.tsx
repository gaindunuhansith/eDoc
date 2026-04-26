"use client";

import { useState } from "react";
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
  Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useUser } from "@/store/store";
import {
  useGetAppointmentsByDoctor,
  useGetPendingAppointmentsByDoctor,
  useUpdateAppointmentStatus,
  type AppointmentStatus,
  type PaymentStatus
} from "@/api/appointmentApi";

// --- Helpers -----------------------------------------------------------------

const STATUS_BADGE: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING:   { label: "Pending",   className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-100 text-blue-800 border-blue-200"  },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800 border-green-200" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200"   },
  REJECTED:  { label: "Rejected",  className: "bg-gray-100 text-gray-600 border-gray-200"   },
  NO_SHOW:   { label: "No Show",   className: "bg-gray-100 text-gray-600 border-gray-200"  },
};

const PAYMENT_BADGE: Record<PaymentStatus, { label: string; className: string }> = {
  NOT_REQUIRED: { label: "Not Required", className: "bg-gray-100 text-gray-800 border-gray-200" },
  PENDING:      { label: "Payment Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  PAID:         { label: "Paid", className: "bg-green-100 text-green-800 border-green-200" },
  REFUNDED:     { label: "Refunded", className: "bg-blue-100 text-blue-800 border-blue-200" },
};

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// --- Dialogs ------------------------------------------------------------------

function RejectDialog({ open, onClose, onConfirm, isPending }: any) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Appointment</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="reject-reason">Reason for rejection (optional)</Label>
          <Textarea 
            id="reject-reason" 
            value={reason} 
            onChange={(e: any) => setReason(e.target.value)} 
            placeholder="Type reason here..." 
            rows={3} 
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button variant="destructive" onClick={() => onConfirm(reason)} disabled={isPending}>
            {isPending ? "Rejecting..." : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CompleteDialog({ open, onClose, onConfirm, isPending }: any) {
  const [notes, setNotes] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Appointment as Completed</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="doctor-notes">Doctor Notes</Label>
          <Textarea 
            id="doctor-notes" 
            value={notes} 
            onChange={(e: any) => setNotes(e.target.value)} 
            placeholder="Add any post-consultation notes here..." 
            rows={4} 
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => onConfirm(notes)} disabled={isPending}>
            {isPending ? "Saving..." : "Mark Completed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VideoLinkDialog({ open, onClose, onConfirm, isPending }: any) {
  const [link, setLink] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Video Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="video-link">Video Meeting URL</Label>
          <Input 
            id="video-link" 
            value={link} 
            onChange={(e: any) => setLink(e.target.value)} 
            placeholder="https://meet.google.com/..." 
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={() => onConfirm(link)} disabled={isPending || !link}>
            {isPending ? "Saving..." : "Save Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Page ------------------------------------------------------------------

export default function DoctorAppointmentsHub() {
  const user = useUser();
  const doctorId = user?.userId || "";

  const [topTab, setTopTab] = useState("REQUESTS");
  const [allTab, setAllTab] = useState<AppointmentStatus | "ALL">("ALL");

  const [rejectId, setRejectId] = useState<string | null>(null);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [videoLinkApptId, setVideoLinkApptId] = useState<string | null>(null);

  const { data: pendingAppointments = [], isLoading: pendingLoading } = useGetPendingAppointmentsByDoctor(doctorId);
  const { data: allAppointments = [], isLoading: allLoading } = useGetAppointmentsByDoctor(doctorId);
  const updateStatus = useUpdateAppointmentStatus();

  const handleAccept = (id: string) => {
    updateStatus.mutate(
      { id, update: { status: "CONFIRMED", doctorNotes: undefined, cancellationReason: undefined, videoSessionLink: undefined } },
      {
        onSuccess: () => toast.success("Appointment Accepted"),
        onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || "Failed to accept.")
      }
    );
  };

  const handleReject = (reason: string) => {
    if (!rejectId) return;
    updateStatus.mutate(
      { id: rejectId, update: { status: "REJECTED", cancellationReason: reason } },
      {
        onSuccess: () => {
          toast.success("Appointment Rejected");
          setRejectId(null);
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || "Failed to reject.")
      }
    );
  };

  const handleComplete = (notes: string) => {
    if (!completeId) return;
    updateStatus.mutate(
      { id: completeId, update: { status: "COMPLETED", doctorNotes: notes } },
      {
        onSuccess: () => {
          toast.success("Appointment marked as completed");
          setCompleteId(null);
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || "Failed to complete.")
      }
    );
  };

  const handleAddVideoLink = (link: string) => {
    if (!videoLinkApptId) return;
    updateStatus.mutate(
      { id: videoLinkApptId, update: { status: "CONFIRMED", videoSessionLink: link } },
      {
        onSuccess: () => {
          toast.success("Video link added successfully");
          setVideoLinkApptId(null);
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || "Failed to save link.")
      }
    );
  };

  const filteredAllAppointments = allAppointments.filter((app: any) => allTab === "ALL" || app.status === allTab).sort((a: any,b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Appointments Center</h1>
        <p className="text-muted-foreground mt-1">Manage incoming requests and review all patient bookings.</p>
      </div>

      <Tabs value={topTab} onValueChange={setTopTab}>
        <TabsList className="grid w-[400px] grid-cols-2 mb-6">
          <TabsTrigger value="REQUESTS">Incoming Requests</TabsTrigger>
          <TabsTrigger value="ALL_APPS">All Appointments</TabsTrigger>
        </TabsList>

        {/* INCOMING REQUESTS TAB */}
        <TabsContent value="REQUESTS" className="space-y-4">
          <h2 className="text-xl font-semibold">Pending Requests</h2>
          {pendingLoading ? (
             <div className="space-y-4">
               <Skeleton className="h-32 w-full" />
               <Skeleton className="h-32 w-full" />
             </div>
          ) : pendingAppointments.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed rounded-xl shadow-sm">
               <p className="text-muted-foreground italic">No pending requests right now.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingAppointments.map((appt: any) => (
                <Card key={appt.id} className="border-yellow-200 bg-yellow-50/30 overflow-hidden">
                  <div className="flex border-b bg-white p-4 items-center justify-between">
                     <span className="font-semibold text-lg flex items-center gap-2">
                       <User className="h-5 w-5 text-gray-400"/> 
                       {appt.patientName || "Patient: " + appt.patientId}
                     </span>
                     <Badge className={STATUS_BADGE.PENDING.className}>{STATUS_BADGE.PENDING.label}</Badge>
                  </div>
                  <CardContent className="pt-4 space-y-3 bg-white">
                    <div className="flex flex-wrap gap-6 text-sm text-gray-600 font-medium">
                      <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4"/> {formatDate(appt.appointmentDate)}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> {appt.timeSlot}</span>
                      <span className="flex items-center gap-1.5">
                        {appt.type === "VIDEO" ? <Video className="h-4 w-4 text-blue-500" /> : <Building2 className="h-4 w-4 text-orange-500" />}
                        {appt.type === "VIDEO" ? "Video Consultation" : "In-Person"}
                      </span>
                    </div>
                    {appt.reasonForVisit && (
                      <div className="text-sm bg-gray-50 py-2 px-3 rounded border mt-2">
                        <strong className="text-gray-700">Reason:</strong> <span className="italic text-gray-600">{appt.reasonForVisit}</span>
                      </div>
                    )}
                    <div className="flex gap-3 pt-3">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 w-32 shadow-sm" onClick={() => handleAccept(appt.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 shadow-sm" onClick={() => setRejectId(appt.id)}>
                        <XCircle className="h-4 w-4 mr-2" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ALL APPOINTMENTS TAB */}
        <TabsContent value="ALL_APPS" className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">Appointment History</h2>
            <Tabs value={allTab} onValueChange={(v) => setAllTab(v as any)} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto p-1 text-xs">
                {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"].map(status => (
                   <TabsTrigger key={status} value={status} className="text-xs">
                     {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                   </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {allLoading ? (
            <div className="space-y-4">
               <Skeleton className="h-32 w-full" />
               <Skeleton className="h-32 w-full" />
            </div>
          ) : filteredAllAppointments.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed rounded-xl shadow-sm">
               <p className="text-muted-foreground italic">No appointments match this filter.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAllAppointments.map((appt: any) => {
                const sBadge = STATUS_BADGE[appt.status as AppointmentStatus] || STATUS_BADGE.NO_SHOW;
                const pBadge = PAYMENT_BADGE[(appt.paymentStatus as PaymentStatus) || "NOT_REQUIRED"];
                
                return (
                  <Card key={appt.id} className="shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-gray-50/50 py-3 px-5 gap-3">
                      <div className="font-semibold text-base text-gray-800 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {appt.patientName || "Patient: " + appt.patientId}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {appt.paymentStatus && <Badge variant="outline" className={"text-[10px] uppercase font-bold tracking-wider " + pBadge.className}>{pBadge.label}</Badge>}
                        <Badge className={"text-xs border shadow-sm " + sBadge.className}>{sBadge.label}</Badge>
                      </div>
                    </div>
                    <CardContent className="pt-4 px-5 space-y-4">
                      <div className="flex flex-wrap gap-5 text-sm text-gray-700">
                        <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-gray-400"/> {formatDate(appt.appointmentDate)}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400"/> {appt.timeSlot}</span>
                        <span className="flex items-center gap-1.5 font-medium">
                          {appt.type === "VIDEO" ? <Video className="h-4 w-4 text-blue-500" /> : <Building2 className="h-4 w-4 text-orange-500" />}
                          {appt.type === "VIDEO" ? "Video Consultation" : "In-Person"}
                        </span>
                      </div>
                      
                      {appt.reasonForVisit && (
                        <div className="text-sm bg-gray-50 p-3 rounded border">
                          <Stethoscope className="h-4 w-4 inline mr-1.5 text-muted-foreground" />
                          <span className="italic text-gray-700">{appt.reasonForVisit}</span>
                        </div>
                      )}
                      
                      {appt.doctorNotes && (
                        <div className="text-sm bg-blue-50/50 border-blue-100 p-3 rounded border">
                          <FileText className="h-4 w-4 inline mr-1.5 text-blue-600" />
                          <span className="text-blue-900">{appt.doctorNotes}</span>
                        </div>
                      )}
                      
                      {((appt.type === "VIDEO" && appt.status === "CONFIRMED") || appt.videoSessionLink) && (
                        <div className="text-sm pt-1">
                          <strong className="text-gray-600">Video Link:</strong> {appt.videoSessionLink ? (
                            <a href={appt.videoSessionLink} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline ml-1">
                              {appt.videoSessionLink.substring(0,40)}...
                            </a>
                          ) : (
                            <span className="text-muted-foreground italic ml-1">Link not provided yet.</span>
                          )}
                        </div>
                      )}

                      {appt.status === "CONFIRMED" && (
                        <div className="flex flex-wrap gap-3 pt-3 border-t mt-4">
                          {appt.type === "VIDEO" && (
                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm" onClick={() => setVideoLinkApptId(appt.id)}>
                              <LinkIcon className="h-4 w-4 mr-2" />
                              {appt.videoSessionLink ? "Update Video Link" : "Add Video Link"}
                            </Button>
                          )}
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => setCompleteId(appt.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Completed
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <RejectDialog open={!!rejectId} onClose={() => setRejectId(null)} onConfirm={handleReject} isPending={updateStatus.isPending} />
      <CompleteDialog open={!!completeId} onClose={() => setCompleteId(null)} onConfirm={handleComplete} isPending={updateStatus.isPending} />
      <VideoLinkDialog open={!!videoLinkApptId} onClose={() => setVideoLinkApptId(null)} onConfirm={handleAddVideoLink} isPending={updateStatus.isPending} />
    </div>
  );
}
