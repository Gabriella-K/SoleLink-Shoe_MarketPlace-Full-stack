package rw.ac.auca.shoemarketplacesystembackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rw.ac.auca.shoemarketplacesystembackend.domain.Shoe;
import rw.ac.auca.shoemarketplacesystembackend.domain.ShoeCondition;
import rw.ac.auca.shoemarketplacesystembackend.service.AuthService;
import rw.ac.auca.shoemarketplacesystembackend.service.ShoeService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/shoes")
@RequiredArgsConstructor
public class ShoeController {

    private final ShoeService shoeService;
    private final AuthService authService;

    @GetMapping
    public List<Shoe> search(@RequestParam(required = false) String search,
                             @RequestParam(required = false) String category,
                             @RequestParam(required = false) String brand,
                             @RequestParam(required = false) Integer size,
                             @RequestParam(required = false) ShoeCondition condition,
                             @RequestParam(required = false) Integer minPrice,
                             @RequestParam(required = false) Integer maxPrice,
                             @RequestParam(required = false) UUID vendorId,
                             @RequestParam(required = false) String sortBy) {
        return shoeService.search(search, category, brand, size, condition,
                minPrice, maxPrice, vendorId, sortBy);
    }

    @GetMapping("/{id}")
    public Shoe getById(@PathVariable UUID id) {
        return shoeService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Shoe create(@RequestHeader(value = "Authorization", required = false) String authorization,
                       @RequestBody Shoe shoe) {
        UUID vendorId = authService.requireVendor(authorization);
        return shoeService.create(vendorId, shoe);
    }

    @PutMapping("/{id}")
    public Shoe update(@RequestHeader(value = "Authorization", required = false) String authorization,
                       @PathVariable UUID id, @RequestBody Shoe shoe) {
        UUID vendorId = authService.requireVendor(authorization);
        return shoeService.update(id, vendorId, shoe);
    }

    @PatchMapping("/{id}/stock")
    public Shoe updateStock(@RequestHeader(value = "Authorization", required = false) String authorization,
                            @PathVariable UUID id, @RequestBody Map<String, Integer> body) {
        UUID vendorId = authService.requireVendor(authorization);
        return shoeService.updateStock(id, vendorId, body.get("size"), body.get("newStock"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(value = "Authorization", required = false) String authorization,
                       @PathVariable UUID id) {
        UUID vendorId = authService.requireVendor(authorization);
        shoeService.delete(id, vendorId);
    }
}