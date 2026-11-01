package com.dearhand.service;

import com.dearhand.dto.admin.*;
import com.dearhand.dto.booking.PackageDto;
import com.dearhand.dto.visit.IncidentDto;
import com.dearhand.entity.*;
import com.dearhand.enums.IncidentStatus;
import com.dearhand.enums.NotificationChannel;
import com.dearhand.enums.NotificationStatus;
import com.dearhand.enums.Role;
import com.dearhand.repository.*;
import com.dearhand.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminOperationsService {

    private final IncidentRepository incidentRepository;
    private final PackageRepository packageRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    // --- Incident Management ---

    @Transactional(readOnly = true)
    public List<IncidentDto> listIncidents(IncidentStatus status) {
        List<Incident> incidents = (status != null)
                ? incidentRepository.findByStatusOrderByCreatedAtDesc(status)
                : incidentRepository.findAllByOrderByCreatedAtDesc();

        return incidents.stream()
                .map(this::mapToIncidentDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public IncidentDto updateIncidentStatus(Long incidentId, IncidentStatusUpdateRequest request, UserPrincipal adminUser) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found with ID: " + incidentId));

        IncidentStatus oldStatus = incident.getStatus();
        incident.setStatus(request.getStatus());

        if (request.getResolutionNotes() != null && !request.getResolutionNotes().isBlank()) {
            incident.setDescription(incident.getDescription() + "\n\n[ADMIN RESOLUTION NOTE by " + adminUser.getName() + "]: " + request.getResolutionNotes());
        }

        Incident updated = incidentRepository.save(incident);

        User actor = userRepository.findById(adminUser.getId()).orElse(null);
        String auditAction = "INCIDENT_STATUS_CHANGE: #" + incidentId + " (" + oldStatus + " -> " + request.getStatus() + ")"
                + (request.getResolutionNotes() != null ? " - " + request.getResolutionNotes() : "");

        AuditLog audit = AuditLog.builder()
                .actor(actor)
                .action(safeTruncate(auditAction, 250))
                .entity("Incident")
                .entityId(incident.getId())
                .build();
        auditLogRepository.save(audit);

        log.info("Admin {} changed Incident #{} status from {} to {}", adminUser.getEmail(), incidentId, oldStatus, request.getStatus());

        // Also notify the reporter (family/helper) of the incident resolution
        if (incident.getReportedBy() != null) {
            Notification notification = Notification.builder()
                    .user(incident.getReportedBy())
                    .channel(NotificationChannel.IN_APP)
                    .template(safeTruncate("Your reported incident for Booking #" + incident.getBooking().getId() + " is now " + request.getStatus(), 490))
                    .status(NotificationStatus.SENT)
                    .sentAt(Instant.now())
                    .build();
            notificationRepository.save(notification);
        }

        return mapToIncidentDto(updated);
    }

    // --- Care Package Management ---

    @Transactional(readOnly = true)
    public List<PackageDto> listAllPackages() {
        return packageRepository.findAll().stream()
                .map(this::mapToPackageDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PackageDto createPackage(CreatePackageRequest request, UserPrincipal adminUser) {
        CarePackage pkg = CarePackage.builder()
                .name(request.getName().trim())
                .type(request.getType())
                .durationHours(request.getDurationHours())
                .basePrice(request.getBasePrice())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        CarePackage saved = packageRepository.save(pkg);

        User actor = userRepository.findById(adminUser.getId()).orElse(null);
        AuditLog audit = AuditLog.builder()
                .actor(actor)
                .action(safeTruncate("CREATE_PACKAGE: " + saved.getName() + " (Rs. " + saved.getBasePrice() + ")", 250))
                .entity("CarePackage")
                .entityId(saved.getId())
                .build();
        auditLogRepository.save(audit);

        log.info("Admin {} created package '{}' with ID {}", adminUser.getEmail(), saved.getName(), saved.getId());
        return mapToPackageDto(saved);
    }

    @Transactional
    public PackageDto updatePackage(Long packageId, UpdatePackageRequest request, UserPrincipal adminUser) {
        CarePackage pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new IllegalArgumentException("Package not found with ID: " + packageId));

        if (request.getName() != null && !request.getName().isBlank()) {
            pkg.setName(request.getName().trim());
        }
        if (request.getDurationHours() != null) {
            pkg.setDurationHours(request.getDurationHours());
        }
        if (request.getBasePrice() != null) {
            pkg.setBasePrice(request.getBasePrice());
        }
        if (request.getActive() != null) {
            pkg.setActive(request.getActive());
        }

        CarePackage updated = packageRepository.save(pkg);

        User actor = userRepository.findById(adminUser.getId()).orElse(null);
        AuditLog audit = AuditLog.builder()
                .actor(actor)
                .action(safeTruncate("UPDATE_PACKAGE: #" + updated.getId() + " - " + updated.getName() + " (Rs. " + updated.getBasePrice() + ", active=" + updated.getActive() + ")", 250))
                .entity("CarePackage")
                .entityId(updated.getId())
                .build();
        auditLogRepository.save(audit);

        log.info("Admin {} updated package #{}", adminUser.getEmail(), updated.getId());
        return mapToPackageDto(updated);
    }

    // --- Audit Trail ---

    @Transactional(readOnly = true)
    public List<AuditLogDto> listAuditLogs() {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc().stream()
                .map(this::mapToAuditLogDto)
                .collect(Collectors.toList());
    }

    // --- Multi-Channel Notification Desk & User Feeds ---

    @Transactional(readOnly = true)
    public List<NotificationDto> listAdminNotifications() {
        return notificationRepository.findTop100ByOrderByCreatedAtDesc().stream()
                .map(this::mapToNotificationDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NotificationFeedResponse getUserNotificationFeed(UserPrincipal principal) {
        List<Notification> userNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(principal.getId());
        long unreadCount = notificationRepository.countByUserIdAndStatusNot(principal.getId(), NotificationStatus.READ);

        List<NotificationDto> dtos = userNotifications.stream()
                .map(this::mapToNotificationDto)
                .collect(Collectors.toList());

        return NotificationFeedResponse.builder()
                .unreadCount(unreadCount)
                .notifications(dtos)
                .build();
    }

    @Transactional
    public NotificationDto markNotificationAsRead(Long notificationId, UserPrincipal principal) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with ID: " + notificationId));

        if (!notification.getUser().getId().equals(principal.getId()) && principal.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("You cannot mark another user's notification as read");
        }

        notification.setStatus(NotificationStatus.READ);
        Notification saved = notificationRepository.save(notification);

        return mapToNotificationDto(saved);
    }

    @Transactional
    public void markAllNotificationsAsRead(UserPrincipal principal) {
        List<Notification> userNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(principal.getId());
        for (Notification n : userNotifications) {
            if (n.getStatus() != NotificationStatus.READ) {
                n.setStatus(NotificationStatus.READ);
            }
        }
        notificationRepository.saveAll(userNotifications);
    }

    // --- Helper Mappers ---

    private IncidentDto mapToIncidentDto(Incident incident) {
        Booking booking = incident.getBooking();
        String parentName = (booking != null && booking.getParent() != null) ? booking.getParent().getName() : "Unknown Parent";
        String helperName = (booking != null && booking.getHelper() != null && booking.getHelper().getUser() != null)
                ? booking.getHelper().getUser().getName()
                : "Unassigned";

        return IncidentDto.builder()
                .id(incident.getId())
                .bookingId(booking != null ? booking.getId() : null)
                .reportedById(incident.getReportedBy() != null ? incident.getReportedBy().getId() : null)
                .reportedByName(incident.getReportedBy() != null ? incident.getReportedBy().getName() : "System")
                .parentName(parentName)
                .helperName(helperName)
                .description(incident.getDescription())
                .severity(incident.getSeverity())
                .status(incident.getStatus())
                .createdAt(incident.getCreatedAt())
                .build();
    }

    private PackageDto mapToPackageDto(CarePackage pkg) {
        return PackageDto.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .type(pkg.getType())
                .durationHours(pkg.getDurationHours())
                .basePrice(pkg.getBasePrice())
                .active(pkg.getActive())
                .build();
    }

    private AuditLogDto mapToAuditLogDto(AuditLog audit) {
        return AuditLogDto.builder()
                .id(audit.getId())
                .actorId(audit.getActor() != null ? audit.getActor().getId() : null)
                .actorName(audit.getActor() != null ? audit.getActor().getName() : "System Automated")
                .actorEmail(audit.getActor() != null ? audit.getActor().getEmail() : "system@dearhand.internal")
                .action(audit.getAction())
                .entity(audit.getEntity())
                .entityId(audit.getEntityId())
                .createdAt(audit.getCreatedAt())
                .build();
    }

    private NotificationDto mapToNotificationDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .userId(notification.getUser() != null ? notification.getUser().getId() : null)
                .userName(notification.getUser() != null ? notification.getUser().getName() : "Unknown User")
                .userEmail(notification.getUser() != null ? notification.getUser().getEmail() : "unknown@dearhand.internal")
                .channel(notification.getChannel())
                .template(notification.getTemplate())
                .status(notification.getStatus())
                .sentAt(notification.getSentAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    private String safeTruncate(String text, int maxLength) {
        if (text == null) return null;
        return text.length() <= maxLength ? text : text.substring(0, maxLength);
    }
}
