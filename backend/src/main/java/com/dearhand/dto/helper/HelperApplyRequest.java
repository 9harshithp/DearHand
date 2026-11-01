package com.dearhand.dto.helper;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HelperApplyRequest {

    private String bio;

    @NotBlank(message = "Spoken languages are required (e.g. Kannada, English)")
    private String languages;

    private String skills;

    @NotNull(message = "Please specify if you hold a valid driving licence")
    private Boolean hasLicence;

    private String licenceNo;

    private LocalDate licenceExpiry;

    private String vehicleType;

    @Min(value = 0, message = "Years of experience cannot be negative")
    private Integer yearsExperience;
}
