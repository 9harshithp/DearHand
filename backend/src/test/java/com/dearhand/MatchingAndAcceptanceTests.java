package com.dearhand;

import com.dearhand.dto.booking.AssignHelperRequest;
import com.dearhand.dto.booking.HelperAcceptanceRequest;
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
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class MatchingAndAcceptanceTests {

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
    private NotificationRepository notificationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User adminUser;
    private User familyUser;
    private User helperUser1;
    private User helperUser2;
    private HelperProfile approvedHelper1;
    private HelperProfile pendingHelper2;
    private Parent parent;
    private CarePackage testPackage;
    private Booking testBooking;

    private String adminToken;
    private String familyToken;
    private String helper1Token;
    private String helper2Token;

    @BeforeEach
    void setup() {
        notificationRepository.deleteAll();
        bookingRepository.deleteAll();
        helperProfileRepository.deleteAll();
        parentRepository.deleteAll();
        userRepository.deleteAll();
        packageRepository.deleteAll();

        // 1. Admin
        adminUser = userRepository.save(User.builder()
                .name("Admin User")
                .email("admin_match@dearhand.com")
                .passwordHash(passwordEncoder.encode("Secret123!"))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .phone("+919999990001")
                .build());
        adminToken = jwtTokenProvider.generateToken(adminUser.getId(), adminUser.getEmail(), adminUser.getRole());

        // 2. Family
        familyUser = userRepository.save(User.builder()
                .name("Arun Kumar")
                .email("arun_match@example.com")
                .passwordHash(passwordEncoder.encode("Secret123!"))
                .role(Role.FAMILY)
                .status(UserStatus.ACTIVE)
                .phone("+919888880001")
                .build());
        familyToken = jwtTokenProvider.generateToken(familyUser.getId(), familyUser.getEmail(), familyUser.getRole());

        // 3. Helper 1 (Approved)
        helperUser1 = userRepository.save(User.builder()
                .name("Manjunath Gowda")
                .email("manju_match@dearhand.com")
                .passwordHash(passwordEncoder.encode("Secret123!"))
                .role(Role.HELPER)
                .status(UserStatus.ACTIVE)
                .phone("+919777770001")
                .build());
        helper1Token = jwtTokenProvider.generateToken(helperUser1.getId(), helperUser1.getEmail(), helperUser1.getRole());

        approvedHelper1 = helperProfileRepository.save(HelperProfile.builder()
                .user(helperUser1)
                .bio("Experienced companion for seniors in Mysuru")
                .languages("Kannada, English")
                .skills("Mobility, Hospital visits, Medication reminder")
                .hasLicence(true)
                .licenceNo("KA-09-2020-0012")
                .licenceExpiry(java.time.LocalDate.now().plusYears(1))
                .vehicleType("Two-wheeler")
                .yearsExperience(4)
                .status(HelperStatus.APPROVED)
                .ratingAvg(BigDecimal.valueOf(4.9))
                .build());

        // 4. Helper 2 (Pending verification - not approved)
        helperUser2 = userRepository.save(User.builder()
                .name("Ramesh Kumar")
                .email("ramesh_match@dearhand.com")
                .passwordHash(passwordEncoder.encode("Secret123!"))
                .role(Role.HELPER)
                .status(UserStatus.ACTIVE)
                .phone("+919777770002")
                .build());
        helper2Token = jwtTokenProvider.generateToken(helperUser2.getId(), helperUser2.getEmail(), helperUser2.getRole());

        pendingHelper2 = helperProfileRepository.save(HelperProfile.builder()
                .user(helperUser2)
                .bio("New applicant")
                .languages("Kannada")
                .skills("Grocery")
                .hasLicence(false)
                .status(HelperStatus.APPLIED)
                .yearsExperience(1)
                .build());

        // 5. Parent & Package
        parent = parentRepository.save(Parent.builder()
                .familyUser(familyUser)
                .name("Srinivasa Murthy")
                .age(74)
                .address("102 Gokulam 3rd Stage, Mysuru")
                .city("Mysuru")
                .language("Kannada")
                .emergencyContactName("Arun Kumar")
                .emergencyContactPhone("+919888880001")
                .build());

        testPackage = packageRepository.save(CarePackage.builder()
                .name("Hospital Visit Assistant")
                .type(PackageType.TASK)
                .basePrice(new BigDecimal("799.00"))
                .durationHours(3)
                .active(true)
                .build());

        // 6. Booking in REQUESTED status
        testBooking = bookingRepository.save(Booking.builder()
                .family(familyUser)
                .parent(parent)
                .carePackage(testPackage)
                .scheduledStart(Instant.now().plus(2, ChronoUnit.DAYS))
                .scheduledEnd(Instant.now().plus(2, ChronoUnit.DAYS).plus(3, ChronoUnit.HOURS))
                .address(parent.getAddress())
                .taskNotes("Appointment with Dr. Rao at Apollo Mysuru at 10:30 AM")
                .status(BookingStatus.REQUESTED)
                .totalAmount(testPackage.getBasePrice())
                .build());
    }

    @Test
    @DisplayName("Admin successfully assigns approved helper: status becomes MATCHED, helper is notified, audit logged")
    void testAdminAssignsApprovedHelper() throws Exception {
        AssignHelperRequest req = AssignHelperRequest.builder()
                .helperId(approvedHelper1.getId())
                .build();

        mockMvc.perform(post("/api/v1/admin/bookings/" + testBooking.getId() + "/assign")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testBooking.getId()))
                .andExpect(jsonPath("$.status").value("MATCHED"))
                .andExpect(jsonPath("$.helper.id").value(approvedHelper1.getId()))
                .andExpect(jsonPath("$.helper.name").value("Manjunath Gowda"));

        // Verify notification was recorded for helper
        List<Notification> notifs = notificationRepository.findAll();
        assertThat(notifs).isNotEmpty();
        assertThat(notifs.get(0).getUser().getId()).isEqualTo(helperUser1.getId());
        assertThat(notifs.get(0).getTemplate()).contains("NEW_VISIT_REQUEST");

        // Verify audit log
        List<AuditLog> audits = auditLogRepository.findAll();
        assertThat(audits).anyMatch(a -> a.getAction().contains("ASSIGN_HELPER") && a.getEntityId().equals(testBooking.getId()));
    }

    @Test
    @DisplayName("Admin cannot assign unapproved helper: returns 400 Bad Request")
    void testAdminCannotAssignUnapprovedHelper() throws Exception {
        AssignHelperRequest req = AssignHelperRequest.builder()
                .helperId(pendingHelper2.getId())
                .build();

        mockMvc.perform(post("/api/v1/admin/bookings/" + testBooking.getId() + "/assign")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Only approved helpers can be assigned")));
    }

    @Test
    @DisplayName("Non-admin user cannot access admin assign endpoint: returns 403 Forbidden")
    void testNonAdminCannotAssignHelper() throws Exception {
        AssignHelperRequest req = AssignHelperRequest.builder()
                .helperId(approvedHelper1.getId())
                .build();

        mockMvc.perform(post("/api/v1/admin/bookings/" + testBooking.getId() + "/assign")
                        .header("Authorization", "Bearer " + familyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Assigned helper accepts visit: status moves to ACCEPTED, family notified, audit logged")
    void testAssignedHelperAcceptsVisit() throws Exception {
        // First match the helper
        testBooking.setHelper(approvedHelper1);
        testBooking.setStatus(BookingStatus.MATCHED);
        bookingRepository.save(testBooking);

        HelperAcceptanceRequest req = HelperAcceptanceRequest.builder()
                .accept(true)
                .build();

        mockMvc.perform(post("/api/v1/bookings/" + testBooking.getId() + "/accept")
                        .header("Authorization", "Bearer " + helper1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testBooking.getId()))
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        // Verify notification sent to family
        List<Notification> notifs = notificationRepository.findAll();
        assertThat(notifs).anyMatch(n -> n.getUser().getId().equals(familyUser.getId()) && n.getTemplate().contains("HELPER_ACCEPTED"));

        // Verify audit log
        List<AuditLog> audits = auditLogRepository.findAll();
        assertThat(audits).anyMatch(a -> a.getAction().contains("HELPER_ACCEPTED") && a.getEntityId().equals(testBooking.getId()));
    }

    @Test
    @DisplayName("Assigned helper declines visit: helper unset, reverts to REQUESTED in admin queue")
    void testAssignedHelperDeclinesVisit() throws Exception {
        testBooking.setHelper(approvedHelper1);
        testBooking.setStatus(BookingStatus.MATCHED);
        bookingRepository.save(testBooking);

        HelperAcceptanceRequest req = HelperAcceptanceRequest.builder()
                .accept(false)
                .reason("Schedule conflict with another family")
                .build();

        mockMvc.perform(post("/api/v1/bookings/" + testBooking.getId() + "/accept")
                        .header("Authorization", "Bearer " + helper1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testBooking.getId()))
                .andExpect(jsonPath("$.status").value("REQUESTED"))
                .andExpect(jsonPath("$.helper").doesNotExist());

        // Check in database
        Booking refreshed = bookingRepository.findById(testBooking.getId()).orElseThrow();
        assertThat(refreshed.getStatus()).isEqualTo(BookingStatus.REQUESTED);
        assertThat(refreshed.getHelper()).isNull();

        // Verify audit log
        List<AuditLog> audits = auditLogRepository.findAll();
        assertThat(audits).anyMatch(a -> a.getAction().contains("HELPER_DECLINED") && a.getAction().contains("Schedule conflict"));
    }

    @Test
    @DisplayName("Wrong helper cannot accept assignment for another helper: returns 403 Forbidden")
    void testWrongHelperCannotAcceptAssignment() throws Exception {
        testBooking.setHelper(approvedHelper1);
        testBooking.setStatus(BookingStatus.MATCHED);
        bookingRepository.save(testBooking);

        HelperAcceptanceRequest req = HelperAcceptanceRequest.builder()
                .accept(true)
                .build();

        // helper2 attempts to accept helper1's booking
        mockMvc.perform(post("/api/v1/bookings/" + testBooking.getId() + "/accept")
                        .header("Authorization", "Bearer " + helper2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin booking board groups bookings correctly by queue")
    void testAdminBookingBoard() throws Exception {
        // Create an accepted booking too
        Booking acceptedBooking = bookingRepository.save(Booking.builder()
                .family(familyUser)
                .parent(parent)
                .carePackage(testPackage)
                .scheduledStart(Instant.now().plus(3, ChronoUnit.DAYS))
                .scheduledEnd(Instant.now().plus(3, ChronoUnit.DAYS).plus(3, ChronoUnit.HOURS))
                .address(parent.getAddress())
                .status(BookingStatus.ACCEPTED)
                .helper(approvedHelper1)
                .totalAmount(testPackage.getBasePrice())
                .build());

        mockMvc.perform(get("/api/v1/admin/bookings/board")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unassignedQueue").isArray())
                .andExpect(jsonPath("$.unassignedQueue[0].id").value(testBooking.getId()))
                .andExpect(jsonPath("$.acceptedAndPendingPayment").isArray())
                .andExpect(jsonPath("$.acceptedAndPendingPayment[0].id").value(acceptedBooking.getId()))
                .andExpect(jsonPath("$.awaitingAcceptance").isArray());
    }
}
