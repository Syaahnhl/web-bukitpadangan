// State Keranjang Belanja & Admin WA
let cart = [];
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
            if (document.getElementById("heroSubtitleText")) document.getElementById("heroSubtitleText").innerText = data.hero.subtitle;
            if (document.getElementById("heroDescText")) document.getElementById("heroDescText").innerText = data.hero.desc;
        }

        // 3. About Section
        if (data.about) {
            if (document.getElementById("aboutTitleText")) document.getElementById("aboutTitleText").innerText = data.about.title;
            if (document.getElementById("aboutDescText")) document.getElementById("aboutDescText").innerText = data.about.desc;
        }

        // 4. Event Section
        const eventSection = document.getElementById("event");
        const navEventLink = document.getElementById("navEventLink");
        if (data.event && data.event.show) {
            if (document.getElementById("eventTitleText")) document.getElementById("eventTitleText").innerText = data.event.title;
            if (document.getElementById("eventDescText")) document.getElementById("eventDescText").innerText = data.event.desc;
            if (eventSection) eventSection.style.display = "block";
            if (navEventLink) navEventLink.style.display = "block";
        } else {
            if (eventSection) eventSection.style.display = "none";
            if (navEventLink) navEventLink.style.display = "none";
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
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px 0;">Menu sedang diperbarui oleh Admin.</p>`;
        return;
    }

    grid.innerHTML = items.map(item => {
        const badgeHtml = item.badge ? `<span class="menu-badge">${item.badge}</span>` : '';
        const priceFormatted = formatRupiah(item.price);
        return `
            <div class="menu-item show" data-category="${item.category}" data-id="${item.id}">
                <div class="menu-img">
                    <img src="${item.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'}" alt="${item.name}">
                </div>
                <div class="menu-info">
                    ${badgeHtml}
                    <h4>${item.name}</h4>
                    <p>${item.desc}</p>
                    <div class="menu-footer">
                        <span class="menu-price">${priceFormatted}</span>
                        <button class="btn-add-cart" onclick="addToCart('${item.id}', '${item.name.replace(/'/g, "\\'")}', ${item.price})">
                            <i class="fas fa-plus"></i> Tambah
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
    updateCartUI();
});

// Elemen-elemen DOM
const modal = document.getElementById("reservationModal");
const cartDrawer = document.getElementById("cartDrawer");
const floatingCart = document.getElementById("floatingCart");
const cartCount = document.getElementById("cartCount");
const cartItemsList = document.getElementById("cartItemsList");
const cartSubtotal = document.getElementById("cartSubtotal");
const summaryItemsList = document.getElementById("summaryItemsList");
const formPreorderSummary = document.getElementById("formPreorderSummary");
const summaryTotal = document.getElementById("summaryTotal");
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
// 4. KERANJANG BELANJA (CART SYSTEM)
// =========================================
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    updateCartUI();
    
    // Auto-open drawer untuk memberi feedback ke user
    if (!cartDrawer.classList.contains("open")) {
        toggleCartDrawer();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function updateQty(id, delta) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCartUI();
        }
    }
}

function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);
}

function updateCartUI() {
    // Update Badge Count
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalCount;

    // Tampilkan/Sembunyikan Tombol Floating Cart jika kosong
    if (totalCount > 0) {
        floatingCart.style.display = "flex";
    } else {
        floatingCart.style.display = "none";
        if (cartDrawer.classList.contains("open")) {
            toggleCartDrawer();
        }
    }

    // Render items list di drawer
    if (cart.length === 0) {
        cartItemsList.innerHTML = `<p class="empty-cart-text">Keranjang masih kosong. Tambahkan hidangan dari menu!</p>`;
    } else {
        cartItemsList.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-details">
                    <h5>${item.name}</h5>
                    <span>${formatRupiah(item.price * item.quantity)}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="updateQty('${item.id}', -1)"><i class="fas fa-minus"></i></button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQty('${item.id}', 1)"><i class="fas fa-plus"></i></button>
                    </div>
                    <button class="btn-remove-item" onclick="removeFromCart('${item.id}')">
                        <i class="far fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `).join("");
    }

    // Update Subtotal
    cartSubtotal.innerText = formatRupiah(calculateTotal());
}

function toggleCartDrawer() {
    const isOpen = cartDrawer.classList.toggle("open");
    const floatingCart = document.querySelector(".floating-cart");
    if (isOpen) {
        document.body.style.overflow = "hidden";
        if (floatingCart) floatingCart.style.visibility = "hidden";
    } else {
        document.body.style.overflow = "";
        if (floatingCart && cart.length > 0) floatingCart.style.visibility = "visible";
    }
}

// Handler klik order via Kachingku
function handleKachingCheckout(event) {
    if (cart.length > 0) {
        alert("Mengarahkan Tuan ke Menu Digital Kachingku. Silakan pilih kembali menu Anda di sana untuk pembayaran digital instan!");
    }
}

// =========================================
// 5. MODAL & RESERVASI HANDLERS
// =========================================
function openModal(event) {
    if (event) event.preventDefault();
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    const floatingCart = document.querySelector(".floating-cart");
    if (floatingCart) floatingCart.style.visibility = "hidden";
    
    // Tampilkan Pre-order summary jika ada item
    if (cart.length > 0) {
        formPreorderSummary.style.display = "block";
        summaryItemsList.innerHTML = cart.map(item => `
            <div class="summary-item-line">
                <span>${item.name} x${item.quantity}</span>
                <span>${formatRupiah(item.price * item.quantity)}</span>
            </div>
        `).join("");
        summaryTotal.innerText = formatRupiah(calculateTotal());
    } else {
        formPreorderSummary.style.display = "none";
    }
}

function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "";
    const floatingCart = document.querySelector(".floating-cart");
    if (floatingCart && cart.length > 0) floatingCart.style.visibility = "visible";
}

function checkoutCart() {
    toggleCartDrawer();
    openModal();
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
        if (table.zone === "gazebo") zoneIcon = "fa-campground";
        else if (table.zone === "outdoor") zoneIcon = "fa-cloud-sun";
        else if (table.zone === "vip") zoneIcon = "fa-crown";

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
    const table = tablesData.find(t => t.id === tableId);
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
        const floatingCart = document.querySelector(".floating-cart");
        if (floatingCart) floatingCart.style.visibility = "hidden";
    }
}

function closeTableModal() {
    if (tableModal) {
        tableModal.style.display = "none";
        document.body.style.overflow = "";
        const floatingCart = document.querySelector(".floating-cart");
        if (floatingCart && cart.length > 0) floatingCart.style.visibility = "visible";
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
        if (table.zone === "gazebo") areaSelect.value = "Semi-Outdoor Gazebo";
        else if (table.zone === "outdoor") areaSelect.value = "Outdoor (Pemandangan Bukit)";
        else if (table.zone === "vip") areaSelect.value = "Indoor Cafe Modern";
    }

    // Render ulang grid denah agar border .selected terpasang
    if (currentTableZone === "semua") {
        renderTablesGrid(tablesData);
    } else {
        renderTablesGrid(tablesData.filter(t => t.zone === currentTableZone));
    }

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
// 7. LOGIKA FILTER CATEGORY TABS (MENU)
// =========================================
function filterMenu(category) {
    // Ganti class active pada tab button
    const buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
    }

    if (category === "semua") {
        renderMenuGrid(menuData);
    } else {
        const filtered = menuData.filter(item => item.category === category);
        renderMenuGrid(filtered);
    }
}

// =========================================
// 8. SUBMIT RESERVASI (FORM WA AUTO-GENERATE)
// =========================================
function submitReservation(event) {
    event.preventDefault();

    // Mengambil input data dari form
    const name = document.getElementById("resName").value;
    const dateInput = document.getElementById("resDate").value;
    const time = document.getElementById("resTime").value;
    const guests = document.getElementById("resGuests").value;
    const area = document.getElementById("resArea").value;
    const targetPhone = document.getElementById("resAdmin").value;

    // Nomor meja terpilih atau manual
    let tableText = "Bebas / Ditentukan Petugas";
    if (selectedTable) {
        tableText = `${selectedTable.name} (${selectedTable.zoneName})`;
    } else {
        const manualSelect = document.getElementById("resTableSelect");
        if (manualSelect && manualSelect.value) {
            const opt = manualSelect.options[manualSelect.selectedIndex];
            tableText = opt.text;
        }
    }

    // Format tanggal Indonesia (yyyy-mm-dd -> dd Month yyyy)
    const dateObj = new Date(dateInput);
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const formattedDate = dateObj.getDate() + " " + months[dateObj.getMonth()] + " " + dateObj.getFullYear();

    // Format Rincian Menu Pre-order
    let preorderText = "";
    if (cart.length > 0) {
        preorderText = "\n\n📋 *PRE-ORDER MENU:*";
        cart.forEach(item => {
            preorderText += `\n- ${item.name} (x${item.quantity}) : ${formatRupiah(item.price * item.quantity)}`;
        });
        preorderText += `\n*TOTAL PEMESANAN:* ${formatRupiah(calculateTotal())}`;
        preorderText += `\n_(Catatan: Pembayaran pre-order diselesaikan di kasir resto)_`;
    }

    // Menyusun Template Pesan WhatsApp
    const waText = `Halo Admin Bukit Padangan, saya ingin melakukan Reservasi Meja:

👤 *Nama:* ${name}
📅 *Tanggal:* ${formattedDate}
⏰ *Jam Kedatangan:* ${time} WIB
👥 *Jumlah Tamu:* ${guests} Orang
📍 *Pilihan Area:* ${area}
🪑 *Nomor Meja:* ${tableText}${preorderText}

Mohon konfirmasi ketersediaan meja untuk kami. Terima kasih!`;

    // Encode text untuk URL
    const encodedText = encodeURIComponent(waText);
    const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`;

    // Buka WhatsApp di tab baru
    window.open(waUrl, "_blank");

    // Bersihkan form, pilihan meja & keranjang belanja
    document.getElementById("reservationForm").reset();
    clearSelectedTable();
    cart = [];
    updateCartUI();
    closeModal();
}

// =========================================
// 8. NAVBAR MOBILE DRAWER & BACKDROP TOGGLE
// =========================================
function toggleNavMenu(forceState) {
    const navLinks = document.querySelector(".nav-links");
    const navBackdrop = document.getElementById("navBackdrop");
    if (!navLinks) return;

    const shouldOpen = (typeof forceState === "boolean") ? forceState : !navLinks.classList.contains("active");
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

const menuToggle = document.querySelector(".menu-toggle");
if (menuToggle) {
    menuToggle.addEventListener("click", () => toggleNavMenu());
}

// Auto-close menu saat link diklik di mobile
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        toggleNavMenu(false);
    });
});
