package com.dearhand.repository;

import com.dearhand.entity.Booking;
import com.dearhand.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByFamilyIdOrderByScheduledStartDesc(Long familyId);
    List<Booking> findByHelperIdOrderByScheduledStartDesc(Long helperId);
    List<Booking> findByStatus(BookingStatus status);
    Optional<Booking> findByIdAndFamilyId(Long id, Long familyId);
}
