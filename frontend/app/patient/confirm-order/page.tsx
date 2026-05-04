"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Building, Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/store/store";
import { useGetAppointmentById } from "@/api/appointmentApi";
import {
  useInitiatePayment,
  type PaymentMethod,
} from "@/api/paymentApi";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ConfirmOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useStore((s) => s.user);

  const appointmentId = searchParams.get("appointmentId") ?? "";

  const [paymentOption, setPaymentOption] = useState<"card" | "other">("card");
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phoneNumber ?? "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Sri Lanka");
  const [successOpen, setSuccessOpen] = useState(false);

  const { data: appointment, isLoading: appointmentLoading } = useGetAppointmentById(
    appointmentId || ""
  );

  const initiatePaymentMutation = useInitiatePayment();

  const amount = appointment?.consultationFee ?? 0;
  const currency = "LKR";
  const paymentMethod: PaymentMethod =
    paymentOption === "card" ? "CARD" : "DIGITAL_WALLET";
  const isProcessing = initiatePaymentMutation.isPending;

  const isValidEmail = (value: string) => {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const submitCheckoutForm = (actionUrl: string, fields: Record<string, string>) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = actionUrl;
    form.style.display = "none";

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value ?? "";
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleProceedToPay = async () => {
    if (!appointmentId.trim()) {
      toast.error("Appointment ID is missing. Please go back and try again.");
      return;
    }
    if (appointmentLoading) {
      toast.error("Still loading appointment details. Please wait.");
      return;
    }
    if (!amount || amount <= 0) {
      toast.error("Payment amount is missing. Please retry from appointment booking.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone number is required.");
      return;
    }
    if (!address.trim()) {
      toast.error("Address is required.");
      return;
    }
    if (!city.trim()) {
      toast.error("City is required.");
      return;
    }
    if (!country.trim()) {
      toast.error("Country is required.");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Email must be valid.");
      return;
    }

    try {
      const checkout = await initiatePaymentMutation.mutateAsync({
        appointmentId: appointmentId,
        amount,
        currency: currency.toUpperCase(),
        fullName: fullName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
      });

      if (checkout?.checkoutUrl) {
        // Split name for PayHere form
        const nameParts = fullName.trim().split(/\s+/);
        const fName = nameParts[0] || "";
        const lName = nameParts.slice(1).join(" ") || "";

        submitCheckoutForm(checkout.checkoutUrl, {
          merchant_id:  checkout.merchantId,
          return_url:   `${window.location.origin}/patient/payments`,
          cancel_url:   `${window.location.origin}/patient/payments`,
          notify_url:   checkout.notifyUrl,
          order_id:     checkout.orderId,
          items:        `Appointment ${appointmentId}`,
          currency:     checkout.currency,
          amount:       String(checkout.amount),
          first_name:   fName,
          last_name:    lName,
          email:        email.trim(),
          phone:        phone.trim(),
          address:      address.trim(),
          city:         city.trim(),
          country:      country.trim() || "Sri Lanka",
          hash:         checkout.hash,
        });
        return;
      }

      toast.error("Unexpected response from payment service. Please try again.");
    } catch {
      toast.error("Payment initiation failed. Please check details and retry.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8">
        {/* Left Column: Details */}
        <div className="space-y-8">
          <section>

            {/* Billing cycle */}
            <div>
              <h3 className="font-medium text-foreground">Payment method</h3>
              <p className="text-sm text-muted-foreground mb-4">Choose how you want to complete payment.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                {/* Visa / Master Option */}
                <div 
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentOption === "card" ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"}`}
                  onClick={() => setPaymentOption("card")}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 min-w-4.5 min-h-4.5 rounded-full border-2 flex items-center justify-center ${paymentOption === "card" ? "border-primary" : "border-muted-foreground"}`}>
                      {paymentOption === "card" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Visa / Master</div>
                      <div className="text-sm text-muted-foreground mt-0.5">Use debit or credit card.</div>
                    </div>
                  </div>
                </div>

                {/* Digital Wallet Option */}
                <div 
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentOption === "other" ? "border-foreground bg-muted/20" : "border-border/60 hover:border-border"}`}
                  onClick={() => setPaymentOption("other")}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 min-w-4.5 min-h-4.5 rounded-full border-2 flex items-center justify-center ${paymentOption === "other" ? "border-foreground" : "border-muted-foreground"}`}>
                      {paymentOption === "other" && <div className="w-2.5 h-2.5 rounded-full bg-foreground" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">Digital Wallet</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">Pay via Genie, Vishwa, EzCash, mCash, or other supported methods.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4 text-foreground mt-12">Billing details</h2>
            <Separator className="mb-6" />

            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="font-medium text-foreground mb-3">Full name <span className="text-red-500">*</span></h3>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 rounded-lg border-border/60"
                  placeholder="e.g. Janani Thilakarathne"
                />
              </div>

              {/* Email Address */}
              <div>
                <h3 className="font-medium text-foreground">Email address <span className="text-red-500">*</span></h3>
                <p className="text-sm text-muted-foreground mb-3">We will contact you with this email</p>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 rounded-lg border-border/60"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-3">Phone <span className="text-red-500">*</span></h3>
                <Input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-lg border-border/60"
                />
              </div>

              <Separator className="border-dashed" />

              <div>
                <h3 className="font-medium text-foreground mb-3">Address <span className="text-red-500">*</span></h3>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-11 rounded-lg border-border/60"
                />
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-3">City <span className="text-red-500">*</span></h3>
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-11 rounded-lg border-border/60"
                />
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-3">Country <span className="text-red-500">*</span></h3>
                <Input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-11 rounded-lg border-border/60"
                />
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-3">Currency</h3>
                <Input
                  type="text"
                  maxLength={3}
                  value={currency}
                  disabled
                  className="h-11 rounded-lg border-border/60 uppercase bg-muted/30"
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

              {/* User Profile Summary */}
              <div className="flex items-center justify-between p-3 border rounded-xl mb-6 bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-linear-to-br from-neutral-800 to-black rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-white/50" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{appointment?.doctorName || "Medical Appointment"}</div>
                    <div className="text-xs text-muted-foreground">
                      {appointment 
                        ? `${new Date(appointment.appointmentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${appointment.timeSlot}`
                        : "No appointment details"
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-base text-foreground">Appointment payment</h3>
                  {appointmentId && (
                    <p className="text-sm text-muted-foreground">
                      Appointment ID: {appointmentId}
                    </p>
                  )}
                </div>
                <span className="font-bold text-base">LKR {amount.toLocaleString()}</span>
              </div>
              
              <Separator className="my-5" />


              {/* Subtotals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Amount</span>
                  <span className="text-muted-foreground">LKR {amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">Method</span>
                  </div>
                  <span className="text-muted-foreground">{paymentMethod.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">Currency</span>
                  </div>
                  <span className="text-muted-foreground">{currency.toUpperCase()}</span>
                </div>
              </div>

              <Separator className="my-5" />

              {/* Due Today */}
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-base text-foreground">Due today</span>
                <span className="font-bold text-xl text-foreground">LKR {amount.toLocaleString()}</span>
              </div>

              <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
                <Button
                  className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-base rounded-xl transition-all"
                  onClick={handleProceedToPay}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing payment..." : "Proceed to pay"}
                </Button>
                <DialogContent showCloseButton={false} className="sm:max-w-md text-center p-8 border-none shadow-2xl gap-0 rounded-2xl">
                  {/* Visually hidden accessible title/description */}
                  <DialogTitle className="sr-only">Payment Successful</DialogTitle>
                  <DialogDescription className="sr-only">Your payment has been completed successfully.</DialogDescription>
                  
                  {/* Icon */}
                    <div className="mx-auto w-14 h-14 text-emerald-500 rounded-full flex items-center justify-center border-3 border-emerald-500 mt-2 mb-6 shadow-sm">
                    <Check className="w-8 h-8 stroke-3" />
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
