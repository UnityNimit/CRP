package com.credx.campus.domain.posting;

import com.credx.campus.common.ApiException;
import com.credx.campus.common.PageResponse;
import com.credx.campus.domain.student.StudentProfileRepository;
import com.credx.campus.security.AuthHelper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/student/postings")
@PreAuthorize("hasRole('STUDENT')")
public class StudentPostingController {

    private final PostingService postingService;
    private final StudentProfileRepository studentProfileRepository;
    private final AuthHelper authHelper;

    public StudentPostingController(PostingService postingService,
                                    StudentProfileRepository studentProfileRepository,
                                    AuthHelper authHelper) {
        this.postingService = postingService;
        this.studentProfileRepository = studentProfileRepository;
        this.authHelper = authHelper;
    }

    @GetMapping
    public PageResponse<PostingResponse> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return postingService.listStudentVisible(page, size);
    }

    @GetMapping("/{id}")
    public PostingResponse get(@PathVariable Long id) {
        return postingService.getStudentVisible(id);
    }

    @GetMapping("/{id}/eligibility")
    public Map<String, Object> eligibility(@PathVariable Long id) {
        PostingResponse posting = postingService.getStudentVisible(id);
        var student = studentProfileRepository.findByUserId(authHelper.currentUser().getId())
            .orElseThrow(() -> new ApiException(404, "Student profile not found"));

        int score = 0;
        List<String> reasons = new java.util.ArrayList<>();

        if (posting.minCgpa() != null && student.getCgpa().compareTo(posting.minCgpa()) >= 0) {
            score += 40;
            reasons.add("CGPA meets minimum requirement (" + posting.minCgpa() + ").");
        } else if (posting.minCgpa() != null) {
            reasons.add("CGPA below minimum (" + posting.minCgpa() + ").");
        } else {
            score += 40;
            reasons.add("No minimum CGPA specified.");
        }

        if (posting.allowedBranches() != null && posting.allowedBranches().stream()
            .anyMatch(b -> b.equalsIgnoreCase(student.getBranch()))) {
            score += 30;
            reasons.add("Branch \"" + student.getBranch() + "\" is eligible.");
        } else if (posting.allowedBranches() != null && !posting.allowedBranches().isEmpty()) {
            reasons.add("Branch \"" + student.getBranch() + "\" not in allowed list.");
        } else {
            score += 30;
            reasons.add("All branches eligible.");
        }

        if (posting.gradYear() != null && posting.gradYear().equals(student.getGradYear())) {
            score += 30;
            reasons.add("Graduation year matches.");
        } else if (posting.gradYear() != null) {
            reasons.add("Graduation year mismatch (required: " + posting.gradYear() + ").");
        } else {
            score += 30;
            reasons.add("No graduation year restriction.");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("fitScore", score);
        result.put("summary", score >= 70 ? "Strong match for this role." : score >= 40 ? "Partial match — review eligibility." : "Low match based on criteria.");
        result.put("reasons", reasons);
        return result;
    }
}
