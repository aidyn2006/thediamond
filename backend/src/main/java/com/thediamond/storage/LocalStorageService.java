package com.thediamond.storage;

import com.thediamond.error.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/** Local filesystem storage. Files land in app.storage.upload-dir, served at /uploads/**. */
@Service
public class LocalStorageService implements StorageService {

    private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_BYTES = 2 * 1024 * 1024;

    private final Path root;
    private final String publicBaseUrl;

    public LocalStorageService(@Value("${app.storage.upload-dir}") String uploadDir,
                               @Value("${app.storage.public-base-url}") String publicBaseUrl) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl.replaceAll("/$", "");
    }

    @Override
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("FILE_EMPTY", "Файл не выбран");
        }
        if (file.getSize() > MAX_BYTES) {
            throw ApiException.badRequest("FILE_TOO_LARGE", "Файл больше 2 МБ");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED.contains(contentType)) {
            throw ApiException.badRequest("FILE_TYPE", "Только jpg, png или webp");
        }
        String ext = switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
        String filename = UUID.randomUUID().toString().replace("-", "") + ext;
        try {
            Files.createDirectories(root);
            Path target = root.resolve(filename).normalize();
            if (!target.startsWith(root)) {
                throw ApiException.badRequest("FILE_PATH", "Некорректное имя файла");
            }
            file.transferTo(target);
        } catch (IOException e) {
            throw new ApiException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "STORAGE", "Не получилось сохранить файл");
        }
        return publicBaseUrl + "/" + filename;
    }
}
