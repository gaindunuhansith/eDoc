"use client";

import { useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  PlusCircle,
  Pill,
  Trash2,
  User,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useGetMyDoctorProfile, useGetPrescriptionsByDoctor, useCreatePrescription, type Medicine, type Prescription } from "@/api/doctorApi";
import { useGetAppointmentsByDoctor, type Appointment } from "@/api/appointmentApi";
import { mockDoctorPrescriptionsList } from "@/lib/fallback";

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const EMPTY_MEDICINE: Medicine = {
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

// â”€â”€â”€ Prescription Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PrescriptionCard({ prescription }: { prescription: Prescription }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">
                Patient #{prescription.patientId}
              </span>
            </div>
            {prescription.appointmentId && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="w-3.5 h-3.5" />
                Appointment #{prescription.appointmentId.slice(-6)}
              </div>
            )}
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {formatDate(prescription.issuedAt)}
          </Badge>
        </div>
        {prescription.diagnosis && (
          <p className="text-sm font-medium mt-2">{prescription.diagnosis}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {prescription.notes && (
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{prescription.notes}</span>
          </div>
        )}
        <div className="space-y-2">
          {prescription.medicines.map((med, i) => (
            <div
              key={i}
              className="flex flex-wrap gap-x-4 gap-y-1 rounded-md bg-muted/40 px-3 py-2 text-xs"
            >
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Pill className="w-3 h-3" />
                {med.name}
              </span>
              <span className="text-muted-foreground">{med.dosage}</span>
              <span className="text-muted-foreground">{med.frequency}</span>
              <span className="text-muted-foreground">{med.duration}</span>
              {med.instructions && (
                <span className="text-muted-foreground italic">
                  {med.instructions}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// â”€â”€â”€ Issue Prescription Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function IssuePrescriptionDialog({
  open,
  onClose,
  doctorId,
  completedAppointments,
}: {
  open: boolean;
  onClose: () => void;
  doctorId: string;
  completedAppointments: Appointment[];
}) {
  const [appointmentId, setAppointmentId] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([{ ...EMPTY_MEDICINE }]);

  const createMutation = useCreatePrescription();

  // When an appointment is selected, auto-fill patientId
  const handleAppointmentSelect = (apptId: string) => {
    setAppointmentId(apptId);
    const appt = completedAppointments.find((a) => a.id === apptId);
    if (appt) setPatientId(appt.patientId);
  };

  const addMedicine = () =>
    setMedicines((prev) => [...prev, { ...EMPTY_MEDICINE }]);

  const removeMedicine = (idx: number) =>
    setMedicines((prev) => prev.filter((_, i) => i !== idx));

  const updateMedicine = (idx: number, field: keyof Medicine, value: string) =>
    setMedicines((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );

  const canSubmit =
    !!patientId &&
    medicines.length > 0 &&
    medicines.every((m) => m.name && m.dosage && m.frequency && m.duration);

  const handleSubmit = () => {
    if (!canSubmit) return;
    createMutation.mutate(
      {
        doctorId,
        payload: {
          patientId,
          appointmentId: appointmentId || undefined,
          diagnosis: diagnosis.trim() || undefined,
          notes: notes.trim() || undefined,
          medicines,
        },
      },
      {
        onSuccess: () => {
          toast.success("Prescription issued successfully.");
          handleClose();
        },
        onError: () => toast.error("Failed to issue prescription."),
      }
    );
  };

  const handleClose = () => {
    setAppointmentId("");
    setPatientId("");
    setDiagnosis("");
    setNotes("");
    setMedicines([{ ...EMPTY_MEDICINE }]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Issue Prescription</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Link to appointment */}
          <div className="space-y-2">
            <Label>Link to Completed Appointment (optional)</Label>
            <Select
              value={appointmentId}
              onValueChange={handleAppointmentSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select appointmentâ€¦" />
              </SelectTrigger>
              <SelectContent>
                {completedAppointments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.patientName ?? `Patient #${a.patientId}`} â€”{" "}
                    {formatDate(a.appointmentDate)} {a.timeSlot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Patient ID (auto-filled or manual) */}
          {!appointmentId && (
            <div className="space-y-2">
              <Label htmlFor="patient-id">Patient ID</Label>
              <Input
                id="patient-id"
                placeholder="Enter patient IDâ€¦"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>
          )}

          {/* Diagnosis */}
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              placeholder="e.g. Upper respiratory infection"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Clinical Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes for the patientâ€¦"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Medicines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Medicines</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={addMedicine}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Medicine
              </Button>
            </div>

            {medicines.map((med, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border/60 p-4 space-y-3 relative"
              >
                {medicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedicine(idx)}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Medicine Name *</Label>
                    <Input
                      placeholder="e.g. Paracetamol"
                      value={med.name}
                      onChange={(e) => updateMedicine(idx, "name", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Dosage *</Label>
                    <Input
                      placeholder="e.g. 500mg"
                      value={med.dosage}
                      onChange={(e) => updateMedicine(idx, "dosage", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Frequency *</Label>
                    <Input
                      placeholder="e.g. Twice a day"
                      value={med.frequency}
                      onChange={(e) => updateMedicine(idx, "frequency", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Duration *</Label>
                    <Input
                      placeholder="e.g. 7 days"
                      value={med.duration}
                      onChange={(e) => updateMedicine(idx, "duration", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Instructions</Label>
                    <Input
                      placeholder="e.g. Take after meals"
                      value={med.instructions ?? ""}
                      onChange={(e) => updateMedicine(idx, "instructions", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || createMutation.isPending}
          >
            {createMutation.isPending ? "Issuingâ€¦" : "Issue Prescription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function PrescriptionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: doctor, isLoading: doctorLoading } = useGetMyDoctorProfile();
  const { data: prescriptions = [], isLoading: rxLoading } =
    useGetPrescriptionsByDoctor(doctor?.id ?? "");
  const { data: allAppointments = [] } = useGetAppointmentsByDoctor(
    doctor?.id ?? ""
  );

  const completedAppointments = allAppointments.filter(
    (a) => a.status === "COMPLETED"
  );

  const isLoading = doctorLoading || (!!doctor?.id && rxLoading);

  const displayPrescriptions = prescriptions.length > 0 ? prescriptions : mockDoctorPrescriptionsList;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Prescriptions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Issue and review prescriptions for your patients
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => setDialogOpen(true)}
          disabled={!doctor?.id}
        >
          <PlusCircle className="w-4 h-4" />
          Issue Prescription
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayPrescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <ClipboardList className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No prescriptions issued yet.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
            disabled={!doctor?.id}
          >
            Issue your first prescription
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {displayPrescriptions.length} prescription
            {displayPrescriptions.length !== 1 ? "s" : ""}
          </p>
          {[...displayPrescriptions]
            .sort(
              (a, b) =>
                new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
            )
            .map((rx) => (
              <PrescriptionCard key={rx.id} prescription={rx} />
            ))}
        </div>
      )}

      {/* Issue dialog */}
      {doctor?.id && (
        <IssuePrescriptionDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          doctorId={doctor.id}
          completedAppointments={completedAppointments}
        />
      )}
    </div>
  );
}
