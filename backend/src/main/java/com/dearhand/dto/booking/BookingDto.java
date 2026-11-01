package com.dearhand.dto.booking;

import com.dearhand.dto.helper.HelperProfileDto;
import com.dearhand.dto.parent.ParentDto;
import com.dearhand.enums.BookingStatus;
import com.dearhand.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    private Long id;
    private Long familyId;
    private String familyName;
    private String familyPhone;
    private ParentDto parent;
    private PackageDto carePackage;
    private HelperProfileDto helper;
    private Instant scheduledStart;
    private Instant scheduledEnd;
    private String address;
    private String taskNotes;
    private BookingStatus status;
    private BigDecimal totalAmount;
    private PaymentStatus paymentStatus;
    private String razorpayOrderId;
    private Instant paidAt;
    private Instant checkinAt;
    private Instant checkoutAt;
    private String visitNotes;
    private String photoKeys;
    private Integer rating;
    private String reviewComment;
    private Instant createdAt;
}
