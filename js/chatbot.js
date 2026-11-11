/**
 * chatbot.js - AI Assistant Concierge & Natural Language Q&A
 * Warung Makan Bukit Padangan
 */
// ========================================================
// 15. FLOATING BOTTOM-RIGHT CHAT & AI ASSISTANT CONCIERGE
// ========================================================
let isAiChatOpen = false;
let isAiChatInitialized = false;

function toggleAiChat(forceOpen = null) {
    const chatWin = document.getElementById('aiChatWindow');
    const floatWidget = document.getElementById('floatingChatWidget');
    if (!chatWin) return;

    if (forceOpen !== null) {
        isAiChatOpen = forceOpen;
    } else {
        isAiChatOpen = !isAiChatOpen;
    }

    if (isAiChatOpen) {
        chatWin.style.display = 'flex';
        chatWin.setAttribute('aria-hidden', 'false');
        if (floatWidget) {
            floatWidget.style.display = 'none';
        }
        if (!isAiChatInitialized) {
            initAiChat();
        }
        setTimeout(() => {
            const input = document.getElementById('aiChatInput');
            if (input && window.innerWidth > 768) {
                input.focus();
            }
            scrollAiChatToBottom();
        }, 100);
    } else {
        chatWin.style.display = 'none';
        chatWin.setAttribute('aria-hidden', 'true');
        if (floatWidget) {
            floatWidget.style.display = 'flex';
        }
    }
}

function initAiChat() {
    isAiChatInitialized = true;
    const initialText = "Halo! Selamat datang di **Bukit Padangan Resto** 🍃\n" +
                        "Ada yang bisa saya bantu seputar rekomendasi menu, reservasi meja, atau paket rombongan? Anda juga bisa langsung terhubung ke WhatsApp Admin.";
    const initialActions = [
        { label: "🪑 Reservasi Meja", action: "scroll:#tables" },
        { label: "💬 Hubungi WA Admin", action: "func:openWaChooserModal" }
    ];
    appendAiMessage("bot", initialText, initialActions);
}

function scrollAiChatToBottom() {
    const msgContainer = document.getElementById('aiChatMessages');
    if (msgContainer) {
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }
}

function appendAiMessage(role, text, actions = []) {
    const msgContainer = document.getElementById('aiChatMessages');
    if (!msgContainer) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-msg ai-msg-${role}`;

    // Format Markdown-like basic bold & linebreaks
    let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

    let actionsHtml = '';
    if (actions && actions.length > 0) {
        actionsHtml = '<div class="ai-msg-actions">';
        actions.forEach(act => {
            const isWa = act.action && act.action.startsWith('wa');
            actionsHtml += `<button type="button" class="ai-btn-action ${isWa ? 'action-wa' : ''}" onclick="handleAiActionClick('${act.action}')">${act.label}</button>`;
        });
        actionsHtml += '</div>';
    }

    msgDiv.innerHTML = `
        <div class="ai-msg-bubble">
            ${formattedText}
            ${actionsHtml}
        </div>
    `;

    msgContainer.appendChild(msgDiv);
    scrollAiChatToBottom();
}

function showAiTypingIndicator() {
    const msgContainer = document.getElementById('aiChatMessages');
    if (!msgContainer) return null;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-msg ai-msg-bot';
    typingDiv.id = 'aiTypingIndicatorBubble';
    typingDiv.innerHTML = `
        <div class="ai-typing-indicator">
            <span class="ai-typing-dot"></span>
            <span class="ai-typing-dot"></span>
            <span class="ai-typing-dot"></span>
        </div>
    `;
    msgContainer.appendChild(typingDiv);
    scrollAiChatToBottom();
    return typingDiv;
}

function removeAiTypingIndicator() {
    const typingBubble = document.getElementById('aiTypingIndicatorBubble');
    if (typingBubble) {
        typingBubble.remove();
    }
}

function handleAiChipClick(chipText) {
    if (!isAiChatOpen) {
        toggleAiChat(true);
    }
    const input = document.getElementById('aiChatInput');
    if (input) {
        input.value = chipText;
        handleAiChatSubmit(new Event('submit'));
    }
}

let pendingWaContext = '';

function openWaChooserModal(context = '') {
    pendingWaContext = context || '';
    const modal = document.getElementById('aiWaChooserModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeWaChooserModal() {
    const modal = document.getElementById('aiWaChooserModal');
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }
}

function directToWaAdmin(phone, adminLabel) {
    let msg = `Halo ${adminLabel} Bukit Padangan, saya ingin konsultasi info resto dan reservasi.`;
    if (pendingWaContext === 'wa:menu') {
        msg = `Halo ${adminLabel} Bukit Padangan, saya ingin bertanya seputar rekomendasi menu andalan dan pemesanan.`;
    } else if (pendingWaContext === 'wa:paket') {
        msg = `Halo ${adminLabel} Bukit Padangan, saya ingin konsultasi kustom paket acara rombongan (reuni/rapat/arisan/gathering).`;
    } else if (pendingWaContext === 'wa:meja') {
        msg = `Halo ${adminLabel} Bukit Padangan, saya ingin reservasi meja dan memastikan ketersediaan tempat.`;
    } else if (pendingWaContext === 'wa:dp') {
        msg = `Halo ${adminLabel} Bukit Padangan, saya ingin konfirmasi transfer pembayaran DP reservasi meja.`;
    } else if (pendingWaContext === 'wa:rute') {
        msg = `Halo ${adminLabel} Bukit Padangan, mohon panduan rute dan info parkir bus menuju Bukit Padangan.`;
    }
    closeWaChooserModal();
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

window.openWaChooserModal = openWaChooserModal;
window.closeWaChooserModal = closeWaChooserModal;
window.directToWaAdmin = directToWaAdmin;

function handleAiActionClick(actionStr) {
    if (!actionStr) return;

    if (actionStr.startsWith('chip:')) {
        const text = actionStr.replace('chip:', '');
        handleAiChipClick(text);
    } else if (actionStr.startsWith('scroll:')) {
        const targetId = actionStr.replace('scroll:', '');
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
        }
    } else if (actionStr.startsWith('func:')) {
        const funcName = actionStr.replace('func:', '');
        if (typeof window[funcName] === 'function') {
            window[funcName]();
        }
    } else if (actionStr.startsWith('external:')) {
        const url = actionStr.replace('external:', '');
        window.open(url, '_blank');
    } else if (actionStr.startsWith('wa')) {
        if (actionStr === 'wa:admin1' || actionStr === 'wa:mila') {
            directToWaAdmin('6282323535747', 'Admin 1');
        } else if (actionStr === 'wa:admin2' || actionStr === 'wa:bukhori') {
            directToWaAdmin('6285290462715', 'Admin 2');
        } else {
            // Sebelum direct ke WA, buka pilihan 2 nomor WA
            openWaChooserModal(actionStr);
        }
    }
}

function handleAiChatSubmit(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('aiChatInput');
    if (!input) return;

    const rawText = input.value.trim();
    if (!rawText) return;

    input.value = '';
    appendAiMessage('user', rawText);

    showAiTypingIndicator();

    setTimeout(() => {
        removeAiTypingIndicator();
        const botResponse = generateAiKnowledgeResponse(rawText);
        appendAiMessage('bot', botResponse.text, botResponse.actions);
    }, 450);
}

function generateAiKnowledgeResponse(query) {
    const raw = (query || "").trim();
    const q = raw.toLowerCase();

    if (!q) {
        return {
            text: "Ada yang bisa saya bantu seputar Warung Makan Bukit Padangan? Silakan pilih topik di bawah ini:",
            actions: [
                { label: "🍛 Menu Favorit", action: "chip:Rekomendasi Menu Favorit" },
                { label: "🪑 Reservasi Meja", action: "scroll:#tables" },
                { label: "⏰ Jam & Lokasi", action: "chip:Jam Buka & Lokasi" },
                { label: "💬 WhatsApp Admin", action: "func:openWaChooserModal" }
            ]
        };
    }

    // 1. Terima Kasih & Penutup Sopan
    if (/^(makasih|terima kasih|suwun|matursuwun|thank|thanks|ok|oke|siap|baik|sip|mantap|yoi|keren)/i.test(q)) {
        return {
            text: "Sama-sama! Senang bisa membantu Anda di **Warung Makan Bukit Padangan** 🍃\n\nJika ada hal lain yang ingin ditanyakan seputar menu, reservasi, atau kunjungan Anda, silakan tanyakan kapan saja.",
            actions: [
                { label: "🍛 Menu Andalan", action: "scroll:#menu" },
                { label: "🪑 Reservasi Meja", action: "scroll:#tables" },
                { label: "💬 Hubungi Admin WA", action: "func:openWaChooserModal" }
            ]
        };
    }

    // 2. Salam & Sapaan Awal
    if (/^(halo|hai|hi|hey|assalam|pagi|siang|sore|malam|permisi|tes|test|halo bot|halo min|halo admin)/i.test(q)) {
        return {
            text: "Halo! Selamat datang di asisten virtual **Warung Makan Bukit Padangan** 🍃\n\nAda yang bisa saya bantu untuk kunjungan Anda? Anda dapat menanyakan rekomendasi menu, jam operasional, rute lokasi lereng Muria, fasilitas, atau reservasi meja & paket acara.",
            actions: [
                { label: "🍛 Menu Favorit", action: "chip:Rekomendasi Menu Favorit" },
                { label: "🪑 Booking Meja", action: "scroll:#tables" },
                { label: "⏰ Jam Buka & Lokasi", action: "chip:Jam Buka & Lokasi" },
                { label: "💬 Chat Admin WA", action: "func:openWaChooserModal" }
            ]
        };
    }

    // 3. Menu, Makanan, Minuman, Harga, Rekomendasi, Pedas, Halal
    if (/(menu|makan|minum|katalog|harga|favorit|spesial|enak|rekomendasi|hidangan|lauk|masakan|pedas|sambal|ayam|bebek|ikan|gurame|nila|ingkung|bledos|madu|bakar|goreng|mendoan|tahu|tempe|lalapan|kopi|kopi muria|wedang|rempah|jahe|jus|kelapa|es kelapa|teh|jeruk|halal|higienis)/i.test(q)) {
        return {
            text: "Berikut sajian **menu andalan & favorit** di Warung Makan Bukit Padangan:\n\n" +
                  "🔥 **Ayam Bledos & Bebek Bledos** (Rp 26k - 32k): Diracik dengan bumbu rempah pedas khas meresap, pedas gurih mantap!\n" +
                  "🍯 **Ayam & Nila Bakar Madu** (Rp 26k - 28k): Gurih manis legit meresap, favorit keluarga & anak-anak.\n" +
                  "🐟 **Gurame Asam Manis / Gurame Bakar** (Rp 45k - 55k): Ikan segar ukuran pas untuk dinikmati bersama.\n" +
                  "👑 **Ayam Ingkung Komplit** (Rp 175k): 1 ekor ayam kampung utuh empuk bumbu rempah komplit sambal & lalapan.\n" +
                  "🍘 **Mendoan & Camilan Tradisional** (Rp 10k - 15k): Renyah hangat cocok dinikmati di tengah hawa perbukitan sejuk.\n" +
                  "☕ **Kopi Muria Gula Aren & Wedang Rempah** (Rp 12k - 15k): Hangat khas lereng pegunungan Muria.\n" +
                  "🥥 **Es Kelapa Muda Jeruk & Aneka Jus Buah Segar** (Rp 16k - 18k).\n\n" +
                  "✅ *Semua makanan & minuman 100% Halal, higienis, dan diolah dari bahan segar pilihan.*",
            actions: [
                { label: "🍽️ Buka Menu Lengkap", action: "scroll:#menu" },
                { label: "💬 Pesan / Tanya Menu WA", action: "wa:menu" }
            ]
        };
    }

    // 4. Jam Buka, Jam Operasional & Hari Buka
    if (/(jam|buka|tutup|operasional|hari|libur|jadwal|wib|buka jam|tutup jam|hari apa|minggu buka|tanggal merah)/i.test(q)) {
        return {
            text: "⏰ **Jam Operasional Warung Makan Bukit Padangan:**\n\n" +
                  "• **Buka Setiap Hari**: Pukul **11.00 – 22.00 WIB** (Senin s/d Minggu)\n" +
                  "• Hari libur nasional & tanggal merah **tetap buka normal**.\n\n" +
                  "🌅 **Waktu Favorit Berkunjung:**\n" +
                  "• **Makan Siang (11.30 – 14.30 WIB)**: Suasana alam asri sejuk bersama keluarga atau rekan kerja.\n" +
                  "• **Golden Hour (16.30 – 17.45 WIB)**: Paling favorit untuk menikmati pemandangan matahari terbenam (sunset) di lereng Muria.",
            actions: [
                { label: "🪑 Reservasi Meja", action: "scroll:#tables" },
                { label: "📍 Rute & Lokasi", action: "scroll:#about" },
                { label: "💬 Tanya Jadwal via WA", action: "wa" }
            ]
        };
    }

    // 5. Lokasi, Alamat, Rute, Patokan & Akses Bus / Kendaraan
    if (/(lokasi|alamat|dimana|posisi|rute|arah|jalan|patokan|daerah|wilayah|maps|google maps|gmap|akses|bus|rombongan bus|kendaraan|mobil|gunungwungkal|gulangpongge|pati|muria)/i.test(q)) {
        return {
            text: "📍 **Alamat & Akses Warung Makan Bukit Padangan:**\n\n" +
                  "Jl. Raya Gunungwungkal - Gulangpongge, Kec. Gunungwungkal, Kab. Pati, Jawa Tengah (kawasan lereng Pegunungan Muria yang sejuk & hijau).\n\n" +
                  "🚗 **Akses Kendaraan & Parkir:**\n" +
                  "• Akses jalan aspal mulus dan aman dilalui oleh motor, mobil keluarga, hingga **bus pariwisata medium**.\n" +
                  "• Area parkir kami sangat luas, aman, dan gratis untuk kendaraan rombongan.",
            actions: [
                { label: "🗺️ Buka Google Maps", action: "external:https://maps.google.com/?q=Bukit+Padangan+Resto+Pati" },
                { label: "💬 Panduan Rute via WA", action: "wa:rute" }
            ]
        };
    }

    // 6. Fasilitas (Mushola, Toilet, Wifi, Colokan, Playground, Terapi Ikan)
    if (/(fasilitas|toilet|kamar mandi|wc|mushola|musala|sholat|solat|wudhu|wifi|internet|colokan|listrik|stopkontak|charger|anak|playground|bermain|kolam|terapi ikan|ikan|saung|gazebo|lesehan|smoking|merokok)/i.test(q)) {
        return {
            text: "🍃 **Fasilitas Lengkap di Warung Makan Bukit Padangan:**\n\n" +
                  "• 🕌 **Mushola Bersih**: Nyaman, lengkap dengan sarana wudhu yang jernih, sajadah & mukena.\n" +
                  "• 🚻 **Toilet Higienis**: Tersedia di beberapa titik strategis resto.\n" +
                  "• 🐟 **Kolam Terapi Ikan Alami**: Santai merendam kaki di pinggir saung gazebo sembari menikmati hidangan.\n" +
                  "• 🛝 **Mini Playground**: Area bermain aman untuk anak-anak.\n" +
                  "• 📶 **Wi-Fi Gratis & Colokan Listrik**: Tersedia stopkontak di area meja/saung santap.\n" +
                  "• 🅿️ **Parkir Luas**: Aman untuk motor, mobil, dan bus rombongan.",
            actions: [
                { label: "🪑 Pilih Meja Saung", action: "scroll:#tables" },
                { label: "💬 Tanya Fasilitas WA", action: "wa" }
            ]
        };
    }

    // 7. Spot Foto & Sunset
    if (/(spot foto|foto|estetik|pemandangan|view|panorama|sunset|senja|matahari terbenam|alam|sawah|bukit)/i.test(q)) {
        return {
            text: "📸 **Spot Foto & Panorama Alam Bukit Padangan:**\n\n" +
                  "• 🌅 **Sunset Deck Lereng Muria**: Waktu terbaik pukul **16.30 – 17.45 WIB** dengan panorama langit senja dan hamparan sawah.\n" +
                  "• 🎋 **Saung Gazebo Bambu di Atas Kolam**: Nuansa tradisional asri diiringi gemericik air kolam terapi ikan.\n" +
                  "• 🌿 **Pelataran Alam Terbuka**: Udara sejuk pegunungan cocok untuk berfoto bersama keluarga maupun komunitas.",
            actions: [
                { label: "🪑 Reservasi Meja Sunset", action: "scroll:#tables" },
                { label: "🍽️ Lihat Menu Lengkap", action: "scroll:#menu" }
            ]
        };
    }

    // 8. Live Music & Hiburan
    if (/(live music|musik|akustik|band|hiburan|lagu|nyanyi|malam minggu|sabtu malam)/i.test(q)) {
        return {
            text: "🎶 **Live Music Akustik Bukit Padangan:**\n\n" +
                  "• **Jadwal**: Setiap **Malam Minggu (Sabtu Malam)** pukul **19.00 – 21.30 WIB**\n" +
                  "• **Aliran Musik**: Akustik Nostalgia, Tembang Kenangan, Pop Indo & Senandung Senja\n" +
                  "• Suasana hangat dan syahdu menemani santap malam Anda bersama pasangan, keluarga, atau kawan.",
            actions: [
                { label: "🪑 Booking Meja Malam Minggu", action: "scroll:#tables" },
                { label: "💬 Chat Admin WA", action: "wa" }
            ]
        };
    }

    // 9. Paket Acara, Rombongan, Reuni, Rapat, Arisan, Bukber, Ultah, Sound System
    if (/(paket|rombongan|acara|reuni|rapat|dinas|kantor|arisan|bukber|buka bersama|ultah|ulang tahun|syukuran|gathering|komunitas|sound|mic|sound system|kapasitas|kustom|custom|bawa kue)/i.test(q)) {
        return {
            text: "🎉 **Paket Acara & Rombongan 100% Kustom:**\n\n" +
                  "Warung Makan Bukit Padangan siap melayani berbagai acara (kapasitas 20 hingga 200+ orang), seperti reuni, rapat dinas/kantor, arisan, buka bersama, maupun ulang tahun:\n\n" +
                  "• **Bebas Kustom Menu & Budget**: Sesuaikan menu lauk & minuman dengan anggaran per orang (misal Rp 25k, Rp 35k, atau Rp 50k+ per pax).\n" +
                  "• **Gratis Fasilitas**: Sound system wireless & mic untuk sambutan acara.\n" +
                  "• Diperbolehkan membawa kue ulang tahun sendiri dari luar.\n" +
                  "• Pilihan area luas: saung gazebo lesehan atau meja kursi panjang terpadu.",
            actions: [
                { label: "🎉 Hitung di Kalkulator Paket", action: "scroll:#packages" },
                { label: "💬 Konsultasi WA Rombongan", action: "wa:paket" }
            ]
        };
    }

    // 10. Meja, Reservasi, Booking & Denah
    if (/(meja|reservasi|booking|pesan tempat|pesan meja|denah|3d|outdoor|indoor|saung|gazebo|lesehan|kursi)/i.test(q)) {
        return {
            text: "🪑 **Pilihan Zona Meja di Bukit Padangan:**\n\n" +
                  "• **Gazebo Saung Kolam**: Suasana lesehan sejuk tepat di atas kolam terapi ikan alami.\n" +
                  "• **Indoor Utama & Sayap Musik**: Nyaman, dekat panggung akustik, sangat pas untuk acara formal atau rombongan keluarga.\n" +
                  "• **Outdoor Deck Alam**: Bersantap di udara terbuka dengan pemandangan langsung lereng bukit dan sawah.",
            actions: [
                { label: "🪑 Pilih Meja Interaktif", action: "scroll:#tables" },
                { label: "💬 Tanya Meja via WA", action: "wa:meja" }
            ]
        };
    }

    // 11. Pembayaran di Kasir (QRIS/Cash/Mandiri) & Reservasi Bebas DP
    if (/(dp|down payment|uang muka|bayar|transfer|rekening|mandiri|bank|qris|cash|tunai|kartu|metode)/i.test(q)) {
        return {
            text: `💳 **Ketentuan Reservasi & Pembayaran:**

• **Bebas DP**: Reservasi meja di Bukit Padangan **tanpa uang muka (bebas DP)**. Tamu cukup booking meja via WhatsApp, lalu memesan hidangan langsung di tempat.
• **Metode di Kasir**: Menerima pembayaran Tunai (Cash), Transfer Bank Mandiri, dan QRIS di kasir Kaching POS.`,
            actions: [
                { label: "🪑 Reservasi Meja", action: "scroll:#tables" },
                { label: "📖 Lihat Buku Menu", action: "func:openMenuBookModal" }
            ]
        };
    }
    // 12. Kontak Admin WhatsApp Langsung
    if (/(wa|whatsapp|kontak|admin|nomor|telepon|cs|hubungi|chat)/i.test(q)) {
        return {
            text: "Silakan hubungi kontak WhatsApp Admin Bukit Padangan:\n\n" +
                  "• 📱 **Admin 1**: `0823-2353-5747`\n" +
                  "• 📱 **Admin 2**: `0852-9046-2715`",
            actions: [
                { label: "📱 Chat Admin 1", action: "wa:admin1" },
                { label: "📱 Chat Admin 2", action: "wa:admin2" },
                { label: "💬 Buka Pilihan Admin", action: "func:openWaChooserModal" }
            ]
        };
    }

    // =========================================
    // OUT OF TOPIC (OOT) / DI LUAR BUKIT PADANGAN
    // =========================================
    return {
        text: "Maaf, saya tidak diprogram untuk menjawab itu. 🙏\n\n" +
              "Saya adalah asisten virtual resmi **Warung Makan Bukit Padangan** dan hanya dapat membantu informasi seputar resto kami, seperti rekomendasi menu, jam operasional, rute lokasi, fasilitas, reservasi meja, dan paket acara.",
        actions: [
            { label: "🍛 Menu & Harga", action: "scroll:#menu" },
            { label: "🪑 Reservasi Meja", action: "scroll:#tables" },
            { label: "📍 Rute & Lokasi", action: "scroll:#about" },
            { label: "💬 Hubungi Admin WA", action: "func:openWaChooserModal" }
        ]
    };
}


