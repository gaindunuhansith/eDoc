"use client";

import React, { useState } from "react";
import { 
  Search, 
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Mail,
  User,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Dummy data
const users = [
  {
    id: "USR-001",
    name: "Dr. Sarah Smith",
    email: "sarah.smith@example.com",
    role: "Doctor",
    specialty: "Cardiology",
    joinedDate: "2024-01-15",
    status: "Active",
  },
  {
    id: "USR-002",
    name: "Michael Johnson",
    email: "mjohnson@example.com",
    role: "Patient",
    specialty: "-",
    joinedDate: "2024-02-12",
    status: "Active",
  },
  {
    id: "USR-003",
    name: "Dr. Emily Chen",
    email: "emily.chen@example.com",
    role: "Doctor",
    specialty: "Neurology",
    joinedDate: "2024-03-05",
    status: "Active",
  },
  {
    id: "USR-004",
    name: "James Williams",
    email: "j.williams99@example.com",
    role: "Patient",
    specialty: "-",
    joinedDate: "2024-03-20",
    status: "Inactive",
  },
  {
    id: "USR-005",
    name: "Admin Team",
    email: "admin@edoc.app",
    role: "Admin",
    specialty: "System",
    joinedDate: "2023-11-01",
    status: "Active",
  },
];

export default function UsersPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const openDeleteModal = (user: any) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  return (
    <div className="w-full h-full p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">User Management</h2>

      </div>

      <div className="flex flex-col space-y-6 w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-9 border-border/60 bg-background hover:border-border transition-colors h-10"
                />
              </div>
              <Select defaultValue="all-roles">
                <SelectTrigger className="w-[140px] border-border/60 bg-background hover:bg-muted/50 transition-colors h-10">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-roles">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-status">
                <SelectTrigger className="w-[140px] border-border/60 bg-background hover:bg-muted/50 transition-colors h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Add User button aligned to the right like external actions on the previous page */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
              <Button onClick={() => setIsAddOpen(true)} className="bg-neutral-900 hover:bg-neutral-800 text-white shadow-sm transition-all h-10">
                <User className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add User</span>
              </Button>
            </div>
        </div>

        <div className="w-full">
          <Table className="w-full">
          <TableHeader>
            <TableRow className="border-border/60 bg-muted/20 hover:bg-muted/20">
              <TableHead className="w-12 text-center px-4">
                <Checkbox className="border-border/60 w-4 h-4" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium py-4">User</TableHead>
              <TableHead className="text-muted-foreground font-medium py-4">User ID</TableHead>
              <TableHead className="text-muted-foreground font-medium py-4">Role / Specialty</TableHead>
              <TableHead className="text-muted-foreground font-medium py-4">Joined Date</TableHead>
              <TableHead className="text-muted-foreground font-medium py-4 w-28">Status</TableHead>
              <TableHead className="text-muted-foreground font-medium py-4 w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-border/60 hover:bg-muted/10 transition-colors group">
                <TableCell className="text-center px-4">
                  <Checkbox className="border-border/60 w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {user.name.charAt(0)}{user.name.includes('.') ? user.name.split(' ')[1].charAt(0) : user.name.split(' ')[1]?.charAt(0) || ''}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{user.name}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                        <Mail className="w-3 h-3 mr-1" /> {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-sm font-medium text-foreground">
                  {user.id}
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm font-semibold text-foreground">{user.role}</div>
                  <div className="text-xs text-muted-foreground">{user.specialty}</div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm text-foreground font-medium">{user.joinedDate}</div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "font-medium pointer-events-none capitalize shadow-sm",
                      user.status === "Active" 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                        : "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400"
                    )}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Button onClick={() => openEditModal(user)} variant="ghost" size="icon" className="w-8 h-8 hover:text-primary hover:bg-primary/10">
                      <Pencil className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button onClick={() => openDeleteModal(user)} variant="ghost" size="icon" className="w-8 h-8 hover:text-rose-500 hover:bg-rose-500/10">
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">1-5</span> of <span className="font-medium text-foreground">42</span> users
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9 border-border/60 bg-background hover:bg-muted/50 transition-colors disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="secondary" size="sm" className="h-9 w-9 p-0 font-medium">1</Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 font-medium text-muted-foreground hover:text-foreground">2</Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 font-medium text-muted-foreground hover:text-foreground">3</Button>
              <span className="px-1 text-muted-foreground">...</span>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 font-medium text-muted-foreground hover:text-foreground">9</Button>
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 border-border/60 bg-background hover:bg-muted/50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>


      {/* Add User Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Enter the details to create a new user account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select defaultValue="patient">
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="patient">Patient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button className="bg-neutral-900 hover:bg-neutral-800 text-white" onClick={() => setIsAddOpen(false)}>Save User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Modify details for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" defaultValue={selectedUser?.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" defaultValue={selectedUser?.email} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select defaultValue={selectedUser?.role?.toLowerCase()}>
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="patient">Patient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select defaultValue={selectedUser?.status?.toLowerCase()}>
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button className="bg-neutral-900 hover:bg-neutral-800 text-white" onClick={() => setIsEditOpen(false)}>Update changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Registration */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="gap-2">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <DialogTitle>Delete User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user <span className="font-semibold text-foreground">{selectedUser?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => setIsDeleteOpen(false)}>Delete User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
