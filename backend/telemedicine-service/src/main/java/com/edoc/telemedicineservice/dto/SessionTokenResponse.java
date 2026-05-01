package com.edoc.telemedicineservice.dto;

import java.time.LocalDateTime;

public record SessionTokenResponse(
        String token,
        String roomName,
        LocalDateTime expiresAt
) {
}
