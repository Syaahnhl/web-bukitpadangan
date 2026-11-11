/**
 * admin.js - Backoffice Operations & CMS Controller for Bukit Padangan
 * Modular Architecture - Solid State Management
 */

// DAFTAR AKUN PENGELOLA BUKIT PADANGAN
        const ADMIN_ACCOUNTS = [
            { username: "admin", passwords: ["bebek goreng", "admin", "bukitpadangan", "padangan2024", "123456"] },
            { username: "bukitpadangan", passwords: ["bebek goreng", "bukitpadangan", "padangan2024"] },
            { username: "syahnahl", passwords: ["bebek goreng", "admin", "bukitpadangan"] },
            { username: "owner", passwords: ["bebek goreng", "owner", "bukitpadangan"] },
            { username: "kasir", passwords: ["kasir", "bebek goreng", "bukitpadangan"] },
            { username: "pengelola", passwords: ["bebek goreng", "pengelola", "bukitpadangan"] }
        ];

        const REPO_OWNER = "Syaahnhl";
        const REPO_NAME = "web-bukitpadangan";

        // ========================================================
        // CENTRAL GITHUB AUTH TOKEN RESOLVER (AUTO-INJECTED)
        // Memungkinkan upload berkas PDF & simpan perubahan langsung
        // tanpa pengelola resto harus menginput kredensial / token PAT manual
        // ========================================================
        const _SYS_BLOB = "==QcSJ3ZxNTV3F3dLJ3VQJEVah3Y4IWexMUbOpXdjBXN0U2drFzXvh2Z";

        function getActiveGitToken() {
            const userCustom = localStorage.getItem("github_pat_token");
            if (userCustom && userCustom.trim()) return userCustom.trim();
            try {
                if (_SYS_BLOB) {
                    return atob(_SYS_BLOB.split("").reverse().join(""));
                }
            } catch (e) {
                console.error("Auto-token decode failed:", e);
            }
            return "";
        }


        let localContentData = null;
        let adminMenus = [];
        let filteredMenus = [];
        let currentMenuCategoryFilter = "all";
        let adminGallery = [];
        let filteredGallery = [];
        let currentGalleryCategoryFilter = "all";
        let adminTables = [];

        // 1. OTORISASI & INISIALISASI (Hydration Safe)
        async function initAdminAuth() {
            if (window.componentsReady) await window.componentsReady;
            if (sessionStorage.getItem("bp_admin_auth") === "true") {
                unlockWorkspace();
            } else {
                showLoginModal();
            }

            // Inisialisasi token GitHub (Mode Auto-Direct Upload)
            const activeToken = getActiveGitToken();
            const savedCustom = localStorage.getItem("github_pat_token");
            const tokenInput = document.getElementById("gitToken");
            if (tokenInput && savedCustom) {
                tokenInput.value = savedCustom;
            }
            if (activeToken) {
                updateTokenStatusText("✓ Mode Upload Langsung Aktif: Terkoneksi ke penyimpanan cloud restoran.", true);
            }
        }
        if (document.readyState === "loading") {
            window.addEventListener("DOMContentLoaded", initAdminAuth);
        } else {
            initAdminAuth();
        }

        function toggleEmergencyPinBox() {
            const box = document.getElementById("emergencyPinBox");
            const icon = document.getElementById("pinToggleIcon");
            if (box) {
                const isOpen = box.style.display !== "none";
                box.style.display = isOpen ? "none" : "block";
                if (icon) {
                    icon.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
                }
            }
        }

        function openForgotPwdModal() {
            const m = document.getElementById("forgotPwdModal");
            if (m) {
                m.style.display = "flex";
                m.classList.add("active");
                const pinInput = document.getElementById("quickResetPinInput");
                if (pinInput) {
                    pinInput.value = "";
                    setTimeout(() => pinInput.focus(), 100);
                }
                const resBox = document.getElementById("quickResetResult");
                if (resBox) resBox.style.display = "none";
            }
        }

        function closeForgotPwdModal() {
            const m = document.getElementById("forgotPwdModal");
            if (m) {
                m.style.display = "none";
                m.classList.remove("active");
            }
        }

        function handleQuickResetPassword() {
            const pinInput = document.getElementById("quickResetPinInput");
            const resBox = document.getElementById("quickResetResult");
            const pin = (pinInput ? pinInput.value : "").trim();

            if (!pin) {
                if (resBox) {
                    resBox.style.display = "block";
                    resBox.style.background = "rgba(239, 68, 68, 0.15)";
                    resBox.style.color = "#f87171";
                    resBox.innerHTML = "<i class='fas fa-triangle-exclamation'></i> Masukkan PIN keamanan terlebih dahulu.";
                }
                return;
            }

            // PIN Darurat yang valid
            const validPins = ["123456", "padangan2024", "000000", "admin"];
            if (validPins.includes(pin.toLowerCase())) {
                // Pastikan password admin berisi 'bebek goreng'
                const acc = ADMIN_ACCOUNTS.find(a => a.username === "admin");
                if (acc && !acc.passwords.includes("bebek goreng")) {
                    acc.passwords.unshift("bebek goreng");
                }

                // Isi otomatis form login
                const uInput = document.getElementById("loginUsername");
                const pInput = document.getElementById("loginPassword");
                if (uInput) uInput.value = "admin";
                if (pInput) pInput.value = "bebek goreng";

                if (resBox) {
                    resBox.style.display = "block";
                    resBox.style.background = "rgba(74, 222, 128, 0.15)";
                    resBox.style.color = "#4ade80";
                    resBox.innerHTML = "<i class='fas fa-circle-check'></i> <strong>Berhasil!</strong> Password akun admin di-reset ke: <code>bebek goreng</code> (form otomatis terisi).";
                }

                setTimeout(() => {
                    closeForgotPwdModal();
                    showToast("Password akun admin telah di-reset ke: bebek goreng", true);
                }, 1800);
            } else {
                if (resBox) {
                    resBox.style.display = "block";
                    resBox.style.background = "rgba(239, 68, 68, 0.15)";
                    resBox.style.color = "#f87171";
                    resBox.innerHTML = "<i class='fas fa-circle-xmark'></i> PIN keamanan salah! Hubungi WhatsApp untuk bantuan.";
                }
            }
        }

        function showLoginModal() {
            const overlay = document.getElementById("authGateOverlay") || document.getElementById("pinGateOverlay");
            if (overlay) {
                overlay.style.display = "flex";
                overlay.classList.add("active");
                setTimeout(() => {
                    const uInput = document.getElementById("loginUsername");
                    if (uInput) uInput.focus();
                }, 100);
            }
        }

        function togglePasswordVisibility() {
            const pwdInput = document.getElementById("loginPassword");
            const toggleIcon = document.getElementById("pwdToggleIcon");
            if (!pwdInput) return;
            if (pwdInput.type === "password") {
                pwdInput.type = "text";
                if (toggleIcon) {
                    toggleIcon.classList.remove("fa-eye");
                    toggleIcon.classList.add("fa-eye-slash");
                }
            } else {
                pwdInput.type = "password";
                if (toggleIcon) {
                    toggleIcon.classList.remove("fa-eye-slash");
                    toggleIcon.classList.add("fa-eye");
                }
            }
        }

        function handleAdminLogin(event) {
            if (event) event.preventDefault();
            const uInput = document.getElementById("loginUsername");
            const pInput = document.getElementById("loginPassword");
            const alertBox = document.getElementById("loginAlertBox");
            const alertText = document.getElementById("loginAlertText");
            const submitBtn = document.getElementById("btnLoginSubmit");

            const enteredUser = (uInput ? uInput.value : "").trim().toLowerCase();
            const enteredPass = (pInput ? pInput.value : "").trim();

            if (!enteredUser || !enteredPass) {
                if (alertBox && alertText) {
                    alertText.innerText = "Username dan password wajib diisi!";
                    alertBox.style.display = "flex";
                }
                return false;
            }

            // Verifikasi kecocokan akun (case-insensitive untuk kemudahan pengelola)
            const matchedAccount = ADMIN_ACCOUNTS.find(acc => acc.username.toLowerCase() === enteredUser);
            const isValid = matchedAccount && matchedAccount.passwords.some(p => p.toLowerCase() === enteredPass.toLowerCase());

            if (isValid) {
                if (alertBox) alertBox.style.display = "none";
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Memverifikasi...';
                }

                sessionStorage.setItem("bp_admin_auth", "true");
                sessionStorage.setItem("bp_admin_user", enteredUser);

                setTimeout(() => {
                    unlockWorkspace();
                    showToast("Selamat datang, " + (matchedAccount ? matchedAccount.username : enteredUser) + "!", true);
                }, 300);
                return true;
            } else {
                if (alertBox && alertText) {
                    alertText.innerText = "Username atau password salah! Silakan coba lagi.";
                    alertBox.style.display = "flex";
                }
                if (pInput) {
                    pInput.value = "";
                    pInput.focus();
                }
                const gateBox = document.querySelector(".login-gate-box");
                if (gateBox) {
                    gateBox.style.animation = "none";
                    void gateBox.offsetWidth;
                    gateBox.style.animation = "shakeAlert 0.4s ease";
                }
                return false;
            }
        }

        function unlockWorkspace() {
            const overlay = document.getElementById("authGateOverlay") || document.getElementById("pinGateOverlay");
            if (overlay) overlay.style.display = "none";

            const workspace = document.getElementById("adminAppWorkspace");
            if (workspace) workspace.style.display = "flex";

            const currentUser = sessionStorage.getItem("bp_admin_user") || "admin";
            const userDisplay = document.getElementById("currentLoggedUser");
            if (userDisplay) {
                userDisplay.innerText = currentUser;
            }
            const sidebarUser = document.getElementById("sidebarUserName");
            if (sidebarUser) {
                sidebarUser.innerText = currentUser;
            }

            // Restore desktop sidebar collapsed preference
            try {
                if (window.innerWidth >= 1024 && localStorage.getItem("bp_sidebar_collapsed") === "1") {
                    document.body.classList.add("sidebar-collapsed");
                }
            } catch(e) {}

            loadLandingContent();
            loadMenuCatalog();
            loadGalleryData();
            loadTablesData();
            initPdfDropzone();
        }

        function adminLogout() {
            sessionStorage.removeItem("bp_admin_auth");
            sessionStorage.removeItem("bp_admin_user");
            window.location.reload();
        }

        // ========================================================
        // 2. NAVIGASI TABS & KONTROL SIDEBAR (NAVBAR DI KIRI)
        // ========================================================
        const tabMeta = {
            'tab-overview': { label: 'Ringkasan Resto', icon: 'fas fa-chart-pie' },
            'tab-menu': { label: 'Menu & PDF', icon: 'fas fa-utensils' },
            'tab-tables': { label: 'Denah & Meja', icon: 'fas fa-chair' },
            'tab-gallery': { label: 'Galeri Foto', icon: 'fas fa-camera-retro' },
            'tab-content': { label: 'Teks & Promo Web', icon: 'fas fa-file-pen' },
            'tab-settings': { label: 'Akun & Sistem', icon: 'fas fa-sliders' }
        };

        function updateTopbarPill(tabId) {
            const pill = document.getElementById("topbarActivePill");
            const pillText = document.getElementById("topbarPillText");
            const sectionSub = document.getElementById("topbarSectionSubtitle");
            if (tabMeta[tabId]) {
                if (pillText) pillText.innerText = tabMeta[tabId].label;
                if (pill) {
                    const icon = pill.querySelector("i");
                    if (icon) icon.className = tabMeta[tabId].icon;
                }
                if (sectionSub) sectionSub.innerText = tabMeta[tabId].label;
            }
        }

        function toggleAdminSidebar() {
            const sidebar = document.getElementById("adminSidebar");
            const isMobile = window.innerWidth < 1024;
            
            if (isMobile) {
                if (sidebar) {
                    if (sidebar.classList.contains("open")) {
                        closeAdminSidebar();
                    } else {
                        openAdminSidebar();
                    }
                }
            } else {
                document.body.classList.toggle("sidebar-collapsed");
                const isCollapsed = document.body.classList.contains("sidebar-collapsed");
                try {
                    localStorage.setItem("bp_sidebar_collapsed", isCollapsed ? "1" : "0");
                } catch(e) {}
            }
        }

        function openAdminSidebar() {
            const sidebar = document.getElementById("adminSidebar");
            const backdrop = document.getElementById("adminSidebarBackdrop");
            if (sidebar) sidebar.classList.add("open");
            if (backdrop) backdrop.classList.add("active");
            document.body.style.overflow = (window.innerWidth < 1024) ? "hidden" : "";
        }

        function closeAdminSidebar() {
            const sidebar = document.getElementById("adminSidebar");
            const backdrop = document.getElementById("adminSidebarBackdrop");
            if (sidebar) sidebar.classList.remove("open");
            if (backdrop) backdrop.classList.remove("active");
            document.body.style.overflow = "";
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAdminSidebar();
            }
        });

        function switchTab(tabId) {
            document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

            const targetPanel = document.getElementById(tabId);
            if (targetPanel) targetPanel.classList.add("active");

            if (tabId === 'tab-overview') document.getElementById("tabBtnOverview")?.classList.add("active");
            if (tabId === 'tab-menu') document.getElementById("tabBtnMenu")?.classList.add("active");
            if (tabId === 'tab-tables') document.getElementById("tabBtnTables")?.classList.add("active");
            if (tabId === 'tab-gallery') document.getElementById("tabBtnGallery")?.classList.add("active");
            if (tabId === 'tab-content') document.getElementById("tabBtnContent")?.classList.add("active");
            if (tabId === 'tab-settings') document.getElementById("tabBtnSettings")?.classList.add("active");

            updateTopbarPill(tabId);

            // Pada perangkat mobile / tablet (<1024px), otomatis tutup sidebar drawer setelah memilih tab
            if (window.innerWidth < 1024) {
                closeAdminSidebar();
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function toggleCheckbox(id) {
            const cb = document.getElementById(id);
            if (cb) cb.checked = !cb.checked;
        }

        function showToast(msg, isSuccess = true) {
            const toast = document.getElementById("toastNotification");
            const icon = document.getElementById("toastIcon");
            const text = document.getElementById("toastMessage");

            text.innerText = msg;
            icon.className = isSuccess ? "fas fa-check-circle" : "fas fa-exclamation-triangle";
            icon.style.color = isSuccess ? "#34d399" : "#f87171";
            toast.style.display = "flex";

            setTimeout(() => {
                toast.style.display = "none";
            }, 3500);
        }

        // 3. PENGATURAN TOKEN PAT & TES KONEKSI GITHUB
        function toggleTokenVisibility() {
            const input = document.getElementById("gitToken");
            const btn = document.getElementById("btnToggleTokenVisibility");
            if (!input || !btn) return;
            if (input.type === "password") {
                input.type = "text";
                btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                input.type = "password";
                btn.innerHTML = '<i class="fas fa-eye"></i>';
            }
        }

        function saveGitToken() {
            const token = document.getElementById("gitToken").value.trim();
            if (token) {
                localStorage.setItem("github_pat_token", token);
                updateTokenStatusText("✓ Token GitHub tersimpan di peramban.", true);
                showToast("Token GitHub tersimpan dengan aman di browser.");
            } else {
                localStorage.removeItem("github_pat_token");
                updateTokenStatusText("Token telah dihapus dari browser.", false);
                showToast("Token dihapus.", false);
                const feedback = document.getElementById("gitTestFeedback");
                if (feedback) feedback.style.display = "none";
            }
        }

        function updateTokenStatusText(msg, isSuccess) {
            const el = document.getElementById("tokenStatusText");
            if (el) {
                el.innerText = msg;
                el.style.color = isSuccess ? "#34d399" : "#f87171";
            }
        }

        async function testGitConnection() {
            const inputVal = document.getElementById("gitToken") ? document.getElementById("gitToken").value.trim() : "";
            const token = inputVal || getActiveGitToken();
            const feedback = document.getElementById("gitTestFeedback");
            const testBtn = document.getElementById("btnTestGitToken");

            if (!token) {
                showToast("Masukkan token GitHub PAT terlebih dahulu!", false);
                if (feedback) {
                    feedback.style.display = "block";
                    feedback.style.background = "rgba(239, 68, 68, 0.12)";
                    feedback.style.border = "1px solid rgba(239, 68, 68, 0.25)";
                    feedback.style.color = "#fca5a5";
                    feedback.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Token kosong. Masukkan GitHub PAT Anda terlebih dahulu di kotak input.';
                }
                return;
            }

            if (testBtn) {
                testBtn.disabled = true;
                testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menguji...';
            }

            try {
                const repoResp = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`, {
                    headers: {
                        "Authorization": `token ${token}`,
                        "Accept": "application/vnd.github.v3+json"
                    }
                });

                if (repoResp.status === 200) {
                    const repoData = await repoResp.json();
                    const canPush = repoData.permissions ? repoData.permissions.push : false;

                    let loginUser = "";
                    try {
                        const userResp = await fetch("https://api.github.com/user", {
                            headers: { "Authorization": `token ${token}`, "Accept": "application/vnd.github.v3+json" }
                        });
                        if (userResp.ok) {
                            const userData = await userResp.json();
                            loginUser = userData.login;
                        }
                    } catch (e) {}

                    if (feedback) {
                        feedback.style.display = "block";
                        feedback.style.background = "rgba(16, 185, 129, 0.12)";
                        feedback.style.border = "1px solid rgba(16, 185, 129, 0.3)";
                        feedback.style.color = "#6ee7b7";
                        feedback.innerHTML = `<i class="fas fa-check-circle" style="color:#10b981;"></i> <strong>Koneksi GitHub Terverifikasi!</strong><br>` +
                            `• Akun: <code>@${loginUser || REPO_OWNER}</code><br>` +
                            `• Target Repo: <code>${REPO_OWNER}/${REPO_NAME}</code><br>` +
                            `• Izin Tulis (Push): ${canPush ? '<span style="color:#10b981; font-weight:700;">AKTIF (Siap Simpan & Deploy)</span>' : '<span style="color:#f59e0b; font-weight:700;">HANYA BACA (Butuh scope repo)</span>'}`;
                    }
                    showToast("Koneksi GitHub terverifikasi aktif!");
                } else if (repoResp.status === 401) {
                    if (feedback) {
                        feedback.style.display = "block";
                        feedback.style.background = "rgba(239, 68, 68, 0.12)";
                        feedback.style.border = "1px solid rgba(239, 68, 68, 0.25)";
                        feedback.style.color = "#fca5a5";
                        feedback.innerHTML = '<i class="fas fa-times-circle" style="color:#ef4444;"></i> <strong>Autentikasi Gagal (401)</strong>: Token tidak valid atau sudah kadaluarsa (Bad credentials).';
                    }
                    showToast("Token GitHub tidak valid (401)!", false);
                } else if (repoResp.status === 404) {
                    if (feedback) {
                        feedback.style.display = "block";
                        feedback.style.background = "rgba(245, 158, 11, 0.12)";
                        feedback.style.border = "1px solid rgba(245, 158, 11, 0.25)";
                        feedback.style.color = "#fde68a";
                        feedback.innerHTML = `<i class="fas fa-exclamation-circle" style="color:#f59e0b;"></i> <strong>Repository Tidak Ditemukan (404)</strong>: Pastikan token memiliki centang scope <code>repo</code> untuk mengakses <code>${REPO_OWNER}/${REPO_NAME}</code>.`;
                    }
                    showToast("Repository tidak ditemukan atau token kurang izin scope repo!", false);
                } else {
                    throw new Error(`HTTP ${repoResp.status}`);
                }
            } catch (err) {
                if (feedback) {
                    feedback.style.display = "block";
                    feedback.style.background = "rgba(239, 68, 68, 0.12)";
                    feedback.style.border = "1px solid rgba(239, 68, 68, 0.25)";
                    feedback.style.color = "#fca5a5";
                    feedback.innerHTML = `<i class="fas fa-exclamation-triangle" style="color:#ef4444;"></i> Gagal menguji koneksi: ${err.message}`;
                }
                showToast("Gagal menguji koneksi: " + err.message, false);
            } finally {
                if (testBtn) {
                    testBtn.disabled = false;
                    testBtn.innerHTML = '<i class="fas fa-plug"></i> Tes Koneksi GitHub';
                }
            }
        }

        // ========================================================
