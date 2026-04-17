"use client";

import { useState } from "react";
import {
  Pill,
  ChevronDown,
  ChevronUp,
  Calendar,
  ClipboardList,
  Stethoscope,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetMyPrescriptions, type Prescription } from "@/api/patientApi";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isExpired(validUntil?: string) {
  if (!validUntil) return false;
  return new Date(validUntil) < new Date();
}

// ─── Medicine Table ───────────────────────────────────────────────────────────

function MedicineList({ medicines }: { medicines: Prescription["medicines"] }) {
  if (!medicines || medicines.length === 0) {
    return <p className="text-sm text-gray-400 italic">No medicines listed.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Medicine
            </th>
            <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Dosage
            </th>
            <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Frequency
            </th>
            <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Duration
            </th>
            <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Instructions
            </th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((m, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0">
              <td className="py-2 pr-4 font-medium text-gray-900">{m.name || "—"}</td>
              <td className="py-2 pr-4 text-gray-600">{m.dosage || "—"}</td>
              <td className="py-2 pr-4 text-gray-600">{m.frequency || "—"}</td>
              <td className="py-2 pr-4 text-gray-600">{m.duration || "—"}</td>
              <td className="py-2 text-gray-600">{m.instructions || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Prescription Card ────────────────────────────────────────────────────────

function PrescriptionCard({ rx }: { rx: Prescription }) {
  const [expanded, setExpanded] = useState(true);
  const expired = isExpired(rx.validUntil);

  return (
    <Card className="bg-white border border-gray-200 shadow-none">
      {/* Header row */}
      <CardHeader
        className="pb-3 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-blue-50">
              <Pill className="h-4 w-4 text-blue-600" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">
                  {rx.diagnosis || "Prescription"}
                </span>
                {expired ? (
                  <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                    Expired
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500 border-gray-200">
                  {(rx.medicines?.length ?? 0)} medicine{(rx.medicines?.length ?? 0) !== 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Issued: {formatDate(rx.issuedAt)}
                </span>
                {rx.validUntil && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Valid until: {formatDate(rx.validUntil)}
                  </span>
                )}
                {rx.doctorId && (
                  <span className="flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" />
                    Dr. ID: {rx.doctorId}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 shrink-0 mt-1">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </CardHeader>

      {/* Expanded body */}
      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {rx.notes && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <ClipboardList className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">{rx.notes}</p>
            </div>
          )}
          <MedicineList medicines={rx.medicines} />
        </CardContent>
      )}
    </Card>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrescriptionsPage() {
  const { data: prescriptions = [], isLoading } = useGetMyPrescriptions();

  const active = prescriptions.filter((rx) => !isExpired(rx.validUntil));
  const expired = prescriptions.filter((rx) => isExpired(rx.validUntil));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Prescriptions</h1>
        <p className="text-gray-500 mt-1 text-sm">
          View all prescriptions issued by your doctors
        </p>
      </div>

      {/* Stats row */}
      {!isLoading && prescriptions.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-green-800">
              {active.length} Active
            </span>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-red-700">
              {expired.length} Expired
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : prescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Pill className="h-10 w-10 mb-3 opacity-40" />
          <p className="font-medium">No prescriptions found</p>
          <p className="text-sm mt-1">
            Prescriptions issued by your doctors will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <PrescriptionCard key={rx.id} rx={rx} />
          ))}
        </div>
      )}
    </div>
  );
}

