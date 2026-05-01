package com.edoc.userservice.controller;

import com.edoc.userservice.payload.request.PatchUserRequest;
import com.edoc.userservice.payload.request.UpdateUserRequest;
import com.edoc.userservice.payload.response.UserResponse;
import com.edoc.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{userId}")
    @PreAuthorize("@userService.isOwner(#userId) or hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getByUserId(userId));
    }

    @PutMapping("/{userId}")
    @PreAuthorize("@userService.isOwner(#userId) or hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateByUserId(
            @PathVariable String userId,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(userService.updateByUserId(userId, request));
    }

    @PatchMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> patchCurrentUser(@Valid @RequestBody PatchUserRequest request) {
        return ResponseEntity.ok(userService.patchCurrentUser(request));
    }

    @PatchMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> patchByUserIdAsAdmin(
            @PathVariable String userId,
            @Valid @RequestBody PatchUserRequest request
    ) {
        return ResponseEntity.ok(userService.patchByUserIdAsAdmin(userId, request));
    }

    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteCurrentUser() {
        userService.deleteCurrentUser();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteByUserId(@PathVariable String userId) {
        userService.deleteByUserId(userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{userId}/profile-created")
    @PreAuthorize("@userService.isOwner(#userId) or hasRole('ADMIN')")
    public ResponseEntity<Void> markProfileCreated(@PathVariable String userId) {
        userService.markProfileCreated(userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{userId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> activateUser(@PathVariable String userId) {
        return ResponseEntity.ok(userService.activateUser(userId));
    }

    @PatchMapping("/{userId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable String userId) {
        return ResponseEntity.ok(userService.deactivateUser(userId));
    }

    @PatchMapping("/{userId}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> restoreUser(@PathVariable String userId) {
        return ResponseEntity.ok(userService.restoreUser(userId));
    }
}
