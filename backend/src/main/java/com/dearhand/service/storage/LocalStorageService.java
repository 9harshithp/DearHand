package com.dearhand.service.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    private static final Set<String> ALLOWED_DOC_EXTENSIONS = Set.of(".pdf", ".jpg", ".jpeg", ".png", ".webp");
    private static final Set<String> ALLOWED_DOC_MIMES = Set.of(
            "application/pdf", "image/jpeg", "image/png", "image/webp"
    );

    private static final Set<String> ALLOWED_PHOTO_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");
    private static final Set<String> ALLOWED_PHOTO_MIMES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );

    private final Path rootLocation;

    public LocalStorageService(@Value("${app.upload.dir:./uploads/documents}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize document storage location", e);
        }
    }

    @Override
    public String storeDocument(Long helperId, String documentType, MultipartFile file) throws IOException {
        validateFile(file, ALLOWED_DOC_EXTENSIONS, ALLOWED_DOC_MIMES);

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "doc.pdf");
        String extension = extractAndValidateExtension(originalFilename, ALLOWED_DOC_EXTENSIONS);

        // Subdirectory per helper for privacy and isolation
        Path helperDir = this.rootLocation.resolve(String.valueOf(helperId)).normalize();
        if (!helperDir.startsWith(this.rootLocation)) {
            throw new SecurityException("Helper storage path traversal detected");
        }
        Files.createDirectories(helperDir);

        String safeDocType = documentType.toLowerCase().replaceAll("[^a-z0-9_-]", "_");
        String uniqueFileName = safeDocType + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path destinationFile = helperDir.resolve(uniqueFileName).normalize();

        // Security check against directory traversal attacks
        if (!destinationFile.getParent().equals(helperDir)) {
            throw new SecurityException("Cannot store file outside current directory");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
        }

        // Return relative file key: "{helperId}/{filename}"
        return helperId + "/" + uniqueFileName;
    }

    @Override
    public String storeVisitPhoto(Long bookingId, MultipartFile file) throws IOException {
        validateFile(file, ALLOWED_PHOTO_EXTENSIONS, ALLOWED_PHOTO_MIMES);

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo.jpg");
        String extension = extractAndValidateExtension(originalFilename, ALLOWED_PHOTO_EXTENSIONS);

        Path visitDir = this.rootLocation.resolve("visits").resolve(String.valueOf(bookingId)).normalize();
        if (!visitDir.startsWith(this.rootLocation)) {
            throw new SecurityException("Visit photo storage path traversal detected");
        }
        Files.createDirectories(visitDir);

        String uniqueFileName = "photo_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path destinationFile = visitDir.resolve(uniqueFileName).normalize();

        if (!destinationFile.getParent().equals(visitDir)) {
            throw new SecurityException("Cannot store file outside visit directory");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
        }

        return "visits/" + bookingId + "/" + uniqueFileName;
    }

    @Override
    public Resource loadAsResource(String fileKey) throws IOException {
        // Prevent path traversal
        if (fileKey == null || fileKey.contains("..") || fileKey.contains("\0")) {
            throw new SecurityException("Invalid file key requested");
        }

        Path filePath = this.rootLocation.resolve(fileKey).normalize();
        if (!filePath.startsWith(this.rootLocation)) {
            throw new SecurityException("File path traversal detected");
        }

        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new FileNotFoundException("Could not read file: " + fileKey);
        }
    }

    @Override
    public void deleteDocument(String fileKey) throws IOException {
        if (fileKey == null || fileKey.contains("..") || fileKey.contains("\0")) {
            throw new SecurityException("Invalid file key requested");
        }
        Path filePath = this.rootLocation.resolve(fileKey).normalize();
        if (filePath.startsWith(this.rootLocation)) {
            Files.deleteIfExists(filePath);
        }
    }

    private void validateFile(MultipartFile file, Set<String> allowedExtensions, Set<String> allowedMimes) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed limit (10MB)");
        }

        String contentType = file.getContentType();
        if (contentType != null && !contentType.isBlank()) {
            String cleanMime = contentType.toLowerCase().split(";")[0].trim();
            if (!allowedMimes.contains(cleanMime)) {
                throw new IllegalArgumentException("Unsupported file type: " + cleanMime + ". Allowed types: " + allowedMimes);
            }
        }
    }

    private String extractAndValidateExtension(String filename, Set<String> allowedExtensions) {
        if (filename == null || filename.contains("\0")) {
            throw new SecurityException("Invalid filename containing null bytes");
        }

        int dotIdx = filename.lastIndexOf('.');
        if (dotIdx < 0) {
            throw new IllegalArgumentException("File must have a valid extension");
        }

        String extension = filename.substring(dotIdx).toLowerCase();
        if (!allowedExtensions.contains(extension)) {
            throw new IllegalArgumentException("File extension " + extension + " is not permitted. Allowed: " + allowedExtensions);
        }

        return extension;
    }
}
