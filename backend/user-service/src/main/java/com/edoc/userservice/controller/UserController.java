package com.edoc.userservice.controller;

import com.edoc.userservice.dto.PatchUserRequest;
import com.edoc.userservice.dto.UpdateUserRequest;
import com.edoc.userservice.dto.UserResponse;
import com.edoc.userservice.service.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getByUserId(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> updateByUserId(
            @PathVariable String userId,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(userService.updateByUserId(userId, request));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> patchCurrentUser(@Valid @RequestBody PatchUserRequest request) {
        return ResponseEntity.ok(userService.patchCurrentUser(request));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteCurrentUser() {
        userService.deleteCurrentUser();
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{userId}/profile-created")
    public ResponseEntity<Void> markProfileCreated(@PathVariable String userId) {
        userService.markProfileCreated(userId);
        return ResponseEntity.noContent().build();
    }
}
