"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  Clock,
  Filter,
  Search,
  Stethoscope,
  UserCheck,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import {
  type Doctor,
  useGetAllDoctors,
  useGetDoctorAvailability,
} from "@/api/doctorApi";
import { useGetMyPatientProfile } from "@/api/patientApi";
import { type AppointmentType, useCreateAppointment } from "@/api/appointmentApi";
import { useStore } from "@/store/store";

// ─── Helper ───────────────────────────────────────────────────────────────────

function getNextDateForDay(dayOfWeek: string): string {
  const days = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
  const target = days.indexOf(dayOfWeek.toUpperCase());
  const today = new Date();
  let diff = target - today.getDay();
  if (diff <= 0) diff += 7;
  const next = new Date(today);
  next.setDate(today.getDate() + diff);
  return next.toISOString().split("T")[0];
}

// ─── Booking Sheet ─────────────────────────────────────────────────────────────

function BookingSheet({
  doctor,
  patientId,
  onClose,
}: {
  doctor: Doctor | null;
  patientId: string;
  onClose: () => void;
}) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [apptType, setApptType] = useState<AppointmentType>("IN_PERSON");
  const [reason, setReason] = useState("");

  const { data: availability = [], isLoading: availLoading } =
    useGetDoctorAvailability(doctor?.id ?? "");

  const createMutation = useCreateAppointment();
  const user = useStore((s) => s.user);

  const activeDays = availability.filter((a) => a.isActive);
  const availableSlots =
    activeDays.find((a) => a.dayOfWeek === selectedDay)?.timeSlots.filter((s) => !s.isBooked) ?? [];

  const canSubmit = !!selectedDay && !!selectedSlot && !!patientId && !!doctor;

  const handleBook = () => {
    if (!canSubmit) return;
    createMutation.mutate(
      {
        patientId,
        patientName: user?.name,
        doctorId: doctor!.id,
        appointmentDate: getNextDateForDay(selectedDay!),
        timeSlot: selectedSlot!,
        dayOfWeek: selectedDay!,
        type: apptType,
        reasonForVisit: reason || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Appointment booked successfully!");
          setSelectedDay(null);
          setSelectedSlot(null);
          setReason("");
          onClose();
        },
        onError: () => toast.error("Failed to book appointment. Please try again."),
      }
    );
  };

  return (
    <Sheet open={!!doctor} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Book Appointment</SheetTitle>
        </SheetHeader>

        {/* Doctor summary */}
        {doctor && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg mb-5">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Stethoscope className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Dr. {doctor.firstName} {doctor.lastName}
              </p>
              <p className="text-sm text-gray-500">{doctor.specialty}</p>
              {doctor.hospital && (
                <p className="text-xs text-gray-400 mt-0.5">{doctor.hospital}</p>
              )}
              <p className="text-sm font-medium text-blue-700 mt-1">
                LKR {doctor.consultationFee.toLocaleString()} / visit
              </p>
            </div>
          </div>
        )}

        <Separator className="mb-5" />

        {/* Step 1 — Select Day */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">1. Select Available Day</p>
          {availLoading ? (
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-lg" />
              ))}
            </div>
          ) : activeDays.length === 0 ? (
            <p className="text-sm text-gray-400">No availability set by this doctor yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeDays.map((a) => (
                <button
                  key={a.dayOfWeek}
                  onClick={() => {
                    setSelectedDay(a.dayOfWeek);
                    setSelectedSlot(null);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    selectedDay === a.dayOfWeek
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {a.dayOfWeek.charAt(0) + a.dayOfWeek.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2 — Select Time Slot */}
        {selectedDay && (
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">2. Select Time Slot</p>
            {availableSlots.length === 0 ? (
              <p className="text-sm text-gray-400">No available slots on this day.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableSlots.map((slot) => {
                  const slotStr = `${slot.startTime}-${slot.endTime}`;
                  return (
                    <button
                      key={slotStr}
                      onClick={() => setSelectedSlot(slotStr)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        selectedSlot === slotStr
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {slot.startTime} – {slot.endTime}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Appointment Type */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">3. Appointment Type</p>
          <div className="flex gap-3">
            <button
              onClick={() => setApptType("IN_PERSON")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                apptType === "IN_PERSON"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
              }`}
            >
              <Building2 className="h-4 w-4" />
              In Person
            </button>
            <button
              onClick={() => setApptType("VIDEO")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                apptType === "VIDEO"
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
              }`}
            >
              <Video className="h-4 w-4" />
              Video
            </button>
          </div>
        </div>

        {/* Step 4 — Reason */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            4. Reason for Visit{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </p>
          <Textarea
            placeholder="Describe your symptoms or reason for the visit..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="resize-none h-24"
          />
        </div>

        <Button
          className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          disabled={!canSubmit || createMutation.isPending}
          onClick={handleBook}
        >
          {createMutation.isPending ? "Booking…" : "Confirm Booking"}
        </Button>
      </SheetContent>
    </Sheet>
  );
}

// ─── Doctor Card ──────────────────────────────────────────────────────────────

function DoctorCard({
  doctor,
  onBook,
}: {
  doctor: Doctor;
  onBook: (d: Doctor) => void;
}) {
  return (
    <Card className="bg-white border border-gray-200 shadow-none hover:shadow-sm transition-shadow">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Dr. {doctor.firstName} {doctor.lastName}
              </h3>
              <p className="text-sm text-blue-600 font-medium">{doctor.specialty}</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              doctor.isAvailable
                ? "text-green-700 bg-green-50 border-green-200 shrink-0"
                : "text-gray-500 bg-gray-50 border-gray-200 shrink-0"
            }
          >
            {doctor.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-1.5 mb-4">
          {doctor.hospital && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              {doctor.hospital}
            </div>
          )}
          {doctor.qualification && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <UserCheck className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              {doctor.qualification}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            {doctor.experienceYears} year{doctor.experienceYears !== 1 ? "s" : ""} experience
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Consultation fee</p>
            <p className="text-base font-semibold text-gray-900">
              LKR {doctor.consultationFee.toLocaleString()}
            </p>
          </div>
          <Button
            size="sm"
            className="bg-gray-900 hover:bg-gray-800 text-white"
            disabled={!doctor.isAvailable}
            onClick={() => onBook(doctor)}
          >
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
            Book
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DoctorCardSkeleton() {
  return (
    <Card className="bg-white border border-gray-200 shadow-none">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-40" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("ALL");
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  const { data: doctors = [], isLoading } = useGetAllDoctors();
  const { data: patient } = useGetMyPatientProfile();
  const patientId = patient?.id ? String(patient.id) : "";

  const specialties = useMemo(() => {
    const set = new Set(doctors.map((d) => d.specialty).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [doctors]);

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      const name = `${d.firstName} ${d.lastName}`.toLowerCase();
      const matchesSearch =
        !search ||
        name.includes(search.toLowerCase()) ||
        d.specialty?.toLowerCase().includes(search.toLowerCase()) ||
        d.hospital?.toLowerCase().includes(search.toLowerCase());
      const matchesSpecialty =
        specialtyFilter === "ALL" || d.specialty === specialtyFilter;
      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, search, specialtyFilter]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Find a Doctor</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Browse verified doctors and book an appointment
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, specialty or hospital…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <Filter className="h-4 w-4 mr-2 text-gray-400" />
            <SelectValue placeholder="All Specialties" />
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
      </div>

      {/* Result count */}
      {!isLoading && (
        <p className="text-sm text-gray-500">
          {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <DoctorCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Stethoscope className="h-10 w-10 mb-3 opacity-40" />
          <p className="font-medium">No doctors found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} onBook={setBookingDoctor} />
          ))}
        </div>
      )}

      {/* Booking Sheet */}
      <BookingSheet
        doctor={bookingDoctor}
        patientId={patientId}
        onClose={() => setBookingDoctor(null)}
      />
    </div>
  );
}
