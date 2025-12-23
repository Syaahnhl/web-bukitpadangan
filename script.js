// Mengambil elemen modal
const modal = document.getElementById("reservationModal");

// Fungsi untuk membuka Modal
function openModal(event) {
    if(event) event.preventDefault(); // Mencegah link melompat ke atas
    modal.style.display = "flex"; // Ubah display menjadi flex agar muncul
}

// Fungsi untuk menutup Modal
function closeModal() {
    modal.style.display = "none";
}

// Menutup modal jika user klik di luar kotak putih (area gelap)
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Tambahan: Logika untuk Menu Toggle di HP (Mobile Responsive)
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if(menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}