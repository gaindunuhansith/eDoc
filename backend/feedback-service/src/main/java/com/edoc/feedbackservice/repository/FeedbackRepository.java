package com.edoc.feedbackservice.repository;

import com.edoc.feedbackservice.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByDoctorId(Long doctorId);

    List<Feedback> findByPatientId(Long patientId);

    List<Feedback> findByAppointmentId(Long appointmentId);
}