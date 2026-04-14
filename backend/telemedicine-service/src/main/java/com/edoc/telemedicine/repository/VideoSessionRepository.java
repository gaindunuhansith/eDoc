package com.edoc.telemedicine.repository;

import com.edoc.telemedicine.entity.VideoSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VideoSessionRepository extends JpaRepository<VideoSession, UUID> {
    Optional<VideoSession> findByAppointmentId(String appointmentId);
}
