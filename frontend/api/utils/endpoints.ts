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


export const DOCTOR_ENDPOINTS = {
  GET_ALL: "/api/v1/doctors",
  GET_BY_ID: (id: string) => `/api/v1/doctors/${id}`,
  BY_SPECIALTY: (specialty: string) => `/api/v1/doctors/specialty/${specialty}`,
  CREATE: "/api/v1/doctors/register",
  UPDATE: (id: string) => `/api/v1/doctors/${id}`,
  DELETE: (id: string) => `/api/v1/doctors/${id}`,
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
  BY_PATIENT: (patientId: string) => `/api/v1/appointments/patient/${patientId}`,
  BY_DOCTOR: (doctorId: string) => `/api/v1/appointments/doctor/${doctorId}`,
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
  GET_ALL: "/api/v1/feedback",
  GET_BY_ID: (id: string) => `/api/v1/feedback/${id}`,
  CREATE: "/api/v1/feedback",
  UPDATE: (id: string) => `/api/v1/feedback/${id}`,
  DELETE: (id: string) => `/api/v1/feedback/${id}`,
  BY_DOCTOR: (doctorId: string) => `/api/v1/feedback?doctorId=${doctorId}`,
} as const;


export const TELEMEDICINE_ENDPOINTS = {
  SESSIONS: "/api/v1/telemedicine/sessions",
  SESSION_BY_ID: (id: string) => `/api/v1/telemedicine/sessions/${id}`,
  CREATE_SESSION: "/api/v1/telemedicine/sessions",
  START_SESSION: (id: string) => `/api/v1/telemedicine/sessions/${id}/start`,
  END_SESSION: (id: string) => `/api/v1/telemedicine/sessions/${id}/end`,
  JOIN_SESSION: (id: string) => `/api/v1/telemedicine/sessions/${id}/join`,
  SESSION_TOKEN: (id: string) => `/api/v1/telemedicine/sessions/${id}/token`,
} as const;


export const DASHBOARD_ENDPOINTS = {
  ADMIN_STATS: "/api/v1/admin/dashboard/stats",
  DOCTOR_STATS: "/api/v1/doctors/dashboard/stats",
  PATIENT_STATS: "/api/v1/patients/dashboard/stats",
  RECENT_ACTIVITY: "/api/v1/admin/dashboard/activity",
} as const;

export const AI_ENDPOINTS = {
  CHAT: "/api/v1/ai/chat",
  SYMPTOM_CHECK: "/api/v1/ai/symptom-check",
  DIAGNOSIS_SUGGESTION: "/api/v1/ai/diagnosis",
  CHAT_HISTORY: "/api/v1/ai/chat/history",
  CLEAR_HISTORY: "/api/v1/ai/chat/history",
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
