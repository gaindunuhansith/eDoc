package com.edoc.doctorservice.controller;

import com.edoc.doctorservice.dto.AvailabilityRequest;
import com.edoc.doctorservice.model.Availability;
import com.edoc.doctorservice.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctors/{doctorId}/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    // POST /api/v1/doctors/{doctorId}/availability
    @PostMapping
    public ResponseEntity<Availability> setAvailability(
            @PathVariable String doctorId,
            @RequestBody AvailabilityRequest request) {
        return ResponseEntity.ok(availabilityService.setAvailability(doctorId, request));
    }

    // GET /api/v1/doctors/{doctorId}/availability
    @GetMapping
    public ResponseEntity<List<Availability>> getAvailability(
            @PathVariable String doctorId) {
        return ResponseEntity.ok(availabilityService.getDoctorAvailability(doctorId));
    }

    // PATCH /api/v1/doctors/{doctorId}/availability/book
    // Called by appointment-service to mark a slot as booked
    @PatchMapping("/book")
    public ResponseEntity<Availability> markSlotBooked(
            @PathVariable String doctorId,
            @RequestParam String dayOfWeek,
            @RequestParam String startTime) {
        return ResponseEntity.ok(
                availabilityService.markSlotAsBooked(doctorId, dayOfWeek, startTime)
        );
    }

    // PATCH /api/v1/doctors/{doctorId}/availability/free
    // Called by appointment-service when appointment is cancelled
    @PatchMapping("/free")
    public ResponseEntity<Availability> markSlotFree(
            @PathVariable String doctorId,
            @RequestParam String dayOfWeek,
            @RequestParam String startTime) {
        return ResponseEntity.ok(
                availabilityService.markSlotAsFree(doctorId, dayOfWeek, startTime)
        );
    }

    // DELETE /api/v1/doctors/{doctorId}/availability/{dayOfWeek}
    @DeleteMapping("/{dayOfWeek}")
    public ResponseEntity<String> deleteAvailability(
            @PathVariable String doctorId,
            @PathVariable String dayOfWeek) {
        availabilityService.deleteAvailability(doctorId, dayOfWeek);
        return ResponseEntity.ok("Availability deleted for " + dayOfWeek);
    }
}