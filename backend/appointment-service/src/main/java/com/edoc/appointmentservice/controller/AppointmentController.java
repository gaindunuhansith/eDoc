package com.edoc.appointmentservice.controller;

import com.edoc.appointmentservice.dto.AppointmentRequest;
import com.edoc.appointmentservice.dto.AppointmentStatusUpdate;
import com.edoc.appointmentservice.dto.PaymentStatusUpdate;
import com.edoc.appointmentservice.model.Appointment;
import com.edoc.appointmentservice.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;

    // ─── BOOK ─────────────────────────────────────────────────────────────────

    // POST /api/v1/appointments
    @PostMapping
    public ResponseEntity<Appointment> bookAppointment(
            @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentService.bookAppointment(request));
    }

    // ─── GET ──────────────────────────────────────────────────────────────────

    // GET /api/v1/appointments/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable String id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    // GET /api/v1/appointments/patient/{patientId}
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByPatient(
            @PathVariable String patientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patientId));
    }

    // GET /api/v1/appointments/doctor/{doctorId}
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByDoctor(
            @PathVariable String doctorId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctor(doctorId));
    }

    // GET /api/v1/appointments/doctor/{doctorId}/pending
    // Doctor sees all pending appointments they need to accept/reject
    @GetMapping("/doctor/{doctorId}/pending")
    public ResponseEntity<List<Appointment>> getPendingAppointments(
            @PathVariable String doctorId) {
        return ResponseEntity.ok(
                appointmentService.getPendingAppointmentsForDoctor(doctorId)
        );
    }

    // GET /api/v1/appointments/patient/{patientId}/status/{status}
    // Patient filters their appointments by status
    @GetMapping("/patient/{patientId}/status/{status}")
    public ResponseEntity<List<Appointment>> getPatientAppointmentsByStatus(
            @PathVariable String patientId,
            @PathVariable Appointment.AppointmentStatus status) {
        return ResponseEntity.ok(
                appointmentService.getAppointmentsByPatientAndStatus(patientId, status)
        );
    }

    // NEW - payment service or admin checks which confirmed appointments are unpaid
    @GetMapping("/doctor/{doctorId}/unpaid")
    public ResponseEntity<List<Appointment>> getUnpaidConfirmedAppointments(
            @PathVariable String doctorId) {
        return ResponseEntity.ok(
                appointmentService.getUnpaidConfirmedAppointments(doctorId)
        );
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    // PATCH /api/v1/appointments/{id}/status
    // Doctor uses this to CONFIRM, REJECT, COMPLETE, or add notes
    @PatchMapping("/{id}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable String id,
            @RequestBody AppointmentStatusUpdate update) {
        return ResponseEntity.ok(
                appointmentService.updateAppointmentStatus(id, update)
        );
    }

    // PUT /api/v1/appointments/{id}
    // Patient modifies their appointment (date/time change)
    @PutMapping("/{id}")
    public ResponseEntity<Appointment> modifyAppointment(
            @PathVariable String id,
            @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.modifyAppointment(id, request));
    }

    // NEW - payment service calls this after payment is confirmed
    @PatchMapping("/{id}/payment")
    public ResponseEntity<Appointment> updatePaymentStatus(
            @PathVariable String id,
            @Valid @RequestBody PaymentStatusUpdate update) {
        return ResponseEntity.ok(appointmentService.updatePaymentStatus(id, update));
    }

    // ─── CANCEL ───────────────────────────────────────────────────────────────

    // DELETE /api/v1/appointments/{id}/cancel
    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancelAppointment(
            @PathVariable String id,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id, reason));
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    // Patient permanently removes a completed or cancelled appointment
    // from their history - requires patientId as security check
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCompletedAppointment(
            @PathVariable String id,
            @RequestParam String patientId) {
        appointmentService.deleteCompletedAppointment(id, patientId);
        return ResponseEntity.ok(
                Map.of(
                        "message", "Appointment deleted successfully",
                        "appointmentId", id
                )
        );
    }
}