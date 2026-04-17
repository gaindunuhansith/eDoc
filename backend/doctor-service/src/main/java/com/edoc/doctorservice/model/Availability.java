package com.edoc.doctorservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "availabilities")
public class Availability {

    @Id
    private String id;

    private String doctorId;       // Links to Doctor's ID

    // Day of week: "MONDAY", "TUESDAY", etc.
    private String dayOfWeek;

    // List of time slots available on that day
    // Each slot is like "09:00-09:30", "09:30-10:00"
    private List<TimeSlot> timeSlots;

    @JsonProperty("isActive")
    private boolean isActive;      // Can be turned on/off by the doctor

    // Inner class for time slots
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSlot {
        private String startTime;   // "09:00"
        private String endTime;     // "09:30"
        @JsonProperty("isBooked")
        private boolean isBooked;   // Will be set to true when appointment is made
    }
}
