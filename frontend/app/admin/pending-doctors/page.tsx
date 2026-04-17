"use client";

import { useMemo } from "react";
import { useGetAllUsers, useMarkProfileCreated } from "@/api/userApi";
import { useCreateDoctor } from "@/api/doctorApi";
import { UserProfile } from "@/api/userApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function PendingDoctorsPage() {
  const { data: users, isLoading } = useGetAllUsers();
  const markProfileCreatedMutation = useMarkProfileCreated();
  const createDoctorMutation = useCreateDoctor();

  // Filter users who are doctors but not yet verified or profile created 
  // Because backend logic: after approval, profile gets created
  const pendingDoctors = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => u.role === "DOCTOR" && !u.isProfileCreated && !u.profileCreated);     
  }, [users]);

  const handleApprove = (doc: UserProfile) => {
    // 1. First inject the user into doctor_db securely mapping their userId
    const nameParts = doc.name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Doc";

    createDoctorMutation.mutate({
      id: doc.userId, // Secure matching of IDs 
      email: doc.email,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: doc.phoneNumber || "000000000",
      specialty: "", // To be filled by doctor later
      qualification: "", // To be filled later
      licenseNumber: "", // To be filled later
      experienceYears: 0,
      consultationFee: 0,
    }, {
      onSuccess: () => {
        // 2. Mark profile as created so it's formally removed from the pending list
        markProfileCreatedMutation.mutate(doc.userId, {
          onSuccess: () => {
            toast.success("Doctor Approved", { description: `${doc.name} has been successfully verified.` });
          },
          onError: () => {
            toast.error("Internal Error", { description: "Doctor created but failed to mark profile as done."});
          }
        });
      },
      onError: (err: any) => {
        toast.error("Approval Failed", { description: err?.response?.data?.message || "Could not register doctor to DB." });
      }
    });

  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Doctor Approvals</h1>
          <p className="text-muted-foreground mt-2">
            Review and approve registration requests from new doctors.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Needs Verification</CardTitle>
          <CardDescription>
            Approving a doctor allows them to set up their consultation profile and start seeing patients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">Loading requests...</div>  
          ) : pendingDoctors.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg bg-muted/20">
              <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">All Caught Up</h3>
              <p className="text-muted-foreground mt-1">There are no pending doctor registration requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingDoctors.map((doc) => (
                <div key={doc.userId} className="flex items-center justify-between p-4 border rounded-lg bg-card transition-colors hover:bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">{doc.name}</h4>   
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>{doc.email}</span>
                        {doc.phoneNumber && <span>• {doc.phoneNumber}</span>}   
                        <span>• Registered: {new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button
                      onClick={() => handleApprove(doc)}
                      disabled={createDoctorMutation.isPending || markProfileCreatedMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"    
                    >
                      {(createDoctorMutation.isPending || markProfileCreatedMutation.isPending) ? "Approving..." : "Approve & Verify"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
