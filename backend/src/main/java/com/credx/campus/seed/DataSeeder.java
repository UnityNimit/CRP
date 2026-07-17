package com.credx.campus.seed;

import com.credx.campus.domain.application.Application;
import com.credx.campus.domain.application.ApplicationRepository;
import com.credx.campus.domain.application.ApplicationStatus;
import com.credx.campus.domain.company.CompanyProfile;
import com.credx.campus.domain.company.CompanyProfileRepository;
import com.credx.campus.domain.posting.JobPosting;
import com.credx.campus.domain.posting.JobPostingRepository;
import com.credx.campus.domain.posting.PostingMapper;
import com.credx.campus.domain.posting.PostingStatus;
import com.credx.campus.domain.student.StudentProfile;
import com.credx.campus.domain.student.StudentProfileRepository;
import com.credx.campus.domain.user.Role;
import com.credx.campus.domain.user.User;
import com.credx.campus.domain.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Component
@org.springframework.context.annotation.Profile("!test")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final JobPostingRepository postingRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;
    private final PostingMapper postingMapper;

    public DataSeeder(UserRepository userRepository,
                      CompanyProfileRepository companyProfileRepository,
                      StudentProfileRepository studentProfileRepository,
                      JobPostingRepository postingRepository,
                      ApplicationRepository applicationRepository,
                      PasswordEncoder passwordEncoder,
                      PostingMapper postingMapper) {
        this.userRepository = userRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.postingRepository = postingRepository;
        this.applicationRepository = applicationRepository;
        this.passwordEncoder = passwordEncoder;
        this.postingMapper = postingMapper;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        User admin = createUser("admin@campus.edu", "Placement Admin", Role.ADMIN);
        User companyUser = createUser("hr@techcorp.com", "TechCorp HR", Role.COMPANY);
        User companyUser2 = createUser("hr@finserve.com", "FinServe HR", Role.COMPANY);
        User student1 = createUser("alice@student.edu", "Alice Kumar", Role.STUDENT);
        User student2 = createUser("bob@student.edu", "Bob Sharma", Role.STUDENT);
        User student3 = createUser("carol@student.edu", "Carol Patel", Role.STUDENT);

        CompanyProfile techCorp = createCompany(companyUser, "TechCorp", "Leading technology company");
        CompanyProfile finServe = createCompany(companyUser2, "FinServe", "Financial services innovator");

        StudentProfile alice = createStudent(student1, "CSE", new BigDecimal("8.50"), 2026);
        StudentProfile bob = createStudent(student2, "ECE", new BigDecimal("7.80"), 2026);
        StudentProfile carol = createStudent(student3, "CSE", new BigDecimal("9.10"), 2026);

        JobPosting approved1 = createPosting(techCorp, "Software Engineer", PostingStatus.APPROVED, admin,
            new BigDecimal("7.5"), List.of("CSE", "IT"), 2026, LocalDate.now().plusDays(30));
        JobPosting approved2 = createPosting(finServe, "Data Analyst", PostingStatus.APPROVED, admin,
            new BigDecimal("7.0"), List.of("CSE", "ECE", "IT"), 2026, LocalDate.now().plusDays(20));
        createPosting(techCorp, "DevOps Intern", PostingStatus.PENDING, null,
            new BigDecimal("7.0"), List.of("CSE"), 2026, LocalDate.now().plusDays(15));
        createPosting(finServe, "Risk Analyst", PostingStatus.REJECTED, null,
            new BigDecimal("8.0"), List.of("ECE"), 2026, LocalDate.now().plusDays(10));

        createApplication(approved1, alice, ApplicationStatus.APPLIED);
        createApplication(approved1, carol, ApplicationStatus.SELECTED);
        createApplication(approved2, bob, ApplicationStatus.SHORTLISTED);
        createApplication(approved2, alice, ApplicationStatus.APPLIED);
    }

    private User createUser(String email, String name, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setDisplayName(name);
        user.setRole(role);
        user.setPasswordHash(passwordEncoder.encode("password123"));
        return userRepository.save(user);
    }

    private CompanyProfile createCompany(User user, String name, String desc) {
        CompanyProfile c = new CompanyProfile();
        c.setUser(user);
        c.setName(name);
        c.setDescription(desc);
        return companyProfileRepository.save(c);
    }

    private StudentProfile createStudent(User user, String branch, BigDecimal cgpa, int gradYear) {
        StudentProfile s = new StudentProfile();
        s.setUser(user);
        s.setBranch(branch);
        s.setCgpa(cgpa);
        s.setGradYear(gradYear);
        return studentProfileRepository.save(s);
    }

    private JobPosting createPosting(CompanyProfile company, String title, PostingStatus status, User approvedBy,
                                     BigDecimal minCgpa, List<String> branches, int gradYear, LocalDate deadline) {
        JobPosting p = new JobPosting();
        p.setCompany(company);
        p.setTitle(title);
        p.setDescription("Join " + company.getName() + " as " + title + ". Work on impactful projects with a talented team.");
        p.setMinCgpa(minCgpa);
        p.setAllowedBranches(postingMapper.toJson(branches));
        p.setGradYear(gradYear);
        p.setDeadline(deadline);
        p.setStatus(status);
        if (status == PostingStatus.APPROVED && approvedBy != null) {
            p.setApprovedAt(Instant.now());
            p.setApprovedBy(approvedBy);
        }
        if (status == PostingStatus.REJECTED) {
            p.setRejectionReason("Eligibility criteria too narrow for current batch.");
        }
        return postingRepository.save(p);
    }

    private void createApplication(JobPosting posting, StudentProfile student, ApplicationStatus status) {
        Application app = new Application();
        app.setPosting(posting);
        app.setStudent(student);
        app.setCoverNote("I am excited to apply for this role.");
        app.setStatus(status);
        applicationRepository.save(app);
    }
}
