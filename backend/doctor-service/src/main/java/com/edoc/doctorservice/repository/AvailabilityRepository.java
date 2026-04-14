package com.edoc.doctorservice.repository;

import com.edoc.doctorservice.model.Availability;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AvailabilityRepository extends MongoRepository<Availability, String> {

    // Get all availability slots for a specific doctor
    List<Availability> findByDoctorId(String doctorId);

    // Get availability for a specific doctor on a specific day
    Optional<Availability> findByDoctorIdAndDayOfWeek(String doctorId, String dayOfWeek);

    // Get all active availabilities for a doctor
    List<Availability> findByDoctorIdAndIsActive(String doctorId, boolean isActive);
}