"use client";

import { useRef, useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  FilePlus,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useGetMyReports,
  useUploadReport,
  useDeleteReport,
  getReportDownloadUrl,
  type MedicalReport,
} from "@/api/patientApi";
import apiClient from "@/api/utils/axiosInstance";
import { mockReportsList } from "@/lib/fallback";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const REPORT_TYPE_COLORS: Record<string, string> = {
  BLOOD_TEST:   "bg-red-100 text-red-700 border-red-200",
  XRAY:         "bg-blue-100 text-blue-700 border-blue-200",
  MRI:          "bg-purple-100 text-purple-700 border-purple-200",
  CT_SCAN:      "bg-indigo-100 text-indigo-700 border-indigo-200",
  ULTRASOUND:   "bg-cyan-100 text-cyan-700 border-cyan-200",
  ECG:          "bg-orange-100 text-orange-700 border-orange-200",
  URINE_TEST:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  OTHER:        "bg-gray-100 text-gray-600 border-gray-200",
};

function reportTypeBadge(type: string) {
  const cls = REPORT_TYPE_COLORS[type] ?? REPORT_TYPE_COLORS.OTHER;
  return (
    <Badge variant="outline" className={`text-xs ${cls}`}>
      {type.replace(/_/g, " ")}
    </Badge>
  );
}

// ─── Upload Dialog ────────────────────────────────────────────────────────────

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
}

function UploadDialog({ open, onClose }: UploadDialogProps) {
  const [reportName, setReportName] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadReport();

  const reset = () => {
    setReportName("");
    setNotes("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    if (reportName.trim()) fd.append("reportName", reportName.trim());
    if (notes.trim()) fd.append("notes", notes.trim());

    uploadMutation.mutate(fd, {
      onSuccess: () => {
        toast.success("Report uploaded successfully.");
        handleClose();
      },
      onError: () => {
        toast.error("Failed to upload report. Please try again.");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Medical Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="reportName">Report Name</Label>
            <Input
              id="reportName"
              placeholder="e.g. Blood Test – March 2025"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="Any additional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="file">
              File <span className="text-red-500">*</span>
            </Label>
            <Input
              id="file"
              type="file"
              ref={fileRef}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <p className="text-xs text-gray-400">
              Accepted: PDF, JPG, PNG, DOC, DOCX
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={uploadMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MedicalReport | null>(null);

  const { data: reports = [], isLoading } = useGetMyReports();
  const deleteMutation = useDeleteReport();

  const displayReports = reports.length > 0 ? reports : mockReportsList;

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Report deleted.");
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error("Failed to delete report.");
        setDeleteTarget(null);
      },
    });
  };

  const handleDownload = async (report: MedicalReport) => {
    try {
      const response = await apiClient.get(getReportDownloadUrl(report.id), {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = report.reportName || `report-${report.id}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download report.");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Medical Reports</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage and download your uploaded medical reports
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Report
        </Button>
      </div>

      {/* Table Card */}
      <Card className="bg-white border border-gray-200 shadow-none">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-base font-medium text-gray-700">
            {isLoading ? "Loading…" : `${displayReports.length} report${displayReports.length !== 1 ? "s" : ""}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton />
          ) : displayReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FilePlus className="h-10 w-10 mb-3 opacity-40" />
              <p className="font-medium">No reports uploaded yet</p>
              <p className="text-sm mt-1">
                Click &ldquo;Upload Report&rdquo; to add your first medical report.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Report Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Notes
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date Uploaded
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayReports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-900 text-sm">
                          {report.reportName || `Report #${report.id}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.reportType ? reportTypeBadge(report.reportType) : <span className="text-gray-400 text-sm">—</span>}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 line-clamp-1">
                        {report.notes || <span className="text-gray-400">—</span>}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {report.createdAt ? formatDate(report.createdAt) : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 h-8 text-xs"
                          onClick={() => handleDownload(report)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setDeleteTarget(report)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-900">
                {deleteTarget?.reportName || `Report #${deleteTarget?.id}`}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

