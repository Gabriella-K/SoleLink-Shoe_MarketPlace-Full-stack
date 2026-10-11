package rw.ac.auca.shoemarketplacesystembackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import rw.ac.auca.shoemarketplacesystembackend.repository.CategoryRepository;
import rw.ac.auca.shoemarketplacesystembackend.repository.ShoeRepository;
import rw.ac.auca.shoemarketplacesystembackend.domain.Category;
import java.util.*;


@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ShoeRepository shoeRepository;

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public Category getById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }

    public Category create(Category category) {
        validate(category);
        if (categoryRepository.existsByName(category.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists");
        }
        return categoryRepository.save(category);
    }

    public Category update(UUID id, Category updated) {
        Category category = getById(id);
        validate(updated);

        Optional<Category> existing = categoryRepository.findByName(updated.getName());
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists");
        }

        category.setName(updated.getName());
        return categoryRepository.save(category);
    }

    public void delete(UUID id) {
        Category category = getById(id);
        if (shoeRepository.existsByCategoryId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete a category that still has shoes");
        }
        categoryRepository.delete(category);
    }

    private void validate(Category category) {
        if (category.getName() == null || category.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name is required");
        }
    }
}