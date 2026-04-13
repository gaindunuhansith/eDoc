package com.edoc.doctorservice.dto;

import lombok.Data;
import java.util.List;

@Data
public class AvailabilityRequest {

    private String dayOfWeek;   // "MONDAY", "TUESDAY", etc.
    private List<SlotRequest> timeSlots;

    @Data
    public static class SlotRequest {
        private String startTime;   // "09:00"
        private String endTime;     // "09:30"
    }
}
