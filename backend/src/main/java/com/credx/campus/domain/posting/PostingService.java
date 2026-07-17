package com.credx.campus.domain.posting;

import com.credx.campus.common.ApiException;
import com.credx.campus.common.PageResponse;
import com.credx.campus.domain.application.ApplicationRepository;
import com.credx.campus.domain.company.CompanyProfile;
import com.credx.campus.domain.company.CompanyProfileRepository;
import com.credx.campus.domain.notification.NotificationService;
import com.credx.campus.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
public class PostingService {

    private final JobPostingRepository postingRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final PostingMapper postingMapper;

    public PostingService(JobPostingRepository postingRepository,
                          CompanyProfileRepository companyProfileRepository,
                          ApplicationRepository applicationRepository,
                          NotificationService notificationService,
                          PostingMapper postingMapper) {
        this.postingRepository = postingRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.applicationRepository = applicationRepository;
        this.notificationService = notificationService;
        this.postingMapper = postingMapper;
    }

    @Transactional
    public PostingResponse create(User companyUser, CreatePostingRequest request) {
        CompanyProfile company = companyProfileRepository.findByUserId(companyUser.getId())
            .orElseThrow(() -> new ApiException(404, "Company profile not found"));

        JobPosting posting = new JobPosting();
        posting.setCompany(company);
        posting.setTitle(request.title());
        posting.setDescription(request.description());
        posting.setMinCgpa(request.minCgpa());
        posting.setAllowedBranches(postingMapper.toJson(request.allowedBranches()));
        posting.setGradYear(request.gradYear());
        posting.setDeadline(request.deadline());
        posting.setStatus(PostingStatus.PENDING);

        JobPosting saved = postingRepository.save(posting);
        notificationService.notifyAdmins("New posting pending approval: \"" + saved.getTitle() + "\" from " + company.getName());
        return toResponse(saved, 0);
    }

    public PageResponse<PostingResponse> listCompanyPostings(Long userId, int page, int size) {
        CompanyProfile company = companyProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ApiException(404, "Company profile not found"));
        Page<JobPosting> result = postingRepository.findByCompanyId(company.getId(), PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return toPageResponse(result);
    }

    public PageResponse<PostingResponse> listStudentVisible(int page, int size) {
        Page<JobPosting> result = postingRepository.findStudentVisible(LocalDate.now(), PageRequest.of(page, size, Sort.by("deadline").ascending()));
        return toPageResponse(result);
    }

    public PostingResponse getStudentVisible(Long id) {
        JobPosting posting = postingRepository.findStudentVisibleById(id, LocalDate.now())
            .orElseThrow(() -> new ApiException(404, "Posting not found"));
        return toResponse(posting, applicationRepository.findByPostingId(id, PageRequest.of(0, 1)).getTotalElements());
    }

    public PageResponse<PostingResponse> listPending(int page, int size) {
        Page<JobPosting> result = postingRepository.findByStatus(PostingStatus.PENDING, PageRequest.of(page, size, Sort.by("createdAt").ascending()));
        return toPageResponse(result);
    }

    public PostingResponse getByIdForAdmin(Long id) {
        JobPosting posting = postingRepository.findById(id)
            .orElseThrow(() -> new ApiException(404, "Posting not found"));
        return toResponse(posting, applicationRepository.findByPostingId(id, PageRequest.of(0, 1)).getTotalElements());
    }

    @Transactional
    public PostingResponse approve(Long postingId, User admin) {
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
    public PostingResponse reject(Long postingId, User admin, String reason) {
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

    @Transactional
    public PostingResponse closeByCompany(Long companyUserId, Long postingId) {
        CompanyProfile company = companyProfileRepository.findByUserId(companyUserId)
            .orElseThrow(() -> new ApiException(404, "Company profile not found"));
        JobPosting posting = postingRepository.findById(postingId)
            .orElseThrow(() -> new ApiException(404, "Posting not found"));
        if (!posting.getCompany().getId().equals(company.getId())) {
            throw new ApiException(403, "Forbidden");
        }
        if (posting.getStatus() != PostingStatus.APPROVED) {
            throw new ApiException(HttpStatus.CONFLICT.value(), "Only APPROVED postings can be closed");
        }
        posting.setStatus(PostingStatus.CLOSED);
        JobPosting saved = postingRepository.save(posting);
        return toResponse(saved, applicationRepository.findByPostingId(postingId, PageRequest.of(0, 1)).getTotalElements());
    }

    @Transactional
    public void closeExpiredPostings() {
        postingRepository.closeExpiredPostings(LocalDate.now());
    }

    private PageResponse<PostingResponse> toPageResponse(Page<JobPosting> page) {
        List<PostingResponse> content = page.getContent().stream()
            .map(p -> toResponse(p, applicationRepository.findByPostingId(p.getId(), PageRequest.of(0, 1)).getTotalElements()))
            .toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    private PostingResponse toResponse(JobPosting posting, long applicationCount) {
        return new PostingResponse(
            posting.getId(),
            posting.getTitle(),
            posting.getDescription(),
            posting.getMinCgpa(),
            postingMapper.parseBranches(posting.getAllowedBranches()),
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
