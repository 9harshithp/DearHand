package com.dearhand.controller;

import com.dearhand.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentWebhookController {

    private final PaymentService paymentService;

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> handleRazorpayWebhook(
            @RequestBody String rawPayload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {

        if (signature == null || signature.isBlank()) {
            log.warn("Missing X-Razorpay-Signature header on webhook request");
            return ResponseEntity.badRequest().body(Map.of("error", "Missing signature header"));
        }

        boolean processed = paymentService.processWebhook(rawPayload, signature);
        return ResponseEntity.ok(Map.of("status", "success", "processed", processed));
    }
}
