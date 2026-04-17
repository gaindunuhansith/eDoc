"use client";

import React from "react";
import { 
  Search, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Calendar,
  Mail
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
import { cn } from "@/lib/utils";

// Dummy data for all system payments
const transactions = [
  {
    id: "TXN-A98210",
    patientName: "Michael Johnson",
    patientEmail: "mjohnson@example.com",
    service: "Consultation - Dr. Sarah Smith",
    category: "Cardiology",
    paymentMethod: "Visa Card (....4242)",
    date: "2024-04-15",
    time: "10:30 AM",
    amount: "$50.00",
    status: "Completed",
  },
  {
    id: "TXN-B11234",
    patientName: "James Williams",
    patientEmail: "j.williams@example.com",
    service: "Lab Test - Blood Panel",
    category: "Diagnostics",
    paymentMethod: "Mastercard (....8899)",
    date: "2024-04-14",
    time: "02:15 PM",
    amount: "$120.00",
    status: "Completed",
  },
  {
    id: "TXN-C55678",
    patientName: "Caitlyn King",
    patientEmail: "c.king@example.com",
    service: "Telemedicine Appointment",
    category: "Neurology",
    paymentMethod: "Apple Pay",
    date: "2024-04-14",
    time: "09:00 AM",
    amount: "$88.00",
    status: "Completed",
  },
  {
    id: "TXN-D22901",
    patientName: "Robert Davis",
    patientEmail: "r.davis@example.com",
    service: "Annual Checkup",
    category: "General Practice",
    paymentMethod: "Visa Card (....1122)",
    date: "2024-04-13",
    time: "11:45 AM",
    amount: "$75.00",
    status: "Pending",
  },
  {
    id: "TXN-E77341",
    patientName: "Sarah Connor",
    patientEmail: "s.connor@example.com",
    service: "Physiotherapy Session",
    category: "Rehabilitation",
    paymentMethod: "Mastercard (....5544)",
    date: "2024-04-12",
    time: "04:30 PM",
    amount: "$60.00",
    status: "Completed",
  },
];

export default function AdminPaymentsPage() {
  return (
    <div className="w-full h-full p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">System Payments</h2>
        <div className="flex items-center gap-3">
          <Select defaultValue="last-month">
            <SelectTrigger className="w-[140px] border-border/60 bg-background hover:bg-muted/50 transition-colors">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col space-y-6 w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by User, Email, or Transaction ID" 
                  className="pl-9 border-border/60 bg-background hover:border-border transition-colors h-10"
                />
              </div>
              <Select defaultValue="all-category">
                <SelectTrigger className="w-[140px] border-border/60 bg-background hover:bg-muted/50 transition-colors h-10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-category">All Categories</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="diagnostics">Diagnostics</SelectItem>
                  <SelectItem value="general">General Practice</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-status">
                <SelectTrigger className="w-[140px] border-border/60 bg-background hover:bg-muted/50 transition-colors h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
              <Button variant="outline" className="border-border/60 bg-background text-muted-foreground font-normal hover:bg-muted/50 transition-colors h-10 hidden sm:flex">
                <Calendar className="w-4 h-4 mr-2" />
                All Time Range
                <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
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
              <TableHead className="text-muted-foreground font-medium py-4">Patient / User</TableHead>
              <TableHead className="text-muted-foreground font-medium py-4">Appointment / Service</TableHead>
              <TableHead className="text-muted-foreground font-medium py-4">Transaction Details</TableHead>
              <TableHead className="text-muted-foreground font-medium py-4">Date & Time</TableHead>
              <TableHead className="text-muted-foreground font-medium py-4">Amount</TableHead>
              <TableHead className="text-muted-foreground font-medium py-4 w-28">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id} className="border-border/60 hover:bg-muted/10 transition-colors group">
                <TableCell className="text-center px-4">
                  <Checkbox className="border-border/60 w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <p className="font-semibold text-foreground text-sm">{tx.patientName}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                      <Mail className="w-3 h-3 mr-1 opacity-70" /> {tx.patientEmail}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div>
                    <p className="font-medium text-foreground text-sm">{tx.service}</p>
                    <p className="text-xs text-muted-foreground">{tx.category}</p>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm font-medium text-foreground">{tx.id}</div>
                  <div className="text-xs text-muted-foreground">{tx.paymentMethod}</div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm text-foreground font-medium">{tx.date}</div>
                  <div className="text-xs text-muted-foreground">{tx.time}</div>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-sm font-semibold text-foreground">
                    {tx.amount}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "font-medium pointer-events-none capitalize shadow-sm",
                      tx.status === "Completed" 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400"
                    )}
                  >
                    {tx.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">1-5</span> of <span className="font-medium text-foreground">156</span> transactions
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
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 font-medium text-muted-foreground hover:text-foreground">32</Button>
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 border-border/60 bg-background hover:bg-muted/50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
