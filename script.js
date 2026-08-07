// Mengambil elemen modal
const modal = document.getElementById("reservationModal");

// Fungsi untuk membuka Modal
function openModal(event) {
    if (event) event.preventDefault(); // Mencegah link melompat ke atas
    modal.style.display = "flex"; // Ubah display menjadi flex agar muncul
}

// Fungsi untuk menutup Modal
function closeModal() {
    modal.style.display = "none";
}

// Menutup modal jika user klik di luar kotak putih (area gelap)
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Tambahan: Logika untuk Menu Toggle di HP (Mobile Responsive)
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Tutup menu mobile ketika link diklik
const links = document.querySelectorAll('.nav-links a');
links.forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }
    });
});

// =========================================
// LOGIKA FILTER MENU
// =========================================
function filterMenu(category) {
    // Ganti class active pada tombol tab
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Cari tombol yang memicu event
    const clickedBtn = event.currentTarget;
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }

    // Filter item menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (category === 'semua' || itemCategory === category) {
            item.classList.add('show');
        } else {
            item.classList.remove('show');
        }
    });
}

// =========================================
// SUBMIT FORM RESERVASI DENGAN WA AUTO-TEXT
// =========================================
function submitReservation(event) {
    event.preventDefault(); // Stop reload page

    // Ambil data input
    const name = document.getElementById('resName').value;
    const dateInput = document.getElementById('resDate').value;
    const time = document.getElementById('resTime').value;
    const guests = document.getElementById('resGuests').value;
    const area = document.getElementById('resArea').value;
    const adminPhone = document.getElementById('resAdmin').value;

    // Format tanggal ke format Indonesia yang mudah dibaca
    const dateObj = new Date(dateInput);
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const formattedDate = dateObj.getDate() ? `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}` : dateInput;

    // Susun template text WhatsApp
    const message = 
`Halo Bukit Padangan, saya ingin melakukan reservasi meja:

*Detail Reservasi:*
• Nama : ${name}
• Tanggal : ${formattedDate}
• Jam : ${time} WIB
• Jumlah : ${guests} Orang
• Area Meja : ${area}

Apakah ada meja kosong pada waktu tersebut? Terima kasih.`;

    // Encode text untuk URL
    const encodedText = encodeURIComponent(message);

    // Buka WhatsApp API
    const waUrl = `https://api.whatsapp.com/send?phone=${adminPhone}&text=${encodedText}`;
    window.open(waUrl, '_blank');

    // Tutup modal setelah submit
    closeModal();
    
    // Reset form
    document.getElementById('reservationForm').reset();
}
