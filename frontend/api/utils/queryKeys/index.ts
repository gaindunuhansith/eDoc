
export const queryKeys = {
  user: {
    all: ["user"] as const,
    me: () => ["user", "me"] as const,
    lists: () => ["user", "list"] as const,
    detail: (id: string) => ["user", "detail", id] as const,
  },

  patient: {
    all: ["patient"] as const,
    me: () => ["patient", "me"] as const,
    lists: () => ["patient", "list"] as const,
    detail: (id: string) => ["patient", "detail", id] as const,
    stats: () => ["patient", "stats"] as const,
    reports: () => ["patient", "reports"] as const,
    report: (id: number) => ["patient", "report", id] as const,
    prescriptions: () => ["patient", "prescriptions"] as const,
  },

  doctor: {
    all: ["doctor"] as const,
    lists: () => ["doctor", "list"] as const,
    detail: (id: string) => ["doctor", "detail", id] as const,
    availability: (id: string) => ["doctor", "availability", id] as const,
    stats: () => ["doctor", "stats"] as const,
    prescriptions: {
      all: ["doctor", "prescriptions"] as const,
      detail: (id: string) => ["doctor", "prescriptions", id] as const,
    },
  },

  appointment: {
    all: ["appointment"] as const,
    lists: () => ["appointment", "list"] as const,
    detail: (id: string) => ["appointment", "detail", id] as const,
    byPatient: (patientId: string) =>
      ["appointment", "patient", patientId] as const,
    byDoctor: (doctorId: string) =>
      ["appointment", "doctor", doctorId] as const,
  },

  notification: {
    all: ["notification"] as const,
    lists: () => ["notification", "list"] as const,
    detail: (id: string) => ["notification", "detail", id] as const,
    unreadCount: () => ["notification", "unread-count"] as const,
  },

  feedback: {
    all: ["feedback"] as const,
    lists: () => ["feedback", "list"] as const,
    detail: (id: string) => ["feedback", "detail", id] as const,
    byDoctor: (doctorId: string) => ["feedback", "doctor", doctorId] as const,
    byPatient: (patientId: string) => ["feedback", "patient", patientId] as const,
  },

  telemedicine: {
    all: ["telemedicine"] as const,
    sessions: () => ["telemedicine", "sessions"] as const,
    session: (appointmentId: string) => ["telemedicine", "session", appointmentId] as const,
    token: (appointmentId: string, userId: string) => ["telemedicine", "token", appointmentId, userId] as const,
  },


  dashboard: {
    all: ["dashboard"] as const,
    adminStats: () => ["dashboard", "admin", "stats"] as const,
    doctorStats: () => ["dashboard", "doctor", "stats"] as const,
    patientStats: () => ["dashboard", "patient", "stats"] as const,
    recentActivity: () => ["dashboard", "activity"] as const,
  },

  ai: {
    all: ["ai"] as const,
    chatHistory: () => ["ai", "chat", "history"] as const,
    symptomCheck: (symptoms: string[]) =>
      ["ai", "symptom-check", symptoms] as const,
    diagnosis: (data: string) => ["ai", "diagnosis", data] as const,
  },


  payment: {
    all: ["payment"] as const,
    lists: () => ["payment", "list"] as const,
    detail: (id: string) => ["payment", "detail", id] as const,
    byPatient: (patientId: string) =>
      ["payment", "patient", patientId] as const,
    byAppointment: (appointmentId: string) =>
      ["payment", "appointment", appointmentId] as const,
  },
} as const;
