package rw.ac.auca.shoemarketplacesystembackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import rw.ac.auca.shoemarketplacesystembackend.domain.Buyer;
import rw.ac.auca.shoemarketplacesystembackend.domain.Role;
import rw.ac.auca.shoemarketplacesystembackend.domain.Vendor;
import rw.ac.auca.shoemarketplacesystembackend.dto.DTOs;
import rw.ac.auca.shoemarketplacesystembackend.repository.BuyerRepository;
import rw.ac.auca.shoemarketplacesystembackend.repository.VendorRepository;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final BuyerRepository buyerRepository;
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenStore tokenStore;

    // ---------- register / login ----------

    public DTOs.AuthResponse registerBuyer(DTOs.RegisterBuyerRequest request) {
        String email = cleanEmail(request.email());
        if (isBlank(request.fullName()) || isBlank(request.phone())) {
            throw error(HttpStatus.BAD_REQUEST, "Please provide all required fields.");
        }
        checkEmailAndPassword(email, request.password(), request.confirmPassword());

        Buyer buyer = new Buyer();
        buyer.setFullName(request.fullName().trim());
        buyer.setEmail(email);
        buyer.setPhone(request.phone().trim());
        buyer.setPassword(passwordEncoder.encode(request.password()));
        buyer.setDistrict(request.district());
        buyer.setAddress(request.address());
        buyer = buyerRepository.save(buyer);

        String token = tokenStore.create(buyer.getId(), Role.BUYER);
        return buyerResponse(buyer, token, "Account created successfully");
    }

    public DTOs.AuthResponse registerVendor(DTOs.RegisterVendorRequest request) {
        String email = cleanEmail(request.email());
        if (isBlank(request.ownerName()) || isBlank(request.shopName())
                || isBlank(request.phone()) || isBlank(request.location())) {
            throw error(HttpStatus.BAD_REQUEST, "Please fill in all required vendor registration fields.");
        }
        checkEmailAndPassword(email, request.password(), request.confirmPassword());

        Vendor vendor = new Vendor();
        vendor.setOwnerName(request.ownerName().trim());
        vendor.setName(request.shopName().trim());
        vendor.setEmail(email);
        vendor.setPhone(request.phone().trim());
        vendor.setLocation(request.location().trim());
        vendor.setPassword(passwordEncoder.encode(request.password()));
        vendor.setAbout(request.about());
        vendor.setAddress(request.address());
        vendor = vendorRepository.save(vendor);

        String token = tokenStore.create(vendor.getId(), Role.VENDOR);
        return vendorResponse(vendor, token, "Vendor account created successfully");
    }

    public DTOs.AuthResponse login(DTOs.LoginRequest request) {
        String email = cleanEmail(request.email());
        if (email.isEmpty() || isBlank(request.password())) {
            throw error(HttpStatus.BAD_REQUEST, "Email and password are required.");
        }

        Optional<Buyer> buyer = buyerRepository.findByEmail(email);
        if (buyer.isPresent() && passwordEncoder.matches(request.password(), buyer.get().getPassword())) {
            String token = tokenStore.create(buyer.get().getId(), Role.BUYER);
            return buyerResponse(buyer.get(), token, "Welcome back");
        }

        Optional<Vendor> vendor = vendorRepository.findByEmail(email);
        if (vendor.isPresent() && passwordEncoder.matches(request.password(), vendor.get().getPassword())) {
            String token = tokenStore.create(vendor.get().getId(), Role.VENDOR);
            return vendorResponse(vendor.get(), token, "Welcome back");
        }

        throw error(HttpStatus.UNAUTHORIZED, "Incorrect email or password.");
    }

    public DTOs.AuthResponse me(String authorization) {
        TokenStore.Session session = requireLogin(authorization);
        if (session.role() == Role.BUYER) {
            Buyer buyer = buyerRepository.findById(session.userId())
                    .orElseThrow(() -> error(HttpStatus.UNAUTHORIZED, "Not authenticated"));
            return buyerResponse(buyer, null, null);
        }
        Vendor vendor = vendorRepository.findById(session.userId())
                .orElseThrow(() -> error(HttpStatus.UNAUTHORIZED, "Not authenticated"));
        return vendorResponse(vendor, null, null);
    }

    public void logout(String authorization) {
        String token = extractToken(authorization);
        if (token != null) {
            tokenStore.remove(token);
        }
    }

    // ---------- used by the other controllers ----------

    public TokenStore.Session requireLogin(String authorization) {
        String token = extractToken(authorization);
        TokenStore.Session session = token == null ? null : tokenStore.find(token);
        if (session == null) {
            throw error(HttpStatus.UNAUTHORIZED, "Authentication required. Please sign in.");
        }
        return session;
    }

    public UUID requireBuyer(String authorization) {
        TokenStore.Session session = requireLogin(authorization);
        if (session.role() != Role.BUYER) {
            throw error(HttpStatus.FORBIDDEN, "Buyer account privileges required for this action.");
        }
        return session.userId();
    }

    public UUID requireVendor(String authorization) {
        TokenStore.Session session = requireLogin(authorization);
        if (session.role() != Role.VENDOR) {
            throw error(HttpStatus.FORBIDDEN, "Vendor account privileges required for this action.");
        }
        return session.userId();
    }

    // ---------- helpers ----------

    private void checkEmailAndPassword(String email, String password, String confirmPassword) {
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw error(HttpStatus.BAD_REQUEST, "Please enter a valid email address.");
        }
        if (password == null || password.length() < 8) {
            throw error(HttpStatus.BAD_REQUEST, "Password must contain at least 8 characters.");
        }
        if (!password.equals(confirmPassword)) {
            throw error(HttpStatus.BAD_REQUEST, "Passwords do not match.");
        }
        if (buyerRepository.existsByEmail(email) || vendorRepository.existsByEmail(email)) {
            throw error(HttpStatus.CONFLICT, "Email address is already registered.");
        }
    }

    private DTOs.AuthResponse buyerResponse(Buyer buyer, String token, String message) {
        DTOs.AuthResponse.UserInfo user = new DTOs.AuthResponse.UserInfo(buyer.getId(), "buyer",
                buyer.getEmail(), buyer.getFullName(), buyer.getPhone(),
                buyer.getDistrict(), buyer.getAddress(), buyer.getAvatar(), null);
        return new DTOs.AuthResponse(user, null, token, "buyer", message);
    }

    private DTOs.AuthResponse vendorResponse(Vendor vendor, String token, String message) {
        DTOs.AuthResponse.UserInfo user = new DTOs.AuthResponse.UserInfo(vendor.getId(), "vendor",
                vendor.getEmail(), vendor.getOwnerName(), vendor.getPhone(),
                vendor.getDistrict(), vendor.getAddress(), vendor.getLogo(), vendor.getId());
        return new DTOs.AuthResponse(user, vendor, token, "vendor", message);
    }

    private String extractToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }
        return authorization.substring(7);
    }

    private String cleanEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private boolean isBlank(String text) {
        return text == null || text.isBlank();
    }

    private ResponseStatusException error(HttpStatus status, String message) {
        return new ResponseStatusException(status, message);
    }
}
