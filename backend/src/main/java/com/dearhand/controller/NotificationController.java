package com.dearhand.controller;

import com.dearhand.dto.admin.NotificationDto;
import com.dearhand.dto.admin.NotificationFeedResponse;
import com.dearhand.security.UserPrincipal;
import com.dearhand.service.AdminOperationsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final AdminOperationsService adminOperationsService;

    @GetMapping("/me")
    public ResponseEntity<NotificationFeedResponse> getMyNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        NotificationFeedResponse feed = adminOperationsService.getUserNotificationFeed(principal);
        return ResponseEntity.ok(feed);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        NotificationDto updated = adminOperationsService.markNotificationAsRead(id, principal);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal principal) {
        adminOperationsService.markAllNotificationsAsRead(principal);
        return ResponseEntity.noContent().build();
    }
}
