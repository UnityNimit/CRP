package com.credx.campus.domain.analytics;

import com.credx.campus.common.ApiException;
import com.credx.campus.domain.application.Application.ApplicationStatus;
import com.credx.campus.domain.application.ApplicationRepository;
import com.credx.campus.domain.company.CompanyProfile;
import com.credx.campus.domain.company.CompanyProfileRepository;
import com.credx.campus.domain.posting.JobPosting.PostingStatus;
import com.credx.campus.domain.posting.JobPostingRepository;
import com.credx.campus.domain.user.Role;
import com.credx.campus.domain.user.User;
import com.credx.campus.domain.user.UserRepository;
import com.credx.campus.security.AuthHelper;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository postingRepository;
    private final UserRepository userRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final AuthHelper authHelper;

    public AnalyticsService(ApplicationRepository applicationRepository, JobPostingRepository postingRepository, UserRepository userRepository, CompanyProfileRepository companyProfileRepository, AuthHelper authHelper) {
        this.applicationRepository = applicationRepository;
        this.postingRepository = postingRepository;
        this.userRepository = userRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.authHelper = authHelper;
    }

    public AnalyticsSummary getAdminSummary() {
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long placedStudents = applicationRepository.countDistinctSelectedStudents();
        double placementRate = totalStudents == 0 ? 0.0 : (placedStudents * 100.0) / totalStudents;
        List<AnalyticsSummary.CompanyApplicationCount> perCompany = applicationRepository.countApplicationsPerCompany().stream()
            .map(row -> new AnalyticsSummary.CompanyApplicationCount((String) row[0], (Long) row[1])).toList();
        Map<String, Long> postingsByStatus = new HashMap<>();
        for (PostingStatus status : PostingStatus.values()) postingsByStatus.put(status.name(), postingRepository.countByStatus(status));
        return new AnalyticsSummary(Math.round(placementRate * 100.0) / 100.0, totalStudents, placedStudents, postingRepository.countByStatus(PostingStatus.PENDING), postingRepository.countByStatus(PostingStatus.APPROVED), postingRepository.countByStatus(PostingStatus.CLOSED), applicationRepository.count(), perCompany, postingsByStatus);
    }

    public CompanyAnalyticsSummary getCompanySummary() {
        User companyUser = authHelper.currentUser();
        CompanyProfile company = companyProfileRepository.findByUserId(companyUser.getId()).orElseThrow(() -> new ApiException(404, "Company not found"));
        Long cid = company.getId();
        
        long totalJobs = postingRepository.countByCompanyId(cid);
        long totalApps = applicationRepository.countByCompanyId(cid);
        long shortlisted = applicationRepository.countByCompanyIdAndStatus(cid, ApplicationStatus.SHORTLISTED);
        long selected = applicationRepository.countByCompanyIdAndStatus(cid, ApplicationStatus.SELECTED);
        long rejected = applicationRepository.countByCompanyIdAndStatus(cid, ApplicationStatus.REJECTED);
        long applied = applicationRepository.countByCompanyIdAndStatus(cid, ApplicationStatus.APPLIED);
        
        return new CompanyAnalyticsSummary(totalJobs, totalApps, applied, shortlisted, selected, rejected);
    }

    public record AnalyticsSummary(double placementRate, long totalStudents, long placedStudents, long pendingPostings, long openPostings, long closedPostings, long totalApplications, List<CompanyApplicationCount> applicationsPerCompany, Map<String, Long> postingsByStatus) {
        public record CompanyApplicationCount(String companyName, long count) {}
    }
    public record CompanyAnalyticsSummary(long totalJobs, long totalApplications, long pendingReview, long shortlisted, long selected, long rejected) {}
}