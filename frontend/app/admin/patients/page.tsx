"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Search,
  Eye,
  ShieldOff,
  ShieldCheck,
  User,
  CalendarDays,
  Phone,
  MapPin,
  Droplets,
  Activity,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  useGetAdminAllPatients,
  useGetAdminPatientById,
  useAdminUpdatePatientStatus,
  type Patient,
} from "@/api/patientApi";

type FilterTab = "ALL" | "ACTIVE" | "INACTIVE";

export default function AdminPatientsPage() {
  const [tab, setTab] = useState<FilterTab>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  const [viewId, setViewId] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<Patient | null>(null);
  const [willDeactivate, setWillDeactivate] = useState<boolean>(true);
  const [reason, setReason] = useState("");

  const { data: patients = [], isLoading } = useGetAdminAllPatients();
  const statusMutation = useAdminUpdatePatientStatus();

  const filtered = useMemo(() => {
    let list = patients;
    if (tab === "ACTIVE") list = list.filter((p) => !p.deleted);
    if (tab === "INACTIVE") list = list.filter((p) => p.deleted);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          String(p.id).includes(q) ||
          p.nicNumber?.toLowerCase().includes(q) ||
          p.userId.toLowerCase().includes(q) ||
          p.userName?.toLowerCase().includes(q) ||
          p.userEmail?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [patients, tab, searchTerm]);

  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const openStatusDialog = (patient: Patient) => {
    setStatusTarget(patient);
    setWillDeactivate(!patient.deleted);
    setReason("");
  };

  const handleStatusChange = () => {
    if (!statusTarget) return;
    if (willDeactivate && !reason.trim()) {
      toast.error("A deactivation reason is required.");
      return;
    }
    statusMutation.mutate(
      { id: statusTarget.id, payload: { deleted: willDeactivate, reason: reason.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success(
            `Patient ${statusTarget.id.slice(0, 8)}… ${willDeactivate ? "deactivated" : "reactivated"}.`
          );
          setStatusTarget(null);
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message || "Failed to update patient status.";
          toast.error(msg);
        },
      }
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
        <p className="text-gray-500 mt-1">
          View and manage all registered patient profiles on the platform.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border">
        <div className="relative w-full md:max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, NIC, email or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as FilterTab);
            setPage(1);
          }}
          className="w-full md:w-auto overflow-x-auto"
        >
          <TabsList className="bg-gray-100">
            <TabsTrigger value="ALL">All ({patients.length})</TabsTrigger>
            <TabsTrigger value="ACTIVE">
              Active ({patients.filter((p) => !p.deleted).length})
            </TabsTrigger>
            <TabsTrigger value="INACTIVE">
              Inactive ({patients.filter((p) => p.deleted).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <Card className="shadow-none border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 text-center text-gray-500">
              Loading patient records...
            </div>
          ) : paginated.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No patients match your filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-600">
                    ID
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    NIC
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Gender
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Blood Group
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Joined
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-mono text-sm text-gray-700">
                      {patient.id.slice(0, 8)}…
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 max-w-[160px] truncate">
                      {patient.userName ?? (
                        <span className="text-gray-400 font-normal text-xs font-mono">
                          {patient.userId.slice(0, 8)}…
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {patient.nicNumber || "—"}
                    </TableCell>
                    <TableCell className="text-gray-600 capitalize">
                      {patient.gender?.toLowerCase() || "—"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {patient.bloodGroup || "—"}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {patient.createdAt
                        ? format(new Date(patient.createdAt), "dd MMM yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge deleted={patient.deleted} />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewId(patient.id)}
                      >
                        <Eye className="w-4 h-4 mr-1.5" /> View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={
                          !patient.deleted
                            ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                            : "text-green-600 hover:text-green-800 hover:bg-green-50"
                        }
                        onClick={() => openStatusDialog(patient)}
                      >
                        {!patient.deleted ? (
                          <ShieldOff className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {filtered.length > 0 && (
          <CardFooter className="py-3 px-4 border-t flex justify-between items-center text-sm text-gray-500">
            <span>
              Showing{" "}
              {Math.min((page - 1) * rowsPerPage + 1, filtered.length)} to{" "}
              {Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}{" "}
              patients
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Detail Dialog */}
      {viewId !== null && (
        <PatientDetailDialog
          id={viewId}
          onClose={() => setViewId(null)}
          onChangeStatus={(p) => {
            setViewId(null);
            openStatusDialog(p);
          }}
        />
      )}

      {/* Status Change Dialog */}
      <Dialog open={!!statusTarget} onOpenChange={(v) => !v && setStatusTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {willDeactivate
                ? "Deactivate Patient"
                : "Reactivate Patient"}
            </DialogTitle>
            <DialogDescription>
              {willDeactivate ? (
                <>
                  You are about to deactivate{" "}
                  <strong>Patient {statusTarget?.id.slice(0, 8)}…</strong>. A reason is
                  required.
                </>
              ) : (
                <>
                  You are about to reactivate{" "}
                  <strong>Patient {statusTarget?.id.slice(0, 8)}…</strong>. Their account
                  will be restored to active status.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {willDeactivate && (
            <div className="space-y-2 py-2">
              <Label htmlFor="reason">Reason for deactivation</Label>
              <Textarea
                id="reason"
                placeholder="Describe why this patient is being deactivated..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-400 text-right">
                {reason.length}/500
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusTarget(null)}
              disabled={statusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={willDeactivate ? "destructive" : "default"}
              onClick={handleStatusChange}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending
                ? "Saving..."
                : willDeactivate
                ? "Deactivate"
                : "Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ deleted }: { deleted: boolean }) {
  if (!deleted)
    return (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-800 border-green-200 text-xs"
      >
        <Activity className="w-3 h-3 mr-1" /> Active
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="bg-red-100 text-red-800 border-red-200 text-xs"
    >
      <ShieldOff className="w-3 h-3 mr-1" /> Inactive
    </Badge>
  );
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────

function PatientDetailDialog({
  id,
  onClose,
  onChangeStatus,
}: {
  id: string;
  onClose: () => void;
  onChangeStatus: (p: Patient) => void;
}) {
  const { data: patient, isLoading } = useGetAdminPatientById(id);

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-gray-50">
        <DialogHeader>
          <DialogTitle>Patient Profile — {id.slice(0, 8)}…</DialogTitle>
        </DialogHeader>

        {isLoading || !patient ? (
          <div className="py-16 text-center text-gray-500">
            Loading details...
          </div>
        ) : (
          <div className="space-y-5">
            {/* Identity */}
            <div className="bg-white rounded-xl border p-5 flex flex-col sm:flex-row gap-5">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                <User className="w-8 h-8" />
              </div>
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    {patient.userName ?? `Patient ${patient.id.slice(0, 8)}…`}
                  </span>
                  <StatusBadge deleted={patient.deleted} />
                </div>
                {patient.userEmail && (
                  <p className="text-sm text-gray-500">{patient.userEmail}</p>
                )}
                <p className="text-xs font-mono text-gray-400">
                  ID: {patient.id} · User ID: {patient.userId}
                </p>
                <p className="text-sm text-gray-500">
                  Joined:{" "}
                  {patient.createdAt
                    ? format(new Date(patient.createdAt), "dd MMM yyyy")
                    : "—"}
                </p>
              </div>
              <div className="shrink-0 flex sm:flex-col gap-2 justify-center">
                <Button
                  size="sm"
                  variant={
                    !patient.deleted ? "destructive" : "default"
                  }
                  onClick={() => onChangeStatus(patient)}
                >
                  {!patient.deleted ? (
                    <>
                      <ShieldOff className="w-4 h-4 mr-1" /> Deactivate
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-1" /> Reactivate
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Demographics */}
            <div className="bg-white rounded-xl border p-5 space-y-4">
              <h3 className="font-semibold text-gray-800">Demographics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <DetailRow
                  icon={<CalendarDays className="w-4 h-4" />}
                  label="Date of Birth"
                  value={
                    patient.dateOfBirth
                      ? format(new Date(patient.dateOfBirth), "dd MMM yyyy")
                      : "—"
                  }
                />
                <DetailRow
                  icon={<User className="w-4 h-4" />}
                  label="Gender"
                  value={patient.gender ?? "—"}
                />
                <DetailRow
                  icon={<Droplets className="w-4 h-4" />}
                  label="Blood Group"
                  value={patient.bloodGroup ?? "—"}
                />
                <DetailRow
                  label="NIC"
                  value={patient.nicNumber ?? "—"}
                />
                <DetailRow
                  label="Height"
                  value={patient.height ? `${patient.height} cm` : "—"}
                />
                <DetailRow
                  label="Weight"
                  value={patient.weight ? `${patient.weight} kg` : "—"}
                />
                <DetailRow
                  icon={<MapPin className="w-4 h-4" />}
                  label="Address"
                  value={patient.address ?? "—"}
                  fullWidth
                />
                <DetailRow
                  label="Allergies"
                  value={patient.allergies ?? "None reported"}
                  fullWidth
                />
                <DetailRow
                  icon={<Phone className="w-4 h-4" />}
                  label="Emergency Contact"
                  value={patient.emergencyContactPhone ?? "—"}
                />
              </div>
            </div>

            {/* Deactivation Info */}
            {patient.deleted && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-2">
                <h3 className="font-semibold text-red-700 flex items-center gap-2">
                  <ShieldOff className="w-4 h-4" /> Deactivation Details
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <DetailRow
                    label="Deactivated At"
                    value={
                      patient.deletedAt
                        ? format(
                            new Date(patient.deletedAt),
                            "dd MMM yyyy, HH:mm"
                          )
                        : "—"
                    }
                  />
                  <DetailRow
                    label="Reason"
                    value={patient.deletionReason ?? "—"}
                    fullWidth
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
  fullWidth,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <p className="text-xs text-gray-400 flex items-center gap-1 mb-0.5">
        {icon} {label}
      </p>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  );
}

