package com.dearhand.repository;

import com.dearhand.entity.HelperProfile;
import com.dearhand.enums.HelperStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HelperProfileRepository extends JpaRepository<HelperProfile, Long> {
    Optional<HelperProfile> findByUserId(Long userId);
    List<HelperProfile> findByStatus(HelperStatus status);
}
