/**
 * features.js - Weather Widget, Live Music, Packages & FAQ
 * Warung Makan Bukit Padangan
 */
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

// Feature 1: Menu Book Modal (Katalog Lengkap & Cetak) & Direct PDF Download
function downloadMenuPdf(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
    }
    const pdfPath = 'assets/pdf/buku-menu-bukit-padangan.pdf?v=' + Date.now();
    
    // Direct browser download
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = 'Buku-Menu-Bukit-Padangan.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Visual feedback on the trigger element
    if (e && e.currentTarget) {
        const btn = e.currentTarget;
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> <span>Mengunduh PDF...</span>';
        setTimeout(() => {
            btn.innerHTML = originalContent;
        }, 2500);
    }
}

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

            const descEl = document.getElementById("weatherMicroDesc");
            if (descEl) {
                if (code >= 51) {
                    descEl.textContent = "Hawa sejuk berkabut khas perbukitan, sangat nikmat untuk hidangan kuah hangat & kopi santan.";
                } else if (temp <= 25) {
                    descEl.textContent = "Hawa sejuk lereng perbukitan, sangat nyaman untuk makan santai di area lesehan & terapi ikan.";
                } else if (temp >= 29) {
                    descEl.textContent = "Suasana cerah lereng Gunungwungkal, waktu ideal menikmati es kopi segar & panorama perbukitan.";
                } else {
                    descEl.textContent = "Hawa sejuk perbukitan lereng Gunungwungkal, sangat nyaman untuk santap santai di area lesehan & outdoor.";
                }
            }
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
window.refreshWeatherData = () => refreshWeatherWidget(true);

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

