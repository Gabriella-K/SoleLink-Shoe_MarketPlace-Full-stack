package rw.ac.auca.shoemarketplacesystembackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RestController;
import rw.ac.auca.shoemarketplacesystembackend.domain.Cart;
import rw.ac.auca.shoemarketplacesystembackend.service.AuthService;
import rw.ac.auca.shoemarketplacesystembackend.service.CartService;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final AuthService authService;

    public record AddToCartRequest(UUID shoeId, int size, int quantity) {}
    public record QuantityRequest(int delta) {}

    @GetMapping
    public Cart getCart(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return cartService.getCart(authService.requireBuyer(authorization));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Cart add(@RequestHeader(value = "Authorization", required = false) String authorization,
                    @RequestBody AddToCartRequest request) {
        UUID buyerId = authService.requireBuyer(authorization);
        return cartService.addItem(buyerId, request.shoeId(), request.size(), request.quantity());
    }

    @PutMapping("/{itemId}")
    public Cart changeQuantity(@RequestHeader(value = "Authorization", required = false) String authorization,
                               @PathVariable UUID itemId, @RequestBody QuantityRequest request) {
        UUID buyerId = authService.requireBuyer(authorization);
        return cartService.changeQuantity(buyerId, itemId, request.delta());
    }

    @DeleteMapping("/{itemId}")
    public Cart remove(@RequestHeader(value = "Authorization", required = false) String authorization,
                       @PathVariable UUID itemId) {
        return cartService.removeItem(authService.requireBuyer(authorization), itemId);
    }

    @DeleteMapping
    public Cart clear(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return cartService.clear(authService.requireBuyer(authorization));
    }
}