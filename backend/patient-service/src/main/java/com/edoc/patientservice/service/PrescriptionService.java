package com.edoc.patientservice.service;

import com.edoc.patientservice.client.DoctorPrescriptionClient;
import com.edoc.patientservice.dto.prescription.PrescriptionResponseDTO;
import com.edoc.patientservice.repository.PatientRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class PrescriptionService {

    private final DoctorPrescriptionClient doctorPrescriptionClient;
    private final PatientRepository patientRepository;

    public PrescriptionService(DoctorPrescriptionClient doctorPrescriptionClient,
                               PatientRepository patientRepository) {
        this.doctorPrescriptionClient = doctorPrescriptionClient;
        this.patientRepository = patientRepository;
    }

    public List<PrescriptionResponseDTO> getPrescriptionsForPatient(Long patientId) {
        assertPatientExists(patientId);
        return doctorPrescriptionClient.getPrescriptionsByPatient(patientId.toString());
    }

    public List<PrescriptionResponseDTO> getPrescriptionsInternal(Long patientId) {
        return getPrescriptionsForPatient(patientId);
    }

    private void assertPatientExists(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found");
        }
    }
}