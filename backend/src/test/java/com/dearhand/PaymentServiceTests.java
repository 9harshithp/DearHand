package com.dearhand;

import com.dearhand.dto.payment.PaymentVerificationRequest;
import com.dearhand.entity.*;
import com.dearhand.enums.*;
import com.dearhand.repository.*;
import com.dearhand.security.JwtTokenProvider;
import com.dearhand.service.RazorpayService;
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
class PaymentServiceTests {

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
    private NotificationRepository notificationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private RazorpayService razorpayService;

    private User familyUser1;
    private User familyUser2;
    private User helperUser;
    private HelperProfile helperProfile;
    private Parent parent;
    private CarePackage carePackage;
    private Booking acceptedBooking;
    private Payment payment;

    private String family1Token;
    private String family2Token;
    private String helperToken;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        paymentRepository.deleteAll();
        bookingRepository.deleteAll();
        helperProfileRepository.deleteAll();
        parentRepository.deleteAll();
        userRepository.deleteAll();
        packageRepository.deleteAll();

        // 1. Family 1 (Owner)
        familyUser1 = userRepository.save(User.builder()
                .name("Kavitha Rao")
                .email("kavitha_pay@example.com")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .role(Role.FAMILY)
                .status(UserStatus.ACTIVE)
                .phone("+919988112233")
                .build());
        family1Token = jwtTokenProvider.generateToken(familyUser1.getId(), familyUser1.getEmail(), familyUser1.getRole());

        // 2. Family 2 (Unrelated user)
        familyUser2 = userRepository.save(User.builder()
                .name("Sunil Verma")
                .email("sunil_pay@example.com")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .role(Role.FAMILY)
                .status(UserStatus.ACTIVE)
                .phone("+919988112244")
                .build());
        family2Token = jwtTokenProvider.generateToken(familyUser2.getId(), familyUser2.getEmail(), familyUser2.getRole());

        // 3. Helper (Approved)
        helperUser = userRepository.save(User.builder()
                .name("Basavaraj Gowda")
                .email("basava_pay@example.com")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .role(Role.HELPER)
                .status(UserStatus.ACTIVE)
                .phone("+919988771122")
                .build());
        helperToken = jwtTokenProvider.generateToken(helperUser.getId(), helperUser.getEmail(), helperUser.getRole());

        helperProfile = helperProfileRepository.save(HelperProfile.builder()
                .user(helperUser)
                .languages("Kannada, English")
                .skills("Hospital, Banking")
                .hasLicence(true)
                .licenceNo("KA-09-2022-0044")
                .licenceExpiry(java.time.LocalDate.now().plusYears(2))
                .vehicleType("Two-wheeler")
                .yearsExperience(3)
                .status(HelperStatus.APPROVED)
                .ratingAvg(BigDecimal.valueOf(4.8))
                .build());

        // 4. Parent
        parent = parentRepository.save(Parent.builder()
                .familyUser(familyUser1)
                .name("Gopal Rao")
                .age(76)
                .address("15 Gokulam 3rd Stage, Mysuru")
                .city("Mysuru")
                .language("Kannada")
                .emergencyContactName("Kavitha Rao")
                .emergencyContactPhone("+919988112233")
                .build());

        // 5. Package
        carePackage = packageRepository.save(CarePackage.builder()
                .name("Half Day Care (4 Hours)")
                .type(PackageType.HALF_DAY)
                .durationHours(4)
                .basePrice(new BigDecimal("899.00"))
                .active(true)
                .build());

        // 6. Accepted Booking
        acceptedBooking = bookingRepository.save(Booking.builder()
                .family(familyUser1)
                .parent(parent)
                .carePackage(carePackage)
                .helper(helperProfile)
                .scheduledStart(Instant.now().plus(2, ChronoUnit.DAYS))
                .scheduledEnd(Instant.now().plus(2, ChronoUnit.DAYS).plus(4, ChronoUnit.HOURS))
                .address(parent.getAddress())
                .status(BookingStatus.ACCEPTED)
                .totalAmount(carePackage.getBasePrice())
                .build());

        // Payment record pre-created in PENDING status
        payment = paymentRepository.save(Payment.builder()
                .booking(acceptedBooking)
                .amount(acceptedBooking.getTotalAmount())
                .status(PaymentStatus.PENDING)
                .build());
        acceptedBooking.setPayment(payment);
        bookingRepository.save(acceptedBooking);
    }

    @Test
    @DisplayName("POST /api/v1/bookings/{id}/pay - Family creates Razorpay order for ACCEPTED booking")
    void shouldCreatePaymentOrderForAcceptedBooking() throws Exception {
        mockMvc.perform(post("/api/v1/bookings/" + acceptedBooking.getId() + "/pay")
                        .header("Authorization", "Bearer " + family1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").isNotEmpty())
                .andExpect(jsonPath("$.amountRupees").value(899.00))
                .andExpect(jsonPath("$.amountPaise").value(89900))
                .andExpect(jsonPath("$.currency").value("INR"))
                .andExpect(jsonPath("$.razorpayKeyId").isNotEmpty())
                .andExpect(jsonPath("$.bookingId").value(acceptedBooking.getId()))
                .andExpect(jsonPath("$.familyName").value("Kavitha Rao"));

        // Check payment record updated with order id
        Payment updated = paymentRepository.findByBookingId(acceptedBooking.getId()).orElseThrow();
        assertThat(updated.getRazorpayOrderId()).isNotEmpty();
    }

    @Test
    @DisplayName("POST /api/v1/bookings/{id}/pay - Fails if booking is not in ACCEPTED status")
    void shouldRefusePaymentForUnacceptedBooking() throws Exception {
        acceptedBooking.setStatus(BookingStatus.REQUESTED);
        bookingRepository.save(acceptedBooking);

        mockMvc.perform(post("/api/v1/bookings/" + acceptedBooking.getId() + "/pay")
                        .header("Authorization", "Bearer " + family1Token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Payment can only be initiated for bookings in ACCEPTED status")));
    }

    @Test
    @DisplayName("POST /api/v1/bookings/{id}/pay - Wrong family user is rejected with 403 Forbidden")
    void shouldRefuseWrongFamilyPaymentInitiation() throws Exception {
        mockMvc.perform(post("/api/v1/bookings/" + acceptedBooking.getId() + "/pay")
                        .header("Authorization", "Bearer " + family2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/v1/bookings/{id}/verify-payment - Valid HMAC signature marks booking PAID")
    void shouldVerifyValidPaymentSignature() throws Exception {
        String testOrderId = "order_test_987654";
        payment.setRazorpayOrderId(testOrderId);
        paymentRepository.save(payment);

        String testPaymentId = "pay_test_123456";
        String validSig = razorpayService.generateTestSignature(testOrderId, testPaymentId);

        PaymentVerificationRequest req = PaymentVerificationRequest.builder()
                .razorpayOrderId(testOrderId)
                .razorpayPaymentId(testPaymentId)
                .razorpaySignature(validSig)
                .build();

        mockMvc.perform(post("/api/v1/bookings/" + acceptedBooking.getId() + "/verify-payment")
                        .header("Authorization", "Bearer " + family1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(acceptedBooking.getId()))
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.paymentStatus").value("SUCCESS"));

        // Verify notifications sent to both family and helper
        List<Notification> notifs = notificationRepository.findAll();
        assertThat(notifs).hasSize(2);
        assertThat(notifs).anyMatch(n -> n.getUser().getId().equals(familyUser1.getId()) && n.getTemplate().contains("PAYMENT_CONFIRMED"));
        assertThat(notifs).anyMatch(n -> n.getUser().getId().equals(helperUser.getId()) && n.getTemplate().contains("VISIT_CONFIRMED"));
    }

    @Test
    @DisplayName("POST /api/v1/bookings/{id}/verify-payment - Forged signature is rejected with 400 Bad Request")
    void shouldRejectForgedPaymentSignature() throws Exception {
        String testOrderId = "order_test_987654";
        payment.setRazorpayOrderId(testOrderId);
        paymentRepository.save(payment);

        PaymentVerificationRequest req = PaymentVerificationRequest.builder()
                .razorpayOrderId(testOrderId)
                .razorpayPaymentId("pay_test_123456")
                .razorpaySignature("forged_signature_attack_attempt")
                .build();

        mockMvc.perform(post("/api/v1/bookings/" + acceptedBooking.getId() + "/verify-payment")
                        .header("Authorization", "Bearer " + family1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Invalid Razorpay payment signature")));
    }

    @Test
    @DisplayName("POST /api/v1/payments/webhook - Valid webhook signature marks booking PAID and is idempotent")
    void shouldProcessWebhookIdempotently() throws Exception {
        String testOrderId = "order_wh_112233";
        payment.setRazorpayOrderId(testOrderId);
        paymentRepository.save(payment);

        String webhookJson = """
                {
                  "event": "payment.captured",
                  "payload": {
                    "payment": {
                      "entity": {
                        "id": "pay_wh_887766",
                        "order_id": "%s",
                        "amount": 89900,
                        "status": "captured"
                      }
                    }
                  }
                }
                """.formatted(testOrderId);

        String validSig = razorpayService.generateTestWebhookSignature(webhookJson);

        // First webhook call: processed
        mockMvc.perform(post("/api/v1/payments/webhook")
                        .header("X-Razorpay-Signature", validSig)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.processed").value(true));

        Booking updated = bookingRepository.findById(acceptedBooking.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(BookingStatus.PAID);

        // Second duplicate webhook call: idempotent (still 200 OK, no duplicated notification flurry)
        int notifCount = notificationRepository.findAll().size();
        mockMvc.perform(post("/api/v1/payments/webhook")
                        .header("X-Razorpay-Signature", validSig)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookJson))
                .andExpect(status().isOk());

        assertThat(notificationRepository.findAll().size()).isEqualTo(notifCount);
    }

    @Test
    @DisplayName("GET /api/v1/bookings/{id}/receipt - Returns structured digital receipt for PAID booking")
    void shouldReturnDigitalReceiptForPaidBooking() throws Exception {
        // Mark payment successful
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setRazorpayOrderId("order_receipt_111");
        payment.setRazorpayPaymentId("pay_receipt_222");
        payment.setPaidAt(Instant.now());
        paymentRepository.save(payment);

        acceptedBooking.setStatus(BookingStatus.PAID);
        bookingRepository.save(acceptedBooking);

        mockMvc.perform(get("/api/v1/bookings/" + acceptedBooking.getId() + "/receipt")
                        .header("Authorization", "Bearer " + family1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingId").value(acceptedBooking.getId()))
                .andExpect(jsonPath("$.receiptNumber").isNotEmpty())
                .andExpect(jsonPath("$.parentName").value("Gopal Rao"))
                .andExpect(jsonPath("$.helperName").value("Basavaraj Gowda"))
                .andExpect(jsonPath("$.amount").value(899.00))
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }
}
