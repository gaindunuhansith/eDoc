"use client";

import { useState, useEffect } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { CalendarDays, Clock, MapPin, Video, Info } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

import { 
  useGetDoctorAvailability, 
  type DoctorAvailability, 
  type AvailabilityTimeSlot 
} from "@/api/doctorApi";
import { useUpdateAppointment, type Appointment, type AppointmentType } from "@/api/appointmentApi";

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

interface ModifyAppointmentDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModifyAppointmentDialog({ appointment, open, onOpenChange }: ModifyAppointmentDialogProps) {
  const doctorId = appointment?.doctorId || "";

  // The local state mimicking the current appointment initially
  const [date, setDate] = useState<Date | undefined>();
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [type, setType] = useState<AppointmentType>("IN_PERSON");

  // Automatically pre-fill when dialog opens with a valid appointment
  useEffect(() => {
    if (open && appointment) {
      // Avoid time zone issues with string parsing, create valid Date
      const parsedDate = new Date(appointment.appointmentDate + "T00:00:00");
      setDate(parsedDate);
      setTimeSlot(appointment.timeSlot);
      setType(appointment.type);
    }
  }, [open, appointment]);

  const { data: schedule = [], isLoading } = useGetDoctorAvailability(doctorId);
  const updateMutation = useUpdateAppointment();

  const handleSave = () => {
    if (!appointment || !date || !timeSlot) return;

    const dayOfWeek = toDayName(date);
    const formattedDate = format(date, "yyyy-MM-dd");

    updateMutation.mutate(
      {
        id: appointment.id,
        update: {
          appointmentDate: formattedDate,
          timeSlot: timeSlot,
          dayOfWeek: dayOfWeek,
          type: type,
        },
      },
      {
        onSuccess: () => {
          toast.success("Appointment modified successfully");
          onOpenChange(false);
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || "Failed to update appointment";
          toast.error(msg);
        },
      }
    );
  };

  // Availability Helpers
  const activeDaysSet = new Set(
    schedule.filter((s: DoctorAvailability) => s.isActive).map((s: DoctorAvailability) => s.dayOfWeek)
  );

  const isDayAvailable = (day: Date) => {
    const today = startOfDay(new Date());
    if (isBefore(day, today)) return true; 
    const dayName = toDayName(day);
    return !activeDaysSet.has(dayName);
  };

  const availableSlots: AvailabilityTimeSlot[] = date
    ? schedule.find((s: DoctorAvailability) => s.dayOfWeek === toDayName(date))?.timeSlots || []
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Modify Appointment</DialogTitle>
          <DialogDescription>
            Update the date, time slot, and consultation type for your pending appointment with Dr. {appointment?.doctorName}.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Loading schedule...</div>
        ) : schedule.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 border rounded-xl">
             <p className="text-gray-600 font-medium">This doctor currently has no available schedule set.</p>
          </div>
        ) : (
           <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* DATE PICKER */}
                 <div>
                    <Label className="text-sm font-semibold mb-3 block">1. Select Date</Label>
                    <Calendar
                       mode="single"
                       selected={date}
                       onSelect={(d) => {
                          setDate(d);
                          setTimeSlot(""); 
                       }}
                       disabled={(d) => isBefore(d, startOfDay(new Date())) || isDayAvailable(d)}
                       className="rounded-md border shadow-sm p-3 w-max"
                    />
                 </div>
                 
                 {/* TIME SLOTS */}
                 <div>
                    <Label className="text-sm font-semibold mb-3 block">2. Select Time Slot</Label>
                    {!date ? (
                       <div className="h-56 flex items-center justify-center bg-gray-50 border border-dashed rounded-lg">
                          <p className="text-gray-400 text-sm">Please select a date first</p>
                       </div>
                    ) : availableSlots.length === 0 ? (
                       <div className="h-56 flex items-center justify-center bg-gray-50 border border-dashed rounded-lg">
                          <p className="text-gray-400 text-sm">No time slots available.</p>
                       </div>
                    ) : (
                       <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                          {availableSlots.map((slot: AvailabilityTimeSlot, i: number) => {
                             const timeStr = `${slot.startTime}-${slot.endTime}`;
                             // If it's already the exact same slot we had, don't mark completely blocked out if the system 
                             // says it's booked (since WE are the ones who booked it).
                             const isCurrentApptSlot = 
                                appointment?.timeSlot === timeStr && 
                                appointment?.appointmentDate === (date ? format(date, "yyyy-MM-dd") : "");
                             const isBooked = slot.isBooked && !isCurrentApptSlot;
                             const isSelected = timeSlot === timeStr;
                             
                             return (
                                <Button
                                   key={i}
                                   variant={isSelected ? "default" : "outline"}
                                   className={`h-11 border text-xs px-2 ${
                                      isBooked 
                                         ? "opacity-50 cursor-not-allowed bg-gray-100 hover:bg-gray-100" 
                                         : isSelected 
                                            ? "ring-2 ring-primary ring-offset-1" 
                                            : ""
                                   }`}
                                   disabled={isBooked}
                                   onClick={() => setTimeSlot(timeStr)}
                                >
                                   <Clock className="w-3 h-3 mr-1.5" />
                                   {timeStr}
                                </Button>
                             );
                          })}
                       </div>
                    )}
                 </div>
              </div>

              {/* TYPE */}
              <div className="pt-4 border-t">
                 <Label className="text-sm font-semibold mb-3 block">3. Consultation Type</Label>
                 <div className="flex flex-wrap gap-3">
                    <Button
                       variant={type === "IN_PERSON" ? "default" : "outline"}
                       onClick={() => setType("IN_PERSON")}
                       className="h-10 px-5 text-sm"
                    >
                       <MapPin className="w-4 h-4 mr-2" /> In Person
                    </Button>
                    <Button
                       variant={type === "VIDEO" ? "default" : "outline"}
                       onClick={() => setType("VIDEO")}
                       className="h-10 px-5 text-sm"
                    >
                       <Video className="w-4 h-4 mr-2" /> Video Call
                    </Button>
                 </div>
              </div>
              
              {/* Note / Info */}
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-3 text-blue-800 text-sm">
                 <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                 <p>Modifying your appointment will immediately update its date and time. It will remain in <span className="font-semibold">PENDING</span> status until re-confirmed by the doctor.</p>
              </div>
           </div>
        )}

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={!date || !timeSlot || updateMutation.isPending}
            className="w-32"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
