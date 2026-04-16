package com.edoc.patientservice.mapper;

import com.edoc.patientservice.dto.patient.PatientRequestDTO;
import com.edoc.patientservice.dto.patient.PatientResponseDTO;
import com.edoc.patientservice.entity.Patient;
import org.springframework.stereotype.Component;

// Maps between patient entities and DTOs.
@Component
public class PatientMapper {

    public Patient toEntity(PatientRequestDTO request) {
        Patient patient = new Patient();
        applyUpdates(patient, request);
        return patient;
    }

    public void applyUpdates(Patient patient, PatientRequestDTO request) {
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setAddress(request.getAddress());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setNicNumber(request.getNicNumber());
        patient.setAllergies(request.getAllergies());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
    }

    public PatientResponseDTO toResponse(Patient patient) {
        PatientResponseDTO response = new PatientResponseDTO();
        response.setId(patient.getId());
        response.setFirstName(patient.getFirstName());
        response.setLastName(patient.getLastName());
        response.setEmail(patient.getEmail());
        response.setPhone(patient.getPhone());
        response.setDateOfBirth(patient.getDateOfBirth());
        response.setAddress(patient.getAddress());
        response.setCreatedAt(patient.getCreatedAt());
        response.setUpdatedAt(patient.getUpdatedAt());
        response.setGender(patient.getGender());
        response.setBloodGroup(patient.getBloodGroup());
        response.setNicNumber(patient.getNicNumber());
        response.setAllergies(patient.getAllergies());
        response.setEmergencyContactPhone(patient.getEmergencyContactPhone());
        response.setStatus(patient.getStatus());
        response.setDeactivatedAt(patient.getDeactivatedAt());
        response.setDeactivatedBy(patient.getDeactivatedBy());
        response.setDeactivationReason(patient.getDeactivationReason());
        return response;
    }
}
