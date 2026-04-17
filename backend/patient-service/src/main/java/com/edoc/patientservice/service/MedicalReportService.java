package com.edoc.patientservice.service;

import com.edoc.patientservice.dto.report.MedicalReportRequestDTO;
import com.edoc.patientservice.dto.report.MedicalReportResponseDTO;
import com.edoc.patientservice.entity.MedicalReport;
import com.edoc.patientservice.entity.Patient;
import com.edoc.patientservice.entity.PatientStatus;
import com.edoc.patientservice.mapper.MedicalReportMapper;
import com.edoc.patientservice.repository.MedicalReportRepository;
import com.edoc.patientservice.repository.PatientRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class MedicalReportService {

    private final MedicalReportRepository medicalReportRepository;
    private final PatientRepository patientRepository;
    private final MedicalReportMapper medicalReportMapper;
    private final Path reportsRoot;

    public MedicalReportService(MedicalReportRepository medicalReportRepository,
                                PatientRepository patientRepository,
                                MedicalReportMapper medicalReportMapper,
                                @Value("${app.storage.reports-dir:uploads/reports}") String reportsDir) {
        this.medicalReportRepository = medicalReportRepository;
        this.patientRepository = patientRepository;
        this.medicalReportMapper = medicalReportMapper;
        this.reportsRoot = Paths.get(reportsDir).toAbsolutePath().normalize();
    }

    public MedicalReportResponseDTO uploadReport(String userId,
                                                 MultipartFile file,
                                                 MedicalReportRequestDTO request) {
        // Validate input before touching the filesystem.
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Report file is required.");
        }

        Patient patient = findPatientByUserIdOrThrow(userId);
        assertPatientActiveForWrite(patient);
        String storedPath = storeReportFile(file);

        MedicalReport report = new MedicalReport();
        report.setPatient(patient);
        report.setReportName(resolveReportName(file, request));
        report.setReportUrl(storedPath);
        if (request != null) {
            report.setNotes(request.getNotes());
            report.setReportType(request.getReportType());
            report.setDoctorId(request.getDoctorId());
            report.setAppointmentId(request.getAppointmentId());
        }
        report.setCreatedAt(Instant.now());

        return medicalReportMapper.toResponse(medicalReportRepository.save(report));
    }

    @Transactional(readOnly = true)
    public List<MedicalReportResponseDTO> getReportsForPatient(String userId) {
        // Ensure the patient exists before returning their reports.
        Patient patient = findPatientByUserIdOrThrow(userId);
        return medicalReportRepository.findByPatientId(patient.getId()).stream()
                .map(medicalReportMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MedicalReportResponseDTO getReportForPatient(String userId, Long reportId) {
        // Ensure the report belongs to the requested patient.
        Patient patient = findPatientByUserIdOrThrow(userId);
        MedicalReport report = findReportOrThrow(reportId);
        if (!report.getPatient().getId().equals(patient.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found");
        }
        return medicalReportMapper.toResponse(report);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Resource> getReportFileForPatient(String userId, Long reportId) {
        // Verify access and return the stored report file.
        Patient patient = findPatientByUserIdOrThrow(userId);
        MedicalReport report = findReportOrThrow(reportId);
        if (!report.getPatient().getId().equals(patient.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found");
        }
        return buildFileResponse(report);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Resource> getReportFileInternal(Long patientId, Long reportId) {
        // Internal endpoint uses patientId ownership checks before exposing file bytes.
        MedicalReport report = findReportOrThrow(reportId);
        if (!report.getPatient().getId().equals(patientId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found");
        }
        return buildFileResponse(report);
    }

    private ResponseEntity<Resource> buildFileResponse(MedicalReport report) {
        if (report.getReportUrl() == null || report.getReportUrl().isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Report file missing");
        }

        try {
            Path filePath = Paths.get(report.getReportUrl()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Report file missing");
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null || contentType.isBlank()) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            String filename = filePath.getFileName().toString();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read report file", ex);
        }
    }

    @Transactional(readOnly = true)
    public List<MedicalReportResponseDTO> getReportsForPatientInternal(Long patientId) {
        // Internal endpoint for staff services to list reports.
        findPatientOrThrow(patientId);
        return medicalReportRepository.findByPatientId(patientId).stream()
                .map(medicalReportMapper::toResponse)
                .collect(Collectors.toList());
    }

    private Patient findPatientOrThrow(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
    }

    private Patient findPatientByUserIdOrThrow(String userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
    }

    private void assertPatientActiveForWrite(Patient patient) {
        if (patient.getStatus() != PatientStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Patient is inactive");
        }
    }

    private MedicalReport findReportOrThrow(Long reportId) {
        return medicalReportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));
    }

    private String resolveReportName(MultipartFile file, MedicalReportRequestDTO request) {
        if (request != null && request.getReportName() != null && !request.getReportName().isBlank()) {
            return request.getReportName();
        }
        return file.getOriginalFilename();
    }

    private String storeReportFile(MultipartFile file) {
        try {
            Files.createDirectories(reportsRoot);
            String originalName = file.getOriginalFilename();
            String safeName = originalName == null ? "report" : originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
            String fileName = UUID.randomUUID() + "-" + safeName;
            Path target = reportsRoot.resolve(fileName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return target.toString();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store report file", ex);
        }
    }
}
