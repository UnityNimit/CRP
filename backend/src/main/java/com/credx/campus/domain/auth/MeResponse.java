package com.credx.campus.domain.auth;

import com.credx.campus.domain.user.Role;

public record MeResponse(Long id, String email, Role role, String displayName, String profileName) {}
