package com.dearhand;

import com.dearhand.dto.helper.HelperApplyRequest;
import com.dearhand.dto.helper.HelperStatusUpdateRequest;
import com.dearhand.entity.AuditLog;
import com.dearhand.entity.HelperProfile;
import com.dearhand.entity.User;
import com.dearhand.enums.DocumentType;
import com.dearhand.enums.HelperStatus;
import com.dearhand.enums.Role;
import com.dearhand.enums.UserStatus;
import com.dearhand.repository.AuditLogRepository;
import com.dearhand.repository.HelperProfileRepository;
import com.dearhand.repository.UserRepository;
import com.dearhand.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class HelperOnboardingTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HelperProfileRepository helperProfileRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User helperUser;
    private HelperProfile helperProfile;
    private User adminUser;
    private User familyUser;

    private String helperJwt;
    private String adminJwt;
    private String familyJwt;

    @BeforeEach
    void setUp() {
        helperUser = userRepository.save(User.builder()
                .name("Basavaraj Gowda")
                .email("basava@example.com")
                .phone("+919988771122")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .role(Role.HELPER)
                .status(UserStatus.ACTIVE)
                .build());

        helperProfile = helperProfileRepository.save(HelperProfile.builder()
                .user(helperUser)
                .languages("Kannada")
                .status(HelperStatus.APPLIED)
                .build());

        adminUser = userRepository.save(User.builder()
                .name("Ops Admin")
                .email("ops@dearhand.in")
                .phone("+919988770000")
                .passwordHash(passwordEncoder.encode("AdminPass123!"))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        familyUser = userRepository.save(User.builder()
                .name("Naveen K")
                .email("naveen@example.com")
                .phone("+919988774433")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .role(Role.FAMILY)
                .status(UserStatus.ACTIVE)
                .build());

        helperJwt = jwtTokenProvider.generateToken(helperUser.getId(), helperUser.getEmail(), helperUser.getRole());
        adminJwt = jwtTokenProvider.generateToken(adminUser.getId(), adminUser.getEmail(), adminUser.getRole());
        familyJwt = jwtTokenProvider.generateToken(familyUser.getId(), familyUser.getEmail(), familyUser.getRole());
    }

    @Test
    @DisplayName("POST /api/v1/helpers/apply - Helper submits profile details")
    void shouldSubmitHelperApplication() throws Exception {
        HelperApplyRequest request = HelperApplyRequest.builder()
                .bio("10 years driving and companion experience for seniors in Mysuru")
                .languages("Kannada, English, Hindi")
                .skills("First Aid, Wheelchair Handling, Driving, Hospital Escort")
                .hasLicence(true)
                .licenceNo("KA09-2020-009876")
                .licenceExpiry(LocalDate.now().plusYears(4))
                .vehicleType("Maruti WagonR")
                .yearsExperience(10)
                .build();

        mockMvc.perform(post("/api/v1/helpers/apply")
                .header("Authorization", "Bearer " + helperJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.languages").value("Kannada, English, Hindi"))
                .andExpect(jsonPath("$.hasLicence").value(true))
                .andExpect(jsonPath("$.licenceNo").value("KA09-2020-009876"))
                .andExpect(jsonPath("$.yearsExperience").value(10));
    }

    @Test
    @DisplayName("POST /api/v1/helpers/apply - Should reject expired driving licence with 400")
    void shouldRejectExpiredLicence() throws Exception {
        HelperApplyRequest request = HelperApplyRequest.builder()
                .languages("Kannada")
                .hasLicence(true)
                .licenceNo("KA09-2010-001122")
                .licenceExpiry(LocalDate.now().minusDays(10)) // Expired
                .build();

        mockMvc.perform(post("/api/v1/helpers/apply")
                .header("Authorization", "Bearer " + helperJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Driving licence has already expired. DearHand requires a valid, current licence."));
    }

    @Test
    @DisplayName("POST /api/v1/helpers/documents - Helper uploads government ID")
    void shouldUploadDocumentSuccessfully() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "aadhar_front.pdf", "application/pdf", "dummy pdf content".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/helpers/documents")
                .file(file)
                .param("type", "GOVERNMENT_ID")
                .header("Authorization", "Bearer " + helperJwt))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("GOVERNMENT_ID"))
                .andExpect(jsonPath("$.fileKey").isString());
    }

    @Test
    @DisplayName("GET /api/v1/admin/helpers - Non-admin (Family) access is refused with 403")
    void shouldRefuseNonAdminAccessToAdminHelpers() throws Exception {
        mockMvc.perform(get("/api/v1/admin/helpers")
                .header("Authorization", "Bearer " + familyJwt))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PUT /api/v1/admin/helpers/{id}/status - Admin moves helper status to APPROVED and writes audit log")
    void shouldApproveHelperAndWriteAuditLog() throws Exception {
        HelperStatusUpdateRequest request = HelperStatusUpdateRequest.builder()
                .status(HelperStatus.APPROVED)
                .reasonOrNotes("Verified original licence, police certificate clear, reference interviewed.")
                .build();

        mockMvc.perform(put("/api/v1/admin/helpers/" + helperProfile.getId() + "/status")
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        // Verify status in DB
        HelperProfile updated = helperProfileRepository.findById(helperProfile.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(HelperStatus.APPROVED);

        // Verify Audit Log recorded
        List<AuditLog> audits = auditLogRepository.findByEntityAndEntityIdOrderByCreatedAtDesc("HelperProfile", helperProfile.getId());
        assertThat(audits).isNotEmpty();
        assertThat(audits.get(0).getAction()).contains("HELPER_STATUS_CHANGE");
        assertThat(audits.get(0).getAction()).contains("APPROVED");
        assertThat(audits.get(0).getActor().getEmail()).isEqualTo("ops@dearhand.in");
    }
}
