"use client";

import { useState } from "react";
import { Plus, Trash2, Clock, Check, X } from "lucide-react";
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

// Helper to generate 30 min slots from 00:00 to 23:30
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
  const [draftSlots, setDraftSlots] = useState<TimeSlotDraft[]>([]);

  // Function to add an empty slot draft
  const addDraftSlot = () => {
    setDraftSlots([...draftSlots, { startTime: "09:00", endTime: "09:30" }]);
  };

  // Function to update a draft slot
  const updateDraftSlot = (index: number, field: keyof TimeSlotDraft, value: string) => {
    const updated = [...draftSlots];
    updated[index][field] = value;

    // Auto-adjust end time roughly if startTime is changed
    if (field === "startTime") {
      const startIndex = TIME_OPTIONS.indexOf(value);
      if (startIndex !== -1 && startIndex + 1 < TIME_OPTIONS.length) {
        updated[index].endTime = TIME_OPTIONS[startIndex + 1];
      }
    }
    
    setDraftSlots(updated);
  };

  // Remove a draft slot
  const removeDraftSlot = (index: number) => {
    setDraftSlots(draftSlots.filter((_, i) => i !== index));
  };

  // Save the day's slots
  const handleSaveDay = () => {
    if (draftSlots.length === 0) {
      toast.error("Please add at least one time slot, or use Clear Day to remove all slots.");
      return;
    }

    // Basic validation
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
        setDraftSlots([]); // Reset draft after save
      },
      onError: () => {
        toast.error(`Failed to save availability for ${selectedDay}.`);
      }
    });
  };

  // Clear the day entirely from DB
  const handleClearDay = (day: string) => {
    deleteAvailabilityMutation.mutate({ id: doctorId, day }, {
      onSuccess: () => {
        toast.success(`Availability cleared for ${day}.`);
        if (day === selectedDay) setDraftSlots([]);
      },
      onError: () => {
        toast.error("Failed to clear availability.");
      }
    });
  };

  if (isLoading) return <div className="p-4 animate-pulse">Loading schedule...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Availability</CardTitle>
          <CardDescription>
            Select a day from the week to setup your specific 30-minute appointment slots.
            Patients will only be able to book within these ranges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Days Selection Sidebar */}
            <div className="md:col-span-1 flex flex-col space-y-2 border-r pr-4">
              <Label className="mb-2 text-muted-foreground uppercase text-xs font-bold">Select Day</Label>
              {DAYS_OF_WEEK.map((day) => {
                const hasSlots = savedAvailability?.some(a => a.dayOfWeek === day && a.isActive);
                const isActive = selectedDay === day;
                return (
                  <Button
                    key={day}
                    variant={isActive ? "default" : "ghost"}
                    className={`justify-start ${hasSlots && !isActive ? "bg-green-50 text-green-700 hover:bg-green-100" : ""}`}
                    onClick={() => {
                      setSelectedDay(day);
                      setDraftSlots([]);
                    }}
                  >
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                    {hasSlots && <Check className="ml-auto w-4 h-4 text-green-500" />}
                  </Button>
                );
              })}
            </div>

            {/* Editing / Viewing Area */}
            <div className="md:col-span-3">
              <div className="flex justify-between border-b pb-4 items-center">
                <h3 className="text-xl font-semibold">{selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()}'s Schedule</h3>
                
                {/* View existing configured items */}
                {savedAvailability?.find(a => a.dayOfWeek === selectedDay && a.isActive) && (
                  <Button variant="destructive" size="sm" onClick={() => handleClearDay(selectedDay)} disabled={deleteAvailabilityMutation.isPending}>
                    <Trash2 className="w-4 h-4 mr-2" /> Clear Schedule
                  </Button>
                )}
              </div>

              {/* Show saved items */}
              <div className="my-6">
                {savedAvailability?.filter(a => a.dayOfWeek === selectedDay && a.isActive).map(a => (
                  <div key={a.id} className="mb-4">
                    <Label className="text-muted-foreground uppercase text-xs font-bold mb-2 block">Active Configuration</Label>
                    <div className="flex flex-wrap gap-2">
                      {a.timeSlots.map((slot, i) => (
                        <div key={i} className={`flex items-center space-x-1 border px-3 py-1 rounded-md text-sm ${slot.isBooked ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-green-50 border-green-200 text-green-700"}`}>
                          <Clock className="w-3 h-3" />
                          <span>{slot.startTime} - {slot.endTime}</span>
                          {slot.isBooked && <span className="ml-1 text-[10px] bg-orange-200 px-1 rounded">Booked</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {(!savedAvailability?.find(a => a.dayOfWeek === selectedDay && a.isActive)) && (
                   <p className="text-muted-foreground text-sm italic mb-4">No working hours configured for this day yet.</p>
                )}
              </div>

              {/* Form to insert new override */}
              <div className="bg-secondary/20 p-4 rounded-lg border">
                <Label className="mb-4 block">{savedAvailability?.find(a => a.dayOfWeek === selectedDay && a.isActive) ? "Overwrite Existing Schedule" : "Add Working Hours"}</Label>
                
                <div className="space-y-4">
                  {draftSlots.map((draft, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <select 
                        value={draft.startTime} 
                        onChange={(e) => updateDraftSlot(idx, "startTime", e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      >
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span className="text-muted-foreground">to</span>
                      <select 
                        value={draft.endTime} 
                        onChange={(e) => updateDraftSlot(idx, "endTime", e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      >
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <Button variant="ghost" size="icon" onClick={() => removeDraftSlot(idx)}>
                        <X className="w-5 h-5 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm" onClick={addDraftSlot} className="border-dashed">
                      <Plus className="w-4 h-4 mr-2" /> Add Slot
                    </Button>
                    
                    {draftSlots.length > 0 && (
                      <Button size="sm" onClick={handleSaveDay} disabled={setAvailabilityMutation.isPending}>
                        Save {selectedDay.toLowerCase().charAt(0).toUpperCase() + selectedDay.toLowerCase().slice(1)}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}