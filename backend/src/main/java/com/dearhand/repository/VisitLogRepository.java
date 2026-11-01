package com.dearhand.repository;

import com.dearhand.entity.VisitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VisitLogRepository extends JpaRepository<VisitLog, Long> {
    Optional<VisitLog> findByBookingId(Long bookingId);
}
