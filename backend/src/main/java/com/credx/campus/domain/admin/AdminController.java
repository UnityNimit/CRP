package com.credx.campus.domain.admin;

import com.credx.campus.common.PageResponse;
import com.credx.campus.domain.company.CompanyProfile;
import com.credx.campus.domain.student.StudentProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // FIX: Now fetches ALL companies, not just pending ones
    @GetMapping("/companies")
    public PageResponse<CompanyResponse> getAllCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        Page<CompanyProfile> result = adminService.getAllCompanies(PageRequest.of(page, size));
        List<CompanyResponse> content = result.getContent().stream()
            .map(c -> new CompanyResponse(c.getId(), c.getName(), c.getUser().getDisplayName(), c.getUser().getEmail(), c.getWebsite(), c.isApproved()))
            .toList();
            
        return new PageResponse<>(content, result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @PostMapping("/companies/{id}/approve")
    public void approveCompany(@PathVariable Long id) {
        adminService.approveCompany(id);
    }

    @PostMapping("/companies/{id}/reject")
    public void rejectCompany(@PathVariable Long id) {
        adminService.rejectCompany(id);
    }

    @PostMapping("/students/upload")
    public List<AdminService.StudentUploadResult> uploadStudents(@RequestParam("file") MultipartFile file) {
        return adminService.bulkUploadStudents(file);
    }

    @GetMapping("/students")
    public PageResponse<StudentResponse> getStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        Page<StudentProfile> result = adminService.getAllStudents(PageRequest.of(page, size, Sort.by("user.displayName").ascending()));
        List<StudentResponse> content = result.getContent().stream()
            .map(s -> new StudentResponse(s.getId(), s.getUser().getDisplayName(), s.getUser().getEmail(), s.getBranch(), s.getCgpa(), s.getGradYear(), s.getAttendance(), s.getActiveBacklogs()))
            .toList();
            
        return new PageResponse<>(content, result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    // FIX: Added 'approved' boolean to record
    public record CompanyResponse(Long id, String name, String hrName, String email, String website, boolean approved) {}
    public record StudentResponse(Long id, String name, String email, String branch, BigDecimal cgpa, Integer gradYear, BigDecimal attendance, Integer activeBacklogs) {}
}