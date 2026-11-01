package com.dearhand.service.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface StorageService {
    String storeDocument(Long helperId, String documentType, MultipartFile file) throws IOException;
    String storeVisitPhoto(Long bookingId, MultipartFile file) throws IOException;
    Resource loadAsResource(String fileKey) throws IOException;
    void deleteDocument(String fileKey) throws IOException;
}
