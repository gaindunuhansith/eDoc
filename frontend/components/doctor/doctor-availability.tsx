"use client";

import { useState } from "react";
import { Plus, Trash2, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useGetDoctorAvailability, useSetDoctorAvailability, useDeleteDoctorAvailability } from "@/api/doctorApi";

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const generateTimeOptions = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      times.push(`${hh}:${mm}`);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

interface TimeSlotDraft {
  startTime: string;
  endTime: string;
}

export default function DoctorAvailability({ doctorId }: { doctorId: string }) {
  const { data: savedAvailability, isLoading } = useGetDoctorAvailability(doctorId);
  const setAvailabilityMutation = useSetDoctorAvailability();
  const deleteAvailabilityMutation = useDeleteDoctorAvailability();

  const [selectedDay, setSelectedDay] = useState<string>("MONDAY");
  const [draftSlots, setDraftSlots] = useState<TimeSlotDraft[]>([{ startTime: "09:00", endTime: "17:00" }]);

  const addDraftSlot = () => {
    setDraftSlots([...draftSlots, { startTime: "09:00", endTime: "09:30" }]);
  };

  const updateDraftSlot = (index: number, field: keyof TimeSlotDraft, value: string) => {
    const updated = [...draftSlots];
    updated[index][field] = value;
    setDraftSlots(updated);
  };

  const removeDraftSlot = (index: number) => {
    setDraftSlots(draftSlots.filter((_, i) => i !== index));
  };

  const handleSaveDay = () => {
    if (draftSlots.length === 0) {
      toast.error("Please add at least one time slot.");
      return;
    }

    for (const slot of draftSlots) {
      const startIdx = TIME_OPTIONS.indexOf(slot.startTime);
      const endIdx = TIME_OPTIONS.indexOf(slot.endTime);
      if (startIdx >= endIdx) {
        toast.error("End time must be after start time for all slots.");
        return;
      }
    }

    setAvailabilityMutation.mutate({
      id: doctorId,
      payload: {
        dayOfWeek: selectedDay,
        timeSlots: draftSlots
      }
    }, {
      onSuccess: () => {
        toast.success(`Availability saved for ${selectedDay}.`);
        setDraftSlots([{ startTime: "09:00", endTime: "17:00" }]); // Reset form
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || `Failed to save availability for ${selectedDay}.`;
        toast.error(msg);
      }
    });
  };

  const handleDeleteDay = (day: string) => {
    if (!window.confirm("Are you sure you want to delete this day's schedule? This cannot be undone.")) return;

    deleteAvailabilityMutation.mutate({ id: doctorId, day }, {
      onSuccess: () => {
        toast.success(`Availability removed for ${day}.`);
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || "Failed to remove availability.";
        toast.error(msg);
      }
    });
  };

  if (isLoading) return <div className="p-4 animate-pulse font-semibold">Loading schedule...</div>;

  const activeSchedules = savedAvailability?.filter(a => a.isActive) || [];

  return (
    <div className="space-y-8">
      {/* Weekly View Section */}
      <Card>
        <CardHeader>
          <CardTitle>Current Schedule (Weekly View)</CardTitle>
          <CardDescription>Your working days and time slots.</CardDescription>
        </CardHeader>
        <CardContent>
          {activeSchedules.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">No schedule configured. Add a day below.</p>
          ) : (
            <div className="space-y-6">
              {DAYS_OF_WEEK.map(day => {
                const schedule = activeSchedules.find(a => a.dayOfWeek === day);
                if (!schedule) return null;

                return (
                  <div key={day} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-3">{day.charAt(0) + day.slice(1).toLowerCase()}</h3>
                      <div className="flex flex-wrap gap-3">
                        {schedule.timeSlots.map((slot, i) => (
                          <div key={i} className={`flex items-center space-x-1 border px-3 py-1.5 rounded-md text-sm font-medium ${slot.isBooked ? "bg-gray-100 border-gray-300 text-gray-500 line-through opacity-70" : "bg-green-50 border-green-200 text-green-700"}`}>
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{slot.startTime} - {slot.endTime}</span>
                            {slot.isBooked && <span className="ml-2 text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Booked/Locked</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteDay(day)} disabled={deleteAvailabilityMutation.isPending} className="self-start">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Day
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Schedule Form Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add / Update Schedule</CardTitle>
          <CardDescription>Configure working hours for a specific day.</CardDescription>
        </CardHeader>
        <CardContent className="bg-secondary/10 p-6 rounded-xl border m-4 mt-0">
          <div className="space-y-6">
            <div className="space-y-2 max-w-sm">
              <Label className="font-semibold block">Day of the Week</Label>
              <select 
                value={selectedDay} 
                onChange={(e) => setSelectedDay(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              <Label className="font-semibold block">Time Slots</Label>
              {draftSlots.map((draft, idx) => (
                <div key={idx} className="flex items-center space-x-2 w-full max-w-lg">
                  <select 
                    value={draft.startTime} 
                    onChange={(e) => updateDraftSlot(idx, "startTime", e.target.value)}
                    className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                  >
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="text-muted-foreground font-medium px-2">to</span>
                  <select 
                    value={draft.endTime} 
                    onChange={(e) => updateDraftSlot(idx, "endTime", e.target.value)}
                    className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                  >
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <Button variant="ghost" size="icon" onClick={() => removeDraftSlot(idx)} className="hover:bg-red-50" title="Remove slot">
                    <X className="w-5 h-5 text-red-500" />
                  </Button>
                </div>
              ))}
              
              <div className="flex gap-4 pt-2">
                <Button variant="outline" onClick={addDraftSlot} className="border-dashed bg-white">
                  <Plus className="w-4 h-4 mr-2" /> Add another slot
                </Button>
                <Button onClick={handleSaveDay} disabled={setAvailabilityMutation.isPending || draftSlots.length === 0} className="px-8 shadow-sm">
                  Save {selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}