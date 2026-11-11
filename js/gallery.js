/**
 * gallery.js - Photo Documentation, Lightbox Zoom & Sliders
 * Warung Makan Bukit Padangan
 */

let publicGalleryData = [];

async function loadGalleryData() {
    try {
        const response = await fetch("gallery.json");
        if (!response.ok) return;
        publicGalleryData = await response.json();
        if (Array.isArray(publicGalleryData) && publicGalleryData.length > 0) {
            renderPublicGallery(publicGalleryData);
        }
    } catch (err) {
        console.warn("Gagal memuat gallery.json, menggunakan konten default:", err);
    }
}

function renderPublicGallery(items) {
    if (!items || items.length === 0) return;

    // 1. Render Foto Reuni & Paket Acara (#packagesTrack)
    const reuniItems = items.filter(i => i.category === "reuni");
    const packagesTrack = document.getElementById("packagesTrack");
    if (packagesTrack && reuniItems.length > 0) {
        packagesTrack.innerHTML = reuniItems.map(item => {
            const featuresHtml = Array.isArray(item.features) 
                ? item.features.map(f => `<li><i class="fas fa-check-circle"></i> <span>${escapeHtml(f)}</span></li>`).join("")
                : `<li><i class="fas fa-check-circle"></i> <span>${escapeHtml(item.desc || "")}</span></li>`;
            
            const waMsg = encodeURIComponent(item.waText || `Halo Admin Bukit Padangan, saya ingin konsultasi Paket Custom untuk acara ${item.title}. Boleh minta info fasilitas dan penawarannya?`);

            return `
                <div class="package-card" style="flex: 0 0 340px !important; min-width: 340px !important; max-width: 340px !important; scroll-snap-align: start !important;">
                    <div class="package-img-wrap">
                        <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.title)}" loading="lazy">
                        <span class="package-badge">${escapeHtml(item.badge || "Paket Acara")}</span>
                    </div>
                    <div class="package-body">
                        <h3>${escapeHtml(item.title)}</h3>
                        <p class="package-desc">${escapeHtml(item.desc || "")}</p>
                        <ul class="package-features">
                            ${featuresHtml}
                        </ul>
                        <a href="https://wa.me/${waAdminNumber}?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="btn-package">
                            Konsultasi Paket <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join("");
    }

    // 2. Render Pemandangan & Sunset (#photospotsTrack)
    const pemandanganItems = items.filter(i => i.category === "pemandangan");
    const photospotsTrack = document.getElementById("photospotsTrack");
    if (photospotsTrack && pemandanganItems.length > 0) {
        photospotsTrack.innerHTML = pemandanganItems.map(item => {
            return `
                <article class="photospot-card">
                    <div class="photospot-card-img-wrap">
                        <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.title)}" class="photospot-card-img" loading="lazy">
                        ${item.badge ? `<span class="photospot-time-badge"><i class="fas fa-clock"></i> ${escapeHtml(item.badge)}</span>` : ""}
                        ${item.zone ? `<span class="photospot-zone-badge">${escapeHtml(item.zone)}</span>` : ""}
                    </div>
                    <div class="photospot-card-content">
                        <h3 class="photospot-card-title">${escapeHtml(item.title)}</h3>
                        <p class="photospot-card-desc">${escapeHtml(item.desc || "")}</p>
                        ${item.tips ? `
                        <div class="photospot-card-tip">
                            <i class="fas fa-camera"></i>
                            <span><strong>Tip Foto:</strong> ${escapeHtml(item.tips)}</span>
                        </div>` : ""}
                        <a href="#reservasi" class="photospot-reserve-link" ${item.tableCode ? `onclick="selectSpotTable('${escapeHtml(item.tableCode)}')"` : ""}>Pesan Meja Area Ini <i class="fas fa-arrow-right"></i></a>
                    </div>
                </article>
            `;
        }).join("");
    }

    // 3. Render Galeri Suasana & Spot Foto (#galleryTrack)
    const galeriItems = items.filter(i => i.category === "galeri");
    const galleryTrack = document.getElementById("galleryTrack");
    if (galleryTrack && galeriItems.length > 0) {
        galleryTrack.innerHTML = galeriItems.map((item, idx) => {
            return `
                <div class="gallery-card gallery-item" onclick="openLightbox(${idx})" style="flex: 0 0 320px !important; min-width: 320px !important; max-width: 320px !important; scroll-snap-align: start !important;">
                    <div class="gallery-image-wrapper">
                        <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.title)}" loading="lazy">
                        ${item.badge ? `<span class="gallery-spot-badge"><i class="fas fa-star"></i> ${escapeHtml(item.badge)}</span>` : ""}
                        <div class="gallery-zoom-badge"><i class="fas fa-search-plus"></i></div>
                    </div>
                    <div class="gallery-card-content">
                        <h3 class="gallery-spot-name">${escapeHtml(item.title)}</h3>
                        <p class="gallery-spot-desc">${escapeHtml(item.desc || "")}</p>
                    </div>
                </div>
            `;
        }).join("");
    }
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

