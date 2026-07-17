package com.credx.campus.domain.notification;

import java.time.Instant;

public record NotificationResponse(Long id, String message, boolean read, Instant createdAt) {}
