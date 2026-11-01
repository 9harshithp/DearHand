package com.dearhand.dto.admin;

import com.dearhand.enums.IncidentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentStatusUpdateRequest {

    @NotNull(message = "Incident status is required")
    private IncidentStatus status;

    private String resolutionNotes;
}
