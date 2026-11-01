package com.dearhand.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {

    private Long id;
    private Long actorId;
    private String actorName;
    private String actorEmail;
    private String action;
    private String entity;
    private Long entityId;
    private Instant createdAt;
}
