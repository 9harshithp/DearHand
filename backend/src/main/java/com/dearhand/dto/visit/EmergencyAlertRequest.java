package com.dearhand.dto.visit;

import com.dearhand.enums.IncidentSeverity;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyAlertRequest {

    @NotBlank(message = "Emergency description is required")
    private String description;

    @Builder.Default
    private IncidentSeverity severity = IncidentSeverity.CRITICAL;
}
