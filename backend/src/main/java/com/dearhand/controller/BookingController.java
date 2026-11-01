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
}
