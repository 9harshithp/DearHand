package com.dearhand;

import com.dearhand.dto.auth.LoginRequest;
import com.dearhand.entity.User;
import com.dearhand.enums.Role;
import com.dearhand.enums.UserStatus;
import com.dearhand.repository.UserRepository;
import com.dearhand.security.RateLimitingFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "dearhand.rate-limiting.enabled=true",
        "dearhand.rate-limiting.limit-per-minute=5"
})
@Transactional
class SecurityHardeningTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RateLimitingFilter rateLimitingFilter;

    private User testUser;

    @BeforeEach
    void setUp() {
        rateLimitingFilter.clearLimits();

        String suffix = String.valueOf(System.nanoTime());
        testUser = userRepository.save(User.builder()
                .name("Security Audit User")
                .email("audit." + suffix + "@dearhand.in")
                .phone("919988776655")
                .passwordHash(passwordEncoder.encode("SecretAudit123!"))
                .role(Role.FAMILY)
                .status(UserStatus.ACTIVE)
                .build());
    }

    @Test
    @DisplayName("Security headers (X-Frame-Options, X-Content-Type-Options, HSTS) are strictly present")
    void testSecurityHeaders() throws Exception {
        mockMvc.perform(get("/api/v1/health").secure(true))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().exists("Strict-Transport-Security"));
    }

    @Test
    @DisplayName("Brute force rate limiting blocks client with 429 when threshold exceeded")
    void testRateLimitingOnLogin() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .usernameOrEmail(testUser.getEmail())
                .password("SecretAudit123!")
                .build();

        // 5 allowed requests
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk());
        }

        // 6th request should be rejected with 429 Too Many Requests
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("Retry-After", "60"))
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.error").value("Too Many Requests"));
    }

    @Test
    @DisplayName("Non-rate-limited endpoints are unaffected by rate limiting filter")
    void testNonRateLimitedEndpoints() throws Exception {
        // Health check should not be restricted
        for (int i = 0; i < 8; i++) {
            mockMvc.perform(get("/api/v1/health"))
                    .andExpect(status().isOk());
        }
    }
}
