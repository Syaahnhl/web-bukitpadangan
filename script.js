// State Keranjang Belanja
let cart = [];

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
// 1. TOP PROMO BAR FUNCTION
// =========================================
function closePromoBar() {
    const promoBar = document.getElementById("promoBar");
    const navbar = document.querySelector(".navbar");
    if (promoBar) {
        promoBar.style.transform = "translateY(-100%)";
        setTimeout(() => {
            promoBar.style.display = "none";
            document.body.style.paddingTop = "70px"; // Adjust body padding
            if (navbar) navbar.style.top = "0"; // Move navbar to very top
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
    cartDrawer.classList.toggle("open");
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
}

function checkoutCart() {
    toggleCartDrawer();
    openModal();
}

// Menutup modal jika klik area luar
window.onclick = function (event) {
    if (event.target == modal) {
        closeModal();
    }
}

// =========================================
// 6. LOGIKA FILTER CATEGORY TABS
// =========================================
function filterMenu(category) {
    // Ganti class active pada tab button
    const buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
    
    // Cari button yang sesuai text/atributnya
    event.currentTarget.classList.add("active");

    const items = document.querySelectorAll(".menu-item");
    items.forEach(item => {
        const itemCategory = item.getAttribute("data-category");
        if (category === "semua" || itemCategory === category) {
            item.classList.add("show");
        } else {
            item.classList.remove("show");
        }
    });
}

// =========================================
// 7. SUBMIT RESERVASI (FORM WA AUTO-GENERATE)
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
📍 *Pilihan Area:* ${area}${preorderText}

Mohon konfirmasi ketersediaan meja untuk kami. Terima kasih!`;

    // Encode text untuk URL
    const encodedText = encodeURIComponent(waText);
    const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`;

    // Buka WhatsApp di tab baru
    window.open(waUrl, "_blank");

    // Bersihkan form & keranjang belanja
    document.getElementById("reservationForm").reset();
    cart = [];
    updateCartUI();
    closeModal();
}

// =========================================
// 8. NAVBAR MOBILE TOGGLE
// =========================================
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

    // Auto-close menu saat link diklik di mobile
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
        });
    });
}
