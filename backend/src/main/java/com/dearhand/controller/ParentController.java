package com.dearhand.controller;

import com.dearhand.dto.parent.ParentDto;
import com.dearhand.dto.parent.ParentRequest;
import com.dearhand.security.UserPrincipal;
import com.dearhand.service.ParentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parents")
@RequiredArgsConstructor
public class ParentController {

    private final ParentService parentService;

    @GetMapping
    @PreAuthorize("hasRole('FAMILY') or hasRole('ADMIN')")
    public ResponseEntity<List<ParentDto>> listParents(@AuthenticationPrincipal UserPrincipal principal) {
        List<ParentDto> parents = parentService.listParents(principal);
        return ResponseEntity.ok(parents);
    }

    @PostMapping
    @PreAuthorize("hasRole('FAMILY')")
    public ResponseEntity<ParentDto> addParent(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ParentRequest request) {
        ParentDto parent = parentService.createParent(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(parent);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FAMILY')")
    public ResponseEntity<ParentDto> updateParent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ParentRequest request) {
        ParentDto updated = parentService.updateParent(principal, id, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('FAMILY') or hasRole('ADMIN')")
    public ResponseEntity<ParentDto> getParent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ParentDto parent = parentService.getParentById(principal, id);
        return ResponseEntity.ok(parent);
    }
}
