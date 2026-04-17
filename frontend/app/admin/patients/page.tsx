"use client";

import { Badge } from "@/components/ui/badge";
import { mockPatients } from "@/lib/fallback";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-600",
};

const bloodGroupColors: Record<string, string> = {
  "A+": "bg-red-50 text-red-700",
  "A-": "bg-red-50 text-red-700",
  "B+": "bg-blue-50 text-blue-700",
  "B-": "bg-blue-50 text-blue-700",
  "O+": "bg-green-50 text-green-700",
  "O-": "bg-green-50 text-green-700",
  "AB+": "bg-purple-50 text-purple-700",
  "AB-": "bg-purple-50 text-purple-700",
};

export default function PatientsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Patients</h2>
          <p className="text-gray-500 text-sm mt-1">
            {mockPatients.length} registered patients in the system
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3.5 px-5 font-semibold text-gray-600">Patient</th>
              <th className="text-left py-3.5 px-5 font-semibold text-gray-600">NIC</th>
              <th className="text-left py-3.5 px-5 font-semibold text-gray-600">Phone</th>
              <th className="text-left py-3.5 px-5 font-semibold text-gray-600">Blood Group</th>
              <th className="text-left py-3.5 px-5 font-semibold text-gray-600">Address</th>
              <th className="text-left py-3.5 px-5 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-xs text-gray-400">{patient.gender}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-5 text-gray-600 font-mono text-xs">{patient.nic}</td>
                <td className="py-3.5 px-5 text-gray-600">{patient.phone}</td>
                <td className="py-3.5 px-5">
                  <span
                    className={`px-2.5 py-1 rounded-md font-semibold text-xs ${
                      bloodGroupColors[patient.bloodGroup] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {patient.bloodGroup}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-gray-500 max-w-[180px] truncate">
                  {patient.address}
                </td>
                <td className="py-3.5 px-5">
                  <Badge
                    className={`${
                      statusColors[patient.status] ?? "bg-gray-100 text-gray-600"
                    } border-0`}
                  >
                    {patient.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
