package com.credx.campus.domain.admin;

import com.credx.campus.common.ApiException;
import com.credx.campus.domain.company.CompanyProfile;
import com.credx.campus.domain.company.CompanyProfileRepository;
import com.credx.campus.domain.notification.NotificationService;
import com.credx.campus.domain.student.StudentProfile;
import com.credx.campus.domain.student.StudentProfileRepository;
import com.credx.campus.domain.user.Role;
import com.credx.campus.domain.user.User;
import com.credx.campus.domain.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminService {

    private final CompanyProfileRepository companyProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final SecureRandom random = new SecureRandom();

    public AdminService(CompanyProfileRepository companyProfileRepository,
                        StudentProfileRepository studentProfileRepository,
                        UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        NotificationService notificationService) {
        this.companyProfileRepository = companyProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    public Page<CompanyProfile> getPendingCompanies(Pageable pageable) {
        return companyProfileRepository.findByApprovedFalse(pageable);
    }

    @Transactional
    public void approveCompany(Long companyId) {
        CompanyProfile company = companyProfileRepository.findById(companyId)
            .orElseThrow(() -> new ApiException(404, "Company not found"));
        
        company.setApproved(true);
        companyProfileRepository.save(company);
        
        notificationService.notifyUser(company.getUser(), 
            "Your company account has been approved by the Placement Cell. You can now log in and post roles.");
    }

    @Transactional
    public void rejectCompany(Long companyId) {
        CompanyProfile company = companyProfileRepository.findById(companyId)
            .orElseThrow(() -> new ApiException(404, "Company not found"));
        
        // Hard delete the rejected application to keep the DB clean
        companyProfileRepository.delete(company);
        userRepository.delete(company.getUser());
    }

    @Transactional
    public List<StudentUploadResult> bulkUploadStudents(MultipartFile file) {
        List<StudentUploadResult> results = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isFirstRow = true;
            
            // Expected CSV format: Email, FullName, Branch, CGPA, GradYear, FathersName, Attendance, ActiveBacklogs
            while ((line = reader.readLine()) != null) {
                if (isFirstRow) { isFirstRow = false; continue; } // Skip header
                
                String[] data = line.split(",");
                if (data.length < 8) continue; // Skip invalid rows
                
                String email = data[0].trim();
                
                // Skip if student already exists
                if (userRepository.findByEmail(email).isPresent()) {
                    results.add(new StudentUploadResult(email, "SKIPPED (Already exists)", "N/A"));
                    continue;
                }

                String rawPassword = generateRandomPassword();
                
                User user = new User();
                user.setEmail(email);
                user.setPasswordHash(passwordEncoder.encode(rawPassword));
                user.setRole(Role.STUDENT);
                user.setDisplayName(data[1].trim());
                user = userRepository.save(user);

                StudentProfile profile = new StudentProfile();
                profile.setUser(user);
                profile.setBranch(data[2].trim());
                profile.setCgpa(new BigDecimal(data[3].trim()));
                profile.setGradYear(Integer.parseInt(data[4].trim()));
                profile.setFathersName(data[5].trim());
                profile.setAttendance(new BigDecimal(data[6].trim()));
                profile.setActiveBacklogs(Integer.parseInt(data[7].trim()));
                studentProfileRepository.save(profile);

                results.add(new StudentUploadResult(email, "CREATED", rawPassword));
            }
        } catch (Exception e) {
            throw new ApiException(400, "Failed to parse CSV. Ensure correct format.");
        }
        return results;
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder(10);
        for (int i = 0; i < 10; i++) sb.append(chars.charAt(random.nextInt(chars.length())));
        return sb.toString();
    }

    public record StudentUploadResult(String email, String status, String generatedPassword) {}
}