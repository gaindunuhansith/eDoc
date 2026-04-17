package com.edoc.doctorservice.controller;

import com.edoc.doctorservice.dto.PrescriptionRequest;
import com.edoc.doctorservice.model.Prescription;
import com.edoc.doctorservice.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/prescriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    // POST /api/v1/prescriptions/{doctorId}
    @PostMapping("/{doctorId}")
    public ResponseEntity<Prescription> issuePrescription(
            @PathVariable String doctorId,
            @RequestBody PrescriptionRequest request) {
        Prescription prescription = prescriptionService.issuePrescription(doctorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(prescription);
    }

    // GET /api/v1/prescriptions/doctor/{doctorId}
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Prescription>> getPrescriptionsByDoctor(
            @PathVariable String doctorId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByDoctor(doctorId));
    }

    // GET /api/v1/prescriptions/patient/{patientId}
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>> getPrescriptionsByPatient(
            @PathVariable String patientId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatient(patientId));
    }

    // GET /api/v1/prescriptions/appointment/{appointmentId}
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<Prescription>> getPrescriptionsByAppointment(
            @PathVariable String appointmentId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionByAppointment(appointmentId));
    }

    // GET /api/v1/prescriptions/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getPrescriptionById(@PathVariable String id) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionById(id));
    }
}