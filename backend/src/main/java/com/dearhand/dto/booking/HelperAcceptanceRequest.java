package com.dearhand.dto.booking;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HelperAcceptanceRequest {

    @NotNull(message = "Acceptance choice (true/false) is required")
    private Boolean accept;

    private String reason;
}
