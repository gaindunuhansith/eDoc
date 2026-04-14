package com.edoc.userservice.controller;

import com.edoc.userservice.dto.PatchUserRequest;
import com.edoc.userservice.dto.UserResponse;
import com.edoc.userservice.service.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final IUserService userService;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/users/{userId}")
    public ResponseEntity<UserResponse> patchByUserId(
            @PathVariable String userId,
            @Valid @RequestBody PatchUserRequest request
    ) {
        return ResponseEntity.ok(userService.patchByUserIdAsAdmin(userId, request));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteByUserId(@PathVariable String userId) {
        userService.deleteByUserId(userId);
        return ResponseEntity.noContent().build();
    }
}
