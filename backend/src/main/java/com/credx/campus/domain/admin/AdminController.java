package com.credx.campus.domain.admin;

import com.credx.campus.common.PageResponse;
import com.credx.campus.domain.company.CompanyProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/companies/pending")
    public PageResponse<CompanyResponse> getPendingCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<CompanyProfile> result = adminService.getPendingCompanies(PageRequest.of(page, size));
        List<CompanyResponse> content = result.getContent().stream()
            .map(c -> new CompanyResponse(c.getId(), c.getName(), c.getUser().getDisplayName(), c.getUser().getEmail(), c.getWebsite()))
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

    public record CompanyResponse(Long id, String name, String hrName, String email, String website) {}
}