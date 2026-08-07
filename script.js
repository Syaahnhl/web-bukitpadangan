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

// 1. FUNGSI KERANJANG BELANJA (CART)
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
    // Tombol aktif, klik langsung membuka halaman Kaching di tab baru.
    // Jika ada menu terpilih, kita bisa tampilkan toast info sederhana.
    if (cart.length > 0) {
        alert("Mengarahkan Tuan ke Menu Digital Kachingku. Silakan pilih kembali menu Anda di sana untuk pembayaran digital instan!");
    }
}

// 2. MODAL & RESERVASI HANDLERS
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

// 3. LOGIKA FILTER CATEGORY TABS
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

// 4. SUBMIT RESERVASI (FORM WA AUTO-GENERATE)
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

    // 📋 Format Rincian Menu Pre-order
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

// 5. NAVBAR MOBILE TOGGLE
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
