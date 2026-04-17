package com.edoc.userservice.dto;

import com.edoc.userservice.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private String userId;
    private String name;
    private String email;
    private String phoneNumber;
    private UserRole role;
    private boolean isProfileCreated;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
