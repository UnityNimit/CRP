package com.credx.campus.domain.posting;

import com.credx.campus.common.ApiException;
import com.credx.campus.domain.application.Application.ApplicationStatus;
import com.credx.campus.domain.application.ApplicationRepository;
import com.credx.campus.domain.company.CompanyProfile;
import com.credx.campus.domain.company.CompanyProfileRepository;
import com.credx.campus.domain.notification.NotificationService;
import com.credx.campus.domain.posting.JobPosting.PostingStatus;
import com.credx.campus.domain.posting.JobPostingController.CreatePostingRequest;
import com.credx.campus.domain.posting.JobPostingController.EligibilityResponse;
import com.credx.campus.domain.posting.JobPostingController.PostingResponse;
import com.credx.campus.domain.student.StudentProfile;
import com.credx.campus.domain.student.StudentProfileRepository;
import com.credx.campus.security.AuthHelper;
import com.credx.campus.domain.user.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class PostingService {

    private final JobPostingRepository postingRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final AuthHelper authHelper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PostingService(JobPostingRepository postingRepository,
                          CompanyProfileRepository companyProfileRepository,
                          StudentProfileRepository studentProfileRepository,
                          ApplicationRepository applicationRepository,
                          NotificationService notificationService,
                          AuthHelper authHelper) {
        this.postingRepository = postingRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.applicationRepository = applicationRepository;
        this.notificationService = notificationService;
        this.authHelper = authHelper;
    }

    public PostingResponse getPostingById(Long id) {
        JobPosting posting = postingRepository.findById(id).orElseThrow(() -> new ApiException(404, "Posting not found"));
        return toResponse(posting, getAppCount(posting.getId()));
    }

    // --- STRICT MATHEMATICAL ELIGIBILITY ENGINE ---
    public EligibilityResponse checkEligibility(Long postingId) {
        User studentUser = authHelper.currentUser();
        StudentProfile student = studentProfileRepository.findByUserId(studentUser.getId())
            .orElseThrow(() -> new ApiException(404, "Student profile not found"));
            
        JobPosting posting = postingRepository.findById(postingId)
            .orElseThrow(() -> new ApiException(404, "Posting not found"));

        boolean isEligible = true;
        List<String> checks = new ArrayList<>();

        // RULE 1: Anti-Hoarding Placement Policy
        if (applicationRepository.existsByStudentIdAndStatus(student.getId(), ApplicationStatus.SELECTED)) {
            checks.add("❌ PLACEMENT POLICY: You are already placed. You cannot apply to further roles.");
            isEligible = false;
        } else {
            checks.add("✅ PLACEMENT POLICY: Eligible (Unplaced)");
        }

        // RULE 2: CGPA
        if (posting.getMinCgpa() != null) {
            if (student.getCgpa().compareTo(posting.getMinCgpa()) >= 0) {
                checks.add("✅ CGPA: " + student.getCgpa() + " (Min required: " + posting.getMinCgpa() + ")");
            } else {
                checks.add("❌ CGPA: " + student.getCgpa() + " is below minimum " + posting.getMinCgpa());
                isEligible = false;
            }
        }

        // RULE 3: Branch
        List<String> allowedBranches = parseBranches(posting.getAllowedBranches());
        if (!allowedBranches.isEmpty()) {
            if (allowedBranches.contains(student.getBranch())) {
                checks.add("✅ BRANCH: " + student.getBranch() + " is allowed.");
            } else {
                checks.add("❌ BRANCH: " + student.getBranch() + " is not eligible for this role.");
                isEligible = false;
            }
        }

        // RULE 4: Grad Year
        if (posting.getGradYear() != null) {
            if (posting.getGradYear().equals(student.getGradYear())) {
                checks.add("✅ BATCH: Class of " + student.getGradYear());
            } else {
                checks.add("❌ BATCH: You are " + student.getGradYear() + ". Role requires " + posting.getGradYear());
                isEligible = false;
            }
        }

        // RULE 5: Active Backlogs (Zero Tolerance)
        if (student.getActiveBacklogs() != null && student.getActiveBacklogs() > 0) {
            checks.add("❌ BACKLOGS: You have " + student.getActiveBacklogs() + " active backlog(s). Must be 0.");
            isEligible = false;
        } else {
            checks.add("✅ BACKLOGS: 0 Active");
        }

        return new EligibilityResponse(isEligible, checks);
    }

    @Transactional
    public PostingResponse closePosting(Long postingId) {
        User companyUser = authHelper.currentUser();
        CompanyProfile company = companyProfileRepository.findByUserId(companyUser.getId())
            .orElseThrow(() -> new ApiException(404, "Company profile not found"));
            
        JobPosting posting = postingRepository.findById(postingId)
            .orElseThrow(() -> new ApiException(404, "Posting not found"));
            
        if (!posting.getCompany().getId().equals(company.getId())) {
            throw new ApiException(403, "You can only close your own postings.");
        }
        
        posting.setStatus(PostingStatus.CLOSED);
        return toResponse(postingRepository.save(posting), getAppCount(posting.getId()));
    }

    // --- EXISTING METHODS (No changes required below this line, just paste them) ---
    @Transactional
    public PostingResponse create(CreatePostingRequest request) {
        CompanyProfile company = companyProfileRepository.findByUserId(authHelper.currentUser().getId()).orElseThrow();
        JobPosting posting = new JobPosting();
        posting.setCompany(company);
        posting.setTitle(request.title());
        posting.setDescription(request.description());
        posting.setMinCgpa(request.minCgpa());
        posting.setAllowedBranches(toJson(request.allowedBranches()));
        posting.setGradYear(request.gradYear());
        posting.setDeadline(request.deadline());
        posting.setStatus(PostingStatus.PENDING);
        return toResponse(postingRepository.save(posting), 0);
    }
    public Page<PostingResponse> listCompanyPostings(int page, int size) {
        CompanyProfile company = companyProfileRepository.findByUserId(authHelper.currentUser().getId()).orElseThrow();
        return postingRepository.findByCompanyId(company.getId(), PageRequest.of(page, size, Sort.by("createdAt").descending())).map(p -> toResponse(p, getAppCount(p.getId())));
    }
    public Page<PostingResponse> listStudentVisible(int page, int size) {
        return postingRepository.findStudentVisible(LocalDate.now(), PageRequest.of(page, size, Sort.by("deadline").ascending())).map(p -> toResponse(p, getAppCount(p.getId())));
    }
    public Page<PostingResponse> listPending(int page, int size) {
        return postingRepository.findByStatus(PostingStatus.PENDING, PageRequest.of(page, size, Sort.by("createdAt").ascending())).map(p -> toResponse(p, getAppCount(p.getId())));
    }
    @Transactional
    public PostingResponse approve(Long postingId) {
        JobPosting posting = postingRepository.findById(postingId).orElseThrow();
        posting.setStatus(PostingStatus.APPROVED);
        posting.setApprovedAt(Instant.now());
        posting.setApprovedBy(authHelper.currentUser());
        return toResponse(postingRepository.save(posting), 0);
    }
    @Transactional
    public PostingResponse reject(Long postingId, String reason) {
        JobPosting posting = postingRepository.findById(postingId).orElseThrow();
        posting.setStatus(PostingStatus.REJECTED);
        posting.setRejectionReason(reason);
        return toResponse(postingRepository.save(posting), 0);
    }
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void closeExpiredPostingsJob() {
        postingRepository.closeExpiredPostings(LocalDate.now(), PostingStatus.CLOSED, PostingStatus.APPROVED);
    }
    private long getAppCount(Long postingId) { return applicationRepository.findByPostingId(postingId, PageRequest.of(0, 1)).getTotalElements(); }
    private List<String> parseBranches(String json) { try { return objectMapper.readValue(json, new TypeReference<>() {}); } catch (Exception e) { return Collections.emptyList(); } }
    private String toJson(List<String> branches) { try { return objectMapper.writeValueAsString(branches); } catch (Exception e) { return "[]"; } }
    private PostingResponse toResponse(JobPosting posting, long applicationCount) {
        return new PostingResponse(posting.getId(), posting.getTitle(), posting.getDescription(), posting.getMinCgpa(), parseBranches(posting.getAllowedBranches()), posting.getGradYear(), posting.getDeadline(), posting.getStatus(), posting.getRejectionReason(), posting.getCompany().getName(), posting.getCompany().getId(), posting.getApprovedAt(), posting.getCreatedAt(), applicationCount);
    }
}