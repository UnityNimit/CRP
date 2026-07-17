package com.credx.campus.domain.analytics;

import com.credx.campus.domain.application.ApplicationRepository;
import com.credx.campus.domain.posting.JobPosting.PostingStatus;
import com.credx.campus.domain.posting.JobPostingRepository;
import com.credx.campus.domain.user.Role;
import com.credx.campus.domain.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository postingRepository;
    private final UserRepository userRepository;

    public AnalyticsService(ApplicationRepository applicationRepository,
                          JobPostingRepository postingRepository,
                          UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.postingRepository = postingRepository;
        this.userRepository = userRepository;
    }

    public AnalyticsSummary getSummary() {
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long placedStudents = applicationRepository.countDistinctSelectedStudents();
        double placementRate = totalStudents == 0 ? 0.0 : (placedStudents * 100.0) / totalStudents;

        List<AnalyticsSummary.CompanyApplicationCount> perCompany = applicationRepository.countApplicationsPerCompany()
            .stream()
            .map(row -> new AnalyticsSummary.CompanyApplicationCount((String) row[0], (Long) row[1]))
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