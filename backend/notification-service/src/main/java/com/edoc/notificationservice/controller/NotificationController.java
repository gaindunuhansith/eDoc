package com.edoc.notificationservice.controller;

import com.edoc.notificationservice.dto.NotificationRequestDTO;
import com.edoc.notificationservice.dto.NotificationResponse;
import com.edoc.notificationservice.dto.UserNotificationResponseDTO;
import com.edoc.notificationservice.service.NotificationService;
import com.edoc.notificationservice.service.UserNotificationService;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserNotificationService userNotificationService;

    public NotificationController(NotificationService notificationService,
                                  UserNotificationService userNotificationService) {
        this.notificationService = notificationService;
        this.userNotificationService = userNotificationService;
    }

    @PostMapping("/send")
    // Unified notification endpoint used by other services (appointment/payment/etc.).
    public ResponseEntity<NotificationResponse> send(@RequestBody NotificationRequestDTO request) {
        NotificationResponse response = notificationService.send(request);
        if ("FAILED".equals(response.status())) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping
    // Return all inbox notifications for the authenticated user.
    public List<UserNotificationResponseDTO> getMyNotifications() {
        return userNotificationService.getAll(getCurrentUserId());
    }

    @GetMapping("/unread-count")
    // Return the unread notification count for the authenticated user.
    public Map<String, Long> getUnreadCount() {
        return Map.of("count", userNotificationService.getUnreadCount(getCurrentUserId()));
    }

    @PatchMapping("/{id}/read")
    // Mark a single notification as read.
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        userNotificationService.markRead(id, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    // Mark all notifications as read for the authenticated user.
    public ResponseEntity<Void> markAllRead() {
        userNotificationService.markAllRead(getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    // Delete a notification owned by the authenticated user.
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userNotificationService.delete(id, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Jwt jwt)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        Object uid = jwt.getClaim("uid");
        if (uid == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User identity missing");
        }
        return uid.toString();
    }
}
