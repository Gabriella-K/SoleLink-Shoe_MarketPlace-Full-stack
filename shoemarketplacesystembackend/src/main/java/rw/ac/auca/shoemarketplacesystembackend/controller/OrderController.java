package rw.ac.auca.shoemarketplacesystembackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import rw.ac.auca.shoemarketplacesystembackend.domain.Order;
import rw.ac.auca.shoemarketplacesystembackend.domain.OrderStatus;
import rw.ac.auca.shoemarketplacesystembackend.domain.Role;
import rw.ac.auca.shoemarketplacesystembackend.service.AuthService;
import rw.ac.auca.shoemarketplacesystembackend.service.OrderService;
import rw.ac.auca.shoemarketplacesystembackend.service.TokenStore;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    public record StatusRequest(String status, String rejectReason) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Order place(@RequestHeader(value = "Authorization", required = false) String authorization,
                       @RequestBody Order order) {
        UUID buyerId = authService.requireBuyer(authorization);
        return orderService.placeOrder(buyerId, order);
    }

    @GetMapping
    public List<Order> list(@RequestHeader(value = "Authorization", required = false) String authorization) {
        TokenStore.Session session = authService.requireLogin(authorization);
        if (session.role() == Role.BUYER) {
            return orderService.getForBuyer(session.userId());
        }
        return orderService.getForVendor(session.userId());
    }

    @GetMapping("/{orderNumber}")
    public Order getOne(@RequestHeader(value = "Authorization", required = false) String authorization,
                        @PathVariable String orderNumber) {
        TokenStore.Session session = authService.requireLogin(authorization);
        return orderService.getForUser(orderNumber, session);
    }

    @PatchMapping("/{orderNumber}/status")
    public Order updateStatus(@RequestHeader(value = "Authorization", required = false) String authorization,
                              @PathVariable String orderNumber, @RequestBody StatusRequest request) {
        UUID vendorId = authService.requireVendor(authorization);

        OrderStatus status;
        try {
            status = OrderStatus.valueOf(request.status().toUpperCase());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown order status");
        }
        return orderService.updateStatus(orderNumber, vendorId, status, request.rejectReason());
    }
}