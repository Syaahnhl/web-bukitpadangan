        // TAB 2: MANAJEMEN KATALOG MENU & UPLOAD BUKU MENU PDF
        // ========================================================
        let pendingMenuPdfFile = null;
        let activePreviewBlobUrl = null;

        function getFreshPdfUrl() {
            return "assets/pdf/buku-menu-bukit-padangan.pdf?t=" + Date.now();
        }

        function testDownloadMenuPdfDirect() {
            const freshUrl = getFreshPdfUrl();
            const a = document.createElement("a");
            a.href = freshUrl;
            a.download = "Buku-Menu-Bukit-Padangan.pdf";
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast("Mengunduh berkas PDF menu resmi terbaru...");
        }

        function showInlinePdfPreview(url, title) {
            const card = document.getElementById("pdfInlinePreviewCard");
            const iframe = document.getElementById("pdfPreviewIframe");
            const titleEl = document.getElementById("inlinePdfPreviewTitle");
            const extLink = document.getElementById("inlinePdfExternalLink");
            const mobLink = document.getElementById("pdfMobileDirectBtn");
            const btnText = document.getElementById("btnTogglePdfPreviewText");

            const targetUrl = url || getFreshPdfUrl();
            if (iframe) iframe.src = targetUrl;
            if (titleEl) titleEl.innerText = "Pratinjau PDF: " + (title || "MENU BUKIT PADANGAN–JUNI 2026.pdf");
            if (extLink) extLink.href = targetUrl;
            if (mobLink) mobLink.href = targetUrl;

            if (card) {
                card.style.display = "block";
                card.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
            if (btnText) btnText.innerText = "Tutup Pratinjau";
        }

        function closeInlinePdfPreview() {
            const card = document.getElementById("pdfInlinePreviewCard");
            const iframe = document.getElementById("pdfPreviewIframe");
            const btnText = document.getElementById("btnTogglePdfPreviewText");

            if (iframe) iframe.src = "";
            if (card) card.style.display = "none";
            if (btnText) btnText.innerText = "Pratinjau PDF";
        }

        function toggleInlinePdfPreview() {
            const card = document.getElementById("pdfInlinePreviewCard");
            if (card && card.style.display !== "none") {
                closeInlinePdfPreview();
            } else {
                showInlinePdfPreview();
            }
        }

        function previewPendingSelectedPdf() {
            if (!pendingMenuPdfFile) return;
            if (activePreviewBlobUrl) {
                try { URL.revokeObjectURL(activePreviewBlobUrl); } catch(e) {}
            }
            activePreviewBlobUrl = URL.createObjectURL(pendingMenuPdfFile);
            showInlinePdfPreview(activePreviewBlobUrl, pendingMenuPdfFile.name + " (Pratinjau Berkas Baru)");
            showToast("Menampilkan pratinjau berkas yang dipilih.");
        }

        function refreshPdfPreview() {
            const freshUrl = getFreshPdfUrl();
            showInlinePdfPreview(freshUrl, "Buku Menu Aktif (Server)");
            showToast("Pratinjau PDF dimuat ulang.");
        }

        function handleMenuPdfSelected(input) {
            const file = input.files && input.files[0];
            if (!file) return;

            if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
                alert("Harap pilih berkas dengan format PDF (.pdf).");
                input.value = "";
                return;
            }

            if (file.size > 25 * 1024 * 1024) {
                alert("Ukuran berkas PDF terlalu besar (maksimal 25 MB).");
                input.value = "";
                return;
            }

            pendingMenuPdfFile = file;
            const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + " MB";
            document.getElementById("selectedPdfFileName").innerText = file.name;
            document.getElementById("selectedPdfFileSize").innerText = "Ukuran: " + sizeStr + " • Siap diunggah ke server GitHub";
            document.getElementById("selectedPdfBox").style.display = "flex";

            // Langsung tampilkan preview berkas lokal yang dipilih
            previewPendingSelectedPdf();
        }

        function cancelSelectedPdf() {
            pendingMenuPdfFile = null;
            if (activePreviewBlobUrl) {
                try { URL.revokeObjectURL(activePreviewBlobUrl); } catch(e) {}
                activePreviewBlobUrl = null;
            }
            const input = document.getElementById("menuPdfFileInput");
            if (input) input.value = "";
            document.getElementById("selectedPdfBox").style.display = "none";
        }

        async function uploadMenuPdfToGithub() {
            if (!pendingMenuPdfFile) {
                alert("Pilih berkas PDF terlebih dahulu.");
                return;
            }

            const token = getActiveGitToken();
            if (!token) {
                alert("Koneksi penyimpanan cloud belum tersedia.");
                return;
            }

            const btn = document.getElementById("btnUploadPdfGithub");
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Mengunggah PDF...`;

            try {
                const reader = new FileReader();
                reader.onload = async function(e) {
                    try {
                        const dataUrl = e.target.result;
                        const base64Only = dataUrl.split(",")[1];
                        const filePath = "assets/pdf/buku-menu-bukit-padangan.pdf";

                        const ok = await uploadBinaryToGitHub(
                            filePath,
                            base64Only,
                            `feat(menu): upload official restaurant menu catalog PDF (${pendingMenuPdfFile.name})`
                        );

                        if (ok) {
                            showToast("Buku Menu PDF berhasil diunggah & dipublikasikan ke GitHub!");
                            const freshUrl = getFreshPdfUrl();
                            document.getElementById("currentPdfName").innerText = pendingMenuPdfFile.name;
                            document.getElementById("currentPdfMeta").innerHTML = `
                                <span><i class="fas fa-folder-open"></i> ${filePath}</span>
                                <span><i class="fas fa-check-circle" style="color:#10b981;"></i> Baru diunggah (${(pendingMenuPdfFile.size / 1024).toFixed(0)} KB)</span>
                            `;
                            
                            const btnNewTab = document.getElementById("btnOpenNewTabPdf");
                            if (btnNewTab) btnNewTab.href = freshUrl;

                            // Otomatis buka live preview PDF yang baru diunggah
                            showInlinePdfPreview(freshUrl, pendingMenuPdfFile.name + " (Aktif di Server)");

                            cancelSelectedPdf();
                        } else {
                            alert("Gagal mengunggah berkas PDF ke GitHub. Pastikan token PAT memiliki hak akses 'repo'.");
                        }
                    } catch (err) {
                        console.error(err);
                        alert("Terjadi kesalahan saat memproses unggahan PDF: " + err.message);
                    } finally {
                        btn.disabled = false;
                        btn.innerHTML = originalText;
                    }
                };
                reader.onerror = function() {
                    alert("Gagal membaca berkas dari memori perangkat.");
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                };
                reader.readAsDataURL(pendingMenuPdfFile);
            } catch (err) {
                console.error(err);
                alert("Gagal membaca berkas PDF: " + err.message);
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }

        function initPdfDropzone() {
            const dropzone = document.getElementById("pdfDropzone");
            if (!dropzone) return;
            ['dragenter', 'dragover'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.style.borderColor = '#38bdf8';
                    dropzone.style.background = 'rgba(56, 189, 248, 0.1)';
                }, false);
            });
            ['dragleave', 'drop'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.style.borderColor = '#475569';
                    dropzone.style.background = 'rgba(30, 41, 59, 0.5)';
                }, false);
            });
            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.style.borderColor = '#475569';
                dropzone.style.background = 'rgba(30, 41, 59, 0.5)';
                const dt = e.dataTransfer;
                const files = dt.files;
                if (files && files.length) {
                    const input = document.getElementById('menuPdfFileInput');
                    input.files = files;
                    handleMenuPdfSelected(input);
                }
            }, false);
        }
        async function loadMenuCatalog() {
            try {
                const res = await fetch("menu.json");
                if (res.ok) {
                    adminMenus = await res.json();
                    filteredMenus = [...adminMenus];
                    document.getElementById("menuCountBadge").innerText = adminMenus.length;
                    renderMenuCards();
                }
            } catch (e) {
                console.error("Gagal load menu.json:", e);
            }
        }

        function formatRupiah(num) {
            return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0
            }).format(num);
        }

        function renderMenuCards() {
            const container = document.getElementById("menuCardsContainer");
            if (!container) return;

            if (filteredMenus.length === 0) {
                container.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <i class="fas fa-utensils"></i>
                        <p>Tidak ada menu yang sesuai dengan kriteria.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = filteredMenus.map(item => {
                const realIndex = adminMenus.findIndex(m => m.id === item.id);
                const thumb = item.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop';
                return `
                    <div class="menu-item-card">
                        <div class="menu-card-main">
                            <img class="menu-thumb" src="${thumb}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop'">
                            <div class="menu-info-col">
                                <div class="menu-card-top">
                                    <h4 class="menu-name" title="${item.name}">${item.name}</h4>
                                    ${item.badge ? `<span class="menu-badge-pill">${item.badge}</span>` : ''}
                                </div>
                                <p class="menu-desc">${item.desc || 'Pilihan lezat khas Bukit Padangan.'}</p>
                            </div>
                        </div>
                        <div class="menu-bottom-row">
                            <span class="menu-price">${formatRupiah(item.price)}</span>
                            <div class="menu-card-actions">
                                <button type="button" class="btn-card-action edit" onclick="openMenuModal('edit', ${realIndex})" title="Edit Menu">
                                    <i class="fas fa-pencil"></i> Ubah
                                </button>
                                <button type="button" class="btn-card-action delete" onclick="deleteMenuItem(${realIndex})" title="Hapus Menu">
                                    <i class="fas fa-trash-can"></i> Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join("");
        }

        function handleMenuSearch() {
            const q = document.getElementById("menuSearchInput").value.toLowerCase();
            applyMenuFilters(q, currentMenuCategoryFilter);
        }

        function filterMenuCategory(cat, btn) {
            currentMenuCategoryFilter = cat;
            document.querySelectorAll(".category-filter-chips .chip-btn").forEach(c => c.classList.remove("active"));
            if (btn) btn.classList.add("active");
            const q = document.getElementById("menuSearchInput").value.toLowerCase();
            applyMenuFilters(q, cat);
        }

        function applyMenuFilters(query, cat) {
            filteredMenus = adminMenus.filter(m => {
                const matchCat = (cat === 'all' || m.category === cat);
                const matchQ = (m.name.toLowerCase().includes(query) || (m.desc && m.desc.toLowerCase().includes(query)) || m.id.toLowerCase().includes(query));
                return matchCat && matchQ;
            });
            renderMenuCards();
        }

        function openMenuModal(mode, idx = null) {
            const modal = document.getElementById("menuModalOverlay");
            const form = document.getElementById("menuEditorForm");
            form.reset();

            // Reset file input & URL accordion
            const fileInput = document.getElementById("menuImgFileInput");
            if (fileInput) fileInput.value = "";
            const urlContainer = document.getElementById("menuUrlInputContainer");
            if (urlContainer) urlContainer.style.display = "none";
            const urlIcon = document.getElementById("toggleUrlIcon");
            if (urlIcon) urlIcon.className = "fas fa-chevron-down";

            if (mode === 'add') {
                document.getElementById("menuModalHeaderTitle").innerText = "Tambah Menu Baru";
                document.getElementById("editMenuIndex").value = "";
                document.getElementById("menuId").disabled = false;
                document.getElementById("menuImg").value = "";
                updateMenuPhotoUI("");
            } else if (mode === 'edit' && idx !== null) {
                document.getElementById("menuModalHeaderTitle").innerText = "Edit Menu";
                document.getElementById("editMenuIndex").value = idx;
                const it = adminMenus[idx];
                document.getElementById("menuId").value = it.id;
                document.getElementById("menuId").disabled = true;
                document.getElementById("menuName").value = it.name;
                document.getElementById("menuCategory").value = it.category;
                document.getElementById("menuPrice").value = it.price;
                document.getElementById("menuBadge").value = it.badge || "";
                document.getElementById("menuImg").value = it.img || "";
                document.getElementById("menuDesc").value = it.desc || "";
                updateMenuPhotoUI(it.img || "");
            }
            modal.style.display = "flex";
        }

        function closeMenuModal() {
            document.getElementById("menuModalOverlay").style.display = "none";
        }

        // ========================================================
        // PHOTO UPLOAD & PREVIEW LOGIC
        // ========================================================
        function updateMenuPhotoUI(imgUrl) {
            const previewWrap = document.getElementById("menuPhotoPreviewWrap");
            const emptyPrompt = document.getElementById("menuPhotoEmptyPrompt");
            const previewImg = document.getElementById("menuPhotoPreviewImg");
            const statusText = document.getElementById("photoStatusText");

            if (imgUrl && imgUrl.trim() !== "") {
                previewImg.src = imgUrl;
                previewWrap.style.display = "flex";
                emptyPrompt.style.display = "none";
                if (statusText) statusText.innerText = "Foto siap disimpan";
            } else {
                previewImg.src = "";
                previewWrap.style.display = "none";
                emptyPrompt.style.display = "flex";
                if (statusText) statusText.innerText = "Belum ada foto";
            }
        }

        function handleMenuPhotoFile(input) {
            const file = input.files && input.files[0];
            if (!file) return;

            if (file.size > 15 * 1024 * 1024) {
                alert("Ukuran foto maksimal 15MB. Silakan pilih foto yang lebih ringkas.");
                input.value = "";
                return;
            }

            const statusText = document.getElementById("photoStatusText");
            if (statusText) statusText.innerText = "Mengompres foto...";

            const reader = new FileReader();
            reader.onload = function(e) {
                compressImageToWebp(e.target.result, 800, 800, 0.85, function(compressedDataUrl) {
                    document.getElementById("menuImg").value = compressedDataUrl;
                    updateMenuPhotoUI(compressedDataUrl);
                    showToast("Foto berhasil dipilih & dioptimasi!");
                });
            };
            reader.onerror = function() {
                alert("Gagal membaca file foto dari perangkat.");
                if (statusText) statusText.innerText = "Gagal memuat foto";
            };
            reader.readAsDataURL(file);
        }

        function compressImageToWebp(src, maxW, maxH, quality, callback) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = function() {
                let w = img.width;
                let h = img.height;

                if (w > maxW || h > maxH) {
                    if (w > h) {
                        h = Math.round((h * maxW) / w);
                        w = maxW;
                    } else {
                        w = Math.round((w * maxH) / h);
                        h = maxH;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d");
                
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(img, 0, 0, w, h);

                let output = canvas.toDataURL("image/webp", quality);
                if (!output.startsWith("data:image/webp")) {
                    output = canvas.toDataURL("image/jpeg", quality);
                }
                callback(output);
            };
            img.onerror = function() {
                callback(src);
            };
            img.src = src;
        }

        function removeMenuPhoto() {
            document.getElementById("menuImg").value = "";
            const fileInput = document.getElementById("menuImgFileInput");
            if (fileInput) fileInput.value = "";
            updateMenuPhotoUI("");
            showToast("Foto menu dihapus.");
        }

        function toggleMenuUrlField() {
            const container = document.getElementById("menuUrlInputContainer");
            const icon = document.getElementById("toggleUrlIcon");
            if (!container) return;
            const isOpen = container.style.display !== "none";
            container.style.display = isOpen ? "none" : "flex";
            if (icon) icon.className = isOpen ? "fas fa-chevron-down" : "fas fa-chevron-up";
        }

        function handleManualUrlInput(val) {
            updateMenuPhotoUI(val.trim());
        }

        function handleMenuSubmit(e) {
            e.preventDefault();
            const idx = document.getElementById("editMenuIndex").value;
            const menuId = document.getElementById("menuId").value.trim().toLowerCase();
            const name = document.getElementById("menuName").value.trim();
            const category = document.getElementById("menuCategory").value;
            const price = parseInt(document.getElementById("menuPrice").value);
            const badge = document.getElementById("menuBadge").value.trim();
            const img = document.getElementById("menuImg").value.trim();
            const desc = document.getElementById("menuDesc").value.trim();

            const itemData = { id: menuId, name, category, price, badge, img, desc };

            if (idx === "") {
                if (adminMenus.some(m => m.id === menuId)) {
                    alert("ID Menu sudah digunakan! Harap tentukan ID unik lainnya.");
                    return;
                }
                adminMenus.push(itemData);
            } else {
                adminMenus[parseInt(idx)] = itemData;
            }

            document.getElementById("menuCountBadge").innerText = adminMenus.length;
            filterMenuCategory(currentMenuCategoryFilter, null);
            closeMenuModal();
            showToast("Menu berhasil diperbarui di daftar kerja.");
        }

        function deleteMenuItem(idx) {
            const item = adminMenus[idx];
            if (confirm(`Apakah Tuan yakin ingin menghapus menu "${item.name}"?`)) {
                adminMenus.splice(idx, 1);
                document.getElementById("menuCountBadge").innerText = adminMenus.length;
                filterMenuCategory(currentMenuCategoryFilter, null);
                showToast("Menu dihapus.");
            }
        }

        async function saveMenuToGithub() {
            const token = getActiveGitToken();
            if (!token) {
                alert("Koneksi penyimpanan cloud belum tersedia.");
                return;
            }

            const btn = document.getElementById("btnSaveMenuSubmit");
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan Katalog Menu...`;

            try {
                // Check if any menu item has uploaded base64 data
                for (let i = 0; i < adminMenus.length; i++) {
                    const item = adminMenus[i];
                    if (item.img && item.img.startsWith("data:image/")) {
                        const parts = item.img.split(",");
                        if (parts.length === 2) {
                            const isWebp = item.img.includes("webp");
                            const ext = isWebp ? "webp" : "jpg";
                            const filePath = `assets/menu/${item.id}.${ext}`;
                            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Mengunggah foto ${item.name}...`;
                            try {
                                const uploaded = await uploadBinaryToGitHub(filePath, parts[1], `feat(menu): upload photo asset for ${item.name}`);
                                if (uploaded) {
                                    item.img = `${filePath}?v=${Date.now()}`;
                                }
                            } catch (err) {
                                console.warn("Gagal upload binary ke GitHub, mempertahankan data URL:", err);
                            }
                        }
                    }
                }

                btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan menu.json...`;
                const success = await pushJsonToGitHub("menu.json", adminMenus, "feat(admin): update restaurant menu catalog");
                if (success) {
                    showToast("Katalog menu & foto berhasil dipublikasikan ke server live!");
                }
            } catch (err) {
                alert("Terjadi kendala saat publikasi: " + err.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = `<i class="fas fa-floppy-disk"></i> Terapkan Perubahan Menu ke Server Live`;
            }
        }

        // ========================================================
