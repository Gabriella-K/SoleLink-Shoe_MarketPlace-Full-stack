package rw.ac.auca.shoemarketplacesystembackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rw.ac.auca.shoemarketplacesystembackend.domain.Order;
import rw.ac.auca.shoemarketplacesystembackend.domain.OrderItem;
import rw.ac.auca.shoemarketplacesystembackend.domain.OrderStatus;
import rw.ac.auca.shoemarketplacesystembackend.repository.ShoeRepository;
import rw.ac.auca.shoemarketplacesystembackend.service.AuthService;
import rw.ac.auca.shoemarketplacesystembackend.service.OrderService;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** GET /api/vendor/analytics - the numbers shown on the vendor dashboard overview. */
@RestController
@RequestMapping("/api/vendor/analytics")
@RequiredArgsConstructor
public class VendorAnalyticsController {

    private final AuthService authService;
    private final OrderService orderService;
    private final ShoeRepository shoeRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public Map<String, Object> analytics(@RequestHeader(value = "Authorization", required = false) String authorization) {
        UUID vendorId = authService.requireVendor(authorization);

        List<Order> orders = orderService.getForVendor(vendorId);

        int completed = 0;
        int pending = 0;
        int active = 0;
        long totalSales = 0;

        for (Order order : orders) {
            OrderStatus status = order.getStatus();
            if (status == OrderStatus.COMPLETED) completed++;
            if (status == OrderStatus.PENDING) pending++;
            if (status == OrderStatus.ACCEPTED || status == OrderStatus.PREPARING || status == OrderStatus.READY) active++;

            if (status != OrderStatus.CANCELLED && status != OrderStatus.REJECTED) {
                for (OrderItem item : order.getItems()) {
                    if (item.getVendor().getId().equals(vendorId)) {
                        totalSales += (long) item.getPrice() * item.getQuantity();
                    }
                }
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalProducts", shoeRepository.findByVendorId(vendorId).size());
        result.put("pendingOrders", pending);
        result.put("activeOrders", active);
        result.put("completedOrders", completed);
        result.put("totalSales", totalSales);
        result.put("fulfillmentRate", orders.isEmpty() ? 100 : Math.round(completed * 100.0 / orders.size()));
        return result;
    }
}
