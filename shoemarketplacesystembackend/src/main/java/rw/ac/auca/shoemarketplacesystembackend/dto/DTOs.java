package rw.ac.auca.shoemarketplacesystembackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import rw.ac.auca.shoemarketplacesystembackend.domain.Vendor;

import java.util.UUID;

public class DTOs {
    public record LoginRequest(String email, String password) {}

    public record RegisterBuyerRequest(String fullName, String email, String phone,
                                       String password, String confirmPassword,
                                       String district, String address) {}

    public record RegisterVendorRequest(String ownerName, String shopName, String email,
                                        String phone, String location,
                                        String password, String confirmPassword,
                                        String about, String address) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record AuthResponse(UserInfo user, Vendor vendor, String token,
                               String role, String message) {

        @JsonInclude(JsonInclude.Include.NON_NULL)
        public record UserInfo(UUID id, String role, String email, String fullName,
                               String phone, String district, String address,
                               String avatar, UUID vendorId) {}
    }
}
