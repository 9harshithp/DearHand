package com.dearhand.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "visit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitLog extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Column(name = "checkin_at")
    private Instant checkinAt;

    @Column(name = "checkout_at")
    private Instant checkoutAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "photo_keys", columnDefinition = "TEXT")
    private String photoKeys;
}
