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

    public Page<CompanyProfile> getAllCompanies(Pageable pageable) {
        return companyProfileRepository.findAll(pageable);
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
        
        companyProfileRepository.delete(company);
        userRepository.delete(company.getUser());
    }

    @Transactional
    public List<StudentUploadResult> bulkUploadStudents(MultipartFile file) {
        List<StudentUploadResult> results = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isFirstRow = true;
            int rowNum = 0;
            
            while ((line = reader.readLine()) != null) {
                rowNum++;
                
                // Skip the header row
                if (isFirstRow) { isFirstRow = false; continue; } 
                
                // Bulletproof: Skip empty lines often added by Excel at the bottom of CSVs
                if (line.trim().isEmpty() || line.trim().equals(",,,,,,,,")) {
                    continue; 
                }
                
                String[] rawData = line.split(",");
                if (rawData.length < 8) {
                    throw new ApiException(400, "Row " + rowNum + " is missing columns. Expected 8, found " + rawData.length + ". Data: " + line);
                }
                
                // Bulletproof: Clean invisible quotes and extra spaces from Excel
                String[] data = new String[rawData.length];
                for (int i = 0; i < rawData.length; i++) {
                    data[i] = rawData[i].replace("\"", "").trim();
                }
                
                String email = data[0];
                
                if (userRepository.findByEmail(email).isPresent()) {
                    results.add(new StudentUploadResult(email, "SKIPPED (Already exists)", "N/A"));
                    continue;
                }

                String rawPassword = generateRandomPassword();
                
                try {
                    User user = new User();
                    user.setEmail(email);
                    user.setPasswordHash(passwordEncoder.encode(rawPassword));
                    user.setRole(Role.STUDENT);
                    user.setDisplayName(data[1]);
                    user = userRepository.save(user);

                    StudentProfile profile = new StudentProfile();
                    profile.setUser(user);
                    profile.setBranch(data[2]);
                    profile.setCgpa(new BigDecimal(data[3]));
                    profile.setGradYear(Integer.parseInt(data[4]));
                    profile.setFathersName(data[5]);
                    profile.setAttendance(new BigDecimal(data[6]));
                    profile.setActiveBacklogs(Integer.parseInt(data[7]));
                    studentProfileRepository.save(profile);

                    results.add(new StudentUploadResult(email, "CREATED", rawPassword));
                } catch (NumberFormatException nfe) {
                    // This will tell you EXACTLY which row and which number broke the math parser!
                    throw new ApiException(400, "Math Error on Row " + rowNum + " for email '" + email + "'. Ensure CGPA, GradYear, Attendance, and Backlogs contain ONLY numbers, no letters or spaces.");
                }
            }
        } catch (ApiException e) {
            throw e; // Pass our specific error message straight to the frontend
        } catch (Exception e) {
            e.printStackTrace();
            throw new ApiException(400, "Corrupt file format. Please ensure you clicked 'File > Download > Comma Separated Values (.csv)'.");
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

    public Page<StudentProfile> getAllStudents(Pageable pageable) {
        return studentProfileRepository.findAll(pageable);
    }
}