package com.dearhand.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    @Value("${dearhand.rate-limiting.enabled:true}")
    private boolean enabled;

    @Value("${dearhand.rate-limiting.limit-per-minute:15}")
    private int limitPerMinute;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, ClientWindow> clientWindows = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!enabled || !isRateLimitedEndpoint(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = extractClientIp(request);
        long currentWindowMinute = System.currentTimeMillis() / 60000;

        ClientWindow window = clientWindows.compute(clientIp, (key, existing) -> {
            if (existing == null || existing.windowMinute != currentWindowMinute) {
                return new ClientWindow(currentWindowMinute, new AtomicInteger(1));
            }
            existing.counter.incrementAndGet();
            return existing;
        });

        if (window.counter.get() > limitPerMinute) {
            log.warn("Rate limit exceeded for IP {} on endpoint {}. Counter: {}", clientIp, request.getRequestURI(), window.counter.get());
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", "60");

            Map<String, Object> errorBody = new HashMap<>();
            errorBody.put("timestamp", Instant.now().toString());
            errorBody.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
            errorBody.put("error", "Too Many Requests");
            errorBody.put("message", "Rate limit exceeded. Please wait a minute before trying again.");

            response.getWriter().write(objectMapper.writeValueAsString(errorBody));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimitedEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/v1/auth/login") || path.startsWith("/api/v1/auth/register");
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }

    public void clearLimits() {
        clientWindows.clear();
    }

    private static class ClientWindow {
        final long windowMinute;
        final AtomicInteger counter;

        ClientWindow(long windowMinute, AtomicInteger counter) {
            this.windowMinute = windowMinute;
            this.counter = counter;
        }
    }
}
