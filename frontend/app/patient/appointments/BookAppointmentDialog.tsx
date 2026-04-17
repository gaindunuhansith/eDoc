"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building2,
  Video,
  Stethoscope,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import {
  useGetAllDoctors,
  useGetDoctorAvailability,
  type Doctor,
} from "@/api/doctorApi";
import { useCreateAppointment, type AppointmentType } from "@/api/appointmentApi";
import { useStore } from "@/store/store";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_NAMES = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

type DayName = (typeof DAY_NAMES)[number];

function toDayName(date: Date): DayName {
  return DAY_NAMES[date.getDay()];
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const steps = ["Choose Doctor", "Date & Time", "Confirm"];
  return (
    <div className="flex items-center mb-6">
      {steps.map((label, i) => {
        const num = i + 1;
        const active = num === step;
        const done = num < step;
        return (
          <div key={num} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 min-w-[64px]">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors
                  ${done ? "bg-green-600 text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : num}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap ${active ? "text-foreground" : "text-muted-foreground"}`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-1 mb-4 transition-colors ${done ? "bg-green-600" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Choose Doctor ────────────────────────────────────────────────────

function Step1({ onSelect }: { onSelect: (doctor: Doctor) => void }) {
  const [specialty, setSpecialty] = useState("ALL");
  const { data: doctors = [], isLoading } = useGetAllDoctors();

  const specialties = Array.from(
    new Set(doctors.map((d) => d.specialty).filter(Boolean))
  ) as string[];

  const filtered =
    specialty === "ALL" ? doctors : doctors.filter((d) => d.specialty === specialty);

  return (
    <div className="space-y-4">
      {/* Specialty filter */}
      <div className="flex items-center gap-3">
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Specialties</SelectItem>
            {specialties.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {filtered.length} doctor{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Doctor list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground text-sm">No doctors found.</p>
      ) : (
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {filtered.map((doctor) => (
            <button
              key={doctor.id}
              onClick={() => onSelect(doctor)}
              className="w-full text-left rounded-lg border border-border/60 p-4 hover:border-primary hover:bg-accent transition-all focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </p>
                    {doctor.specialty && (
                      <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                    )}
                    {doctor.hospital && (
                      <p className="text-xs text-muted-foreground truncate">{doctor.hospital}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-primary">
                    LKR {doctor.consultationFee.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {doctor.experienceYears}y exp
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Date & Time ──────────────────────────────────────────────────────

function Step2({
  doctor,
  selectedDate,
  onDateChange,
  selectedSlot,
  onSlotChange,
  appointmentType,
  onTypeChange,
}: {
  doctor: Doctor;
  selectedDate: Date | undefined;
  onDateChange: (d: Date | undefined) => void;
  selectedSlot: string;
  onSlotChange: (s: string) => void;
  appointmentType: AppointmentType;
  onTypeChange: (t: AppointmentType) => void;
}) {
  const { data: availability = [], isLoading } = useGetDoctorAvailability(doctor.id);

  const availableDays = new Set(
    availability
      .filter((a) => a.isActive && a.timeSlots.some((s) => !s.isBooked))
      .map((a) => a.dayOfWeek)
  );

  function isDisabled(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    return !availableDays.has(toDayName(date));
  }

  const daySlots = selectedDate
    ? (availability.find((a) => a.dayOfWeek === toDayName(selectedDate))?.timeSlots ?? [])
    : [];

  return (
    <div className="space-y-4">
      {/* Doctor summary */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
        <Stethoscope className="w-4 h-4 text-primary shrink-0" />
        <span className="font-medium">
          Dr. {doctor.firstName} {doctor.lastName}
        </span>
        {doctor.specialty && (
          <span className="text-muted-foreground">· {doctor.specialty}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Calendar */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Select Date
          </Label>
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : (
            <div className="border border-border/60 rounded-lg overflow-hidden">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  onDateChange(d);
                  onSlotChange("");
                }}
                disabled={isDisabled}
              />
            </div>
          )}
        </div>

        {/* Slots + type */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Time Slot
            </Label>
            {!selectedDate ? (
              <div className="py-8 text-center border border-dashed border-border rounded-lg">
                <p className="text-sm text-muted-foreground">Pick a date first</p>
              </div>
            ) : daySlots.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-border rounded-lg">
                <p className="text-sm text-muted-foreground">No slots available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {daySlots.map((slot) => {
                  const label = `${slot.startTime}-${slot.endTime}`;
                  return (
                    <button
                      key={label}
                      disabled={slot.isBooked}
                      onClick={() => onSlotChange(label)}
                      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring
                        ${
                          slot.isBooked
                            ? "bg-muted/50 border-border/40 text-muted-foreground cursor-not-allowed opacity-50"
                            : selectedSlot === label
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border/60 hover:border-primary hover:bg-accent"
                        }`}
                    >
                      <Clock className="w-3 h-3 shrink-0" />
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Appointment Type
            </Label>
            <div className="flex gap-2">
              {(["IN_PERSON", "VIDEO"] as AppointmentType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onTypeChange(t)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring
                    ${
                      appointmentType === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/60 hover:border-primary hover:bg-accent"
                    }`}
                >
                  {t === "VIDEO" ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <Building2 className="w-4 h-4" />
                  )}
                  {t === "VIDEO" ? "Video Call" : "In Person"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Confirm ──────────────────────────────────────────────────────────

function Step3({
  doctor,
  selectedDate,
  selectedSlot,
  appointmentType,
  reason,
  onReasonChange,
}: {
  doctor: Doctor;
  selectedDate: Date;
  selectedSlot: string;
  appointmentType: AppointmentType;
  reason: string;
  onReasonChange: (r: string) => void;
}) {
  return (
    <div className="space-y-5">
      <Card className="border-border/60 bg-muted/30">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">
                Dr. {doctor.firstName} {doctor.lastName}
              </p>
              {doctor.specialty && (
                <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
              )}
              {doctor.hospital && (
                <p className="text-xs text-muted-foreground">{doctor.hospital}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4 shrink-0" />
            {format(selectedDate, "EEEE, dd MMM yyyy")}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 shrink-0" />
            {selectedSlot}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {appointmentType === "VIDEO" ? (
              <Video className="w-4 h-4 shrink-0" />
            ) : (
              <Building2 className="w-4 h-4 shrink-0" />
            )}
            {appointmentType === "VIDEO" ? "Video Call" : "In-Person"}
          </div>
          <div className="pt-2 border-t border-border/40">
            <p className="text-sm font-semibold text-primary">
              Consultation Fee: LKR {doctor.consultationFee.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="visit-reason">
          Reason for Visit{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="visit-reason"
          placeholder="Describe your symptoms or reason for this appointment…"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          className="resize-none"
          rows={3}
        />
      </div>
    </div>
  );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export interface BookAppointmentDialogProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookAppointmentDialog({
  patientId,
  open,
  onOpenChange,
}: BookAppointmentDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("IN_PERSON");
  const [reason, setReason] = useState<string>("");

  const createAppointment = useCreateAppointment();
  const user = useStore((s) => s.user);

  function reset() {
    setStep(1);
    setSelectedDoctor(null);
    setSelectedDate(undefined);
    setSelectedSlot("");
    setAppointmentType("IN_PERSON");
    setReason("");
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  function handleDoctorSelect(doctor: Doctor) {
    setSelectedDoctor(doctor);
    setSelectedDate(undefined);
    setSelectedSlot("");
    setStep(2);
  }

  function handleSubmit() {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;
    createAppointment.mutate(
      {
        patientId,
        patientName: user?.name,
        doctorId: selectedDoctor.id,
        appointmentDate: format(selectedDate, "yyyy-MM-dd"),
        timeSlot: selectedSlot,
        dayOfWeek: toDayName(selectedDate),
        type: appointmentType,
        reasonForVisit: reason.trim() || undefined,
      },
      {
        onSuccess: (createdAppointment) => {
          toast.success("Appointment booked! Awaiting doctor confirmation.");
          handleClose();

          const query = new URLSearchParams({
            appointmentId: createdAppointment.id,
            amount: String(selectedDoctor.consultationFee),
            currency: "LKR",
            doctorId: selectedDoctor.id,
            doctorName: `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
          });
          router.push(`/patient/confirm-order?${query.toString()}`);
        },
        onError: () => {
          toast.error("Failed to book appointment. Please try again.");
        },
      }
    );
  }

  const canAdvanceFromStep2 = !!selectedDate && !!selectedSlot;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
        </DialogHeader>

        <StepIndicator step={step} />

        {step === 1 && <Step1 onSelect={handleDoctorSelect} />}

        {step === 2 && selectedDoctor && (
          <Step2
            doctor={selectedDoctor}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedSlot={selectedSlot}
            onSlotChange={setSelectedSlot}
            appointmentType={appointmentType}
            onTypeChange={setAppointmentType}
          />
        )}

        {step === 3 && selectedDoctor && selectedDate && (
          <Step3
            doctor={selectedDoctor}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            appointmentType={appointmentType}
            reason={reason}
            onReasonChange={setReason}
          />
        )}

        {/* Navigation footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/60 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))}
            disabled={step === 1}
            className="gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {step < 3 ? (
            <Button
              size="sm"
              onClick={() => setStep((s) => ((s + 1) as 1 | 2 | 3))}
              disabled={step === 1 ? !selectedDoctor : !canAdvanceFromStep2}
              className="gap-1.5"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={createAppointment.isPending}
              className="min-w-[140px]"
            >
              {createAppointment.isPending ? "Booking…" : "Confirm Booking"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
