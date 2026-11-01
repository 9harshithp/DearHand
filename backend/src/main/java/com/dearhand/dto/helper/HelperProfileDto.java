package com.dearhand.dto.helper;

import com.dearhand.enums.HelperStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HelperProfileDto {
    private Long id;
    private Long userId;
    private String name;
    private String phone;
    private String email;
    private String bio;
    private String languages;
    private String skills;
    private Boolean hasLicence;
    private String licenceNo;
    private LocalDate licenceExpiry;
    private String vehicleType;
    private Integer yearsExperience;
    private HelperStatus status;
    private BigDecimal ratingAvg;
    private List<HelperDocumentDto> documents;
}
