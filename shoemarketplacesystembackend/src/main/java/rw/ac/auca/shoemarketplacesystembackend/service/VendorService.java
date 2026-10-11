package rw.ac.auca.shoemarketplacesystembackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import rw.ac.auca.shoemarketplacesystembackend.domain.Vendor;
import rw.ac.auca.shoemarketplacesystembackend.repository.ShoeRepository;
import rw.ac.auca.shoemarketplacesystembackend.repository.VendorRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;
    private final ShoeRepository shoeRepository;

    public List<Vendor> getAll() {
        return vendorRepository.findAll();
    }

    public Vendor getById(UUID id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendor not found"));
    }

    public Vendor update(UUID id, UUID loggedInVendorId, Vendor updated) {
        checkOwner(id, loggedInVendorId);          // first line: refuse strangers
        Vendor vendor = getById(id);

        // Only overwrite what the request actually contains, so a partial profile
        // edit can never blank out a required column (name, phone, location...).
        if (updated.getOwnerName() != null) vendor.setOwnerName(updated.getOwnerName());
        if (updated.getName() != null && !updated.getName().isBlank()) vendor.setName(updated.getName());
        if (updated.getTagline() != null) vendor.setTagline(updated.getTagline());
        if (updated.getLogo() != null) vendor.setLogo(updated.getLogo());
        if (updated.getCoverImage() != null) vendor.setCoverImage(updated.getCoverImage());
        if (updated.getLocation() != null && !updated.getLocation().isBlank()) vendor.setLocation(updated.getLocation());
        if (updated.getDistrict() != null) vendor.setDistrict(updated.getDistrict());
        if (updated.getAddress() != null) vendor.setAddress(updated.getAddress());
        if (updated.getPhone() != null && !updated.getPhone().isBlank()) vendor.setPhone(updated.getPhone());
        if (updated.getOpeningHours() != null) vendor.setOpeningHours(updated.getOpeningHours());
        if (updated.getAbout() != null) vendor.setAbout(updated.getAbout());

        return vendorRepository.save(vendor);
    }

    public void delete(UUID id, UUID loggedInVendorId) {
        checkOwner(id, loggedInVendorId);          // before the "has shoes" check
        Vendor vendor = getById(id);
        if (shoeRepository.existsByVendorId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete a vendor that still has shoes");
        }
        vendorRepository.delete(vendor);
    }

    private void checkOwner(UUID id, UUID loggedInVendorId) {
        if (!id.equals(loggedInVendorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only change your own store account.");
        }
    }
}