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
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

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
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "doc");
        String extension = "";
        int dotIdx = originalFilename.lastIndexOf('.');
        if (dotIdx > 0) {
            extension = originalFilename.substring(dotIdx);
        }

        // Subdirectory per helper for privacy and isolation
        Path helperDir = this.rootLocation.resolve(String.valueOf(helperId));
        Files.createDirectories(helperDir);

        String uniqueFileName = documentType.toLowerCase() + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path destinationFile = helperDir.resolve(uniqueFileName).normalize();

        // Security check against directory traversal attacks
        if (!destinationFile.getParent().equals(helperDir)) {
            throw new SecurityException("Cannot store file outside current directory");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
        }

        // Return relative file key: "helpers/{helperId}/{filename}"
        return helperId + "/" + uniqueFileName;
    }

    @Override
    public Resource loadAsResource(String fileKey) throws IOException {
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
        Path filePath = this.rootLocation.resolve(fileKey).normalize();
        if (filePath.startsWith(this.rootLocation)) {
            Files.deleteIfExists(filePath);
        }
    }
}
