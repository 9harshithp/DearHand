package com.dearhand.dto.booking;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotNull(message = "Parent must be selected")
    private Long parentId;

    @NotNull(message = "Care package must be selected")
    private Long packageId;

    @NotNull(message = "Scheduled start time is required")
    @Future(message = "Scheduled visit start time must be in the future")
    private Instant scheduledStart;

    @NotBlank(message = "Visit address in Mysuru is required")
    private String address;

    private String taskNotes;
}
