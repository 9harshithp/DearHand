package com.dearhand;

import com.dearhand.entity.*;
import com.dearhand.enums.*;
import com.dearhand.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RepositoryTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private HelperProfileRepository helperProfileRepository;

    @Autowired
    private HelperDocumentRepository helperDocumentRepository;

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

    @Test
    @DisplayName("Should create and query family user and their parents")
    void shouldPersistFamilyAndParent() {
        User family = User.builder()
                .name("Kavitha Ramesh")
                .email("kavitha@example.com")
                .phone("+919988776655")
                .passwordHash("hashed_secret")
                .role(Role.FAMILY)
                .status(UserStatus.ACTIVE)
                .build();
        User savedFamily = userRepository.save(family);
        assertThat(savedFamily.getId()).isNotNull();

        Parent parent = Parent.builder()
                .familyUser(savedFamily)
                .name("Mr. Ramesh & Parvathi")
                .age(78)
                .address("Kuvempunagar, Mysuru")
                .city("Mysuru")
                .language("Kannada")
                .careNotes("Needs assistance with mobility")
                .emergencyContactName("Kavitha Ramesh")
                .emergencyContactPhone("+919988776655")
                .build();
        Parent savedParent = parentRepository.save(parent);
        assertThat(savedParent.getId()).isNotNull();

        List<Parent> parents = parentRepository.findByFamilyUserId(savedFamily.getId());
        assertThat(parents).hasSize(1);
        assertThat(parents.get(0).getName()).isEqualTo("Mr. Ramesh & Parvathi");
    }

    @Test
    @DisplayName("Should create helper profile and documents")
    void shouldPersistHelperProfileAndDocs() {
        User helperUser = User.builder()
                .name("Manjunath G")
                .email("manju@example.com")
                .phone("+919123456789")
                .passwordHash("hashed_secret")
                .role(Role.HELPER)
                .status(UserStatus.ACTIVE)
                .build();
        User savedHelperUser = userRepository.save(helperUser);

        HelperProfile profile = HelperProfile.builder()
                .user(savedHelperUser)
                .bio("Experienced attendant with verified driving record")
                .languages("Kannada, English")
                .skills("First Aid, Wheelchair, Driving")
                .hasLicence(true)
                .licenceNo("KA09-2015-123456")
                .licenceExpiry(LocalDate.now().plusYears(5))
                .vehicleType("Car")
                .yearsExperience(7)
                .status(HelperStatus.APPROVED)
                .ratingAvg(BigDecimal.valueOf(4.85))
                .build();
        HelperProfile savedProfile = helperProfileRepository.save(profile);
        assertThat(savedProfile.getId()).isNotNull();

        HelperDocument doc = HelperDocument.builder()
                .helper(savedProfile)
                .type(DocumentType.DRIVING_LICENCE)
                .fileKey("helpers/1/license.pdf")
                .build();
        helperDocumentRepository.save(doc);

        List<HelperDocument> docs = helperDocumentRepository.findByHelperId(savedProfile.getId());
        assertThat(docs).hasSize(1);
        assertThat(docs.get(0).getType()).isEqualTo(DocumentType.DRIVING_LICENCE);
    }

    @Test
    @DisplayName("Should persist care packages and filter active packages")
    void shouldPersistPackages() {
        CarePackage pkg1 = CarePackage.builder()
                .name("Quick Errand (2h)")
                .type(PackageType.TASK)
                .durationHours(2)
                .basePrice(BigDecimal.valueOf(499.00))
                .active(true)
                .build();
        CarePackage pkg2 = CarePackage.builder()
                .name("Inactive Old Plan")
                .type(PackageType.TASK)
                .durationHours(1)
                .basePrice(BigDecimal.valueOf(299.00))
                .active(false)
                .build();
        packageRepository.saveAll(List.of(pkg1, pkg2));

        List<CarePackage> activePackages = packageRepository.findByActiveTrue();
        assertThat(activePackages).extracting(CarePackage::getName).contains("Quick Errand (2h)");
        assertThat(activePackages).extracting(CarePackage::getName).doesNotContain("Inactive Old Plan");
    }

    @Test
    @DisplayName("Should create booking and complete lifecycle with payment, visit log, and review")
    void shouldCompleteBookingLifecycle() {
        User family = userRepository.save(User.builder()
                .name("Sanjay")
                .email("sanjay@example.com")
                .phone("+919845012345")
                .passwordHash("secret")
                .role(Role.FAMILY)
                .status(UserStatus.ACTIVE)
                .build());

        Parent parent = parentRepository.save(Parent.builder()
                .familyUser(family)
                .name("Ananth")
                .age(72)
                .address("VV Mohalla, Mysuru")
                .emergencyContactName("Sanjay")
                .emergencyContactPhone("+919845012345")
                .build());

        User helperUser = userRepository.save(User.builder()
                .name("Praveen")
                .email("praveen@example.com")
                .phone("+919740012345")
                .passwordHash("secret")
                .role(Role.HELPER)
                .status(UserStatus.ACTIVE)
                .build());

        HelperProfile helper = helperProfileRepository.save(HelperProfile.builder()
                .user(helperUser)
                .status(HelperStatus.APPROVED)
                .build());

        CarePackage pkg = packageRepository.save(CarePackage.builder()
                .name("Half Day Care")
                .type(PackageType.HALF_DAY)
                .durationHours(4)
                .basePrice(BigDecimal.valueOf(999.00))
                .active(true)
                .build());

        Booking booking = Booking.builder()
                .family(family)
                .parent(parent)
                .carePackage(pkg)
                .helper(helper)
                .scheduledStart(Instant.now().plus(1, ChronoUnit.DAYS))
                .scheduledEnd(Instant.now().plus(1, ChronoUnit.DAYS).plus(4, ChronoUnit.HOURS))
                .address("VV Mohalla, Mysuru")
                .taskNotes("Doctor checkup at Columbia Asia Hospital")
                .status(BookingStatus.ACCEPTED)
                .totalAmount(BigDecimal.valueOf(999.00))
                .build();
        Booking savedBooking = bookingRepository.save(booking);

        // Payment
        Payment payment = Payment.builder()
                .booking(savedBooking)
                .razorpayOrderId("order_test_123")
                .razorpayPaymentId("pay_test_456")
                .amount(BigDecimal.valueOf(999.00))
                .status(PaymentStatus.SUCCESS)
                .paidAt(Instant.now())
                .build();
        paymentRepository.save(payment);

        // Visit Log
        VisitLog visitLog = VisitLog.builder()
                .booking(savedBooking)
                .checkinAt(Instant.now())
                .notes("Arrived on time, accompanied parent to doctor")
                .photoKeys("[\"photos/visit1.jpg\"]")
                .build();
        visitLogRepository.save(visitLog);

        // Review
        Review review = Review.builder()
                .booking(savedBooking)
                .rating(5)
                .comment("Extremely polite, drove safely and helped with wheelchair.")
                .build();
        reviewRepository.save(review);

        // Verify Query
        Optional<Booking> retrieved = bookingRepository.findById(savedBooking.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getStatus()).isEqualTo(BookingStatus.ACCEPTED);

        Optional<Payment> retrievedPayment = paymentRepository.findByBookingId(savedBooking.getId());
        assertThat(retrievedPayment).isPresent();
        assertThat(retrievedPayment.get().getStatus()).isEqualTo(PaymentStatus.SUCCESS);

        Double avgRating = reviewRepository.calculateAverageRatingForHelper(helper.getId());
        assertThat(avgRating).isEqualTo(5.0);
    }

    @Test
    @DisplayName("Should create audit log and notification records")
    void shouldRecordAuditAndNotification() {
        User admin = userRepository.save(User.builder()
                .name("Super Admin")
                .email("superadmin@dearhand.in")
                .phone("+919000000001")
                .passwordHash("hashed")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        AuditLog audit = AuditLog.builder()
                .actor(admin)
                .action("APPROVE_HELPER")
                .entity("HelperProfile")
                .entityId(101L)
                .build();
        AuditLog savedAudit = auditLogRepository.save(audit);
        assertThat(savedAudit.getId()).isNotNull();

        Notification notif = Notification.builder()
                .user(admin)
                .channel(NotificationChannel.WHATSAPP)
                .template("BOOKING_CONFIRMED")
                .status(NotificationStatus.SENT)
                .sentAt(Instant.now())
                .build();
        Notification savedNotif = notificationRepository.save(notif);
        assertThat(savedNotif.getId()).isNotNull();
    }
}
