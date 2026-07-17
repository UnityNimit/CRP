package com.credx.campus.domain.auth;

import com.credx.campus.common.ApiException;
import com.credx.campus.domain.company.CompanyProfileRepository;
import com.credx.campus.domain.student.StudentProfileRepository;
import com.credx.campus.domain.user.User;
import com.credx.campus.security.JwtService;
import com.credx.campus.security.UserDetailsServiceImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

// NESTED DTO IMPORTS FROM AUTH CONTROLLER
import com.credx.campus.domain.auth.AuthController.LoginRequest;
import com.credx.campus.domain.auth.AuthController.LoginResponse;
import com.credx.campus.domain.auth.AuthController.MeResponse;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtService jwtService;
    private final CompanyProfileRepository companyProfileRepository;
    private final StudentProfileRepository studentProfileRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       UserDetailsServiceImpl userDetailsService,
                       JwtService jwtService,
                       CompanyProfileRepository companyProfileRepository,
                       StudentProfileRepository studentProfileRepository) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.companyProfileRepository = companyProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (AuthenticationException e) {
            throw new ApiException(401, "Invalid email or password");
        }
        User user = userDetailsService.loadEntityByEmail(request.email());
        String token = jwtService.generateToken(user.getId(), user.getRole());
        return new LoginResponse(token, user.getRole(), user.getDisplayName(), user.getId());
    }

    public MeResponse me(User user) {
        String profileName = switch (user.getRole()) {
            case COMPANY -> companyProfileRepository.findByUserId(user.getId()).map(c -> c.getName()).orElse(null);
            case STUDENT -> studentProfileRepository.findByUserId(user.getId()).map(s -> s.getBranch()).orElse(null);
            case ADMIN -> "Placement Cell";
        };
        return new MeResponse(user.getId(), user.getEmail(), user.getRole(), user.getDisplayName(), profileName);
    }
}