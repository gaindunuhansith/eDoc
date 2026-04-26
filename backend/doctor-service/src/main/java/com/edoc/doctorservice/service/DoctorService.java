package com.edoc.doctorservice.service;

import com.edoc.doctorservice.dto.DoctorRegistrationRequest;
import com.edoc.doctorservice.model.Availability;
import com.edoc.doctorservice.model.Doctor;
import com.edoc.doctorservice.model.Prescription;
import com.edoc.doctorservice.repository.AvailabilityRepository;
import com.edoc.doctorservice.repository.DoctorRepository;
import com.edoc.doctorservice.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor   // Lombok: auto generates constructor for all final fields
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AvailabilityRepository availabilityRepository;
    private final PrescriptionRepository prescriptionRepository;

    // Register a new doctor
    public Doctor registerDoctor(DoctorRegistrationRequest request, String userId) {
        if (doctorRepository.existsByEmail(request.getEmail())) {
            Doctor existing = doctorRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("Doctor not found"));
            if (request.getId() != null && !request.getId().equals(existing.getId())) {
                // If it has a mismatched ID (from older tests), delete it to start fresh
                doctorRepository.delete(existing);
            } else {
                return existing;
            }
        }

        Doctor doctor = new Doctor();
        if (request.getId() != null && !request.getId().isEmpty()) {
            doctor.setId(request.getId());
        }
        doctor.setUserId(userId);
        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setEmail(request.getEmail());
        doctor.setPhoneNumber(request.getPhoneNumber());
        doctor.setSpecialty(request.getSpecialty());
        doctor.setQualification(request.getQualification());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setHospital(request.getHospital());
        doctor.setBio(request.getBio());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setVerified(false);   // Admin must verify first
        doctor.setAvailable(false);  // Not available until verified

        return doctorRepository.save(doctor);
    }

    // Get doctor by ID
    public Doctor getDoctorById(String id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
    }

    // Get doctor by email
    public Doctor getDoctorByEmail(String email) {
        return doctorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found with email: " + email));
    }

    // Get all verified doctors
    public List<Doctor> getAllVerifiedDoctors() {
        return doctorRepository.findByIsVerified(true);
    }

    // Search doctors by specialty
    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        return doctorRepository.findBySpecialtyAndIsVerifiedAndIsAvailable(
                specialty, true, true
        );
    }

    // Update doctor profile
    public Doctor updateDoctorProfile(String id, DoctorRegistrationRequest request) {
        Doctor doctor = getDoctorById(id);
        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setPhoneNumber(request.getPhoneNumber());
        doctor.setSpecialty(request.getSpecialty());
        doctor.setQualification(request.getQualification());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setHospital(request.getHospital());
        doctor.setBio(request.getBio());
        doctor.setConsultationFee(request.getConsultationFee());
        return doctorRepository.save(doctor);
    }

    // Verify a doctor (admin only)
    public Doctor verifyDoctor(String id) {
        Doctor doctor = getDoctorById(id);
        doctor.setVerified(true);
        doctor.setAvailable(true);
        return doctorRepository.save(doctor);
    }

    // Toggle doctor availability on/off
    public Doctor toggleAvailability(String id) {
        Doctor doctor = getDoctorById(id);
        doctor.setAvailable(!doctor.isAvailable());
        return doctorRepository.save(doctor);
    }

    // Get all doctors (for admin)
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // Delete doctor and all their related data - admin only
    public void deleteDoctor(String id) {
        // This throws automatically if doctor doesn't exist
        Doctor doctor = getDoctorById(id);

        // Delete all availability schedules linked to this doctor
        List<Availability> availabilities = availabilityRepository.findByDoctorId(id);
        if (!availabilities.isEmpty()) {
            availabilityRepository.deleteAll(availabilities);
        }

        // Delete all prescriptions issued by this doctor
        List<Prescription> prescriptions = prescriptionRepository.findByDoctorId(id);
        if (!prescriptions.isEmpty()) {
            prescriptionRepository.deleteAll(prescriptions);
        }

        // Finally delete the doctor account itself
        doctorRepository.delete(doctor);
    }
}