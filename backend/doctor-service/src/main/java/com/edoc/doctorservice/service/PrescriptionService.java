package com.edoc.doctorservice.service;

import com.edoc.doctorservice.dto.PrescriptionRequest;
import com.edoc.doctorservice.model.Prescription;
import com.edoc.doctorservice.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    // Issue a new prescription
    public Prescription issuePrescription(String doctorId, PrescriptionRequest request) {
        Prescription prescription = new Prescription();
        prescription.setDoctorId(doctorId);
        prescription.setPatientId(request.getPatientId());
        prescription.setAppointmentId(request.getAppointmentId());
        prescription.setDiagnosis(request.getDiagnosis());
        prescription.setNotes(request.getNotes());
        prescription.setIssuedAt(LocalDateTime.now());
        prescription.setValidUntil(LocalDateTime.now().plusDays(30)); // Valid for 30 days

        // Convert DTO medicines to model medicines
        List<Prescription.Medicine> medicines = request.getMedicines().stream()
                .map(m -> new Prescription.Medicine(
                        m.getName(),
                        m.getDosage(),
                        m.getFrequency(),
                        m.getDuration(),
                        m.getInstructions()
                ))
                .collect(Collectors.toList());

        prescription.setMedicines(medicines);
        return prescriptionRepository.save(prescription);
    }

    // Get all prescriptions issued by a doctor
    public List<Prescription> getPrescriptionsByDoctor(String doctorId) {
        return prescriptionRepository.findByDoctorId(doctorId);
    }

    // Get prescriptions for a patient (patient can view their own)
    public List<Prescription> getPrescriptionsByPatient(String patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }

    // Get prescription by appointment
    public List<Prescription> getPrescriptionByAppointment(String appointmentId) {
        return prescriptionRepository.findByAppointmentId(appointmentId);
    }

    // Get single prescription by ID
    public Prescription getPrescriptionById(String id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));
    }
}