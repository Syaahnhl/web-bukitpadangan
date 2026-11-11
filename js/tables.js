/**
 * tables.js - 2D Floor Plan, Table Selection & Status Management
 * Warung Makan Bukit Padangan
 */

// Interactive floor plan logic
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
    
    let html = `<option value="">-- Bebas / Ditentukan Petugas Saat Datang --</option>`;
    tables.forEach(t => {
        const statusText = t.status === 'tersedia' ? 'Tersedia' : (t.status === 'terisi' ? 'Penuh' : 'Dipesan');
        let cleanName = t.name.replace(/\(.*?\)/g, "").trim();
        let cleanZone = (t.zoneName || t.area || "").replace(/\(.*?\)/g, "").trim();
        html += `<option value="${t.id}">${cleanName} • ${cleanZone} (${t.capacity} Kursi) - [${statusText}]</option>`;
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
        if (table.zone === "gazebo" || table.zone === "terapi") zoneIcon = "fa-fish";
        else if (table.zone === "outdoor") zoneIcon = "fa-cloud-sun";
        else if (table.zone === "vip") zoneIcon = "fa-store-alt";

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
        `table-${String(t.number).padStart(2, '0')}`.toLowerCase() === cleanId ||
        t.number === Number(tableId)
    );
    if (!table) return;

    activePreviewTableId = table.id;

    // Otomatiskan meja terpilih di state web (tanpa langsung buka form modal reservasi)
    selectThisTable(table.id, false);

    const modalImg = document.getElementById("tableModalImg");
    if (modalImg) modalImg.src = table.image || "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=800&auto=format&fit=crop";
    
    const modalTitle = document.getElementById("tableModalTitle");
    if (modalTitle) modalTitle.innerText = table.name;
    
    const modalZone = document.getElementById("tableModalZone");
    if (modalZone) modalZone.innerText = table.zoneName;
    
    const modalCapacity = document.getElementById("tableModalCapacity");
    if (modalCapacity) modalCapacity.innerText = `${table.capacity} Orang`;
    
    const modalDesc = document.getElementById("tableModalDesc");
    if (modalDesc) modalDesc.innerText = table.description;

    const statusBadge = document.getElementById("tableModalStatusBadge");
    if (statusBadge) {
        statusBadge.className = `table-status-pill ${table.status}`;
        statusBadge.innerText = table.status.toUpperCase();
    }

    const facilitiesContainer = document.getElementById("tableModalFacilities");
    if (facilitiesContainer) {
        facilitiesContainer.innerHTML = (table.facilities || []).map(f => `
            <span class="table-facility-chip"><i class="fas fa-check-circle" style="color: var(--primary-green);"></i> ${f}</span>
        `).join("");
    }

    // Tombol Kaching Web Order Meja (Otomatiskan nomor meja)
    const btnKaching = document.getElementById("btnOrderKachingTable");
    if (btnKaching) {
        btnKaching.href = getKachingOrderUrl(table.number);
        btnKaching.innerHTML = `<i class="fas fa-utensils"></i> Pesan Menu di ${table.name} (Kaching Web Order)`;
    }

    const btnSelect = document.getElementById("btnSelectThisTable");
    if (btnSelect) {
        if (table.status === "tersedia") {
            btnSelect.className = "btn-select-table";
            btnSelect.disabled = false;
            btnSelect.innerHTML = `<i class="fab fa-whatsapp"></i> Reservasi Jadwal Meja Ini`;
        } else {
            btnSelect.className = "btn-select-table disabled";
            btnSelect.disabled = true;
            btnSelect.innerHTML = `<i class="fas fa-ban"></i> Meja Sedang ${table.status.toUpperCase()}`;
        }
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
    selectThisTable(activePreviewTableId, true);
    closeTableModal();
}

function selectThisTable(tableId, shouldOpenModal = false) {
    const cleanId = String(tableId).toLowerCase().trim();
    const table = tablesData.find(t => 
        t.id.toLowerCase() === cleanId || 
        t.id.toLowerCase() === `t${cleanId.replace(/\D/g, '').padStart(2, '0')}` ||
        `table-${t.number}`.toLowerCase() === cleanId ||
        `table-${String(t.number).padStart(2, '0')}`.toLowerCase() === cleanId ||
        t.number === Number(tableId)
    );
    if (!table) return;

    selectedTable = table;

    // Update banner di atas grid denah meja
    const banner = document.getElementById("selectedTableBanner");
    const bannerName = document.getElementById("selectedTableBannerName") || document.getElementById("selectedBannerText");
    const bannerZone = document.getElementById("selectedTableBannerZone") || document.getElementById("selectedBannerZone");
    const bannerOrderBtn = document.getElementById("selectedBannerKachingBtn");
    if (banner) {
        if (bannerName) bannerName.innerText = table.name;
        if (bannerZone) bannerZone.innerText = `${table.zoneName} (${table.capacity} Kursi)`;
        if (bannerOrderBtn) {
            bannerOrderBtn.href = getKachingOrderUrl(table.number);
            bannerOrderBtn.innerHTML = `<i class="fas fa-utensils"></i> Pesan Menu di ${table.name}`;
        }
        banner.style.display = "flex";
    }

    // Update banner di seksi menu
    const bannerKachingBtn = document.getElementById("bannerKachingOrderBtn");
    if (bannerKachingBtn) {
        bannerKachingBtn.href = getKachingOrderUrl(table.number);
        bannerKachingBtn.innerHTML = `<i class="fas fa-utensils"></i> Pesan Menu di ${table.name} (Kaching Web Order)`;
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
        else if (table.zone === "gazebo" || table.zone === "terapi") areaSelect.value = "Area Terapi Ikan & Ramah Anak";
        else if (table.zone === "vip") {
            if (table.id.startsWith("IU")) areaSelect.value = "Indoor Utama (6x6 m)";
            else areaSelect.value = "Indoor Timur (Sayap 1 & 2)";
        }
    }

    // Hide redundant controls when table is selected from denah
    const tableGroup = document.getElementById("formTableSelectGroup");
    const areaGroup = document.getElementById("formAreaGroup");
    if (tableGroup) tableGroup.style.display = "none";
    if (areaGroup) areaGroup.style.display = "none";

    // Render ulang grid denah agar border .selected terpasang
    if (currentTableZone === "semua") {
        renderTablesGrid(tablesData);
    } else {
        renderTablesGrid(tablesData.filter(t => t.zone === currentTableZone));
    }

    // Sinkronkan seluruh tombol pesan di katalog ke nomor meja ini
    updateMenuOrderLinks();

    // Buka modal reservasi jika diminta
    if (shouldOpenModal) {
        openModal();
    }
}

function clearSelectedTable() {
    selectedTable = null;

    const banner = document.getElementById("selectedTableBanner");
    if (banner) banner.style.display = "none";

    const bannerKachingBtn = document.getElementById("bannerKachingOrderBtn");
    if (bannerKachingBtn) {
        bannerKachingBtn.href = getKachingOrderUrl();
        bannerKachingBtn.innerHTML = `<i class="fas fa-external-link-alt"></i> Buka Web Order Kaching`;
    }

    const formBadge = document.getElementById("formSelectedTableBadge");
    if (formBadge) formBadge.style.display = "none";

    const select = document.getElementById("resTableSelect");
    if (select) select.value = "";

    // Restore visibility of table dropdown and area when table cleared
    const tableGroup = document.getElementById("formTableSelectGroup");
    const areaGroup = document.getElementById("formAreaGroup");
    if (tableGroup) tableGroup.style.display = "";
    if (areaGroup) areaGroup.style.display = "";

    if (currentTableZone === "semua") {
        renderTablesGrid(tablesData);
    } else {
        renderTablesGrid(tablesData.filter(t => t.zone === currentTableZone));
    }

    updateMenuOrderLinks();
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

