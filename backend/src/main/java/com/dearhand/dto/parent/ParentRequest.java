package com.dearhand.dto.parent;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentRequest {

    @NotBlank(message = "Parent name is required")
    private String name;

    @NotNull(message = "Age is required")
    @Min(value = 50, message = "DearHand provides care for senior citizens (age 50+)")
    private Integer age;

    @NotBlank(message = "Address in Mysuru is required")
    private String address;

    @NotBlank(message = "City is required")
    @Builder.Default
    private String city = "Mysuru";

    @NotBlank(message = "Language spoken is required (e.g. Kannada, English)")
    @Builder.Default
    private String language = "Kannada";

    private String careNotes;

    @NotBlank(message = "Emergency contact name is required")
    private String emergencyContactName;

    @NotBlank(message = "Emergency contact phone is required")
    private String emergencyContactPhone;
}
