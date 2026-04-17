"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Mail, CheckCircle2, Building, ChevronDown, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ConfirmOrderPage() {
  const router = useRouter();
  const [seats, setSeats] = useState(2);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("annually");

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8">
        {/* Left Column: Details */}
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Plan details</h2>
            <Separator className="mb-6" />

            {/* Number of seats */}
            <div className="mb-8">
              <h3 className="font-medium text-foreground">Number of seats</h3>
              <p className="text-sm text-muted-foreground mb-4">Select how many seats you need.</p>
              <div className="flex items-center w-full max-w-md h-12 border rounded-xl overflow-hidden ring-1 ring-border/50">
                <button 
                  variant="ghost" 
                  className="px-4 h-full flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => setSeats(Math.max(1, seats - 1))}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="flex-1 h-full flex items-center justify-center font-bold text-xl border-x">
                  {seats}
                </div>
                <button 
                  variant="ghost" 
                  className="px-4 h-full flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => setSeats(seats + 1)}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Billing cycle */}
            <div>
              <h3 className="font-medium text-foreground">Billing cycle</h3>
              <p className="text-sm text-muted-foreground mb-4">Pay annually for a 20% discount.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                {/* Monthly Option */}
                <div 
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${billingCycle === "monthly" ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"}`}
                  onClick={() => setBillingCycle("monthly")}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 min-w-[18px] min-h-[18px] rounded-full border-2 flex items-center justify-center ${billingCycle === "monthly" ? "border-primary" : "border-muted-foreground"}`}>
                      {billingCycle === "monthly" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Pay monthly</div>
                      <div className="text-sm text-muted-foreground mt-0.5">$10 per seat / month</div>
                    </div>
                  </div>
                </div>

                {/* Annually Option */}
                <div 
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${billingCycle === "annually" ? "border-foreground bg-muted/20" : "border-border/60 hover:border-border"}`}
                  onClick={() => setBillingCycle("annually")}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 min-w-[18px] min-h-[18px] rounded-full border-2 flex items-center justify-center ${billingCycle === "annually" ? "border-foreground" : "border-muted-foreground"}`}>
                      {billingCycle === "annually" && <div className="w-2.5 h-2.5 rounded-full bg-foreground" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">Pay annually</span>
                        <span className="text-[10px] bg-muted font-medium px-2 py-0.5 rounded-sm text-muted-foreground">Save 20%</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">$8.33 per seat / month</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4 text-foreground mt-12">Invoice details</h2>
            <Separator className="mb-6" />

            <div className="space-y-6 max-w-xl">
              {/* Email Address */}
              <div>
                <h3 className="font-medium text-foreground">Email address <span className="text-red-500">*</span></h3>
                <p className="text-sm text-muted-foreground mb-3">Invoices will be sent to this email address.</p>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    defaultValue="admin@voxellabs.com" 
                    className="pl-9 h-11 rounded-lg border-border/60"
                  />
                </div>
                <button className="text-sm font-medium text-muted-foreground mt-3 flex items-center gap-1 hover:text-foreground transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add another
                </button>
              </div>

              <Separator className="border-dashed" />

              {/* Full Name */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Full name or Company name <span className="text-red-500">*</span></h3>
                <Input 
                  type="text" 
                  defaultValue="Caitlyn King" 
                  className="h-11 rounded-lg border-border/60"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Summary */}
        <div>
          <Card className="rounded-2xl border-border/60 shadow-sm sticky top-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-5 text-foreground">Summary</h2>

              {/* Voxel Labs Selector */}
              <div className="flex items-center justify-between p-3 border rounded-xl mb-6 cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-neutral-800 to-black rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-white/50" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Voxel Labs</div>
                    <div className="text-xs text-muted-foreground">admin@voxellabs.com</div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>

              {/* Items */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-base text-foreground">2x PRO license</h3>
                  <p className="text-sm text-muted-foreground">Oct 11 2025 - Oct 11 2026</p>
                </div>
                <span className="font-bold text-base">$100.00</span>
              </div>
              
              <Separator className="my-5" />

              {/* Discount Code */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3 text-foreground">Discount code</h3>
                <div className="relative">
                  <Input 
                    type="text" 
                    defaultValue="FRIENDS" 
                    className="h-11 rounded-lg border-border/60 font-medium pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Subtotals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="text-muted-foreground">$100.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">Discount</span>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium text-muted-foreground">20%</span>
                  </div>
                  <span className="text-muted-foreground">-$20.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">GST</span>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium text-muted-foreground">10%</span>
                  </div>
                  <span className="text-muted-foreground">+$8.00</span>
                </div>
              </div>

              <Separator className="my-5" />

              {/* Due Today */}
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-base text-foreground">Due today</span>
                <span className="font-bold text-xl text-foreground">$88.00</span>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-base rounded-xl transition-all">
                    Proceed to pay
                  </Button>
                </DialogTrigger>
                <DialogContent showCloseButton={false} className="sm:max-w-md text-center p-8 border-none shadow-2xl gap-0 rounded-2xl">
                  {/* Visually hidden accessible title/description */}
                  <DialogTitle className="sr-only">Payment Successful</DialogTitle>
                  <DialogDescription className="sr-only">Your payment has been completed successfully.</DialogDescription>
                  
                  {/* Icon */}
                  <div className="mx-auto w-14 h-14 text-emerald-500 rounded-full flex items-center justify-center border-[3px] border-emerald-500 mt-2 mb-6 shadow-sm">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  
                  {/* Text content */}
                  <div className="space-y-3 mb-8">
                    <h2 className="text-[22px] font-semibold text-foreground tracking-tight">Payment Successful</h2>
                    <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                      Your payment is successful and the appointment is successfully scheduled.
                    </p>
                  </div>

                  {/* Action */}
                  <div className="flex justify-center border-t border-border/40 pt-4 -mx-8 -mb-4">
                    <Button 
                      variant="ghost" 
                      className="text-muted-foreground hover:text-foreground text-sm font-medium gap-1 h-auto py-2"
                      onClick={() => router.push('/patient/appointments')}
                    >
                      Okay <ChevronRight className="w-4 h-4 ml-1 opacity-70" />
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
