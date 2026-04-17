"use client";

import { useMemo, useState } from "react";
import { mockDoctorPatientsList, type DoctorPatient } from "@/lib/fallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/dialog";
import { Search, Users, UserCheck, UserX, Eye } from "lucide-react";

function StatusBadge({ status }: { status: DoctorPatient["status"] }) {
  return status === "ACTIVE" ? (
    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
  ) : (
    <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Inactive</Badge>
  );
}

function GenderBadge({ gender }: { gender: DoctorPatient["gender"] }) {
  return gender === "MALE" ? (
    <Badge variant="outline" className="text-blue-600 border-blue-300">Male</Badge>
  ) : (
    <Badge variant="outline" className="text-pink-600 border-pink-300">Female</Badge>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [genderFilter, setGenderFilter] = useState<"ALL" | "MALE" | "FEMALE">("ALL");
  const [selected, setSelected] = useState<DoctorPatient | null>(null);

  const patients = mockDoctorPatientsList;

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.nic.toLowerCase().includes(search.toLowerCase()) ||
        p.condition.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchGender = genderFilter === "ALL" || p.gender === genderFilter;
      return matchSearch && matchStatus && matchGender;
    });
  }, [patients, search, statusFilter, genderFilter]);

  const activeCount = patients.filter((p) => p.status === "ACTIVE").length;
  const inactiveCount = patients.filter((p) => p.status === "INACTIVE").length;

  return (
    <div className="w-full h-full p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">My Patients</h1>
        <p className="text-muted-foreground mt-1">View and manage patients under your care</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-5 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="text-2xl font-bold">{patients.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-5 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-green-50">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-5 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-gray-50">
              <UserX className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold">{inactiveCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Patient List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, NIC, or condition..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={genderFilter}
              onValueChange={(v) => setGenderFilter(v as typeof genderFilter)}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Genders</SelectItem>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Patient</TableHead>
                  <TableHead>Age / Gender</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Next Appointment</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      No patients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-xs text-muted-foreground">{patient.nic}</div>
                      </TableCell>
                      <TableCell>
                        <div>{patient.age} yrs</div>
                        <div className="mt-1">
                          <GenderBadge gender={patient.gender} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-sm">{patient.bloodGroup}</span>
                      </TableCell>
                      <TableCell className="text-sm">{patient.condition}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(patient.lastVisit)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {patient.nextAppointment ? formatDate(patient.nextAppointment) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{patient.totalVisits}</TableCell>
                      <TableCell>
                        <StatusBadge status={patient.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelected(patient)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-xs text-muted-foreground text-right">
            Showing {filtered.length} of {patients.length} patients
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{selected.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">NIC</span>
                <span>{selected.nic}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Age / Gender</span>
                <span>{selected.age} yrs · {selected.gender === "MALE" ? "Male" : "Female"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Blood Group</span>
                <span className="font-semibold">{selected.bloodGroup}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>{selected.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Address</span>
                <span className="text-right max-w-[55%]">{selected.address}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Condition</span>
                <span>{selected.condition}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Visit</span>
                <span>{formatDate(selected.lastVisit)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next Appointment</span>
                <span>
                  {selected.nextAppointment ? formatDate(selected.nextAppointment) : "Not scheduled"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Visits</span>
                <span className="font-medium">{selected.totalVisits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={selected.status} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
