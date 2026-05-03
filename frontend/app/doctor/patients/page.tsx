"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  User,
  FileBox,
  Pill,
  ChevronDown,
  ChevronUp,
  Download,
  Phone,
  MapPin,
  AlertCircle,
  ClipboardList,
  FileText,
  CalendarDays,
  HeartPulse,
  Ruler,
  Weight,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { 
  useGetMyDoctorProfile, 
  fetchDoctorPatientProfile, 
  fetchDoctorPatientReports, 
  fetchPrescriptionsByPatient, 
  type Prescription 
} from "@/api/doctorApi";
import { useGetAppointmentsByDoctor, type Appointment } from "@/api/appointmentApi";
import { DOCTOR_ENDPOINTS } from "@/api/utils/endpoints";

interface PatientAppointmentCase {
  patientId: string;
  patientUserId: string;
  patientName: string;
  appointmentId: string;
  appointmentDate: string;
  timeSlot: string;
  reasonForVisit?: string;
  status: "CONFIRMED" | "COMPLETED";
  doctorNotes?: string;
}

interface PatientSummary {
  userId?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  address?: string;
  allergies?: string;
}

interface PatientReport {
  id: number;
  reportName: string;
  reportType: string;
  createdAt: string;
}

function appointmentTimestamp(appointment: Appointment) {
  const startTime = appointment.timeSlot?.split("-")?.[0] || "00:00";
  return new Date(`${appointment.appointmentDate}T${startTime}:00`).getTime();
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function PrescriptionItem({ prescription }: { prescription: Prescription }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-card transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/10 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">
              Issued: {formatDate(prescription.issuedAt)}
            </span>
            <div className="md:hidden">
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>
          {prescription.diagnosis && (
             <p className="text-sm text-foreground/80">Diagnosis: {prescription.diagnosis}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[10px]">
               {prescription.medicines.length} Medicine{prescription.medicines.length !== 1 && 's'}
            </Badge>
          </div>
        </div>
        <div className="hidden md:block">
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="p-4 bg-card border-t border-border/50 space-y-4">
          {prescription.notes && (
            <div className="flex items-start gap-1.5 text-sm text-muted-foreground bg-muted/20 p-2.5 rounded-md border border-border/40">
               <FileText className="w-4 h-4 mt-0.5 shrink-0" />
               <span>{prescription.notes}</span>
            </div>
          )}
          <div className="space-y-3">
             {prescription.medicines.map((med, i) => (
                <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm p-3 rounded-md bg-muted/20 border border-border/30">
                  <div className="col-span-2 md:col-span-1">
                    <span className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Medicine</span>
                    <span className="font-medium">{med.name}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Dosage</span>
                    <span>{med.dosage}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Frequency</span>
                    <span>{med.frequency}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Duration</span>
                    <span>{med.duration}</span>
                  </div>
                  <div className="col-span-2 md:col-span-5 pt-1 mt-1 border-t border-border/20">
                    <span className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Instructions</span>
                    <span className="text-muted-foreground italic text-xs">
                      {med.instructions || "None"}
                    </span>
                  </div>
                </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PatientsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientUserId") || searchParams.get("patientId") || "";

  const { data: doctor } = useGetMyDoctorProfile();
  const { data: doctorAppointments = [], isLoading: appointmentsLoading } = useGetAppointmentsByDoctor(doctor?.id || "");

  const [searchInput, setSearchInput] = useState(initialPatientId);
  const [activePatientId, setActivePatientId] = useState(initialPatientId);

  const [patientSummaryById, setPatientSummaryById] = useState<Record<string, PatientSummary>>({});
  const [patientSummaryLoading, setPatientSummaryLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<PatientSummary | null>(null);
  const [profileError, setProfileError] = useState(false);
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [reportsError, setReportsError] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [prescriptionsError, setPrescriptionsError] = useState(false);

  const patientCases = useMemo<PatientAppointmentCase[]>(() => {
    const relevantAppointments = doctorAppointments
      .filter((appointment) => appointment.status === "CONFIRMED" || appointment.status === "COMPLETED")
      .sort((a, b) => appointmentTimestamp(b) - appointmentTimestamp(a));

    const latestAppointmentByPatient = new Map<string, Appointment>();
    for (const appointment of relevantAppointments) {
      const patientUserId = appointment.patientUserId?.trim() || appointment.patientId;
      if (!latestAppointmentByPatient.has(patientUserId)) {
        latestAppointmentByPatient.set(patientUserId, appointment);
      }
    }

    return Array.from(latestAppointmentByPatient.values())
      .sort((a, b) => appointmentTimestamp(b) - appointmentTimestamp(a))
      .map((appointment) => ({
        patientId: appointment.patientId,
        patientUserId: appointment.patientUserId?.trim() || appointment.patientId,
        patientName: appointment.patientName?.trim() || "Unknown Patient",
        appointmentId: appointment.id,
        appointmentDate: appointment.appointmentDate,
        timeSlot: appointment.timeSlot,
        reasonForVisit: appointment.reasonForVisit,
        status: appointment.status as "CONFIRMED" | "COMPLETED",
        doctorNotes: appointment.doctorNotes,
      }));
  }, [doctorAppointments]);

  const activePatientCase = useMemo(
    () => patientCases.find((patientCase) => patientCase.patientUserId === activePatientId) || null,
    [patientCases, activePatientId]
  );

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const query = searchInput.trim();
    if (!query) return;

    // Try to resolve by patient name from the current appointment-derived list (case-insensitive substring)
    const match = patientCases.find((pc) => pc.patientName.toLowerCase().includes(query.toLowerCase()));
    if (match) {
      setActivePatientId(match.patientUserId);
      router.push(`/doctor/patients?patientUserId=${match.patientUserId}`);
      return;
    }

    // Fallback: if the input looks like an ID (contains numbers or dashes), try it directly
    if (/\d|-/g.test(query)) {
      setActivePatientId(query);
      router.push(`/doctor/patients?patientUserId=${query}`);
      return;
    }

    // No match found — use the raw query as patientId as a last resort
    setActivePatientId(query);
    router.push(`/doctor/patients?patientUserId=${query}`);
  };

  const handleSelectPatient = (patientId: string) => {
    setSearchInput(patientId);
    setActivePatientId(patientId);
    router.push(`/doctor/patients?patientUserId=${patientId}`);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchPatientSummaries = async () => {
      if (!doctor?.id || patientCases.length === 0) {
        if (isMounted) {
          setPatientSummaryById({});
          setPatientSummaryLoading(false);
        }
        return;
      }

      setPatientSummaryLoading(true);

      const results = await Promise.allSettled(
        patientCases.map(async (patientCase) => {
          const response = await fetchDoctorPatientProfile(doctor.id, patientCase.patientId);
          return [patientCase.patientId, response.data] as const;
        })
      );

      if (!isMounted) return;

      const nextSummaryById: Record<string, PatientSummary> = {};
      for (const result of results) {
        if (result.status === "fulfilled") {
          const [patientId, profileData] = result.value;
          nextSummaryById[patientId] = profileData;
        }
      }

      setPatientSummaryById(nextSummaryById);
      setPatientSummaryLoading(false);
    };

    void fetchPatientSummaries();

    return () => {
      isMounted = false;
    };
  }, [doctor?.id, patientCases]);

  useEffect(() => {
    if (!doctor?.id || !activePatientId || !activePatientCase) return;

    let isMounted = true;

    const fetchAll = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        fetchDoctorPatientProfile(doctor.id, activePatientCase.patientId),
        fetchDoctorPatientReports(doctor.id, activePatientCase.patientId),
        fetchPrescriptionsByPatient(activePatientCase.patientUserId),
      ]);

      if (!isMounted) return;

      // 1. Profile
      if (results[0].status === "fulfilled") {
        setProfile(results[0].value.data);
        setProfileError(false);
      } else {
        setProfileError(true);
      }

      // 2. Reports
      if (results[1].status === "fulfilled") {
        setReports(results[1].value.data);
        setReportsError(false);
      } else {
        setReportsError(true);
      }

      // 3. Prescriptions
      if (results[2].status === "fulfilled") {
        setPrescriptions(results[2].value.data);
        setPrescriptionsError(false);
      } else {
        setPrescriptionsError(true);
      }

      setLoading(false);
    };

    fetchAll();

    return () => {
      isMounted = false;
    };
  }, [doctor?.id, activePatientCase, activePatientId]);

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Patient Records</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Confirmed and completed patients are automatically listed for quick consultation prep
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" /> Confirmed & Completed Patients
        </h2>

        {appointmentsLoading || patientSummaryLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Skeleton className="h-36 w-full rounded-xl" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </div>
        ) : patientCases.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-border/80 bg-muted/10 text-center space-y-2">
            <User className="w-8 h-8 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground">
              No confirmed or completed appointments found for your account yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientCases.map((patientCase) => {
              const patientSummary = patientSummaryById[patientCase.patientId];
              const isActive = patientCase.patientUserId === activePatientId;

              return (
                <button
                  key={patientCase.appointmentId}
                  type="button"
                  onClick={() => handleSelectPatient(patientCase.patientUserId)}
                  className={`text-left rounded-xl border p-4 transition-colors ${
                    isActive
                      ? "border-primary/60 bg-primary/5"
                      : "border-border/60 bg-card hover:bg-muted/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-base">{patientCase.patientName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Patient User ID: {patientCase.patientUserId}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={patientCase.status === "COMPLETED"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-blue-100 text-blue-800 border-blue-200"
                      }
                    >
                      {patientCase.status}
                    </Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5"><HeartPulse className="w-3.5 h-3.5" /> {patientSummary?.bloodGroup || "Blood Group: N/A"}</p>
                    <p className="flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5" /> {patientSummary?.height ? `${patientSummary.height} cm` : "Height: -"}</p>
                    <p className="flex items-center gap-1.5"><Weight className="w-3.5 h-3.5" /> {patientSummary?.weight ? `${patientSummary.weight} kg` : "Weight: -"}</p>
                    <p className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {formatDate(patientCase.appointmentDate)}</p>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Reason For Appointment</p>
                    <p className="text-sm font-medium text-foreground/90">
                      {patientCase.reasonForVisit || "No reason provided"}
                    </p>
                  </div>

                  {patientCase.status === "COMPLETED" && patientCase.doctorNotes && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Doctor Notes</p>
                      <p className="text-sm text-foreground/80 line-clamp-2">
                        {patientCase.doctorNotes}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter Patient ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={!searchInput.trim()}>
          Open Patient
        </Button>
      </form>

      {!activePatientId && !loading && !appointmentsLoading && (
        <div className="p-8 mt-4 rounded-xl border border-dashed border-border/80 bg-muted/10 text-center space-y-2">
           <User className="w-10 h-10 text-muted-foreground/40 mx-auto" />
           <p className="text-sm text-muted-foreground">Select a patient above or enter a Patient ID to view records.</p>
        </div>
      )}

      {loading && activePatientId && (
        <div className="space-y-6 mt-8">
           <Skeleton className="h-52 w-full rounded-xl" />
           <Skeleton className="h-64 w-full rounded-xl" />
           <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      )}

      {!loading && activePatientId && (
        <div className="space-y-6 mt-8">

          {activePatientCase && (
            <Card className="border-border/60 bg-muted/10">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Consultation Context</p>
                    <p className="text-base font-semibold mt-0.5">{activePatientCase.patientName}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={activePatientCase.status === "COMPLETED"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                    }
                  >
                    {activePatientCase.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1.5">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Appointment Time</p>
                    <p className="font-medium">{formatDate(activePatientCase.appointmentDate)} • {activePatientCase.timeSlot}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Reason For Appointment</p>
                    <p className="font-medium">{activePatientCase.reasonForVisit || "No reason provided"}</p>
                  </div>
                </div>

                {activePatientCase.status === "COMPLETED" && (
                  <div className="space-y-1.5">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Doctor Notes</p>
                    <p className="text-sm font-medium text-foreground/90">
                      {activePatientCase.doctorNotes || "No notes added yet."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* --- SECTION 1: Patient Profile --- */}
          <section>
             <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Patient Profile
             </h2>
             {profileError ? (
                <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive flex items-center gap-3">
                   <AlertCircle className="w-5 h-5 shrink-0" />
                   <p className="text-sm">Patient profile temporarily unavailable.</p>
                </div>
             ) : profile ? (
                <Card className="border-border/60">
                  <CardContent className="p-6">
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                           <span className="text-xs text-muted-foreground uppercase tracking-wider">User ID</span>
                           <p className="font-medium">{profile.userId || "N/A"}</p>
                        </div>
                        <div className="space-y-1.5">
                           <span className="text-xs text-muted-foreground uppercase tracking-wider">Gender</span>
                           <p className="font-medium capitalize">{profile.gender || "N/A"}</p>
                        </div>
                        <div className="space-y-1.5">
                           <span className="text-xs text-muted-foreground uppercase tracking-wider">Date of Birth</span>
                           <p className="font-medium">{profile.dateOfBirth ? formatDate(profile.dateOfBirth) : "N/A"}</p>
                        </div>
                        <div className="space-y-1.5">
                           <span className="text-xs text-muted-foreground uppercase tracking-wider">Phone</span>
                           <p className="font-medium flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                              {profile.phone || "N/A"}
                           </p>
                        </div>
                        <div className="space-y-1.5">
                           <span className="text-xs text-muted-foreground uppercase tracking-wider">Blood Group</span>
                           <p className="font-medium text-destructive">{profile.bloodGroup || "N/A"}</p>
                        </div>
                        <div className="space-y-1.5">
                           <span className="text-xs text-muted-foreground uppercase tracking-wider">Height & Weight</span>
                           <p className="font-medium">
                              {profile.height ? `${profile.height} cm` : "-"} / {profile.weight ? `${profile.weight} kg` : "-"}
                           </p>
                        </div>
                        <div className="space-y-1.5 md:col-span-3">
                           <span className="text-xs text-muted-foreground uppercase tracking-wider">Address</span>
                           <p className="font-medium flex items-start gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                              {profile.address || "N/A"}
                           </p>
                        </div>
                        {profile.allergies && (
                           <div className="space-y-1.5 md:col-span-3">
                              <span className="text-xs text-muted-foreground uppercase tracking-wider">Allergies</span>
                              <div className="p-3 bg-muted/30 rounded-md border border-border/50">
                                 <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
                                     {profile.allergies}
                                 </p>
                              </div>
                           </div>
                        )}
                     </div>
                  </CardContent>
                </Card>
             ) : (
                <div className="p-6 rounded-xl border border-border/60 bg-card text-muted-foreground text-sm text-center">
                   No profile information found.
                </div>
             )}
          </section>

          {/* --- SECTION 2: Medical Reports --- */}
          <section>
             <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
                <FileBox className="w-5 h-5 text-primary" /> Uploaded Medical Reports
             </h2>
             {reportsError ? (
                <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive flex items-center gap-3">
                   <AlertCircle className="w-5 h-5 shrink-0" />
                   <p className="text-sm">Uploaded medical reports temporarily unavailable.</p>
                </div>
             ) : reports.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-border/80 bg-muted/10 text-center space-y-2">
                   <FileBox className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                   <p className="text-sm text-muted-foreground">This patient has not uploaded any reports yet.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {reports.map((report) => (
                      <Card key={report.id} className="border-border/60">
                         <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="space-y-1 min-w-0">
                               <p className="text-sm font-medium truncate" title={report.reportName}>
                                  {report.reportName}
                               </p>
                               <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="secondary" className="text-[10px] uppercase font-normal tracking-wide">
                                     {report.reportType}
                                  </Badge>
                                  <span>{formatDate(report.createdAt)}</span>
                               </div>
                            </div>
                            <Button 
                               variant="outline" 
                               size="sm" 
                               className="shrink-0 gap-1.5"
                               asChild
                            >
                               <a href={DOCTOR_ENDPOINTS.GET_PATIENT_REPORT_FILE(doctor!.id, activePatientId, report.id)} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-3.5 h-3.5" />
                                  View
                               </a>
                            </Button>
                         </CardContent>
                      </Card>
                   ))}
                </div>
             )}
          </section>

          {/* --- SECTION 3: Prescription History --- */}
          <section>
             <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" /> Prescription History
             </h2>
             {prescriptionsError ? (
                <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive flex items-center gap-3">
                   <AlertCircle className="w-5 h-5 shrink-0" />
                   <p className="text-sm">Prescription history temporarily unavailable.</p>
                </div>
             ) : prescriptions.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-border/80 bg-muted/10 text-center space-y-2">
                   <ClipboardList className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                   <p className="text-sm text-muted-foreground">No prescriptions found for this patient.</p>
                </div>
             ) : (
               <div className="space-y-3">
                 {[...prescriptions]
                    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
                    .map((rx) => (
                       <PrescriptionItem key={rx.id} prescription={rx} />
                 ))}
               </div>
             )}
          </section>

        </div>
      )}
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<div className="p-6"><Skeleton className="h-8 w-1/3 mb-4" /><Skeleton className="h-10 w-full max-w-sm" /></div>}>
      <PatientsContent />
    </Suspense>
  );
}
