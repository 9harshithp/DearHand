package com.dearhand.repository;

import com.dearhand.entity.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParentRepository extends JpaRepository<Parent, Long> {
    List<Parent> findByFamilyUserId(Long familyUserId);
    Optional<Parent> findByIdAndFamilyUserId(Long id, Long familyUserId);
}
