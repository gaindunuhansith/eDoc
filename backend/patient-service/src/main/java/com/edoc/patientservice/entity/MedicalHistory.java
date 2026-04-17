package com.edoc.patientservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "medical_history")
// Structured medical history entries for a patient.
@Getter
@Setter
public class MedicalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false, length = 200)
    private String condition;

    @Column(length = 200)
    private String diagnosis;

    @Column(name = "visit_date")
    private LocalDate visitDate;

    // Cross-service reference IDs (no FK constraint — microservices pattern)
    @Column(name = "doctor_id")
    private String doctorId;

    @Column(name = "appointment_id")
    private String appointmentId;

    // Snapshot of doctor name at time of entry — avoids calling doctor-service on every read
    @Column(name = "doctor_name_snapshot", length = 200)
    private String doctorNameSnapshot;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
