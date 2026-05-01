"use client";

import { useState, useMemo } from "react";
import {
  CalendarDays,
  ClipboardList,
  Search,
  Pill,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useGetMyDoctorProfile,
  useGetPrescriptionsByDoctor,
  type Prescription,
} from "@/api/doctorApi";

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// â”€â”€â”€ Prescription Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PrescriptionCard({ prescription }: { prescription: Prescription }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-border/60 hover:border-border/80 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">
                Patient #{prescription.patientId}
              </span>
            </div>
            {prescription.diagnosis && (
              <p className="text-sm font-semibold text-foreground/90">
                Diagnosis: {prescription.diagnosis}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant="outline" className="text-xs">
              Issued: {formatDate(prescription.issuedAt)}
            </Badge>
            {prescription.validUntil && (
              <Badge variant="secondary" className="text-[10px]">
                Valid till: {formatDate(prescription.validUntil)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {prescription.notes && (
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground bg-muted/20 p-2.5 rounded-md border border-border/40">
            <FileText className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{prescription.notes}</span>
          </div>
        )}
        
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between p-3 bg-muted/10 hover:bg-muted/30 transition-colors text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-primary/70" />
              Medicines ({prescription.medicines.length})
            </span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expanded && (
            <div className="p-3 bg-card border-t border-border/50 space-y-3">
              {prescription.medicines.map((med, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm p-3 rounded-md bg-muted/20 border border-border/30"
                >
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function PrescriptionsHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: doctor, isLoading: doctorLoading } = useGetMyDoctorProfile();
  const { data: prescriptions = [], isLoading: rxLoading } =
    useGetPrescriptionsByDoctor(doctor?.id ?? "");

  const isLoading = doctorLoading || (!!doctor?.id && rxLoading);

  const filteredPrescriptions = useMemo(() => {
    if (!searchQuery.trim()) return prescriptions;
    const lowerQuery = searchQuery.toLowerCase();
    return prescriptions.filter((rx) =>
      rx.patientId.toLowerCase().includes(lowerQuery)
    );
  }, [prescriptions, searchQuery]);

  const sortedPrescriptions = useMemo(() => {
    return [...filteredPrescriptions].sort(
      (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    );
  }, [filteredPrescriptions]);

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Prescription History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View all prescriptions you have issued to your patients
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by Patient ID..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4 bg-muted/10 rounded-xl border border-dashed border-border/80">
          <div className="p-4 bg-muted/30 rounded-full">
            <ClipboardList className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium">No Prescriptions Found</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              You haven't issued any prescriptions yet. When you issue a prescription after an appointment, it will appear here.
            </p>
          </div>
        </div>
      ) : sortedPrescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <p className="text-muted-foreground">No prescriptions match your search.</p>
          <Button variant="link" onClick={() => setSearchQuery("")}>
            Clear search
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground pb-2 border-b">
            <span>Showing {sortedPrescriptions.length} result{sortedPrescriptions.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {sortedPrescriptions.map((rx) => (
              <PrescriptionCard key={rx.id} prescription={rx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
