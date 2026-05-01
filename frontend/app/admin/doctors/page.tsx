"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Search, ShieldAlert, ShieldCheck, CheckCircle2, User, 
  Trash2, Eye, Building2, Stethoscope, Phone, FileText, Pill, CalendarDays
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { 
  useGetAdminAllDoctors, 
  useGetDoctorById,
  useToggleDoctorAvailability,
  useDeleteDoctor,
  useGetPrescriptionsByDoctor,
  type Doctor
} from "@/api/doctorApi";
import { useGetAppointmentsByDoctor } from "@/api/appointmentApi";

type FilterTab = "ALL" | "VERIFIED" | "UNVERIFIED";

export default function AdminDoctorsPage() {
  const [tab, setTab] = useState<FilterTab>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  // View Modal state
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  // Delete Modal state
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);
  const [deleteStage, setDeleteStage] = useState<1 | 2>(1);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const { data: doctors = [], isLoading: isDoctorsLoading } = useGetAdminAllDoctors();
  const toggleMutation = useToggleDoctorAvailability();
  const deleteMutation = useDeleteDoctor();

  // Client-side filtering
  const filteredDoctors = useMemo(() => {
    let result = doctors;
    if (tab === "VERIFIED") result = result.filter(d => d.isVerified);
    if (tab === "UNVERIFIED") result = result.filter(d => !d.isVerified);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        d =>
          (d.firstName + " " + d.lastName).toLowerCase().includes(q) ||
          d.specialty?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [doctors, tab, searchTerm]);

  const paginatedDoctors = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredDoctors.slice(start, start + rowsPerPage);
  }, [filteredDoctors, page]);

  const totalPages = Math.ceil(filteredDoctors.length / rowsPerPage);

  const prevPage = () => setPage(p => Math.max(1, p - 1));
  const nextPage = () => setPage(p => Math.min(totalPages, p + 1));

  // Handlers
  const handleToggleAvailability = (id: string, currentlyAvailable: boolean) => {
    toggleMutation.mutate(
      id,
      {
        onSuccess: (data: any) => {
          toast.success(`Doctor marked as ${!currentlyAvailable ? "Available" : "Unavailable"}`);
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || "Failed to toggle availability.";
          toast.error(msg);
        }
      }
    );
  };

  const startDelete = (doctor: Doctor) => {
    setDeleteTarget(doctor);
    setDeleteStage(1);
    setDeleteConfirmText("");
  };

  const confirmDeleteStage1 = () => setDeleteStage(2);

  const handleDeleteFinalConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`Doctor ${deleteTarget.firstName} ${deleteTarget.lastName} permanently deleted.`);
        setDeleteTarget(null);
        setPage(1);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || "Failed to delete doctor record.";
        toast.error(msg);
      }
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
        <p className="text-gray-500 mt-1">View and manage all registered doctors on the platform.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border">
        <div className="relative w-full md:max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search by name or specialty..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        
        <Tabs value={tab} onValueChange={(v) => { setTab(v as FilterTab); setPage(1); }} className="w-full md:w-auto overflow-x-auto">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="ALL">All ({doctors.length})</TabsTrigger>
            <TabsTrigger value="VERIFIED">Verified</TabsTrigger>
            <TabsTrigger value="UNVERIFIED">Unverified</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="shadow-none border">
        <CardContent className="p-0">
          {isDoctorsLoading ? (
            <div className="p-8 text-center text-gray-500">Loading records...</div>
          ) : paginatedDoctors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No doctors match your filters.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-600">Full Name</TableHead>
                  <TableHead className="font-semibold text-gray-600">Specialty</TableHead>
                  <TableHead className="font-semibold text-gray-600">Hospital</TableHead>
                  <TableHead className="font-semibold text-gray-600">License</TableHead>
                  <TableHead className="font-semibold text-gray-600">Verified</TableHead>
                  <TableHead className="font-semibold text-gray-600">Availability</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDoctors.map(doctor => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium text-gray-900">Dr. {doctor.firstName} {doctor.lastName}</TableCell>
                    <TableCell className="text-gray-600">{doctor.specialty || "—"}</TableCell>
                    <TableCell className="text-gray-600 truncate max-w-[150px]">{doctor.hospital || "—"}</TableCell>
                    <TableCell className="text-gray-500 text-sm font-mono">{doctor.licenseNumber}</TableCell>
                    <TableCell>
                      {doctor.isVerified ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                          <ShieldAlert className="w-3 h-3 mr-1" /> No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {doctor.isAvailable ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                          Offline
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button variant="outline" size="sm" onClick={() => setSelectedDoctorId(doctor.id)}>
                         <Eye className="w-4 h-4 mr-1.5" /> View
                       </Button>
                       <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => startDelete(doctor)}>
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {filteredDoctors.length > 0 && (
          <CardFooter className="py-3 px-4 border-t flex justify-between items-center text-sm text-gray-500">
             <span>Showing {Math.min((page - 1) * rowsPerPage + 1, filteredDoctors.length)} to {Math.min(page * rowsPerPage, filteredDoctors.length)} of {filteredDoctors.length} doctors</span>
             <div className="flex gap-2">
               <Button variant="outline" size="sm" onClick={prevPage} disabled={page === 1}>Previous</Button>
               <Button variant="outline" size="sm" onClick={nextPage} disabled={page === totalPages}>Next</Button>
             </div>
          </CardFooter>
        )}
      </Card>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className={deleteStage === 2 ? "border-red-200" : ""}>
          <DialogHeader>
            <DialogTitle className={deleteStage === 2 ? "text-red-600 flex items-center gap-2" : ""}>
               {deleteStage === 2 && <ShieldAlert className="w-5 h-5" />}
               {deleteStage === 1 ? "Permanent Deletion Warning" : "Final Confirmation"}
            </DialogTitle>
            <DialogDescription className="pt-2 text-gray-600 text-base">
              {deleteStage === 1 ? (
                <>
                  This action will permanently delete <strong>Dr. {deleteTarget?.firstName} {deleteTarget?.lastName}</strong> and completely clear all their associated availability schedules and prescriptions. 
                  <br className="mb-2"/>
                  This action <strong>cannot be undone.</strong>
                </>
              ) : (
                <>
                  To finally authorize the deletion of this doctor account, please type <strong>DELETE</strong> in the input box below.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {deleteStage === 2 && (
             <div className="py-2">
                <Input 
                  value={deleteConfirmText} 
                  onChange={(e) => setDeleteConfirmText(e.target.value)} 
                  placeholder="Type DELETE..." 
                  className="font-mono bg-red-50 focus-visible:ring-red-500 border-red-200 text-red-900"
                />
             </div>
          )}

          <DialogFooter className="mt-4">
             <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>
               Cancel
             </Button>
             {deleteStage === 1 ? (
               <Button variant="destructive" onClick={confirmDeleteStage1}>
                 I understand, proceed
               </Button>
             ) : (
               <Button 
                 variant="destructive" 
                 disabled={deleteConfirmText !== "DELETE" || deleteMutation.isPending}
                 onClick={handleDeleteFinalConfirm}
               >
                 {deleteMutation.isPending ? "Deleting..." : "Permanently Delete"}
               </Button>
             )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detailed View Modal */}
      {selectedDoctorId && (
        <DoctorDetailPanel 
          doctorId={selectedDoctorId} 
          onClose={() => setSelectedDoctorId(null)} 
          onToggleAvailability={handleToggleAvailability}
          isLoadingToggle={toggleMutation.isPending}
        />
      )}
    </div>
  );
}


function DoctorDetailPanel({ 
  doctorId, 
  onClose, 
  onToggleAvailability, 
  isLoadingToggle 
}: { 
  doctorId: string, 
  onClose: () => void, 
  onToggleAvailability: (id: string, isAvail: boolean) => void,
  isLoadingToggle: boolean 
}) {
  const { data: doctor, isLoading: isDoctorLoading } = useGetDoctorById(doctorId);
  const { data: appointments = [], isLoading: isAppointmentsLoading } = useGetAppointmentsByDoctor(doctorId);
  const { data: prescriptions = [], isLoading: isPrescriptionsLoading } = useGetPrescriptionsByDoctor(doctorId);

  return (
    <Dialog open={!!doctorId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gray-50 flex flex-col gap-6">
         <DialogHeader>
            <DialogTitle>Doctor Profile Overview</DialogTitle>
         </DialogHeader>
         
         {isDoctorLoading || !doctor ? (
           <div className="py-20 text-center text-gray-500">Loading details...</div>
         ) : (
           <div className="space-y-6">
              {/* Top Banner profile */}
              <div className="bg-white border rounded-xl p-5 md:p-6 flex flex-col md:flex-row gap-6 relative shadow-sm">
                 <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 mx-auto md:mx-0 border-4 border-white shadow-sm">
                   <User className="w-10 h-10" />
                 </div>
                 <div className="flex-1 text-center md:text-left space-y-1">
                   <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dr. {doctor.firstName} {doctor.lastName}</h2>
                   <p className="text-primary font-medium">{doctor.specialty} • {doctor.experienceYears} Years Exp.</p>
                   <div className="flex flex-wrap gap-3 pt-2 text-sm text-gray-600 justify-center md:justify-start">
                     <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {doctor.hospital || "Independent"}</span>
                     <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> License: {doctor.licenseNumber}</span>
                     <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {doctor.phoneNumber || "—"}</span>
                   </div>
                 </div>

                 <div className="flex flex-col gap-2 shrink-0 md:items-end">
                   {doctor.isVerified ? (
                     <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 px-3 py-1">Verified Active</Badge>
                   ) : (
                     <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 px-3 py-1">Unverified Setup</Badge>
                   )}
                   <Button 
                     variant={doctor.isAvailable ? "outline" : "default"}
                     size="sm"
                     disabled={isLoadingToggle}
                     onClick={() => onToggleAvailability(doctor.id, doctor.isAvailable)}
                     className={`mt-auto ${doctor.isAvailable ? 'text-gray-600' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                   >
                     {isLoadingToggle ? "Updating..." : (doctor.isAvailable ? "Set Unavailable" : "Set Available")}
                   </Button>
                 </div>
              </div>

              {/* Bio & Details */}
              {doctor.bio && (
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Biography</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{doctor.bio}</p>
                </div>
              )}

              {/* Tables for relations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Appointments Summary */}
                <Card className="shadow-none border">
                  <CardHeader className="pb-3 border-b border-gray-50 p-4">
                    <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                      <CalendarDays className="w-4 h-4 text-primary" /> Appointments ({appointments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isAppointmentsLoading ? (
                      <p className="p-4 text-sm text-gray-500">Loading...</p>
                    ) : appointments.length === 0 ? (
                      <p className="p-4 text-sm text-gray-400">No appointments logged yet.</p>
                    ) : (
                      <div className="max-h-[250px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                              <TableHead className="text-xs">Date</TableHead>
                              <TableHead className="text-xs">Type</TableHead>
                              <TableHead className="text-xs text-right">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {appointments.slice(0, 15).map(appt => (
                              <TableRow key={appt.id}>
                                <TableCell className="py-2 text-xs font-medium text-gray-700 whitespace-nowrap">
                                  {format(new Date(appt.appointmentDate), "MMM dd")}
                                </TableCell>
                                <TableCell className="py-2 text-xs text-gray-500">{appt.type}</TableCell>
                                <TableCell className="py-2 text-xs text-right capitalize">{appt.status.toLowerCase()}</TableCell>
                              </TableRow>
                            ))}
                            {appointments.length > 15 && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-xs text-gray-400 bg-gray-50/50 py-2">
                                  + {appointments.length - 15} more
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Prescriptions Summary */}
                <Card className="shadow-none border">
                  <CardHeader className="pb-3 border-b border-gray-50 p-4">
                    <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                      <Pill className="w-4 h-4 text-primary" /> Prescriptions ({prescriptions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isPrescriptionsLoading ? (
                      <p className="p-4 text-sm text-gray-500">Loading...</p>
                    ) : prescriptions.length === 0 ? (
                      <p className="p-4 text-sm text-gray-400">No prescriptions written yet.</p>
                    ) : (
                      <div className="max-h-[250px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                              <TableHead className="text-xs">Date</TableHead>
                              <TableHead className="text-xs">Meds</TableHead>
                              <TableHead className="text-xs text-right">Patient</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {prescriptions.slice(0, 15).map(rx => (
                              <TableRow key={rx.id}>
                                <TableCell className="py-2 text-xs font-medium text-gray-700 whitespace-nowrap">
                                  {format(new Date(rx.issuedAt), "MMM dd")}
                                </TableCell>
                                <TableCell className="py-2 text-xs text-gray-500">{rx.medicines.length} med(s)</TableCell>
                                <TableCell className="py-2 text-xs text-right font-mono truncate max-w-[80px]">ID: {rx.patientId}</TableCell>
                              </TableRow>
                            ))}
                            {prescriptions.length > 15 && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-xs text-gray-400 bg-gray-50/50 py-2">
                                  + {prescriptions.length - 15} more
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>
           </div>
         )}
      </DialogContent>
    </Dialog>
  );
}