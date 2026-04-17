export const USER_ENDPOINTS = {
  LOGIN: "/api/v1/users/login",
  REGISTER: "/api/v1/users/register",
  LOGOUT: "/api/v1/users/logout",
  ME: "/api/v1/users/me",
  UPDATE_PROFILE: "/api/v1/users/me",
  CHANGE_PASSWORD: "/api/v1/users/me/password",
  PROFILE_CREATED: (id: string) => `/api/v1/users/${id}/profile-created`,
  ALL_USERS: "/api/v1/admin/users",
  USER_BY_ID: (id: string) => `/api/v1/admin/users/${id}`,
  DELETE_USER: (id: string) => `/api/v1/admin/users/${id}`,
} as const;
export const PATIENT_ENDPOINTS = {
  REGISTER: "/api/v1/patients/register",
  ME: "/api/v1/patients/me",
  UPDATE_ME: "/api/v1/patients/me",
  UPDATE_STATUS: "/api/v1/patients/me/status",
} as const;

export const REPORT_ENDPOINTS = {
  MY_REPORTS: "/api/v1/patients/me/reports",
  MY_REPORT: (id: number) => `/api/v1/patients/me/reports/${id}`,
  UPLOAD: "/api/v1/patients/me/reports",
  DOWNLOAD: (id: number) => `/api/v1/patients/me/reports/${id}/download`,
} as const;

export const PRESCRIPTION_PATIENT_ENDPOINTS = {
  MY_PRESCRIPTIONS: "/api/v1/patients/me/prescriptions",
} as const;


export const DOCTOR_ENDPOINTS = {
  ME: "/api/v1/doctors/me",
  GET_ALL: "/api/v1/doctors",
  GET_BY_ID: (id: string) => `/api/v1/doctors/${id}`,
  BY_SPECIALTY: (specialty: string) => `/api/v1/doctors/specialty/${specialty}`,
  CREATE: "/api/v1/doctors/register",
  UPDATE: (id: string) => `/api/v1/doctors/${id}`,
  DELETE: (id: string) => `/api/v1/doctors/${id}`,
  VERIFY: (id: string) => `/api/v1/doctors/${id}/verify`,
  AVAILABILITY: (id: string) => `/api/v1/doctors/${id}/availability`,
  
  PRESCRIPTIONS: "/api/v1/prescriptions",
  PRESCRIPTION_BY_ID: (id: string) => `/api/v1/prescriptions/${id}`,
  CREATE_PRESCRIPTION: "/api/v1/prescriptions",
  UPDATE_PRESCRIPTION: (id: string) => `/api/v1/prescriptions/${id}`,
} as const;


export const APPOINTMENT_ENDPOINTS = {
  GET_BY_ID: (id: string) => `/api/v1/appointments/${id}`,
  CREATE: "/api/v1/appointments",
  CANCEL: (id: string) => `/api/v1/appointments/${id}/cancel`,
  UPDATE_STATUS: (id: string) => `/api/v1/appointments/${id}/status`,
  BY_PATIENT: (patientId: string) => `/api/v1/appointments/patient/${patientId}`,
  BY_DOCTOR: (doctorId: string) => `/api/v1/appointments/doctor/${doctorId}`,
  PENDING_BY_DOCTOR: (doctorId: string) => `/api/v1/appointments/doctor/${doctorId}/pending`,
} as const;


export const NOTIFICATION_ENDPOINTS = {
  GET_ALL: "/api/v1/notifications",
  GET_BY_ID: (id: string) => `/api/v1/notifications/${id}`,
  MARK_READ: (id: string) => `/api/v1/notifications/${id}/read`,
  MARK_ALL_READ: "/api/v1/notifications/read-all",
  DELETE: (id: string) => `/api/v1/notifications/${id}`,
  UNREAD_COUNT: "/api/v1/notifications/unread-count",
} as const;


export const FEEDBACK_ENDPOINTS = {
  SUBMIT: "/api/v1/feedback/submit",
  GET_BY_ID: (id: string) => `/api/v1/feedback/${id}`,
  BY_PATIENT: (patientId: string) => `/api/v1/feedback/patient/${patientId}`,
  BY_DOCTOR: (doctorId: string) => `/api/v1/feedback/doctor/${doctorId}`,
  BY_APPOINTMENT: (appointmentId: string) => `/api/v1/feedback/appointment/${appointmentId}`,
  UPDATE: (id: string) => `/api/v1/feedback/update/${id}`,
  DELETE: (id: string) => `/api/v1/feedback/delete/${id}`,
} as const;


export const TELEMEDICINE_ENDPOINTS = {
  SESSIONS: "/api/v1/telemedicine/sessions",
  SESSION_BY_APPOINTMENT_ID: (appointmentId: string) => `/api/v1/telemedicine/sessions/${appointmentId}`,
  CREATE_SESSION: "/api/v1/telemedicine/sessions",
  START_SESSION: (appointmentId: string) => `/api/v1/telemedicine/sessions/${appointmentId}/start`,
  END_SESSION: (appointmentId: string) => `/api/v1/telemedicine/sessions/${appointmentId}/complete`,
  SESSION_TOKEN: (appointmentId: string) => `/api/v1/telemedicine/sessions/${appointmentId}/token`,
  DELETE_SESSION: (appointmentId: string) => `/api/v1/telemedicine/sessions/${appointmentId}`,
} as const;


export const DASHBOARD_ENDPOINTS = {
  ADMIN_STATS: "/api/v1/admin/dashboard/stats",
  DOCTOR_STATS: "/api/v1/doctors/dashboard/stats",
  PATIENT_STATS: "/api/v1/patients/dashboard/stats",
  RECENT_ACTIVITY: "/api/v1/admin/dashboard/activity",
} as const;

export const AI_ENDPOINTS = {
  PATIENT_ANALYZE: "/api/v1/ai/patient/analyze",
  DOCTOR_ANALYZE: "/api/v1/ai/doctor/analyze",
  ADMIN_ANALYZE: "/api/v1/ai/admin/analyze",
} as const;


export const PAYMENT_ENDPOINTS = {
  GET_ALL: "/api/v1/payments",
  GET_BY_ID: (id: string) => `/api/v1/payments/${id}`,
  INITIATE: "/api/v1/payments/initiate",
  CONFIRM: (id: string) => `/api/v1/payments/${id}/confirm`,
  REFUND: (id: string) => `/api/v1/payments/${id}/refund`,
  BY_PATIENT: (patientId: string) => `/api/v1/payments?patientId=${patientId}`,
  BY_APPOINTMENT: (appointmentId: string) =>
    `/api/v1/payments?appointmentId=${appointmentId}`,
} as const;
