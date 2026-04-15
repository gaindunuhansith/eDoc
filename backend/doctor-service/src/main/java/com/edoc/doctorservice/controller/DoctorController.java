package com.edoc.doctorservice.controller;

import com.edoc.doctorservice.dto.DoctorRegistrationRequest;
import com.edoc.doctorservice.model.Doctor;
import com.edoc.doctorservice.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")    // Allows frontend to call this API
public class DoctorController {

    private final DoctorService doctorService;

    // POST /api/doctors/register
    @PostMapping("/register")
    public ResponseEntity<Doctor> registerDoctor(
            @Valid @RequestBody DoctorRegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(doctorService.registerDoctor(request));
    }

    // GET /api/doctors/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable String id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    // GET /api/doctors - get all verified doctors
    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllVerifiedDoctors());
    }

    // GET /api/doctors/specialty/{specialty}
    @GetMapping("/specialty/{specialty}")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialty(
            @PathVariable String specialty) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialty(specialty));
    }

    // PUT /api/doctors/{id} - update profile
    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(
            @PathVariable String id,
            @Valid @RequestBody DoctorRegistrationRequest request) {
        return ResponseEntity.ok(doctorService.updateDoctorProfile(id, request));
    }

    // PATCH /api/doctors/{id}/toggle-availability
    @PatchMapping("/{id}/toggle-availability")
    public ResponseEntity<Doctor> toggleAvailability(@PathVariable String id) {
        return ResponseEntity.ok(doctorService.toggleAvailability(id));
    }

    // GET /api/doctors/admin/all - admin sees all doctors
    @GetMapping("/admin/all")
    public ResponseEntity<List<Doctor>> getAllDoctorsForAdmin() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    // DELETE /api/doctors/{id} - admin removes a doctor
    // This also removes their availability and prescriptions
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDoctor(@PathVariable String id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(
                Map.of(
                        "message", "Doctor and all associated data deleted successfully",
                        "doctorId", id
                )
        );
    }
}