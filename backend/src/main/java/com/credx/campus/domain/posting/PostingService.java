package com.credx.campus.domain.posting;

import com.credx.campus.common.ApiException;
import com.credx.campus.domain.application.ApplicationRepository;
import com.credx.campus.domain.company.CompanyProfile;
import com.credx.campus.domain.company.CompanyProfileRepository;
import com.credx.campus.domain.notification.NotificationService;
import com.credx.campus.domain.posting.JobPosting.PostingStatus;
import com.credx.campus.domain.posting.JobPostingController.CreatePostingRequest;
import com.credx.campus.domain.posting.JobPostingController.PostingResponse;
import com.credx.campus.security.AuthHelper;
import com.credx.campus.domain.user.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Service
public class PostingService {

    private final JobPostingRepository postingRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final AuthHelper authHelper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PostingService(JobPostingRepository postingRepository,
                          CompanyProfileRepository companyProfileRepository,
                          ApplicationRepository applicationRepository,
                          NotificationService notificationService,
                          AuthHelper authHelper) {
        this.postingRepository = postingRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.applicationRepository = applicationRepository;
        this.notificationService = notificationService;
        this.authHelper = authHelper;
    }

    @Transactional
    public PostingResponse create(CreatePostingRequest request) {
        User companyUser = authHelper.currentUser();
        CompanyProfile company = companyProfileRepository.findByUserId(companyUser.getId())
            .orElseThrow(() -> new ApiException(404, "Company profile not found"));

        JobPosting posting = new JobPosting();
        posting.setCompany(company);
        posting.setTitle(request.title());
        posting.setDescription(request.description());
        posting.setMinCgpa(request.minCgpa());
        posting.setAllowedBranches(toJson(request.allowedBranches()));
        posting.setGradYear(request.gradYear());
        posting.setDeadline(request.deadline());
        posting.setStatus(PostingStatus.PENDING);

        JobPosting saved = postingRepository.save(posting);
        notificationService.notifyAdmins("New posting pending approval: \"" + saved.getTitle() + "\" from " + company.getName());
        return toResponse(saved, 0);
    }

    public Page<PostingResponse> listCompanyPostings(Long userId, int page, int size) {
        CompanyProfile company = companyProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ApiException(404, "Company profile not found"));
        Page<JobPosting> result = postingRepository.findByCompanyId(company.getId(), PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return result.map(p -> toResponse(p, getAppCount(p.getId())));
    }

    public Page<PostingResponse> listStudentVisible(int page, int size) {
        Page<JobPosting> result = postingRepository.findStudentVisible(LocalDate.now(), PageRequest.of(page, size, Sort.by("deadline").ascending()));
        return result.map(p -> toResponse(p, getAppCount(p.getId())));
    }

    public PostingResponse getStudentVisible(Long id) {
        JobPosting posting = postingRepository.findStudentVisibleById(id, LocalDate.now())
            .orElseThrow(() -> new ApiException(404, "Posting not found"));
        return toResponse(posting, getAppCount(id));
    }

    public Page<PostingResponse> listPending(int page, int size) {
        Page<JobPosting> result = postingRepository.findByStatus(PostingStatus.PENDING, PageRequest.of(page, size, Sort.by("createdAt").ascending()));
        return result.map(p -> toResponse(p, getAppCount(p.getId())));
    }

    @Transactional
    public PostingResponse approve(Long postingId) {
        User admin = authHelper.currentUser();
        JobPosting posting = postingRepository.findById(postingId)
            .orElseThrow(() -> new ApiException(404, "Posting not found"));
        if (posting.getStatus() != PostingStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT.value(), "Only PENDING postings can be approved");
        }
        posting.setStatus(PostingStatus.APPROVED);
        posting.setApprovedAt(Instant.now());
        posting.setApprovedBy(admin);
        posting.setRejectionReason(null);
        JobPosting saved = postingRepository.save(posting);
        notificationService.notifyUser(posting.getCompany().getUser(),
            "Your posting \"" + posting.getTitle() + "\" has been approved and is now live.");
        return toResponse(saved, 0);
    }

    @Transactional
    public PostingResponse reject(Long postingId, String reason) {
        User admin = authHelper.currentUser();
        JobPosting posting = postingRepository.findById(postingId)
            .orElseThrow(() -> new ApiException(404, "Posting not found"));
        if (posting.getStatus() != PostingStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT.value(), "Only PENDING postings can be rejected");
        }
        posting.setStatus(PostingStatus.REJECTED);
        posting.setRejectionReason(reason);
        posting.setApprovedAt(null);
        posting.setApprovedBy(null);
        JobPosting saved = postingRepository.save(posting);
        notificationService.notifyUser(posting.getCompany().getUser(),
            "Your posting \"" + posting.getTitle() + "\" was rejected. Reason: " + reason);
        return toResponse(saved, 0);
    }

    private long getAppCount(Long postingId) {
        return applicationRepository.findByPostingId(postingId, PageRequest.of(0, 1)).getTotalElements();
    }

    private List<String> parseBranches(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
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
            posting.getCompany().getName(),
            posting.getCompany().getId(),
            posting.getApprovedAt(),
            posting.getCreatedAt(),
            applicationCount
        );
    }
}