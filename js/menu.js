/**
 * menu.js - Menu Catalog, Category Filter, Search & Kaching Order
 * Warung Makan Bukit Padangan
 */

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
            key: "bu-darmisih",
            title: "Olahan Spesial Bu Darmisih",
            icon: '<i class="fas fa-pepper-hot"></i>',
            subtitle: "Ayam & bebek bledos pedas rempah mantap, swike, rica-rica & masakan khas resep dapur"
        },
        {
            key: "makanan",
            title: "Makanan Utama & Bakaran",
            icon: '<i class="fas fa-utensils"></i>',
            subtitle: "Ayam kampung, nila, lele, gurami bakar & goreng, belut, udang & olahan lezat lereng bukit"
        },
        {
            key: "sayuran",
            title: "Sayuran & Tumisan Segar",
            icon: '<i class="fas fa-leaf"></i>',
            subtitle: "Ca kangkung, ca brokoli, ca tauge, terong bakar & sayur kuah pedesaan"
        },
        {
            key: "mie-ayam",
            title: "Mie Ayam & Bakmi",
            icon: '<i class="fas fa-bowl-rice"></i>',
            subtitle: "Mie ayam gurih, yamin manis & mie level pedas nampol"
        },
        {
            key: "nasi",
            title: "Aneka Nasi & Porsi Keluarga",
            icon: '<i class="fas fa-bowl-rice"></i>',
            subtitle: "Nasi putih pulen, nasi liwet gurih aroma daun & sajian 1 bakul porsi keluarga"
        },
        {
            key: "camilan",
            title: "Camilan, Mendoan & Kudapan Santai",
            icon: '<i class="fas fa-cookie-bite"></i>',
            subtitle: "Tempe mendoan hangat, pisang goreng krispi, singkong keju, cireng & aneka gorengan"
        },
        {
            key: "minuman",
            title: "Minuman Segar & Aneka Jus",
            icon: '<i class="fas fa-glass-water"></i>',
            subtitle: "Kelapa muda lereng bukit, aneka jus buah segar asli, squash, milkshake & teh segar"
        },
        {
            key: "kopi-wedang",
            title: "Kopi Santan & Wedang Tradisional",
            icon: '<i class="fas fa-mug-hot"></i>',
            subtitle: "Kopi santan khas Pati, seduhan wedang uwuh, jahe rempah wangi & seduhan hangat"
        },
        {
            key: "es-krim",
            title: "Es Krim & Dessert Dingin",
            icon: '<i class="fas fa-ice-cream"></i>',
            subtitle: "Pilihan es krim Hula Hula, Neapolitan, Cone krispi & penyegar suasana santai"
        },
        {
            key: "sambal-pelengkap",
            title: "Aneka Sambal & Pelengkap",
            icon: '<i class="fas fa-mortar-pestle"></i>',
            subtitle: "Sambal trasi matang/mentah, sambal bawang pedas, sambal kecap, pete bakar & lalapan segar"
        },
        {
            key: "pojok-padangan",
            title: "Pojok Hasil Bumi & Buah Kebun",
            icon: '<i class="fas fa-seedling"></i>',
            subtitle: "Alpukat segar petik kebun, buah naga lereng bukit, buah potong & hasil panen lokal"
        },
        {
            key: "fasilitas",
            title: "Fasilitas & Wahana Santai",
            icon: '<i class="fas fa-umbrella-beach"></i>',
            subtitle: "Kolam terapi ikan alami, paket sewa tempat indoor, proyektor, sound & wahana mewarnai"
        },
        {
            key: "mainan",
            title: "Mainan & Suvenir Anak",
            icon: '<i class="fas fa-gift"></i>',
            subtitle: "Blindbox, gantungan kunci & mainan seru untuk si kecil"
        },
        {
            key: "rokok",
            title: "Rokok & Kasir",
            icon: '<i class="fas fa-smoking"></i>',
            subtitle: "Pilihan rokok & perlengkapan kasir"
        }
    ];

    const categoryHtmlList = [];

    categoriesConfig.forEach(cat => {
        const catItems = items.filter(item => item.category === cat.key);
        if (catItems.length === 0) return;

        const cardsHtml = catItems.map(item => renderMenuCardCarousel(item)).join("");
        const isShortCatalog = catItems.length <= 4;
        const trackCenterClass = isShortCatalog ? `track-center track-count-${catItems.length}` : '';

        categoryHtmlList.push(`
            <div class="menu-category-block ${isShortCatalog ? 'is-short-catalog' : ''}" data-category="${cat.key}" data-item-count="${catItems.length}" id="cat-section-${cat.key}">
                <div class="menu-category-header">
                    <div class="category-header-info">
                        <h3 class="category-title">${cat.title}</h3>
                        <span class="category-subtitle">${cat.subtitle}</span>
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
                    <div class="menu-horizontal-track ${trackCenterClass}" id="track-${cat.key}" data-count="${catItems.length}">
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
    const priceFormatted = formatRupiah(item.price) + (item.unit === 'Gram' ? ' <small style="font-size:0.75rem;font-weight:normal;color:#94a3b8;">/gr</small>' : '');

    return `
        <div class="menu-card-carousel" data-category="${item.category}" data-flavor="${item.flavor || ''}" data-id="${item.id}" onclick="openMenuDetailModal('${item.id}')" title="Klik untuk lihat detail rasa & isi ${item.name}">
            <div class="menu-card-img-wrap">
                <img src="${item.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop';">
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
        imgEl.onerror = function() {
            this.onerror = null;
            this.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop";
        };
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
            "bu-darmisih": "Olahan Spesial Bu Darmisih",
            "makanan": "Makanan Utama & Bakaran",
            "sayuran": "Sayuran & Tumisan",
            "mie-ayam": "Mie Ayam & Bakmi",
            "nasi": "Aneka Nasi",
            "camilan": "Camilan & Kudapan",
            "minuman": "Minuman Segar & Aneka Jus",
            "kopi-wedang": "Kopi Santan & Wedang Tradisional",
            "es-krim": "Es Krim & Dessert",
            "sambal-pelengkap": "Aneka Sambal & Pelengkap",
            "pojok-padangan": "Pojok Hasil Bumi Lokal",
            "fasilitas": "Fasilitas & Wahana",
            "mainan": "Mainan & Suvenir",
            "rokok": "Rokok & Kasir"
        };
        catEl.textContent = catMap[item.category] || "Menu Pilihan";
    }

    // Harga
    const priceEl = document.getElementById("menuDetailPrice");
    if (priceEl) priceEl.textContent = formatRupiah(item.price) + (item.unit === 'Gram' ? ' / gr' : '');

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

// Katalog menu & pemesanan via kaching web order
// (web profil tidak menyimpan keranjang/transaksi lokal)
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
