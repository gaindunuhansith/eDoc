package com.edoc.notificationservice.repository;

import com.edoc.notificationservice.model.NotificationLog;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

// Persistence for notification audit logs.
public interface NotificationLogRepository extends JpaRepository<NotificationLog, UUID> {
}
