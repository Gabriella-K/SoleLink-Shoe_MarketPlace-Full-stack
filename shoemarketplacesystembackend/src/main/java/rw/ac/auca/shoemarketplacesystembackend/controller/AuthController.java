package rw.ac.auca.shoemarketplacesystembackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rw.ac.auca.shoemarketplacesystembackend.dto.DTOs;
import rw.ac.auca.shoemarketplacesystembackend.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register-buyer")
    @ResponseStatus(HttpStatus.CREATED)
    public DTOs.AuthResponse registerBuyer(@RequestBody DTOs.RegisterBuyerRequest request) {
        return authService.registerBuyer(request);
    }

    @PostMapping("/register-vendor")
    @ResponseStatus(HttpStatus.CREATED)
    public DTOs.AuthResponse registerVendor(@RequestBody DTOs.RegisterVendorRequest request) {
        return authService.registerVendor(request);
    }

    @PostMapping("/login")
    public DTOs.AuthResponse login(@RequestBody DTOs.LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public DTOs.AuthResponse me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return authService.me(authorization);
    }

    @PostMapping("/logout")
    public Map<String, String> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        authService.logout(authorization);
        return Map.of("message", "Signed out");
    }
}
