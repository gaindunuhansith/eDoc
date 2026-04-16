import { useQuery } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { DASHBOARD_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";

export interface AdminDashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  appointmentsToday: number;
  activeTelemedicineSessions: number;
  totalRevenue: number;
  recentRegistrations: number;
}

export interface DoctorDashboardStats {
  totalPatients: number;
  appointmentsToday: number;
  upcomingAppointments: number;
  completedAppointments: number;
  averageRating: number;
  totalFeedback: number;
}

export interface PatientDashboardStats {
  upcomingAppointments: number;
  pastAppointments: number;
  totalPrescriptions: number;
  pendingPayments: number;
  totalSpent: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}


export const fetchAdminStats = () =>
  apiClient.get<AdminDashboardStats>(DASHBOARD_ENDPOINTS.ADMIN_STATS);

export const fetchDoctorStats = () =>
  apiClient.get<DoctorDashboardStats>(DASHBOARD_ENDPOINTS.DOCTOR_STATS);

export const fetchPatientStats = () =>
  apiClient.get<PatientDashboardStats>(DASHBOARD_ENDPOINTS.PATIENT_STATS);

export const fetchRecentActivity = () =>
  apiClient.get<ActivityItem[]>(DASHBOARD_ENDPOINTS.RECENT_ACTIVITY);

export const useGetAdminStats = () =>
  useQuery({
    queryKey: queryKeys.dashboard.adminStats(),
    queryFn: () => fetchAdminStats().then((r) => r.data),
    // Refresh dashboard stats every 2 minutes
    refetchInterval: 2 * 60 * 1000,
  });

export const useGetDoctorStats = () =>
  useQuery({
    queryKey: queryKeys.dashboard.doctorStats(),
    queryFn: () => fetchDoctorStats().then((r) => r.data),
    refetchInterval: 2 * 60 * 1000,
  });

export const useGetPatientStats = () =>
  useQuery({
    queryKey: queryKeys.dashboard.patientStats(),
    queryFn: () => fetchPatientStats().then((r) => r.data),
  });

export const useGetRecentActivity = () =>
  useQuery({
    queryKey: queryKeys.dashboard.recentActivity(),
    queryFn: () => fetchRecentActivity().then((r) => r.data),
    staleTime: 1 * 60 * 1000,
  });
