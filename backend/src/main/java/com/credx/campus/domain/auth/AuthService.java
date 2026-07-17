package com.credx.campus.domain.auth;

import com.credx.campus.common.ApiException;
import com.credx.campus.domain.company.CompanyProfile;
import com.credx.campus.domain.company.CompanyProfileRepository;
import com.credx.campus.domain.student.StudentProfileRepository;
import com.credx.campus.domain.user.Role;
import com.credx.campus.domain.user.User;
import com.credx.campus.domain.user.UserRepository;
import com.credx.campus.security.JwtService;
import com.credx.campus.security.UserDetailsServiceImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// NESTED DTO IMPORTS FROM AUTH CONTROLLER
import com.credx.campus.domain.auth.AuthController.LoginRequest;
import com.credx.campus.domain.auth.AuthController.LoginResponse;
import com.credx.campus.domain.auth.AuthController.MeResponse;
import com.credx.campus.domain.auth.AuthController.RegisterCompanyRequest;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtService jwtService;
    private final CompanyProfileRepository companyProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager,
                       UserDetailsServiceImpl userDetailsService,
                       JwtService jwtService,
                       CompanyProfileRepository companyProfileRepository,
                       StudentProfileRepository studentProfileRepository,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.companyProfileRepository = companyProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void registerCompany(RegisterCompanyRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ApiException(400, "Email already in use");
        }
        
        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.COMPANY);
        user.setDisplayName(request.hrName());
        user = userRepository.save(user);

        CompanyProfile profile = new CompanyProfile();
        profile.setUser(user);
        profile.setName(request.companyName());
        profile.setWebsite(request.website());
        profile.setApproved(false); // REQUIRES ADMIN APPROVAL
        companyProfileRepository.save(profile);
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
        
        // --- REAL-WORLD SECURITY CHECK: BLOCK UNAPPROVED COMPANIES ---
        if (user.getRole() == Role.COMPANY) {
            CompanyProfile cp = companyProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException(404, "Company profile missing"));
            if (!cp.isApproved()) {
                throw new ApiException(403, "Account pending admin approval. We will notify you once verified.");
            }
        }

        String token = jwtService.generateToken(user.getId(), user.getRole());
        return new LoginResponse(token, user.getRole(), user.getDisplayName(), user.getId());
    }

    public MeResponse me(User user) {
        String profileName = switch (user.getRole()) {
            case COMPANY -> companyProfileRepository.findByUserId(user.getId()).map(CompanyProfile::getName).orElse(null);
            case STUDENT -> studentProfileRepository.findByUserId(user.getId()).map(s -> s.getBranch()).orElse(null);
            case ADMIN -> "Placement Cell";
        };
        return new MeResponse(user.getId(), user.getEmail(), user.getRole(), user.getDisplayName(), profileName);
    }
}