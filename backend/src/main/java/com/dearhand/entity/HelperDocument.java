package com.dearhand.entity;

import com.dearhand.enums.DocumentType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "helper_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HelperDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "helper_id", nullable = false)
    private HelperProfile helper;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private DocumentType type;

    @Column(name = "file_key", nullable = false)
    private String fileKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verified_at")
    private Instant verifiedAt;
}
