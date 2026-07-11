package com.thediamond.seed;

import com.thediamond.domain.*;
import com.thediamond.repo.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/**
 * Seeds a realistic Kazakhstan dataset on first boot (empty DB):
 * 1 admin, 5 creators, 2 brands, 3 campaigns in different statuses.
 * Idempotent: skips if any users already exist.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String DEFAULT_PASSWORD = "password123";

    private final UserRepository users;
    private final CreatorProfileRepository creators;
    private final BrandProfileRepository brands;
    private final CampaignRepository campaigns;
    private final PasswordEncoder encoder;

    public DataSeeder(UserRepository users, CreatorProfileRepository creators, BrandProfileRepository brands,
                      CampaignRepository campaigns, PasswordEncoder encoder) {
        this.users = users;
        this.creators = creators;
        this.brands = brands;
        this.campaigns = campaigns;
        this.encoder = encoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (users.count() > 0) {
            log.info("Seed skipped: {} users already present", users.count());
            return;
        }
        log.info("Seeding initial data...");

        // --- Admin ---
        user("admin@thediamond.kz", Role.ADMIN);

        // --- Creators (approved) ---
        creator("aida@creator.kz", "Аида Нурланова", "aida_creates", "Алматы",
                LocalDate.of(2002, 4, 12), Set.of(Category.BEAUTY, Category.LIFESTYLE),
                "Бьюти-контент и ежедневные влоги про жизнь в Алматы.",
                "https://instagram.com/aida_creates", 24500,
                "https://tiktok.com/@aida_creates", 68000,
                "https://t.me/aida_creates");

        creator("daniyar@creator.kz", "Данияр Ержанов", "danik_tech", "Астана",
                LocalDate.of(2000, 9, 3), Set.of(Category.TECH, Category.GAMING),
                "Обзоры техники и стримы. Собираю ПК и тестирую гаджеты.",
                "https://instagram.com/danik_tech", 12000,
                "https://tiktok.com/@danik_tech", 41000,
                "https://t.me/danik_tech");

        creator("madina@creator.kz", "Мадина Сапарова", "madina_food", "Шымкент",
                LocalDate.of(2004, 1, 27), Set.of(Category.FOOD, Category.TRAVEL),
                "Рассказываю про кафе и уличную еду Шымкента и не только.",
                "https://instagram.com/madina_food", 33000,
                "https://tiktok.com/@madina_food", 95000,
                "https://t.me/madina_food");

        creator("timur@creator.kz", "Тимур Абдуллин", "timur_drive", "Алматы",
                LocalDate.of(1999, 6, 15), Set.of(Category.CARS, Category.TECH),
                "Авто-контент: тест-драйвы, детейлинг, разбор новинок рынка.",
                "https://instagram.com/timur_drive", 18700,
                "https://youtube.com/@timur_drive", 22000,
                "https://t.me/timur_drive");

        creator("aigerim@creator.kz", "Айгерим Касымова", "aigerim_style", "Астана",
                LocalDate.of(2005, 11, 8), Set.of(Category.FASHION, Category.BEAUTY),
                "Мода и образы на каждый день. Люблю казахстанские бренды.",
                "https://instagram.com/aigerim_style", 51000,
                "https://tiktok.com/@aigerim_style", 120000,
                "https://t.me/aigerim_style");

        // --- Brands (approved) ---
        BrandProfile shoqan = brand("brand1@company.kz", "ТОО «Шоқан Кофе»", "180540021547",
                "https://shoqancoffee.kz", "+7 701 234 56 78", "Ержан Мукашев");
        BrandProfile aventa = brand("brand2@company.kz", "ТОО «Aventa Digital»", "210340015982",
                "https://aventa.kz", "+7 702 987 65 43", "Дана Оспанова");

        // --- Campaigns (different statuses) ---
        Campaign active = new Campaign();
        active.setBrand(shoqan);
        active.setTitle("Обзор сезонного меню в наших кофейнях");
        active.setDescription("Ищем креаторов, которые снимут атмосферный ролик о новом осеннем меню "
                + "«Шоқан Кофе». Нужен живой контент: как вы заказываете, пробуете и делитесь впечатлением.");
        active.setCategory(Category.FOOD);
        active.setPlatforms(Set.of(Platform.INSTAGRAM, Platform.TIKTOK));
        active.setRewardPerCreator(45000);
        active.setCreatorsNeeded(5);
        active.setDeadline(LocalDate.now().plusDays(21));
        active.setRequirements("Ролик от 15 секунд, отметить @shoqancoffee, снимать в одной из наших точек "
                + "в Алматы. Публикация в Reels или TikTok.");
        active.setStatus(CampaignStatus.ACTIVE);
        campaigns.save(active);

        Campaign pending = new Campaign();
        pending.setBrand(aventa);
        pending.setTitle("Промо мобильного приложения Aventa");
        pending.setDescription("Расскажите о нашем приложении для управления финансами. Нужен понятный "
                + "разбор функций и честный отзыв о пользовательском опыте.");
        pending.setCategory(Category.TECH);
        pending.setPlatforms(Set.of(Platform.INSTAGRAM, Platform.YOUTUBE));
        pending.setRewardPerCreator(80000);
        pending.setCreatorsNeeded(3);
        pending.setDeadline(LocalDate.now().plusDays(30));
        pending.setRequirements("Видео от 60 секунд, показать установку и 2–3 ключевые функции. "
                + "Ссылка на приложение в описании.");
        pending.setStatus(CampaignStatus.PENDING_REVIEW);
        campaigns.save(pending);

        Campaign draft = new Campaign();
        draft.setBrand(aventa);
        draft.setTitle("Новогодняя коллаборация (черновик)");
        draft.setDescription("Черновик кампании к новогоднему сезону. Детали и бюджет ещё уточняются.");
        draft.setCategory(Category.LIFESTYLE);
        draft.setPlatforms(Set.of(Platform.INSTAGRAM));
        draft.setRewardPerCreator(60000);
        draft.setCreatorsNeeded(4);
        draft.setDeadline(LocalDate.now().plusDays(60));
        draft.setRequirements("Требования будут уточнены перед публикацией.");
        draft.setStatus(CampaignStatus.DRAFT);
        campaigns.save(draft);

        log.info("Seed complete: {} users, {} creators, {} brands, {} campaigns",
                users.count(), creators.count(), brands.count(), campaigns.count());
        log.info("All seeded accounts use password: {}", DEFAULT_PASSWORD);
    }

    private User user(String email, Role role) {
        User u = new User();
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(DEFAULT_PASSWORD));
        u.setRole(role);
        return users.save(u);
    }

    private void creator(String email, String name, String username, String city, LocalDate birthDate,
                         Set<Category> cats, String bio,
                         String igUrl, int igFollowers, String secondUrl, int secondFollowers,
                         String telegram) {
        User u = user(email, Role.CREATOR);
        CreatorProfile p = new CreatorProfile();
        p.setUser(u);
        p.setName(name);
        p.setUsername(username);
        p.setCity(city);
        p.setBirthDate(birthDate);
        p.setCategories(cats);
        p.setBio(bio);
        p.setInstagramUrl(igUrl);
        p.setInstagramFollowers(igFollowers);
        if (secondUrl.contains("youtube")) {
            p.setYoutubeUrl(secondUrl);
            p.setYoutubeFollowers(secondFollowers);
        } else {
            p.setTiktokUrl(secondUrl);
            p.setTiktokFollowers(secondFollowers);
        }
        p.setTelegramUrl(telegram);
        p.setApproved(true);
        creators.save(p);
    }

    private BrandProfile brand(String email, String company, String bin, String website,
                               String phone, String contact) {
        User u = user(email, Role.BRAND);
        BrandProfile b = new BrandProfile();
        b.setUser(u);
        b.setCompanyName(company);
        b.setBin(bin);
        b.setWebsite(website);
        b.setPhone(phone);
        b.setContactName(contact);
        b.setApproved(true);
        return brands.save(b);
    }
}
