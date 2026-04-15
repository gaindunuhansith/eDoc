package com.edoc.notificationservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.edoc.notificationservice.model.NotificationLog;

// Persistence for notification audit logs.
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
}
