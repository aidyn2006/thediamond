package com.thediamond.api;

import com.thediamond.storage.StorageService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final StorageService storage;

    public UploadController(StorageService storage) {
        this.storage = storage;
    }

    @PostMapping("/avatar")
    @PreAuthorize("isAuthenticated()")
    public Map<String, String> uploadAvatar(@RequestParam("file") MultipartFile file) {
        return Map.of("url", storage.store(file));
    }
}
