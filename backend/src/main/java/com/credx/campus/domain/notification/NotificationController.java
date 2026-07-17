package com.credx.campus.domain.notification;

import com.credx.campus.common.PageResponse;
import com.credx.campus.security.AuthHelper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final AuthHelper authHelper;

    public NotificationController(NotificationRepository notificationRepository,
                                  NotificationService notificationService,
                                  AuthHelper authHelper) {
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
        this.authHelper = authHelper;
    }

    @GetMapping
    public PageResponse<NotificationResponse> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = authHelper.currentUser().getId();
        Page<Notification> result = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
        var content = result.getContent().stream()
            .map(n -> new NotificationResponse(n.getId(), n.getMessage(), n.isRead(), n.getCreatedAt()))
            .toList();
        return new PageResponse<>(content, result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @PatchMapping("/{id}/read")
    public void markRead(@PathVariable Long id) {
        notificationService.markRead(id, authHelper.currentUser().getId());
    }
}
