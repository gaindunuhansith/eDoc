package com.edoc.doctorservice.service;

import com.edoc.doctorservice.dto.DoctorRegistrationRequest;
import com.edoc.doctorservice.model.Doctor;
import com.edoc.doctorservice.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor   // Lombok: auto generates constructor for all final fields
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    // Register a new doctor
    public Doctor registerDoctor(DoctorRegistrationRequest request) {
        if (doctorRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        Doctor doctor = new Doctor();
        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setEmail(request.getEmail());
        doctor.setPassword(passwordEncoder.encode(request.getPassword())); // Hash password
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
        doctor.setHospital(request.getHospital());
        doctor.setBio(request.getBio());
        doctor.setConsultationFee(request.getConsultationFee());
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
}
