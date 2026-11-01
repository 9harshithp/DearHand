package com.dearhand.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminBookingBoardDto {
    private List<BookingDto> unassignedQueue; // REQUESTED
    private List<BookingDto> awaitingAcceptance; // MATCHED
    private List<BookingDto> acceptedAndPendingPayment; // ACCEPTED
    private List<BookingDto> paidAndReady; // PAID
    private List<BookingDto> inProgress; // IN_PROGRESS
    private List<BookingDto> completed; // COMPLETED
    private List<BookingDto> cancelled; // CANCELLED
}
