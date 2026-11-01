package com.dearhand.dto.visit;

import com.dearhand.enums.IncidentSeverity;
import com.dearhand.enums.IncidentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentDto {

    private Long id;
    private Long bookingId;
    private Long reportedById;
    private String reportedByName;
    private String description;
    private IncidentSeverity severity;
    private IncidentStatus status;
    private Instant createdAt;
}
