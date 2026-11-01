package com.dearhand.controller;

import com.dearhand.dto.helper.HelperProfileDto;
import com.dearhand.dto.helper.HelperStatusUpdateRequest;
import com.dearhand.enums.HelperStatus;
import com.dearhand.security.UserPrincipal;
import com.dearhand.service.HelperService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/helpers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminHelperController {

    private final HelperService helperService;

    @GetMapping
    public ResponseEntity<List<HelperProfileDto>> listHelpers(
            @RequestParam(value = "status", required = false) HelperStatus status) {
        List<HelperProfileDto> helpers = helperService.listHelpers(status);
        return ResponseEntity.ok(helpers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HelperProfileDto> getHelperDetail(@PathVariable Long id) {
        HelperProfileDto helper = helperService.getHelperById(id);
        return ResponseEntity.ok(helper);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<HelperProfileDto> updateHelperStatus(
            @PathVariable Long id,
            @Valid @RequestBody HelperStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        HelperProfileDto updated = helperService.updateHelperStatus(
                id, request.getStatus(), adminPrincipal, request.getReasonOrNotes());
        return ResponseEntity.ok(updated);
    }
}
