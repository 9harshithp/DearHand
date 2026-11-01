package com.dearhand.controller;

import com.dearhand.dto.booking.AdminBookingBoardDto;
import com.dearhand.dto.booking.AssignHelperRequest;
import com.dearhand.dto.booking.BookingDto;
import com.dearhand.security.UserPrincipal;
import com.dearhand.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final BookingService bookingService;

    @GetMapping("/board")
    public ResponseEntity<AdminBookingBoardDto> getBookingBoard() {
        AdminBookingBoardDto board = bookingService.getAdminBookingBoard();
        return ResponseEntity.ok(board);
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<BookingDto> assignHelper(
            @PathVariable Long id,
            @Valid @RequestBody AssignHelperRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        BookingDto booking = bookingService.assignHelper(adminPrincipal, id, request.getHelperId());
        return ResponseEntity.ok(booking);
    }
}
