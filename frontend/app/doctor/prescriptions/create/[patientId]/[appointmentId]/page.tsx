"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PlusCircle, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useGetMyDoctorProfile, useCreatePrescription, type Medicine } from "@/api/doctorApi";

const EMPTY_MEDICINE: Medicine = {
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

export default function CreatePrescriptionPage() {
  const router = useRouter();
  const params = useParams();
  
  const patientId = params?.patientId as string || "";
  const appointmentId = params?.appointmentId as string || "";

  const { data: doctor } = useGetMyDoctorProfile();
  const createMutation = useCreatePrescription();

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([{ ...EMPTY_MEDICINE }]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor?.id || !canSubmit) return;

    createMutation.mutate(
      {
        doctorId: doctor.id,
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
          router.push("/doctor/prescriptions");
        },
        onError: () => toast.error("Failed to issue prescription."),
      }
    );
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Create Prescription</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Patient ID: {patientId} {appointmentId && `| Appointment ID: ${appointmentId}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-card border border-border/60 p-6 rounded-xl">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              placeholder="e.g. Upper respiratory infection"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Clinical Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes for the patient..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <Label className="text-lg font-medium">Medicines</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={addMedicine}
            >
              <PlusCircle className="w-4 h-4" />
              Add another medicine
            </Button>
          </div>

          <div className="space-y-4">
            {medicines.map((med, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start rounded-lg border border-border/60 p-4 relative bg-muted/20"
              >
                {medicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedicine(idx)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    title="Remove medicine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <div className="space-y-1">
                  <Label className="text-xs">Medicine Name *</Label>
                  <Input
                    placeholder="e.g. Paracetamol"
                    value={med.name}
                    onChange={(e) => updateMedicine(idx, "name", e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Dosage *</Label>
                  <Input
                    placeholder="e.g. 500mg"
                    value={med.dosage}
                    onChange={(e) => updateMedicine(idx, "dosage", e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Frequency *</Label>
                  <Input
                    placeholder="e.g. Twice daily"
                    value={med.frequency}
                    onChange={(e) => updateMedicine(idx, "frequency", e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Duration *</Label>
                  <Input
                    placeholder="e.g. 7 days"
                    value={med.duration}
                    onChange={(e) => updateMedicine(idx, "duration", e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1 xl:col-span-1 lg:col-span-2 md:col-span-2">
                  <Label className="text-xs text-muted-foreground">Special Instructions</Label>
                  <Input
                    placeholder="e.g. Take after meals"
                    value={med.instructions ?? ""}
                    onChange={(e) => updateMedicine(idx, "instructions", e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit || createMutation.isPending}
            className="min-w-[120px]"
          >
            {createMutation.isPending ? "Submitting..." : "Submit Prescription"}
          </Button>
        </div>
      </form>
    </div>
  );
}
