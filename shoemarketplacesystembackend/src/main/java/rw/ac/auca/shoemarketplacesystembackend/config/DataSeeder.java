package rw.ac.auca.shoemarketplacesystembackend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import rw.ac.auca.shoemarketplacesystembackend.domain.*;
import rw.ac.auca.shoemarketplacesystembackend.repository.*;

import java.util.List;

/**
 * Fills an EMPTY database the first time the backend starts, so the React frontend
 * has something to show and its demo buttons work.
 *
 *  - Categories are ALWAYS created if missing (a shoe cannot exist without one).
 *  - Demo stores / shoes / buyers / orders are only created when there are no
 *    vendors and no buyers yet. Turn them off with:  app.seed-demo-data=false
 *
 * Demo logins (same as the frontend's "demo persona" buttons):
 *   buyer   jeanluc.munyaneza@gmail.com   /  buyer1234
 *   vendor  hello@urbansole.rw            /  vendor1234
 *   vendor  orders@kigalifootwear.rw      /  vendor1234
 *   (info@stephouse.rw and support@sneakerhub.rw also use vendor1234)
 *
 * NOTE: generated from the frontend's data/solelink_db.json seed.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final List<String> CATEGORIES =
            List.of("Sneakers", "Running", "Formal", "Boots", "Sandals", "Casual");

    private final CategoryRepository categoryRepository;
    private final VendorRepository vendorRepository;
    private final BuyerRepository buyerRepository;
    private final ShoeRepository shoeRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-demo-data:true}")
    private boolean seedDemoData;

    @Override
    @Transactional
    public void run(String... args) {
        for (String name : CATEGORIES) {
            if (!categoryRepository.existsByName(name)) {
                Category category = new Category();
                category.setName(name);
                categoryRepository.save(category);
            }
        }

        if (seedDemoData && vendorRepository.count() == 0 && buyerRepository.count() == 0) {
            seedDemo();
            System.out.println(">>> SoleLink demo data created (4 stores, 10 shoes, demo logins).");
        }
    }

    private void seedDemo() {
        // ---------- vendors ----------
        Vendor v1 = vendor("Urban Sole", "Eric Habimana", "hello@urbansole.rw", "+250 788 123 456",
                "Modern urban footwear, lifestyle runners, and court classics",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80",
                "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80",
                "Kigali Heights, Level 1", "Gasabo, Kigali", "KG 7 Ave, Kigali Heights Mall, Suite 104",
                "Mon – Sat: 9:00 AM – 8:00 PM | Sun: 11:00 AM – 6:00 PM",
                4.9, 142, "Urban Sole is an independent boutique footwear destination founded in 2021 at Kigali Heights. We curate authentic streetwear, modern minimalism, and performance lifestyle sneakers for everyday city movement.");

        Vendor v2 = vendor("Kigali Footwear", "Patrick Mugisha", "orders@kigalifootwear.rw", "+250 785 987 654",
                "Artisanal leather shoes, handcrafted dress wear & Chelsea boots",
                "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=200&q=80",
                "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1200&q=80",
                "Nyarugenge Commercial District", "Nyarugenge, Kigali", "KN 2 Ave, Heritage Plaza 2nd Floor",
                "Mon – Fri: 8:30 AM – 7:30 PM | Sat: 9:00 AM – 6:00 PM",
                4.8, 98, "Specialists in premium calfskin dress shoes, burnished brogues, and handcrafted suede Chelsea boots. Kigali Footwear partners with master leather artisans to bring timeless elegance to Rwandan professionals.");

        Vendor v3 = vendor("Step House", "Aline Uwase", "info@stephouse.rw", "+250 783 456 789",
                "High-mileage road running, cross-trainers & trail sneakers",
                "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=200&q=80",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
                "Kimironko Hub", "Gasabo, Kigali", "KG 11 Ave, Near Kimironko Market Galleria",
                "Mon – Sun: 8:00 AM – 8:30 PM",
                4.9, 184, "Kigali’s prime athletic running shop. Whether training for the Kigali International Peace Marathon or evening runs on KG 9, Step House supplies verified authentic performance running models with foot mapping advice.");

        Vendor v4 = vendor("The Sneaker Hub", "David Nshimiyimana", "support@sneakerhub.rw", "+250 782 112 233",
                "Rare collector deadstocks, retro skate shoes & high-tops",
                "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=200&q=80",
                "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80",
                "Remera Sports Zone", "Kicukiro / Remera, Kigali", "KG 17 Ave, Adjacent Amahoro Stadium Gate 3",
                "Mon – Sat: 10:00 AM – 9:00 PM",
                4.7, 76, "The cultural center for sneakerheads in Rwanda. Established near Amahoro National Stadium, The Sneaker Hub bridges vintage basketball heritage with contemporary limited releases.");

        // ---------- shoes ----------
        Shoe s1 = shoe(v1, "Running", "Stride Runner", "SoleLink Lab", 72000, 85000,
                ShoeCondition.NEW, "Chalk White & Raw Terracotta",
                "Engineered breathable knit upper, responsive EVA cushioning",
                "The Stride Runner brings seamless architectural simplicity to high-mileage road running. Featuring dual-density foam midsoles, contoured arch support, and lightweight recycled mesh that adapts naturally to your stride.",
                4.9, 46, true, true,
                new String[]{"/src/assets/images/product_stride_runner_1791024866210.jpg", "/src/assets/images/hero_editorial_sneakers_1791024851058.jpg"},
                new int[][]{{40, 3}, {41, 5}, {42, 2}, {43, 4}, {44, 1}});

        Shoe s2 = shoe(v1, "Sneakers", "Urban Classic Low", "Urban Core", 54000, 62000,
                ShoeCondition.NEW, "Alabaster & Minimal Grey",
                "Full-grain Italian Nappa leather, vulcanized rubber sole",
                "Clean-line streetwear stripped of excess branding. Hand-stitched cupsole construction offers durability that softens with time, making it the quintessential everyday wardrobe staple.",
                4.8, 68, true, true,
                new String[]{"/src/assets/images/hero_editorial_sneakers_1791024851058.jpg", "/src/assets/images/product_stride_runner_1791024866210.jpg"},
                new int[][]{{39, 4}, {40, 6}, {41, 3}, {42, 5}, {43, 2}});

        Shoe s3 = shoe(v2, "Formal", "Thrivo Oxford Derby", "Kigali Artisan", 95000, 110000,
                ShoeCondition.NEW, "Onyx Polished Black",
                "Full-grain calfskin leather, Goodyear-welted double leather sole",
                "Handcrafted with traditional bench-grade techniques, the Thrivo Oxford features razor-sharp toe shaping, subtle perforation, and deep vegetable-tanned luster for formal boardrooms and celebratory events.",
                4.9, 38, true, true,
                new String[]{"/src/assets/images/product_urban_derby_1791024877822.jpg", "/src/assets/images/category_formal_leather_1791024899606.jpg"},
                new int[][]{{40, 2}, {41, 4}, {42, 3}, {43, 2}, {44, 2}, {45, 1}});

        Shoe s4 = shoe(v2, "Boots", "Chelsea Essential Suede", "Atelier Heritage", 88000, 98000,
                ShoeCondition.NEW, "Sand Taupe",
                "Silky calf suede upper, heavy-duty elastic gore, stacked leather heel",
                "An understated icon. Cut from weather-treated velvety suede with sleek Chelsea pull tabs and an ergonomic cushioned insole designed for effortless all-day city transit.",
                4.8, 52, true, true,
                new String[]{"/src/assets/images/product_chelsea_boot_1791024888794.jpg", "/src/assets/images/product_urban_derby_1791024877822.jpg"},
                new int[][]{{40, 2}, {41, 2}, {42, 1}, {43, 3}, {44, 1}});

        Shoe s5 = shoe(v1, "Sneakers", "Metro Court Sneaker", "Urban Core", 62000, null,
                ShoeCondition.NEW, "Warm Sand / Off-White",
                "Premium tumbled leather, perforated toe box, rubber outsole",
                "Vintage 80s court silhouette re-imagined with modern lightweight flexibility and supportive ankle padding. Clean lines with zero unnecessary frills.",
                4.7, 29, false, false,
                new String[]{"/src/assets/images/hero_editorial_sneakers_1791024851058.jpg", "/src/assets/images/product_stride_runner_1791024866210.jpg"},
                new int[][]{{38, 2}, {39, 3}, {40, 5}, {41, 4}, {42, 6}, {43, 2}});

        Shoe s6 = shoe(v3, "Running", "Motion Trainer Pro", "AeroStep", 78000, 90000,
                ShoeCondition.NEW, "Slate Charcoal & Lime Accent",
                "Engineered jacquard weave, carbon-infused torsion plate",
                "Engineered for tempo training and marathon endurance. Features an ultra-responsive rocker geometry that drives forward momentum with minimal energy fatigue.",
                4.9, 41, true, true,
                new String[]{"/src/assets/images/product_stride_runner_1791024866210.jpg", "/src/assets/images/hero_editorial_sneakers_1791024851058.jpg"},
                new int[][]{{41, 3}, {42, 4}, {43, 3}, {44, 2}, {45, 2}});

        Shoe s7 = shoe(v2, "Formal", "Kigali Monkstrap Formal", "Kigali Artisan", 110000, null,
                ShoeCondition.NEW, "Burnished Chestnut Brown",
                "Hand-patinated vegetable tanned box-calf, brass buckle hardware",
                "Double monk strap shoe with sharp almond toe profile. Each pair undergoes twelve hand-finishing tint cycles to achieve deep, rich color transitions in the leather.",
                4.8, 22, false, false,
                new String[]{"/src/assets/images/category_formal_leather_1791024899606.jpg", "/src/assets/images/product_urban_derby_1791024877822.jpg"},
                new int[][]{{40, 1}, {41, 3}, {42, 2}, {43, 2}, {44, 1}});

        Shoe s8 = shoe(v4, "Sneakers", "Street Low Retro", "Nike Retro", 68000, 80000,
                ShoeCondition.USED_LIKE_NEW, "Monochrome Black & Summit White",
                "Smooth leather upper with suede overlays, herringbone traction",
                "Curated deadstock condition. Carefully authenticated by The Sneaker Hub in Remera. Original insoles, clean tread, pristine leather upper.",
                4.7, 19, true, false,
                new String[]{"/src/assets/images/hero_editorial_sneakers_1791024851058.jpg", "/src/assets/images/product_stride_runner_1791024866210.jpg"},
                new int[][]{{41, 1}, {42, 1}, {43, 1}});

        Shoe s9 = shoe(v2, "Boots", "Rwandan Safari Desert Boot", "Atelier Heritage", 82000, null,
                ShoeCondition.NEW, "Raw Nubuck Tan",
                "Natural nubuck leather, plantation crepe natural rubber sole",
                "Constructed for terrain versatility from the hills of Musanze to downtown Kigali meetings. Natural crepe rubber absorbs impact with silent grip.",
                4.8, 31, false, false,
                new String[]{"/src/assets/images/product_chelsea_boot_1791024888794.jpg", "/src/assets/images/category_formal_leather_1791024899606.jpg"},
                new int[][]{{39, 2}, {40, 4}, {41, 3}, {42, 4}, {43, 2}, {44, 2}});

        Shoe s10 = shoe(v1, "Sandals", "Nyungwe Leather Slide", "SoleLink Lab", 38000, 45000,
                ShoeCondition.NEW, "Caramel Brown & Brass Rivet",
                "Aniline leather cross-strap, molded cork-latex footbed",
                "Ergonomic anatomical footbed lined with breathable suede. Shapes itself to your unique foot arch over time for unparalleled weekend ease.",
                4.9, 57, false, false,
                new String[]{"/src/assets/images/category_formal_leather_1791024899606.jpg", "/src/assets/images/product_chelsea_boot_1791024888794.jpg"},
                new int[][]{{38, 4}, {39, 5}, {40, 6}, {41, 5}, {42, 3}, {43, 2}});

        // ---------- buyers ----------
        Buyer b1 = buyer("Jean-Luc Munyaneza", "jeanluc.munyaneza@gmail.com", "+250 788 345 678", "Gasabo, Kigali", "KG 14 Ave, House 22, Kacyiru", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80");
        Buyer b2 = buyer("Claire Umutoni", "claire.umutoni@kigali.rw", "+250 782 554 112", "Gasabo, Kigali", "KG 549 St, Gacuriro", null);

        // ---------- orders ----------
        order("SL-2026-8910", b1, OrderStatus.PREPARING, "Jean-Luc Munyaneza", "+250 788 345 678", "Gasabo, Kigali", "KG 14 Ave, House 22, Kacyiru", "Please ring the black gate buzzer upon arrival.", new Object[][]{{s1, 42, 1}});
        order("SL-2026-8842", b1, OrderStatus.COMPLETED, "Jean-Luc Munyaneza", "+250 788 345 678", "Gasabo, Kigali", "KG 14 Ave, House 22, Kacyiru", null, new Object[][]{{s3, 42, 1}});
        order("SL-2026-8924", b2, OrderStatus.PENDING, "Claire Umutoni", "+250 782 554 112", "Gasabo, Kigali", "KG 549 St, Gacuriro", "Call me when near MTN Centre.", new Object[][]{{s2, 40, 1}, {s4, 40, 1}});
    }

    // ============================== helpers ==============================

    private Vendor vendor(String name, String owner, String email, String phone, String tagline,
                          String logo, String cover, String location, String district, String address,
                          String openingHours, double rating, int reviewCount, String about) {
        Vendor v = new Vendor();
        v.setName(name);
        v.setOwnerName(owner);
        v.setEmail(email);
        v.setPhone(phone);
        v.setPassword(passwordEncoder.encode("vendor1234"));
        v.setTagline(tagline);
        v.setLogo(logo);
        v.setCoverImage(cover);
        v.setLocation(location);
        v.setDistrict(district);
        v.setAddress(address);
        v.setOpeningHours(openingHours);
        v.setRating(rating);
        v.setReviewCount(reviewCount);
        v.setVerified(true);
        v.setAbout(about);
        return vendorRepository.save(v);
    }

    private Buyer buyer(String fullName, String email, String phone, String district, String address, String avatar) {
        Buyer b = new Buyer();
        b.setFullName(fullName);
        b.setEmail(email);
        b.setPhone(phone);
        b.setPassword(passwordEncoder.encode("buyer1234"));
        b.setDistrict(district);
        b.setAddress(address);
        b.setAvatar(avatar);
        return buyerRepository.save(b);
    }

    private Shoe shoe(Vendor vendor, String category, String name, String brand, int price, Integer originalPrice,
                      ShoeCondition condition, String color, String material, String description,
                      double rating, int reviewCount, boolean bestSeller, boolean featured,
                      String[] images, int[][] stock) {
        Shoe s = new Shoe();
        s.setVendor(vendor);
        s.setCategory(categoryRepository.findByName(category).orElseThrow());
        s.setName(name);
        s.setBrand(brand);
        s.setPrice(price);
        s.setOriginalPrice(originalPrice);
        s.setCondition(condition);
        s.setColor(color);
        s.setMaterial(material);
        s.setDescription(description);
        s.setRating(rating);
        s.setReviewCount(reviewCount);
        s.setBestSeller(bestSeller);
        s.setFeatured(featured);
        s.getImages().addAll(List.of(images));
        for (int[] row : stock) {
            ShoeStock st = new ShoeStock();
            st.setSize(row[0]);
            st.setQuantity(row[1]);
            st.setShoe(s);
            s.getStocks().add(st);
        }
        return shoeRepository.save(s);
    }

    /** items: each row is { Shoe, size, quantity } */
    private void order(String orderNumber, Buyer buyer, OrderStatus status, String customerName, String phone,
                       String district, String address, String notes, Object[][] items) {
        Order o = new Order();
        o.setOrderNumber(orderNumber);
        o.setBuyer(buyer);
        o.setStatus(status);
        o.setCustomerName(customerName);
        o.setPhone(phone);
        o.setDistrict(district);
        o.setAddress(address);
        o.setDeliveryNotes(notes);

        int subtotal = 0;
        for (Object[] row : items) {
            Shoe shoe = (Shoe) row[0];
            int size = (Integer) row[1];
            int quantity = (Integer) row[2];

            OrderItem item = new OrderItem();
            item.setOrder(o);
            item.setShoe(shoe);
            item.setVendor(shoe.getVendor());
            item.setShoeName(shoe.getName());
            item.setBrand(shoe.getBrand());
            item.setImage(shoe.getImages().isEmpty() ? null : shoe.getImages().get(0));
            item.setSize(size);
            item.setQuantity(quantity);
            item.setPrice(shoe.getPrice());
            o.getItems().add(item);
            subtotal += shoe.getPrice() * quantity;
        }
        o.setSubtotal(subtotal);
        o.setDeliveryFee(2500);
        o.setTotal(subtotal + 2500);
        orderRepository.save(o);
    }
}
