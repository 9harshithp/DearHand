package com.dearhand.service;

import com.dearhand.dto.helper.HelperApplyRequest;
import com.dearhand.dto.helper.HelperDocumentDto;
import com.dearhand.dto.helper.HelperProfileDto;
import com.dearhand.entity.AuditLog;
import com.dearhand.entity.HelperDocument;
import com.dearhand.entity.HelperProfile;
import com.dearhand.entity.User;
import com.dearhand.enums.DocumentType;
import com.dearhand.enums.HelperStatus;
import com.dearhand.enums.Role;
import com.dearhand.repository.AuditLogRepository;
import com.dearhand.repository.HelperDocumentRepository;
import com.dearhand.repository.HelperProfileRepository;
import com.dearhand.repository.UserRepository;
import com.dearhand.security.UserPrincipal;
import com.dearhand.service.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HelperService {

    private final HelperProfileRepository helperProfileRepository;
    private final HelperDocumentRepository helperDocumentRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final StorageService storageService;

    @Transactional
    public HelperProfileDto applyOrUpdateProfile(UserPrincipal principal, HelperApplyRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        HelperProfile profile = helperProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> HelperProfile.builder().user(user).status(HelperStatus.APPLIED).build());

        if (Boolean.TRUE.equals(request.getHasLicence())) {
            if (request.getLicenceExpiry() != null && request.getLicenceExpiry().isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("Driving licence has already expired. DearHand requires a valid, current licence.");
            }
        }

        profile.setBio(request.getBio());
        profile.setLanguages(request.getLanguages());
        profile.setSkills(request.getSkills());
        profile.setHasLicence(Boolean.TRUE.equals(request.getHasLicence()));
        profile.setLicenceNo(request.getLicenceNo());
        profile.setLicenceExpiry(request.getLicenceExpiry());
        profile.setVehicleType(request.getVehicleType());
        profile.setYearsExperience(request.getYearsExperience() != null ? request.getYearsExperience() : 0);

        HelperProfile saved = helperProfileRepository.save(profile);
        return mapToDto(saved);
    }

    @Transactional
    public HelperDocumentDto uploadDocument(UserPrincipal principal, DocumentType type, MultipartFile file) throws IOException {
        HelperProfile profile = helperProfileRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("Helper profile not found for this user"));

        String fileKey = storageService.storeDocument(profile.getId(), type.name(), file);

        HelperDocument document = HelperDocument.builder()
                .helper(profile)
                .type(type)
                .fileKey(fileKey)
                .build();

        HelperDocument saved = helperDocumentRepository.save(document);
        return mapDocumentToDto(saved);
    }

    @Transactional(readOnly = true)
    public HelperProfileDto getMyProfile(UserPrincipal principal) {
        HelperProfile profile = helperProfileRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("Helper profile not found"));
        return mapToDto(profile);
    }

    @Transactional(readOnly = true)
    public List<HelperProfileDto> listHelpers(HelperStatus status) {
        List<HelperProfile> profiles = (status != null)
                ? helperProfileRepository.findByStatus(status)
                : helperProfileRepository.findAll();

        return profiles.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HelperProfileDto getHelperById(Long helperId) {
        HelperProfile profile = helperProfileRepository.findById(helperId)
                .orElseThrow(() -> new IllegalArgumentException("Helper profile not found with ID: " + helperId));
        return mapToDto(profile);
    }

    @Transactional
    public HelperProfileDto updateHelperStatus(Long helperId, HelperStatus newStatus, UserPrincipal adminPrincipal, String notes) {
        HelperProfile profile = helperProfileRepository.findById(helperId)
                .orElseThrow(() -> new IllegalArgumentException("Helper profile not found with ID: " + helperId));

        User admin = userRepository.findById(adminPrincipal.getId()).orElse(null);
        HelperStatus oldStatus = profile.getStatus();
        profile.setStatus(newStatus);
        HelperProfile saved = helperProfileRepository.save(profile);

        String actionText = "HELPER_STATUS_CHANGE: " + oldStatus + " -> " + newStatus;
        if (notes != null && !notes.isBlank()) {
            actionText += " (" + notes + ")";
        }
        if (actionText.length() > 255) {
            actionText = actionText.substring(0, 252) + "...";
        }

        // Audit Log
        AuditLog audit = AuditLog.builder()
                .actor(admin)
                .action(actionText)
                .entity("HelperProfile")
                .entityId(helperId)
                .build();
        auditLogRepository.save(audit);

        log.info("Admin {} changed helper #{} status from {} to {}", adminPrincipal.getEmail(), helperId, oldStatus, newStatus);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public Resource getDocumentResource(Long helperId, Long docId, UserPrincipal principal) throws IOException {
        HelperDocument doc = helperDocumentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + docId));

        if (!doc.getHelper().getId().equals(helperId)) {
            throw new IllegalArgumentException("Document does not belong to specified helper");
        }

        // Ownership and role check: only the helper themselves or an ADMIN can view the document
        boolean isOwner = doc.getHelper().getUser().getId().equals(principal.getId());
        boolean isAdmin = principal.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to view this helper's confidential documents");
        }

        return storageService.loadAsResource(doc.getFileKey());
    }

    private HelperProfileDto mapToDto(HelperProfile profile) {
        List<HelperDocumentDto> docDtos = helperDocumentRepository.findByHelperId(profile.getId())
                .stream()
                .map(this::mapDocumentToDto)
                .collect(Collectors.toList());

        return HelperProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .name(profile.getUser().getName())
                .phone(profile.getUser().getPhone())
                .email(profile.getUser().getEmail())
                .bio(profile.getBio())
                .languages(profile.getLanguages())
                .skills(profile.getSkills())
                .hasLicence(profile.getHasLicence())
                .licenceNo(profile.getLicenceNo())
                .licenceExpiry(profile.getLicenceExpiry())
                .vehicleType(profile.getVehicleType())
                .yearsExperience(profile.getYearsExperience())
                .status(profile.getStatus())
                .ratingAvg(profile.getRatingAvg())
                .documents(docDtos)
                .build();
    }

    private HelperDocumentDto mapDocumentToDto(HelperDocument doc) {
        return HelperDocumentDto.builder()
                .id(doc.getId())
                .type(doc.getType())
                .fileKey(doc.getFileKey())
                .verifiedByUserId(doc.getVerifiedBy() != null ? doc.getVerifiedBy().getId() : null)
                .verifiedByName(doc.getVerifiedBy() != null ? doc.getVerifiedBy().getName() : null)
                .verifiedAt(doc.getVerifiedAt())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
