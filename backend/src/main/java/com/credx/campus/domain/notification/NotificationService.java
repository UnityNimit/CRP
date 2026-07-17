package com.credx.campus.domain.notification;

import com.credx.campus.domain.user.Role;
import com.credx.campus.domain.user.User;
import com.credx.campus.domain.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void notifyUser(User user, String message) {
        Notification n = new Notification();
        n.setUser(user);
        n.setMessage(message);
        notificationRepository.save(n);
    }

    @Transactional
    public void notifyAdmins(String message) {
        userRepository.findByRole(Role.ADMIN).forEach(admin -> notifyUser(admin, message));
    }

    @Transactional
    public void markRead(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new com.credx.campus.common.ApiException(404, "Notification not found"));
        if (!n.getUser().getId().equals(userId)) {
            throw new com.credx.campus.common.ApiException(403, "Forbidden");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }
}
