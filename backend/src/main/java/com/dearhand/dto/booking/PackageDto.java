package com.dearhand.dto.booking;

import com.dearhand.enums.PackageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackageDto {
    private Long id;
    private String name;
    private PackageType type;
    private Integer durationHours;
    private BigDecimal basePrice;
    private Boolean active;
}
