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

import { useStore } from "@/store/store";
import { useRegisterPatient, useGetMyPatientProfile, type PatientPayload } from "@/api/patientApi";
import { markProfileCreated } from "@/api/userApi";

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
  const user = useStore((s) => s.user);
  const { data: profile, isLoading } = useGetMyPatientProfile();

  if (isLoading) {
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
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Date of Birth</p>
                <p className="text-sm font-semibold text-foreground">
                  {profile?.dateOfBirth ?? "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile detail table */}
      <Card className="border-border/60">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            Profile Details
          </CardTitle>
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

