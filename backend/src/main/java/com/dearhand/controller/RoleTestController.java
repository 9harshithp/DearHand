package com.dearhand.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/test")
public class RoleTestController {

    @GetMapping("/family")
    @PreAuthorize("hasRole('FAMILY')")
    public ResponseEntity<Map<String, String>> familyOnly() {
        return ResponseEntity.ok(Map.of("message", "Access granted to Family"));
    }

    @GetMapping("/helper")
    @PreAuthorize("hasRole('HELPER')")
    public ResponseEntity<Map<String, String>> helperOnly() {
        return ResponseEntity.ok(Map.of("message", "Access granted to Helper"));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> adminOnly() {
        return ResponseEntity.ok(Map.of("message", "Access granted to Admin"));
    }
}
