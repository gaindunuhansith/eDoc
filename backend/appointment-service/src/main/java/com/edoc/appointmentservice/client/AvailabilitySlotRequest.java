package com.edoc.appointmentservice.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilitySlotRequest {

    private String dayOfWeek;
    private String startTime;
}