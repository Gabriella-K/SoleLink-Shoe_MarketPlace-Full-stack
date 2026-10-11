package rw.ac.auca.shoemarketplacesystembackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import rw.ac.auca.shoemarketplacesystembackend.config.WebConfig;
import rw.ac.auca.shoemarketplacesystembackend.service.AuthService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

/**
 * POST /api/upload  { "imageBase64": "data:image/png;base64,....", "filename": "shoe.png" }
 * -> { "url": "/uploads/<uuid>.png", "message": "..." }
 * Vendors only. Max 5MB, images only.
 */
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private static final int MAX_BYTES = 5 * 1024 * 1024;

    private final AuthService authService;

    @PostMapping
    public Map<String, String> upload(@RequestHeader(value = "Authorization", required = false) String authorization,
                                      @RequestBody Map<String, String> body) {
        authService.requireVendor(authorization);

        String data = body.get("imageBase64");
        if (data == null || data.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No image data provided.");
        }

        // strip the "data:image/png;base64," prefix and work out the extension
        String extension = "jpg";
        int comma = data.indexOf(',');
        if (data.startsWith("data:") && comma > 0) {
            String header = data.substring(5, comma);              // image/png;base64
            if (!header.startsWith("image/")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed.");
            }
            String type = header.substring("image/".length(), header.indexOf(';') > 0 ? header.indexOf(';') : header.length());
            extension = switch (type) {
                case "png" -> "png";
                case "gif" -> "gif";
                case "webp" -> "webp";
                case "jpeg", "jpg" -> "jpg";
                default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported image type: " + type);
            };
            data = data.substring(comma + 1);
        }

        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(data);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image data is not valid base64.");
        }
        if (bytes.length > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image exceeds maximum 5MB size limit.");
        }

        try {
            Files.createDirectories(WebConfig.UPLOAD_DIR);
            String fileName = UUID.randomUUID() + "." + extension;
            Path target = WebConfig.UPLOAD_DIR.resolve(fileName);
            Files.write(target, bytes);
            return Map.of("url", "/uploads/" + fileName, "message", "Image uploaded successfully");
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save the image.");
        }
    }
}
