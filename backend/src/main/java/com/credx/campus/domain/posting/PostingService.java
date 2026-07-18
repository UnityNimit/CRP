package com.credx.campus.domain.posting;

import com.credx.campus.common.ApiException;
import com.credx.campus.domain.application.Application.ApplicationStatus;
import com.credx.campus.domain.application.ApplicationRepository;
import com.credx.campus.domain.company.CompanyProfile;
import com.credx.campus.domain.company.CompanyProfileRepository;
import com.credx.campus.domain.analytics.AnalyticsService;
import com.credx.campus.domain.analytics.CompanyTrustScore;
import com.credx.campus.domain.notification.NotificationService;
import com.credx.campus.domain.posting.JobPosting.PostingStatus;
import com.credx.campus.domain.posting.JobPostingController.CreatePostingRequest;
import com.credx.campus.domain.posting.JobPostingController.EligibilityResponse;
import com.credx.campus.domain.posting.JobPostingController.FieldChange;
import com.credx.campus.domain.posting.JobPostingController.PostingResponse;
import com.credx.campus.domain.posting.JobPostingController.UpdatePostingRequest;
import com.credx.campus.domain.student.StudentProfile;
import com.credx.campus.domain.student.StudentProfileRepository;
import com.credx.campus.domain.user.User;
import com.credx.campus.security.AuthHelper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Service
public class PostingService {

    private final JobPostingRepository postingRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final AuthHelper authHelper;
    private final PostingTransitionGuard transitionGuard;
    private final AnalyticsService analyticsService;
    private final ObjectMapper objectMapper = new ObjectMapper()
        .registerModule(new JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    public PostingService(JobPostingRepository postingRepository,
                          CompanyProfileRepository companyProfileRepository,
                          StudentProfileRepository studentProfileRepository,
                          ApplicationRepository applicationRepository,
                          NotificationService notificationService,
                          AuthHelper authHelper,
                          PostingTransitionGuard transitionGuard,
                          AnalyticsService analyticsService) {
        this.postingRepository = postingRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.applicationRepository = applicationRepository;
        this.notificationService = notificationService;
        this.authHelper = authHelper;
        this.transitionGuard = transitionGuard;
        this.analyticsService = analyticsService;
    }

    public PostingResponse getPostingById(Long id) {
        JobPosting posting = postingRepository.findById(id)
            .orElseThrow(() -> new ApiException(404, "Posting not found"));
        return toResponse(posting, getAppCount(posting.getId()));
    }

    public EligibilityResponse checkEligibility(Long postingId) {
        User studentUser = authHelper.currentUser();
        StudentProfile student = studentProfileRepository.findByUserId(studentUser.getId())
            .orElseThrow(() -> new ApiException(404, "Student profile not found"));

        JobPosting posting = postingRepository.findById(postingId)
            .orElseThrow(() -> new ApiException(404, "Posting not found"));

        boolean isEligible = true;
        List<String> checks = new ArrayList<>();

        if (applicationRepository.existsByStudentIdAndStatus(student.getId(), ApplicationStatus.SELECTED)) {
            checks.add("❌ PLACEMENT POLICY: You are already placed. You cannot apply to further roles.");
            isEligible = false;
        } else {
            checks.add("✅ PLACEMENT POLICY: Eligible (Unplaced)");
        }

        if (posting.getMinCgpa() != null) {
            if (student.getCgpa().compareTo(posting.getMinCgpa()) >= 0) {
                checks.add("✅ CGPA: " + student.getCgpa() + " (Min required: " + posting.getMinCgpa() + ")");
            } else {
                checks.add("❌ CGPA: " + student.getCgpa() + " is below minimum " + posting.getMinCgpa());
                isEligible = false;
            }
        }

        List<String> allowedBranches = parseBranches(posting.getAllowedBranches());
        if (!allowedBranches.isEmpty()) {
            if (allowedBranches.contains(student.getBranch())) {
                checks.add("✅ BRANCH: " + student.getBranch() + " is allowed.");
            } else {
                checks.add("❌ BRANCH: " + student.getBranch() + " is not eligible for this role.");
                isEligible = false;
            }
        }

        if (posting.getGradYear() != null) {
            if (posting.getGradYear().equals(student.getGradYear())) {
                checks.add("✅ BATCH: Class of " + student.getGradYear());
            } else {
                checks.add("❌ BATCH: You are " + student.getGradYear() + ". Role requires " + posting.getGradYear());
                isEligible = false;
            }
        }

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
        CompanyProfile company = companyForCurrentUser();
        JobPosting posting = postingRepository.findById(postingId)
            .orElseThrow(() -> new ApiException(404, "Posting not found"));

        if (!posting.getCompany().getId().equals(company.getId())) {
            throw new ApiException(403, "You can only close your own postings.");
        }

        transitionGuard.assertTransition(posting.getStatus(), PostingStatus.CLOSED);
        posting.setStatus(PostingStatus.CLOSED);
        return toResponse(postingRepository.save(posting), getAppCount(posting.getId()));
    }

    @Transactional
    public PostingResponse create(CreatePostingRequest request) {
        CompanyProfile company = companyForCurrentUser();
        JobPosting posting = new JobPosting();
        posting.setCompany(company);
        applyEditableFields(posting, request.title(), request.description(), request.minCgpa(),
            request.allowedBranches(), request.gradYear(), request.deadline());

        boolean submit = Boolean.TRUE.equals(request.submit());
        PostingStatus target = submit ? PostingStatus.PENDING_REVIEW : PostingStatus.DRAFT;
        posting.setStatus(target);

        posting = postingRepository.save(posting);
        if (submit) {
            notificationService.notifyAdmins("New posting submitted for review: \"" + posting.getTitle() + "\" by " + company.getName());
        }
        return toResponse(posting, 0);
    }

    @Transactional
    public PostingResponse update(Long postingId, UpdatePostingRequest request) {
        CompanyProfile company = companyForCurrentUser();
        JobPosting posting = postingRepository.findById(postingId)
            .orElseThrow(() -> new ApiException(404, "Posting not found"));

        if (!posting.getCompany().getId().equals(company.getId())) {
            throw new ApiException(403, "You can only edit your own postings.");
        }

        transitionGuard.assertEditable(posting.getStatus());
        applyEditableFields(posting, request.title(), request.description(), request.minCgpa(),
            request.allowedBranches(), request.gradYear(), request.deadline());

        return toResponse(postingRepository.save(posting), getAppCount(posting.getId()));
    }

    @Transactional
    public PostingResponse submit(Long postingId) {
        CompanyProfile company = companyForCurrentUser();
        JobPosting posting = postingRepository.findById(postingId)
            .orElseThrow(() -> new ApiException(404, "Posting not found"));

        if (!posting.getCompany().getId().equals(company.getId())) {
            throw new ApiException(403, "You can only submit your own postings.");
        }

        PostingStatus from = posting.getStatus();
        transitionGuard.assertTransition(from, PostingStatus.PENDING_REVIEW);

        if (from == PostingStatus.NEEDS_REVISION) {
            posting.setResubmittedAt(Instant.now());
        }

        posting.setStatus(PostingStatus.PENDING_REVIEW);
        posting = postingRepository.save(posting);

        String action = from == PostingStatus.NEEDS_REVISION ? "resubmitted" : "submitted";
        notificationService.notifyAdmins("Posting " + action + " for review: \"" + posting.getTitle() + "\" by " + company.getName());
        return toResponse(posting, getAppCount(posting.getId()));
    }

    public Page<PostingResponse> listCompanyPostings(int page, int size) {
        CompanyProfile company = companyForCurrentUser();
        return postingRepository.findByCompanyId(company.getId(),
                PageRequest.of(page, size, Sort.by("createdAt").descending()))
            .map(p -> toResponse(p, getAppCount(p.getId())));
    }

    public Page<PostingResponse> listStudentVisible(int page, int size) {
        return postingRepository.findStudentVisible(LocalDate.now(),
                PageRequest.of(page, size, Sort.by("deadline").ascending()))
            .map(p -> toResponse(p, getAppCount(p.getId())));
    }

    public Page<PostingResponse> listPending(int page, int size) {
        return postingRepository.findByStatus(PostingStatus.PENDING_REVIEW,
                PageRequest.of(page, size, Sort.by("createdAt").ascending()))
            .map(p -> toAdminResponse(p, getAppCount(p.getId())));
    }

    @Transactional
    public PostingResponse approve(Long postingId) {
        JobPosting posting = postingRepository.findById(postingId)
            .orElseThrow(() -> new ApiException(404, "Posting not found"));

        transitionGuard.assertTransition(posting.getStatus(), PostingStatus.APPROVED);
        posting.setStatus(PostingStatus.APPROVED);
        posting.setApprovedAt(Instant.now());
        posting.setApprovedBy(authHelper.currentUser());
        clearRevisionData(posting);

        posting = postingRepository.save(posting);
        notificationService.notifyUser(posting.getCompany().getUser(),
            "Your posting \"" + posting.getTitle() + "\" has been approved and is now live for students.");
        return toResponse(posting, getAppCount(posting.getId()));
    }

    @Transactional
    public PostingResponse reject(Long postingId, String reason) {
        validateReason(reason, "Rejection reason");
        JobPosting posting = postingRepository.findById(postingId)
            .orElseThrow(() -> new ApiException(404, "Posting not found"));

        transitionGuard.assertTransition(posting.getStatus(), PostingStatus.REJECTED);
        posting.setStatus(PostingStatus.REJECTED);
        posting.setRejectionReason(reason);
        clearRevisionData(posting);

        posting = postingRepository.save(posting);
        notificationService.notifyUser(posting.getCompany().getUser(),
            "Your posting \"" + posting.getTitle() + "\" was rejected. Reason: " + reason);
        return toResponse(posting, getAppCount(posting.getId()));
    }

    @Transactional
    public PostingResponse requestRevision(Long postingId, String comment) {
        validateReason(comment, "Revision comment");
        User admin = authHelper.currentUser();
        JobPosting posting = postingRepository.findById(postingId)
            .orElseThrow(() -> new ApiException(404, "Posting not found"));

        transitionGuard.assertTransition(posting.getStatus(), PostingStatus.NEEDS_REVISION);
        posting.setSnapshotBeforeRevision(captureSnapshot(posting));
        posting.setRevisionComment(comment);
        posting.setRevisionRequestedAt(Instant.now());
        posting.setRevisionRequestedBy(admin);
        posting.setResubmittedAt(null);
        posting.setStatus(PostingStatus.NEEDS_REVISION);

        posting = postingRepository.save(posting);
        notificationService.notifyUser(posting.getCompany().getUser(),
            "Revision requested for \"" + posting.getTitle() + "\": " + comment);
        return toResponse(posting, getAppCount(posting.getId()));
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void closeExpiredPostingsJob() {
        postingRepository.closeExpiredPostings(LocalDate.now(), PostingStatus.CLOSED, PostingStatus.APPROVED);
    }

    private CompanyProfile companyForCurrentUser() {
        return companyProfileRepository.findByUserId(authHelper.currentUser().getId())
            .orElseThrow(() -> new ApiException(404, "Company profile not found"));
    }

    private void applyEditableFields(JobPosting posting, String title, String description, BigDecimal minCgpa,
                                     List<String> allowedBranches, Integer gradYear, LocalDate deadline) {
        posting.setTitle(title);
        posting.setDescription(description);
        posting.setMinCgpa(minCgpa);
        posting.setAllowedBranches(toJson(allowedBranches));
        posting.setGradYear(gradYear);
        posting.setDeadline(deadline);
    }

    private void validateReason(String reason, String label) {
        if (reason == null || reason.trim().length() < 5) {
            throw new ApiException(HttpStatus.BAD_REQUEST.value(), label + " must be at least 5 characters");
        }
    }

    private void clearRevisionData(JobPosting posting) {
        posting.setSnapshotBeforeRevision(null);
        posting.setResubmittedAt(null);
    }

    private String captureSnapshot(JobPosting posting) {
        try {
            PostingSnapshot snapshot = new PostingSnapshot(
                posting.getTitle(),
                posting.getDescription(),
                posting.getMinCgpa(),
                parseBranches(posting.getAllowedBranches()),
                posting.getGradYear(),
                posting.getDeadline()
            );
            return objectMapper.writeValueAsString(snapshot);
        } catch (Exception e) {
            throw new ApiException(500, "Failed to capture revision snapshot");
        }
    }

    private List<FieldChange> computeFieldChanges(JobPosting posting) {
        if (posting.getSnapshotBeforeRevision() == null
            || posting.getStatus() != PostingStatus.PENDING_REVIEW) {
            return List.of();
        }
        try {
            PostingSnapshot snapshot = objectMapper.readValue(posting.getSnapshotBeforeRevision(), PostingSnapshot.class);
            List<FieldChange> changes = new ArrayList<>();

            addChange(changes, "title", snapshot.title(), posting.getTitle());
            addChange(changes, "description", snapshot.description(), posting.getDescription());
            addChange(changes, "minCgpa",
                snapshot.minCgpa() != null ? snapshot.minCgpa().toPlainString() : null,
                posting.getMinCgpa() != null ? posting.getMinCgpa().toPlainString() : null);
            addChange(changes, "allowedBranches",
                String.join(", ", snapshot.allowedBranches() != null ? snapshot.allowedBranches() : List.of()),
                String.join(", ", parseBranches(posting.getAllowedBranches())));
            addChange(changes, "gradYear",
                snapshot.gradYear() != null ? snapshot.gradYear().toString() : null,
                posting.getGradYear() != null ? posting.getGradYear().toString() : null);
            addChange(changes, "deadline",
                snapshot.deadline() != null ? snapshot.deadline().toString() : null,
                posting.getDeadline() != null ? posting.getDeadline().toString() : null);

            return changes;
        } catch (Exception e) {
            return List.of();
        }
    }

    private void addChange(List<FieldChange> changes, String field, String previous, String current) {
        if (!Objects.equals(previous, current)) {
            changes.add(new FieldChange(field, previous, current));
        }
    }

    private long getAppCount(Long postingId) {
        return applicationRepository.findByPostingId(postingId, PageRequest.of(0, 1)).getTotalElements();
    }

    private List<String> parseBranches(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private String toJson(List<String> branches) {
        try {
            return objectMapper.writeValueAsString(branches);
        } catch (Exception e) {
            return "[]";
        }
    }

    private PostingResponse toResponse(JobPosting posting, long applicationCount) {
        return toResponse(posting, applicationCount, null);
    }

    private PostingResponse toAdminResponse(JobPosting posting, long applicationCount) {
        CompanyTrustScore trust = analyticsService.getCompanyTrustScore(posting.getCompany().getId());
        return toResponse(posting, applicationCount, trust);
    }

    private PostingResponse toResponse(JobPosting posting, long applicationCount, CompanyTrustScore companyTrust) {
        return new PostingResponse(
            posting.getId(),
            posting.getTitle(),
            posting.getDescription(),
            posting.getMinCgpa(),
            parseBranches(posting.getAllowedBranches()),
            posting.getGradYear(),
            posting.getDeadline(),
            posting.getStatus(),
            posting.getRejectionReason(),
            posting.getRevisionComment(),
            posting.getResubmittedAt(),
            posting.getRevisionRequestedAt(),
            computeFieldChanges(posting),
            posting.getCompany().getName(),
            posting.getCompany().getId(),
            posting.getApprovedAt(),
            posting.getCreatedAt(),
            applicationCount,
            companyTrust
        );
    }

    private record PostingSnapshot(
        String title,
        String description,
        BigDecimal minCgpa,
        List<String> allowedBranches,
        Integer gradYear,
        LocalDate deadline
    ) {}
}
