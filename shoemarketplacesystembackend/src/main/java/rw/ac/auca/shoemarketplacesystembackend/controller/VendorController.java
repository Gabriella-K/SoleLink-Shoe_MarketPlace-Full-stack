package rw.ac.auca.shoemarketplacesystembackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rw.ac.auca.shoemarketplacesystembackend.domain.Vendor;
import rw.ac.auca.shoemarketplacesystembackend.service.AuthService;
import rw.ac.auca.shoemarketplacesystembackend.service.VendorService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;
    private final AuthService authService;

    @GetMapping
    public List<Vendor> getAll() {
        return vendorService.getAll();
    }

    @GetMapping("/{id}")
    public Vendor getById(@PathVariable UUID id) {
        return vendorService.getById(id);
    }

    @PutMapping("/{id}")
    public Vendor update(@RequestHeader(value = "Authorization", required = false) String authorization,
                         @PathVariable UUID id, @RequestBody Vendor vendor) {
        UUID vendorId = authService.requireVendor(authorization);
        return vendorService.update(id, vendorId, vendor);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(value = "Authorization", required = false) String authorization,
                       @PathVariable UUID id) {
        UUID vendorId = authService.requireVendor(authorization);
        vendorService.delete(id, vendorId);
    }
}