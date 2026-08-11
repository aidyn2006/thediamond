package com.thediamond.seed;

import com.thediamond.domain.Listing;
import com.thediamond.domain.ListingStatus;
import com.thediamond.domain.PhoneBrand;
import com.thediamond.domain.PhoneCondition;
import com.thediamond.domain.Role;
import com.thediamond.domain.User;
import com.thediamond.domain.UserProfile;
import com.thediamond.repo.ListingRepository;
import com.thediamond.repo.UserProfileRepository;
import com.thediamond.repo.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

/**
 * Demo data for a fresh database. Idempotent: seeds only when the users table is
 * empty, so it never touches a live install.
 */
@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String DEMO_PASSWORD = "password123";

    @Bean
    public ApplicationRunner seedData(UserRepository users, UserProfileRepository profiles,
                                      ListingRepository listings, PasswordEncoder encoder) {
        return args -> seed(users, profiles, listings, encoder);
    }

    @Transactional
    void seed(UserRepository users, UserProfileRepository profiles,
              ListingRepository listings, PasswordEncoder encoder) {
        if (users.count() > 0) {
            log.info("Seed skipped — database already has users");
            return;
        }

        User admin = user(users, encoder, "admin@thediamond.kz", Role.ADMIN);

        User aida = user(users, encoder, "aida@mail.kz", Role.USER);
        profile(profiles, aida, "Аида", "+7 701 111 22 33", "Алматы",
                "Продаю телефоны после апгрейда. Все чеки на руках.");

        User daniyar = user(users, encoder, "daniyar@mail.kz", Role.USER);
        profile(profiles, daniyar, "Данияр", "+7 705 444 55 66", "Астана",
                "Меняю телефон каждый год, состояние всегда идеальное.");

        User marat = user(users, encoder, "marat@mail.kz", Role.USER);
        profile(profiles, marat, "Марат", "+7 707 777 88 99", "Шымкент", null);

        // Live catalog
        listing(listings, aida, PhoneBrand.APPLE, "iPhone 14 Pro", 256, 6, "Deep Purple",
                PhoneCondition.LIKE_NEW, 91, 385_000, "Алматы",
                "Идеальное состояние, всегда в чехле и под стеклом. Комплект полный: коробка, кабель. "
                        + "Ремонтов не было, Face ID работает.", ListingStatus.ACTIVE);
        listing(listings, aida, PhoneBrand.SAMSUNG, "Galaxy S23", 128, 8, "Чёрный",
                PhoneCondition.GOOD, null, 240_000, "Алматы",
                "Небольшая потёртость на рамке снизу, экран без царапин. Батарея держит полный день.",
                ListingStatus.ACTIVE);
        listing(listings, daniyar, PhoneBrand.APPLE, "iPhone 13", 128, 4, "Синий",
                PhoneCondition.GOOD, 86, 245_000, "Астана",
                "Пользовался два года, менял только защитное стекло. Аккумулятор 86%, "
                        + "на день обычного использования хватает.", ListingStatus.ACTIVE);
        listing(listings, daniyar, PhoneBrand.XIAOMI, "Redmi Note 13 Pro", 256, 8, "Зелёный",
                PhoneCondition.NEW, null, 115_000, "Астана",
                "Новый, запечатанный. Брал в подарок, не подошёл цвет. Официальная гарантия.",
                ListingStatus.ACTIVE);
        listing(listings, marat, PhoneBrand.GOOGLE, "Pixel 7a", 128, 8, "Белый",
                PhoneCondition.LIKE_NEW, null, 155_000, "Шымкент",
                "Камера топовая, состояние как новый. Есть коробка и оригинальный кабель.",
                ListingStatus.ACTIVE);

        // On the moderation queue, so the admin screen isn't empty on first login
        listing(listings, marat, PhoneBrand.HONOR, "Magic5 Lite", 256, 8, "Серебристый",
                PhoneCondition.FAIR, null, 78_000, "Шымкент",
                "Есть трещина на задней крышке, экран целый. Работает без нареканий.",
                ListingStatus.PENDING_REVIEW);

        log.info("Seeded demo marketplace: {} users, {} listings (password: {})",
                users.count(), listings.count(), DEMO_PASSWORD);
    }

    private User user(UserRepository users, PasswordEncoder encoder, String email, Role role) {
        User u = new User();
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(DEMO_PASSWORD));
        u.setRole(role);
        u.setEmailVerified(true);
        return users.save(u);
    }

    private void profile(UserProfileRepository profiles, User user, String name, String phone,
                         String city, String about) {
        UserProfile p = new UserProfile();
        p.setUser(user);
        p.setDisplayName(name);
        p.setPhone(phone);
        p.setCity(city);
        p.setAbout(about);
        profiles.save(p);
    }

    private void listing(ListingRepository listings, User seller, PhoneBrand brand, String model,
                         int storageGb, Integer ramGb, String color, PhoneCondition condition,
                         Integer batteryHealth, int price, String city, String description,
                         ListingStatus status) {
        Listing l = new Listing();
        l.setSeller(seller);
        l.setBrand(brand);
        l.setModel(model);
        l.setStorageGb(storageGb);
        l.setRamGb(ramGb);
        l.setColor(color);
        l.setCondition(condition);
        l.setBatteryHealth(batteryHealth);
        l.setPrice(price);
        l.setCity(city);
        l.setDescription(description);
        l.setStatus(status);
        listings.save(l);
    }
}
