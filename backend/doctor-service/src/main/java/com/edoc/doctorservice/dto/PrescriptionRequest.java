package com.edoc.doctorservice.dto;

import lombok.Data;
import java.util.List;

@Data
public class PrescriptionRequest {

    private String patientId;
    private String appointmentId;
    private String diagnosis;
    private String notes;
    private List<MedicineRequest> medicines;

    @Data
    public static class MedicineRequest {
        private String name;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
    }
}