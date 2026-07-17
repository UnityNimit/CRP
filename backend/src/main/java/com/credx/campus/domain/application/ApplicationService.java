package com.credx.campus.domain.application;

import com.credx.campus.common.ApiException;
import com.credx.campus.common.PageResponse;
import com.credx.campus.domain.company.CompanyProfile;
import com.credx.campus.domain.company.CompanyProfileRepository;
import com.credx.campus.domain.notification.NotificationService;
import com.credx.campus.domain.posting.JobPosting;
import com.credx.campus.domain.posting.JobPostingRepository;
import com.credx.campus.domain.student.StudentProfile;
import com.credx.campus.domain.student.StudentProfileRepository;
import com.credx.campus.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository postingRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final NotificationService notificationService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              JobPostingRepository postingRepository,
                              StudentProfileRepository studentProfileRepository,
                              CompanyProfileRepository companyProfileRepository,
                              NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.postingRepository = postingRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ApplicationResponse apply(User studentUser, ApplyRequest request) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUser.getId())
            .orElseThrow(() -> new ApiException(404, "Student profile not found"));

        JobPosting posting = postingRepository.findStudentVisibleById(request.postingId(), LocalDate.now())
            .orElseThrow(() -> new ApiException(404, "Posting not available for application"));

        if (applicationRepository.existsByPostingIdAndStudentId(posting.getId(), student.getId())) {
            throw new ApiException(HttpStatus.CONFLICT.value(), "Already applied to this posting");
        }

        Application app = new Application();
        app.setPosting(posting);
        app.setStudent(student);
        app.setCoverNote(request.coverNote());
        app.setStatus(ApplicationStatus.APPLIED);

        Application saved = applicationRepository.save(app);
        notificationService.notifyUser(posting.getCompany().getUser(),
            student.getUser().getDisplayName() + " applied to \"" + posting.getTitle() + "\".");
        return toResponse(saved);
    }

    public PageResponse<ApplicationResponse> listStudentApplications(Long userId, int page, int size) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ApiException(404, "Student profile not found"));
        Page<Application> result = applicationRepository.findByStudentId(student.getId(), PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return toPageResponse(result);
    }

    public PageResponse<ApplicationResponse> listPostingApplications(Long companyUserId, Long postingId, int page, int size) {
        CompanyProfile company = companyProfileRepository.findByUserId(companyUserId)
            .orElseThrow(() -> new ApiException(404, "Company profile not found"));
        JobPosting posting = postingRepository.findById(postingId)
            .orElseThrow(() -> new ApiException(404, "Posting not found"));
        if (!posting.getCompany().getId().equals(company.getId())) {
            throw new ApiException(403, "Forbidden");
        }
        Page<Application> result = applicationRepository.findByPostingId(postingId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return toPageResponse(result);
    }

    @Transactional
    public ApplicationResponse updateStatus(Long companyUserId, Long applicationId, ApplicationStatus status) {
        CompanyProfile company = companyProfileRepository.findByUserId(companyUserId)
            .orElseThrow(() -> new ApiException(404, "Company profile not found"));

        Application app = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new ApiException(404, "Application not found"));

        if (!app.getPosting().getCompany().getId().equals(company.getId())) {
            throw new ApiException(403, "Forbidden");
        }

        if (status != ApplicationStatus.SHORTLISTED && status != ApplicationStatus.SELECTED && status != ApplicationStatus.REJECTED) {
            throw new ApiException(400, "Invalid status transition");
        }

        app.setStatus(status);
        Application saved = applicationRepository.save(app);
        notificationService.notifyUser(app.getStudent().getUser(),
            "Your application for \"" + app.getPosting().getTitle() + "\" is now " + status.name() + ".");
        return toResponse(saved);
    }

    private PageResponse<ApplicationResponse> toPageResponse(Page<Application> page) {
        List<ApplicationResponse> content = page.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    private ApplicationResponse toResponse(Application app) {
        return new ApplicationResponse(
            app.getId(),
            app.getPosting().getId(),
            app.getPosting().getTitle(),
            app.getPosting().getCompany().getName(),
            app.getStudent().getUser().getDisplayName(),
            app.getStudent().getBranch(),
            app.getCoverNote(),
            app.getStatus(),
            app.getCreatedAt()
        );
    }
}
