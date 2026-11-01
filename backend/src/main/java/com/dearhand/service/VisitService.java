package com.dearhand.service;

import com.dearhand.dto.booking.BookingDto;
import com.dearhand.dto.visit.EmergencyAlertRequest;
import com.dearhand.dto.visit.IncidentDto;
import com.dearhand.dto.visit.ReviewRequest;
import com.dearhand.entity.*;
import com.dearhand.enums.*;
import com.dearhand.repository.*;
import com.dearhand.security.UserPrincipal;
import com.dearhand.service.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class VisitService {

    private final BookingRepository bookingRepository;
    private final VisitLogRepository visitLogRepository;
    private final ReviewRepository reviewRepository;
    private final IncidentRepository incidentRepository;
    private final HelperProfileRepository helperProfileRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final BookingService bookingService;

    @Transactional
    public BookingDto checkin(UserPrincipal principal, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        validateAssignedHelper(principal, booking);

        if (booking.getStatus() != BookingStatus.PAID) {
            throw new IllegalStateException("Helper can only check in for PAID bookings. Current status: " + booking.getStatus());
        }

        VisitLog visitLog = booking.getVisitLog();
        if (visitLog == null) {
            visitLog = VisitLog.builder()
                    .booking(booking)
                    .checkinAt(Instant.now())
                    .build();
        } else {
            visitLog.setCheckinAt(Instant.now());
        }
        visitLogRepository.save(visitLog);
        booking.setVisitLog(visitLog);

        booking.setStatus(BookingStatus.IN_PROGRESS);
        Booking saved = bookingRepository.save(booking);

        // Notify Family via WhatsApp
        Notification familyNotif = Notification.builder()
                .user(booking.getFamily())
                .channel(NotificationChannel.WHATSAPP)
                .template("VISIT_STARTED: Helper " + booking.getHelper().getUser().getName() + " has arrived and checked in for " + booking.getParent().getName())
                .status(NotificationStatus.SENT)
                .sentAt(Instant.now())
                .build();
        notificationRepository.save(familyNotif);

        // Audit Log
        User actor = userRepository.findById(principal.getId()).orElse(null);
        AuditLog audit = AuditLog.builder()
                .actor(actor)
                .action("VISIT_CHECKIN: Helper checked in for Booking #" + bookingId)
                .entity("Booking")
                .entityId(bookingId)
                .build();
        auditLogRepository.save(audit);

        log.info("Helper {} checked in for Booking #{}", principal.getEmail(), bookingId);
        return bookingService.mapToDto(saved);
    }

    @Transactional
    public BookingDto updateVisit(UserPrincipal principal, Long bookingId, String notes, MultipartFile photo) throws IOException {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        validateAssignedHelper(principal, booking);

        if (booking.getStatus() != BookingStatus.IN_PROGRESS) {
            throw new IllegalStateException("Visit updates can only be recorded when the visit is IN_PROGRESS. Current status: " + booking.getStatus());
        }

        VisitLog visitLog = booking.getVisitLog();
        if (visitLog == null) {
            visitLog = VisitLog.builder()
                    .booking(booking)
                    .checkinAt(Instant.now())
                    .build();
        }

        if (notes != null && !notes.isBlank()) {
            String currentNotes = visitLog.getNotes();
            if (currentNotes == null || currentNotes.isBlank()) {
                visitLog.setNotes(notes.trim());
            } else {
                visitLog.setNotes(currentNotes + "\n" + notes.trim());
            }
        }

        if (photo != null && !photo.isEmpty()) {
            String photoKey = storageService.storeVisitPhoto(bookingId, photo);
            String currentKeys = visitLog.getPhotoKeys();
            if (currentKeys == null || currentKeys.isBlank()) {
                visitLog.setPhotoKeys(photoKey);
            } else {
                visitLog.setPhotoKeys(currentKeys + "," + photoKey);
            }
        }

        visitLogRepository.save(visitLog);
        booking.setVisitLog(visitLog);
        Booking saved = bookingRepository.save(booking);

        log.info("Visit update recorded for Booking #{} by helper {}", bookingId, principal.getEmail());
        return bookingService.mapToDto(saved);
    }

    @Transactional
    public BookingDto checkout(UserPrincipal principal, Long bookingId, String notes) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        validateAssignedHelper(principal, booking);

        if (booking.getStatus() != BookingStatus.IN_PROGRESS) {
            throw new IllegalStateException("Helper can only checkout from visits that are IN_PROGRESS. Current status: " + booking.getStatus());
        }

        VisitLog visitLog = booking.getVisitLog();
        if (visitLog == null) {
            visitLog = VisitLog.builder()
                    .booking(booking)
                    .checkinAt(Instant.now())
                    .build();
        }
        visitLog.setCheckoutAt(Instant.now());
        if (notes != null && !notes.isBlank()) {
            String currentNotes = visitLog.getNotes();
            visitLog.setNotes(currentNotes == null ? notes.trim() : currentNotes + "\nSummary: " + notes.trim());
        }
        visitLogRepository.save(visitLog);
        booking.setVisitLog(visitLog);

        booking.setStatus(BookingStatus.COMPLETED);
        Booking saved = bookingRepository.save(booking);

        // Notify Family to rate helper
        Notification familyNotif = Notification.builder()
                .user(booking.getFamily())
                .channel(NotificationChannel.WHATSAPP)
                .template("VISIT_COMPLETED: Stand-in visit for " + booking.getParent().getName() + " is completed. Please rate and review your helper.")
                .status(NotificationStatus.SENT)
                .sentAt(Instant.now())
                .build();
        notificationRepository.save(familyNotif);

        // Audit Log
        User actor = userRepository.findById(principal.getId()).orElse(null);
        AuditLog audit = AuditLog.builder()
                .actor(actor)
                .action("VISIT_CHECKOUT: Helper checked out for Booking #" + bookingId)
                .entity("Booking")
                .entityId(bookingId)
                .build();
        auditLogRepository.save(audit);

        log.info("Helper {} completed visit for Booking #{}", principal.getEmail(), bookingId);
        return bookingService.mapToDto(saved);
    }

    @Transactional
    public BookingDto submitReview(UserPrincipal principal, Long bookingId, ReviewRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        validateFamilyOwnership(principal, booking);

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalStateException("Reviews can only be submitted for COMPLETED visits. Current status: " + booking.getStatus());
        }

        if (reviewRepository.findByBookingId(bookingId).isPresent()) {
            throw new IllegalStateException("A review has already been submitted for Booking #" + bookingId);
        }

        Review review = Review.builder()
                .booking(booking)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        reviewRepository.save(review);
        booking.setReview(review);
        Booking saved = bookingRepository.save(booking);

        // Recalculate helper's rolling rating average
        if (booking.getHelper() != null) {
            HelperProfile helper = booking.getHelper();
            Double avg = reviewRepository.calculateAverageRatingForHelper(helper.getId());
            if (avg != null) {
                helper.setRatingAvg(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
                helperProfileRepository.save(helper);
            }
        }

        // Audit Log
        User actor = userRepository.findById(principal.getId()).orElse(null);
        AuditLog audit = AuditLog.builder()
                .actor(actor)
                .action("REVIEW_SUBMITTED: Rating " + request.getRating() + "/5 for Booking #" + bookingId)
                .entity("Review")
                .entityId(review.getId())
                .build();
        auditLogRepository.save(audit);

        log.info("Family {} submitted review for Booking #{}: {} stars", principal.getEmail(), bookingId, request.getRating());
        return bookingService.mapToDto(saved);
    }

    @Transactional
    public IncidentDto raiseEmergency(UserPrincipal principal, Long bookingId, EmergencyAlertRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        validateBookingAccess(principal, booking);

        User reporter = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("Reporter not found"));

        Incident incident = Incident.builder()
                .booking(booking)
                .reportedBy(reporter)
                .description(request.getDescription())
                .severity(request.getSeverity() != null ? request.getSeverity() : IncidentSeverity.CRITICAL)
                .status(IncidentStatus.OPEN)
                .build();
        Incident saved = incidentRepository.save(incident);

        // Emergency Alert to Family & Ops
        String notifMsg = "EMERGENCY_ALERT: Incident raised for " + booking.getParent().getName() + "! " + request.getDescription();
        Notification emergNotif = Notification.builder()
                .user(booking.getFamily())
                .channel(NotificationChannel.WHATSAPP)
                .template(safeTruncate(notifMsg, 490))
                .status(NotificationStatus.SENT)
                .sentAt(Instant.now())
                .build();
        notificationRepository.save(emergNotif);

        // Audit Log
        String auditAction = "EMERGENCY_ALERT_RAISED: " + request.getSeverity() + " on Booking #" + bookingId + ": " + request.getDescription();
        AuditLog audit = AuditLog.builder()
                .actor(reporter)
                .action(safeTruncate(auditAction, 250))
                .entity("Incident")
                .entityId(saved.getId())
                .build();
        auditLogRepository.save(audit);

        log.warn("EMERGENCY ALERT RAISED by {} for Booking #{}: {}", reporter.getEmail(), bookingId, request.getDescription());

        return IncidentDto.builder()
                .id(saved.getId())
                .bookingId(booking.getId())
                .reportedById(reporter.getId())
                .reportedByName(reporter.getName())
                .parentName(booking.getParent() != null ? booking.getParent().getName() : "Unknown Parent")
                .helperName(booking.getHelper() != null ? booking.getHelper().getUser().getName() : "Unassigned")
                .description(saved.getDescription())
                .severity(saved.getSeverity())
                .status(saved.getStatus())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    private void validateAssignedHelper(UserPrincipal principal, Booking booking) {
        if (principal.getRole() == Role.ADMIN) return;

        if (booking.getHelper() == null || !booking.getHelper().getUser().getId().equals(principal.getId())) {
            throw new AccessDeniedException("You are not the assigned helper for Booking #" + booking.getId());
        }
    }

    private void validateFamilyOwnership(UserPrincipal principal, Booking booking) {
        if (principal.getRole() == Role.ADMIN) return;

        if (!booking.getFamily().getId().equals(principal.getId())) {
            throw new AccessDeniedException("You do not have permission to submit a review for Booking #" + booking.getId());
        }
    }

    private void validateBookingAccess(UserPrincipal principal, Booking booking) {
        if (principal.getRole() == Role.ADMIN) return;

        boolean isFamily = booking.getFamily().getId().equals(principal.getId());
        boolean isAssignedHelper = booking.getHelper() != null &&
                booking.getHelper().getUser().getId().equals(principal.getId());

        if (!isFamily && !isAssignedHelper) {
            throw new AccessDeniedException("You do not have permission to access Booking #" + booking.getId());
        }
    }

    private String safeTruncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
    }
}
