/**
 * main.js - Application Config, Master Initializer & Global Utilities
 * Warung Makan Bukit Padangan
 */

// WHATSAPP DYNAMIC LOAD BALANCER & ADMIN CONTACTS (SSOT)
const ADMIN_CONTACTS = {
    admin1: {
        id: 'admin1',
        name: 'Mila Elmeida (Kasir & Reservasi)',
        phoneRaw: '082323535747',
        phoneWa: '6282323535747',
        role: 'Layanan Reservasi Meja & Konfirmasi Kasir',
        greeting: 'Halo Admin 1 (Mila Elmeida)'
    },
    admin2: {
        id: 'admin2',
        name: 'Admin Operasional Resto',
        phoneRaw: '085290462715',
        phoneWa: '6285290462715',
        role: 'Informasi Menu, Paket Acara & Rute Lokasi',
        greeting: 'Halo Admin 2 (Operasional)'
    }
};

function getAssignedAdmin() {
    return ADMIN_CONTACTS.admin1;
}

function formatPhoneDisplay(phone) {
    if (!phone) return '';
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('08')) {
        return clean.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
    }
    return phone;
}

function formatRupiah(number) {
    return 'Rp ' + Number(number).toLocaleString('id-ID');
}

// INTEGRASI RESMI KACHING WEB ORDER
const KACHING_STORE_ID = 1;
const KACHING_ORDER_URL = `https://kaching.id/order/toko/${KACHING_STORE_ID}/public`;

function getKachingOrderUrl(tableNum) {
    let num = tableNum;
    if (!num && typeof selectedTable !== 'undefined' && selectedTable && selectedTable.number) {
        num = selectedTable.number;
    }
    if (num) {
        return `https://kaching.id/order/toko/${KACHING_STORE_ID}/meja/${num}`;
    }
    return `https://kaching.id/order/toko/${KACHING_STORE_ID}/public`;
}

function updateMenuOrderLinks() {
    const url = getKachingOrderUrl();
    const buttons = document.querySelectorAll('.btn-order-kaching');
    buttons.forEach(btn => {
        btn.href = url;
    });
}

function updateHeaderOffset() {
    const siteHeader = document.getElementById('siteHeader');
    if (siteHeader) {
        const h = siteHeader.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${h}px`);
        document.body.style.paddingTop = `${h}px`;
    }
}

window.addEventListener('resize', updateHeaderOffset);
window.addEventListener('DOMContentLoaded', updateHeaderOffset);
window.addEventListener('load', () => {
    updateHeaderOffset();
});

function closePromoBar() {
    const promoBar = document.getElementById('promoBar');
    if (promoBar) {
        promoBar.style.transform = 'translateY(-100%)';
        promoBar.style.opacity = '0';
        setTimeout(() => {
            promoBar.style.display = 'none';
            updateHeaderOffset();
        }, 300);
    }
}

function toggleNavMenu(forceState) {
    const navMenu = document.getElementById('navMenu');
    const navHamburger = document.getElementById('navHamburger');
    const navBackdrop = document.getElementById('navBackdrop');
    if (!navMenu || !navHamburger) return;

    const isActive = forceState !== undefined ? forceState : !navMenu.classList.contains('active');

    if (isActive) {
        navMenu.classList.add('active');
        navHamburger.classList.add('active');
        if (navBackdrop) navBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        navMenu.classList.remove('active');
        navHamburger.classList.remove('active');
        if (navBackdrop) navBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeNavMenu() {
    toggleNavMenu(false);
}

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
            const hTitle = document.getElementById("heroTitleText");
            const hSub = document.getElementById("heroSubtitleText");
            const hDesc = document.getElementById("heroDescText");
            if (hTitle && data.hero.title && hTitle.innerText !== data.hero.title) hTitle.innerText = data.hero.title;
            if (hSub && data.hero.subtitle && hSub.innerText !== data.hero.subtitle) hSub.innerText = data.hero.subtitle;
            if (hDesc && data.hero.desc && hDesc.innerText !== data.hero.desc) hDesc.innerText = data.hero.desc;
        }

        // 3. About Section
        if (data.about) {
            const aTitle = document.getElementById("aboutTitleText");
            const aDesc = document.getElementById("aboutDescText");
            const expectedTitle = data.about.title || "Suasana Alam & Rasa Otentik";
            if (aTitle && aTitle.innerText !== expectedTitle) aTitle.innerText = expectedTitle;
            if (aDesc && data.about.desc && aDesc.innerText !== data.about.desc) aDesc.innerText = data.about.desc;
        }

        // 4. Event Section
        const eventSection = document.getElementById("event");
        const navEventLink = document.getElementById("navEventLink");
        if (data.event) {
            const eTitle = document.getElementById("eventTitleText");
            const eDesc = document.getElementById("eventDescText");
            if (eTitle && data.event.title && eTitle.innerText !== data.event.title) eTitle.innerText = data.event.title;
            if (eDesc && data.event.desc && eDesc.innerText !== data.event.desc) eDesc.innerText = data.event.desc;
            if (data.event.show !== false) {
                if (eventSection) eventSection.style.display = "block";
                if (navEventLink) navEventLink.style.display = "block";
            }
        }

        // 5. Contacts & Social Media
        if (data.contacts) {
            waAdminNumber = data.contacts.wa_admin1;
            if (typeof ADMIN_CONTACTS !== 'undefined') {
                if (ADMIN_CONTACTS.admin1) ADMIN_CONTACTS.admin1.phone = data.contacts.wa_admin1;
                if (ADMIN_CONTACTS.admin2 && data.contacts.wa_admin2) ADMIN_CONTACTS.admin2.phone = data.contacts.wa_admin2;
            }

            // Update input / dropdown value di form
            const resAdminSelect = document.getElementById("resAdmin");
            if (resAdminSelect) {
                if (resAdminSelect.tagName === "SELECT") {
                    resAdminSelect.innerHTML = `<option value="${data.contacts.wa_admin1}">Admin 1 (${formatPhoneDisplay(data.contacts.wa_admin1)})</option>`;
                }
                resAdminSelect.value = data.contacts.wa_admin1;
            }

            // Update footer & location
            if (document.getElementById("waAdmin1Text")) document.getElementById("waAdmin1Text").innerText = formatPhoneDisplay(data.contacts.wa_admin1);
            if (document.getElementById("waAdmin2Text") && data.contacts.wa_admin2) document.getElementById("waAdmin2Text").innerText = formatPhoneDisplay(data.contacts.wa_admin2);
            if (document.getElementById("waFooterAdmin1Link")) document.getElementById("waFooterAdmin1Link").href = `https://wa.me/${data.contacts.wa_admin1}`;
            if (document.getElementById("waFooterAdmin2Link") && data.contacts.wa_admin2) document.getElementById("waFooterAdmin2Link").href = `https://wa.me/${data.contacts.wa_admin2}`;
            if (document.getElementById("waAdminNumberText")) document.getElementById("waAdminNumberText").innerText = formatPhoneDisplay(data.contacts.wa_admin1);
            if (document.getElementById("igFooterLink")) document.getElementById("igFooterLink").href = data.contacts.instagram;
            if (document.getElementById("fbFooterLink")) document.getElementById("fbFooterLink").href = data.contacts.facebook;
            if (document.getElementById("tiktokFooterLink") && data.contacts.tiktok) document.getElementById("tiktokFooterLink").href = data.contacts.tiktok;
        }

    } catch (err) {
        console.error("Gagal meload konten dinamis:", err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadDynamicContent();
    if (typeof loadMenuData === 'function') loadMenuData();
    if (typeof loadGalleryData === 'function') loadGalleryData();
    if (typeof loadTablesData === 'function') loadTablesData();
    if (typeof initOperatingHoursStatus === 'function') initOperatingHoursStatus();
    if (typeof initFaqAccordion === 'function') initFaqAccordion();
    if (typeof initFeaturesCarousel === 'function') initFeaturesCarousel();
    if (typeof initAmenitiesCarousel === 'function') initAmenitiesCarousel();
    if (typeof initPackagesCarousel === 'function') initPackagesCarousel();
    if (typeof initGalleryCarousel === 'function') initGalleryCarousel();
    if (typeof initPhotospotsCarousel === 'function') initPhotospotsCarousel();
    if (typeof updatePackageCalc === 'function') updatePackageCalc();
    if (typeof updateMenuOrderLinks === 'function') updateMenuOrderLinks();
    if (typeof initWeatherWidget === 'function') initWeatherWidget();
    if (typeof initLiveMusicSchedule === 'function') initLiveMusicSchedule();
    if (typeof initReviewsCarousel === 'function') initReviewsCarousel();

    const menuBookModal = document.getElementById('menuBookModal');
    if (menuBookModal) {
        menuBookModal.addEventListener('click', (e) => {
            if (e.target === menuBookModal && typeof closeMenuBookModal === 'function') closeMenuBookModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (typeof closeMenuBookModal === 'function') closeMenuBookModal();
            if (typeof closeModal === 'function') closeModal();
        }
    });
});
