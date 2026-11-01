package com.dearhand.repository;

import com.dearhand.entity.HelperDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HelperDocumentRepository extends JpaRepository<HelperDocument, Long> {
    List<HelperDocument> findByHelperId(Long helperId);
}
