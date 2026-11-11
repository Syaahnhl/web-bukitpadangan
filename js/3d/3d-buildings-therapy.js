/**
 * 3d-buildings-therapy.js - Fish Therapy Pool & Eastern Wing 2
 */

function buildFishTherapyPool() {
    const group = new THREE.Group();
    // Posisi acuan global: sejajar di sebelah kanan Indoor Timur 1 (X = 21, Z = 0)
    group.position.set(21, 0, 0);

    const stoneMat       = new THREE.MeshStandardMaterial({ color: 0x272e38, roughness: 0.85, metalness: 0.05 });
    const curbMat        = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.9, metalness: 0.05 });
    const woodBenchMat   = new THREE.MeshStandardMaterial({ color: 0x7c4a27, roughness: 0.6, metalness: 0.05 });
    const woodTrimMat    = new THREE.MeshStandardMaterial({ color: 0x331c0e, roughness: 0.7, metalness: 0.05 });
    const fenceMat       = new THREE.MeshStandardMaterial({ color: 0x422a18, roughness: 0.75 });
    const soilMat        = new THREE.MeshStandardMaterial({ color: 0x3d3023, roughness: 0.95 });
    const mossMat        = new THREE.MeshStandardMaterial({ color: 0x3a5a2a, roughness: 0.9 });
    const gutterMat      = new THREE.MeshStandardMaterial({ color: 0x1e242b, roughness: 0.8 });
    const riverPebbleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });

    const areaW = 9.8;
    const areaD = 4.1;
    const areaCenterZ = 0.15; // Z membentang dari -1.90 s/d +2.20

    // Fondasi Plin Bawah Area (Menjaga level lantai konsisten dengan Indoor Timur 1 & 2)
    const baseFoundation = new THREE.Mesh(new THREE.BoxGeometry(areaW, 0.12, areaD), curbMat);
    baseFoundation.position.set(0, 0.06, areaCenterZ);
    group.add(baseFoundation);

    // =========================================================================
    // 1. JALUR AKSES 2 ORANG (Sisi Paling BAWAH: Z = +1.05 s/d +2.20, Depth: 1.15m)
    // =========================================================================
    // Lebar jalur cukup untuk 2 orang berjalan berdampingan, bebas meja makan
    const walkwayGeo = new THREE.BoxGeometry(areaW, 0.14, 1.15);
    const walkwayMat = new THREE.MeshStandardMaterial({ color: 0x3e4854, roughness: 0.8 });
    const walkway = new THREE.Mesh(walkwayGeo, walkwayMat);
    walkway.position.set(0, 0.13, 1.625);
    group.add(walkway);

    // List Pembatas Kayu Jalur Akses (Batas Bawah & Samping)
    const southCurb = new THREE.Mesh(new THREE.BoxGeometry(areaW, 0.18, 0.10), woodTrimMat);
    southCurb.position.set(0, 0.20, 2.15);
    group.add(southCurb);

    const westWalkCurb = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.18, 1.15), woodTrimMat);
    westWalkCurb.position.set(-4.85, 0.20, 1.625);
    group.add(westWalkCurb);

    const eastWalkCurb = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.18, 1.15), woodTrimMat);
    eastWalkCurb.position.set(4.85, 0.20, 1.625);
    group.add(eastWalkCurb);

    // Pembatas Naik (Raised Curb) Antara Jalur Akses dan Kolam Terapi Ikan
    const walkPoolDivider = new THREE.Mesh(new THREE.BoxGeometry(areaW, 0.24, 0.12), stoneMat);
    walkPoolDivider.position.set(0, 0.20, 1.05);
    group.add(walkPoolDivider);

    // =========================================================================
    // 2. KOLAM TERAPI IKAN (Bagian Utama / Tengah: Z = -0.65 s/d +1.00, Depth: 1.65m)
    // =========================================================================
    const poolBasinW = 9.4;
    const poolBasinD = 1.65;
    const poolCenterZ = 0.175;

    // Dinding Luar Kolam Batu Andesite
    const poolBasin = new THREE.Mesh(new THREE.BoxGeometry(poolBasinW, 0.42, poolBasinD), stoneMat);
    poolBasin.position.set(0, 0.21, poolCenterZ);
    group.add(poolBasin);

    // Air Kolam Terapi Jernih Cyan Transparan
    const poolWaterGeo = new THREE.BoxGeometry(poolBasinW - 0.5, 0.08, poolBasinD - 0.45);
    const poolWaterMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.08,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85
    });
    const poolWater = new THREE.Mesh(poolWaterGeo, poolWaterMat);
    poolWater.position.set(0, 0.36, poolCenterZ);
    group.add(poolWater);

    // Undak Pijakan / Rendam Kaki di Dalam Air Kolam
    const stepGeo = new THREE.BoxGeometry(poolBasinW - 0.8, 0.12, 0.35);
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const submergedStep = new THREE.Mesh(stepGeo, stepMat);
    submergedStep.position.set(0, 0.18, 0.65);
    group.add(submergedStep);

    // Ikan Terapi Berenang (Garra Rufa / Mini Koi)
    const fishGeo = new THREE.ConeGeometry(0.08, 0.32, 5);
    const fishMatOrange = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    const fishMatSilver = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
    const fishCoords = [
        [-3.2, 0.1], [-1.8, 0.4], [-0.5, -0.1], [1.2, 0.3], [2.6, -0.2],
        [-2.4, -0.3], [0.2, 0.2], [1.9, 0.5], [3.4, 0.2], [-0.9, 0.5]
    ];
    fishCoords.forEach(([fx, fz], idx) => {
        const fish = new THREE.Mesh(fishGeo, idx % 2 === 0 ? fishMatOrange : fishMatSilver);
        fish.rotation.x = Math.PI / 2;
        fish.rotation.z = (idx * 0.75) % (Math.PI * 2);
        fish.position.set(fx, 0.34, fz);
        group.add(fish);
    });

    // STRUKTUR DUDUKAN / KURSI PENGUNJUNG DI PINGGIR KOLAM TERAPI IKAN
    // Pengunjung duduk di pinggir kolam menghadap air, kaki dapat dimasukkan ke dalam kolam
    // Dudukan Sisi Bawah (Menghadap Utara ke arah kolam)
    const benchSouthGeo = new THREE.BoxGeometry(9.0, 0.10, 0.40);
    const benchSouth = new THREE.Mesh(benchSouthGeo, woodBenchMat);
    benchSouth.position.set(0, 0.45, 0.86);
    group.add(benchSouth);

    // Kaki / Penopang Bangku Dudukan Sisi Bawah
    [-4.0, -2.4, -0.8, 0.8, 2.4, 4.0].forEach(bx => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.40, 0.36), woodTrimMat);
        leg.position.set(bx, 0.20, 0.86);
        group.add(leg);
    });

    // Sandaran / Handrail Pembatas di Belakang Bangku Dudukan
    const backrailGeo = new THREE.BoxGeometry(9.0, 0.08, 0.08);
    const backrail = new THREE.Mesh(backrailGeo, woodTrimMat);
    backrail.position.set(0, 0.72, 1.04);
    group.add(backrail);

    [-4.2, -2.1, 0, 2.1, 4.2].forEach(px => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 0.08), woodTrimMat);
        post.position.set(px, 0.46, 1.04);
        group.add(post);
    });

    // Dudukan Sisi Kiri (Barat) Mengikuti Sisi Kolam
    const benchWest = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.10, 1.30), woodBenchMat);
    benchWest.position.set(-4.45, 0.45, poolCenterZ);
    group.add(benchWest);

    // Dudukan Sisi Kanan (Timur) Mengikuti Sisi Kolam
    const benchEast = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.10, 1.30), woodBenchMat);
    benchEast.position.set(4.45, 0.45, poolCenterZ);
    group.add(benchEast);

    // =========================================================================
    // 3. SELOKAN KECIL (Pemisah Antara Kolam dan Kandang: Z = -0.98 s/d -0.68)
    // =========================================================================
    // Selokan kecil memanjang horizontal mengikuti lebar area terapi ikan
    const gutterW = 9.6;
    const gutterD = 0.30;
    const gutterCenterZ = -0.83;

    // Palung / Saluran Air Selokan
    const gutterTrough = new THREE.Mesh(new THREE.BoxGeometry(gutterW, 0.18, gutterD), gutterMat);
    gutterTrough.position.set(0, 0.14, gutterCenterZ);
    group.add(gutterTrough);

    // Dasar Selokan Berbatu Kerikil Alami
    const gutterBed = new THREE.Mesh(new THREE.BoxGeometry(gutterW - 0.1, 0.04, gutterD - 0.08), riverPebbleMat);
    gutterBed.position.set(0, 0.10, gutterCenterZ);
    group.add(gutterBed);

    // Air Mengalir Dangkal di Dalam Selokan Kecil
    const streamWaterGeo = new THREE.BoxGeometry(gutterW - 0.1, 0.03, gutterD - 0.08);
    const streamWaterMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.1,
        transparent: true,
        opacity: 0.75
    });
    const streamWater = new THREE.Mesh(streamWaterGeo, streamWaterMat);
    streamWater.position.set(0, 0.13, gutterCenterZ);
    group.add(streamWater);

    // Bibir Batu Pembatas Selokan Sisi Bawah (Menghadap Kolam Terapi)
    const gutterSouthBorder = new THREE.Mesh(new THREE.BoxGeometry(gutterW, 0.18, 0.07), curbMat);
    gutterSouthBorder.position.set(0, 0.23, -0.68);
    group.add(gutterSouthBorder);

    // Bibir Batu Pembatas Selokan Sisi Atas (Menghadap Kandang Labi-Labi)
    const gutterNorthBorder = new THREE.Mesh(new THREE.BoxGeometry(gutterW, 0.18, 0.07), curbMat);
    gutterNorthBorder.position.set(0, 0.23, -0.98);
    group.add(gutterNorthBorder);

    // =========================================================================
    // 4. KANDANG LABI-LABI (Tepat DI ATAS Selokan Kecil: Z = -1.90 s/d -1.02)
    // =========================================================================
    // Enclosure hewan persegi panjang berpagar dengan HANYA 1 EKOR LABI-LABI
    const cageW = 9.6;
    const cageD = 0.88;
    const cageCenterZ = -1.46;

    // Substrat Tanah & Pasir Alami Kandang
    const cageBed = new THREE.Mesh(new THREE.BoxGeometry(cageW, 0.16, cageD), soilMat);
    cageBed.position.set(0, 0.13, cageCenterZ);
    group.add(cageBed);

    // Hamparan Rumput / Lumut Hijau di Sudut Kandang
    const mossPatch1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.02, 0.72), mossMat);
    mossPatch1.position.set(-2.2, 0.22, cageCenterZ);
    group.add(mossPatch1);

    const mossPatch2 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.02, 0.72), mossMat);
    mossPatch2.position.set(3.0, 0.22, cageCenterZ);
    group.add(mossPatch2);

    // Kubangan Air / Lumpur Dangkal Labi-Labi
    const wallowGeo = new THREE.BoxGeometry(1.6, 0.04, 0.65);
    const wallowMat = new THREE.MeshStandardMaterial({ color: 0x223326, roughness: 0.4, transparent: true, opacity: 0.9 });
    const wallow = new THREE.Mesh(wallowGeo, wallowMat);
    wallow.position.set(0.6, 0.22, cageCenterZ);
    group.add(wallow);

    // Batu Berjemur Alami (Basking Rock)
    const rockGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.14, 8);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.scale.set(1.4, 1.0, 1.0);
    rock.position.set(-0.55, 0.25, -1.45);
    group.add(rock);

    // Batang Kayu Alami Tempat Istirahat
    const logGeo = new THREE.CylinderGeometry(0.08, 0.09, 1.5, 8);
    const logMat = new THREE.MeshStandardMaterial({ color: 0x2e1d11, roughness: 0.9 });
    const log = new THREE.Mesh(logGeo, logMat);
    log.rotation.z = Math.PI / 2;
    log.position.set(-2.2, 0.25, -1.35);
    group.add(log);

    // PAGAR ENCLOSURE KANDANG LABI-LABI
    // Pagar kayu berjeruji keliling kandang (Tinggi 0.75m)
    const postGeo = new THREE.BoxGeometry(0.10, 0.75, 0.10);
    const cagePostsX = [-4.75, -3.2, -1.6, 0, 1.6, 3.2, 4.75];
    cagePostsX.forEach(px => {
        // Tiang Belakang (Utara / Atas)
        const pN = new THREE.Mesh(postGeo, fenceMat);
        pN.position.set(px, 0.50, -1.88);
        group.add(pN);

        // Tiang Depan (Selatan, menghadap selokan kecil)
        const pS = new THREE.Mesh(postGeo, fenceMat);
        pS.position.set(px, 0.50, -1.02);
        group.add(pS);
    });

    // Tiang Samping Barat & Timur
    [-1.45].forEach(pz => {
        const pW = new THREE.Mesh(postGeo, fenceMat);
        pW.position.set(-4.75, 0.50, pz);
        group.add(pW);

        const pE = new THREE.Mesh(postGeo, fenceMat);
        pE.position.set(4.75, 0.50, pz);
        group.add(pE);
    });

    // Rel Pagar Horizontal (Atas & Tengah)
    const railNorthTop = new THREE.Mesh(new THREE.BoxGeometry(cageW, 0.06, 0.06), fenceMat);
    railNorthTop.position.set(0, 0.82, -1.88);
    group.add(railNorthTop);

    const railNorthMid = new THREE.Mesh(new THREE.BoxGeometry(cageW, 0.06, 0.06), fenceMat);
    railNorthMid.position.set(0, 0.52, -1.88);
    group.add(railNorthMid);

    const railSouthTop = new THREE.Mesh(new THREE.BoxGeometry(cageW, 0.06, 0.06), fenceMat);
    railSouthTop.position.set(0, 0.82, -1.02);
    group.add(railSouthTop);

    const railSouthMid = new THREE.Mesh(new THREE.BoxGeometry(cageW, 0.06, 0.06), fenceMat);
    railSouthMid.position.set(0, 0.52, -1.02);
    group.add(railSouthMid);

    const railWestTop = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, cageD), fenceMat);
    railWestTop.position.set(-4.75, 0.82, cageCenterZ);
    group.add(railWestTop);

    const railEastTop = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, cageD), fenceMat);
    railEastTop.position.set(4.75, 0.82, cageCenterZ);
    group.add(railEastTop);

    // Kawat Pelindung / Wire Mesh Transparan Halus
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x1f2937, wireframe: true });
    const wireFront = new THREE.Mesh(new THREE.PlaneGeometry(cageW, 0.55), wireMat);
    wireFront.position.set(0, 0.52, -1.01);
    group.add(wireFront);

    // Plang Identitas Kandang Labi-Labi di Tengah Pagar Depan
    const cageSign = create3DSignboard("KANDANG LABI-LABI (1 EKOR)", 3.4, 0.45);
    cageSign.position.set(0, 1.05, -1.02);
    group.add(cageSign);

    // =========================================================================
    // HANYA 1 LABI-LABI (Asiatic Softshell Turtle / Amyda cartilaginea)
    // JANGAN membuat lebih dari 1 labi-labi!
    // =========================================================================
    const turtleGroup = new THREE.Group();
    turtleGroup.position.set(-0.35, 0.28, -1.42);
    turtleGroup.rotation.y = 0.35; // Sedikit miring menghadap ke depan

    const turtleMat = new THREE.MeshStandardMaterial({ color: 0x3d492c, roughness: 0.65, metalness: 0.05 });
    const skirtMat  = new THREE.MeshStandardMaterial({ color: 0x4d5b38, roughness: 0.7 });
    const fleshMat  = new THREE.MeshStandardMaterial({ color: 0x556340, roughness: 0.7 });
    const snoutMat  = new THREE.MeshStandardMaterial({ color: 0x384428, roughness: 0.6 });

    // 1. Tempurung Pipih Lunak (Carapace Khas Labi-Labi Bulus)
    const carapaceGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.06, 16);
    const carapace = new THREE.Mesh(carapaceGeo, turtleMat);
    carapace.scale.set(0.9, 1.0, 1.25); // Lonjong pipih
    carapace.position.y = 0.04;
    turtleGroup.add(carapace);

    // Pinggiran Tempurung Lunak (Soft Leathery Skirt)
    const skirtGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.02, 16);
    const skirt = new THREE.Mesh(skirtGeo, skirtMat);
    skirt.scale.set(0.92, 1.0, 1.28);
    skirt.position.y = 0.015;
    turtleGroup.add(skirt);

    // 2. Leher Menjulur Panjang Lentur
    const neckGeo = new THREE.CylinderGeometry(0.04, 0.055, 0.16, 8);
    const neck = new THREE.Mesh(neckGeo, fleshMat);
    neck.rotation.x = Math.PI / 3;
    neck.position.set(0, 0.07, 0.36);
    turtleGroup.add(neck);

    // 3. Kepala Segitiga Meruncing
    const headGeo = new THREE.ConeGeometry(0.05, 0.10, 8);
    const head = new THREE.Mesh(headGeo, fleshMat);
    head.rotation.x = Math.PI / 2;
    head.position.set(0, 0.12, 0.46);
    turtleGroup.add(head);

    // Moncong Tabung Khas Labi-Labi (Tubular Snorkel Snout / Proboscis)
    const snoutGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.05, 6);
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 0.12, 0.52);
    turtleGroup.add(snout);

    // 2 Mata Hitam Kecil
    const eyeGeo = new THREE.SphereGeometry(0.012, 6, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.035, 0.14, 0.44);
    turtleGroup.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.035, 0.14, 0.44);
    turtleGroup.add(eyeR);

    // 4. Kaki Berselaput Pipih Mendayung (4 Webbed Paddles)
    const flipperGeo = new THREE.BoxGeometry(0.12, 0.02, 0.18);
    
    // Kaki Depan Kiri & Kanan
    const fFL = new THREE.Mesh(flipperGeo, fleshMat);
    fFL.position.set(-0.25, 0.01, 0.22);
    fFL.rotation.y = Math.PI / 4;
    turtleGroup.add(fFL);

    const fFR = new THREE.Mesh(flipperGeo, fleshMat);
    fFR.position.set(0.25, 0.01, 0.22);
    fFR.rotation.y = -Math.PI / 4;
    turtleGroup.add(fFR);

    // Kaki Belakang Kiri & Kanan
    const fBL = new THREE.Mesh(flipperGeo, fleshMat);
    fBL.position.set(-0.22, 0.01, -0.20);
    fBL.rotation.y = -Math.PI / 4;
    turtleGroup.add(fBL);

    const fBR = new THREE.Mesh(flipperGeo, fleshMat);
    fBR.position.set(0.22, 0.01, -0.20);
    fBR.rotation.y = Math.PI / 4;
    turtleGroup.add(fBR);

    // 5. Ekor Pendek Meruncing
    const tailGeo = new THREE.ConeGeometry(0.025, 0.08, 6);
    const tail = new THREE.Mesh(tailGeo, fleshMat);
    tail.rotation.x = -Math.PI / 2;
    tail.position.set(0, 0.02, -0.36);
    turtleGroup.add(tail);

    group.add(turtleGroup);

    // =========================================================================
    // SIGNBOARD UTAMA AREA & PENCAHAYAAN
    // =========================================================================
    const mainSign = create3DSignboard("KOLAM TERAPI IKAN", 4.6, 0.75);
    mainSign.position.set(0, 2.9, 2.18);
    group.add(mainSign);

    // 2 Tiang Plang Utama
    const signPostGeo = new THREE.BoxGeometry(0.16, 2.9, 0.16);
    const signPostL = new THREE.Mesh(signPostGeo, woodTrimMat);
    signPostL.position.set(-2.2, 1.45, 2.18);
    group.add(signPostL);

    const signPostR = new THREE.Mesh(signPostGeo, woodTrimMat);
    signPostR.position.set(2.2, 1.45, 2.18);
    group.add(signPostR);

    // Lampu Area Hangat Lembut
    const poolLight = new THREE.PointLight(0x38bdf8, 1.6, 12);
    poolLight.position.set(0, 2.4, poolCenterZ);
    group.add(poolLight);

    const warmLight = new THREE.PointLight(0xffbe6b, 1.4, 10);
    warmLight.position.set(0, 2.2, 1.6);
    group.add(warmLight);

    scene3D.add(group);
}

/**
 * Build Indoor Timur 2
 * 
 * Sesuai Spesifikasi Revisi Denah 3D:
 * - Berada DI SEBELAH KANAN Terapi Ikan (X = 32, Z = 0)
 * - Bentuknya SAMA KONSEP dengan Indoor Timur 1:
 *   - Persegi panjang memanjang
 *   - Bangunan kayu tertutup/terbuka sebagian dengan balustrade & tiang kayu kokoh
 *   - Tidak ada panggung, tidak ada live music
 * - PERBEDAANNYA:
 *   - Indoor Timur 2 = HANYA 2 MEJA (IT2-17 dan IT2-18)
 *   - Meja disusun menyamping/memanjang mengikuti bangunan
 *   - Masing-masing meja memiliki kursi (kapasitas 4–6 orang)
 *   - Bagian BAWAH meja dibuat relatif mepet dengan batas bawah bangunan (Z = 1.0)
 *   - Bagian ATAS bangunan menyisakan akses jalan sekitar selebar 2 orang (Z = -1.83 s/d 0.34)
 *   - JANGAN menambahkan meja ketiga!
 */
function buildIndoorTimur2() {
    const group = new THREE.Group();
    // Posisi acuan global Indoor Timur 2: sejajar di sebelah kanan Terapi Ikan (X = 32, Z = 0)
    group.position.set(32, 0, 0);

    const teakMat       = new THREE.MeshStandardMaterial({ color: 0x4a2e1b, roughness: 0.6, metalness: 0.05 });
    const beamMat       = new THREE.MeshStandardMaterial({ color: 0x331c0e, roughness: 0.7, metalness: 0.05 });
    const floorMat      = new THREE.MeshStandardMaterial({ color: 0x5a3d24, roughness: 0.7, metalness: 0.05 });
    const plinthMat     = new THREE.MeshStandardMaterial({ color: 0x2b170a, roughness: 0.8 });
    const balustradeMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.7 });

    // Dimensi Ruangan Persegi Panjang (Width: 9.8m, Depth: 4.1m) - Tepat sama dengan Indoor Timur 1 & Terapi Ikan
    const roomW = 9.8;
    const roomD = 4.1;
    const roomCenterZ = 0.15; // Z membentang dari -1.90 s/d +2.20

    // 1. Lantai Bangunan Kayu Persegi Panjang (9.8m x 0.22m x 4.1m)
    const floorGeo = new THREE.BoxGeometry(roomW, 0.22, roomD);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, 0.11, roomCenterZ);
    floor.receiveShadow = false;
    group.add(floor);

    // List Plin Lantai Kayu Sekeliling Ruangan
    const plinthNorth = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.12, 0.08), plinthMat);
    plinthNorth.position.set(0, 0.28, -1.86);
    group.add(plinthNorth);

    const plinthSouth = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.12, 0.08), plinthMat);
    plinthSouth.position.set(0, 0.28, 2.16);
    group.add(plinthSouth);

    const plinthWest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, roomD), plinthMat);
    plinthWest.position.set(-4.86, 0.28, roomCenterZ);
    group.add(plinthWest);

    const plinthEast = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, roomD), plinthMat);
    plinthEast.position.set(4.86, 0.28, roomCenterZ);
    group.add(plinthEast);

    // 2. Dinding Pembatas Rendah Sejajar (Rustic Balustrade h: 0.95m sekeliling ruangan)
    // Dinding Barat (Kiri)
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.95, roomD - 0.1), balustradeMat);
    westWall.position.set(-4.83, 0.695, roomCenterZ);
    group.add(westWall);

    const westRail = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, roomD), teakMat);
    westRail.position.set(-4.83, 1.21, roomCenterZ);
    group.add(westRail);

    // Dinding Timur (Kanan)
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.95, roomD - 0.1), balustradeMat);
    eastWall.position.set(4.83, 0.695, roomCenterZ);
    group.add(eastWall);

    const eastRail = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, roomD), teakMat);
    eastRail.position.set(4.83, 1.21, roomCenterZ);
    group.add(eastRail);

    // Dinding Utara (Atas / Belakang Jalur Akses)
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(roomW - 0.2, 0.95, 0.14), balustradeMat);
    northWall.position.set(0, 0.695, -1.83);
    group.add(northWall);

    const northRail = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.08, 0.22), teakMat);
    northRail.position.set(0, 1.21, -1.83);
    group.add(northRail);

    // Dinding Selatan (Bawah / Mepet Belakang Meja)
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(roomW - 0.2, 0.95, 0.14), balustradeMat);
    southWall.position.set(0, 0.695, 2.13);
    group.add(southWall);

    const southRail = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.08, 0.22), teakMat);
    southRail.position.set(0, 1.21, 2.13);
    group.add(southRail);

    // 3. Tiang Struktural Kayu Jati Solid Persegi (6 Kolom Kokoh)
    const postGeo = new THREE.BoxGeometry(0.20, 2.8, 0.20);
    const postCoords = [
        [-4.75, -1.80], [0.0, -1.80], [4.75, -1.80], // 3 Tiang Dinding Atas
        [-4.75,  2.10], [0.0,  2.10], [4.75,  2.10]  // 3 Tiang Dinding Bawah
    ];

    postCoords.forEach(([px, pz]) => {
        const post = new THREE.Mesh(postGeo, teakMat);
        post.position.set(px, 1.51, pz);
        group.add(post);

        // Umpak / Alas Batu Tiang
        const baseStone = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.32), plinthMat);
        baseStone.position.set(px, 0.20, pz);
        group.add(baseStone);
    });

    // 4. Balok Perimeter Atas (Ring Beam Rangka Atas Terbuka Plong)
    const bNorth = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.16, 0.16), beamMat);
    bNorth.position.set(0, 2.83, -1.80);
    group.add(bNorth);

    const bSouth = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.16, 0.16), beamMat);
    bSouth.position.set(0, 2.83, 2.10);
    group.add(bSouth);

    const bWest = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, roomD), beamMat);
    bWest.position.set(-4.75, 2.83, roomCenterZ);
    group.add(bWest);

    const bEast = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, roomD), beamMat);
    bEast.position.set(4.75, 2.83, roomCenterZ);
    group.add(bEast);

    // 5. Pencahayaan Lembut & Plang Nama Ruangan
    const roomLight = new THREE.PointLight(0xffbe6b, 2.0, 12);
    roomLight.position.set(0, 2.6, roomCenterZ);
    group.add(roomLight);

    const headerSign = create3DSignboard("INDOOR TIMUR 2", 3.8, 0.7);
    headerSign.position.set(0, 3.25, 2.18);
    group.add(headerSign);

    scene3D.add(group);
}

/**
 * Build Sunset Indicator (Arah Barat / Kiri)
 */
