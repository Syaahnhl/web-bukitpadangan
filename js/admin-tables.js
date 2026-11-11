        // TAB 3: STATUS KETERSEDIAAN MEJA (26 MEJA)
        // ========================================================
        async function loadTablesData() {
            try {
                const res = await fetch("tables.json");
                if (res.ok) {
                    adminTables = await res.json();
                    document.getElementById("tablesCountBadge").innerText = adminTables.length;
                    renderTablesCards();
                    updateTableStats();
                }
            } catch (e) {
                console.error("Gagal load tables.json:", e);
            }
        }

        let currentTableZoneFilter = 'all';

        function filterTablesZone(zone, btn) {
            currentTableZoneFilter = zone;
            document.querySelectorAll("#tab-tables .chip-btn").forEach(b => b.classList.remove("active"));
            if (btn) btn.classList.add("active");
            renderTablesCards();
        }

        function updateTableStats() {
            const tersedia = adminTables.filter(t => t.status === 'tersedia').length;
            const terisi = adminTables.filter(t => t.status === 'terisi').length;
            const dipesan = adminTables.filter(t => t.status === 'dipesan').length;

            const elTotal = document.getElementById("totalTablesCount");
            if (elTotal) elTotal.innerText = adminTables.length;

            const elTersedia = document.getElementById("countTersedia");
            if (elTersedia) elTersedia.innerText = tersedia;

            const elTerisi = document.getElementById("countTerisi");
            if (elTerisi) elTerisi.innerText = terisi;

            const elDipesan = document.getElementById("countDipesan");
            if (elDipesan) elDipesan.innerText = dipesan;

            // Zone counts
            const outdoor = adminTables.filter(t => t.zone === 'outdoor').length;
            const terapi = adminTables.filter(t => t.zone === 'terapi').length;
            const vip = adminTables.filter(t => t.zone === 'vip').length;

            const elZAll = document.getElementById("countZoneAll");
            if (elZAll) elZAll.innerText = adminTables.length;
            const elZOut = document.getElementById("countZoneOutdoor");
            if (elZOut) elZOut.innerText = outdoor;
            const elZTer = document.getElementById("countZoneTerapi");
            if (elZTer) elZTer.innerText = terapi;
            const elZVip = document.getElementById("countZoneVip");
            if (elZVip) elZVip.innerText = vip;
        }

        function renderTablesCards() {
            const container = document.getElementById("tablesCardContainer");
            if (!container) return;

            let displayed = adminTables;
            if (currentTableZoneFilter !== 'all') {
                displayed = adminTables.filter(t => t.zone === currentTableZoneFilter);
            }

            if (displayed.length === 0) {
                container.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <i class="fas fa-chair"></i>
                        <p>Tidak ada meja pada area ini.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = displayed.map(t => {
                const st = t.status || 'tersedia';
                const statusClass = `status-${st}`;
                const areaLabel = t.area || t.zoneName || 'Area Santai';
                return `
                    <div class="table-card">
                        <div class="table-card-header">
                            <div>
                                <span class="table-id-badge">${t.id}</span>
                                <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff; margin-top: 4px;">${t.name}</h4>
                                <div class="table-zone-text">${areaLabel} • 👥 ${t.capacity} Kursi</div>
                            </div>
                        </div>

                        <div>
                            <label class="form-label" style="font-size: 0.72rem; margin-bottom: 4px;">Status Saat Ini:</label>
                            <select class="table-card-status-select ${statusClass}" onchange="changeTableStatus('${t.id}', this.value, this)">
                                <option value="tersedia" ${st === 'tersedia' ? 'selected' : ''}>🟢 Tersedia</option>
                                <option value="terisi" ${st === 'terisi' ? 'selected' : ''}>🟡 Terisi (Occupied)</option>
                                <option value="dipesan" ${st === 'dipesan' ? 'selected' : ''}>🔴 Dipesan (Reserved)</option>
                            </select>
                        </div>
                    </div>
                `;
            }).join("");
        }

        function changeTableStatus(tableId, newStatus, selectEl) {
            const t = adminTables.find(x => x.id === tableId);
            if (t) {
                t.status = newStatus;
                selectEl.className = `table-card-status-select status-${newStatus}`;
                updateTableStats();
                showToast(`Status ${t.name} diubah ke ${newStatus.toUpperCase()}`);
            }
        }

        function setBulkTableStatus(status) {
            if (confirm(`Ubah status SELURUH 26 meja menjadi "${status.toUpperCase()}"?`)) {
                adminTables.forEach(t => t.status = status);
                renderTablesCards();
                updateTableStats();
                showToast(`Semua meja diubah menjadi ${status.toUpperCase()}`);
            }
        }

        async function saveTablesToGithub() {
            const token = getGithubToken();
            if (!token) {
                showToast("Sinkronisasi cloud sedang tidak tersedia.");
                return;
            }

            const btn = document.getElementById("btnSaveTablesSubmit");
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan Denah Meja...`;

            const success = await pushJsonToGitHub("tables.json", adminTables, "feat(admin): update restaurant floor plan table status");
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-floppy-disk"></i> Terapkan Status Denah Meja ke Server Live`;

            if (success) {
                showToast("Status meja berhasil disinkronkan ke server live!");
            }
        }

        // ========================================================
        // CENTRAL GITHUB API COMMIT HELPER
        // ========================================================
        async function pushJsonToGitHub(filePath, jsonData, commitMessage) {
            const token = getActiveGitToken();
            const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;

            try {
                // 1. Get existing file SHA
                const getRes = await fetch(apiUrl, {
                    headers: {
                        "Authorization": `token ${token}`,
                        "Accept": "application/vnd.github.v3+json"
                    }
                });

                if (!getRes.ok) {
                    const err = await getRes.json();
                    throw new Error(err.message || "Gagal menghubungi repository GitHub.");
                }

                const fileInfo = await getRes.json();
                const sha = fileInfo.sha;

                // 2. Put updated JSON with Unicode base64 encoding
                const jsonStr = JSON.stringify(jsonData, null, 2);
                const base64Content = btoa(unescape(encodeURIComponent(jsonStr)));

                const putRes = await fetch(apiUrl, {
                    method: "PUT",
                    headers: {
                        "Authorization": `token ${token}`,
                        "Content-Type": "application/json",
                        "Accept": "application/vnd.github.v3+json"
                    },
                    body: JSON.stringify({
                        message: commitMessage,
                        content: base64Content,
                        sha: sha
                    })
                });

                if (!putRes.ok) {
                    const putErr = await putRes.json();
                    throw new Error(putErr.message || "Gagal memperbarui file di GitHub.");
                }

                return true;
            } catch (err) {
                alert(`Gagal Menyimpan ke GitHub: ${err.message}`);
                console.error(err);
                return false;
            }
        }

        async function uploadBinaryToGitHub(filePath, base64Content, commitMessage) {
            const token = getActiveGitToken();
            const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;

            let sha = null;
            try {
                const getRes = await fetch(apiUrl, {
                    headers: {
                        "Authorization": `token ${token}`,
                        "Accept": "application/vnd.github.v3+json"
                    }
                });
                if (getRes.ok) {
                    const fileInfo = await getRes.json();
                    sha = fileInfo.sha;
                }
            } catch (e) {
                // file doesn't exist yet, sha remains null
            }

            const payload = {
                message: commitMessage,
                content: base64Content
            };
            if (sha) payload.sha = sha;

            const putRes = await fetch(apiUrl, {
                method: "PUT",
                headers: {
                    "Authorization": `token ${token}`,
                    "Content-Type": "application/json",
                    "Accept": "application/vnd.github.v3+json"
                },
                body: JSON.stringify(payload)
            });

            return putRes.ok;
        }
