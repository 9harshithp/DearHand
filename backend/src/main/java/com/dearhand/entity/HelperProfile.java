package com.dearhand.entity;

import com.dearhand.enums.HelperStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "helper_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HelperProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(nullable = false)
    @Builder.Default
    private String languages = "Kannada";

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(name = "has_licence", nullable = false)
    @Builder.Default
    private Boolean hasLicence = false;

    @Column(name = "licence_no", length = 50)
    private String licenceNo;

    @Column(name = "licence_expiry")
    private LocalDate licenceExpiry;

    @Column(name = "vehicle_type", length = 50)
    private String vehicleType;

    @Column(name = "years_experience")
    @Builder.Default
    private Integer yearsExperience = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private HelperStatus status = HelperStatus.APPLIED;

    @Column(name = "rating_avg", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal ratingAvg = BigDecimal.valueOf(5.00);

    @JsonIgnore
    @OneToMany(mappedBy = "helper", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<HelperDocument> documents = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "helper", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();
}
