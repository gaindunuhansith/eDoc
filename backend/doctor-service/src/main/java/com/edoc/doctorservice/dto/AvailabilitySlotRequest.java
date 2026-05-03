package com.edoc.doctorservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AvailabilitySlotRequest {

    @NotBlank(message = "Day of week is required")
    private String dayOfWeek;

    @NotBlank(message = "Start time is required")
    private String startTime;
}