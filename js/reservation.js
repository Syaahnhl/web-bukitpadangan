/**
 * reservation.js - Modal Reservation & Zero-DP WhatsApp Generator
 * Warung Makan Bukit Padangan
 */

function getReservationModal() {
    return document.getElementById("reservationModal");
}

function openModal(event) {
    if (event) event.preventDefault();
    if (typeof closeCartDrawer === "function") closeCartDrawer();
    const modal = getReservationModal();
    if (modal) {
        modal.style.display = "flex";
        // Focus first input for keyboard accessibility
        setTimeout(() => {
            const nameInput = document.getElementById("resName");
            if (nameInput) nameInput.focus();
        }, 100);
    }
    document.body.style.overflow = "hidden";
}

function closeModal() {
    const modal = getReservationModal();
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
}

// Backdrop click to close reservation modal (works even when modal is injected asynchronously)
document.addEventListener("click", (e) => {
    const modal = getReservationModal();
    if (modal && e.target === modal) closeModal();
});

// Global escape key handler
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Esc") {
        const modal = getReservationModal();
        if (modal && modal.style.display === "flex") {
            closeModal();
        }
    }
});

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

    waText += `🍽️ *Catatan Pesanan:*
`;
    waText += `• Reservasi Meja Saja (Bebas DP)
`;
    waText += `• Pemesanan hidangan makanan & minuman akan kami pilih dan pesan langsung di tempat / kasir saat tiba.

`;
    waText += `Mohon konfirmasi ketersediaan slot meja tersebut ya Admin. Terima kasih!`;

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

