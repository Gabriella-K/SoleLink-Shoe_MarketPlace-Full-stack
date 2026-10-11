package rw.ac.auca.shoemarketplacesystembackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import rw.ac.auca.shoemarketplacesystembackend.domain.*;
import rw.ac.auca.shoemarketplacesystembackend.repository.*;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class ShoeService {

    private final ShoeRepository shoeRepository;
    private final VendorRepository vendorRepository;
    private final CategoryRepository categoryRepository;

    public List<Shoe> search(String search, String category, String brand, Integer size,
                             ShoeCondition condition, Integer minPrice, Integer maxPrice,
                             UUID vendorId, String sortBy) {

        List<Shoe> result = new ArrayList<>();

        for (Shoe shoe : shoeRepository.findAll()) {
            if (search != null && !search.isBlank()) {
                String text = search.toLowerCase();
                boolean matches = shoe.getName().toLowerCase().contains(text)
                        || shoe.getBrand().toLowerCase().contains(text);
                if (!matches) continue;
            }
            if (category != null && !shoe.getCategory().getName().equalsIgnoreCase(category)) continue;
            if (brand != null && !shoe.getBrand().equalsIgnoreCase(brand)) continue;
            if (condition != null && shoe.getCondition() != condition) continue;
            if (minPrice != null && shoe.getPrice() < minPrice) continue;
            if (maxPrice != null && shoe.getPrice() > maxPrice) continue;
            if (vendorId != null && !shoe.getVendor().getId().equals(vendorId)) continue;
            if (size != null && !hasSizeInStock(shoe, size)) continue;

            result.add(shoe);
        }

        sort(result, sortBy);
        return result;
    }

    public Shoe getById(UUID id) {
        return shoeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shoe not found"));
    }

    public Shoe create(UUID vendorId, Shoe request) {
        validate(request);
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendor not found"));

        Shoe shoe = new Shoe();
        shoe.setVendor(vendor);
        copyFields(shoe, request);
        return shoeRepository.save(shoe);
    }

    public Shoe update(UUID id, UUID vendorId, Shoe request) {
        Shoe shoe = getOwnedShoe(id, vendorId);
        validate(request);
        copyFields(shoe, request);
        return shoeRepository.save(shoe);
    }

    public void delete(UUID id, UUID vendorId) {
        Shoe shoe = getOwnedShoe(id, vendorId);
        try {
            shoeRepository.delete(shoe);
            shoeRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This shoe is in a cart or an order. Set its stock to 0 instead.");
        }
    }

    public Shoe updateStock(UUID id, UUID vendorId, int size, int newStock) {
        if (newStock < 0) {
            bad("Quantity cannot be negative");
        }
        Shoe shoe = getOwnedShoe(id, vendorId);

        boolean found = false;
        for (ShoeStock stock : shoe.getStocks()) {
            if (stock.getSize() == size) {
                stock.setQuantity(newStock);
                found = true;
            }
        }
        if (!found) {
            ShoeStock stock = new ShoeStock();
            stock.setSize(size);
            stock.setQuantity(newStock);
            stock.setShoe(shoe);
            shoe.getStocks().add(stock);
        }
        return shoeRepository.save(shoe);
    }

    // ---------- helpers ----------

    private Shoe getOwnedShoe(UUID id, UUID vendorId) {
        Shoe shoe = getById(id);
        if (!shoe.getVendor().getId().equals(vendorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this shoe listing");
        }
        return shoe;
    }

    private void copyFields(Shoe shoe, Shoe request) {
        shoe.setName(request.getName());
        shoe.setBrand(request.getBrand());
        shoe.setPrice(request.getPrice());
        shoe.setOriginalPrice(request.getOriginalPrice());
        shoe.setCondition(request.getCondition());
        shoe.setColor(request.getColor());
        shoe.setMaterial(request.getMaterial());
        shoe.setDescription(request.getDescription());
        shoe.setBestSeller(request.isBestSeller());
        shoe.setFeatured(request.isFeatured());

        Category category = categoryRepository.findById(request.getCategory().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        shoe.setCategory(category);

        shoe.getImages().clear();
        if (request.getImages() != null) {
            shoe.getImages().addAll(request.getImages());
        }

        shoe.getStocks().clear();
        if (request.getStocks() != null) {
            for (ShoeStock item : request.getStocks()) {
                ShoeStock stock = new ShoeStock();
                stock.setSize(item.getSize());
                stock.setQuantity(item.getQuantity());
                stock.setShoe(shoe);
                shoe.getStocks().add(stock);
            }
        }
    }

    private boolean hasSizeInStock(Shoe shoe, int size) {
        for (ShoeStock stock : shoe.getStocks()) {
            if (stock.getSize() == size && stock.getQuantity() > 0) {
                return true;
            }
        }
        return false;
    }

    private void sort(List<Shoe> shoes, String sortBy) {
        if (sortBy == null) return;
        switch (sortBy) {
            case "price-asc" -> shoes.sort(Comparator.comparingInt(Shoe::getPrice));
            case "price-desc" -> shoes.sort(Comparator.comparingInt(Shoe::getPrice).reversed());
            case "newest" -> shoes.sort(Comparator.comparing(Shoe::getCreatedAt).reversed());
            case "rating" -> shoes.sort(Comparator.comparingDouble(Shoe::getRating).reversed());
            default -> { }
        }
    }

    private void validate(Shoe shoe) {
        if (shoe.getName() == null || shoe.getName().isBlank()) bad("Shoe name is required");
        if (shoe.getBrand() == null || shoe.getBrand().isBlank()) bad("Brand is required");
        if (shoe.getPrice() <= 0) bad("Price must be greater than 0");
        if (shoe.getCondition() == null) bad("Condition is required");
        if (shoe.getCategory() == null || shoe.getCategory().getId() == null) bad("Category is required");

        if (shoe.getStocks() != null) {
            for (ShoeStock stock : shoe.getStocks()) {
                if (stock.getSize() < 30 || stock.getSize() > 50) bad("Size must be between 30 and 50");
                if (stock.getQuantity() < 0) bad("Quantity cannot be negative");
            }
        }
    }

    private void bad(String message) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}