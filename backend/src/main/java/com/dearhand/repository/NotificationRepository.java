package com.dearhand.repository;

import com.dearhand.entity.Notification;
import com.dearhand.enums.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findTop100ByOrderByCreatedAtDesc();
    long countByUserIdAndStatusNot(Long userId, NotificationStatus status);
}
