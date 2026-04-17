"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  User,
  Phone,
  MapPin,
  Droplets,
  Weight,
  Ruler,
  AlertCircle,
  PhoneCall,
  CreditCard,
  Calendar,
  Activity,
  CheckCircle2,
  MessageSquare,
  Star,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useStore } from "@/store/store";
import { useRegisterPatient, useGetMyPatientProfile, useUpdateMyPatientProfile, type PatientPayload, type Patient } from "@/api/patientApi";
import { useGetFeedbackByPatient } from "@/api/feedbackApi";
import { markProfileCreated } from "@/api/userApi";

// ─── Edit Profile Dialog ─────────────────────────────────────────────────────

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function EditProfileDialog({ open, onClose, current }: { open: boolean; onClose: () => void; current: Patient }) {
  const [form, setForm] = useState<PatientPayload>({
    phone: current.phone ?? "",
    dateOfBirth: current.dateOfBirth ?? "",
    address: current.address ?? "",
    gender: current.gender ?? "",
    bloodGroup: current.bloodGroup ?? "",
    nicNumber: current.nicNumber ?? "",
    allergies: current.allergies ?? "",
    emergencyContactPhone: current.emergencyContactPhone ?? "",
    height: current.height,
    weight: current.weight,
  });

  const updatePatient = useUpdateMyPatientProfile();

  const set = (field: keyof PatientPayload, value: string | number | undefined) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone || !form.dateOfBirth || !form.gender) {
      toast.error("Phone, date of birth and gender are required.");
      return;
    }
    updatePatient.mutate(form, {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        onClose();
      },
      onError: () => {
        toast.error("Failed to update profile. Please try again.");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Personal Details */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Personal Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ep-phone">Phone <span className="text-rose-500">*</span></Label>
                <Input id="ep-phone" placeholder="+94 77 123 4567" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ep-dob">Date of Birth <span className="text-rose-500">*</span></Label>
                <Input id="ep-dob" type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ep-gender">Gender <span className="text-rose-500">*</span></Label>
                <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                  <SelectTrigger id="ep-gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ep-nic">NIC Number</Label>
                <Input id="ep-nic" placeholder="123456789V" value={form.nicNumber} onChange={(e) => set("nicNumber", e.target.value)} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="ep-address">Address</Label>
                <Textarea id="ep-address" placeholder="123 Main St, Colombo" value={form.address} onChange={(e) => set("address", e.target.value)} className="resize-none" rows={2} />
              </div>
            </div>
          </div>

          {/* Medical Details */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Medical Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ep-blood">Blood Group</Label>
                <Select value={form.bloodGroup} onValueChange={(v) => set("bloodGroup", v)}>
                  <SelectTrigger id="ep-blood"><SelectValue placeholder="Select blood group" /></SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ep-emergency">Emergency Contact Phone</Label>
                <Input id="ep-emergency" placeholder="+94 77 987 6543" value={form.emergencyContactPhone} onChange={(e) => set("emergencyContactPhone", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ep-height">Height (cm)</Label>
                <Input id="ep-height" type="number" placeholder="170" value={form.height ?? ""} onChange={(e) => set("height", e.target.value ? parseFloat(e.target.value) : undefined)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ep-weight">Weight (kg)</Label>
                <Input id="ep-weight" type="number" placeholder="65" value={form.weight ?? ""} onChange={(e) => set("weight", e.target.value ? parseFloat(e.target.value) : undefined)} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="ep-allergies">Allergies</Label>
                <Textarea id="ep-allergies" placeholder="Penicillin, Peanuts..." value={form.allergies} onChange={(e) => set("allergies", e.target.value)} className="resize-none" rows={2} />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={updatePatient.isPending}>Cancel</Button>
            <Button type="submit" disabled={updatePatient.isPending}>
              {updatePatient.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Profile Creation Form ────────────────────────────────────────────────────

function ProfileCreationForm() {
  const user = useStore((s) => s.user);
  const updateUser = useStore((s) => s.updateUser);

  const [form, setForm] = useState<PatientPayload>({
    phone: "",
    dateOfBirth: "",
    address: "",
    gender: "",
    bloodGroup: "",
    nicNumber: "",
    allergies: "",
    emergencyContactPhone: "",
    height: undefined,
    weight: undefined,
  });

  const registerPatient = useRegisterPatient();

  const set = (field: keyof PatientPayload, value: string | number | undefined) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.phone || !form.dateOfBirth || !form.gender) {
      toast.error("Phone, date of birth and gender are required.");
      return;
    }

    try {
      await registerPatient.mutateAsync(form);

      if (user?.userId) {
        await markProfileCreated(user.userId);
        updateUser({ isProfileCreated: true });
      }

      toast.success("Profile created successfully!");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create profile.";
      toast.error(msg);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Complete Your Profile
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Fill in your details to get started with eDoc.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">
                Phone Number <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="+94 77 123 4567"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="border-border/60"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dob">
                Date of Birth <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="dob"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => set("dateOfBirth", e.target.value)}
                className="border-border/60"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gender">
                Gender <span className="text-rose-500">*</span>
              </Label>
              <Select onValueChange={(v) => set("gender", v)}>
                <SelectTrigger id="gender" className="border-border/60">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nic">NIC Number</Label>
              <Input
                id="nic"
                placeholder="123456789V"
                value={form.nicNumber}
                onChange={(e) => set("nicNumber", e.target.value)}
                className="border-border/60"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="address">
                <MapPin className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />
                Address
              </Label>
              <Textarea
                id="address"
                placeholder="123 Main St, Colombo"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className="border-border/60 resize-none"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Medical Details */}
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              Medical Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bloodGroup">
                <Droplets className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />
                Blood Group
              </Label>
              <Select onValueChange={(v) => set("bloodGroup", v)}>
                <SelectTrigger id="bloodGroup" className="border-border/60">
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emergencyContact">
                <PhoneCall className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />
                Emergency Contact Phone
              </Label>
              <Input
                id="emergencyContact"
                placeholder="+94 77 987 6543"
                value={form.emergencyContactPhone}
                onChange={(e) => set("emergencyContactPhone", e.target.value)}
                className="border-border/60"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="height">
                <Ruler className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />
                Height (cm)
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="170"
                value={form.height ?? ""}
                onChange={(e) =>
                  set("height", e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="border-border/60"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="weight">
                <Weight className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                placeholder="65"
                value={form.weight ?? ""}
                onChange={(e) =>
                  set("weight", e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="border-border/60"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="allergies">
                <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />
                Allergies
              </Label>
              <Textarea
                id="allergies"
                placeholder="Penicillin, Peanuts..."
                value={form.allergies}
                onChange={(e) => set("allergies", e.target.value)}
                className="border-border/60 resize-none"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={registerPatient.isPending}
            className="min-w-[160px]"
          >
            {registerPatient.isPending ? "Saving..." : "Create Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function PatientDashboardContent() {
  const [editOpen, setEditOpen] = useState(false);
  const user = useStore((s) => s.user);
  const { data: profile, isLoading: profileLoading } = useGetMyPatientProfile();
  const { data: feedbacks = [] } = useGetFeedbackByPatient(user?.userId || "");

  // Calculate feedback statistics
  const feedbackStats = React.useMemo(() => {
    const totalFeedbacks = feedbacks.length;
    const averageRating = totalFeedbacks > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
      : 0;
    const approvedFeedbacks = feedbacks.filter(f => f.status === 'APPROVED').length;

    return {
      totalFeedbacks,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      approvedFeedbacks,
    };
  }, [feedbacks]);

  if (profileLoading) {
    return (
      <div className="w-full h-full p-6 lg:p-10 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 lg:p-10 space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] ?? "Patient"}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Here&apos;s an overview of your health profile.
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 font-medium"
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          {profile?.status ?? "ACTIVE"}
        </Badge>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Gender</p>
                <p className="text-sm font-semibold text-foreground capitalize">
                  {profile?.gender?.toLowerCase() ?? "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10">
                <Droplets className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Blood Group</p>
                <p className="text-sm font-semibold text-foreground">
                  {profile?.bloodGroup ?? "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                <Ruler className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Height / Weight</p>
                <p className="text-sm font-semibold text-foreground">
                  {profile?.height ? `${profile.height} cm` : "—"} /{" "}
                  {profile?.weight ? `${profile.weight} kg` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-500/10">
                <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Feedback Given</p>
                <p className="text-sm font-semibold text-foreground">
                  {feedbackStats.totalFeedbacks} reviews
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/10">
                <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Average Rating</p>
                <p className="text-sm font-semibold text-foreground">
                  {feedbackStats.averageRating > 0 ? `${feedbackStats.averageRating} ⭐` : "No ratings yet"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10">
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Approved Reviews</p>
                <p className="text-sm font-semibold text-foreground">
                  {feedbackStats.approvedFeedbacks} approved
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog */}
      {profile && (
        <EditProfileDialog open={editOpen} onClose={() => setEditOpen(false)} current={profile} />
      )}

      {/* Profile detail table */}
      <Card className="border-border/60">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            Profile Details
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit Profile
          </Button>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border/40">
                {[
                  { label: "Full Name", value: user?.name },
                  { label: "Email", value: user?.email },
                  { label: "Phone", value: profile?.phone ?? user?.phoneNumber },
                  { label: "NIC Number", value: profile?.nicNumber },
                  { label: "Address", value: profile?.address },
                  { label: "Allergies", value: profile?.allergies },
                  {
                    label: "Emergency Contact",
                    value: profile?.emergencyContactPhone,
                  },
                ].map(({ label, value }) => (
                  <tr key={label} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 pr-6 text-muted-foreground font-medium w-48">
                      {label}
                    </td>
                    <td className="py-3 text-foreground">{value ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PatientDashboard() {
  const isProfileCreated = useStore((s) => s.user?.isProfileCreated);

  if (!isProfileCreated) {
    return <ProfileCreationForm />;
  }

  return <PatientDashboardContent />;
}

