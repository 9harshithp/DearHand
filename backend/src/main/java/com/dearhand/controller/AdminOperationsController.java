package com.dearhand.controller;

import com.dearhand.dto.admin.*;
import com.dearhand.dto.booking.PackageDto;
import com.dearhand.dto.visit.IncidentDto;
import com.dearhand.enums.IncidentStatus;
import com.dearhand.security.UserPrincipal;
import com.dearhand.service.AdminOperationsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminOperationsController {

    private final AdminOperationsService adminOperationsService;

    // --- Incidents ---

    @GetMapping("/incidents")
    public ResponseEntity<List<IncidentDto>> listIncidents(
            @RequestParam(required = false) IncidentStatus status) {
        List<IncidentDto> incidents = adminOperationsService.listIncidents(status);
        return ResponseEntity.ok(incidents);
    }

    @PutMapping("/incidents/{id}/status")
    public ResponseEntity<IncidentDto> updateIncidentStatus(
            @PathVariable Long id,
            @Valid @RequestBody IncidentStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal adminUser) {
        IncidentDto updated = adminOperationsService.updateIncidentStatus(id, request, adminUser);
        return ResponseEntity.ok(updated);
    }

    // --- Care Packages & Pricing ---

    @GetMapping("/packages")
    public ResponseEntity<List<PackageDto>> listAllPackages() {
        List<PackageDto> packages = adminOperationsService.listAllPackages();
        return ResponseEntity.ok(packages);
    }

    @PostMapping("/packages")
    public ResponseEntity<PackageDto> createPackage(
            @Valid @RequestBody CreatePackageRequest request,
            @AuthenticationPrincipal UserPrincipal adminUser) {
        PackageDto created = adminOperationsService.createPackage(request, adminUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/packages/{id}")
    public ResponseEntity<PackageDto> updatePackage(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePackageRequest request,
            @AuthenticationPrincipal UserPrincipal adminUser) {
        PackageDto updated = adminOperationsService.updatePackage(id, request, adminUser);
        return ResponseEntity.ok(updated);
    }

    // --- Audit Trail ---

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLogDto>> listAuditLogs() {
        List<AuditLogDto> auditLogs = adminOperationsService.listAuditLogs();
        return ResponseEntity.ok(auditLogs);
    }

    // --- Admin Notification History ---

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationDto>> listAdminNotifications() {
        List<NotificationDto> notifications = adminOperationsService.listAdminNotifications();
        return ResponseEntity.ok(notifications);
    }
}
