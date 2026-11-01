package com.dearhand.dto.helper;

import com.dearhand.enums.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HelperDocumentDto {
    private Long id;
    private DocumentType type;
    private String fileKey;
    private Long verifiedByUserId;
    private String verifiedByName;
    private Instant verifiedAt;
    private Instant createdAt;
}
