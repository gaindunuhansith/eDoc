"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  CalendarDays,
  Activity,
  FileText,
  FileBox,
  Pill,
  ChevronDown,
  ChevronUp,
  Download,
  Phone,
  MapPin,
  AlertCircle,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetMyDoctorProfile, fetchDoctorPatientProfile, fetchDoctorPatientReports, fetchPrescriptionsByPatient, type Prescription } from "@/api/doctorApi";
import { getReportDownloadUrl } from "@/api/patientApi"; 

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

export default function PatientRecordsPage() {
  const params = useParams();
  const router = useRouter();
  const patientIdStr = params?.patientId as string;

  const { data: doctor } = useGetMyDoctorProfile();

  const [loading, setLoading] = useState(true);

  // States for each section
  const [profile, setProfile] = useState<any>(null);
  const [profileError, setProfileError] = useState(false);

  const [reports, setReports] = useState<any[]>([]);
  const [reportsError, setReportsError] = useState(false);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [prescriptionsError, setPrescriptionsError] = useState(false);

  useEffect(() => {
    if (!doctor?.id || !patientIdStr) return;

    let isMounted = true;
    setLoading(true);

    const fetchAll = async () => {
      const results = await Promise.allSettled([
        fetchDoctorPatientProfile(doctor.id, patientIdStr),
        fetchDoctorPatientReports(doctor.id, patientIdStr),
        fetchPrescriptionsByPatient(patientIdStr),
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
  }, [doctor?.id, patientIdStr]);

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Patient Records</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Viewing records for Patient #{patientIdStr}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
           <Skeleton className="h-[200px] w-full rounded-xl" />
           <Skeleton className="h-[250px] w-full rounded-xl" />
           <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          
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
                               <a href={getReportDownloadUrl(report.id)} target="_blank" rel="noopener noreferrer">
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