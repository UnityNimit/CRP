package com.credx.campus;

import com.credx.campus.domain.auth.LoginRequest;
import com.credx.campus.domain.application.ApplicationRepository;
import com.credx.campus.domain.company.CompanyProfile;
import com.credx.campus.domain.company.CompanyProfileRepository;
import com.credx.campus.domain.posting.*;
import com.credx.campus.domain.user.Role;
import com.credx.campus.domain.user.User;
import com.credx.campus.domain.user.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PostingVisibilityIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired ApplicationRepository applicationRepository;
    @Autowired UserRepository userRepository;
    @Autowired CompanyProfileRepository companyProfileRepository;
    @Autowired JobPostingRepository postingRepository;
    @Autowired PasswordEncoder passwordEncoder;

    private Long pendingPostingId;
    private String studentToken;
    private String companyToken;

    @BeforeEach
    void setUp() throws Exception {
        applicationRepository.deleteAll();
        postingRepository.deleteAll();
        companyProfileRepository.deleteAll();
        userRepository.deleteAll();

        User companyUser = new User();
        companyUser.setEmail("company@test.com");
        companyUser.setDisplayName("Test Co");
        companyUser.setRole(Role.COMPANY);
        companyUser.setPasswordHash(passwordEncoder.encode("pass"));
        companyUser = userRepository.save(companyUser);

        CompanyProfile company = new CompanyProfile();
        company.setUser(companyUser);
        company.setName("TestCorp");
        company = companyProfileRepository.save(company);

        User student = new User();
        student.setEmail("student@test.com");
        student.setDisplayName("Student");
        student.setRole(Role.STUDENT);
        student.setPasswordHash(passwordEncoder.encode("pass"));
        userRepository.save(student);

        JobPosting pending = new JobPosting();
        pending.setCompany(company);
        pending.setTitle("Hidden Role");
        pending.setDescription("Should not be visible");
        pending.setMinCgpa(new BigDecimal("7.0"));
        pending.setAllowedBranches("[\"CSE\"]");
        pending.setGradYear(2026);
        pending.setDeadline(LocalDate.now().plusDays(10));
        pending.setStatus(PostingStatus.PENDING);
        pendingPostingId = postingRepository.save(pending).getId();

        studentToken = login("student@test.com", "pass");
        companyToken = login("company@test.com", "pass");
    }

    @Test
    void studentCannotSeePendingPosting() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/student/postings")
                .header("Authorization", "Bearer " + studentToken))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(body.get("content").toString()).doesNotContain("Hidden Role");
    }

    @Test
    void studentCannotGetPendingPostingById() throws Exception {
        mockMvc.perform(get("/api/v1/student/postings/" + pendingPostingId)
                .header("Authorization", "Bearer " + studentToken))
            .andExpect(status().isNotFound());
    }

    @Test
    void companyCanCreatePendingPosting() throws Exception {
        CreatePostingRequest req = new CreatePostingRequest(
            "New Role", "Description", new BigDecimal("7.0"),
            List.of("CSE"), 2026, LocalDate.now().plusDays(5)
        );
        MvcResult result = mockMvc.perform(post("/api/v1/company/postings")
                .header("Authorization", "Bearer " + companyToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(body.get("status").asText()).isEqualTo("PENDING");
    }

    private String login(String email, String password) throws Exception {
        LoginRequest req = new LoginRequest(email, password);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }
}
