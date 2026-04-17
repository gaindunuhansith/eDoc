"use client";

import { useState } from "react";
import { useGetCurrentUser } from "@/api/userApi";
import { useGetDoctorById, useUpdateDoctor } from "@/api/doctorApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, AlertCircle, Calendar, Users, FileText, Settings, HeartPulse, Stethoscope, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DoctorAvailability from "@/components/doctor/doctor-availability";
import { mockTodaysAppointments, mockRecentPatients } from "@/lib/fallback";

export default function DoctorDashboard() {
  const { data: user, isLoading: userLoading } = useGetCurrentUser();
  const { 
    data: doctorData, 
    isLoading: doctorLoading, 
    isError: doctorError 
  } = useGetDoctorById(user?.userId || "");

  const updateDoctorMutation = useUpdateDoctor();
  
  const [formData, setFormData] = useState({
    specialty: doctorData?.specialty || "",
    consultationFee: doctorData?.consultationFee || 0,
    hospital: doctorData?.hospital || "",
    bio: doctorData?.bio || "",
    qualification: doctorData?.qualification || "",
    experienceYears: doctorData?.experienceYears || 0,
    licenseNumber: doctorData?.licenseNumber || ""
  });

  if (userLoading || doctorLoading) {
    return <div className="flex h-screen items-center justify-center font-semibold animate-pulse text-lg">Loading Dashboard...</div>;
  }

  // Admin hasn't approved yet (Doctor DB has no record of this user)
  if (doctorError || !doctorData) {
    return (
      <div className="p-8 max-w-4xl mx-auto mt-10">
        <Card className="border-orange-200 bg-orange-50 shadow-sm">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-orange-500" />
            </div>
            <CardTitle className="text-2xl text-orange-800">Account Pending Verification</CardTitle>
            <CardDescription className="text-orange-700 mt-2 text-base">
              Your registration as a Doctor has been received by our administrators.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-orange-700">
            <p>
              Before you can access patient records and configure your consultation profile, an 
              administrator must review and approve your account. We will notify you once you 
              are verified.
            </p>
            <div className="mt-8 p-4 bg-white/60 rounded-md inline-block max-w-sm text-sm border border-orange-100">
              <p className="font-semibold text-orange-900 mb-1">Your Registered Details:</p>
              <ul className="text-left space-y-1">
                <li><strong>Name:</strong> {user?.name}</li>
                <li><strong>Email:</strong> {user?.email}</li>
                <li><strong>User ID:</strong> <span className="font-mono text-xs bg-orange-100 px-1 rounded">{user?.userId}</span></li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isProfileIncomplete = !doctorData.specialty || !doctorData.consultationFee;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !doctorData) return;

    // The backend validation requires personal fields too.
    const nameParts = user.name.split(" ");
    const firstName = doctorData.firstName || nameParts[0] || "Doctor";
    const lastName = doctorData.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Doc");

    updateDoctorMutation.mutate({
      id: user.userId,
      payload: {
        firstName,
        lastName,
        email: doctorData.email || user.email,
        phoneNumber: doctorData.phoneNumber || user.phoneNumber || "0000000000",
        specialty: formData.specialty,
        consultationFee: Number(formData.consultationFee),
        hospital: formData.hospital,
        bio: formData.bio,
        qualification: formData.qualification,
        experienceYears: Number(formData.experienceYears),
        licenseNumber: formData.licenseNumber
      }
    }, {
      onSuccess: () => {
        toast.success("Profile Updated", { description: "Your doctor details have been saved successfully!" });
      },
      onError: () => {
        toast.error("Update Failed", { description: "We couldn't save your profile details." });
      }
    });
  };

  const handleCopyId = () => {
    if (user?.userId) {
      navigator.clipboard.writeText(user.userId);
      toast("User ID Copied", { description: "Copied your ID to clipboard." });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-end bg-gradient-to-r from-blue-700 to-indigo-800 p-8 rounded-2xl shadow-lg text-white">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Welcome, Dr. {user?.name}</h1>
          <p className="text-blue-100 text-lg flex items-center gap-2">
            <Stethoscope className="w-5 h-5"/>
            {doctorData.specialty ? doctorData.specialty : "General Practitioner"}
          </p>
        </div>
        <div className="hidden sm:block">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 flex flex-col items-end">
            <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">Doctor ID</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm">{user?.userId.substring(0,8)}...</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={handleCopyId}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isProfileIncomplete && (
        <Card className="border-blue-200 shadow-md bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Settings className="w-5 h-5"/> Complete Your Professional Profile
            </CardTitle>
            <CardDescription className="text-blue-700">
              You are officially verified! Please finalize your consultation details to start receiving patients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty *</Label>
                  <Input id="specialty" value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} required placeholder="e.g. Cardiology" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee">Consultation Fee ($) *</Label>
                  <Input id="fee" type="number" min="0" value={formData.consultationFee} onChange={(e) => setFormData({...formData, consultationFee: Number(e.target.value)})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital">Primary Hospital / Clinic</Label>
                  <Input id="hospital" value={formData.hospital} onChange={(e) => setFormData({...formData, hospital: e.target.value})} placeholder="e.g. City General Hospital" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License Number</Label>
                  <Input id="license" value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} placeholder="LIC-123456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Input id="qualifications" value={formData.qualification} onChange={(e) => setFormData({...formData, qualification: e.target.value})} placeholder="e.g. MD, MBBS" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input id="experience" type="number" value={formData.experienceYears} onChange={(e) => setFormData({...formData, experienceYears: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Input id="bio" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} placeholder="Brief description of your expertise..." />
              </div>
              <div className="flex justify-end pt-2">
                 <Button type="submit" disabled={updateDoctorMutation.isPending} className="px-8 shadow-md">
                   {updateDoctorMutation.isPending ? "Saving..." : "Save Profile Details"}
                 </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs Area - Accessible once they are verified (doctorData exists) */}
      <div className="mt-8">
         <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-muted/50 h-14 p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="patients" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">My Patients</TabsTrigger>
              <TabsTrigger value="appointments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Appointments</TabsTrigger>
                <TabsTrigger value="availability" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Availability</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Settings</TabsTrigger>
              </TabsList>
            <TabsContent value="overview" className="mt-6 animate-in slide-in-from-bottom-2">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Dashboard Stat Cards */}
                 <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
                      <Users className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">247</div>
                      <p className="text-xs text-green-500 font-medium flex items-center mt-1">
                        +12% from last month
                      </p>
                    </CardContent>
                 </Card>
                 <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Appointments</CardTitle>
                      <Calendar className="w-4 h-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">8</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Scheduled for today
                      </p>
                    </CardContent>
                 </Card>
                 <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reports</CardTitle>
                      <FileText className="w-4 h-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">3</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Requires your attention
                      </p>
                    </CardContent>
                 </Card>
               </div>

               {/* Today's Appointments */}
               <div className="mt-6">
                 <Card className="hover:shadow-md transition-shadow">
                   <CardHeader className="flex flex-row items-center justify-between pb-3">
                     <CardTitle className="text-base font-semibold flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-indigo-500" />
                       Today&apos;s Appointments
                     </CardTitle>
                     <span className="text-xs text-muted-foreground">Apr 17, 2026</span>
                   </CardHeader>
                   <CardContent className="space-y-2">
                     {mockTodaysAppointments.map((appt) => (
                       <div
                         key={appt.id}
                         className="flex items-center justify-between p-3 rounded-xl border bg-slate-50/50 hover:bg-slate-50 transition-colors"
                       >
                         <div className="flex items-center gap-3">
                           <div className="text-center min-w-[64px]">
                             <p className="text-xs font-bold text-blue-700 font-mono">{appt.time}</p>
                           </div>
                           <div>
                             <p className="text-sm font-semibold text-gray-800">{appt.patient}</p>
                             <p className="text-xs text-muted-foreground">{appt.reason}</p>
                           </div>
                         </div>
                         <span
                           className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                             appt.status === "completed"
                               ? "bg-green-100 text-green-700"
                               : "bg-blue-100 text-blue-700"
                           }`}
                         >
                           {appt.status === "completed" ? "Done" : "Upcoming"}
                         </span>
                       </div>
                     ))}
                   </CardContent>
                 </Card>
               </div>

               {/* Recent Patients */}
               <div className="mt-6">
                 <Card className="hover:shadow-md transition-shadow">
                   <CardHeader className="pb-3">
                     <CardTitle className="text-base font-semibold flex items-center gap-2">
                       <Users className="w-4 h-4 text-blue-500" />
                       Recent Patients
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="overflow-x-auto">
                       <table className="w-full text-sm">
                         <thead>
                           <tr className="border-b">
                             <th className="text-left pb-3 font-medium text-muted-foreground">Patient</th>
                             <th className="text-left pb-3 font-medium text-muted-foreground">Age</th>
                             <th className="text-left pb-3 font-medium text-muted-foreground">Last Visit</th>
                             <th className="text-left pb-3 font-medium text-muted-foreground">Diagnosis</th>
                             <th className="text-left pb-3 font-medium text-muted-foreground">Status</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-border/40">
                           {mockRecentPatients.map((p) => (
                             <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                               <td className="py-2.5 font-medium text-gray-800">{p.name}</td>
                               <td className="py-2.5 text-muted-foreground">{p.age}</td>
                               <td className="py-2.5 text-muted-foreground">{p.lastVisit}</td>
                               <td className="py-2.5 text-gray-700">{p.diagnosis}</td>
                               <td className="py-2.5">
                                 <span
                                   className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                     p.status === "Active"
                                       ? "bg-green-100 text-green-700"
                                       : "bg-gray-100 text-gray-600"
                                   }`}
                                 >
                                   {p.status}
                                 </span>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   </CardContent>
                 </Card>
               </div>
            </TabsContent>
            
            <TabsContent value="patients" className="mt-6">
               <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" /> Patient Roster
                    </CardTitle>
                    <CardDescription>
                      Fetching patient records linked to your verified ID.
                    </CardDescription>
                 </CardHeader>
                 <CardContent>
                    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-xl bg-slate-50/50">
                       <HeartPulse className="w-12 h-12 mb-4 text-red-300" />
                       <h3 className="text-lg font-medium text-slate-800">Your Patient List</h3>
                       <p className="text-sm text-center max-w-sm mt-2">
                         Patients are fetched directly securely using your verified Doctor ID.
                       </p>
                       <Button variant="outline" className="mt-6 gap-2">
                          View Patient Directory <ChevronRight className="w-4 h-4"/>
                       </Button>
                    </div>
                 </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="appointments" className="mt-6">
               <Card>
                 <CardHeader>
                    <CardTitle>Schedule</CardTitle>
                    <CardDescription>Manage your daily appointments and availability.</CardDescription>
                 </CardHeader>
                 <CardContent className="h-[300px] flex items-center justify-center border rounded-lg bg-slate-50/50">
                    <p className="text-muted-foreground">Select a date to view appointments.</p>
                 </CardContent>
               </Card>
            </TabsContent>
              <TabsContent value="availability" className="mt-6">
                 <DoctorAvailability doctorId={user?.userId || ""} />
              </TabsContent>
            <TabsContent value="settings" className="mt-6">
               <Card>
                 <CardHeader>
                    <CardTitle>Profile Configuration</CardTitle>
                    <CardDescription>Update your consultation fees and specialties.</CardDescription>
                 </CardHeader>
                 <CardContent>
                   {!isProfileIncomplete ? (
                     <form onSubmit={handleUpdateProfile} className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                           <Label htmlFor="settings-specialty">Specialty</Label>
                           <Input id="settings-specialty" value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} required />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="settings-fee">Consultation Fee ($)</Label>
                           <Input id="settings-fee" type="number" min="0" value={formData.consultationFee} onChange={(e) => setFormData({...formData, consultationFee: Number(e.target.value)})} required />
                         </div>
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="settings-bio">Professional Bio</Label>
                         <Input id="settings-bio" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
                       </div>
                       <div className="flex justify-end pt-2 pb-4">
                          <Button type="submit" disabled={updateDoctorMutation.isPending}>
                            {updateDoctorMutation.isPending ? "Updating..." : "Update Settings"}
                          </Button>
                       </div>
                     </form>
                   ) : (
                     <div className="text-muted-foreground italic">Please fill your details in the section above first.</div>
                   )}
                 </CardContent>
               </Card>
            </TabsContent>
         </Tabs>
      </div>

    </div>
  );
}

