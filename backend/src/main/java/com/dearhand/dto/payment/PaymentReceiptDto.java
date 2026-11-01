package com.dearhand.dto.payment;

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
public class PaymentReceiptDto {

    private String receiptNumber;
    private Long bookingId;
    private Long paymentId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private BigDecimal amount;
    private PaymentStatus status;
    private Instant paidAt;

    private String familyName;
    private String familyEmail;
    private String familyPhone;

    private String parentName;
    private String parentAddress;

    private String packageName;
    private Integer durationHours;

    private String helperName;
    private String helperPhone;

    private Instant scheduledStart;
    private Instant scheduledEnd;
}
