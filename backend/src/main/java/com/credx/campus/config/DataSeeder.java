package com.credx.campus.config;

import com.credx.campus.domain.user.Role;
import com.credx.campus.domain.user.User;
import com.credx.campus.domain.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        List<String> teamAdmins = List.of(
            "admin-nimit@crp.com:X9K2mP7vR4:Nimit",
            "admin-sejal@crp.com:B5jW3qL8zT:Sejal",
            "admin-yash@crp.com:M2xF9cT4wN:Yash",
            "admin-shrey@crp.com:P7vR4xK9mB:Shrey",
            "admin-kartik@crp.com:L8zT5jW3qM:Kartik"
        );

        for (String adminData : teamAdmins) {
            String[] parts = adminData.split(":");
            String email = parts[0];
            if (userRepository.findByEmail(email).isEmpty()) {
                User admin = new User();
                admin.setEmail(email);
                admin.setPasswordHash(passwordEncoder.encode(parts[1]));
                admin.setRole(Role.ADMIN);
                admin.setDisplayName(parts[2]);
                userRepository.save(admin);
            }
        }
    }
}