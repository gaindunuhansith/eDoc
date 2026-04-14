package com.edoc.doctorservice.service;

import com.edoc.doctorservice.dto.AvailabilityRequest;
import com.edoc.doctorservice.model.Availability;
import com.edoc.doctorservice.repository.AvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;

    // Set or update availability for a day
    public Availability setAvailability(String doctorId, AvailabilityRequest request) {

        // Check if availability already exists for this day
        Availability availability = availabilityRepository
                .findByDoctorIdAndDayOfWeek(doctorId, request.getDayOfWeek())
                .orElse(new Availability());

        availability.setDoctorId(doctorId);
        availability.setDayOfWeek(request.getDayOfWeek());
        availability.setActive(true);

        // Convert DTO slots to model slots
        List<Availability.TimeSlot> slots = request.getTimeSlots().stream()
                .map(s -> new Availability.TimeSlot(s.getStartTime(), s.getEndTime(), false))
                .collect(Collectors.toList());

        availability.setTimeSlots(slots);
        return availabilityRepository.save(availability);
    }

    // Get all availability for a doctor
    public List<Availability> getDoctorAvailability(String doctorId) {
        return availabilityRepository.findByDoctorIdAndIsActive(doctorId, true);
    }

    // Mark a specific time slot as booked (called by appointment service)
    public Availability markSlotAsBooked(String doctorId, String dayOfWeek, String startTime) {
        Availability availability = availabilityRepository
                .findByDoctorIdAndDayOfWeek(doctorId, dayOfWeek)
                .orElseThrow(() -> new RuntimeException("Availability not found"));

        availability.getTimeSlots().forEach(slot -> {
            if (slot.getStartTime().equals(startTime)) {
                slot.setBooked(true);
            }
        });

        return availabilityRepository.save(availability);
    }

    // Mark a slot as free again (when appointment is cancelled)
    public Availability markSlotAsFree(String doctorId, String dayOfWeek, String startTime) {
        Availability availability = availabilityRepository
                .findByDoctorIdAndDayOfWeek(doctorId, dayOfWeek)
                .orElseThrow(() -> new RuntimeException("Availability not found"));

        availability.getTimeSlots().forEach(slot -> {
            if (slot.getStartTime().equals(startTime)) {
                slot.setBooked(false);
            }
        });

        return availabilityRepository.save(availability);
    }

    // Delete availability for a day
    public void deleteAvailability(String doctorId, String dayOfWeek) {
        Availability availability = availabilityRepository
                .findByDoctorIdAndDayOfWeek(doctorId, dayOfWeek)
                .orElseThrow(() -> new RuntimeException("Availability not found"));
        availabilityRepository.delete(availability);
    }
}