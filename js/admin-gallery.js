        // TAB: GALERI & FOTO MANAGEMENT (REUNI, PEMANDANGAN, SUASANA)
                function escapeHtml(str) {
            if (!str) return "";
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        async function loadGalleryData() {
            try {
                const res = await fetch("gallery.json");
                if (res.ok) {
                    adminGallery = await res.json();
                } else {
                    adminGallery = [];
                }
            } catch (err) {
                console.warn("Gagal membaca gallery.json, inisialisasi array kosong:", err);
                adminGallery = [];
            }
            updateGalleryStats();
            applyGalleryFilter();
        }

        function updateGalleryStats() {
            const total = adminGallery.length;
            const countReuni = adminGallery.filter(i => i.category === 'reuni').length;
            const countPemandangan = adminGallery.filter(i => i.category === 'pemandangan').length;
            const countGaleri = adminGallery.filter(i => i.category === 'galeri').length;

            const badge = document.getElementById("galleryCountBadge");
            if (badge) badge.innerText = total;

            const countAllEl = document.getElementById("countAllGallery");
            if (countAllEl) countAllEl.innerText = total;

            const countReuniEl = document.getElementById("countReuniGallery");
            if (countReuniEl) countReuniEl.innerText = countReuni;

            const countPemandanganEl = document.getElementById("countPemandanganGallery");
            if (countPemandanganEl) countPemandanganEl.innerText = countPemandangan;

            const countGaleriEl = document.getElementById("countGaleriGallery");
            if (countGaleriEl) countGaleriEl.innerText = countGaleri;
        }

        function filterGalleryCategory(cat, btn) {
            currentGalleryCategoryFilter = cat;
            document.querySelectorAll(".category-filter-chips .chip-btn").forEach(b => {
                if (b.closest("#tab-gallery")) b.classList.remove("active");
            });
            if (btn) btn.classList.add("active");
            applyGalleryFilter();
        }

        function handleGallerySearch() {
            applyGalleryFilter();
        }

        function applyGalleryFilter() {
            const query = (document.getElementById("gallerySearchInput")?.value || "").toLowerCase().trim();
            filteredGallery = adminGallery.filter(item => {
                const matchesCat = (currentGalleryCategoryFilter === "all") || (item.category === currentGalleryCategoryFilter);
                const matchesQuery = !query || 
                    (item.title && item.title.toLowerCase().includes(query)) ||
                    (item.desc && item.desc.toLowerCase().includes(query)) ||
                    (item.badge && item.badge.toLowerCase().includes(query));
                return matchesCat && matchesQuery;
            });
            renderGalleryCards();
        }

        function renderGalleryCards() {
            const container = document.getElementById("galleryCardsContainer");
            if (!container) return;

            if (filteredGallery.length === 0) {
                container.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1; padding: 40px 20px; text-align: center;">
                        <i class="fas fa-camera-retro" style="font-size: 2.5rem; color: var(--gold-primary); opacity: 0.5; margin-bottom: 12px;"></i>
                        <p style="color: #fff; font-weight: 600; margin-bottom: 4px;">Belum ada foto dalam kategori ini</p>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px;">Tambahkan foto baru untuk memperkaya dokumentasi Bukit Padangan.</p>
                        <button type="button" class="btn-secondary btn-success" onclick="openGalleryModal('add')">
                            <i class="fas fa-plus-circle"></i> Tambah Foto Baru
                        </button>
                    </div>
                `;
                return;
            }

            container.innerHTML = filteredGallery.map((item) => {
                const originalIndex = adminGallery.findIndex(g => g.id === item.id);
                let catBadgeLabel = "Galeri Suasana";
                let catBadgeClass = "galeri";
                if (item.category === "reuni") {
                    catBadgeLabel = "Reuni & Paket Acara";
                    catBadgeClass = "reuni";
                } else if (item.category === "pemandangan") {
                    catBadgeLabel = "Pemandangan & Sunset";
                    catBadgeClass = "pemandangan";
                }

                const imgSrc = item.img || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop";
                const badgePill = item.badge ? `<span class="gallery-admin-pill"><i class="fas fa-tag"></i> ${escapeHtml(item.badge)}</span>` : "";

                return `
                    <div class="gallery-admin-card" id="gallery-card-${item.id}">
                        <div class="gallery-admin-thumb-wrap">
                            <img src="${escapeHtml(imgSrc)}" class="gallery-admin-thumb" alt="${escapeHtml(item.title || '')}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop'">
                            <span class="gallery-admin-category-badge ${catBadgeClass}">${catBadgeLabel}</span>
                        </div>
                        <div class="gallery-admin-content">
                            <div>
                                <h4 class="gallery-admin-title">${escapeHtml(item.title || "Tanpa Judul")}</h4>
                                ${badgePill}
                                <p class="gallery-admin-desc">${escapeHtml(item.desc || "Tidak ada keterangan.")}</p>
                            </div>
                            <div class="gallery-admin-actions">
                                <button type="button" class="btn-table-action" style="flex: 1.2;" onclick="openGalleryModal('edit', ${originalIndex})">
                                    <i class="fas fa-camera"></i> Ganti Foto / Edit
                                </button>
                                <button type="button" class="btn-table-action btn-danger" style="flex: 0.6;" onclick="deleteGalleryItem(${originalIndex})">
                                    <i class="fas fa-trash-can"></i> Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join("");
        }

        function openGalleryModal(mode, idx = null) {
            const modal = document.getElementById("galleryModalOverlay");
            const headerTitle = document.getElementById("galleryModalHeaderTitle");
            const modeInput = document.getElementById("galleryModalMode");
            const idxInput = document.getElementById("galleryItemIndex");
            const idInput = document.getElementById("galleryItemId");
            const catSelect = document.getElementById("galleryCategory");
            const titleInput = document.getElementById("galleryTitle");
            const badgeInput = document.getElementById("galleryBadge");
            const descInput = document.getElementById("galleryDesc");
            const urlInput = document.getElementById("galleryImg");
            const fileInput = document.getElementById("galleryImgFileInput");

            if (fileInput) fileInput.value = "";
            modeInput.value = mode;

            if (mode === "add") {
                headerTitle.innerText = "Tambah Foto Galeri Baru";
                idxInput.value = "-1";
                idInput.value = `foto-${Date.now()}`;
                
                // Set default kategori dari filter aktif jika bukan "all"
                catSelect.value = (currentGalleryCategoryFilter !== "all") ? currentGalleryCategoryFilter : "reuni";
                titleInput.value = "";
                badgeInput.value = "";
                descInput.value = "";
                urlInput.value = "";
                updateGalleryPhotoUI("");
            } else if (mode === "edit" && idx !== null && adminGallery[idx]) {
                const item = adminGallery[idx];
                headerTitle.innerText = "Ganti & Edit Foto Galeri";
                idxInput.value = idx;
                idInput.value = item.id || `foto-${Date.now()}`;
                catSelect.value = item.category || "reuni";
                titleInput.value = item.title || "";
                badgeInput.value = item.badge || "";
                descInput.value = item.desc || "";
                urlInput.value = item.img || "";
                updateGalleryPhotoUI(item.img || "", "Foto Terpasang");
            }

            modal.style.display = "flex";
        }

        function closeGalleryModal() {
            document.getElementById("galleryModalOverlay").style.display = "none";
        }

        function handleGalleryCategoryChange(val) {
            // Optional callback jika ingin ganti placeholder
        }

        function updateGalleryPhotoUI(imgUrl, sourceNote = "Tersimpan") {
            const previewBox = document.getElementById("galleryPhotoPreviewBox");
            const emptyPrompt = document.getElementById("galleryPhotoEmptyPrompt");
            const previewImg = document.getElementById("galleryImgPreview");
            const sourceLabel = document.getElementById("galleryPhotoSourceLabel");

            if (imgUrl && imgUrl.trim() !== "") {
                previewImg.src = imgUrl;
                previewBox.style.display = "flex";
                emptyPrompt.style.display = "none";
                if (sourceLabel) sourceLabel.innerText = sourceNote;
            } else {
                previewImg.src = "";
                previewBox.style.display = "none";
                emptyPrompt.style.display = "flex";
            }
        }

        function toggleGalleryUrlField() {
            const container = document.getElementById("galleryUrlInputContainer");
            const icon = document.getElementById("toggleGalleryUrlIcon");
            if (!container) return;
            const isOpen = container.style.display !== "none";
            container.style.display = isOpen ? "none" : "block";
            if (icon) icon.className = isOpen ? "fas fa-chevron-down" : "fas fa-chevron-up";
        }

        function handleManualGalleryUrlInput(val) {
            if (val && val.trim() !== "") {
                updateGalleryPhotoUI(val.trim(), "Tautan URL Online");
            } else {
                const fileInput = document.getElementById("galleryImgFileInput");
                if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                    updateGalleryPhotoUI("");
                }
            }
        }

        async function handleGalleryPhotoFile(input) {
            if (!input.files || input.files.length === 0) return;
            const file = input.files[0];
            
            const sourceLabel = document.getElementById("galleryPhotoSourceLabel");
            if (sourceLabel) sourceLabel.innerText = "Mengompresi foto...";

            try {
                const compressedBase64 = await compressImageToWebp(file, 1280, 0.85);
                document.getElementById("galleryImg").value = compressedBase64;
                updateGalleryPhotoUI(compressedBase64, "Foto Kamera/Galeri (WebP Siap)");
                showToast("Foto berhasil dimuat & dikompresi!");
            } catch (err) {
                console.error("Gagal kompresi:", err);
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById("galleryImg").value = e.target.result;
                    updateGalleryPhotoUI(e.target.result, "Foto Kamera/Galeri (Original)");
                };
                reader.readAsDataURL(file);
            }
        }

        function removeGalleryPhoto() {
            document.getElementById("galleryImg").value = "";
            const fileInput = document.getElementById("galleryImgFileInput");
            if (fileInput) fileInput.value = "";
            updateGalleryPhotoUI("");
            showToast("Foto galeri dihapus.");
        }

        function handleGallerySubmit(e) {
            e.preventDefault();
            const mode = document.getElementById("galleryModalMode").value;
            const idx = parseInt(document.getElementById("galleryItemIndex").value, 10);
            const id = document.getElementById("galleryItemId").value || `foto-${Date.now()}`;
            const category = document.getElementById("galleryCategory").value;
            const title = document.getElementById("galleryTitle").value.trim();
            const badge = document.getElementById("galleryBadge").value.trim();
            const desc = document.getElementById("galleryDesc").value.trim();
            const img = document.getElementById("galleryImg").value.trim();

            if (!img) {
                alert("Harap pilih/upload foto atau masukkan tautan URL foto terlebih dahulu.");
                return;
            }

            const itemData = {
                id: id,
                category: category,
                title: title,
                badge: badge,
                img: img,
                desc: desc
            };

            // Jika kategori reuni, bawa kelengkapan fitur dan teks wa jika sebelumnya ada
            if (mode === "edit" && idx >= 0 && adminGallery[idx]) {
                if (adminGallery[idx].features) itemData.features = adminGallery[idx].features;
                if (adminGallery[idx].waText) itemData.waText = adminGallery[idx].waText;
                if (adminGallery[idx].zone) itemData.zone = adminGallery[idx].zone;
                if (adminGallery[idx].tips) itemData.tips = adminGallery[idx].tips;
                if (adminGallery[idx].tableCode) itemData.tableCode = adminGallery[idx].tableCode;
                adminGallery[idx] = itemData;
                showToast("Data & foto berhasil diperbarui!");
            } else {
                adminGallery.unshift(itemData);
                showToast("Foto baru berhasil ditambahkan!");
            }

            updateGalleryStats();
            applyGalleryFilter();
            closeGalleryModal();
        }

        function deleteGalleryItem(idx) {
            if (idx < 0 || idx >= adminGallery.length) return;
            const item = adminGallery[idx];
            if (!confirm(`Apakah Anda yakin ingin menghapus foto "${item.title || 'ini'}" dari galeri?`)) {
                return;
            }

            adminGallery.splice(idx, 1);
            updateGalleryStats();
            applyGalleryFilter();
            showToast("Foto berhasil dihapus dari galeri.");
        }

        async function saveGalleryToGithub() {
            const btn = document.getElementById("btnSaveGallerySubmit");
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan Perubahan Foto ke GitHub...`;

            try {
                // Periksa apakah ada foto dengan base64 (hasil upload file lokal)
                for (let i = 0; i < adminGallery.length; i++) {
                    const item = adminGallery[i];
                    if (item.img && item.img.startsWith("data:image/")) {
                        const ext = item.img.includes("webp") ? "webp" : "jpg";
                        const fileName = `${item.id}.${ext}`;
                        const filePath = `assets/gallery/${fileName}`;

                        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Mengunggah foto (${i + 1}/${adminGallery.length})...`;
                        const uploadOk = await uploadBinaryToGitHub(filePath, item.img, `feat(gallery): upload image asset ${fileName}`);
                        if (uploadOk) {
                            item.img = filePath;
                        } else {
                            console.warn("Gagal upload gambar biner, tetap menggunakan data yang ada.");
                        }
                    }
                }

                btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Memperbarui data gallery.json...`;
                const success = await pushJsonToGitHub("gallery.json", adminGallery, "feat(admin): update gallery, reunion, and scenic photos catalog");
                if (success) {
                    showToast("Koleksi foto galeri berhasil dipublikasikan ke server live!");
                }
            } catch (err) {
                alert("Terjadi kendala saat publikasi foto galeri: " + err.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = `<i class="fas fa-floppy-disk"></i> Terapkan Perubahan Foto ke Server Live`;
            }
        }

        