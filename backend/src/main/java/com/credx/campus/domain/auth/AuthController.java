package com.credx.campus.domain.auth;

import com.credx.campus.domain.user.User;
import com.credx.campus.domain.user.Role;
import com.credx.campus.security.AuthHelper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthHelper authHelper;

    public AuthController(AuthService authService, AuthHelper authHelper) {
        this.authService = authService;
        this.authHelper = authHelper;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public MeResponse me() {
        User user = authHelper.currentUser();
        return authService.me(user);
    }

    // ==========================================
    // FLATTENED AUTH RECORDS
    // ==========================================

    public record LoginRequest(
        @NotBlank 
        @Email 
        String email,
        
        @NotBlank 
        String password
    ) {}

    public record LoginResponse(
        String token, 
        Role role, 
        String displayName, 
        Long userId
    ) {}

    public record MeResponse(
        Long id, 
        String email, 
        Role role, 
        String displayName, 
        String profileName
    ) {}
}