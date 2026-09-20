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
                    ${badgeHtml}
                </div>
                <div class="menu-info">
                    <h4>${item.name}</h4>
                    <p>${item.desc}</p>
                    <div class="menu-footer">
                        <span class="menu-price">${priceFormatted}</span>
                        <span class="menu-tag-signature"><i class="fas fa-star"></i> Pilihan</span>
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
    waText += `• Jumlah Tamu: ${guests} Orang
`;
    waText += `• Area Pilihan: ${area}
`;
    waText += `• Pilihan Meja: *${tableText}*

`;
    waText += `💳 *Ketentuan & Konfirmasi DP:*
`;
    waText += `• Rekening: Bank Mandiri 1840011559968 (a.n. Mila Elmeida)
`;
    waText += `• Batas Konfirmasi Hari-H: Maksimal 14.00 WIB

`;
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

    if (!paxRange || !packageSelect) return;

    const pax = parseInt(paxRange.value, 10) || 25;
    const pkgPrice = parseInt(packageSelect.value, 10) || 45000;
    const isMusic = addonMusic ? addonMusic.checked : false;

    const foodCost = pax * pkgPrice;
    const musicCost = isMusic ? 300000 : 0;
    const discountRate = pax >= 30 ? 0.05 : 0;
    const discountVal = Math.round(foodCost * discountRate);
    const grandTotal = foodCost + musicCost - discountVal;

    // Update DOM
    const paxValBadge = document.getElementById("calcPaxVal");
    if (paxValBadge) paxValBadge.textContent = `${pax} Orang`;

    const summaryPaxText = document.getElementById("summaryPaxText");
    if (summaryPaxText) summaryPaxText.textContent = pax;

    const summaryFoodCost = document.getElementById("summaryFoodCost");
    if (summaryFoodCost) summaryFoodCost.textContent = formatRupiah(foodCost);

    const summaryAddonCost = document.getElementById("summaryAddonCost");
    if (summaryAddonCost) summaryAddonCost.textContent = formatRupiah(musicCost);

    const summaryDiscountRow = document.getElementById("summaryDiscountRow");
    const summaryDiscountVal = document.getElementById("summaryDiscountVal");
    const calcDiscountTag = document.getElementById("calcDiscountTag");

    if (discountVal > 0) {
        if (summaryDiscountRow) summaryDiscountRow.style.display = "flex";
        if (summaryDiscountVal) summaryDiscountVal.textContent = `- ${formatRupiah(discountVal)}`;
        if (calcDiscountTag) {
            calcDiscountTag.textContent = "Diskon Rombongan 5%";
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
}

function sendPackageCalcToWA() {
    const paxRange = document.getElementById("calcPaxRange");
    const packageSelect = document.getElementById("calcPackageSelect");
    const addonMusic = document.getElementById("calcAddonMusic");

    const pax = paxRange ? paxRange.value : "25";
    const pkgName = packageSelect ? packageSelect.options[packageSelect.selectedIndex].text : "Paket Acara";
    const isMusic = addonMusic && addonMusic.checked ? "Ya (+Rp 300.000)" : "Tidak";
    const grandTotal = document.getElementById("summaryGrandTotal") ? document.getElementById("summaryGrandTotal").textContent : "Rp 0";

    let waText = `Halo Admin Bukit Padangan, saya ingin mengajukan Konsultasi Paket Rombongan:\n\n`;
    waText += `📋 *Pilihan Paket:* ${pkgName}\n`;
    waText += `👥 *Estimasi Peserta:* ${pax} Orang\n`;
    waText += `🎸 *Add-on Live Music Akustik:* ${isMusic}\n`;
    waText += `💰 *Estimasi Total Biaya:* ${grandTotal}\n\n`;
    waText += `💳 *Informasi DP:*\n`;
    waText += `• Rekening: Bank Mandiri 1840011559968 (a.n. Mila Elmeida)\n`;
    waText += `• Batas Hari-H: Maksimal pukul 14.00 WIB\n\n`;
    waText += `Mohon konfirmasi ketersediaan tempat dan tanggal acara kami. Terima kasih!`;

    const encoded = encodeURIComponent(waText);
    window.open(`https://api.whatsapp.com/send?phone=6285290462715&text=${encoded}`, "_blank");
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
