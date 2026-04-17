"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Mail, Building, ChevronDown, Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/store/store";
import { useGetMyPatientProfile } from "@/api/patientApi";
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
  const MOCK_APPOINTMENT_ID = "00000000-0000-0000-0000-000000000001";
  const FALLBACK_AMOUNT = 2500;

  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useStore((s) => s.user);

  const appointmentIdParam = searchParams.get("appointmentId") ?? "";
  const amountParam = Number(searchParams.get("amount"));
  const currencyParam = searchParams.get("currency") ?? "LKR";
  const queryFirstName = searchParams.get("firstName") ?? "";
  const queryLastName = searchParams.get("lastName") ?? "";
  const queryEmail = searchParams.get("email") ?? "";
  const queryPhone = searchParams.get("phone") ?? "";
  const queryAddress = searchParams.get("address") ?? "";
  const queryCity = searchParams.get("city") ?? "";
  const queryCountry = searchParams.get("country") ?? "";
  const queryDoctorId = searchParams.get("doctorId") ?? "";
  const queryDoctorName = searchParams.get("doctorName") ?? "";
  const shouldFetchAppointment = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    appointmentIdParam
  );

  const nameParts = (user?.name ?? "").trim().split(/\s+/).filter(Boolean);
  const defaultFirstName = queryFirstName || nameParts[0] || "";
  const defaultLastName =
    queryLastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [email, setEmail] = useState(user?.email || queryEmail || "");
  const [phone, setPhone] = useState(user?.phoneNumber || queryPhone);
  const [address, setAddress] = useState(queryAddress);
  const [city, setCity] = useState(queryCity);
  const [country, setCountry] = useState(queryCountry || "Sri Lanka");
  const [currency, setCurrency] = useState(currencyParam.toUpperCase());
  const [successOpen, setSuccessOpen] = useState(false);

  const { data: patient } = useGetMyPatientProfile();
  const { data: appointment } = useGetAppointmentById(
    shouldFetchAppointment ? appointmentIdParam : ""
  );

  useEffect(() => {
    if (!phone && patient?.phone) {
      setPhone(patient.phone);
    }
    if (!address && patient?.address) {
      setAddress(patient.address);
    }
  }, [phone, address, patient]);

  const initiatePaymentMutation = useInitiatePayment();

  const amount = Number.isFinite(amountParam) && amountParam > 0
    ? amountParam
    : (appointment?.consultationFee ?? FALLBACK_AMOUNT);
  const paymentMethod: PaymentMethod =
    billingCycle === "monthly" ? "CARD" : "BANK_TRANSFER";
  const isProcessing = initiatePaymentMutation.isPending;

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    );

  const resolvedAppointmentId = isUuid(appointmentIdParam)
    ? appointmentIdParam
    : MOCK_APPOINTMENT_ID;

  const isValidEmail = (value: string) => {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const resolveMetadata = () => {
    const metadata: Record<string, string> = {
      source: "confirm-order",
      paymentMethod,
      appointmentSource: appointment ? "appointment-api" : "mock-fallback",
      mockAppointment: String(!appointment),
    };

    if (appointment?.timeSlot) metadata.timeSlot = appointment.timeSlot;
    if (appointment?.appointmentDate) metadata.appointmentDate = appointment.appointmentDate;
    if (appointment?.type) metadata.appointmentType = appointment.type;
    if (appointment?.doctorId) metadata.doctorId = appointment.doctorId;
    if (appointment?.doctorName) metadata.doctorName = appointment.doctorName;
    if (queryDoctorId) metadata.redirectDoctorId = queryDoctorId;
    if (queryDoctorName) metadata.redirectDoctorName = queryDoctorName;

    searchParams.forEach((value, key) => {
      if (key.startsWith("meta_") && value) {
        metadata[key.replace("meta_", "")] = value;
      }
    });

    return metadata;
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
    const userId = user?.userId || patient?.userId || "";
    
    if (!userId) {
      toast.error("User ID is required before confirming payment.");
      return;
    }
    if (!amount || amount <= 0) {
      toast.error("Payment amount is missing. Please retry from appointment booking.");
      return;
    }
    if (!/^[A-Za-z]{3}$/.test(currency)) {
      toast.error("Currency must be a 3-letter ISO code.");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Email must be valid.");
      return;
    }

    try {
      const checkout = await initiatePaymentMutation.mutateAsync({
        userId,
        appointmentId: resolvedAppointmentId,
        amount,
        currency: currency.toUpperCase(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        metadata: resolveMetadata(),
      });

      const checkoutPayload =
        checkout && typeof checkout === "object" && "data" in checkout
          ? (checkout as { data?: { actionUrl?: string; fields?: Record<string, string> } }).data
          : checkout;

      if (checkoutPayload?.actionUrl && checkoutPayload?.fields) {
        submitCheckoutForm(checkoutPayload.actionUrl, checkoutPayload.fields);
        return;
      }

      setSuccessOpen(true);
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
                      <div className="font-medium text-foreground">Card Payment</div>
                      <div className="text-sm text-muted-foreground mt-0.5">Use debit or credit card.</div>
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
                        <span className="font-medium text-foreground">Bank Transfer</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">Complete payment using bank transfer.</div>
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
              <div>
                <h3 className="font-medium text-foreground mb-3">First name</h3>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11 rounded-lg border-border/60"
                />
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-3">Last name</h3>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11 rounded-lg border-border/60"
                />
              </div>

              {/* Email Address */}
              <div>
                <h3 className="font-medium text-foreground">Email address <span className="text-red-500">*</span></h3>
                <p className="text-sm text-muted-foreground mb-3">Invoices will be sent to this email address.</p>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 rounded-lg border-border/60"
                  />
                </div>
                <button type="button" className="text-sm font-medium text-muted-foreground mt-3 flex items-center gap-1 hover:text-foreground transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add another
                </button>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-3">Phone</h3>
                <Input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-lg border-border/60"
                />
              </div>

              <Separator className="border-dashed" />

              <div>
                <h3 className="font-medium text-foreground mb-3">Address</h3>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-11 rounded-lg border-border/60"
                />
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-3">City</h3>
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-11 rounded-lg border-border/60"
                />
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-3">Country</h3>
                <Input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-11 rounded-lg border-border/60"
                />
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-3">Currency (ISO code)</h3>
                <Input
                  type="text"
                  maxLength={3}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  className="h-11 rounded-lg border-border/60 uppercase"
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
                    <div className="font-semibold text-sm">{`${firstName} ${lastName}`.trim() || "Payment Account"}</div>
                    <div className="text-xs text-muted-foreground">{email || "No email provided"}</div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>

              {/* Items */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-base text-foreground">Appointment payment</h3>
                  <p className="text-sm text-muted-foreground">
                    {appointmentIdParam ? `Appointment ID: ${appointmentIdParam}` : "General payment"}
                  </p>
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
