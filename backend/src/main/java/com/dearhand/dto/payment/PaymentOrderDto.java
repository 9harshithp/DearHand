package com.dearhand.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderDto {

    private String orderId;
    private Long amountPaise;
    private BigDecimal amountRupees;
    private String currency;
    private String razorpayKeyId;
    private Long bookingId;
    private String familyName;
    private String familyEmail;
    private String familyPhone;
}
