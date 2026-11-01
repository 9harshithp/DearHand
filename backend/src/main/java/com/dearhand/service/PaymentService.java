package com.dearhand.service;

import com.dearhand.dto.booking.BookingDto;
import com.dearhand.dto.payment.PaymentOrderDto;
import com.dearhand.dto.payment.PaymentReceiptDto;
import com.dearhand.dto.payment.PaymentVerificationRequest;
import com.dearhand.entity.AuditLog;
import com.dearhand.entity.Booking;
import com.dearhand.entity.Notification;
import com.dearhand.entity.Payment;
import com.dearhand.entity.User;
import com.dearhand.enums.BookingStatus;
import com.dearhand.enums.NotificationChannel;
import com.dearhand.enums.NotificationStatus;
import com.dearhand.enums.PaymentStatus;
import com.dearhand.enums.Role;
import com.dearhand.repository.AuditLogRepository;
import com.dearhand.repository.BookingRepository;
import com.dearhand.repository.NotificationRepository;
import com.dearhand.repository.PaymentRepository;
import com.dearhand.repository.UserRepository;
import com.dearhand.security.UserPrincipal;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final RazorpayService razorpayService;
    private final BookingService bookingService;
    private final ObjectMapper objectMapper;

    @Transactional
    public PaymentOrderDto initiatePayment(UserPrincipal principal, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        validateFamilyOwnership(principal, booking);

        if (booking.getStatus() != BookingStatus.ACCEPTED) {
            throw new IllegalStateException("Payment can only be initiated for bookings in ACCEPTED status. Current status: " + booking.getStatus());
        }

        Payment payment = booking.getPayment();
        if (payment == null) {
            payment = Payment.builder()
                    .booking(booking)
                    .amount(booking.getTotalAmount())
                    .status(PaymentStatus.PENDING)
                    .build();
        } else if (payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new IllegalStateException("Booking #" + bookingId + " has already been paid successfully.");
        }

        PaymentOrderDto orderDto = razorpayService.createOrder(booking);
        payment.setRazorpayOrderId(orderDto.getOrderId());
        paymentRepository.save(payment);

        User actor = userRepository.findById(principal.getId()).orElse(null);
        AuditLog audit = AuditLog.builder()
                .actor(actor)
                .action("PAYMENT_ORDER_CREATED: Razorpay order " + orderDto.getOrderId() + " for Booking #" + bookingId + " (₹" + booking.getTotalAmount() + ")")
                .entity("Payment")
                .entityId(payment.getId())
                .build();
        auditLogRepository.save(audit);

        log.info("Payment order initiated for booking #{} by {}", bookingId, principal.getEmail());
        return orderDto;
    }

    @Transactional
    public BookingDto verifyClientPayment(UserPrincipal principal, Long bookingId, PaymentVerificationRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        validateFamilyOwnership(principal, booking);

        Payment payment = booking.getPayment();
        if (payment == null || payment.getRazorpayOrderId() == null) {
            throw new IllegalStateException("No payment order found for Booking #" + bookingId);
        }

        if (!payment.getRazorpayOrderId().equals(request.getRazorpayOrderId())) {
            throw new IllegalArgumentException("Order ID mismatch. Expected " + payment.getRazorpayOrderId() + " but got " + request.getRazorpayOrderId());
        }

        boolean valid = razorpayService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!valid) {
            throw new IllegalArgumentException("Invalid Razorpay payment signature.");
        }

        markPaymentSuccess(booking, request.getRazorpayOrderId(), request.getRazorpayPaymentId());
        return bookingService.mapToDto(booking);
    }

    @Transactional
    public boolean processWebhook(String rawPayload, String signatureHeader) {
        if (!razorpayService.verifyWebhookSignature(rawPayload, signatureHeader)) {
            log.warn("Invalid Razorpay webhook signature received");
            throw new IllegalArgumentException("Invalid Razorpay webhook signature");
        }

        try {
            JsonNode root = objectMapper.readTree(rawPayload);
            String event = root.path("event").asText("");
            log.info("Processing Razorpay webhook event: {}", event);

            JsonNode paymentEntity = root.path("payload").path("payment").path("entity");
            String orderId = paymentEntity.path("order_id").asText(null);
            String paymentId = paymentEntity.path("id").asText(null);

            if (orderId == null || orderId.isBlank()) {
                // Check if order entity directly exists
                orderId = root.path("payload").path("order").path("entity").path("id").asText(null);
            }

            if (orderId == null) {
                log.warn("Webhook payload does not contain order_id");
                return false;
            }

            Payment payment = paymentRepository.findByRazorpayOrderId(orderId).orElse(null);
            if (payment == null) {
                log.warn("No local payment found for webhook order ID: {}", orderId);
                return false;
            }

            // Idempotency: If already marked success, skip re-processing
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                log.info("Webhook event for order {} already processed as SUCCESS. Skipping.", orderId);
                return true;
            }

            Booking booking = payment.getBooking();
            markPaymentSuccess(booking, orderId, paymentId != null ? paymentId : "pay_webhook_" + orderId);
            return true;
        } catch (Exception e) {
            log.error("Error processing Razorpay webhook payload", e);
            throw new RuntimeException("Webhook processing error: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public PaymentReceiptDto getReceipt(UserPrincipal principal, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        validateBookingAccess(principal, booking);

        Payment payment = booking.getPayment();
        if (payment == null || payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new IllegalStateException("No successful payment receipt available for Booking #" + bookingId);
        }

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneId.of("Asia/Kolkata"));
        String datePrefix = dtf.format(payment.getPaidAt() != null ? payment.getPaidAt() : Instant.now());
        String receiptNumber = "REC-" + datePrefix + "-" + String.format("%05d", booking.getId());

        return PaymentReceiptDto.builder()
                .receiptNumber(receiptNumber)
                .bookingId(booking.getId())
                .paymentId(payment.getId())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .paidAt(payment.getPaidAt())
                .familyName(booking.getFamily().getName())
                .familyEmail(booking.getFamily().getEmail())
                .familyPhone(booking.getFamily().getPhone())
                .parentName(booking.getParent().getName())
                .parentAddress(booking.getAddress())
                .packageName(booking.getCarePackage().getName())
                .durationHours(booking.getCarePackage().getDurationHours())
                .helperName(booking.getHelper() != null ? booking.getHelper().getUser().getName() : "Stand-in Helper")
                .helperPhone(booking.getHelper() != null ? booking.getHelper().getUser().getPhone() : "")
                .scheduledStart(booking.getScheduledStart())
                .scheduledEnd(booking.getScheduledEnd())
                .build();
    }

    private void markPaymentSuccess(Booking booking, String orderId, String paymentId) {
        Payment payment = booking.getPayment();
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setRazorpayPaymentId(paymentId);
        payment.setPaidAt(Instant.now());
        paymentRepository.save(payment);

        booking.setStatus(BookingStatus.PAID);
        bookingRepository.save(booking);

        // Notify Family
        Notification familyNotif = Notification.builder()
                .user(booking.getFamily())
                .channel(NotificationChannel.WHATSAPP)
                .template("PAYMENT_CONFIRMED: ₹" + payment.getAmount() + " received for Booking #" + booking.getId() + ". Your verified helper is confirmed.")
                .status(NotificationStatus.SENT)
                .sentAt(Instant.now())
                .build();
        notificationRepository.save(familyNotif);

        // Notify Helper
        if (booking.getHelper() != null) {
            Notification helperNotif = Notification.builder()
                    .user(booking.getHelper().getUser())
                    .channel(NotificationChannel.WHATSAPP)
                    .template("VISIT_CONFIRMED: Booking #" + booking.getId() + " for " + booking.getParent().getName() + " is paid and locked in.")
                    .status(NotificationStatus.SENT)
                    .sentAt(Instant.now())
                    .build();
            notificationRepository.save(helperNotif);
        }

        // Audit Log
        AuditLog audit = AuditLog.builder()
                .actor(booking.getFamily())
                .action("PAYMENT_SUCCESS: Booking #" + booking.getId() + " paid ₹" + payment.getAmount() + " (Ref: " + paymentId + ")")
                .entity("Booking")
                .entityId(booking.getId())
                .build();
        auditLogRepository.save(audit);

        log.info("Booking #{} successfully marked PAID with Payment #{} (Ref: {})",
                booking.getId(), payment.getId(), paymentId);
    }

    private void validateFamilyOwnership(UserPrincipal principal, Booking booking) {
        if (principal.getRole() == Role.ADMIN) return;

        if (!booking.getFamily().getId().equals(principal.getId())) {
            throw new AccessDeniedException("You do not have permission to pay for Booking #" + booking.getId());
        }
    }

    private void validateBookingAccess(UserPrincipal principal, Booking booking) {
        if (principal.getRole() == Role.ADMIN) return;

        boolean isFamily = booking.getFamily().getId().equals(principal.getId());
        boolean isAssignedHelper = booking.getHelper() != null &&
                booking.getHelper().getUser().getId().equals(principal.getId());

        if (!isFamily && !isAssignedHelper) {
            throw new AccessDeniedException("You do not have permission to view receipt for Booking #" + booking.getId());
        }
    }
}
