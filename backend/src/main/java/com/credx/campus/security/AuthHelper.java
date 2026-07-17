package com.credx.campus.security;

import com.credx.campus.domain.user.User;
import com.credx.campus.domain.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthHelper {

    private final UserRepository userRepository;

    public AuthHelper(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new com.credx.campus.common.ApiException(401, "Unauthorized");
        }
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        return userRepository.findById(userId)
            .orElseThrow(() -> new com.credx.campus.common.ApiException(401, "Unauthorized"));
    }
}
