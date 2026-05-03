package com.edoc.appointmentservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CancelRequest {

    @NotBlank(message = "Cancellation reason must be provided")
    private String reason;
}
