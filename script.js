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
            
            // Update dropdown values di form
            const resAdminSelect = document.getElementById("resAdmin");
            if (resAdminSelect) {
                resAdminSelect.innerHTML = `
                    <option value="${data.contacts.wa_admin1}">Admin 1 (Mila/Bukit Padangan)</option>
                    <option value="${data.contacts.wa_admin2}">Admin 2 (Layanan Alternatif)</option>
                `;
            }

            // Update footer
            if (document.getElementById("waAdmin1Text")) document.getElementById("waAdmin1Text").innerText = formatPhoneDisplay(data.contacts.wa_admin1);
            if (document.getElementById("waAdmin2Text")) document.getElementById("waAdmin2Text").innerText = formatPhoneDisplay(data.contacts.wa_admin2);
            if (document.getElementById("igFooterLink")) document.getElementById("igFooterLink").href = data.contacts.instagram;
            if (document.getElementById("fbFooterLink")) document.getElementById("fbFooterLink").href = data.contacts.facebook;
            if (document.getElementById("tiktokFooterLink") && data.contacts.tiktok) document.getElementById("tiktokFooterLink").href = data.contacts.tiktok;
        }

    } catch (err) {
        console.error("Gagal meload konten dinamis:", err);
    }
}

function formatPhoneDisplay(num) {
    if (num.startsWith("62")) {
        return "0" + num.slice(2);
    }
    return num;
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
    
    if (items.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px 0;">Menu tidak ditemukan. Silakan gunakan kata kunci pencarian lain.</p>`;
        return;
    }

    grid.innerHTML = items.map(item => {
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
            <div class="menu-item show" data-category="${item.category}" data-flavor="${item.flavor || ''}" data-id="${item.id}">
                <div class="menu-img">
                    <img src="${item.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'}" alt="${item.name}">
                    ${badgeHtml}
                </div>
                <div class="menu-info">
                    <h4>${item.name} ${flavorBadgeHtml}</h4>
                    <p>${item.desc}</p>
                    <div class="menu-footer">
                        <span class="menu-price">${priceFormatted}</span>
                        <button type="button" class="btn-add-cart" onclick="addToCart('${item.id}', event)" title="Tambah ke Pesanan">
                            <i class="fas fa-plus"></i> Pesan
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

window.addEventListener("DOMContentLoaded", () => {
    loadDynamicContent();
    loadMenuData();
    loadTablesData();
    initOperatingHoursStatus();
    initFaqAccordion();
    updatePackageCalc();
    initCart();
    initWeatherWidget();
    initLiveMusicSchedule();
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
const kachingDirectLink = document.getElementById("kachingDirectLink");

// Tautan Resmi Kaching Self-Order (User ID Bukit Padangan = 1)
const KACHING_ORDER_URL = "https://kaching.id/order/toko/1/public";

// Mengaktifkan Tombol Kaching Direct Link
if (kachingDirectLink) {
    kachingDirectLink.classList.remove("disabled");
    kachingDirectLink.href = KACHING_ORDER_URL;
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
// 3. LIGHTBOX GALLERY ZOOM
// =========================================
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
let activeImageIndex = 0;

// Ambil list semua gambar di dalam grid galeri
const galleryImages = Array.from(document.querySelectorAll(".gallery-item img"));

function openLightbox(index) {
    if (!lightbox || galleryImages.length === 0) return;
    activeImageIndex = index;
    lightbox.style.display = "flex";
    
    // Tampilkan gambar dan caption
    const activeImg = galleryImages[activeImageIndex];
    lightboxImg.src = activeImg.src;
    lightboxCaption.innerText = activeImg.alt || "Galeri Bukit Padangan";
}

function closeLightbox() {
    if (lightbox) lightbox.style.display = "none";
}

function changeLightboxImage(delta, event) {
    if (event) event.stopPropagation(); // Mencegah modal tertutup karena event click di bubble up
    let newIndex = activeImageIndex + delta;
    
    if (newIndex >= galleryImages.length) newIndex = 0;
    else if (newIndex < 0) newIndex = galleryImages.length - 1;
    
    openLightbox(newIndex);
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
        `table-${String(t.number).padStart(2, '0')}`.toLowerCase() === cleanId
    );
    if (!table) return;

    activePreviewTableId = tableId;

    document.getElementById("tableModalImg").src = table.image || "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=800&auto=format&fit=crop";
    document.getElementById("tableModalTitle").innerText = table.name;
    document.getElementById("tableModalZone").innerText = table.zoneName;
    document.getElementById("tableModalCapacity").innerText = `${table.capacity} Orang`;
    document.getElementById("tableModalDesc").innerText = table.description;

    const statusBadge = document.getElementById("tableModalStatusBadge");
    statusBadge.className = `table-status-pill ${table.status}`;
    statusBadge.innerText = table.status.toUpperCase();

    const facilitiesContainer = document.getElementById("tableModalFacilities");
    if (facilitiesContainer) {
        facilitiesContainer.innerHTML = (table.facilities || []).map(f => `
            <span class="table-facility-chip"><i class="fas fa-check-circle" style="color: var(--primary-green);"></i> ${f}</span>
        `).join("");
    }

    const btnSelect = document.getElementById("btnSelectThisTable");
    if (table.status === "tersedia") {
        btnSelect.className = "btn-select-table";
        btnSelect.disabled = false;
        btnSelect.innerHTML = `<i class="fas fa-check"></i> Pilih Meja Ini untuk Reservasi`;
    } else {
        btnSelect.className = "btn-select-table disabled";
        btnSelect.disabled = true;
        btnSelect.innerHTML = `<i class="fas fa-ban"></i> Meja Sedang ${table.status.toUpperCase()}`;
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
    selectThisTable(activePreviewTableId);
    closeTableModal();
}

function selectThisTable(tableId) {
    const table = tablesData.find(t => t.id === tableId);
    if (!table) return;

    selectedTable = table;

    // Update banner di atas grid denah
    const banner = document.getElementById("selectedTableBanner");
    const bannerText = document.getElementById("selectedBannerText");
    const bannerZone = document.getElementById("selectedBannerZone");
    if (banner && bannerText && bannerZone) {
        bannerText.innerText = table.name;
        bannerZone.innerText = `${table.zoneName} (${table.capacity} Kursi)`;
        banner.style.display = "flex";
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
        else if (table.zone === "gazebo") areaSelect.value = "Area Terapi Ikan & Ramah Anak";
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

    // Sinkronisasi status meja ke keranjang pesanan
    updateCartUI();

    // Buka modal reservasi
    openModal();
}

function clearSelectedTable() {
    selectedTable = null;

    const banner = document.getElementById("selectedTableBanner");
    if (banner) banner.style.display = "none";

    const formBadge = document.getElementById("formSelectedTableBadge");
    if (formBadge) formBadge.style.display = "none";

    const select = document.getElementById("resTableSelect");
    if (select) select.value = "";

    if (currentTableZone === "semua") {
        renderTablesGrid(tablesData);
    } else {
        renderTablesGrid(tablesData.filter(t => t.zone === currentTableZone));
    }

    updateCartUI();
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
// 7. KERANJANG BELANJA NATIVE & SEARCH MENU
// =========================================
let cartItems = []; // Array of { id, name, price, qty, note, img }
let currentMenuSearch = "";
let currentMenuCategory = "semua";
let currentMenuFlavor = "semua";

// Inisialisasi Cart dari LocalStorage
function initCart() {
    try {
        const saved = localStorage.getItem("bukit_cart");
        if (saved) {
            cartItems = JSON.parse(saved);
        }
    } catch (e) {
        cartItems = [];
    }
    updateCartUI();
}

// Simpan Cart ke LocalStorage
function saveCart() {
    try {
        localStorage.setItem("bukit_cart", JSON.stringify(cartItems));
    } catch (e) {}
}

// Tambah Item ke Keranjang
function addToCart(menuId, event) {
    if (event) event.stopPropagation();
    const item = menuData.find(m => m.id === menuId);
    if (!item) return;

    const existing = cartItems.find(c => c.id === menuId);
    if (existing) {
        existing.qty += 1;
    } else {
        cartItems.push({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: 1,
            note: "",
            img: item.img || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop"
        });
    }

    saveCart();
    updateCartUI();
    showCartToast(`✓ ${item.name} ditambahkan`);

    // Feedback visual tombol
    if (event && event.currentTarget) {
        const btn = event.currentTarget;
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-check"></i> Ditambah`;
        btn.style.background = "linear-gradient(135deg, #25D366 0%, #1ea952 100%)";
        btn.style.color = "#ffffff";
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = "";
            btn.style.color = "";
        }, 800);
    }
}

// Ubah Qty Item (+ / -)
function updateCartItemQty(menuId, delta) {
    const item = cartItems.find(c => c.id === menuId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        cartItems = cartItems.filter(c => c.id !== menuId);
    }

    saveCart();
    updateCartUI();
}

// Hapus Item
function removeCartItem(menuId) {
    cartItems = cartItems.filter(c => c.id !== menuId);
    saveCart();
    updateCartUI();
}

// Update Catatan Khusus Item
function updateCartItemNote(menuId, note) {
    const item = cartItems.find(c => c.id === menuId);
    if (item) {
        item.note = note.trim();
        saveCart();
    }
}

// Buka Drawer Keranjang
function openCartDrawer() {
    closeModal();
    const drawer = document.getElementById("cartDrawer");
    const backdrop = document.getElementById("cartBackdrop");
    if (drawer) drawer.classList.add("open");
    if (backdrop) backdrop.classList.add("active");
    updateCartUI();
}

// Tutup Drawer Keranjang
function closeCartDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const backdrop = document.getElementById("cartBackdrop");
    if (drawer) drawer.classList.remove("open");
    if (backdrop) backdrop.classList.remove("active");
}

// Toast Notifikasi
let toastTimeout = null;
function showCartToast(msg) {
    const toast = document.getElementById("cartToast");
    const toastMsg = document.getElementById("cartToastMsg");
    if (!toast || !toastMsg) return;

    toastMsg.innerText = msg;
    toast.classList.add("show");

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2400);
}

// =========================================
// WHATSAPP DYNAMIC LOAD BALANCER & ADMIN CONTACTS (SSOT)
// =========================================
const ADMIN_CONTACTS = {
    mila: { name: "Mila Elmeida (Admin 1)", phone: "6285226210408" },
    bukhori: { name: "M. Bukhori (Admin 2)", phone: "6282329384594" }
};

function getAssignedAdmin(mode = "auto") {
    if (mode === "mila") return ADMIN_CONTACTS.mila.phone;
    if (mode === "bukhori") return ADMIN_CONTACTS.bukhori.phone;
    const rand = Math.random() < 0.5;
    return rand ? ADMIN_CONTACTS.mila.phone : ADMIN_CONTACTS.bukhori.phone;
}

// =========================================
// FITUR 3: SISTEM KUPON & VOUCHER PROMO PRE-ORDER
// =========================================
let activeCartVoucher = null;
const VOUCHER_CATALOG = {
    "WEEKDAY10": {
        code: "WEEKDAY10",
        type: "percent",
        value: 10,
        minOrder: 40000,
        desc: "Diskon 10% Spesial Pre-Order Hari Kerja"
    },
    "PADANGAN10K": {
        code: "PADANGAN10K",
        type: "fixed",
        value: 10000,
        minOrder: 60000,
        desc: "Potongan Rp 10.000 Pre-Order Menu"
    },
    "GATHERING50K": {
        code: "GATHERING50K",
        type: "fixed",
        value: 50000,
        minOrder: 250000,
        desc: "Potongan Rp 50.000 Rombongan & Acara"
    },
    "KOPISORE": {
        code: "KOPISORE",
        type: "fixed",
        value: 5000,
        minOrder: 30000,
        desc: "Potongan Rp 5.000 Santap Kopi Senja"
    }
};

function applyCartVoucher(manualCode) {
    const input = document.getElementById("cartVoucherInput");
    const code = (manualCode || (input ? input.value : "")).trim().toUpperCase();
    const feedback = document.getElementById("cartVoucherFeedback");

    if (!code) {
        if (feedback) {
            feedback.style.display = "block";
            feedback.className = "cart-voucher-feedback error";
            feedback.innerText = "Masukkan kode voucher terlebih dahulu.";
        }
        return;
    }

    const voucher = VOUCHER_CATALOG[code];
    if (!voucher) {
        if (feedback) {
            feedback.style.display = "block";
            feedback.className = "cart-voucher-feedback error";
            feedback.innerText = `Kode voucher "${code}" tidak ditemukan atau tidak aktif.`;
        }
        return;
    }

    const subtotal = cartItems.reduce((sum, it) => sum + (it.price * it.qty), 0);
    if (subtotal < voucher.minOrder) {
        if (feedback) {
            feedback.style.display = "block";
            feedback.className = "cart-voucher-feedback error";
            feedback.innerText = `Minimal order untuk kode ${code} adalah ${formatRupiah(voucher.minOrder)}. (Subtotal Anda: ${formatRupiah(subtotal)})`;
        }
        return;
    }

    activeCartVoucher = voucher;
    if (input) input.value = code;
    if (feedback) {
        feedback.style.display = "block";
        feedback.className = "cart-voucher-feedback success";
        feedback.innerHTML = `✓ Voucher <strong>${code}</strong> berhasil dipasang! (${voucher.desc})`;
    }

    updateCartUI();
    showCartToast(`🎉 Voucher ${code} aktif! Diskon terpasang.`);
}

function removeCartVoucher() {
    activeCartVoucher = null;
    const input = document.getElementById("cartVoucherInput");
    if (input) input.value = "";
    const feedback = document.getElementById("cartVoucherFeedback");
    if (feedback) {
        feedback.style.display = "none";
        feedback.innerText = "";
    }
    updateCartUI();
    showCartToast("Kupon promo dibatalkan.");
}

function setQuickVoucher(code) {
    const input = document.getElementById("cartVoucherInput");
    if (input) input.value = code;
    applyCartVoucher(code);
}

// Update Seluruh Tampilan UI Terkait Cart
function updateCartUI() {
    const totalQty = cartItems.reduce((sum, it) => sum + it.qty, 0);
    const subtotal = cartItems.reduce((sum, it) => sum + (it.price * it.qty), 0);

    // Hitung Diskon Kupon
    let discountAmount = 0;
    if (activeCartVoucher) {
        if (subtotal >= activeCartVoucher.minOrder) {
            if (activeCartVoucher.type === 'percent') {
                discountAmount = Math.round(subtotal * (activeCartVoucher.value / 100));
            } else if (activeCartVoucher.type === 'fixed') {
                discountAmount = activeCartVoucher.value;
            }
            discountAmount = Math.min(discountAmount, subtotal);
        } else {
            activeCartVoucher = null;
            const feedback = document.getElementById("cartVoucherFeedback");
            if (feedback) {
                feedback.style.display = "block";
                feedback.className = "cart-voucher-feedback error";
                feedback.innerText = "Kupon dinonaktifkan: subtotal pesanan di bawah syarat minimum.";
            }
        }
    }

    const finalTotalPrice = Math.max(0, subtotal - discountAmount);

    // Update Badges
    const floatingCart = document.getElementById("floatingCart");
    const cartCountBadge = document.getElementById("cartCountBadge");
    const mobileCartBadge = document.getElementById("mobileCartBadge");
    const bannerCartCount = document.getElementById("bannerCartCount");

    if (cartCountBadge) {
        cartCountBadge.innerText = totalQty;
        cartCountBadge.style.display = totalQty > 0 ? "flex" : "none";
    }
    if (mobileCartBadge) {
        mobileCartBadge.innerText = totalQty;
        mobileCartBadge.style.display = totalQty > 0 ? "flex" : "none";
    }
    if (bannerCartCount) {
        bannerCartCount.innerText = totalQty;
    }

    if (floatingCart) {
        floatingCart.style.display = totalQty > 0 ? "flex" : "none";
    }

    // Update Table Info inside Drawer
    const cartTableText = document.getElementById("cartTableText");
    if (cartTableText) {
        if (selectedTable) {
            cartTableText.innerHTML = `<strong>${selectedTable.name}</strong> • ${selectedTable.zoneName} (${selectedTable.capacity} Kursi)`;
        } else {
            const manualSelect = document.getElementById("resTableSelect");
            if (manualSelect && manualSelect.value) {
                const opt = manualSelect.options[manualSelect.selectedIndex];
                cartTableText.innerHTML = `<strong>${opt.text}</strong>`;
            } else {
                cartTableText.innerText = "Belum pilih meja (Bisa dipilih nanti)";
            }
        }
    }

    // Update Totals
    const cartTotalItems = document.getElementById("cartTotalItems");
    const cartSubtotalPrice = document.getElementById("cartSubtotalPrice");
    const cartDiscountRow = document.getElementById("cartDiscountRow");
    const cartDiscountCodeName = document.getElementById("cartDiscountCodeName");
    const cartDiscountVal = document.getElementById("cartDiscountVal");
    const cartTotalPrice = document.getElementById("cartTotalPrice");

    if (cartTotalItems) cartTotalItems.innerText = `${totalQty} Porsi`;
    if (cartSubtotalPrice) cartSubtotalPrice.innerText = formatRupiah(subtotal);

    if (cartDiscountRow) {
        if (discountAmount > 0 && activeCartVoucher) {
            cartDiscountRow.style.display = "flex";
            if (cartDiscountCodeName) cartDiscountCodeName.innerText = activeCartVoucher.code;
            if (cartDiscountVal) cartDiscountVal.innerText = `-${formatRupiah(discountAmount)}`;
        } else {
            cartDiscountRow.style.display = "none";
        }
    }

    if (cartTotalPrice) cartTotalPrice.innerText = formatRupiah(finalTotalPrice);

    // Update Items List inside Drawer
    const listContainer = document.getElementById("cartItemsList");
    if (listContainer) {
        if (cartItems.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-cart-box">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Keranjang pesanan masih kosong</p>
                    <span>Silakan klik "+ Pesan" pada menu favorit Anda.</span>
                </div>
            `;
        } else {
            listContainer.innerHTML = cartItems.map(it => `
                <div class="cart-item" data-id="${it.id}">
                    <div class="cart-item-left">
                        <img src="${it.img}" alt="${it.name}" class="cart-item-thumb">
                        <div class="cart-item-details">
                            <h5>${it.name}</h5>
                            <span class="cart-item-unit-price">${formatRupiah(it.price)}</span>
                            <input type="text" class="cart-item-note-input" placeholder="Catatan (misal: pedas / es sedikit)" value="${it.note || ''}" onchange="updateCartItemNote('${it.id}', this.value)">
                        </div>
                    </div>
                    <div class="cart-item-right">
                        <div class="cart-item-qty">
                            <button type="button" class="qty-btn" onclick="updateCartItemQty('${it.id}', -1)">-</button>
                            <span class="qty-val">${it.qty}</span>
                            <button type="button" class="qty-btn" onclick="updateCartItemQty('${it.id}', 1)">+</button>
                        </div>
                        <span class="cart-item-subtotal">${formatRupiah(it.price * it.qty)}</span>
                        <button type="button" class="btn-remove-item" onclick="removeCartItem('${it.id}')" title="Hapus"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            `).join("");
        }
    }

    // Update Kaching Direct Link URL with Table Number if Selected
    const kachingBtn = document.getElementById("kachingOrderDirectBtn");
    let kachingUrl = "https://kaching.id/order/toko/1/public";
    if (selectedTable && selectedTable.id) {
        const tableNum = selectedTable.id.replace(/\D/g, "") || "1";
        kachingUrl = `https://kaching.id/order/toko/1/meja/${tableNum}`;
    }
    if (kachingBtn) kachingBtn.href = kachingUrl;

    // Update Form Preorder Summary inside Reservation Modal if exists
    updateReservationModalPreorderSummary();
}

// Sinkronisasi Ringkasan Pre-Order ke Form Modal Reservasi
function updateReservationModalPreorderSummary() {
    const resForm = document.getElementById("reservationForm");
    if (!resForm) return;

    let summaryBox = document.getElementById("resPreorderSummaryBox");
    if (cartItems.length === 0) {
        if (summaryBox) summaryBox.style.display = "none";
        return;
    }

    if (!summaryBox) {
        summaryBox = document.createElement("div");
        summaryBox.id = "resPreorderSummaryBox";
        summaryBox.className = "form-preorder-summary";
        const submitBtn = resForm.querySelector(".btn-submit");
        if (submitBtn) resForm.insertBefore(summaryBox, submitBtn);
    }

    summaryBox.style.display = "block";
    const totalPrice = cartItems.reduce((sum, it) => sum + (it.price * it.qty), 0);
    summaryBox.innerHTML = `
        <h4><i class="fas fa-shopping-bag"></i> Pre-Order Santapan (${cartItems.length} Menu):</h4>
        ${cartItems.map(it => `
            <div class="summary-item-line">
                <span>${it.name} x${it.qty}</span>
                <span>${formatRupiah(it.price * it.qty)}</span>
            </div>
        `).join("")}
        <div class="summary-total">
            <span>Total Santapan:</span>
            <strong style="color: var(--accent-gold);">${formatRupiah(totalPrice)}</strong>
        </div>
    `;
}

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
    if (event && event.currentTarget) {
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
            (item.badge && item.badge.toLowerCase().includes(currentMenuSearch)) ||
            (item.flavor_name && item.flavor_name.toLowerCase().includes(currentMenuSearch))
        );
    }
    renderMenuGrid(filtered);
}

// Dual-Sync Checkout Handler (Kaching API + WhatsApp Receipt)
async function submitCartOrder() {
    if (cartItems.length === 0) {
        alert("Keranjang pesanan Anda masih kosong. Silakan pilih menu terlebih dahulu.");
        return;
    }

    const nameInput = document.getElementById("cartCustName");
    const phoneInput = document.getElementById("cartCustPhone");
    const orderTypeSelect = document.getElementById("cartOrderType");
    const payMethodSelect = document.getElementById("cartPayMethod");

    const custName = nameInput ? nameInput.value.trim() : "";
    const custPhone = phoneInput ? phoneInput.value.trim() : "";
    const orderType = orderTypeSelect ? orderTypeSelect.value : "dine_in";
    const payMethod = payMethodSelect ? payMethodSelect.value : "Kasir";

    if (!custName) {
        alert("Mohon masukkan nama pemesan.");
        if (nameInput) nameInput.focus();
        return;
    }

    if (!custPhone) {
        alert("Mohon masukkan nomor WhatsApp yang aktif.");
        if (phoneInput) phoneInput.focus();
        return;
    }

    const submitBtn = document.getElementById("btnSubmitCartOrder");
    const originalBtnText = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menghubungkan ke Kasir...`;
    }

    // Tentukan Info Meja
    let tableText = "Bebas / Belum Pilih Meja";
    let tableNum = "0";
    if (selectedTable) {
        tableText = `${selectedTable.name} (${selectedTable.zoneName} - ${selectedTable.capacity} Kursi)`;
        tableNum = selectedTable.id.replace(/\D/g, "") || "1";
    } else {
        const manualSelect = document.getElementById("resTableSelect");
        if (manualSelect && manualSelect.value) {
            const opt = manualSelect.options[manualSelect.selectedIndex];
            tableText = opt.text;
            tableNum = manualSelect.value.replace(/\D/g, "") || "1";
        }
    }

    const subtotal = cartItems.reduce((sum, it) => sum + (it.price * it.qty), 0);
    let discountAmount = 0;
    if (activeCartVoucher && subtotal >= activeCartVoucher.minOrder) {
        if (activeCartVoucher.type === 'percent') {
            discountAmount = Math.round(subtotal * (activeCartVoucher.value / 100));
        } else if (activeCartVoucher.type === 'fixed') {
            discountAmount = activeCartVoucher.value;
        }
        discountAmount = Math.min(discountAmount, subtotal);
    }
    const finalPrice = Math.max(0, subtotal - discountAmount);

    // 1. Kirim Payload ke API Kaching Backend (Pusher Event & POS Web-Order Table)
    const kachingPayload = {
        customer_name: custName,
        phone: custPhone,
        order_type: orderType,
        payment_method: payMethod,
        table_number: tableNum,
        voucher_code: activeCartVoucher ? activeCartVoucher.code : null,
        discount_amount: discountAmount,
        subtotal: subtotal,
        final_total: finalPrice,
        items: cartItems.map(it => ({
            menu_id: it.id,
            qty: it.qty,
            note: it.note || ""
        }))
    };

    try {
        fetch(`https://kaching.id/order/toko/1/meja/${tableNum}/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify(kachingPayload)
        }).catch(err => {
            console.log("Kaching POS notification dispatched:", err);
        });
    } catch (e) {
        console.warn("Kaching API push:", e);
    }

    // 2. Susun Pesan WhatsApp Konfirmasi untuk Tamu & Kasir
    let waText = `*HALO BUKIT PADANGAN, SAYA INGIN PESAN SANTAPAN*\n\n`;
    waText += `📋 *Data Pemesan:*\n`;
    waText += `• Nama: ${custName}\n`;
    waText += `• No. WhatsApp: ${custPhone}\n`;
    waText += `• Pilihan Meja: *${tableText}*\n`;
    waText += `• Tipe Pesanan: ${orderType === 'dine_in' ? 'Makan di Tempat (Dine In)' : 'Bawa Pulang (Take Away)'}\n\n`;
    waText += `🍽️ *Rincian Pesanan Menu:*\n`;
    cartItems.forEach((it, idx) => {
        waText += `${idx + 1}. *${it.name}* x${it.qty} = ${formatRupiah(it.price * it.qty)}\n`;
        if (it.note) waText += `   ↳ _Catatan: ${it.note}_\n`;
    });
    waText += `\n💰 *Subtotal Menu:* ${formatRupiah(subtotal)}\n`;
    if (activeCartVoucher && discountAmount > 0) {
        waText += `🎟️ *Voucher Promo:* ${activeCartVoucher.code} (-${formatRupiah(discountAmount)})\n`;
    }
    waText += `💵 *Total Pembayaran:* *${formatRupiah(finalPrice)}*\n`;
    waText += `💳 *Metode Pembayaran:* ${payMethod}\n`;
    if (payMethod.includes("Transfer") || payMethod.includes("DP")) {
        waText += `• Rekening: Bank Mandiri *1840011559968* (a.n. Mila Elmeida)\n`;
        waText += `• Batas Konfirmasi Hari-H: 14.00 WIB\n`;
    }
    waText += `\nMohon konfirmasi pesanan dan ketersediaan meja kami. Terima kasih!`;

    const adminPhone = getAssignedAdmin("auto");
    const encodedText = encodeURIComponent(waText);
    const waUrl = `https://wa.me/${adminPhone}?text=${encodedText}`;

    // Feedback sukses
    if (submitBtn) {
        submitBtn.innerHTML = `<i class="fas fa-check"></i> Pesanan Terkirim!`;
        submitBtn.style.background = "#25D366";
    }

    setTimeout(() => {
        window.open(waUrl, "_blank");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            submitBtn.style.background = "";
        }
        closeCartDrawer();
    }, 600);
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

    // Jika ada santapan di keranjang, sertakan dalam pesan reservasi
    if (cartItems && cartItems.length > 0) {
        const totalFoodPrice = cartItems.reduce((sum, it) => sum + (it.price * it.qty), 0);
        waText += `🍽️ *Pre-Order Santapan (${cartItems.length} Menu):*\n`;
        cartItems.forEach((it, idx) => {
            waText += `${idx + 1}. *${it.name}* x${it.qty} = ${formatRupiah(it.price * it.qty)}\n`;
            if (it.note) waText += `   ↳ _Catatan: ${it.note}_\n`;
        });
        waText += `💰 *Total Estimasi Santapan:* *${formatRupiah(totalFoodPrice)}*\n\n`;

        // Background push ke Kaching POS agar lonceng kasir berdering
        try {
            const tableNum = (selectedTable && selectedTable.id) ? (selectedTable.id.replace(/\D/g, '') || '1') : '1';
            fetch(`https://kaching.id/order/toko/1/meja/${tableNum}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
                body: JSON.stringify({
                    customer_name: `${name} (Reservasi)`,
                    phone: targetPhone,
                    order_type: "reservasi",
                    payment_method: "Kasir",
                    table_number: tableNum,
                    items: cartItems.map(it => ({ menu_id: it.id, qty: it.qty, note: it.note || "" }))
                })
            }).catch(e => console.log("Kaching reservation order dispatched:", e));
        } catch(e) {}
    }

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
    if (!navLinks) return;

    const isCurrentlyActive = navLinks.classList.contains("active");
    const shouldOpen = (typeof forceState === "boolean") ? forceState : !isCurrentlyActive;

    if (shouldOpen) {
        navLinks.classList.add("active");
        if (navBackdrop) navBackdrop.classList.add("active");
        document.body.style.overflow = "hidden";
    } else {
        navLinks.classList.remove("active");
        if (navBackdrop) navBackdrop.classList.remove("active");
        document.body.style.overflow = "";
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
    const eventTypeSelect = document.getElementById("calcEventType");
    const paxRange = document.getElementById("calcPaxRange");
    const packageSelect = document.getElementById("calcPackageSelect");
    const addonMusic = document.getElementById("calcAddonMusic");
    const addonDrink = document.getElementById("calcAddonDrink");
    const addonSnack = document.getElementById("calcAddonSnack");
    const adminSelect = document.getElementById("calcAdminSelect");

    const eventType = eventTypeSelect ? eventTypeSelect.value : "Gathering & Rombongan";
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

    let waText = `Halo Admin Bukit Padangan, saya ingin konsultasi reservasi acara rombongan:\n\n`;
    waText += `🎉 *Kategori Acara:* ${eventType}\n`;
    waText += `👥 *Estimasi Tamu:* ${pax} Orang\n`;
    waText += `📋 *Paket Konsumsi:* ${pkgName}\n`;
    waText += `✨ *Fasilitas & Extra:*\n`;
    addons.forEach(item => {
        waText += `  • ${item}\n`;
    });
    waText += `\n💰 *Total Estimasi Biaya:* ${grandTotal}\n`;
    waText += `🔒 *Estimasi DP 20% (Kunci Jadwal):* ${dpVal}\n\n`;
    waText += `💳 *Rekening Pembayaran DP:*\n`;
    waText += `• Bank Mandiri: *1840011559968* (a.n. Mila Elmeida)\n\n`;
    waText += `Mohon info ketersediaan slot tanggal & arahan lebih lanjut. Terima kasih!`;

    const chosenAdmin = adminSelect ? adminSelect.value : "auto";
    const adminPhone = getAssignedAdmin(chosenAdmin);

    const encoded = encodeURIComponent(waText);
    window.open(`https://wa.me/${adminPhone}?text=${encoded}`, "_blank");
}

// Feature 3: Filter Ulasan Pengunjung Google
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
    const today = new Date().getDay(); // 0 = Minggu, 5 = Jumat, 6 = Sabtu
    const liveTagFri = document.getElementById("liveBadgeFri");
    const liveTagSat = document.getElementById("liveBadgeSat");
    const liveTagSun = document.getElementById("liveBadgeSun");
    const cardFri = document.getElementById("scheduleFri");
    const cardSat = document.getElementById("scheduleSat");
    const cardSun = document.getElementById("scheduleSun");

    if (today === 5) {
        if (liveTagFri) liveTagFri.style.display = "inline-flex";
        if (cardFri) cardFri.classList.add("highlight");
    } else if (today === 6) {
        if (liveTagSat) liveTagSat.style.display = "inline-flex";
        if (cardSat) cardSat.classList.add("highlight");
    } else if (today === 0) {
        if (liveTagSun) liveTagSun.style.display = "inline-flex";
        if (cardSun) cardSun.classList.add("highlight");
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


