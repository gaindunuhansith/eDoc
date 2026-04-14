package com.edoc.telemedicineservice.repository;

import com.edoc.telemedicineservice.model.VideoSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VideoSessionRepository extends JpaRepository<VideoSession, UUID> {
    Optional<VideoSession> findByAppointmentId(String appointmentId);
}
