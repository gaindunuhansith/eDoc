package com.edoc.doctorservice.repository;

import com.edoc.doctorservice.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends MongoRepository<Doctor, String> {

    // Find a doctor by email
    Optional<Doctor> findByEmail(String email);

    // Find all doctors of a specific specialty (used by appointment service)
    List<Doctor> findBySpecialty(String specialty);

    // Find all verified doctors
    List<Doctor> findByIsVerified(boolean isVerified);

    // Find all available and verified doctors
    List<Doctor> findByIsVerifiedAndIsAvailable(boolean isVerified, boolean isAvailable);

    // Check if email already exists
    boolean existsByEmail(String email);

    // Search doctors by specialty and availability
    List<Doctor> findBySpecialtyAndIsVerifiedAndIsAvailable(
            String specialty, boolean isVerified, boolean isAvailable
    );
}