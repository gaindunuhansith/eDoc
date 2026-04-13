package com.edoc.doctorservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "prescriptions")
public class Prescription {

    @Id
    private String id;

    private String doctorId;
    private String patientId;
    private String appointmentId;      // Links to the appointment this was issued for

    private String diagnosis;          // What the doctor diagnosed
    private String notes;              // Doctor's notes

    private List<Medicine> medicines;  // List of medicines prescribed

    private LocalDateTime issuedAt;    // When the prescription was created
    private LocalDateTime validUntil;  // Expiry of prescription

    // Inner class for each medicine
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Medicine {
        private String name;
        private String dosage;        // e.g. "500mg"
        private String frequency;     // e.g. "Twice a day"
        private String duration;      // e.g. "7 days"
        private String instructions;  // e.g. "Take after meals"
    }
}
