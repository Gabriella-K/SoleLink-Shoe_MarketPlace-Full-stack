package rw.ac.auca.shoemarketplacesystembackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Lets the React frontend talk to this API and serves uploaded shoe images.
 *
 * - CORS: only needed if the frontend calls http://localhost:8080 directly.
 *   (The Vite dev server normally proxies /api, so the browser never hits CORS.)
 * - /uploads/**: files saved by UploadController are served from ./uploads
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    public static final Path UPLOAD_DIR = Paths.get("uploads").toAbsolutePath().normalize();

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(UPLOAD_DIR.toUri().toString());
    }
}
