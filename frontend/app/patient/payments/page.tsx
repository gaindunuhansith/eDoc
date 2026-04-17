"use client";

import React from "react";
import { 
  Search, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Calendar
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
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Dummy data
const transactions = [
  {
    id: "TXN-98210345",
    name: "Consultation - Dr. Smith",
    category: "General Practice",
    paymentMethod: "Visa Card (....4242)",
    date: "2024-04-15",
    time: "10:30 AM",
    amount: "$50.00",
    isPositive: false,
    receiptNo: "REC-456789",
    status: "Completed",
  },
  {
    id: "TXN-98210346",
    name: "Follow-up - Dr. Johnson",
    category: "Cardiology",
    paymentMethod: "Mastercard (....8899)",
    date: "2024-04-12",
    time: "02:15 PM",
    amount: "$75.00",
    isPositive: false,
    receiptNo: "REC-456790",
    status: "Completed",
  },
  {
    id: "TXN-98210347",
    name: "Lab Test - Blood Panel",
    category: "Diagnostics",
    paymentMethod: "Visa Card (....4242)",
    date: "2024-04-10",
    time: "09:00 AM",
    amount: "$120.00",
    isPositive: false,
    receiptNo: "REC-456791",
    status: "Completed",
  },
  {
    id: "TXN-98210348",
    name: "Consultation - Dr. Aris",
    category: "Neurology",
    paymentMethod: "Apple Pay",
    date: "2024-04-08",
    time: "11:45 AM",
    amount: "$200.00",
    isPositive: false,
    receiptNo: "REC-456792",
    status: "Completed",
  },
  {
    id: "TXN-98210349",
    name: "Vaccination - Flu Shot",
    category: "Preventative",
    paymentMethod: "Visa Card (....4242)",
    date: "2024-04-05",
    time: "04:30 PM",
    amount: "$25.00",
    isPositive: false,
    receiptNo: "REC-456793",
    status: "Pending",
  },
];

export default function PaymentsPage() {
  return (
    <div className="w-full h-full p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Recent Transactions</h2>
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
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search transaction" 
                  className="pl-9 border-border/60 bg-background hover:border-border transition-colors h-10"
                />
              </div>
              <Select defaultValue="all-category">
                <SelectTrigger className="w-[140px] border-border/60 bg-background hover:bg-muted/50 transition-colors h-10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-category">All Category</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-account">
                <SelectTrigger className="w-[140px] border-border/60 bg-background hover:bg-muted/50 transition-colors h-10">
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-account">All Account</SelectItem>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="mastercard">Mastercard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
              <Button variant="outline" className="border-border/60 bg-background text-muted-foreground font-normal hover:bg-muted/50 transition-colors h-10 hidden sm:flex">
                <Calendar className="w-4 h-4 mr-2" />
                1-30 September 2028
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
              <TableHead className="text-muted-foreground font-medium py-4">Appointment / Service</TableHead>
              <TableHead className="text-muted-foreground font-medium py-4">Payment Method</TableHead>
              <TableHead className="text-muted-foreground font-medium py-4">Transaction ID</TableHead>
              <TableHead className="text-muted-foreground font-medium py-4">Payment Date</TableHead>
              <TableHead className="text-muted-foreground font-medium py-4">Amount</TableHead>
              <TableHead className="text-muted-foreground font-medium py-4 w-48 hidden md:table-cell">Receipt #</TableHead>
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
                  <div>
                    <p className="font-semibold text-foreground text-sm">{tx.name}</p>
                    <p className="text-xs text-muted-foreground">{tx.category}</p>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground font-medium">
                  {tx.paymentMethod}
                </TableCell>
                <TableCell className="py-4 text-sm font-medium text-foreground">
                  {tx.id}
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm text-foreground font-medium">{tx.date}</div>
                  <div className="text-xs text-muted-foreground">{tx.time}</div>
                </TableCell>
                <TableCell className="py-4">
                  <span className={cn("text-sm font-semibold", tx.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400")}>
                    {tx.amount}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground max-w-[200px] truncate hidden md:table-cell" title={tx.receiptNo}>
                  {tx.receiptNo}
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
            Showing <span className="font-medium text-foreground">1-5</span> of <span className="font-medium text-foreground">24</span> transactions
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
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 font-medium text-muted-foreground hover:text-foreground">5</Button>
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
