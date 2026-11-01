package com.dearhand.dto.admin;

import com.dearhand.enums.NotificationChannel;
import com.dearhand.enums.NotificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {

    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private NotificationChannel channel;
    private String template;
    private NotificationStatus status;
    private Instant sentAt;
    private Instant createdAt;
}
