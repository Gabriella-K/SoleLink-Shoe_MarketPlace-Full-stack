package rw.ac.auca.shoemarketplacesystembackend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import rw.ac.auca.shoemarketplacesystembackend.domain.Category;
import rw.ac.auca.shoemarketplacesystembackend.repository.CategoryRepository;

import java.util.List;

/**
 * Runs once at startup and makes sure the shoe categories exist.
 *
 * A shoe cannot be created without a category, so these are the only rows the
 * application inserts by itself. Buyers and vendors are NOT pre-created:
 * everyone registers through the app (Sign In / Register).
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final List<String> CATEGORIES =
            List.of("Sneakers", "Running", "Formal", "Boots", "Sandals", "Casual");

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public void run(String... args) {
        for (String name : CATEGORIES) {
            if (!categoryRepository.existsByName(name)) {
                Category category = new Category();
                category.setName(name);
                categoryRepository.save(category);
            }
        }
    }
}
