package com.dearhand.enums;

public enum BookingStatus {
    REQUESTED,
    MATCHED,
    ACCEPTED,
    PAID,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED;

    public boolean canCancel() {
        return this == REQUESTED || this == MATCHED || this == ACCEPTED || this == PAID;
    }
}
