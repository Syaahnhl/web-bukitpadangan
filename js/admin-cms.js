        // TAB 1: KONTEN LANDING PAGE
                async function loadLandingContent() {
            try {
                const res = await fetch("content.json");
                if (res.ok) {
                    localContentData = await res.json();
                    populateContentForm(localContentData);
                }
            } catch (e) {
                console.error("Gagal load content.json:", e);
            }
        }

        function populateContentForm(data) {
            if (!data) return;
            if (data.promo) {
                document.getElementById("showPromo").checked = !!data.promo.show;
                document.getElementById("promoText").value = data.promo.text || "";
            }
            if (data.hero) {
                document.getElementById("heroSubtitle").value = data.hero.subtitle || "";
                document.getElementById("heroTitle").value = data.hero.title || "";
                document.getElementById("heroDesc").value = data.hero.desc || "";
            }
            if (data.about) {
                document.getElementById("aboutTitle").value = data.about.title || "";
                document.getElementById("aboutDesc").value = data.about.desc || "";
            }
            if (data.event) {
                document.getElementById("showEvent").checked = !!data.event.show;
                document.getElementById("eventTitle").value = data.event.title || "";
                document.getElementById("eventDesc").value = data.event.desc || "";
            }
            if (data.contacts) {
                document.getElementById("waAdmin1").value = data.contacts.wa_admin1 || "";
                document.getElementById("waAdmin2").value = data.contacts.wa_admin2 || "";
                document.getElementById("igLink").value = data.contacts.instagram || "";
                document.getElementById("fbLink").value = data.contacts.facebook || "";
            }
        }

        async function handleSaveContent(e) {
            e.preventDefault();
            const token = getActiveGitToken();
            if (!token) {
                alert("Koneksi penyimpanan cloud belum tersedia.");
                return;
            }

            const btn = document.getElementById("btnSaveContentSubmit");
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan ke GitHub...`;

            const updatedContent = {
                promo: {
                    show: document.getElementById("showPromo").checked,
                    text: document.getElementById("promoText").value.trim()
                },
                hero: {
                    title: document.getElementById("heroTitle").value.trim(),
                    subtitle: document.getElementById("heroSubtitle").value.trim(),
                    desc: document.getElementById("heroDesc").value.trim()
                },
                about: {
                    title: document.getElementById("aboutTitle").value.trim(),
                    desc: document.getElementById("aboutDesc").value.trim()
                },
                event: {
                    show: document.getElementById("showEvent").checked,
                    title: document.getElementById("eventTitle").value.trim(),
                    desc: document.getElementById("eventDesc").value.trim()
                },
                contacts: {
                    wa_admin1: document.getElementById("waAdmin1").value.trim(),
                    wa_admin2: document.getElementById("waAdmin2").value.trim(),
                    instagram: document.getElementById("igLink").value.trim(),
                    facebook: document.getElementById("fbLink").value.trim()
                }
            };

            const success = await pushJsonToGitHub("content.json", updatedContent, "feat(admin): update landing page content & promo settings");
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-cloud-arrow-up"></i> Simpan & Perbarui Teks Website`;

            if (success) {
                showToast("Teks website berhasil diperbarui! Netlify akan merilis update dalam 1-2 menit.");
            }
        }

        