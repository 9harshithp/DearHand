package com.dearhand.service;

import com.dearhand.dto.payment.PaymentOrderDto;
import com.dearhand.entity.Booking;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.UUID;

@Service
@Slf4j
public class RazorpayService {

    @Getter
    @Value("${razorpay.keyId:rzp_test_dearhanddemo}")
    private String keyId;

    @Value("${razorpay.keySecret:test_secret_demo12345}")
    private String keySecret;

    @Value("${razorpay.webhookSecret:test_webhook_secret_dearhand}")
    private String webhookSecret;

    public PaymentOrderDto createOrder(Booking booking) {
        BigDecimal amountRupees = booking.getTotalAmount();
        long amountPaise = amountRupees.multiply(BigDecimal.valueOf(100)).longValue();

        // In test mode / offline dev, generate deterministic compliant order ID
        String orderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);

        log.info("Created Razorpay order {} for Booking #{} (Amount: ₹{} / {} paise)",
                orderId, booking.getId(), amountRupees, amountPaise);

        return PaymentOrderDto.builder()
                .orderId(orderId)
                .amountPaise(amountPaise)
                .amountRupees(amountRupees)
                .currency("INR")
                .razorpayKeyId(keyId)
                .bookingId(booking.getId())
                .familyName(booking.getFamily().getName())
                .familyEmail(booking.getFamily().getEmail())
                .familyPhone(booking.getFamily().getPhone())
                .build();
    }

    public boolean verifySignature(String orderId, String paymentId, String providedSignature) {
        if (orderId == null || paymentId == null || providedSignature == null) {
            return false;
        }

        try {
            String payload = orderId + "|" + paymentId;
            String calculated = calculateHmacSha256(payload, keySecret);
            return MessageDigest.isEqual(
                    calculated.getBytes(StandardCharsets.UTF_8),
                    providedSignature.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Failed to verify Razorpay client signature", e);
            return false;
        }
    }

    public boolean verifyWebhookSignature(String payload, String providedSignature) {
        if (payload == null || providedSignature == null) {
            return false;
        }

        try {
            String calculated = calculateHmacSha256(payload, webhookSecret);
            return MessageDigest.isEqual(
                    calculated.getBytes(StandardCharsets.UTF_8),
                    providedSignature.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Failed to verify Razorpay webhook signature", e);
            return false;
        }
    }

    public String generateTestSignature(String orderId, String paymentId) {
        return calculateHmacSha256(orderId + "|" + paymentId, keySecret);
    }

    public String generateTestWebhookSignature(String payload) {
        return calculateHmacSha256(payload, webhookSecret);
    }

    private String calculateHmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error computing HMAC-SHA256", e);
        }
    }
}
