package com.dearhand.dto.parent;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentDto {
    private Long id;
    private Long familyUserId;
    private String name;
    private Integer age;
    private String address;
    private String city;
    private String language;
    private String careNotes;
    private String medicalHistory;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private Instant createdAt;
}
