package com.edoc.patientservice.mapper;

import com.edoc.patientservice.dto.history.MedicalHistoryRequestDTO;
import com.edoc.patientservice.dto.history.MedicalHistoryResponseDTO;
import com.edoc.patientservice.entity.MedicalHistory;
import org.springframework.stereotype.Component;

// Maps medical history entities to DTOs.
@Component
public class MedicalHistoryMapper {

    public MedicalHistory toEntity(MedicalHistoryRequestDTO request) {
        MedicalHistory history = new MedicalHistory();
        history.setCondition(request.getCondition());
        history.setDiagnosis(request.getDiagnosis());
        history.setVisitDate(request.getVisitDate());
        history.setNotes(request.getNotes());
        history.setDoctorId(request.getDoctorId());
        history.setAppointmentId(request.getAppointmentId());
        history.setDoctorNameSnapshot(request.getDoctorNameSnapshot());
        return history;
    }

    public MedicalHistoryResponseDTO toResponse(MedicalHistory history) {
        MedicalHistoryResponseDTO response = new MedicalHistoryResponseDTO();
        response.setId(history.getId());
        if (history.getPatient() != null) {
            response.setPatientId(history.getPatient().getId());
        }
        response.setCondition(history.getCondition());
        response.setDiagnosis(history.getDiagnosis());
        response.setVisitDate(history.getVisitDate());
        response.setNotes(history.getNotes());
        response.setDoctorId(history.getDoctorId());
        response.setAppointmentId(history.getAppointmentId());
        response.setDoctorNameSnapshot(history.getDoctorNameSnapshot());
        response.setCreatedAt(history.getCreatedAt());
        return response;
    }
}
