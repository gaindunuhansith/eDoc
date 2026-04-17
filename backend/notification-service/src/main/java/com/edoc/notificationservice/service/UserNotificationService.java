package com.edoc.notificationservice.service;

import com.edoc.notificationservice.dto.UserNotificationResponseDTO;
import com.edoc.notificationservice.model.UserNotification;
import com.edoc.notificationservice.repository.UserNotificationRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class UserNotificationService {

    private final UserNotificationRepository repository;

    public UserNotificationService(UserNotificationRepository repository) {
        this.repository = repository;
    }

    public void create(String userId, String type, String title, String message) {
        UserNotification n = new UserNotification();
        n.setUserId(userId);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setRead(false);
        repository.save(n);
    }

    @Transactional(readOnly = true)
    public List<UserNotificationResponseDTO> getAll(String userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userId) {
        return repository.countByUserIdAndReadFalse(userId);
    }

    public void markRead(Long notificationId, String userId) {
        UserNotification n = repository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        n.setRead(true);
        repository.save(n);
    }

    public void markAllRead(String userId) {
        repository.markAllReadByUserId(userId);
    }

    public void delete(Long notificationId, String userId) {
        UserNotification n = repository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        repository.delete(n);
    }

    private UserNotificationResponseDTO toDTO(UserNotification n) {
        return new UserNotificationResponseDTO(
                n.getId(),
                n.getUserId(),
                n.getType(),
                n.getTitle(),
                n.getMessage(),
                n.isRead(),
                n.getCreatedAt().toString()
        );
    }
}
