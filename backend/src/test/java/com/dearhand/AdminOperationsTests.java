package com.dearhand;

import com.dearhand.dto.admin.CreatePackageRequest;
import com.dearhand.dto.admin.IncidentStatusUpdateRequest;
import com.dearhand.dto.admin.UpdatePackageRequest;
import com.dearhand.entity.*;
import com.dearhand.enums.*;
import com.dearhand.repository.*;
import com.dearhand.security.JwtTokenProvider;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AdminOperationsTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HelperProfileRepository helperProfileRepository;

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User adminUser;
    private User familyUser;
    private User otherFamilyUser;
    private User helperUser;
    private String adminToken;
    private String familyToken;
    private String otherFamilyToken;

    private CarePackage testPackage;
    private Booking testBooking;
    private Incident testIncident;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        String suffix = String.valueOf(System.nanoTime());

        adminUser = userRepository.save(User.builder()
                .name("Admin Boss")
                .email("admin." + suffix + "@dearhand.in")
                .phone("9199999" + suffix.substring(suffix.length() - 5))
                .passwordHash(passwordEncoder.encode("Secret123!"))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        familyUser = userRepository.save(User.builder()
                .name("Arun Kumar")
                .email("arun." + suffix + "@gmail.com")
                .phone("9198888" + suffix.substring(suffix.length() - 5))
                .passwordHash(passwordEncoder.encode("Secret123!"))
                .role(Role.FAMILY)
                .status(UserStatus.ACTIVE)
                .build());

        otherFamilyUser = userRepository.save(User.builder()
                .name("Ramesh Rao")
                .email("ramesh." + suffix + "@gmail.com")
                .phone("9197777" + suffix.substring(suffix.length() - 5))
                .passwordHash(passwordEncoder.encode("Secret123!"))
                .role(Role.FAMILY)
                .status(UserStatus.ACTIVE)
                .build());

        helperUser = userRepository.save(User.builder()
                .name("Naveen Gowda")
                .email("naveen." + suffix + "@gmail.com")
                .phone("9196666" + suffix.substring(suffix.length() - 5))
                .passwordHash(passwordEncoder.encode("Secret123!"))
                .role(Role.HELPER)
                .status(UserStatus.ACTIVE)
                .build());

        HelperProfile helperProfile = helperProfileRepository.save(HelperProfile.builder()
                .user(helperUser)
                .languages("Kannada, English")
                .status(HelperStatus.APPROVED)
                .ratingAvg(BigDecimal.valueOf(4.5))
                .build());

        adminToken = jwtTokenProvider.generateToken(adminUser.getId(), adminUser.getEmail(), adminUser.getRole());
        familyToken = jwtTokenProvider.generateToken(familyUser.getId(), familyUser.getEmail(), familyUser.getRole());
        otherFamilyToken = jwtTokenProvider.generateToken(otherFamilyUser.getId(), otherFamilyUser.getEmail(), otherFamilyUser.getRole());

        Parent parent = parentRepository.save(Parent.builder()
                .familyUser(familyUser)
                .name("Saraswathi Amma")
                .age(75)
                .city("Mysuru")
                .address("Jayalakshmipuram")
                .emergencyContactName("Arun Kumar")
                .emergencyContactPhone("919888800000")
                .build());

        testPackage = packageRepository.save(CarePackage.builder()
                .name("Doctor Escort")
                .type(PackageType.TASK)
                .durationHours(3)
                .basePrice(new BigDecimal("799.00"))
                .active(true)
                .build());

        testBooking = bookingRepository.save(Booking.builder()
                .family(familyUser)
                .parent(parent)
                .carePackage(testPackage)
                .helper(helperProfile)
                .scheduledStart(Instant.now().plus(1, java.time.temporal.ChronoUnit.DAYS))
                .scheduledEnd(Instant.now().plus(1, java.time.temporal.ChronoUnit.DAYS).plus(3, java.time.temporal.ChronoUnit.HOURS))
                .status(BookingStatus.IN_PROGRESS)
                .totalAmount(new BigDecimal("799.00"))
                .address("Jayalakshmipuram")
                .build());

        testIncident = incidentRepository.save(Incident.builder()
                .booking(testBooking)
                .reportedBy(familyUser)
                .description("Helper arrived late by 30 mins")
                .severity(IncidentSeverity.MEDIUM)
                .status(IncidentStatus.OPEN)
                .build());

        testNotification = notificationRepository.save(Notification.builder()
                .user(familyUser)
                .channel(NotificationChannel.IN_APP)
                .template("Your helper has checked in for Booking #" + testBooking.getId())
                .status(NotificationStatus.SENT)
                .sentAt(Instant.now())
                .build());
    }

    // --- Incident Tests ---

    @Test
    @DisplayName("Admin can list all incidents and filter by status")
    void testAdminListIncidents() throws Exception {
        mockMvc.perform(get("/api/v1/admin/incidents")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].description").value("Helper arrived late by 30 mins"))
                .andExpect(jsonPath("$[0].parentName").value("Saraswathi Amma"))
                .andExpect(jsonPath("$[0].helperName").value("Naveen Gowda"));

        mockMvc.perform(get("/api/v1/admin/incidents?status=OPEN")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].status").value("OPEN"));

        // Non-admin gets 403 Forbidden
        mockMvc.perform(get("/api/v1/admin/incidents")
                        .header("Authorization", "Bearer " + familyToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin can resolve incident with resolution notes and audit logging")
    void testAdminResolveIncident() throws Exception {
        IncidentStatusUpdateRequest updateReq = IncidentStatusUpdateRequest.builder()
                .status(IncidentStatus.RESOLVED)
                .resolutionNotes("Spoke with helper and family; 20% discount coupon issued.")
                .build();

        mockMvc.perform(put("/api/v1/admin/incidents/" + testIncident.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"))
                .andExpect(jsonPath("$.description").value(org.hamcrest.Matchers.containsString("Spoke with helper and family")));

        Incident resolved = incidentRepository.findById(testIncident.getId()).orElseThrow();
        assertThat(resolved.getStatus()).isEqualTo(IncidentStatus.RESOLVED);

        // Verify audit log entry was created
        List<AuditLog> auditLogs = auditLogRepository.findByEntityAndEntityIdOrderByCreatedAtDesc("Incident", testIncident.getId());
        assertThat(auditLogs).isNotEmpty();
        assertThat(auditLogs.get(0).getAction()).contains("INCIDENT_STATUS_CHANGE");
    }

    // --- Package Management Tests ---

    @Test
    @DisplayName("Admin can list, create, and update care packages")
    void testAdminPackageManagement() throws Exception {
        // 1. List all packages
        mockMvc.perform(get("/api/v1/admin/packages")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // 2. Create new package
        CreatePackageRequest createReq = CreatePackageRequest.builder()
                .name("Hospital Discharge Escort")
                .type(PackageType.TASK)
                .durationHours(4)
                .basePrice(new BigDecimal("1299.00"))
                .active(true)
                .build();

        mockMvc.perform(post("/api/v1/admin/packages")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Hospital Discharge Escort"))
                .andExpect(jsonPath("$.basePrice").value(1299.00));

        // 3. Update existing package
        UpdatePackageRequest updateReq = UpdatePackageRequest.builder()
                .name("Doctor Escort Premium")
                .basePrice(new BigDecimal("899.00"))
                .active(true)
                .build();

        mockMvc.perform(put("/api/v1/admin/packages/" + testPackage.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Doctor Escort Premium"))
                .andExpect(jsonPath("$.basePrice").value(899.00));

        // 4. Non-admin cannot modify packages
        mockMvc.perform(put("/api/v1/admin/packages/" + testPackage.getId())
                        .header("Authorization", "Bearer " + familyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isForbidden());
    }

    // --- Audit Trail Tests ---

    @Test
    @DisplayName("Admin can view audit log history while non-admin is blocked")
    void testAdminAuditLogs() throws Exception {
        mockMvc.perform(get("/api/v1/admin/audit-logs")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/v1/admin/audit-logs")
                        .header("Authorization", "Bearer " + familyToken))
                .andExpect(status().isForbidden());
    }

    // --- Notification Tests ---

    @Test
    @DisplayName("User can read their notification feed, unread count, and mark notifications as read")
    void testUserNotificationFeed() throws Exception {
        // 1. Get user feed
        mockMvc.perform(get("/api/v1/notifications/me")
                        .header("Authorization", "Bearer " + familyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(1))
                .andExpect(jsonPath("$.notifications[0].id").value(testNotification.getId()));

        // 2. Mark as read
        mockMvc.perform(put("/api/v1/notifications/" + testNotification.getId() + "/read")
                        .header("Authorization", "Bearer " + familyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READ"));

        Notification updated = notificationRepository.findById(testNotification.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(NotificationStatus.READ);

        // 3. Unread count is now 0
        mockMvc.perform(get("/api/v1/notifications/me")
                        .header("Authorization", "Bearer " + familyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(0));

        // 4. Other user cannot mark this notification as read (ownership check)
        mockMvc.perform(put("/api/v1/notifications/" + testNotification.getId() + "/read")
                        .header("Authorization", "Bearer " + otherFamilyToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin can view all multi-channel notifications in the system")
    void testAdminNotificationList() throws Exception {
        mockMvc.perform(get("/api/v1/admin/notifications")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].channel").value("IN_APP"));
    }
}
