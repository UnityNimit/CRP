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

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private static final int MIN_SAMPLE_SIZE = 10;

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
        List<CompanyTrustScore> ghostLeaderboard = buildGhostLeaderboard();
        return new AnalyticsSummary(
            Math.round(placementRate * 100.0) / 100.0,
            totalStudents,
            placedStudents,
            postingRepository.countByStatus(PostingStatus.PENDING_REVIEW),
            postingRepository.countByStatus(PostingStatus.APPROVED),
            postingRepository.countByStatus(PostingStatus.CLOSED),
            applicationRepository.count(),
            perCompany,
            postingsByStatus,
            ghostLeaderboard
        );
    }

    public CompanyTrustScore getCompanyTrustScore(Long companyId) {
        CompanyProfile company = companyProfileRepository.findById(companyId)
            .orElseThrow(() -> new ApiException(404, "Company not found"));
        return computeTrustScore(company);
    }

    public List<CompanyTrustScore> buildGhostLeaderboard() {
        return companyProfileRepository.findAll().stream()
            .map(this::computeTrustScore)
            .filter(CompanyTrustScore::sampleOk)
            .sorted(Comparator
                .comparing(CompanyTrustScore::ghostRate, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(CompanyTrustScore::blackHoleRate, Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(10)
            .toList();
    }

    private CompanyTrustScore computeTrustScore(CompanyProfile company) {
        Long companyId = company.getId();
        long closedPostings = postingRepository.countByCompanyIdAndStatus(companyId, PostingStatus.CLOSED);
        long closedApps = applicationRepository.countClosedPostingAppsByCompanyId(companyId);
        long closedOffers = applicationRepository.countClosedPostingAppsByCompanyIdAndStatus(companyId, ApplicationStatus.SELECTED);
        long untouched = applicationRepository.countClosedPostingAppsByCompanyIdAndStatus(companyId, ApplicationStatus.APPLIED);
        long reviewed = applicationRepository.countReviewedOnClosedPostings(companyId);

        boolean sampleOk = closedApps >= MIN_SAMPLE_SIZE && closedPostings >= 1;

        if (!sampleOk) {
            return new CompanyTrustScore(
                companyId,
                company.getName(),
                closedPostings,
                closedApps,
                closedOffers,
                untouched,
                reviewed,
                null,
                null,
                null,
                null,
                "UNKNOWN",
                false,
                MIN_SAMPLE_SIZE,
                closedApps == 0
                    ? "No closed-role history yet"
                    : closedApps + " closed apps — need " + MIN_SAMPLE_SIZE + " for a trust score"
            );
        }

        double blackHoleRate = round1(untouched * 100.0 / closedApps);
        double interviewGhostRate = reviewed == 0 ? 0.0 : round1((reviewed - closedOffers) * 100.0 / reviewed);
        boolean zeroOfferGhost = reviewed >= 5 && closedOffers == 0;
        double ghostRate = round1(clamp(
            0.6 * blackHoleRate + 0.4 * (zeroOfferGhost ? 100.0 : interviewGhostRate),
            0, 100
        ));

        int offerFloorBonus = closedOffers >= 1 ? 5 : 0;
        int trustScore = (int) Math.round(clamp(100 - ghostRate + offerFloorBonus, 0, 100));
        String riskLevel = resolveRiskLevel(blackHoleRate, ghostRate, closedApps, closedOffers);

        String summary = untouched + " untouched of " + closedApps + " closed apps; "
            + closedOffers + " offer(s) on closed roles";

        return new CompanyTrustScore(
            companyId,
            company.getName(),
            closedPostings,
            closedApps,
            closedOffers,
            untouched,
            reviewed,
            blackHoleRate,
            interviewGhostRate,
            ghostRate,
            trustScore,
            riskLevel,
            true,
            MIN_SAMPLE_SIZE,
            summary
        );
    }

    private String resolveRiskLevel(double blackHoleRate, double ghostRate, long closedApps, long closedOffers) {
        if (blackHoleRate >= 50 || (closedApps >= 20 && closedOffers == 0)) {
            return "HIGH";
        }
        if (ghostRate >= 55 || blackHoleRate >= 30) {
            return "MEDIUM";
        }
        return "LOW";
    }

    private double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
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

    public record AnalyticsSummary(
        double placementRate,
        long totalStudents,
        long placedStudents,
        long pendingPostings,
        long openPostings,
        long closedPostings,
        long totalApplications,
        List<CompanyApplicationCount> applicationsPerCompany,
        Map<String, Long> postingsByStatus,
        List<CompanyTrustScore> ghostLeaderboard
    ) {
        public record CompanyApplicationCount(String companyName, long count) {}
    }

    public record CompanyAnalyticsSummary(long totalJobs, long totalApplications, long pendingReview, long shortlisted, long selected, long rejected) {}
}
