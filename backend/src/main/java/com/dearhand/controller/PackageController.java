package com.dearhand.controller;

import com.dearhand.dto.booking.PackageDto;
import com.dearhand.service.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/packages")
@RequiredArgsConstructor
public class PackageController {

    private final PackageService packageService;

    @GetMapping
    public ResponseEntity<List<PackageDto>> listActivePackages() {
        List<PackageDto> packages = packageService.getActivePackages();
        return ResponseEntity.ok(packages);
    }
}
