package com.dearhand.dto.helper;

import com.dearhand.enums.HelperStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HelperStatusUpdateRequest {

    @NotNull(message = "Target status is required")
    private HelperStatus status;

    private String reasonOrNotes;
}
