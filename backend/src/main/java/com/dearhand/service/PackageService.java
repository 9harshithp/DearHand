package com.dearhand.service;

import com.dearhand.dto.booking.PackageDto;
import com.dearhand.entity.CarePackage;
import com.dearhand.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageService {

    private final PackageRepository packageRepository;

    @Transactional(readOnly = true)
    public List<PackageDto> getActivePackages() {
        return packageRepository.findByActiveTrue()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CarePackage getPackageEntity(Long id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Package not found with ID: " + id));
    }

    public PackageDto mapToDto(CarePackage pkg) {
        return PackageDto.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .type(pkg.getType())
                .durationHours(pkg.getDurationHours())
                .basePrice(pkg.getBasePrice())
                .active(pkg.getActive())
                .build();
    }
}
