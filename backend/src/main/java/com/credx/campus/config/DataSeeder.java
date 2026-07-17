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
        // Only seed if no admins exist in the database yet
        if (userRepository.countByRole(Role.ADMIN) == 0) {
            
            // Format: email:password:displayName
            List<String> admins = List.of(
                "admin-nimit@crp.com:X9K2mP7vR4:Nimit",
                "admin-sejal@crp.com:B5jW3qL8zT:Sejal",
                "admin-yash@crp.com:M2xF9cT4wN:Yash",
                "admin-shrey@crp.com:P7vR4xK9mB:Shrey",
                "admin-kartik@crp.com:L8zT5jW3qM:Kartik"
            );

            for (String adminData : admins) {
                String[] parts = adminData.split(":");
                User admin = new User();
                admin.setEmail(parts[0]);
                admin.setPasswordHash(passwordEncoder.encode(parts[1])); // Securely hash the 10-digit password
                admin.setRole(Role.ADMIN);
                admin.setDisplayName(parts[2]);
                userRepository.save(admin);
            }
            System.out.println("✅ 5 Super Admins Seeded Successfully.");
        }
    }
}