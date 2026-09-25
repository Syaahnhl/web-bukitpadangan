// State Keranjang Belanja & Admin WA
let waAdminNumber = "6285290462715"; // default fallback

// Fungsi Load Konten Dinamis
async function loadDynamicContent() {
    try {
        const response = await fetch("content.json");
        if (!response.ok) return;
        const data = await response.json();

        // 1. Promo Bar
        const promoBar = document.getElementById("promoBar");
        const promoText = document.getElementById("promoText");
        const navbar = document.querySelector(".navbar");
        if (navbar) navbar.style.top = "";

        if (data.promo && data.promo.show && data.promo.text && data.promo.text.trim() !== "") {
            if (promoText) promoText.innerText = data.promo.text;
            if (promoBar) promoBar.style.display = "flex";
        } else {
            if (promoBar) promoBar.style.display = "none";
        }
        updateHeaderOffset();

        // 2. Hero Section
        if (data.hero) {
            if (document.getElementById("heroTitleText")) document.getElementById("heroTitleText").innerText = data.hero.title;
            if (document.getElementById("heroSubtitleText") && data.hero.subtitle) document.getElementById("heroSubtitleText").innerText = data.hero.subtitle;
            if (document.getElementById("heroDescText")) document.getElementById("heroDescText").innerText = data.hero.desc;
        }

        // 3. About Section
        if (data.about) {
            if (document.getElementById("aboutTitleText")) {
                document.getElementById("aboutTitleText").innerText = data.about.title || "Suasana Alam & Rasa Otentik";
            }
            if (document.getElementById("aboutDescText")) {
                document.getElementById("aboutDescText").innerText = data.about.desc || "";
            }
        }

        // 4. Event Section
        const eventSection = document.getElementById("event");
        const navEventLink = document.getElementById("navEventLink");
        if (data.event) {
            if (data.event.title && document.getElementById("eventTitleText")) document.getElementById("eventTitleText").innerText = data.event.title;
            if (data.event.desc && document.getElementById("eventDescText")) document.getElementById("eventDescText").innerText = data.event.desc;
            if (data.event.show !== false) {
                if (eventSection) eventSection.style.display = "block";
                if (navEventLink) navEventLink.style.display = "block";
            }
        }

        // 5. Contacts & Social Media
        if (data.contacts) {
            waAdminNumber = data.contacts.wa_admin1;
            
            // Update input / dropdown value di form
            const resAdminSelect = document.getElementById("resAdmin");
            if (resAdminSelect) {
                if (resAdminSelect.tagName === "SELECT") {
                    resAdminSelect.innerHTML = `<option value="${data.contacts.wa_admin1}">Admin WhatsApp (${formatPhoneDisplay(data.contacts.wa_admin1)})</option>`;
                }
                resAdminSelect.value = data.contacts.wa_admin1;
            }

            // Update footer & location
            if (document.getElementById("waAdmin1Text")) document.getElementById("waAdmin1Text").innerText = formatPhoneDisplay(data.contacts.wa_admin1);
            if (document.getElementById("waAdminNumberText")) document.getElementById("waAdminNumberText").innerText = formatPhoneDisplay(data.contacts.wa_admin1);
            if (document.getElementById("igFooterLink")) document.getElementById("igFooterLink").href = data.contacts.instagram;
            if (document.getElementById("fbFooterLink")) document.getElementById("fbFooterLink").href = data.contacts.facebook;
            if (document.getElementById("tiktokFooterLink") && data.contacts.tiktok) document.getElementById("tiktokFooterLink").href = data.contacts.tiktok;
        }

    } catch (err) {
        console.error("Gagal meload konten dinamis:", err);
    }
}

function formatPhoneDisplay(num) {
    if (!num) return "";
    let clean = num.toString().trim();
    if (clean.startsWith("+62")) {
        clean = "0" + clean.slice(3);
    } else if (clean.startsWith("62")) {
        clean = "0" + clean.slice(2);
    }
    if (clean.length >= 11 && clean.length <= 13) {
        return clean.slice(0, 4) + "-" + clean.slice(4, 8) + "-" + clean.slice(8);
    }
    return clean;
}

// Logika Menu Dinamis
let menuData = [];

async function loadMenuData() {
    try {
        const response = await fetch("menu.json");
        if (!response.ok) return;
        menuData = await response.json();
        renderMenuGrid(menuData);
    } catch (err) {
        console.error("Gagal meload menu.json:", err);
    }
}

function renderMenuGrid(items) {
    const grid = document.getElementById("menuGrid");
    if (!grid) return;
    
    if (!items || items.length === 0) {
        grid.innerHTML = `
            <div style="text-align: center; padding: 48px 16px; color: #94a3b8; background: #14181f; border-radius: 16px; border: 1px dashed rgba(212, 163, 115, 0.25);">
                <i class="fas fa-search" style="font-size: 2.2rem; color: var(--accent-gold); margin-bottom: 12px; display: block;"></i>
                <h4 style="color: #ffffff; margin-bottom: 6px; font-size: 1.1rem;">Menu Tidak Ditemukan</h4>
                <p style="font-size: 0.85rem; max-width: 400px; margin: 0 auto;">Tidak ada sajian yang sesuai dengan kriteria pencarian atau filter Anda. Silakan coba kata kunci lain atau pilih filter "Semua".</p>
            </div>
        `;
        return;
    }

    const categoriesConfig = [
        {
            key: "makanan",
            title: "Makanan Utama & Olahan Khas",
            icon: '<i class="fas fa-utensils"></i>',
            subtitle: "Ayam bledos, bebek ungkep, nila segar & sayuran lereng bukit"
        },
        {
            key: "minuman",
            title: "Minuman Segar & Tradisional",
            icon: '<i class="fas fa-mug-hot"></i>',
            subtitle: "Kopi santan khas Pati, seduhan herbal & kelapa muda"
        },
        {
            key: "cemilan",
            title: "Camilan & Kudapan Santai",
            icon: '<i class="fas fa-cookie-bite"></i>',
            subtitle: "Tempe mendoan hangat, pisang krispi & singkong merekah"
        }
    ];

    const categoryHtmlList = [];

    categoriesConfig.forEach(cat => {
        const catItems = items.filter(item => item.category === cat.key);
        if (catItems.length === 0) return;

        const cardsHtml = catItems.map(item => renderMenuCardCarousel(item)).join("");

        categoryHtmlList.push(`
            <div class="menu-category-block" data-category="${cat.key}" id="cat-section-${cat.key}">
                <div class="menu-category-header">
                    <div class="category-header-info">
                        <span class="category-badge-icon">${cat.icon}</span>
                        <div>
                            <h3 class="category-title">${cat.title}</h3>
                            <span class="category-subtitle">${cat.subtitle}</span>
                        </div>
                    </div>
                    <div class="category-header-actions">
                        <span class="category-count-badge">${catItems.length} Sajian</span>
                        <div class="category-nav-arrows">
                            <button type="button" class="btn-cat-arrow" onclick="scrollCategoryTrack('${cat.key}', -1)" title="Geser ke kiri" aria-label="Geser ke kiri"><i class="fas fa-chevron-left"></i></button>
                            <button type="button" class="btn-cat-arrow" onclick="scrollCategoryTrack('${cat.key}', 1)" title="Geser ke kanan" aria-label="Geser ke kanan"><i class="fas fa-chevron-right"></i></button>
                        </div>
                    </div>
                </div>
                
                <div class="menu-horizontal-scroll-container">
                    <div class="menu-horizontal-track" id="track-${cat.key}">
                        ${cardsHtml}
                    </div>
                </div>
            </div>
        `);
    });

    grid.innerHTML = `<div class="menu-categories-wrapper">${categoryHtmlList.join("")}</div>`;
}

function renderMenuCardCarousel(item) {
    const badgeHtml = item.badge ? `<span class="menu-badge">${item.badge}</span>` : '';
    let flavorBadgeHtml = '';
    if (item.flavor === 'pedas') {
        flavorBadgeHtml = `<span class="menu-item-flavor-badge badge-flavor-pedas"><i class="fas fa-fire"></i> Pedas</span>`;
    } else if (item.flavor === 'anak') {
        flavorBadgeHtml = `<span class="menu-item-flavor-badge badge-flavor-anak"><i class="fas fa-child"></i> Ramah Anak</span>`;
    } else if (item.flavor === 'khas') {
        flavorBadgeHtml = `<span class="menu-item-flavor-badge badge-flavor-khas"><i class="fas fa-mountain"></i> Khas</span>`;
    }
    const priceFormatted = formatRupiah(item.price);

    return `
        <div class="menu-card-carousel" data-category="${item.category}" data-flavor="${item.flavor || ''}" data-id="${item.id}" onclick="openMenuDetailModal('${item.id}')" title="Klik untuk lihat detail rasa & isi ${item.name}">
            <div class="menu-card-img-wrap">
                <img src="${item.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'}" alt="${item.name}" loading="lazy">
                <div class="menu-card-badges">
                    ${badgeHtml}
                    ${flavorBadgeHtml}
                </div>
                <div class="menu-card-zoom-indicator" title="Perbesar & Lihat Info Rasa">
                    <i class="fas fa-search-plus"></i>
                </div>
            </div>
            <div class="menu-card-content">
                <div>
                    <h4 class="menu-card-name">${item.name}</h4>
                    <p class="menu-card-desc">${item.desc}</p>
                </div>
                <div class="menu-card-bottom">
                    <span class="menu-card-price">${priceFormatted}</span>
                    <span class="menu-card-view-btn"><i class="fas fa-info-circle"></i> Info Rasa</span>
                </div>
            </div>
        </div>
    `;
}

function scrollCategoryTrack(catKey, direction) {
    const track = document.getElementById(`track-${catKey}`);
    if (!track) return;
    const card = track.querySelector(".menu-card-carousel");
    const scrollAmount = card ? (card.offsetWidth + 16) * 1.8 : 360;
    track.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
}

function openMenuDetailModal(menuId) {
    const item = (menuData || []).find(m => m.id === menuId);
    if (!item) return;

    const modal = document.getElementById("menuDetailModal");
    if (!modal) return;

    // Foto Menu
    const imgEl = document.getElementById("menuDetailImg");
    if (imgEl) {
        imgEl.src = item.img || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop";
        imgEl.alt = item.name;
    }

    // Badge Khusus
    const badgeEl = document.getElementById("menuDetailBadge");
    if (badgeEl) {
        if (item.badge) {
            badgeEl.textContent = item.badge;
            badgeEl.style.display = "inline-block";
        } else {
            badgeEl.style.display = "none";
        }
    }

    // Badge Cita Rasa
    const flavorEl = document.getElementById("menuDetailFlavorBadge");
    if (flavorEl) {
        if (item.flavor === "pedas") {
            flavorEl.innerHTML = `<i class="fas fa-fire"></i> Pedas Bledos`;
            flavorEl.className = "menu-detail-flavor-badge badge-flavor-pedas";
            flavorEl.style.display = "inline-flex";
        } else if (item.flavor === "anak") {
            flavorEl.innerHTML = `<i class="fas fa-child"></i> Ramah Anak`;
            flavorEl.className = "menu-detail-flavor-badge badge-flavor-anak";
            flavorEl.style.display = "inline-flex";
        } else if (item.flavor === "khas") {
            flavorEl.innerHTML = `<i class="fas fa-mountain"></i> Khas Pati`;
            flavorEl.className = "menu-detail-flavor-badge badge-flavor-khas";
            flavorEl.style.display = "inline-flex";
        } else {
            flavorEl.style.display = "none";
        }
    }

    // Nama & Kategori
    const titleEl = document.getElementById("menuDetailTitle");
    if (titleEl) titleEl.textContent = item.name;

    const catEl = document.getElementById("menuDetailCategoryPill");
    if (catEl) {
        const catMap = {
            makanan: "Makanan Utama",
            minuman: "Minuman Segar & Tradisional",
            cemilan: "Camilan Tradisional"
        };
        catEl.textContent = catMap[item.category] || "Menu Pilihan";
    }

    // Harga
    const priceEl = document.getElementById("menuDetailPrice");
    if (priceEl) priceEl.textContent = formatRupiah(item.price);

    // Level Pedas & Porsi
    const spiceEl = document.getElementById("menuDetailSpice");
    if (spiceEl) spiceEl.textContent = item.spice_level || "Sedang / Selera";

    const portionEl = document.getElementById("menuDetailPortion");
    if (portionEl) portionEl.textContent = item.portion || "1 Porsi";

    // Karakter Cita Rasa
    const tasteEl = document.getElementById("menuDetailTaste");
    if (tasteEl) tasteEl.textContent = item.taste_profile || item.desc || "Cita rasa otentik khas Bukit Padangan.";

    // Isian & Komposisi
    const ingEl = document.getElementById("menuDetailIngredients");
    if (ingEl) ingEl.textContent = item.ingredients || "Racikan bahan segar pilihan.";

    // Cerita Menu & Rahasia Racikan
    const storyEl = document.getElementById("menuDetailStory");
    if (storyEl) storyEl.textContent = item.story || item.desc || "Olahan khas istimewa dari dapur lereng perbukitan.";

    // Buka Modal
    modal.classList.add("active");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeMenuDetailModal() {
    const modal = document.getElementById("menuDetailModal");
    if (!modal) return;
    modal.classList.remove("active");
    setTimeout(() => {
        if (!modal.classList.contains("active")) {
            modal.style.display = "none";
            document.body.style.overflow = "";
        }
    }, 200);
}

function closeMenuDetailModalOnBackdrop(event) {
    if (event.target && (event.target.id === "menuDetailModal" || event.target.classList.contains("modal-sheet-handle"))) {
        closeMenuDetailModal();
    }
}

// Global escape key listener for menu detail modal
document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        const modal = document.getElementById("menuDetailModal");
        if (modal && modal.classList.contains("active")) {
            closeMenuDetailModal();
        }
    }
});

// Carousel Scroll Helper for Features Section (Mobile)
function initFeaturesCarousel() {
    const grid = document.getElementById("featuresGrid");
    const indicator = document.getElementById("featuresIndicator");
    if (!grid || !indicator) return;
    const dots = indicator.querySelectorAll(".feat-dot");
    if (!dots.length) return;

    let isThrottled = false;
    grid.addEventListener("scroll", () => {
        if (isThrottled) return;
        isThrottled = true;
        requestAnimationFrame(() => {
            const scrollLeft = grid.scrollLeft;
            const firstCard = grid.querySelector(".feature-card");
            const cardWidth = firstCard ? firstCard.offsetWidth + 14 : 280;
            const activeIdx = Math.min(dots.length - 1, Math.max(0, Math.round(scrollLeft / cardWidth)));
            dots.forEach((dot, idx) => {
                dot.classList.toggle("active", idx === activeIdx);
            });
            isThrottled = false;
        });
    }, { passive: true });
}

window.scrollToFeature = function(index) {
    const grid = document.getElementById("featuresGrid");
    if (!grid) return;
    const cards = grid.querySelectorAll(".feature-card");
    if (cards[index]) {
        cards[index].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
};

// Carousel Scroll Helper for Amenities Section (Mobile)
function initAmenitiesCarousel() {
    const grid = document.getElementById("amenitiesGrid");
    const indicator = document.getElementById("amenitiesIndicator");
    if (!grid || !indicator) return;
    const dots = indicator.querySelectorAll(".amenity-dot");
    if (!dots.length) return;

    let isThrottled = false;
    grid.addEventListener("scroll", () => {
        if (isThrottled) return;
        isThrottled = true;
        requestAnimationFrame(() => {
            const scrollLeft = grid.scrollLeft;
            const firstCard = grid.querySelector(".amenity-card");
            const cardWidth = firstCard ? firstCard.offsetWidth + 14 : 260;
            const activeIdx = Math.min(dots.length - 1, Math.max(0, Math.round(scrollLeft / cardWidth)));
            dots.forEach((dot, idx) => {
                dot.classList.toggle("active", idx === activeIdx);
            });
            isThrottled = false;
        });
    }, { passive: true });
}

window.scrollToAmenity = function(index) {
    const grid = document.getElementById("amenitiesGrid");
    if (!grid) return;
    const cards = grid.querySelectorAll(".amenity-card");
    if (cards[index]) {
        cards[index].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
};

window.addEventListener("DOMContentLoaded", () => {
    loadDynamicContent();
    loadMenuData();
    loadTablesData();
    initOperatingHoursStatus();
    initFaqAccordion();
    initFeaturesCarousel();
    initAmenitiesCarousel();
    initPackagesCarousel();
    initGalleryCarousel();
    initPhotospotsCarousel();
    updatePackageCalc();
    updateMenuOrderLinks();
    initWeatherWidget();
    initLiveMusicSchedule();
    initReviewsCarousel();
    initConfirmDpModal();

    // Event listener untuk menutup menuBookModal jika klik di luar area konten
    const menuBookModal = document.getElementById("menuBookModal");
    if (menuBookModal) {
        menuBookModal.addEventListener("click", (e) => {
            if (e.target === menuBookModal) closeMenuBookModal();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeMenuBookModal();
            closeModal();
            closeCartDrawer();
        }
    });
    initFaqAccordion();
});

// Elemen-elemen DOM
const modal = document.getElementById("reservationModal");

// =========================================
// INTEGRASI RESMI KACHING WEB ORDER
// (Bukit Padangan User ID = 1)
// =========================================
const KACHING_STORE_ID = 1;
const KACHING_ORDER_URL = `https://kaching.id/order/toko/${KACHING_STORE_ID}/public`;

function getKachingOrderUrl(tableNum) {
    let num = tableNum;
    if (!num && typeof selectedTable !== "undefined" && selectedTable && selectedTable.number) {
        num = selectedTable.number;
    }
    if (num) {
        return `https://kaching.id/order/toko/${KACHING_STORE_ID}/meja/${num}`;
    }
    return `https://kaching.id/order/toko/${KACHING_STORE_ID}/public`;
}

function updateMenuOrderLinks() {
    const url = getKachingOrderUrl();
    const buttons = document.querySelectorAll(".btn-order-kaching");
    buttons.forEach(btn => {
        btn.href = url;
    });
}

// =========================================
// 1. TOP PROMO BAR & DYNAMIC HEADER OFFSET
// =========================================
function updateHeaderOffset() {
    const siteHeader = document.getElementById("siteHeader");
    if (siteHeader) {
        const h = siteHeader.offsetHeight;
        document.documentElement.style.setProperty("--header-height", `${h}px`);
        document.body.style.paddingTop = `${h}px`;
    }
}

window.addEventListener("resize", updateHeaderOffset);
window.addEventListener("DOMContentLoaded", updateHeaderOffset);
window.addEventListener("load", updateHeaderOffset);

function closePromoBar() {
    const promoBar = document.getElementById("promoBar");
    if (promoBar) {
        promoBar.style.transform = "translateY(-100%)";
        promoBar.style.opacity = "0";
        setTimeout(() => {
            promoBar.style.display = "none";
            updateHeaderOffset();
        }, 300);
    }
}

// =========================================
// 2. TESTIMONIAL SLIDER CAROUSEL
// =========================================
let currentSlideIndex = 0;
const slides = document.querySelectorAll(".testimonial-slide");
const dots = document.querySelectorAll(".dot");
let slideInterval;

function showSlide(index) {
    if (slides.length === 0) return;
    
    // Reset index bounds
    if (index >= slides.length) currentSlideIndex = 0;
    else if (index < 0) currentSlideIndex = slides.length - 1;
    else currentSlideIndex = index;

    // Sembunyikan semua slides dan nonaktifkan dots
    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    // Tampilkan slide aktif
    slides[currentSlideIndex].classList.add("active");
    if (dots[currentSlideIndex]) dots[currentSlideIndex].classList.add("active");
}

function currentSlide(index) {
    clearInterval(slideInterval); // Reset auto-scroll timer on click
    showSlide(index);
    startAutoSlide(); // Re-start timer
}

function startAutoSlide() {
    slideInterval = setInterval(() => {
        showSlide(currentSlideIndex + 1);
    }, 6000); // Ganti slide setiap 6 detik
}

// Inisialisasi Slider
if (slides.length > 0) {
    showSlide(0);
    startAutoSlide();
}

// =========================================
// 3. LIGHTBOX GALLERY ZOOM & HORIZONTAL SLIDER
// =========================================
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
let activeImageIndex = 0;

function getGalleryImages() {
    return Array.from(document.querySelectorAll("#galleryTrack img, .gallery-item img"));
}

function openLightbox(index) {
    const images = getGalleryImages();
    if (!lightbox || images.length === 0) return;
    activeImageIndex = (index + images.length) % images.length;
    lightbox.style.display = "flex";
    
    // Tampilkan gambar dan caption
    const activeImg = images[activeImageIndex];
    lightboxImg.src = activeImg.src;
    
    const card = activeImg.closest(".gallery-card, .gallery-item");
    const title = card ? card.querySelector(".gallery-spot-name, .gallery-overlay span")?.innerText : "";
    const desc = card ? card.querySelector(".gallery-spot-desc")?.innerText : "";
    lightboxCaption.innerHTML = title ? `<div style="font-size:1.15rem; font-weight:700; color:#f8fafc; margin-bottom:4px;">${title}</div>${desc ? `<div style="font-size:0.9rem; color:#cbd5e1; font-weight:400; max-width:600px; text-align:center;">${desc}</div>` : ""}` : (activeImg.alt || "Galeri Bukit Padangan");
}

function closeLightbox() {
    if (lightbox) lightbox.style.display = "none";
}

function changeLightboxImage(delta, event) {
    if (event) event.stopPropagation(); // Mencegah modal tertutup karena event click di bubble up
    const images = getGalleryImages();
    if (images.length === 0) return;
    let newIndex = (activeImageIndex + delta + images.length) % images.length;
    openLightbox(newIndex);
}

// Navigasi geser slider galeri (slide kanan / kiri)
function scrollGalleryTrack(direction) {
    const track = document.getElementById("galleryTrack");
    if (!track) return;
    const card = track.querySelector(".gallery-card, .gallery-item");
    const scrollAmount = card ? (card.offsetWidth + 22) : 340;
    track.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
}

// Inisialisasi drag scroll dengan mouse & swipe
function initGalleryCarousel() {
    const track = document.getElementById("galleryTrack");
    if (!track) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasMoved = false;

    track.addEventListener("mousedown", (e) => {
        isDown = true;
        hasMoved = false;
        track.classList.add("dragging");
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
        if (!isDown) return;
        isDown = false;
        track.classList.remove("dragging");
    });

    track.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX);
        if (Math.abs(walk) > 5) hasMoved = true;
        track.scrollLeft = scrollLeft - walk;
    });

    // Cegah trigger modal jika user sedang drag/geser
    track.querySelectorAll(".gallery-card").forEach((card) => {
        card.addEventListener("click", (e) => {
            if (hasMoved) {
                e.stopPropagation();
                e.preventDefault();
                hasMoved = false;
            }
        }, true);
    });

    // Support keyboard panah kiri/kanan saat lightbox terbuka
    document.addEventListener("keydown", (e) => {
        if (lightbox && lightbox.style.display === "flex") {
            if (e.key === "ArrowRight") changeLightboxImage(1);
            if (e.key === "ArrowLeft") changeLightboxImage(-1);
            if (e.key === "Escape") closeLightbox();
        }
    });
}

// Navigasi geser slider kurasi spot foto (slide kanan / kiri)
function scrollPhotospotsTrack(direction) {
    const track = document.getElementById("photospotsTrack") || document.querySelector(".photospots-carousel-track") || document.querySelector(".photospots-grid");
    if (!track) return;
    const card = track.querySelector(".photospot-card");
    const scrollAmount = card ? (card.offsetWidth + 22) : 340;
    track.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
}

// Inisialisasi drag scroll dengan mouse & touch swipe untuk Spot Foto
function initPhotospotsCarousel() {
    const track = document.getElementById("photospotsTrack") || document.querySelector(".photospots-carousel-track") || document.querySelector(".photospots-grid");
    if (!track) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasMoved = false;

    track.addEventListener("mousedown", (e) => {
        isDown = true;
        hasMoved = false;
        track.classList.add("dragging");
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
        if (!isDown) return;
        isDown = false;
        track.classList.remove("dragging");
    });

    track.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX);
        if (Math.abs(walk) > 5) hasMoved = true;
        track.scrollLeft = scrollLeft - walk;
    });

    // Cegah klik tombol di dalam kartu jika sedang drag
    track.querySelectorAll(".photospot-card button").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            if (hasMoved) {
                e.stopPropagation();
                e.preventDefault();
                hasMoved = false;
            }
        }, true);
    });
}

// =========================================
// 4. FORMAT RUPIAH HELPER
// =========================================
function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);
}

// =========================================
// 5. MODAL & RESERVASI HANDLERS
// =========================================
function openModal(event) {
    if (event) event.preventDefault();
    closeCartDrawer();
    if (modal) modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
}

// =========================================
// 6. LOGIKA DENAH MEJA INTERAKTIF (FLOOR PLAN)
// =========================================
let tablesData = [];
let selectedTable = null;
let currentTableZone = "semua";
const tableModal = document.getElementById("tableModal");
let activePreviewTableId = null;

async function loadTablesData() {
    try {
        const response = await fetch("tables.json");
        if (!response.ok) return;
        tablesData = await response.json();

        // Populate dropdown resTableSelect di form reservasi
        populateTableDropdown(tablesData);

        // Render grid denah meja
        renderTablesGrid(tablesData);

        // Inisialisasi Model Denah 3D Interaktif
        if (typeof init3DFloorPlan === "function") {
            init3DFloorPlan();
        }
    } catch (err) {
        console.error("Gagal meload tables.json:", err);
    }
}

function populateTableDropdown(tables) {
    const select = document.getElementById("resTableSelect");
    if (!select) return;
    
    let html = `<option value="">-- Bebas / Ditentukan Petugas --</option>`;
    tables.forEach(t => {
        const statusText = t.status === 'tersedia' ? 'Tersedia' : (t.status === 'terisi' ? 'Terisi' : 'Dipesan');
        html += `<option value="${t.id}">${t.name} (${t.zoneName}) - ${statusText} [${t.capacity} org]</option>`;
    });
    select.innerHTML = html;
}

function renderTablesGrid(items) {
    const grid = document.getElementById("tablesGrid");
    if (!grid) return;

    if (items.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px 0;">Tidak ada meja pada zona ini.</p>`;
        return;
    }

    grid.innerHTML = items.map(table => {
        const isSelected = selectedTable && selectedTable.id === table.id;
        
        let zoneIcon = "fa-chair";
        if (table.zone === "gazebo" || table.zone === "terapi") zoneIcon = "fa-fish";
        else if (table.zone === "outdoor") zoneIcon = "fa-cloud-sun";
        else if (table.zone === "vip") zoneIcon = "fa-store-alt";

        return `
            <div class="table-card ${isSelected ? 'selected' : ''}" onclick="openTableModal('${table.id}')">
                <div class="table-card-top">
                    <div class="table-icon-wrap">
                        <i class="fas ${zoneIcon}"></i>
                    </div>
                    <span class="table-badge-status ${table.status}">${table.status}</span>
                </div>
                <div class="table-card-mid">
                    <h4>${table.name}</h4>
                    <p>${table.description}</p>
                </div>
                <div class="table-card-bottom">
                    <span class="table-capacity">
                        <i class="fas fa-users"></i> ${table.capacity} Kursi
                    </span>
                    <button type="button" class="btn-detail-table">
                        Detail <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

function filterTablesZone(zone) {
    currentTableZone = zone;
    const buttons = document.querySelectorAll(".zone-tab-btn");
    buttons.forEach(btn => btn.classList.remove("active"));

    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
    }

    if (zone === "semua") {
        renderTablesGrid(tablesData);
    } else {
        const filtered = tablesData.filter(t => t.zone === zone);
        renderTablesGrid(filtered);
    }
}

function openTableModal(tableId) {
    if (!tableId) return;
    const cleanId = String(tableId).toLowerCase().trim();
    const table = tablesData.find(t => 
        t.id.toLowerCase() === cleanId || 
        t.id.toLowerCase() === `t${cleanId.replace(/\D/g, '').padStart(2, '0')}` ||
        `table-${t.number}`.toLowerCase() === cleanId ||
        `table-${String(t.number).padStart(2, '0')}`.toLowerCase() === cleanId ||
        t.number === Number(tableId)
    );
    if (!table) return;

    activePreviewTableId = table.id;

    // Otomatiskan meja terpilih di state web (tanpa langsung buka form modal reservasi)
    selectThisTable(table.id, false);

    const modalImg = document.getElementById("tableModalImg");
    if (modalImg) modalImg.src = table.image || "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=800&auto=format&fit=crop";
    
    const modalTitle = document.getElementById("tableModalTitle");
    if (modalTitle) modalTitle.innerText = table.name;
    
    const modalZone = document.getElementById("tableModalZone");
    if (modalZone) modalZone.innerText = table.zoneName;
    
    const modalCapacity = document.getElementById("tableModalCapacity");
    if (modalCapacity) modalCapacity.innerText = `${table.capacity} Orang`;
    
    const modalDesc = document.getElementById("tableModalDesc");
    if (modalDesc) modalDesc.innerText = table.description;

    const statusBadge = document.getElementById("tableModalStatusBadge");
    if (statusBadge) {
        statusBadge.className = `table-status-pill ${table.status}`;
        statusBadge.innerText = table.status.toUpperCase();
    }

    const facilitiesContainer = document.getElementById("tableModalFacilities");
    if (facilitiesContainer) {
        facilitiesContainer.innerHTML = (table.facilities || []).map(f => `
            <span class="table-facility-chip"><i class="fas fa-check-circle" style="color: var(--primary-green);"></i> ${f}</span>
        `).join("");
    }

    // Tombol Kaching Web Order Meja (Otomatiskan nomor meja)
    const btnKaching = document.getElementById("btnOrderKachingTable");
    if (btnKaching) {
        btnKaching.href = getKachingOrderUrl(table.number);
        btnKaching.innerHTML = `<i class="fas fa-utensils"></i> Pesan Menu di ${table.name} (Kaching Web Order)`;
    }

    const btnSelect = document.getElementById("btnSelectThisTable");
    if (btnSelect) {
        if (table.status === "tersedia") {
            btnSelect.className = "btn-select-table";
            btnSelect.disabled = false;
            btnSelect.innerHTML = `<i class="fab fa-whatsapp"></i> Reservasi Jadwal Meja Ini`;
        } else {
            btnSelect.className = "btn-select-table disabled";
            btnSelect.disabled = true;
            btnSelect.innerHTML = `<i class="fas fa-ban"></i> Meja Sedang ${table.status.toUpperCase()}`;
        }
    }

    if (tableModal) {
        tableModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
}

function closeTableModal() {
    if (tableModal) {
        tableModal.style.display = "none";
        document.body.style.overflow = "";
    }
    activePreviewTableId = null;
}

function confirmSelectTable() {
    if (!activePreviewTableId) return;
    selectThisTable(activePreviewTableId, true);
    closeTableModal();
}

function selectThisTable(tableId, shouldOpenModal = false) {
    const cleanId = String(tableId).toLowerCase().trim();
    const table = tablesData.find(t => 
        t.id.toLowerCase() === cleanId || 
        t.id.toLowerCase() === `t${cleanId.replace(/\D/g, '').padStart(2, '0')}` ||
        `table-${t.number}`.toLowerCase() === cleanId ||
        `table-${String(t.number).padStart(2, '0')}`.toLowerCase() === cleanId ||
        t.number === Number(tableId)
    );
    if (!table) return;

    selectedTable = table;

    // Update banner di atas grid denah meja
    const banner = document.getElementById("selectedTableBanner");
    const bannerName = document.getElementById("selectedTableBannerName") || document.getElementById("selectedBannerText");
    const bannerZone = document.getElementById("selectedTableBannerZone") || document.getElementById("selectedBannerZone");
    const bannerOrderBtn = document.getElementById("selectedBannerKachingBtn");
    if (banner) {
        if (bannerName) bannerName.innerText = table.name;
        if (bannerZone) bannerZone.innerText = `${table.zoneName} (${table.capacity} Kursi)`;
        if (bannerOrderBtn) {
            bannerOrderBtn.href = getKachingOrderUrl(table.number);
            bannerOrderBtn.innerHTML = `<i class="fas fa-utensils"></i> Pesan Menu di ${table.name}`;
        }
        banner.style.display = "flex";
    }

    // Update banner di seksi menu
    const bannerKachingBtn = document.getElementById("bannerKachingOrderBtn");
    if (bannerKachingBtn) {
        bannerKachingBtn.href = getKachingOrderUrl(table.number);
        bannerKachingBtn.innerHTML = `<i class="fas fa-utensils"></i> Pesan Menu di ${table.name} (Kaching Web Order)`;
    }

    // Update callout badge di modal form reservasi
    const formBadge = document.getElementById("formSelectedTableBadge");
    const badgeName = document.getElementById("badgeTableName");
    const badgeZone = document.getElementById("badgeTableZone");
    if (formBadge && badgeName && badgeZone) {
        badgeName.innerText = table.name;
        badgeZone.innerText = `${table.zoneName} (${table.capacity} Kursi)`;
        formBadge.style.display = "flex";
    }

    // Set select dropdown
    const select = document.getElementById("resTableSelect");
    if (select) {
        select.value = table.id;
    }

    // Auto-sinkronkan pilihan area
    const areaSelect = document.getElementById("resArea");
    if (areaSelect) {
        if (table.zone === "outdoor") areaSelect.value = "Outdoor (View Persawahan & Sungai)";
        else if (table.zone === "gazebo" || table.zone === "terapi") areaSelect.value = "Area Terapi Ikan & Ramah Anak";
        else if (table.zone === "vip") {
            if (table.id.startsWith("IU")) areaSelect.value = "Indoor Utama (6x6 m)";
            else areaSelect.value = "Indoor Timur (Sayap 1 & 2)";
        }
    }

    // Render ulang grid denah agar border .selected terpasang
    if (currentTableZone === "semua") {
        renderTablesGrid(tablesData);
    } else {
        renderTablesGrid(tablesData.filter(t => t.zone === currentTableZone));
    }

    // Sinkronkan seluruh tombol pesan di katalog ke nomor meja ini
    updateMenuOrderLinks();

    // Buka modal reservasi jika diminta
    if (shouldOpenModal) {
        openModal();
    }
}

function clearSelectedTable() {
    selectedTable = null;

    const banner = document.getElementById("selectedTableBanner");
    if (banner) banner.style.display = "none";

    const bannerKachingBtn = document.getElementById("bannerKachingOrderBtn");
    if (bannerKachingBtn) {
        bannerKachingBtn.href = getKachingOrderUrl();
        bannerKachingBtn.innerHTML = `<i class="fas fa-external-link-alt"></i> Buka Web Order Kaching`;
    }

    const formBadge = document.getElementById("formSelectedTableBadge");
    if (formBadge) formBadge.style.display = "none";

    const select = document.getElementById("resTableSelect");
    if (select) select.value = "";

    if (currentTableZone === "semua") {
        renderTablesGrid(tablesData);
    } else {
        renderTablesGrid(tablesData.filter(t => t.zone === currentTableZone));
    }

    updateMenuOrderLinks();
}

function handleManualTableSelect() {
    const select = document.getElementById("resTableSelect");
    if (!select) return;

    const val = select.value;
    if (!val) {
        clearSelectedTable();
        return;
    }

    const table = tablesData.find(t => t.id === val);
    if (table) {
        selectThisTable(table.id);
    }
}

// Menutup modal jika klik area luar
window.onclick = function (event) {
    if (event.target == modal) {
        closeModal();
    }
    if (event.target == tableModal) {
        closeTableModal();
    }
}

// =========================================
// 7. KATALOG MENU & PEMESANAN VIA KACHING WEB ORDER
// (Web profil tidak menyimpan keranjang/transaksi lokal)
// =========================================
let currentMenuSearch = "";
let currentMenuCategory = "semua";
let currentMenuFlavor = "semua";

// Fungsi Aksi Pemesanan Menu via Kaching Web Order
function orderMenuViaKaching(menuId, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const targetUrl = getKachingOrderUrl();
    window.open(targetUrl, "_blank");
}

// Stub Kompatibilitas untuk Menjaga Stabilitas Integrasi
let cartItems = [];
function initCart() { cartItems = []; }
function saveCart() {}
function addToCart(menuId, event) { orderMenuViaKaching(menuId, event); }
function updateCartItemQty() {}
function removeCartItem() {}
function updateCartItemNote() {}
function openCartDrawer() {
    window.open(getKachingOrderUrl(), "_blank");
}
function closeCartDrawer() {}
function showCartToast() {}

// =========================================
// WHATSAPP DYNAMIC LOAD BALANCER & ADMIN CONTACTS (SSOT)
// =========================================
const ADMIN_CONTACTS = {
    mila: { name: "Admin 1 (Mila Elmeida)", phone: "6285226210408", role: "Reservasi Meja & Menu" },
    bukhori: { name: "Admin 2 (M. Bukhori)", phone: "6282329384594", role: "Operasional, Rute & Pelayanan" }
};

function getAssignedAdmin(mode = "auto") {
    if (mode === "mila") return ADMIN_CONTACTS.mila.phone;
    if (mode === "bukhori") return ADMIN_CONTACTS.bukhori.phone;
    return ADMIN_CONTACTS.mila.phone;
}

// Stub Kompatibilitas Voucher Promo (Web Profil)
let activeCartVoucher = null;
function applyCartVoucher() {}
function removeCartVoucher() {}
function setQuickVoucher() {}

// Stub Kompatibilitas UI Keranjang
function updateCartUI() {}
function updateReservationModalPreorderSummary() {}

// Pencarian Menu Real-time
function searchMenu(query) {
    currentMenuSearch = (query || "").trim().toLowerCase();
    const clearBtn = document.getElementById("clearMenuSearch");
    if (clearBtn) {
        clearBtn.style.display = currentMenuSearch.length > 0 ? "block" : "none";
    }
    applyMenuFilters();
}

function clearMenuSearch() {
    const input = document.getElementById("menuSearchInput");
    if (input) input.value = "";
    currentMenuSearch = "";
    const clearBtn = document.getElementById("clearMenuSearch");
    if (clearBtn) clearBtn.style.display = "none";
    applyMenuFilters();
}

function filterFlavor(flavor) {
    currentMenuFlavor = flavor || "semua";
    const buttons = document.querySelectorAll(".menu-flavor-chips .flavor-chip");
    buttons.forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`.menu-flavor-chips .flavor-chip[data-flavor="${currentMenuFlavor}"]`);
    if (activeBtn) activeBtn.classList.add("active");
    applyMenuFilters();
}

function filterMenu(category) {
    currentMenuCategory = category || "semua";
    const buttons = document.querySelectorAll(".menu-tabs .tab-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`.menu-tabs .tab-btn[data-category="${currentMenuCategory}"]`);
    if (activeBtn) {
        activeBtn.classList.add("active");
    } else if (typeof event !== "undefined" && event && event.currentTarget) {
        event.currentTarget.classList.add("active");
    }
    applyMenuFilters();
}

function applyMenuFilters() {
    let filtered = menuData;
    if (currentMenuCategory !== "semua") {
        filtered = filtered.filter(item => item.category === currentMenuCategory);
    }
    if (currentMenuFlavor !== "semua") {
        filtered = filtered.filter(item => item.flavor === currentMenuFlavor);
    }
    if (currentMenuSearch) {
        filtered = filtered.filter(item => 
            item.name.toLowerCase().includes(currentMenuSearch) ||
            (item.desc && item.desc.toLowerCase().includes(currentMenuSearch)) ||
            (item.taste_profile && item.taste_profile.toLowerCase().includes(currentMenuSearch)) ||
            (item.ingredients && item.ingredients.toLowerCase().includes(currentMenuSearch)) ||
            (item.story && item.story.toLowerCase().includes(currentMenuSearch)) ||
            (item.badge && item.badge.toLowerCase().includes(currentMenuSearch)) ||
            (item.flavor_name && item.flavor_name.toLowerCase().includes(currentMenuSearch))
        );
    }
    renderMenuGrid(filtered);
}

// Handler Kompatibilitas Checkout (Dialihkan ke Kaching Web Order)
function submitCartOrder() {
    window.open(getKachingOrderUrl(), "_blank");
}

// =========================================
// 8. SUBMIT RESERVASI (FORM WA AUTO-GENERATE)
// =========================================
function submitReservation(event) {
    if (event) event.preventDefault();

    // Mengambil input data dari form
    const name = document.getElementById("resName") ? document.getElementById("resName").value.trim() : "";
    const dateInput = document.getElementById("resDate") ? document.getElementById("resDate").value : "";
    const time = document.getElementById("resTime") ? document.getElementById("resTime").value : "";
    const guests = document.getElementById("resGuests") ? document.getElementById("resGuests").value : "";
    const area = document.getElementById("resArea") ? document.getElementById("resArea").value : "";
    const targetPhone = document.getElementById("resAdmin") ? document.getElementById("resAdmin").value : "6285290462715";

    if (!name || !dateInput || !time || !guests) {
        alert("Mohon lengkapi seluruh formulir reservasi.");
        return;
    }

    // Nomor meja terpilih atau manual
    let tableText = "Bebas / Ditentukan Petugas";
    if (selectedTable) {
        tableText = `${selectedTable.name} (${selectedTable.zoneName || selectedTable.area || 'Terpilih'})`;
    } else {
        const manualSelect = document.getElementById("resTableSelect");
        if (manualSelect && manualSelect.value) {
            const opt = manualSelect.options[manualSelect.selectedIndex];
            tableText = opt.text;
        }
    }

    // Format tanggal Indonesia (yyyy-mm-dd -> dd Month yyyy)
    let formattedDate = dateInput;
    try {
        const dateObj = new Date(dateInput);
        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        formattedDate = dateObj.getDate() + " " + months[dateObj.getMonth()] + " " + dateObj.getFullYear();
    } catch (e) {}

    // Menyusun Template Pesan WhatsApp
    let waText = `*HALO BUKIT PADANGAN, SAYA INGIN RESERVASI TEMPAT*

`;
    waText += `📋 *Data Reservasi:*
`;
    waText += `• Nama Pemesan: ${name}
`;
    waText += `• Tanggal Kunjungan: ${formattedDate}
`;
    waText += `• Jam Kedatangan: ${time} WIB
`;
    waText += `• Jumlah Tamu: ${guests} Orang\n`;
    waText += `• Area Pilihan: ${area}\n`;
    waText += `• Pilihan Meja: *${tableText}*\n`;

    // Catatan khusus
    const notesInput = document.getElementById("resNotes");
    const userNotes = notesInput ? notesInput.value.trim() : "";
    if (userNotes) {
        waText += `• Catatan Khusus: _${userNotes}_\n`;
    }
    waText += `\n`;

    waText += `💳 *Ketentuan & Konfirmasi DP:*\n`;
    waText += `• Rekening: Bank Mandiri 1840011559968 (a.n. Mila Elmeida)\n`;
    waText += `• Batas Konfirmasi Hari-H: Maksimal 14.00 WIB\n\n`;
    waText += `Mohon info ketersediaan meja dan konfirmasi nominal DP yang perlu ditransfer. Terima kasih!`;

    // Encode text untuk URL
    const encodedText = encodeURIComponent(waText);
    const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`;

    // Buka WhatsApp di tab baru
    window.open(waUrl, "_blank");

    // Bersihkan form & pilihan meja
    document.getElementById("reservationForm").reset();
    clearSelectedTable();
    closeModal();
}

// =========================================
// 8. NAVBAR MOBILE DRAWER & BACKDROP TOGGLE
// =========================================
function toggleNavMenu(forceState) {
    const navLinks = document.querySelector(".nav-links");
    const navBackdrop = document.getElementById("navBackdrop");
    const floatingChatWidget = document.getElementById("floatingChatWidget");
    if (!navLinks) return;

    const isCurrentlyActive = navLinks.classList.contains("active");
    const shouldOpen = (typeof forceState === "boolean") ? forceState : !isCurrentlyActive;

    if (shouldOpen) {
        navLinks.classList.add("active");
        if (navBackdrop) navBackdrop.classList.add("active");
        document.body.style.overflow = "hidden";
        if (floatingChatWidget && window.innerWidth <= 768) {
            floatingChatWidget.style.display = "none";
        }
    } else {
        navLinks.classList.remove("active");
        if (navBackdrop) navBackdrop.classList.remove("active");
        document.body.style.overflow = "";
        if (floatingChatWidget) {
            const aiChatWindow = document.getElementById("aiChatWindow");
            const isChatOpen = aiChatWindow && aiChatWindow.classList.contains("open");
            if (!isChatOpen) {
                floatingChatWidget.style.display = "flex";
            }
        }
    }
}

function closeNavMenu() {
    toggleNavMenu(false);
}

// Expose to global window
window.toggleNavMenu = toggleNavMenu;
window.closeNavMenu = closeNavMenu;

// Inisialisasi event listener menu toggle (single authority, cegah double trigger)
const menuToggle = document.getElementById("menuToggle");
if (menuToggle) {
    menuToggle.onclick = function(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        toggleNavMenu();
    };
}

// Auto-close menu saat link diklik di mobile
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        closeNavMenu();
    });
});

// =========================================
// 9. LIVE OPERATING STATUS & FAQ ACCORDION
// =========================================
function initOperatingHoursStatus() {
    const statusPill = document.getElementById("heroLiveStatus");
    const statusText = document.getElementById("heroLiveStatusText");
    if (!statusPill || !statusText) return;

    try {
        // Ambil jam saat ini di zona waktu Indonesia Barat (WIB / Asia/Jakarta)
        const now = new Date();
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Jakarta",
            hour: "numeric",
            hour12: false
        });
        const currentHour = parseInt(formatter.format(now), 10);

        // Jam operasional resto: 11.00 - 22.00 WIB
        const isOpen = currentHour >= 11 && currentHour < 22;

        if (isOpen) {
            statusPill.className = "live-status-pill open";
            statusText.textContent = "Buka Sekarang • Tutup 22.00 WIB";
        } else {
            statusPill.className = "live-status-pill closed";
            statusText.textContent = "Sedang Tutup • Buka Kembali 11.00 WIB";
        }
    } catch (err) {
        console.warn("Gagal membaca zona waktu lokal:", err);
    }
}

function initFaqAccordion() {
    const faqQuestions = document.querySelectorAll(".faq-question");
    faqQuestions.forEach(btn => {
        btn.addEventListener("click", () => {
            const item = btn.closest(".faq-item");
            if (!item) return;
            const answer = item.querySelector(".faq-answer");
            if (!answer) return;

            const isAlreadyActive = item.classList.contains("active");

            // Tutup semua FAQ lain yang sedang terbuka
            document.querySelectorAll(".faq-item.active").forEach(otherItem => {
                otherItem.classList.remove("active");
                const otherAnswer = otherItem.querySelector(".faq-answer");
                if (otherAnswer) otherAnswer.style.maxHeight = null;
            });

            // Toggle item saat ini
            if (!isAlreadyActive) {
                item.classList.add("active");
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
}



// ==============================================================================
// 6 ESSENTIAL RESTAURANT FEATURES INTERACTIVE LOGIC
// ==============================================================================

// Feature 1: Menu Book Modal (Katalog Lengkap & Cetak)
function openMenuBookModal() {
    const modal = document.getElementById("menuBookModal");
    if (modal) {
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
}

function closeMenuBookModal() {
    const modal = document.getElementById("menuBookModal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "";
    }
}

// Packages Horizontal Carousel & Slider Controls
function scrollPackagesTrack(direction) {
    const track = document.getElementById("packagesTrack");
    if (!track) return;
    const firstCard = track.querySelector(".package-card");
    const cardWidth = firstCard ? firstCard.offsetWidth + 20 : 340;
    track.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
}

function jumpToPackageSlide(index) {
    const track = document.getElementById("packagesTrack");
    if (!track) return;
    const cards = track.querySelectorAll(".package-card");
    if (cards[index]) {
        cards[index].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
}

function initPackagesCarousel() {
    const track = document.getElementById("packagesTrack");
    if (!track) return;
    const dots = document.querySelectorAll("#packagesDots .package-dot");

    let isScrolling = null;
    track.addEventListener("scroll", () => {
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            if (!dots.length) return;
            const cards = track.querySelectorAll(".package-card");
            if (!cards.length) return;
            const trackCenter = track.scrollLeft + track.offsetWidth / 2;
            let closestIndex = 0;
            let minDistance = Infinity;

            cards.forEach((card, idx) => {
                const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                const dist = Math.abs(trackCenter - cardCenter);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestIndex = idx;
                }
            });

            dots.forEach((dot, idx) => {
                dot.classList.toggle("active", idx === closestIndex);
            });
        }, 50);
    }, { passive: true });
}

// Feature 2: Kalkulator Paket Acara & Rombongan
function updatePackageCalc() {
    const paxRange = document.getElementById("calcPaxRange");
    const packageSelect = document.getElementById("calcPackageSelect");
    const addonMusic = document.getElementById("calcAddonMusic");
    const addonDrink = document.getElementById("calcAddonDrink");
    const addonSnack = document.getElementById("calcAddonSnack");

    if (!paxRange || !packageSelect) return;

    const pax = parseInt(paxRange.value, 10) || 25;
    const pkgPrice = parseInt(packageSelect.value, 10) || 45000;
    const isMusic = addonMusic ? addonMusic.checked : false;
    const isDrink = addonDrink ? addonDrink.checked : false;
    const isSnack = addonSnack ? addonSnack.checked : false;

    const foodCost = pax * pkgPrice;
    const musicCost = isMusic ? 300000 : 0;
    const drinkCost = isDrink ? (pax * 5000) : 0;
    const snackCost = isSnack ? (pax * 10000) : 0;
    const totalAddons = musicCost + drinkCost + snackCost;

    // Diskon bertingkat: >=50 pax -> 10%, >=30 pax -> 5%
    let discountRate = 0;
    let discountLabel = "Normal";
    if (pax >= 50) {
        discountRate = 0.10;
        discountLabel = "Diskon Akbar 10% (≥50 Pax)";
    } else if (pax >= 30) {
        discountRate = 0.05;
        discountLabel = "Diskon Rombongan 5% (≥30 Pax)";
    }

    const discountVal = Math.round(foodCost * discountRate);
    const grandTotal = Math.max(0, foodCost + totalAddons - discountVal);
    const dpVal = Math.round(grandTotal * 0.20); // DP 20%

    // Update DOM
    const paxValBadge = document.getElementById("calcPaxVal");
    if (paxValBadge) paxValBadge.textContent = `${pax} Orang`;

    const summaryPaxText = document.getElementById("summaryPaxText");
    if (summaryPaxText) summaryPaxText.textContent = pax;

    const summaryFoodCost = document.getElementById("summaryFoodCost");
    if (summaryFoodCost) summaryFoodCost.textContent = formatRupiah(foodCost);

    const summaryAddonRow = document.getElementById("summaryAddonRow");
    const summaryAddonCost = document.getElementById("summaryAddonCost");
    if (totalAddons > 0) {
        if (summaryAddonRow) summaryAddonRow.style.display = "flex";
        if (summaryAddonCost) summaryAddonCost.textContent = `+ ${formatRupiah(totalAddons)}`;
    } else {
        if (summaryAddonRow) summaryAddonRow.style.display = "none";
    }

    const summaryDiscountRow = document.getElementById("summaryDiscountRow");
    const summaryDiscountVal = document.getElementById("summaryDiscountVal");
    const summaryDiscountLabel = document.getElementById("summaryDiscountLabel");
    const calcDiscountTag = document.getElementById("calcDiscountTag");

    if (discountVal > 0) {
        if (summaryDiscountRow) summaryDiscountRow.style.display = "flex";
        if (summaryDiscountVal) summaryDiscountVal.textContent = `- ${formatRupiah(discountVal)}`;
        if (summaryDiscountLabel) summaryDiscountLabel.textContent = discountLabel;
        if (calcDiscountTag) {
            calcDiscountTag.textContent = discountLabel;
            calcDiscountTag.style.color = "#4ade80";
        }
    } else {
        if (summaryDiscountRow) summaryDiscountRow.style.display = "none";
        if (calcDiscountTag) {
            calcDiscountTag.textContent = "Normal";
            calcDiscountTag.style.color = "var(--accent-gold)";
        }
    }

    const summaryGrandTotal = document.getElementById("summaryGrandTotal");
    if (summaryGrandTotal) summaryGrandTotal.textContent = formatRupiah(grandTotal);

    const summaryDpVal = document.getElementById("summaryDpVal");
    if (summaryDpVal) summaryDpVal.textContent = formatRupiah(dpVal);
}

function sendPackageCalcToWA() {
    const paxRange = document.getElementById("calcPaxRange");
    const packageSelect = document.getElementById("calcPackageSelect");
    const addonMusic = document.getElementById("calcAddonMusic");
    const addonDrink = document.getElementById("calcAddonDrink");
    const addonSnack = document.getElementById("calcAddonSnack");
    const adminSelect = document.getElementById("calcAdminSelect");

    const pax = paxRange ? paxRange.value : "25";
    const pkgName = packageSelect ? packageSelect.options[packageSelect.selectedIndex].text : "Paket Acara";
    
    const addons = [];
    if (addonMusic && addonMusic.checked) addons.push("Live Music Akustik Privat (+Rp 300.000)");
    if (addonDrink && addonDrink.checked) addons.push(`Welcome Drink Jahe Rempah (${pax} porsi)`);
    if (addonSnack && addonSnack.checked) addons.push(`Snack Sore & Mendoan (${pax} porsi)`);
    addons.push("Sound System & Mic Wireless (Termasuk)");
    addons.push("Penataan Meja Panjang Terpadu (Termasuk)");

    const grandTotal = document.getElementById("summaryGrandTotal") ? document.getElementById("summaryGrandTotal").textContent : "Rp 0";
    const dpVal = document.getElementById("summaryDpVal") ? document.getElementById("summaryDpVal").textContent : "Rp 0";

    let waText = `Halo Admin Bukit Padangan, saya ingin konsultasi penawaran custom acara rombongan:\n\n`;
    waText += `👥 *Estimasi Tamu:* ${pax} Orang\n`;
    waText += `📋 *Pilihan Estimasi Menu:* ${pkgName}\n`;
    waText += `✨ *Fasilitas & Layanan:*\n`;
    addons.forEach(item => {
        waText += `  • ${item}\n`;
    });
    waText += `\n💰 *Total Estimasi Biaya (Acuan):* ${grandTotal}\n`;
    waText += `🔒 *Estimasi DP 20% (Kunci Slot):* ${dpVal}\n\n`;
    waText += `Mohon info ketersediaan slot tanggal & arahan penawaran custom selanjutnya. Terima kasih!`;

    const chosenAdmin = adminSelect ? adminSelect.value : "auto";
    const adminPhone = getAssignedAdmin(chosenAdmin);

    const encoded = encodeURIComponent(waText);
    window.open(`https://wa.me/${adminPhone}?text=${encoded}`, "_blank");
}

// Feature 3: Filter Ulasan Pengunjung Google & Horizontal Scroll Controls
function filterReviews(type, event) {
    const pills = document.querySelectorAll(".review-pill");
    pills.forEach(pill => pill.classList.remove("active"));
    
    // Set active pill
    if (event && event.target) {
        event.target.classList.add("active");
    } else if (window.event && window.event.target) {
        window.event.target.classList.add("active");
    }

    const cards = document.querySelectorAll(".review-card");
    cards.forEach(card => {
        const cardType = card.getAttribute("data-type") || "";
        if (type === "all" || cardType.includes(type)) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });

    const track = document.getElementById("reviewsGrid");
    if (track) {
        track.scrollTo({ left: 0, behavior: "smooth" });
    }
}

// Navigasi Tombol Geser Ulasan (Kiri / Kanan)
function scrollReviewTrack(direction) {
    const track = document.getElementById("reviewsGrid");
    if (!track) return;
    const card = track.querySelector(".review-card");
    const scrollAmount = card ? (card.offsetWidth + 20) : (track.clientWidth * 0.8);
    track.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
}

// Inisialisasi Drag Scroll untuk Carousel Ulasan
function initReviewsCarousel() {
    const track = document.getElementById("reviewsGrid");
    if (!track) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    track.addEventListener("mousedown", (e) => {
        isDown = true;
        track.classList.add("dragging");
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
    });

    track.addEventListener("mouseleave", () => {
        isDown = false;
        track.classList.remove("dragging");
    });

    track.addEventListener("mouseup", () => {
        isDown = false;
        track.classList.remove("dragging");
    });

    track.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.5;
        track.scrollLeft = scrollLeft - walk;
    });
}

// =========================================
// 8. REAL-TIME WEATHER WIDGET (LERENG GUNUNGWUNGKAL)
// =========================================
let weatherRefreshTimer = null;

async function fetchOpenMeteoWeather(isManual = false) {
    const iconWrap = document.getElementById("weatherIconWrap");
    const tempEl = document.getElementById("weatherTemp");
    const condEl = document.getElementById("weatherCondition");
    const windEl = document.getElementById("weatherWind");
    const humEl = document.getElementById("weatherHumidity");
    const refreshIcon = document.getElementById("weatherRefreshIcon");

    if (refreshIcon && isManual) {
        refreshIcon.classList.add("fa-spin");
    }

    try {
        // Latitude / Longitude Bukit Padangan lereng Gunungwungkal, Pati
        const lat = -6.6433;
        const lon = 110.9856;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FJakarta`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error("Gagal mengambil respon Open-Meteo");
        const data = await res.json();
        const curr = data.current;

        if (curr) {
            const temp = Math.round(curr.temperature_2m * 10) / 10;
            const wind = Math.round(curr.wind_speed_10m * 10) / 10;
            const hum = curr.relative_humidity_2m;
            const code = curr.weather_code;

            if (tempEl) tempEl.textContent = `${temp}°C`;
            if (windEl) windEl.textContent = `${wind} km/h`;
            if (humEl) humEl.textContent = `${hum}%`;

            // Weather code mapping (WMO standard)
            let condText = "Cerah Sejuk";
            let iconClass = "fas fa-sun";

            if (code === 0) {
                condText = "Langit Cerah Sejuk";
                iconClass = "fas fa-sun";
            } else if (code >= 1 && code <= 3) {
                condText = "Cerah Berawan";
                iconClass = "fas fa-cloud-sun";
            } else if (code === 45 || code === 48) {
                condText = "Berkabut Sejuk";
                iconClass = "fas fa-smog";
            } else if (code >= 51 && code <= 55) {
                condText = "Gerimis Sejuk";
                iconClass = "fas fa-cloud-rain";
            } else if (code >= 61 && code <= 67) {
                condText = "Hujan Lereng";
                iconClass = "fas fa-cloud-showers-heavy";
            } else if (code >= 80 && code <= 82) {
                condText = "Hujan Ringan";
                iconClass = "fas fa-cloud-sun-rain";
            } else if (code >= 95) {
                condText = "Hujan Berpetir";
                iconClass = "fas fa-bolt";
            }

            if (condEl) condEl.textContent = condText;
            if (iconWrap) iconWrap.innerHTML = `<i class="${iconClass}"></i>`;
        }
    } catch (err) {
        console.warn("Menggunakan baseline cuaca lereng Gunungwungkal:", err.message);
        // Fallback anggun (iklim mikro sejuk lereng perbukitan)
        if (tempEl) tempEl.textContent = "24.5°C";
        if (condEl) condEl.textContent = "Sejuk Berawan";
        if (windEl) windEl.textContent = "6.0 km/h";
        if (humEl) humEl.textContent = "82%";
        if (iconWrap) iconWrap.innerHTML = `<i class="fas fa-cloud-sun"></i>`;
    } finally {
        if (refreshIcon) {
            setTimeout(() => refreshIcon.classList.remove("fa-spin"), 600);
        }
    }
}

function refreshWeatherWidget(isManual = true) {
    fetchOpenMeteoWeather(isManual);
}

function initWeatherWidget() {
    fetchOpenMeteoWeather(false);
    // Refresh otomatis setiap 15 menit
    if (weatherRefreshTimer) clearInterval(weatherRefreshTimer);
    weatherRefreshTimer = setInterval(() => {
        fetchOpenMeteoWeather(false);
    }, 15 * 60 * 1000);
}

// =========================================
// 9. JADWAL LIVE MUSIC AKUSTIK & PANGGUNG
// =========================================
function initLiveMusicSchedule() {
    const today = new Date().getDay(); // 0 = Minggu, 6 = Sabtu
    const liveTagSat = document.getElementById("liveBadgeSat");
    const cardSat = document.getElementById("scheduleSat");

    // Malam Minggu = Sabtu
    if (today === 6) {
        if (liveTagSat) liveTagSat.style.display = "inline-flex";
        if (cardSat) cardSat.classList.add("highlight");
    }
}

function bookTableNearStage(dayName) {
    // 1. Fokus denah 3D jika aktif
    if (typeof focus3DZone === "function") {
        focus3DZone("east");
    }
    // 2. Pilih meja panggung jika ada di dataset
    if (Array.isArray(tablesData) && tablesData.length > 0) {
        const stageTable = tablesData.find(t => t.id.includes("IT1") || t.zone === "east");
        if (stageTable) {
            selectThisTable(stageTable.id);
        }
    }
    // 3. Buka modal reservasi dengan catatan panggung
    openModal();
    const areaSelect = document.getElementById("resArea");
    if (areaSelect) {
        areaSelect.value = "Indoor Timur (Sayap 1 & 2)";
    }
    const notesInput = document.getElementById("resNotes");
    if (notesInput) {
        notesInput.value = `Reservasi Meja Dekat Panggung Live Music (${dayName} Sore/Malam)`;
    }
}

// =========================================
// 10. MODAL & ALUR KONFIRMASI BUKTI TRANSFER DP
// =========================================
let attachedReceiptFile = null;

function openConfirmDpModal() {
    closeModal();
    closeCartDrawer();
    const modal = document.getElementById("confirmDpModal");
    if (!modal) return;

    modal.style.display = "flex";
    modal.scrollTop = 0;
    const content = modal.querySelector(".modal-content");
    if (content) content.scrollTop = 0;
    document.body.style.overflow = "hidden";

    // Prefill info meja jika sudah dipilih
    const dpTableInfo = document.getElementById("dpTableInfo");
    if (dpTableInfo) {
        if (selectedTable) {
            dpTableInfo.value = `${selectedTable.name} (${selectedTable.zoneName} • ${selectedTable.capacity} Kursi)`;
        } else {
            dpTableInfo.value = "Belum memilih meja (akan diaturkan admin)";
        }
    }

    // Prefill nama dan tanggal jika sudah diisi di form reservasi
    const resName = document.getElementById("resName");
    const dpName = document.getElementById("dpSenderName");
    if (resName && dpName && resName.value.trim() && !dpName.value.trim()) {
        dpName.value = resName.value.trim();
    }

    const resPhone = document.getElementById("resPhone");
    const dpPhone = document.getElementById("dpSenderPhone");
    if (resPhone && dpPhone && resPhone.value.trim() && !dpPhone.value.trim()) {
        dpPhone.value = resPhone.value.trim();
    }

    const resDate = document.getElementById("resDate");
    const resTime = document.getElementById("resTime");
    const dpDate = document.getElementById("dpArrivalDate");
    if (resDate && dpDate && resDate.value) {
        const timeVal = resTime && resTime.value ? ` Jam ${resTime.value} WIB` : "";
        dpDate.value = `${resDate.value}${timeVal}`;
    }
}

function closeConfirmDpModal() {
    const modal = document.getElementById("confirmDpModal");
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
}

function copyMandiriAccount() {
    const accNumber = "1840011559968";
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(accNumber).then(() => {
            showToast("✓ Nomor rekening Mandiri 1840011559968 berhasil disalin!");
        }).catch(() => {
            prompt("Salin nomor rekening Mandiri di bawah ini:", accNumber);
        });
    } else {
        prompt("Salin nomor rekening Mandiri di bawah ini:", accNumber);
    }
}

function selectDpNominal(amount) {
    const chips = document.querySelectorAll(".dp-chips-group .dp-chip");
    chips.forEach(c => c.classList.remove("active"));
    const amountInput = document.getElementById("dpAmountInput");

    if (amount === "custom") {
        if (event && event.currentTarget) event.currentTarget.classList.add("active");
        if (amountInput) {
            amountInput.focus();
            amountInput.select();
        }
    } else {
        if (event && event.currentTarget) event.currentTarget.classList.add("active");
        if (amountInput) amountInput.value = amount;
    }
}

function handleReceiptFileSelect(input) {
    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files[0];
    attachedReceiptFile = file;

    const previewContainer = document.getElementById("dropZonePreview");
    const promptContainer = document.getElementById("dropZonePrompt");
    const previewImg = document.getElementById("receiptPreviewImg");
    const fileNameEl = document.getElementById("receiptFileName");

    if (fileNameEl) fileNameEl.textContent = file.name;

    const reader = new FileReader();
    reader.onload = function (e) {
        if (previewImg) previewImg.src = e.target.result;
        if (promptContainer) promptContainer.style.display = "none";
        if (previewContainer) previewContainer.style.display = "flex";
    };
    reader.readAsDataURL(file);
}

function removeReceiptFile(event) {
    if (event) event.stopPropagation();
    attachedReceiptFile = null;
    const fileInput = document.getElementById("dpReceiptFileInput");
    if (fileInput) fileInput.value = "";

    const previewContainer = document.getElementById("dropZonePreview");
    const promptContainer = document.getElementById("dropZonePrompt");
    if (previewContainer) previewContainer.style.display = "none";
    if (promptContainer) promptContainer.style.display = "block";
}

function handleConfirmDpSubmit(event) {
    if (event) event.preventDefault();

    const senderName = document.getElementById("dpSenderName") ? document.getElementById("dpSenderName").value.trim() : "";
    const senderPhone = document.getElementById("dpSenderPhone") ? document.getElementById("dpSenderPhone").value.trim() : "";
    const arrivalDate = document.getElementById("dpArrivalDate") ? document.getElementById("dpArrivalDate").value.trim() : "";
    const tableInfo = document.getElementById("dpTableInfo") ? document.getElementById("dpTableInfo").value.trim() : "Bebas";
    const amountVal = document.getElementById("dpAmountInput") ? document.getElementById("dpAmountInput").value.trim() : "100000";
    const notes = document.getElementById("dpNotes") ? document.getElementById("dpNotes").value.trim() : "";

    if (!senderName || !senderPhone || !arrivalDate) {
        alert("Mohon lengkapi nama pengirim, nomor WhatsApp, dan tanggal kedatangan.");
        return;
    }

    const amountFormatted = formatRupiah(parseInt(amountVal, 10) || 100000);
    const receiptStatus = attachedReceiptFile ? `Foto terlampir (${attachedReceiptFile.name})` : "Foto struk siap dikirim langsung via chat ini";

    let waText = `*KONFIRMASI BUKTI TRANSFER DP RESERVASI*\n`;
    waText += `*BUKIT PADANGAN RESTO*\n`;
    waText += `────────────────────────\n`;
    waText += `👤 *Nama Pengirim:* ${senderName}\n`;
    waText += `📱 *No. WhatsApp:* ${senderPhone}\n`;
    waText += `📅 *Rencana Kedatangan:* ${arrivalDate}\n`;
    waText += `🪑 *Meja / Area:* ${tableInfo}\n`;
    waText += `💰 *Nominal Transfer DP:* ${amountFormatted}\n`;
    waText += `🏦 *Rekening Tujuan:* Bank Mandiri (1840011559968 a.n. Mila Elmeida)\n`;
    if (notes) {
        waText += `📝 *Catatan Tambahan:* ${notes}\n`;
    }
    waText += `📎 *Status Struk:* ${receiptStatus}\n`;
    waText += `────────────────────────\n`;
    waText += `Halo Admin, mohon diverifikasi mutasinya agar meja kami terkunci. Terima kasih!`;

    const encoded = encodeURIComponent(waText);
    window.open(`https://api.whatsapp.com/send?phone=6285290462715&text=${encoded}`, "_blank");

    closeConfirmDpModal();
    showToast("✓ Menghubungkan ke WhatsApp Admin untuk konfirmasi DP...");
}

function initConfirmDpModal() {
    const modal = document.getElementById("confirmDpModal");
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeConfirmDpModal();
        });
    }
}

// Fitur 2: Kurasi Spot Foto & Sunset Panoramic Guide
function locateSpotTable(spotZone, areaName) {
    const tableSection = document.getElementById("tables");
    if (tableSection) {
        tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (typeof switchTableViewMode === 'function') {
        switchTableViewMode('grid');
    }

    let targetZone = 'semua';
    if (spotZone === 'OD') targetZone = 'outdoor';
    else if (spotZone === 'IT') targetZone = 'vip';
    else if (spotZone === 'IU') targetZone = 'vip';
    else if (spotZone === 'IKAN') targetZone = 'gazebo';

    setTimeout(() => {
        if (typeof filterTablesZone === 'function') {
            filterTablesZone(targetZone);
        }

        const cards = document.querySelectorAll(".table-card");
        cards.forEach(card => {
            card.classList.remove("table-card-pulse");
            const title = card.querySelector(".table-card-title") ? card.querySelector(".table-card-title").innerText : "";
            if (spotZone === 'OD' && (title.includes("Outdoor") || title.includes("OD-"))) {
                card.classList.add("table-card-pulse");
            } else if (spotZone === 'IT' && (title.includes("Panggung") || title.includes("Indoor Timur") || title.includes("IT"))) {
                card.classList.add("table-card-pulse");
            } else if (spotZone === 'IU' && (title.includes("Indoor Utama") || title.includes("IU-"))) {
                card.classList.add("table-card-pulse");
            } else if (spotZone === 'IKAN' && (title.includes("Terapi") || title.includes("Ikan") || title.includes("TI-"))) {
                card.classList.add("table-card-pulse");
            }
        });
    }, 450);

    if (typeof showCartToast === 'function') {
        showCartToast(`📍 Menampilkan rekomendasi meja terdekat untuk ${areaName}`);
    }
}

// Feature 4: Konsultasi Akses & Parkir Bus/Rombongan via WhatsApp
function consultParkingWA() {
    const text = `Halo Admin Bukit Padangan, saya ingin menanyakan info akses rute & kesiapan slot parkir untuk armada rombongan kami:\n\n` +
                 `🚌 *Tipe Kendaraan:* Bus Medium / HiAce / Iringan Mobil\n` +
                 `📍 *Rencana Hari/Tanggal Kedatangan:* \n` +
                 `👥 *Estimasi Jumlah Rombongan:* \n\n` +
                 `Mohon info kesiapan slot parkir dan panduan rute terbaik saat ini. Terima kasih!`;
    const adminPhone = getAssignedAdmin("auto");
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${adminPhone}?text=${encoded}`, "_blank");
}

// ========================================================
// 15. FLOATING BOTTOM-RIGHT CHAT & AI ASSISTANT CONCIERGE
// ========================================================
let isAiChatOpen = false;
let isAiChatInitialized = false;

function toggleAiChat(forceOpen = null) {
    const chatWin = document.getElementById('aiChatWindow');
    const floatWidget = document.getElementById('floatingChatWidget');
    if (!chatWin) return;

    if (forceOpen !== null) {
        isAiChatOpen = forceOpen;
    } else {
        isAiChatOpen = !isAiChatOpen;
    }

    if (isAiChatOpen) {
        chatWin.style.display = 'flex';
        chatWin.setAttribute('aria-hidden', 'false');
        if (floatWidget) {
            floatWidget.style.display = 'none';
        }
        if (!isAiChatInitialized) {
            initAiChat();
        }
        setTimeout(() => {
            const input = document.getElementById('aiChatInput');
            if (input && window.innerWidth > 768) {
                input.focus();
            }
            scrollAiChatToBottom();
        }, 100);
    } else {
        chatWin.style.display = 'none';
        chatWin.setAttribute('aria-hidden', 'true');
        if (floatWidget) {
            floatWidget.style.display = 'flex';
        }
    }
}

function initAiChat() {
    isAiChatInitialized = true;
    const initialText = "Halo! Selamat datang di **Bukit Padangan Resto** 🍃\n" +
                        "Ada yang bisa saya bantu seputar rekomendasi menu, reservasi meja, atau paket rombongan? Anda juga bisa langsung terhubung ke WhatsApp Admin.";
    const initialActions = [
        { label: "🪑 Reservasi Meja", action: "scroll:#tables" },
        { label: "💬 Hubungi WA Admin", action: "func:openWaChooserModal" }
    ];
    appendAiMessage("bot", initialText, initialActions);
}

function scrollAiChatToBottom() {
    const msgContainer = document.getElementById('aiChatMessages');
    if (msgContainer) {
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }
}

function appendAiMessage(role, text, actions = []) {
    const msgContainer = document.getElementById('aiChatMessages');
    if (!msgContainer) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-msg ai-msg-${role}`;

    // Format Markdown-like basic bold & linebreaks
    let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

    let actionsHtml = '';
    if (actions && actions.length > 0) {
        actionsHtml = '<div class="ai-msg-actions">';
        actions.forEach(act => {
            const isWa = act.action && act.action.startsWith('wa');
            actionsHtml += `<button type="button" class="ai-btn-action ${isWa ? 'action-wa' : ''}" onclick="handleAiActionClick('${act.action}')">${act.label}</button>`;
        });
        actionsHtml += '</div>';
    }

    msgDiv.innerHTML = `
        <div class="ai-msg-bubble">
            ${formattedText}
            ${actionsHtml}
        </div>
    `;

    msgContainer.appendChild(msgDiv);
    scrollAiChatToBottom();
}

function showAiTypingIndicator() {
    const msgContainer = document.getElementById('aiChatMessages');
    if (!msgContainer) return null;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-msg ai-msg-bot';
    typingDiv.id = 'aiTypingIndicatorBubble';
    typingDiv.innerHTML = `
        <div class="ai-typing-indicator">
            <span class="ai-typing-dot"></span>
            <span class="ai-typing-dot"></span>
            <span class="ai-typing-dot"></span>
        </div>
    `;
    msgContainer.appendChild(typingDiv);
    scrollAiChatToBottom();
    return typingDiv;
}

function removeAiTypingIndicator() {
    const typingBubble = document.getElementById('aiTypingIndicatorBubble');
    if (typingBubble) {
        typingBubble.remove();
    }
}

function handleAiChipClick(chipText) {
    if (!isAiChatOpen) {
        toggleAiChat(true);
    }
    const input = document.getElementById('aiChatInput');
    if (input) {
        input.value = chipText;
        handleAiChatSubmit(new Event('submit'));
    }
}

let pendingWaContext = '';

function openWaChooserModal(context = '') {
    pendingWaContext = context || '';
    const modal = document.getElementById('aiWaChooserModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeWaChooserModal() {
    const modal = document.getElementById('aiWaChooserModal');
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }
}

function directToWaAdmin(phone, adminLabel) {
    let msg = `Halo ${adminLabel} Bukit Padangan, saya ingin konsultasi info resto dan reservasi.`;
    if (pendingWaContext === 'wa:menu') {
        msg = `Halo ${adminLabel} Bukit Padangan, saya ingin bertanya seputar rekomendasi menu andalan dan pemesanan.`;
    } else if (pendingWaContext === 'wa:paket') {
        msg = `Halo ${adminLabel} Bukit Padangan, saya ingin konsultasi kustom paket acara rombongan (reuni/rapat/arisan/gathering).`;
    } else if (pendingWaContext === 'wa:meja') {
        msg = `Halo ${adminLabel} Bukit Padangan, saya ingin reservasi meja dan memastikan ketersediaan tempat.`;
    } else if (pendingWaContext === 'wa:dp') {
        msg = `Halo ${adminLabel} Bukit Padangan, saya ingin konfirmasi transfer pembayaran DP reservasi meja.`;
    } else if (pendingWaContext === 'wa:rute') {
        msg = `Halo ${adminLabel} Bukit Padangan, mohon panduan rute dan info parkir bus menuju Bukit Padangan.`;
    }
    closeWaChooserModal();
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

window.openWaChooserModal = openWaChooserModal;
window.closeWaChooserModal = closeWaChooserModal;
window.directToWaAdmin = directToWaAdmin;

function handleAiActionClick(actionStr) {
    if (!actionStr) return;

    if (actionStr.startsWith('chip:')) {
        const text = actionStr.replace('chip:', '');
        handleAiChipClick(text);
    } else if (actionStr.startsWith('scroll:')) {
        const targetId = actionStr.replace('scroll:', '');
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
        }
    } else if (actionStr.startsWith('func:')) {
        const funcName = actionStr.replace('func:', '');
        if (typeof window[funcName] === 'function') {
            window[funcName]();
        }
    } else if (actionStr.startsWith('external:')) {
        const url = actionStr.replace('external:', '');
        window.open(url, '_blank');
    } else if (actionStr.startsWith('wa')) {
        if (actionStr === 'wa:mila') {
            directToWaAdmin('6285226210408', 'Admin 1 (Mila)');
        } else if (actionStr === 'wa:bukhori') {
            directToWaAdmin('6282329384594', 'Admin 2 (Bukhori)');
        } else {
            // Sebelum direct ke WA, buka pilihan 2 nomor WA
            openWaChooserModal(actionStr);
        }
    }
}

function handleAiChatSubmit(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('aiChatInput');
    if (!input) return;

    const rawText = input.value.trim();
    if (!rawText) return;

    input.value = '';
    appendAiMessage('user', rawText);

    showAiTypingIndicator();

    setTimeout(() => {
        removeAiTypingIndicator();
        const botResponse = generateAiKnowledgeResponse(rawText);
        appendAiMessage('bot', botResponse.text, botResponse.actions);
    }, 450);
}

function generateAiKnowledgeResponse(query) {
    const q = query.toLowerCase();

    // 1. Salam & Sapaan
    if (/^(halo|hai|hi|hey|assalam|pagi|siang|sore|malam|permisi|tes|test)/i.test(q)) {
        return {
            text: "Halo! Senang bisa menyapa Anda di **Bukit Padangan Resto** 🍃\nAda yang bisa saya bantu hari ini? Anda bisa menanyakan rekomendasi menu, ketersediaan meja, paket kustom rombongan, atau rute ke resto.",
            actions: [
                { label: "🍛 Menu Favorit", action: "chip:Rekomendasi Menu Favorit" },
                { label: "🪑 Booking Meja", action: "scroll:#tables" },
                { label: "💬 Chat Admin WA", action: "wa" }
            ]
        };
    }

    // 2. Menu, Makanan, Minuman, Harga
    if (/(menu|makan|minum|harga|katalog|favorit|spesial|enak|ayam|bebek|ikan|gurame|nila|ingkung|bledos|mendoan|kopi|wedang|jus|kelapa|pedas)/i.test(q)) {
        return {
            text: "Berikut beberapa **menu favorit & andalan** di Bukit Padangan Resto:\n\n" +
                  "🔥 **Ayam Bledos & Bebek Bledos** (Rp 26k - 32k): Bumbu rempah pedas khas meresap, juara rasa!\n" +
                  "🍯 **Ayam & Nila Bakar Madu** (Rp 26k - 28k): Manis gurih legit, sangat cocok untuk keluarga & anak-anak.\n" +
                  "👑 **Ayam Ingkung Komplit** (Rp 175k): 1 ekor ayam kampung utuh empuk bumbu gurih komplit lalapan.\n" +
                  "☕ **Kopi Gula Aren & Wedang Rempah** (Rp 12k - 15k): Hangat khas lereng pegunungan Muria.\n" +
                  "🥥 **Es Kelapa Muda Jeruk & Aneka Jus Segar** (Rp 16k - 18k).",
            actions: [
                { label: "🍽️ Buka Menu Lengkap", action: "scroll:#menu" },
                { label: "💬 Pesan via WhatsApp", action: "wa:menu" }
            ]
        };
    }

    // 3. Paket Acara, Rombongan, Reuni, Rapat, Arisan, Bukber, Ultah
    if (/(paket|rombongan|acara|reuni|rapat|arisan|bukber|buka bersama|ultah|ulang tahun|pernikahan|gathering|komunitas|budget|sound|kapasitas)/i.test(q)) {
        return {
            text: "Bukit Padangan menyediakan **Sistem Penawaran Paket Acara 100% Kustom** 🎉\n\n" +
                  "Anda bebas menentukan menu dan budget per orang (misal Rp 25k, Rp 35k, atau Rp 50k+ per pax), untuk kapasitas hingga 200+ orang. Sudah termasuk fasilitas:\n" +
                  "• Sound system wireless & mic gratis\n" +
                  "• Area lesehan saung / meja panjang luas\n" +
                  "• Spot foto panorama perbukitan asri\n" +
                  "• Parkir luas motor, mobil, hingga bus pariwisata",
            actions: [
                { label: "🎉 Kalkulator Paket", action: "scroll:#packages" },
                { label: "💬 Konsultasi WA Rombongan", action: "wa:paket" }
            ]
        };
    }

    // 4. Meja, Reservasi, Booking, 3D, Gazebo, Saung
    if (/(meja|reservasi|booking|tempat|denah|3d|outdoor|indoor|gazebo|saung|lesehan|terapi ikan|sunset)/i.test(q)) {
        return {
            text: "Untuk reservasi tempat di Bukit Padangan sangat fleksibel! Anda bisa memilih zona favorit:\n\n" +
                  "• **Gazebo Saung Kolam**: Suasana sejuk di atas kolam terapi ikan santai.\n" +
                  "• **Indoor Utama & Sayap Musik**: Nyaman, dekat panggung akustik, pas untuk acara formal atau keluarga.\n" +
                  "• **Outdoor Deck Sunset**: Panorama alam terbuka, syahdu saat sore menjelang matahari terbenam.",
            actions: [
                { label: "🪑 Pilih Meja Interaktif", action: "scroll:#tables" },
                { label: "💬 Tanya Meja via WA", action: "wa:meja" }
            ]
        };
    }

    // 5. Jam Buka, Lokasi, Rute, Alamat, Parkir
    if (/(jam|buka|tutup|operasional|lokasi|alamat|dimana|rute|jalan|maps|google|pati|gunungwungkal|parkir|bus)/i.test(q)) {
        return {
            text: "⏰ **Jam Operasional:**\nBuka setiap hari: **11.00 – 22.00 WIB**\n\n" +
                  "📍 **Alamat & Lokasi:**\nJl. Raya Gunungwungkal-Gulangpongge, Kec. Gunungwungkal, Kab. Pati, Jawa Tengah (lereng perbukitan Gunung Muria yang sejuk).\n\n" +
                  "🚌 **Fasilitas Parkir:**\nArea parkir sangat luas dan aman untuk sepeda motor, mobil keluarga, hingga iringan bus pariwisata.",
            actions: [
                { label: "🗺️ Buka Google Maps", action: "external:https://maps.google.com/?q=Bukit+Padangan+Resto+Pati" },
                { label: "💬 Panduan Rute WA", action: "wa:rute" }
            ]
        };
    }

    // 6. DP, Rekening, Pembayaran, Mandiri
    if (/(dp|down payment|uang muka|bayar|transfer|rekening|mandiri|bank|konfirmasi)/i.test(q)) {
        return {
            text: "💳 **Rekening Resmi Pembayaran DP:**\n• **Bank Mandiri**: `1840011559968`\n• **Atas Nama**: Mila Elmeida\n\n" +
                  "⚠️ **Ketentuan Reservasi:**\nKonfirmasi bukti transfer DP diterima maksimal pukul **14.00 WIB** pada hari-H agar meja dan pesanan Anda dipersiapkan dengan optimal.",
            actions: [
                { label: "📤 Konfirmasi Bukti DP", action: "func:openConfirmDpModal" },
                { label: "💬 Kirim Bukti ke WA Admin", action: "wa:dp" }
            ]
        };
    }

    // 7. Kontak Admin WhatsApp Langsung
    if (/(wa|whatsapp|kontak|admin|nomor|telepon|cs|mila|bukhori|hubungi|chat)/i.test(q)) {
        return {
            text: "Silakan pilih kontak WhatsApp Admin resmi Bukit Padangan sesuai kebutuhan Anda:\n\n" +
                  "• 👩 **Admin 1 — Mila Elmeida** (`0852-2621-0408`)\n" +
                  "  Khusus: Reservasi Meja, Pilihan Menu, Transfer DP & Paket Acara\n\n" +
                  "• 👨 **Admin 2 — M. Bukhori** (`0823-2938-4594`)\n" +
                  "  Khusus: Informasi Umum, Rute Kendaraan, Parkir Bus & Operasional Resto",
            actions: [
                { label: "👩 Chat Admin 1 (Mila)", action: "wa:mila" },
                { label: "👨 Chat Admin 2 (Bukhori)", action: "wa:bukhori" },
                { label: "💬 Buka Pilihan Admin", action: "func:openWaChooserModal" }
            ]
        };
    }

    // 8. Fasilitas (Mushola, Wifi, Toilet, Playground)
    if (/(fasilitas|toilet|mushola|musala|wifi|colokan|listrik|stopkontak|anak|playground|ikan)/i.test(q)) {
        return {
            text: "Fasilitas lengkap di Bukit Padangan Resto:\n" +
                  "• 🕌 Mushola bersih & nyaman\n" +
                  "• 🚻 Toilet higienis di beberapa titik\n" +
                  "• 🐟 Kolam terapi ikan alami (santai di saung)\n" +
                  "• 🛝 Mini playground ramah anak\n" +
                  "• 📶 Wi-Fi gratis & stopkontak di area meja\n" +
                  "• 🅿️ Area parkir luas motor, mobil, bus",
            actions: [
                { label: "🪑 Pilih Meja Saung", action: "scroll:#tables" },
                { label: "💬 Tanya Info Fasilitas", action: "wa" }
            ]
        };
    }

    // Default / Fallback
    return {
        text: "Terima kasih atas pertanyaannya! Asisten AI Bukit Padangan siap membantu Anda mencari info menu lezat, reservasi meja, atau paket rombongan.\n\n" +
              "Jika Anda butuh bantuan khusus atau ingin berbicara dengan tim staf kami, silakan klik tombol di bawah untuk memilih WhatsApp Admin 😊",
        actions: [
            { label: "🍛 Menu Favorit", action: "chip:Rekomendasi Menu Favorit" },
            { label: "🪑 Booking Meja", action: "scroll:#tables" },
            { label: "💬 Direct WhatsApp", action: "func:openWaChooserModal" }
        ]
    };
}


