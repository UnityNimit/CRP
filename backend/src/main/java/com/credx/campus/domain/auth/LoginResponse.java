package com.credx.campus.domain.auth;

import com.credx.campus.domain.user.Role;

public record LoginResponse(String token, Role role, String displayName, Long userId) {}
