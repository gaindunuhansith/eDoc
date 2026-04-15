package com.edoc.userservice.dto;

import com.edoc.userservice.model.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatchUserRequest {

    private String name;

    @Email(message = "email must be valid")
    private String email;

    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
            message = "password must be at least 8 characters and contain at least one letter and one number"
    )
    private String password;

    private String phoneNumber;

    private UserRole role;
}
