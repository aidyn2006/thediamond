package com.thediamond.storage;

import org.springframework.web.multipart.MultipartFile;

/** Abstraction over file storage (NFR 1.9) so the impl can change later. */
public interface StorageService {
    /** Stores the file and returns its public URL. */
    String store(MultipartFile file);
}
