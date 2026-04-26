"use client";

import { useState } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CalendarDays,
  Clock,
  Building2,
  Video,
  Stethoscope,
  User,
  Search,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  useGetAllDoctors,
  useGetDoctorAvailability,
  type Doctor,
  type DoctorAvailability,
  type AvailabilityTimeSlot,
} from "@/api/doctorApi";
import { useGetMyPatientProfile } from "@/api/patientApi";
import { useCreateAppointment, type AppointmentType } from "@/api/appointmentApi";

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

// ─── Shared Components ────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = ["Choose Doctor", "Date & Time", "Confirm"];
  return (
    <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
      {steps.map((label, i) => {
        const num = i + 1;
        const active = num === currentStep;
        const done = num < currentStep;
        return (
          <div key={num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                  ${done ? "bg-green-600 text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : num}
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap ${active ? "text-foreground" : "text-muted-foreground"}`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 rounded-full transition-colors ${done ? "bg-green-600" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Wizard Control ──────────────────────────────────────────────────────

export default function BookAppointmentWizard() {
  const router = useRouter();

  const { data: patient, isLoading: patientLoading } = useGetMyPatientProfile();

  // Wizard state
  const [step, setStep] = useState(1);

  // Booking data state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [type, setType] = useState<AppointmentType>("IN_PERSON");
  const [reason, setReason] = useState("");
  
  // Final result
  const [successData, setSuccessData] = useState<any>(null);

  const createMutation = useCreateAppointment();

  // Reset wizard
  const resetWizard = () => {
    setStep(1);
    setSelectedDoctor(null);
    setDate(undefined);
    setTimeSlot("");
    setType("IN_PERSON");
    setReason("");
    setSuccessData(null);
  };

  const handleCreate = () => {
    if (!patient?.id || !selectedDoctor || !date || !timeSlot || !reason.trim()) {
      return;
    }

    const dayOfWeek = toDayName(date);
    const formattedDate = format(date, "yyyy-MM-dd");

    createMutation.mutate(
      {
        patientId: String(patient.id),
        doctorId: selectedDoctor.id,
        appointmentDate: formattedDate,
        timeSlot: timeSlot,
        dayOfWeek: dayOfWeek,
        reasonForVisit: reason,
        type: type,
      },
      {
        onSuccess: (res) => {
          setSuccessData({
            id: res.data.id,
            doctorName: `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
            date: formattedDate,
            timeSlot: timeSlot,
          });
          setStep(4);
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || "Failed to book appointment.";
          toast.error(msg);
        },
      }
    );
  };

  // ─── Step Renderers ────────────────────────────────────────────────────────

  if (patientLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {step < 4 ? (
        <>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
            <p className="text-gray-500 mt-2">
              Follow the steps to schedule a consultation with our verified doctors.
            </p>
          </div>
          <StepIndicator currentStep={step} />
        </>
      ) : null}

      {/* STEP 1: DOCTOR SEARCH */}
      {step === 1 && (
        <Step1DoctorSearch 
          onSelect={(doc) => {
             setSelectedDoctor(doc);
             setStep(2);
          }}
        />
      )}

      {/* STEP 2: DATE & TIME */}
      {step === 2 && selectedDoctor && (
        <Step2DateTimeSelection
          doctor={selectedDoctor}
          date={date}
          setDate={setDate}
          timeSlot={timeSlot}
          setTimeSlot={setTimeSlot}
          type={type}
          setType={setType}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {/* STEP 3: CONFIRM REASON & SUBMIT */}
      {step === 3 && selectedDoctor && date && (
        <Step3Confirmation
          doctor={selectedDoctor}
          date={date}
          timeSlot={timeSlot}
          type={type}
          reason={reason}
          setReason={setReason}
          onBack={() => setStep(2)}
          onConfirm={handleCreate}
          isSubmitting={createMutation.isPending}
        />
      )}

      {/* STEP 4: SUCCESS */}
      {step === 4 && successData && (
        <Step4Success
          data={successData}
          onReset={resetWizard}
          onViewAll={() => router.push("/patient/appointments")}
        />
      )}

    </div>
  );
}

// ─── Individual Step Components ──────────────────────────────────────────────

function Step1DoctorSearch({ onSelect }: { onSelect: (doctor: Doctor) => void }) {
  const [specialty, setSpecialty] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: doctors = [], isLoading } = useGetAllDoctors();

  const specialties = Array.from(
    new Set(doctors.map((d) => d.specialty).filter(Boolean))
  ) as string[];

  // Filter logic
  let filtered = specialty === "ALL" ? doctors : doctors.filter((d) => d.specialty === specialty);
  
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
       (d) =>
         d.firstName.toLowerCase().includes(q) ||
         d.lastName.toLowerCase().includes(q) ||
         (d.hospital && d.hospital.toLowerCase().includes(q))
    );
  }

  // Only show verified and active doctors for booking
  filtered = filtered.filter(d => d.isVerified);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="relative w-full md:max-w-xs">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
               type="text" 
               placeholder="Search doctor name or hospital..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
         </div>
         <div className="w-full md:w-56 shrink-0">
            <Select value={specialty} onValueChange={setSpecialty}>
               <SelectTrigger>
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
      </div>

      {isLoading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(x => (
               <Card key={x} className="animate-pulse">
                  <CardContent className="p-6 h-48 bg-gray-50/50" />
               </Card>
            ))}
         </div>
      ) : filtered.length === 0 ? (
         <div className="text-center py-12 bg-white rounded-xl border">
            <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No doctors found matching your search.</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(doc => (
               <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 border-b">
                     <CardTitle className="text-lg flex justify-between items-start">
                        <span>Dr. {doc.firstName} {doc.lastName}</span>
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 font-medium whitespace-nowrap ml-2">
                           ${doc.consultationFee}
                        </Badge>
                     </CardTitle>
                     <div className="text-sm font-medium text-primary/80 mt-1">{doc.specialty}</div>
                  </CardHeader>
                  <CardContent className="pt-4 pb-2 space-y-2 text-sm text-gray-600">
                     <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate">{doc.hospital || "Independent"}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{doc.experienceYears} Years Experience</span>
                     </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                     <Button className="w-full" onClick={() => onSelect(doc)}>
                        Select & Continue
                     </Button>
                  </CardFooter>
               </Card>
            ))}
         </div>
      )}
    </div>
  );
}

function Step2DateTimeSelection({
   doctor,
   date,
   setDate,
   timeSlot,
   setTimeSlot,
   type,
   setType,
   onBack,
   onNext
}: any) {
  const { data: schedule = [], isLoading } = useGetDoctorAvailability(doctor.id);

  // Derive active days
  const activeDaysSet = new Set(
    schedule.filter((s: DoctorAvailability) => s.isActive).map((s: DoctorAvailability) => s.dayOfWeek)
  );

  const isDayAvailable = (day: Date) => {
    const today = startOfDay(new Date());
    if (isBefore(day, today)) return true; // Disabled via past date logic anyway
    const dayName = toDayName(day);
    return !activeDaysSet.has(dayName);
  };

  const availableSlots: AvailabilityTimeSlot[] = date
    ? schedule.find((s: DoctorAvailability) => s.dayOfWeek === toDayName(date))?.timeSlots || []
    : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b">
         <Button variant="ghost" size="icon" onClick={onBack} className="-ml-3 shrink-0">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
         </Button>
         <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" /> Array Schedule
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
               Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialty}
            </p>
         </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading schedule...</div>
      ) : schedule.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 border rounded-xl">
           <p className="text-gray-600 font-medium">This doctor currently has no available schedule set.</p>
           <Button variant="outline" className="mt-4" onClick={onBack}>Go Back</Button>
        </div>
      ) : (
         <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div>
                  <Label className="text-base font-semibold mb-3 block">1. Select Date</Label>
                  <Calendar
                     mode="single"
                     selected={date}
                     onSelect={(d) => {
                        setDate(d);
                        setTimeSlot(""); // reset time slot on new date
                     }}
                     disabled={(d) => isBefore(d, startOfDay(new Date())) || isDayAvailable(d)}
                     className="rounded-md border mx-auto md:mx-0 shadow-sm"
                  />
               </div>
               
               <div>
                  <Label className="text-base font-semibold mb-3 block">2. Select Time Slot</Label>
                  {!date ? (
                     <div className="h-64 flex items-center justify-center bg-gray-50 border border-dashed rounded-lg">
                        <p className="text-gray-400">Please select a date first</p>
                     </div>
                  ) : availableSlots.length === 0 ? (
                     <div className="h-64 flex items-center justify-center bg-gray-50 border border-dashed rounded-lg">
                        <p className="text-gray-400">No time slots available for this day.</p>
                     </div>
                  ) : (
                     <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-2">
                        {availableSlots.map((slot: AvailabilityTimeSlot, i: number) => {
                           const timeStr = `${slot.startTime}-${slot.endTime}`;
                           const isBooked = slot.isBooked;
                           const isSelected = timeSlot === timeStr;
                           return (
                              <Button
                                 key={i}
                                 variant={isSelected ? "default" : "outline"}
                                 className={`h-12 border ${
                                    isBooked 
                                       ? "opacity-50 cursor-not-allowed bg-gray-100 hover:bg-gray-100" 
                                       : isSelected 
                                          ? "ring-2 ring-primary ring-offset-1" 
                                          : ""
                                 }`}
                                 disabled={isBooked}
                                 onClick={() => setTimeSlot(timeStr)}
                              >
                                 <Clock className="w-4 h-4 mr-2" />
                                 {timeStr}
                              </Button>
                           );
                        })}
                     </div>
                  )}
               </div>
            </div>

            <div className="pt-6 border-t">
               <Label className="text-base font-semibold mb-3 block">3. Consultation Type</Label>
               <div className="flex flex-wrap gap-4">
                  <Button
                     variant={type === "IN_PERSON" ? "default" : "outline"}
                     onClick={() => setType("IN_PERSON")}
                     className="h-12 px-6"
                  >
                     <MapPin className="w-4 h-4 mr-2" /> In Person
                  </Button>
                  <Button
                     variant={type === "VIDEO" ? "default" : "outline"}
                     onClick={() => setType("VIDEO")}
                     className="h-12 px-6"
                  >
                     <Video className="w-4 h-4 mr-2" /> Video Call
                  </Button>
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
               <Button variant="outline" onClick={onBack}>Cancel</Button>
               <Button 
                  onClick={onNext} 
                  disabled={!date || !timeSlot}
                  className="w-32"
               >
                  Next
               </Button>
            </div>
         </div>
      )}
    </div>
  );
}

function Step3Confirmation({
   doctor,
   date,
   timeSlot,
   type,
   reason,
   setReason,
   onBack,
   onConfirm,
   isSubmitting
}: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b">
         <Button variant="ghost" size="icon" onClick={onBack} disabled={isSubmitting} className="-ml-3 shrink-0">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
         </Button>
         <h2 className="text-xl font-bold">Confirm Booking</h2>
      </div>

      <div className="space-y-6">
         {/* Important Notice */}
         <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
               <p className="font-medium text-sm">Doctor Approval Required</p>
               <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">
                  Your appointment will remain in a pending state until accepted by the doctor. Once confirmed, you will be notified.
               </p>
            </div>
         </div>

         {/* Summary Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-50 border-transparent">
               <CardContent className="p-4 space-y-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Doctor Details</span>
                  <p className="font-semibold text-gray-900">Dr. {doctor.firstName} {doctor.lastName}</p>
                  <p className="text-sm text-gray-600">{doctor.specialty} • {doctor.hospital || "Independent"}</p>
               </CardContent>
            </Card>
            <Card className="bg-gray-50 border-transparent">
               <CardContent className="p-4 space-y-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Schedule & Type</span>
                  <p className="font-semibold text-gray-900">{format(date, "MMM dd, yyyy")} at {timeSlot}</p>
                  <p className="text-sm flex items-center gap-1.5 text-gray-800">
                     {type === "VIDEO" ? <Video className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-green-500" />}
                     {type === "VIDEO" ? "Video Consultation" : "In-Person Visit"}
                  </p>
               </CardContent>
            </Card>
         </div>

         <div className="flex justify-between items-center py-3 border-y border-dashed">
            <span className="text-gray-600 font-medium">Consultation Fee</span>
            <span className="text-xl font-bold">${doctor.consultationFee}</span>
         </div>

         {/* Reason Textarea */}
         <div className="space-y-2">
            <Label className="text-sm font-semibold">Reason for Visit <span className="text-red-500">*</span></Label>
            <Textarea
               value={reason}
               onChange={(e) => setReason(e.target.value)}
               placeholder="Please briefly describe your symptoms or reason for consulting the doctor..."
               className="resize-none h-28"
            />
         </div>

         <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={onBack} disabled={isSubmitting}>Back</Button>
            <Button onClick={onConfirm} disabled={!reason.trim() || isSubmitting} className="w-40">
               {isSubmitting ? "Booking..." : "Confirm Booking"}
            </Button>
         </div>
      </div>
    </div>
  );
}

function Step4Success({ data, onReset, onViewAll }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-8 md:p-12 text-center animate-in zoom-in-95 duration-500 max-w-2xl mx-auto mt-10">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
         <CheckCircle2 className="w-10 h-10" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Request Sent Successfully!</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
         Your appointment request has been securely sent to the doctor. 
         It is pending their final approval.
      </p>

      <div className="bg-gray-50 border rounded-lg p-6 max-w-sm mx-auto text-left mb-8 space-y-3">
         <div className="flex justify-between items-center pb-2 border-b">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Ref ID</span>
            <span className="font-mono font-medium text-sm">#{data.id.split('-')[0]}</span>
         </div>
         <div className="space-y-1 pt-1">
            <p className="font-semibold text-gray-900">{data.doctorName}</p>
            <p className="text-sm text-gray-600 flex justify-between">
               <span>{format(new Date(data.date), "MMM dd, yyyy")}</span>
               <span>{data.timeSlot}</span>
            </p>
         </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3">
         <Button variant="outline" onClick={onViewAll} className="h-11 px-8">
            View My Appointments
         </Button>
         <Button onClick={onReset} className="h-11 px-8">
            Book Another
         </Button>
      </div>
    </div>
  );
}