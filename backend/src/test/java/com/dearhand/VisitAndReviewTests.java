package com.dearhand;

import com.dearhand.dto.visit.EmergencyAlertRequest;
import com.dearhand.dto.visit.ReviewRequest;
import com.dearhand.dto.visit.VisitCheckoutRequest;
import com.dearhand.dto.visit.VisitUpdateRequest;
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
import org.springframework.mock.web.MockMultipartFile;
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
class VisitAndReviewTests {

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
    private PaymentRepository paymentRepository;

    @Autowired
    private VisitLogRepository visitLogRepository;

    @Autowired
    private ReviewRepository reviewRepository;

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

    private User familyUser;
    private User helperUser1;
    private User helperUser2;
    private HelperProfile helperProfile1;
    private HelperProfile helperProfile2;
    private Parent parent;
    private CarePackage carePackage;
    private Booking paidBooking;

    private String familyToken;
    private String helper1Token;
    private String helper2Token;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        incidentRepository.deleteAll();
        reviewRepository.deleteAll();
        visitLogRepository.deleteAll();
        paymentRepository.deleteAll();
        bookingRepository.deleteAll();
        helperProfileRepository.deleteAll();
        parentRepository.deleteAll();
        userRepository.deleteAll();
        packageRepository.deleteAll();

        // 1. Family
        familyUser = userRepository.save(User.builder()
                .name("Sudha Murthy")
                .email("sudha_visit@example.com")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .role(Role.FAMILY)
                .status(UserStatus.ACTIVE)
                .phone("+919988112233")
                .build());
        familyToken = jwtTokenProvider.generateToken(familyUser.getId(), familyUser.getEmail(), familyUser.getRole());

        // 2. Helper 1 (Assigned)
        helperUser1 = userRepository.save(User.builder()
                .name("Anand Kumar")
                .email("anand_visit@example.com")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .role(Role.HELPER)
                .status(UserStatus.ACTIVE)
                .phone("+919988771122")
                .build());
        helper1Token = jwtTokenProvider.generateToken(helperUser1.getId(), helperUser1.getEmail(), helperUser1.getRole());

        helperProfile1 = helperProfileRepository.save(HelperProfile.builder()
                .user(helperUser1)
                .languages("Kannada, English")
                .skills("Elderly care, Mobility, Cooking")
                .hasLicence(true)
                .licenceNo("KA-09-2021-0088")
                .licenceExpiry(java.time.LocalDate.now().plusYears(1))
                .vehicleType("Two-wheeler")
                .yearsExperience(5)
                .status(HelperStatus.APPROVED)
                .ratingAvg(BigDecimal.valueOf(4.5))
                .build());

        // 3. Helper 2 (Unrelated helper)
        helperUser2 = userRepository.save(User.builder()
                .name("Raju Shetty")
                .email("raju_visit@example.com")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .role(Role.HELPER)
                .status(UserStatus.ACTIVE)
                .phone("+919988771133")
                .build());
        helper2Token = jwtTokenProvider.generateToken(helperUser2.getId(), helperUser2.getEmail(), helperUser2.getRole());

        helperProfile2 = helperProfileRepository.save(HelperProfile.builder()
                .user(helperUser2)
                .languages("Kannada")
                .skills("Errands")
                .status(HelperStatus.APPROVED)
                .ratingAvg(BigDecimal.valueOf(4.0))
                .build());

        // 4. Parent
        parent = parentRepository.save(Parent.builder()
                .familyUser(familyUser)
                .name("Narayana Murthy")
                .age(78)
                .address("24 Saraswathipuram, Mysuru")
                .city("Mysuru")
                .language("Kannada")
                .emergencyContactName("Sudha Murthy")
                .emergencyContactPhone("+919988112233")
                .build());

        // 5. Package
        carePackage = packageRepository.save(CarePackage.builder()
                .name("Single Task Care (2 Hours)")
                .type(PackageType.TASK)
                .durationHours(2)
                .basePrice(new BigDecimal("499.00"))
                .active(true)
                .build());

        // 6. Paid Booking
        paidBooking = bookingRepository.save(Booking.builder()
                .family(familyUser)
                .parent(parent)
                .carePackage(carePackage)
                .helper(helperProfile1)
                .scheduledStart(Instant.now().plus(1, ChronoUnit.DAYS))
                .scheduledEnd(Instant.now().plus(1, ChronoUnit.DAYS).plus(2, ChronoUnit.HOURS))
                .address(parent.getAddress())
                .status(BookingStatus.PAID)
                .totalAmount(carePackage.getBasePrice())
                .build());

        Payment payment = paymentRepository.save(Payment.builder()
                .booking(paidBooking)
                .amount(paidBooking.getTotalAmount())
                .status(PaymentStatus.SUCCESS)
                .paidAt(Instant.now())
                .razorpayOrderId("order_test_paid_123")
                .razorpayPaymentId("pay_test_paid_456")
                .build());
        paidBooking.setPayment(payment);
        bookingRepository.save(paidBooking);
    }

    @Test
    @DisplayName("POST /api/v1/bookings/{id}/checkin - Assigned helper checks in, moves to IN_PROGRESS")
    void shouldCheckinSuccessfully() throws Exception {
        mockMvc.perform(post("/api/v1/bookings/" + paidBooking.getId() + "/checkin")
                        .header("Authorization", "Bearer " + helper1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(paidBooking.getId()))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.checkinAt").isNotEmpty());

        // Verify family notified
        List<Notification> notifs = notificationRepository.findAll();
        assertThat(notifs).anyMatch(n -> n.getUser().getId().equals(familyUser.getId()) && n.getTemplate().contains("VISIT_STARTED"));

        // Verify audit log
        List<AuditLog> audits = auditLogRepository.findAll();
        assertThat(audits).anyMatch(a -> a.getAction().contains("VISIT_CHECKIN"));
    }

    @Test
    @DisplayName("POST /api/v1/bookings/{id}/checkin - Refuses checkin if booking is not in PAID status")
    void shouldRefuseCheckinIfUnpaid() throws Exception {
        paidBooking.setStatus(BookingStatus.REQUESTED);
        bookingRepository.save(paidBooking);

        mockMvc.perform(post("/api/v1/bookings/" + paidBooking.getId() + "/checkin")
                        .header("Authorization", "Bearer " + helper1Token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Helper can only check in for PAID bookings")));
    }

    @Test
    @DisplayName("POST /api/v1/bookings/{id}/checkin - Wrong helper cannot check in (403 Forbidden)")
    void shouldRefuseWrongHelperCheckin() throws Exception {
        mockMvc.perform(post("/api/v1/bookings/" + paidBooking.getId() + "/checkin")
                        .header("Authorization", "Bearer " + helper2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/v1/bookings/{id}/update - Helper logs visit notes and photo")
    void shouldUpdateVisitWithNotesAndPhoto() throws Exception {
        // First check in
        paidBooking.setStatus(BookingStatus.IN_PROGRESS);
        VisitLog log = visitLogRepository.save(VisitLog.builder()
                .booking(paidBooking)
                .checkinAt(Instant.now())
                .build());
        paidBooking.setVisitLog(log);
        bookingRepository.save(paidBooking);

        MockMultipartFile photo = new MockMultipartFile(
                "photo", "hospital_slip.jpg", "image/jpeg", "test image content".getBytes());

        mockMvc.perform(multipart("/api/v1/bookings/" + paidBooking.getId() + "/update")
                        .file(photo)
                        .param("notes", "Doctor prescribed eye drops. Assisted parent with eye clinic checkup.")
                        .header("Authorization", "Bearer " + helper1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.visitNotes").value(org.hamcrest.Matchers.containsString("Doctor prescribed eye drops")))
                .andExpect(jsonPath("$.photoKeys").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/v1/bookings/{id}/checkout - Helper completes visit, moves to COMPLETED, requests review")
    void shouldCheckoutSuccessfully() throws Exception {
        paidBooking.setStatus(BookingStatus.IN_PROGRESS);
        VisitLog log = visitLogRepository.save(VisitLog.builder()
                .booking(paidBooking)
                .checkinAt(Instant.now().minus(2, ChronoUnit.HOURS))
                .build());
        paidBooking.setVisitLog(log);
        bookingRepository.save(paidBooking);

        VisitCheckoutRequest req = VisitCheckoutRequest.builder()
                .notes("All medicines purchased from Apollo Pharmacy, parent safely back at home.")
                .build();

        mockMvc.perform(post("/api/v1/bookings/" + paidBooking.getId() + "/checkout")
                        .header("Authorization", "Bearer " + helper1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.checkoutAt").isNotEmpty());

        // Verify notification sent to family to review
        List<Notification> notifs = notificationRepository.findAll();
        assertThat(notifs).anyMatch(n -> n.getUser().getId().equals(familyUser.getId()) && n.getTemplate().contains("VISIT_COMPLETED"));
    }

    @Test
    @DisplayName("POST /api/v1/bookings/{id}/review - Family submits 5-star rating, updates helper rolling avg")
    void shouldSubmitReviewAndUpdateHelperRating() throws Exception {
        paidBooking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(paidBooking);

        ReviewRequest req = ReviewRequest.builder()
                .rating(5)
                .comment("Anand was punctual, caring, and kept me updated throughout my father's appointment!")
                .build();

        mockMvc.perform(post("/api/v1/bookings/" + paidBooking.getId() + "/review")
                        .header("Authorization", "Bearer " + familyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.reviewComment").value(org.hamcrest.Matchers.containsString("punctual, caring")));

        // Verify helper profile rating updated
        HelperProfile updatedHelper = helperProfileRepository.findById(helperProfile1.getId()).orElseThrow();
        assertThat(updatedHelper.getRatingAvg()).isEqualByComparingTo("5.00");
    }

    @Test
    @DisplayName("POST /api/v1/bookings/{id}/review - Cannot submit review twice on same booking")
    void shouldRefuseDuplicateReview() throws Exception {
        paidBooking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(paidBooking);

        ReviewRequest req = ReviewRequest.builder().rating(4).comment("Good").build();

        // First review
        mockMvc.perform(post("/api/v1/bookings/" + paidBooking.getId() + "/review")
                        .header("Authorization", "Bearer " + familyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        // Second review fails
        mockMvc.perform(post("/api/v1/bookings/" + paidBooking.getId() + "/review")
                        .header("Authorization", "Bearer " + familyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("A review has already been submitted")));
    }

    @Test
    @DisplayName("POST /api/v1/bookings/{id}/emergency - Helper raises SOS incident with immediate alerts")
    void shouldRaiseEmergencyIncident() throws Exception {
        EmergencyAlertRequest req = EmergencyAlertRequest.builder()
                .description("Parent experienced sudden dizziness. Paramedics summoned to address.")
                .severity(IncidentSeverity.CRITICAL)
                .build();

        mockMvc.perform(post("/api/v1/bookings/" + paidBooking.getId() + "/emergency")
                        .header("Authorization", "Bearer " + helper1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.severity").value("CRITICAL"))
                .andExpect(jsonPath("$.description").value(org.hamcrest.Matchers.containsString("dizziness")))
                .andExpect(jsonPath("$.status").value("OPEN"));

        // Verify emergency notification dispatched to family
        List<Notification> notifs = notificationRepository.findAll();
        assertThat(notifs).anyMatch(n -> n.getUser().getId().equals(familyUser.getId()) && n.getTemplate().contains("EMERGENCY_ALERT"));

        // Verify incident persisted in DB
        List<Incident> incidents = incidentRepository.findByBookingId(paidBooking.getId());
        assertThat(incidents).hasSize(1);
        assertThat(incidents.get(0).getSeverity()).isEqualTo(IncidentSeverity.CRITICAL);
    }
}
