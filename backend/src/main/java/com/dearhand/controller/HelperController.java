package com.dearhand.controller;

import com.dearhand.dto.helper.HelperApplyRequest;
import com.dearhand.dto.helper.HelperDocumentDto;
import com.dearhand.dto.helper.HelperProfileDto;
import com.dearhand.enums.DocumentType;
import com.dearhand.security.UserPrincipal;
import com.dearhand.service.HelperService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/helpers")
@RequiredArgsConstructor
public class HelperController {

    private final HelperService helperService;

    @PostMapping("/apply")
    @PreAuthorize("hasRole('HELPER')")
    public ResponseEntity<HelperProfileDto> applyOrUpdate(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody HelperApplyRequest request) {
        HelperProfileDto profile = helperService.applyOrUpdateProfile(principal, request);
        return ResponseEntity.ok(profile);
    }

    @PostMapping(value = "/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('HELPER')")
    public ResponseEntity<HelperDocumentDto> uploadDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("type") DocumentType type,
            @RequestParam("file") MultipartFile file) throws IOException {
        HelperDocumentDto doc = helperService.uploadDocument(principal, type, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('HELPER')")
    public ResponseEntity<HelperProfileDto> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        HelperProfileDto profile = helperService.getMyProfile(principal);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{helperId}/documents/{docId}/view")
    @PreAuthorize("hasRole('HELPER') or hasRole('ADMIN')")
    public ResponseEntity<Resource> viewDocument(
            @PathVariable Long helperId,
            @PathVariable Long docId,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
        Resource resource = helperService.getDocumentResource(helperId, docId, principal);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
