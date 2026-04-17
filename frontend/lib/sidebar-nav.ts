import {
  Building2,
  Calendar,
  CreditCard,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Pill,
  Users,
  Video,
  Bot,
  type LucideIcon,
} from "lucide-react";

export type SidebarNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

const adminNav: SidebarNavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Patients", url: "/admin/patients", icon: Users },
  { title: "Appointments", url: "/admin/appointments", icon: Calendar },
  { title: "Reports", url: "/admin/reports", icon: FileText },
  { title: "Prescriptions", url: "/admin/prescriptions", icon: Pill },
  { title: "Feedback", url: "/admin/feedback", icon: MessageSquare },
  { title: "Telemedicine", url: "/admin/telemedicine", icon: Video },
  { title: "Users", url: "/admin/users", icon: Users },
];

const doctorNav: SidebarNavItem[] = [
  { title: "Dashboard", url: "/doctor", icon: LayoutDashboard },
  { title: "Patients", url: "/doctor/patients", icon: Users },
  { title: "Appointments", url: "/doctor/appointments", icon: Calendar },
  { title: "Reports", url: "/doctor/reports", icon: FileText },
  { title: "Prescriptions", url: "/doctor/prescriptions", icon: Pill },
  { title: "Feedback", url: "/doctor/feedback", icon: MessageSquare },
  { title: "Telemedicine", url: "/doctor/telemedicine", icon: Video },
];

const patientNav: SidebarNavItem[] = [
  { title: "Dashboard", url: "/patient", icon: LayoutDashboard },
  { title: "eDoc AI", url: "/patient/edoc-ai", icon: Bot },
  { title: "Doctors", url: "/patient/doctors", icon: Building2 },
  { title: "Appointments", url: "/patient/appointments", icon: Calendar },
  { title: "Reports", url: "/patient/reports", icon: FileText },
  { title: "Prescriptions", url: "/patient/prescriptions", icon: Pill },
  { title: "Feedback", url: "/patient/feedback", icon: MessageSquare },
  { title: "Telemedicine", url: "/patient/telemedicine", icon: Video },
  { title: "Payments", url: "/patient/payments", icon: CreditCard },
];

export const roleNavMap = {
  admin: adminNav,
  doctor: doctorNav,
  patient: patientNav,
} as const;

export type UserRole = keyof typeof roleNavMap;

export function getRoleFromPathname(pathname: string): UserRole {
  if (pathname.startsWith("/admin")) {
    return "admin";
  }

  if (pathname.startsWith("/doctor")) {
    return "doctor";
  }

  return "patient";
}

export function getNavForPathname(pathname: string): SidebarNavItem[] {
  return roleNavMap[getRoleFromPathname(pathname)];
}
