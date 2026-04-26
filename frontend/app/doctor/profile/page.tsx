"use client";

import { useState, useEffect } from "react";
import { useGetCurrentUser } from "@/api/userApi";
import { useGetDoctorById, useUpdateDoctor, useToggleDoctorAvailability } from "@/api/doctorApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertCircle } from "lucide-react";

export default function DoctorProfilePage() {
  const { data: user, isLoading: userLoading } = useGetCurrentUser();
  const { 
    data: doctorData, 
    isLoading: doctorLoading, 
  } = useGetDoctorById(user?.userId || "");

  const updateDoctorMutation = useUpdateDoctor();
  const toggleAvailabilityMutation = useToggleDoctorAvailability();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    specialty: "",
    qualification: "",
    licenseNumber: "",
    experienceYears: 0,
    hospital: "",
    bio: "",
    consultationFee: 0,
  });

  useEffect(() => {
    if (doctorData) {
      setFormData({
        firstName: doctorData.firstName || "",
        lastName: doctorData.lastName || "",
        phoneNumber: doctorData.phoneNumber || "",
        specialty: doctorData.specialty || "",
        qualification: doctorData.qualification || "",
        licenseNumber: doctorData.licenseNumber || "",
        experienceYears: doctorData.experienceYears || 0,
        hospital: doctorData.hospital || "",
        bio: doctorData.bio || "",
        consultationFee: doctorData.consultationFee || 0,
      });
    }
  }, [doctorData]);

  if (userLoading || doctorLoading) {
    return <div className="flex h-screen items-center justify-center font-semibold animate-pulse text-lg">Loading Profile...</div>;
  }

  if (!doctorData) {
    return (
      <div className="p-8 max-w-4xl mx-auto mt-10">
        <Card className="border-orange-200 bg-orange-50 shadow-sm">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-orange-500" />
            </div>
            <CardTitle className="text-2xl text-orange-800">Account Pending Verification</CardTitle>
            <CardDescription className="text-orange-700 mt-2 text-base">
              You must be verified before modifying your full profile.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !doctorData) return;

    updateDoctorMutation.mutate({
      id: user.userId,
      payload: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        specialty: formData.specialty,
        qualification: formData.qualification,
        licenseNumber: formData.licenseNumber,
        experienceYears: Number(formData.experienceYears),
        hospital: formData.hospital,
        bio: formData.bio,
        consultationFee: Number(formData.consultationFee),
      }
    }, {
      onSuccess: () => toast.success("Profile Updated successfully."),
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || "Failed to update profile.";
        toast.error("Update Failed", { description: msg });
      }
    });
  };

  const handleToggleAvailability = () => {
    if (!user) return;
    toggleAvailabilityMutation.mutate(user.userId, {
      onSuccess: (res) => toast.success("Availability updated", { description: res.data?.message || "Success." }),
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || "Failed to toggle availability.";
        toast.error("Toggle Failed", { description: msg });
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Doctor Profile</h1>
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-muted-foreground">Availability Status</span>
            <Badge variant={doctorData.isAvailable ? "default" : "destructive"}>
              {doctorData.isAvailable ? "Online" : "Offline"}
            </Badge>
          </div>
          <Button 
            variant={doctorData.isAvailable ? "destructive" : "default"}
            onClick={handleToggleAvailability}
            disabled={toggleAvailabilityMutation.isPending}
          >
            {doctorData.isAvailable ? "Go Offline" : "Go Online"}
          </Button>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Personal & Professional Details</CardTitle>
          <CardDescription>Update your consultation details and contact info.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input id="specialty" value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input id="qualification" value={formData.qualification} onChange={(e) => setFormData({...formData, qualification: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input id="licenseNumber" value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceYears">Years of Experience</Label>
                <Input id="experienceYears" type="number" min="0" value={formData.experienceYears} onChange={(e) => setFormData({...formData, experienceYears: Number(e.target.value)})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital / Clinic</Label>
                <Input id="hospital" value={formData.hospital} onChange={(e) => setFormData({...formData, hospital: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
                <Input id="consultationFee" type="number" min="0" value={formData.consultationFee} onChange={(e) => setFormData({...formData, consultationFee: Number(e.target.value)})} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Input id="bio" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
            </div>
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={updateDoctorMutation.isPending} className="px-8 shadow-md">
                  {updateDoctorMutation.isPending ? "Saving..." : "Save Profile Details"}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
