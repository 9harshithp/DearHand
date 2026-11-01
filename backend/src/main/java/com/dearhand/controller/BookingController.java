package com.dearhand.controller;

import com.dearhand.dto.booking.BookingDto;
import com.dearhand.dto.booking.BookingRequest;
import com.dearhand.dto.booking.CancelBookingRequest;
import com.dearhand.security.UserPrincipal;
import com.dearhand.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final com.dearhand.service.PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasRole('FAMILY')")
    public ResponseEntity<BookingDto> createBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BookingRequest request) {
        BookingDto booking = bookingService.createBooking(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @GetMapping
    @PreAuthorize("hasRole('FAMILY') or hasRole('HELPER') or hasRole('ADMIN')")
    public ResponseEntity<List<BookingDto>> listOwnBookings(@AuthenticationPrincipal UserPrincipal principal) {
        List<BookingDto> bookings = bookingService.listOwnBookings(principal);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('FAMILY') or hasRole('HELPER') or hasRole('ADMIN')")
    public ResponseEntity<BookingDto> getBookingDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        BookingDto booking = bookingService.getBookingDetail(principal, id);
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('FAMILY') or hasRole('ADMIN')")
    public ResponseEntity<BookingDto> cancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) CancelBookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String reason = request != null ? request.getReason() : "Cancelled by user";
        BookingDto cancelled = bookingService.cancelBooking(principal, id, reason);
        return ResponseEntity.ok(cancelled);
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('HELPER')")
    public ResponseEntity<BookingDto> respondToAssignment(
            @PathVariable Long id,
            @Valid @RequestBody com.dearhand.dto.booking.HelperAcceptanceRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        BookingDto updated = bookingService.respondToAssignment(principal, id, request.getAccept(), request.getReason());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasRole('FAMILY')")
    public ResponseEntity<com.dearhand.dto.payment.PaymentOrderDto> initiatePayment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        com.dearhand.dto.payment.PaymentOrderDto order = paymentService.initiatePayment(principal, id);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/verify-payment")
    @PreAuthorize("hasRole('FAMILY')")
    public ResponseEntity<BookingDto> verifyPayment(
            @PathVariable Long id,
            @Valid @RequestBody com.dearhand.dto.payment.PaymentVerificationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        BookingDto confirmed = paymentService.verifyClientPayment(principal, id, request);
        return ResponseEntity.ok(confirmed);
    }

    @GetMapping("/{id}/receipt")
    @PreAuthorize("hasRole('FAMILY') or hasRole('HELPER') or hasRole('ADMIN')")
    public ResponseEntity<com.dearhand.dto.payment.PaymentReceiptDto> getReceipt(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        com.dearhand.dto.payment.PaymentReceiptDto receipt = paymentService.getReceipt(principal, id);
        return ResponseEntity.ok(receipt);
    }
}

