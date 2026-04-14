package com.edoc.appointmentservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j  // Lombok: gives us a log object to print messages
public class DoctorServiceClient {

    // Reads doctor.service.url from application.properties
    @Value("${doctor.service.url}")
    private String doctorServiceUrl;

    private final WebClient.Builder webClientBuilder;

    // Get doctor details by ID from doctor-service
    // Returns a Map because we don't want to duplicate the Doctor model here
    public Map getDoctorById(String doctorId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(doctorServiceUrl + "/api/doctors/" + doctorId)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(); // block() makes it synchronous - simpler for now
        } catch (Exception e) {
            log.error("Error fetching doctor with id: {}", doctorId, e);
            throw new RuntimeException("Could not fetch doctor details. Doctor service may be down.");
        }
    }

    // Tell doctor-service to mark a slot as booked
    public void markSlotAsBooked(String doctorId, String dayOfWeek, String startTime) {
        try {
            webClientBuilder.build()
                    .patch()
                    .uri(doctorServiceUrl + "/api/doctors/" + doctorId
                            + "/availability/book"
                            + "?dayOfWeek=" + dayOfWeek
                            + "&startTime=" + startTime)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception e) {
            log.error("Error marking slot as booked for doctor: {}", doctorId, e);
            throw new RuntimeException("Could not update doctor availability.");
        }
    }

    // Tell doctor-service to free up a slot (when appointment is cancelled)
    public void markSlotAsFree(String doctorId, String dayOfWeek, String startTime) {
        try {
            webClientBuilder.build()
                    .patch()
                    .uri(doctorServiceUrl + "/api/doctors/" + doctorId
                            + "/availability/free"
                            + "?dayOfWeek=" + dayOfWeek
                            + "&startTime=" + startTime)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception e) {
            log.error("Error freeing slot for doctor: {}", doctorId, e);
            throw new RuntimeException("Could not update doctor availability.");
        }
    }
}
