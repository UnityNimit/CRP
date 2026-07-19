package com.credx.campus.domain.application;

import com.credx.campus.common.ApiException;
import com.credx.campus.domain.application.Application.ApplicationStatus;
import com.credx.campus.domain.application.ApplicationController.ApplyRequest;
import com.credx.campus.domain.application.ApplicationController.ApplicationResponse;
import com.credx.campus.domain.application.ApplicationController.BulkStatusResponse;
import com.credx.campus.domain.application.ApplicationController.BulkStatusResponse.BulkFailure;
import com.credx.campus.domain.company.CompanyProfile;
import com.credx.campus.domain.company.CompanyProfileRepository;
import com.credx.campus.domain.notification.NotificationService;
import com.credx.campus.domain.posting.JobPosting;
import com.credx.campus.domain.posting.JobPostingRepository;
import com.credx.campus.domain.posting.PostingService;
import com.credx.campus.domain.student.StudentProfile;
import com.credx.campus.domain.student.StudentProfileRepository;
import com.credx.campus.security.AuthHelper;
import com.credx.campus.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository postingRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final NotificationService notificationService;
    private final AuthHelper authHelper;
    private final PostingService postingService;

    public ApplicationService(ApplicationRepository applicationRepository, JobPostingRepository postingRepository, StudentProfileRepository studentProfileRepository, CompanyProfileRepository companyProfileRepository, NotificationService notificationService, AuthHelper authHelper, PostingService postingService) {
        this.applicationRepository = applicationRepository;
        this.postingRepository = postingRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.notificationService = notificationService;
        this.authHelper = authHelper;
        this.postingService = postingService;
    }

    @Transactional
    public ApplicationResponse apply(ApplyRequest request) {
        // ENFORCE STRICT MATH ELIGIBILITY (Will throw 404/400 if failed)
        var eligibility = postingService.checkEligibility(request.postingId());
        if (!eligibility.eligible()) {
            throw new ApiException(400, "You do not meet the strict mathematical eligibility criteria for this role.");
        }

        User studentUser = authHelper.currentUser();
        StudentProfile student = studentProfileRepository.findByUserId(studentUser.getId()).orElseThrow();
        JobPosting posting = postingRepository.findStudentVisibleById(request.postingId(), LocalDate.now())
            .orElseThrow(() -> new ApiException(404, "Posting not available"));

        if (applicationRepository.existsByPostingIdAndStudentId(posting.getId(), student.getId())) {
            throw new ApiException(409, "Already applied to this posting");
        }

        Application app = new Application();
        app.setPosting(posting);
        app.setStudent(student);
        app.setResumeLink(request.resumeLink()); // SAVING RESUME LINK
        app.setStatus(ApplicationStatus.APPLIED);

        Application saved = applicationRepository.save(app);
        return toResponse(saved);
    }

    public Page<ApplicationResponse> listStudentApplications(int page, int size) {
        StudentProfile student = studentProfileRepository.findByUserId(authHelper.currentUser().getId()).orElseThrow();
        return applicationRepository.findByStudentId(student.getId(), PageRequest.of(page, size, Sort.by("createdAt").descending())).map(this::toResponse);
    }

    public Page<ApplicationResponse> listPostingApplications(Long postingId, int page, int size) {
        CompanyProfile company = companyProfileRepository.findByUserId(authHelper.currentUser().getId()).orElseThrow();
        JobPosting posting = postingRepository.findById(postingId).orElseThrow();
        if (!posting.getCompany().getId().equals(company.getId())) throw new ApiException(403, "Forbidden");
        return applicationRepository.findByPostingId(postingId, PageRequest.of(page, size, Sort.by("createdAt").descending())).map(this::toResponse);
    }

    @Transactional
    public ApplicationResponse updateStatus(Long applicationId, ApplicationStatus status) {
        CompanyProfile company = companyProfileRepository.findByUserId(authHelper.currentUser().getId()).orElseThrow();
        Application app = applicationRepository.findById(applicationId).orElseThrow(() -> new ApiException(404, "Application not found"));
        if (!app.getPosting().getCompany().getId().equals(company.getId())) throw new ApiException(403, "Forbidden");

        return applyStatusChange(app, status);
    }

    @Transactional
    public BulkStatusResponse bulkUpdateStatus(List<Long> applicationIds, ApplicationStatus status) {
        CompanyProfile company = companyProfileRepository.findByUserId(authHelper.currentUser().getId()).orElseThrow();
        int updated = 0;
        List<BulkFailure> failed = new ArrayList<>();

        for (Long applicationId : applicationIds) {
            try {
                Application app = applicationRepository.findById(applicationId)
                    .orElseThrow(() -> new ApiException(404, "Application not found"));
                if (!app.getPosting().getCompany().getId().equals(company.getId())) {
                    throw new ApiException(403, "Forbidden");
                }
                applyStatusChange(app, status);
                updated++;
            } catch (ApiException e) {
                failed.add(new BulkFailure(applicationId, e.getMessage()));
            }
        }

        return new BulkStatusResponse(updated, failed);
    }

    private ApplicationResponse applyStatusChange(Application app, ApplicationStatus status) {
        ApplicationStatus current = app.getStatus();
        if (current == status) {
            return toResponse(app);
        }
        // Offers and rejections are terminal — no reverse via row or bulk actions
        if (current == ApplicationStatus.SELECTED) {
            throw new ApiException(409, "Cannot change status of an offered applicant");
        }
        if (current == ApplicationStatus.REJECTED) {
            throw new ApiException(409, "Cannot change status of a rejected applicant");
        }
        app.setStatus(status);
        Application saved = applicationRepository.save(app);
        notificationService.notifyUser(
            app.getStudent().getUser(),
            "Your application for \"" + app.getPosting().getTitle() + "\" is now " + status.name() + "."
        );
        return toResponse(saved);
    }

    private ApplicationResponse toResponse(Application app) {
        return new ApplicationResponse(
            app.getId(),
            app.getPosting().getId(),
            app.getPosting().getTitle(),
            app.getPosting().getCompany().getName(),
            app.getStudent().getUser().getDisplayName(),
            app.getStudent().getUser().getEmail(),
            app.getStudent().getCgpa(),
            app.getStudent().getBranch(),
            app.getResumeLink(),
            app.getStatus(),
            app.getCreatedAt()
        );
    }
}