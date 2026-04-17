package com.edoc.doctorservice.repository;

import com.edoc.doctorservice.model.Prescription;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends MongoRepository<Prescription, String> {

    // Get all prescriptions issued by a specific doctor
    List<Prescription> findByDoctorId(String doctorId);

    // Get all prescriptions for a specific patient
    List<Prescription> findByPatientId(String patientId);

    // Get all prescriptions for a specific patient userId
    List<Prescription> findByPatientUserId(String patientUserId);

    // Transitional fallback while old records may still only have patientId populated.
    List<Prescription> findByPatientUserIdOrPatientId(String patientUserId, String patientId);

    // Get prescription for a specific appointment
    List<Prescription> findByAppointmentId(String appointmentId);
}