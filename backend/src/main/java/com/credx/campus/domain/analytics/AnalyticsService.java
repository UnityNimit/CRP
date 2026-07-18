package com.credx.campus.domain.analytics;

import com.credx.campus.domain.application.ApplicationRepository;
import com.credx.campus.domain.company.CompanyProfileRepository;
import com.credx.campus.domain.posting.JobPosting.PostingStatus;
import com.credx.campus.domain.posting.JobPostingRepository;
import com.credx.campus.domain.user.Role;
import com.credx.campus.domain.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository postingRepository;
    private final UserRepository userRepository;
    private final CompanyProfileRepository companyProfileRepository;

    public AnalyticsService(ApplicationRepository applicationRepository,
                          JobPostingRepository postingRepository,
                          UserRepository userRepository,
                          CompanyProfileRepository companyProfileRepository) {
        this.applicationRepository = applicationRepository;
        this.postingRepository = postingRepository;
        this.userRepository = userRepository;
        this.companyProfileRepository = companyProfileRepository;
    }

    public AnalyticsSummary getSummary() {
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long placedStudents = applicationRepository.countDistinctSelectedStudents();
        double placementRate = totalStudents == 0 ? 0.0 : (placedStudents * 100.0) / totalStudents;
        long approvedCompanies = companyProfileRepository.countByApprovedTrue();
        long pendingCompanies = companyProfileRepository.countByApprovedFalse();
        long totalCompanies = approvedCompanies + pendingCompanies;
        double companyApprovalRate = totalCompanies == 0 ? 0.0 : (approvedCompanies * 100.0) / totalCompanies;

        List<AnalyticsSummary.CompanyApplicationCount> perCompany = applicationRepository.countApplicationsPerCompany()
            .stream()
            .map(row -> new AnalyticsSummary.CompanyApplicationCount((String) row[0], (Long) row[1]))
            .sorted(Comparator.comparingLong(AnalyticsSummary.CompanyApplicationCount::count).reversed())
            .toList();

        Map<String, Long> postingsByStatus = new HashMap<>();
        for (PostingStatus status : PostingStatus.values()) {
            postingsByStatus.put(status.name(), postingRepository.countByStatus(status));
        }

        long openPostings = postingRepository.countByStatus(PostingStatus.APPROVED);

        return new AnalyticsSummary(
            Math.round(placementRate * 100.0) / 100.0,
            totalStudents,
            placedStudents,
            totalCompanies,
            approvedCompanies,
            pendingCompanies,
            Math.round(companyApprovalRate * 100.0) / 100.0,
            postingRepository.countByStatus(PostingStatus.PENDING),
            openPostings,
            postingRepository.countByStatus(PostingStatus.CLOSED),
            applicationRepository.count(),
            perCompany,
            postingsByStatus
        );
    }

    // NESTED RECORD 
    public record AnalyticsSummary(
        double placementRate,
        long totalStudents,
        long placedStudents,
        long totalCompanies,
        long approvedCompanies,
        long pendingCompanies,
        double companyApprovalRate,
        long pendingPostings,
        long openPostings,
        long closedPostings,
        long totalApplications,
        List<CompanyApplicationCount> applicationsPerCompany,
        Map<String, Long> postingsByStatus
    ) {
        public record CompanyApplicationCount(String companyName, long count) {}
    }
}