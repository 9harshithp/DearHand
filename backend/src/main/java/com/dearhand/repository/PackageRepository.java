package com.dearhand.repository;

import com.dearhand.entity.CarePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PackageRepository extends JpaRepository<CarePackage, Long> {
    List<CarePackage> findByActiveTrue();
}
