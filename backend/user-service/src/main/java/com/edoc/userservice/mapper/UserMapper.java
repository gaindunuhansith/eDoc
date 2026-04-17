package com.edoc.userservice.mapper;

import com.edoc.userservice.dto.UserResponse;
import com.edoc.userservice.model.User;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        Objects.requireNonNull(user, "user must not be null");

        return UserResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .isProfileCreated(user.isProfileCreated())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
