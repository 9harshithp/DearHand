package com.dearhand.service;

import com.dearhand.dto.booking.BookingDto;
import com.dearhand.dto.booking.BookingRequest;
import com.dearhand.dto.booking.PackageDto;
import com.dearhand.dto.helper.HelperProfileDto;
import com.dearhand.dto.parent.ParentDto;
import com.dearhand.entity.*;
import com.dearhand.enums.BookingStatus;
import com.dearhand.enums.PaymentStatus;
import com.dearhand.enums.Role;
import com.dearhand.repository.*;
import com.dearhand.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ParentRepository parentRepository;
    private final PackageRepository packageRepository;
    private final UserRepository userRepository;
    private final HelperProfileRepository helperProfileRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final ParentService parentService;
    private final PackageService packageService;

    @Transactional
    public BookingDto createBooking(UserPrincipal principal, BookingRequest request) {
        User familyUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Parent parent = parentRepository.findById(request.getParentId())
                .orElseThrow(() -> new IllegalArgumentException("Parent profile not found"));

        if (!parent.getFamilyUser().getId().equals(familyUser.getId()) && principal.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Parent profile does not belong to your family account");
        }

        CarePackage pkg = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new IllegalArgumentException("Care package not found"));

        if (Boolean.FALSE.equals(pkg.getActive())) {
            throw new IllegalArgumentException("The selected package is no longer active");
        }

        Instant scheduledStart = request.getScheduledStart();
        Instant scheduledEnd = scheduledStart.plus(pkg.getDurationHours(), ChronoUnit.HOURS);

        Booking booking = Booking.builder()
                .family(familyUser)
                .parent(parent)
                .carePackage(pkg)
                .scheduledStart(scheduledStart)
                .scheduledEnd(scheduledEnd)
                .address(request.getAddress().trim())
                .taskNotes(request.getTaskNotes())
                .status(BookingStatus.REQUESTED)
                .totalAmount(pkg.getBasePrice())
                .build();

        Booking saved = bookingRepository.save(booking);

        // Pre-create initial pending payment entity
        Payment payment = Payment.builder()
                .booking(saved)
                .amount(saved.getTotalAmount())
                .status(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);
        saved.setPayment(payment);

        log.info("Family {} requested booking #{} for package '{}'", familyUser.getEmail(), saved.getId(), pkg.getName());
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingDto> listOwnBookings(UserPrincipal principal) {
        List<Booking> bookings;

        if (principal.getRole() == Role.FAMILY) {
            bookings = bookingRepository.findByFamilyIdOrderByScheduledStartDesc(principal.getId());
        } else if (principal.getRole() == Role.HELPER) {
            HelperProfile helperProfile = helperProfileRepository.findByUserId(principal.getId()).orElse(null);
            if (helperProfile == null) {
                return List.of();
            }
            bookings = bookingRepository.findByHelperIdOrderByScheduledStartDesc(helperProfile.getId());
        } else {
            bookings = bookingRepository.findAll(Sort.by(Sort.Direction.DESC, "scheduledStart"));
        }

        return bookings.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingDto getBookingDetail(UserPrincipal principal, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        validateBookingAccess(principal, booking);
        return mapToDto(booking);
    }

    @Transactional
    public BookingDto cancelBooking(UserPrincipal principal, Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        // Only the family booker or an admin can cancel
        boolean isFamily = booking.getFamily().getId().equals(principal.getId());
        boolean isAdmin = principal.getRole() == Role.ADMIN;
        if (!isFamily && !isAdmin) {
            throw new AccessDeniedException("Only the family booker or admin can cancel this booking");
        }

        // Status machine check: Can move to cancelled from any state before in_progress
        if (!booking.getStatus().canCancel()) {
            throw new IllegalStateException("Cannot cancel booking in " + booking.getStatus() + " status. Visits in progress or completed cannot be cancelled.");
        }

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        // Audit Log
        User actor = userRepository.findById(principal.getId()).orElse(null);
        AuditLog audit = AuditLog.builder()
                .actor(actor)
                .action("CANCEL_BOOKING: " + oldStatus + " -> CANCELLED" + (reason != null ? " (" + reason + ")" : ""))
                .entity("Booking")
                .entityId(bookingId)
                .build();
        auditLogRepository.save(audit);

        log.info("Booking #{} cancelled by {}. Reason: {}", bookingId, principal.getEmail(), reason);
        return mapToDto(saved);
    }

    @Transactional
    public BookingDto assignHelper(UserPrincipal adminPrincipal, Long bookingId, Long helperId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (booking.getStatus() != BookingStatus.REQUESTED && booking.getStatus() != BookingStatus.MATCHED) {
            throw new IllegalStateException("Helper can only be assigned to bookings in REQUESTED or MATCHED status. Current status: " + booking.getStatus());
        }

        HelperProfile helper = helperProfileRepository.findById(helperId)
                .orElseThrow(() -> new IllegalArgumentException("Helper profile not found with ID: " + helperId));

        // Security & trust rule: Only approved helpers can be assigned
        if (helper.getStatus() != com.dearhand.enums.HelperStatus.APPROVED) {
            throw new IllegalStateException("Only approved helpers can be assigned to bookings. Helper #" + helperId + " has status: " + helper.getStatus());
        }

        booking.setHelper(helper);
        booking.setStatus(BookingStatus.MATCHED);
        Booking saved = bookingRepository.save(booking);

        // Notify Helper via WhatsApp/SMS
        Notification helperNotif = Notification.builder()
                .user(helper.getUser())
                .channel(com.dearhand.enums.NotificationChannel.WHATSAPP)
                .template("NEW_VISIT_REQUEST: Booking #" + bookingId + " for " + booking.getParent().getName())
                .status(com.dearhand.enums.NotificationStatus.SENT)
                .sentAt(Instant.now())
                .build();
        notificationRepository.save(helperNotif);

        // Audit Log
        User admin = userRepository.findById(adminPrincipal.getId()).orElse(null);
        AuditLog audit = AuditLog.builder()
                .actor(admin)
                .action("ASSIGN_HELPER: Matched Helper #" + helperId + " (" + helper.getUser().getName() + ") to Booking #" + bookingId)
                .entity("Booking")
                .entityId(bookingId)
                .build();
        auditLogRepository.save(audit);

        log.info("Admin {} assigned approved helper #{} to booking #{}", adminPrincipal.getEmail(), helperId, bookingId);
        return mapToDto(saved);
    }

    @Transactional
    public BookingDto respondToAssignment(UserPrincipal helperPrincipal, Long bookingId, Boolean accept, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        HelperProfile helper = helperProfileRepository.findByUserId(helperPrincipal.getId())
                .orElseThrow(() -> new IllegalArgumentException("Helper profile not found for this user"));

        // Check ownership: current booking's helper must be this helper
        if (booking.getHelper() == null || !booking.getHelper().getId().equals(helper.getId())) {
            throw new AccessDeniedException("This booking assignment does not belong to you");
        }

        if (booking.getStatus() != BookingStatus.MATCHED) {
            throw new IllegalStateException("Booking is not awaiting helper acceptance. Current status: " + booking.getStatus());
        }

        if (Boolean.TRUE.equals(accept)) {
            booking.setStatus(BookingStatus.ACCEPTED);
            Booking saved = bookingRepository.save(booking);

            // Notify Family: Helper has accepted, please pay to confirm
            Notification familyNotif = Notification.builder()
                    .user(booking.getFamily())
                    .channel(com.dearhand.enums.NotificationChannel.WHATSAPP)
                    .template("HELPER_ACCEPTED: Helper " + helper.getUser().getName() + " accepted booking #" + bookingId + ". Please complete payment to confirm.")
                    .status(com.dearhand.enums.NotificationStatus.SENT)
                    .sentAt(Instant.now())
                    .build();
            notificationRepository.save(familyNotif);

            // Audit log
            AuditLog audit = AuditLog.builder()
                    .actor(helper.getUser())
                    .action("HELPER_ACCEPTED: Booking #" + bookingId + " accepted by helper")
                    .entity("Booking")
                    .entityId(bookingId)
                    .build();
            auditLogRepository.save(audit);

            log.info("Helper {} accepted booking #{}", helperPrincipal.getEmail(), bookingId);
            return mapToDto(saved);
        } else {
            // Helper declined: Unset helper and return to REQUESTED in admin queue
            booking.setHelper(null);
            booking.setStatus(BookingStatus.REQUESTED);
            Booking saved = bookingRepository.save(booking);

            // Audit log
            AuditLog audit = AuditLog.builder()
                    .actor(helper.getUser())
                    .action("HELPER_DECLINED: Booking #" + bookingId + " returned to admin queue. Reason: " + (reason != null ? reason : "None provided"))
                    .entity("Booking")
                    .entityId(bookingId)
                    .build();
            auditLogRepository.save(audit);

            log.info("Helper {} declined booking #{}. Returned to admin queue. Reason: {}", helperPrincipal.getEmail(), bookingId, reason);
            return mapToDto(saved);
        }
    }

    @Transactional(readOnly = true)
    public com.dearhand.dto.booking.AdminBookingBoardDto getAdminBookingBoard() {
        List<Booking> all = bookingRepository.findAll(Sort.by(Sort.Direction.DESC, "scheduledStart"));

        return com.dearhand.dto.booking.AdminBookingBoardDto.builder()
                .unassignedQueue(filterAndMap(all, BookingStatus.REQUESTED))
                .awaitingAcceptance(filterAndMap(all, BookingStatus.MATCHED))
                .acceptedAndPendingPayment(filterAndMap(all, BookingStatus.ACCEPTED))
                .paidAndReady(filterAndMap(all, BookingStatus.PAID))
                .inProgress(filterAndMap(all, BookingStatus.IN_PROGRESS))
                .completed(filterAndMap(all, BookingStatus.COMPLETED))
                .cancelled(filterAndMap(all, BookingStatus.CANCELLED))
                .build();
    }

    private List<BookingDto> filterAndMap(List<Booking> bookings, BookingStatus status) {
        return bookings.stream()
                .filter(b -> b.getStatus() == status)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private void validateBookingAccess(UserPrincipal principal, Booking booking) {
        if (principal.getRole() == Role.ADMIN) return;

        boolean isFamily = booking.getFamily().getId().equals(principal.getId());
        boolean isAssignedHelper = booking.getHelper() != null &&
                booking.getHelper().getUser().getId().equals(principal.getId());

        if (!isFamily && !isAssignedHelper) {
            throw new AccessDeniedException("You do not have permission to access booking #" + booking.getId());
        }
    }

    public BookingDto mapToDto(Booking b) {
        ParentDto parentDto = parentService.mapToDto(b.getParent());
        PackageDto pkgDto = packageService.mapToDto(b.getCarePackage());

        HelperProfileDto helperDto = null;
        if (b.getHelper() != null) {
            helperDto = HelperProfileDto.builder()
                    .id(b.getHelper().getId())
                    .userId(b.getHelper().getUser().getId())
                    .name(b.getHelper().getUser().getName())
                    .phone(b.getHelper().getUser().getPhone())
                    .email(b.getHelper().getUser().getEmail())
                    .bio(b.getHelper().getBio())
                    .languages(b.getHelper().getLanguages())
                    .skills(b.getHelper().getSkills())
                    .hasLicence(b.getHelper().getHasLicence())
                    .licenceNo(b.getHelper().getLicenceNo())
                    .licenceExpiry(b.getHelper().getLicenceExpiry())
                    .vehicleType(b.getHelper().getVehicleType())
                    .yearsExperience(b.getHelper().getYearsExperience())
                    .status(b.getHelper().getStatus())
                    .ratingAvg(b.getHelper().getRatingAvg())
                    .build();
        }

        Payment payment = b.getPayment();
        VisitLog visitLog = b.getVisitLog();
        Review review = b.getReview();

        return BookingDto.builder()
                .id(b.getId())
                .familyId(b.getFamily().getId())
                .familyName(b.getFamily().getName())
                .familyPhone(b.getFamily().getPhone())
                .parent(parentDto)
                .carePackage(pkgDto)
                .helper(helperDto)
                .scheduledStart(b.getScheduledStart())
                .scheduledEnd(b.getScheduledEnd())
                .address(b.getAddress())
                .taskNotes(b.getTaskNotes())
                .status(b.getStatus())
                .totalAmount(b.getTotalAmount())
                .paymentStatus(payment != null ? payment.getStatus() : PaymentStatus.PENDING)
                .razorpayOrderId(payment != null ? payment.getRazorpayOrderId() : null)
                .paidAt(payment != null ? payment.getPaidAt() : null)
                .checkinAt(visitLog != null ? visitLog.getCheckinAt() : null)
                .checkoutAt(visitLog != null ? visitLog.getCheckoutAt() : null)
                .visitNotes(visitLog != null ? visitLog.getNotes() : null)
                .photoKeys(visitLog != null ? visitLog.getPhotoKeys() : null)
                .rating(review != null ? review.getRating() : null)
                .reviewComment(review != null ? review.getComment() : null)
                .createdAt(b.getCreatedAt())
                .build();
    }
}
