# Warung Makan Bukit Padangan

Website profil restoran keluarga dan reservasi meja untuk Warung Makan Bukit Padangan, Gunungwungkal, Pati.

Live website: https://syaahnhl.github.io/web-bukitpadangan/

## Ringkasan Project

Project ini adalah website frontend static berbasis HTML, CSS, dan JavaScript. Pengunjung dapat melihat informasi resto, katalog menu, area dan meja, denah 3D interaktif, galeri, paket acara, FAQ, serta mengirim reservasi melalui WhatsApp.

Website tidak menjalankan PHP atau koneksi MariaDB langsung di GitHub Pages. Data publik pada deployment static dibaca dari file JSON. File SQL disediakan sebagai rancangan database relasional untuk backend dinamis dan pengembangan lokal melalui MariaDB/MySQL.

## Fitur Utama

- Landing page restoran dan informasi lokasi.
- Katalog menu dari `menu.json`.
- Denah meja 3D menggunakan Three.js dan OrbitControls.
- Daftar meja interaktif dari `tables.json`.
- Detail meja dalam modal window, termasuk status, kapasitas, fasilitas, dan jadwal booking jika tersedia.
- Reservasi meja tanpa DP melalui WhatsApp.
- Pemesanan menu di tempat diarahkan ke Kaching Web Order.
- Galeri, photospot, paket acara, FAQ, ulasan, chatbot, dan modal detail menu.
- Portal admin pada `admin.html` untuk mengelola status meja secara lokal.
- Responsive layout untuk desktop dan mobile.

## Struktur Folder

```text
.
├── index.html                 # Halaman publik utama
├── admin.html                 # Portal admin static
├── style.css                  # Entry point CSS dan import stylesheet modular
├── css/                       # Style per area/fitur dan responsive rules
├── components/                # Partial HTML yang dimuat asynchronous
├── js/                        # Feature modules frontend
│   └── 3d/                    # Scene, terrain, buildings, tables, interaction
├── script.js                  # Script legacy/utility yang masih dipertahankan
├── tables3d.js                # Data/utility denah 3D legacy
├── menu.json                  # Data katalog publik
├── tables.json                # Data meja publik
├── gallery.json               # Data galeri publik
├── content.json               # Data konten publik
└── database/
    └── db_bukit_padangan.sql  # Schema MariaDB/MySQL backend dinamis
```

## Arsitektur Frontend

### 1. Static shell

`index.html` menyediakan HTML shell, metadata SEO, slot component, library Three.js, dan entry point JavaScript.

### 2. Asynchronous components

Slot dengan atribut `data-component` diisi oleh `js/component-loader.js`. Contoh component yang digunakan adalah `hero-weather.html`, `tables-3d.html`, `menu-catalog.html`, `gallery.html`, dan modal detail.

Pola ini memisahkan markup per fitur sehingga section publik tidak berada dalam satu file HTML monolitik.

### 3. Feature modules

- `js/menu.js`: membaca dan merender katalog menu.
- `js/tables.js`: membaca data meja, merender grid, membuka detail meja, dan mengatur pemilihan meja.
- `js/reservation.js`: mengatur modal dan form reservasi.
- `js/gallery.js`: galeri dan lightbox.
- `js/features.js`: fitur section, slider, dan navigasi spot.
- `js/chatbot.js`: widget chatbot.
- `js/main.js`: inisialisasi umum setelah component selesai dimuat.

Module yang membutuhkan element dari component memakai lookup setelah component selesai dimuat, bukan mengandalkan element yang belum ada pada awal parsing.

## Denah 3D

Denah 3D menggunakan Three.js. Alurnya:

```text
3d-config.js
    ↓
3d-scene.js       membuat Scene, Camera, Renderer, OrbitControls
    ↓
3d-terrain.js     membuat terrain/lingkungan
    ↓
3d-buildings-*.js membuat bangunan dan area resto
    ↓
3d-nature.js      menambahkan elemen alam
    ↓
3d-tables.js      menambahkan meja dari data
    ↓
3d-interaction.js menangani klik/interaksi
```

`posisi_3d` pada schema SQL disiapkan untuk menyimpan koordinat meja `{x,y,z}` pada backend dinamis. Deployment static saat ini menggunakan `tables.json` sebagai sumber data publik.

## Database dan Storage

### Database relasional

File `database/db_bukit_padangan.sql` adalah dump MariaDB 10.4.32 dengan engine InnoDB dan character set `utf8mb4`. Schema berisi 9 tabel:

| Kelompok | Tabel | Peran |
|:---|:---|:---|
| Inti website | `pengelola` | Akun admin/pengelola portal |
| Inti website | `zona_area` | Master area tempat duduk |
| Inti website | `meja` | Meja, status, kapasitas, dan posisi 3D |
| Inti website | `menu` | Katalog hidangan |
| Inti website | `reservasi` | Data reservasi meja tanpa DP |
| Integrasi POS | `kaching_menus` | Mirror menu dari POS Kaching |
| Integrasi POS | `kaching_tables` | Data meja dari POS Kaching |
| Integrasi POS | `kaching_reservations` | Reservasi yang diteruskan ke POS |
| Integrasi POS | `kaching_pos_sync` | Log sinkronisasi website dan POS |

Relasi inti:

```text
zona_area 1 ──── N meja
meja      1 ──── N reservasi
```

Reservasi meja mengikuti aturan bisnis tanpa DP. Nilai `nominal_dp` pada tabel inti dan `dp_amount` pada tabel integrasi memiliki default `0.00`; menu dipesan di tempat melalui POS.

### JSON pada GitHub Pages

Karena GitHub Pages hanya menyajikan static files, website publik membaca:

- `menu.json` untuk katalog menu.
- `tables.json` untuk data dan status meja publik.
- `gallery.json` untuk galeri.
- `content.json` untuk konten.

Ini adalah arsitektur hybrid: JSON melayani frontend static saat ini, sedangkan SQL menjadi schema persistence untuk backend dinamis.

## Menjalankan Lokal

### Opsi paling sederhana

Buka `index.html` langsung di browser untuk melihat halaman dasar. Untuk component loader, fetch JSON, dan Three.js yang lebih konsisten, gunakan local HTTP server:

```bash
cd web-bukitpadangan
python -m http.server 8000
```

Lalu buka http://127.0.0.1:8000/.

### Import database lokal

1. Jalankan Apache dan MySQL/MariaDB melalui XAMPP.
2. Buka http://localhost/phpmyadmin/.
3. Buat database `db_bukit_padangan`.
4. Pilih menu **Import**.
5. Pilih `database/db_bukit_padangan.sql`.
6. Setelah import, tabel dan relasi dapat dilihat melalui menu **Structure** dan **Designer**.

Import database lokal tidak diperlukan untuk menampilkan frontend GitHub Pages karena frontend static menggunakan JSON.

## Alur Reservasi

```text
Pengunjung memilih meja
        ↓
Website menampilkan detail meja dan jadwal
        ↓
Pengunjung mengisi data reservasi
        ↓
Reservasi diteruskan melalui WhatsApp
        ↓
Menu dipesan di tempat melalui POS Kaching
```

Reservasi meja tidak memakai DP. Detail implementasi bisnis dan struktur kolom dapat dilihat langsung di `database/db_bukit_padangan.sql`.

## Deployment

Repository ini dipublikasikan dengan GitHub Pages dari branch `main` pada root repository. Setiap perubahan frontend perlu dipush ke `main`, lalu diverifikasi melalui URL live.

## Presentasi Singkat

> Website ini merupakan frontend static untuk profil restoran dan reservasi meja. Data publik dibaca dari JSON karena deployment menggunakan GitHub Pages. Untuk backend dinamis, project menyediakan schema MariaDB/MySQL berisi 9 tabel inti dan integrasi POS Kaching. Denah meja dibuat interaktif menggunakan Three.js, sedangkan reservasi meja saat ini diarahkan ke WhatsApp tanpa DP dan pemesanan menu dilakukan di tempat.
