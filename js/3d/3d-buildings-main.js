/**
 * 3d-buildings-main.js - Structural Architecture (Indoor Utama, Mushola, Cashier)
 */

function buildMushola() {
    const group = new THREE.Group();
    group.position.set(-10, 0, -24);

    // Foundation & Porch Veranda
    const baseGeo = new THREE.BoxGeometry(10.5, 0.4, 10.5);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x2d3748 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    base.receiveShadow = true;
    group.add(base);

    // Veranda Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.2, 8);
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0xd4a373 });
    [[-4.5, 4.5], [4.5, 4.5], [-4.5, 1.5], [4.5, 1.5]].forEach(([px, pz]) => {
        const p = new THREE.Mesh(pillarGeo, pillarMat);
        p.position.set(px, 1.8, pz);
        group.add(p);
    });

    // Main Walls (Warm Off-White)
    const wallGeo = new THREE.BoxGeometry(9.2, 3.6, 7.8);
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.set(0, 2.0, -0.8);
    walls.castShadow = true;
    walls.receiveShadow = true;
    group.add(walls);

    // Green Pyramid Hip Roof
    const roofGeo = new THREE.ConeGeometry(7.8, 3.0, 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x1e3a24 }); // Dark Islamic Green
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 5.3, -0.6);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // Gold Crescent Finial on Roof
    const finialGeo = new THREE.SphereGeometry(0.38, 16, 16);
    const finialMat = new THREE.MeshBasicMaterial({ color: 0xd4af37 });
    const finial = new THREE.Mesh(finialGeo, finialMat);
    finial.position.set(0, 7.0, -0.6);
    group.add(finial);

    // Entrance Archway & Door
    const doorGeo = new THREE.BoxGeometry(2.6, 2.8, 0.1);
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x22381b });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 1.6, 3.12);
    group.add(door);

    // Green Prayer Carpet inside
    const carpetGeo = new THREE.PlaneGeometry(6.5, 5.0);
    const carpetMat = new THREE.MeshLambertMaterial({ color: 0x155e2d, side: THREE.DoubleSide });
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.42, -0.8);
    group.add(carpet);

        // Prominent Signboard "MUSHOLA BUKIT PADANGAN"
    const sign = create3DSignboard("MUSHOLA BUKIT PADANGAN", 5.6, 1.05);
    sign.position.set(0, 2.6, 4.4);
    group.add(sign);

    // Interior Warm Light
    const light = new THREE.PointLight(0xffe8ba, 2.2, 18);
    light.position.set(0, 3.0, 0);
    group.add(light);

    scene3D.add(group);
}

/**
 * Build 2 Toilets & External Keran Wudhu (Lingkaran Merah Kanan - Fasilitas Sanitasi)
 */
function buildToiletsAndWudhu() {
    const group = new THREE.Group();
    group.position.set(4, 0, -24);

    // Foundation
    const baseGeo = new THREE.BoxGeometry(8.5, 0.4, 8.0);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    base.receiveShadow = true;
    group.add(base);

    // Toilet Building (2 Cubicles)
    const wallGeo = new THREE.BoxGeometry(7.6, 3.2, 5.0);
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.set(0, 1.8, -1.0);
    walls.castShadow = true;
    walls.receiveShadow = true;
    group.add(walls);

    // Flat Roof with overhang
    const roofGeo = new THREE.BoxGeometry(8.4, 0.3, 5.8);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 3.5, -1.0);
    roof.castShadow = true;
    group.add(roof);

    // 2 Doors: Left (Pria) & Right (Wanita)
    const doorGeo = new THREE.BoxGeometry(1.6, 2.3, 0.1);
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x334155 });

    const door1 = new THREE.Mesh(doorGeo, doorMat);
    door1.position.set(-1.8, 1.35, 1.52);
    group.add(door1);

    const door2 = new THREE.Mesh(doorGeo, doorMat);
    door2.position.set(1.8, 1.35, 1.52);
    group.add(door2);

    // KERAN WUDHU AREA (Di luar toilet, sisi depan)
    const wudhuBaseGeo = new THREE.BoxGeometry(6.6, 0.25, 2.0);
    const wudhuBaseMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const wudhuBase = new THREE.Mesh(wudhuBaseGeo, wudhuBaseMat);
    wudhuBase.position.set(0, 0.15, 3.2);
    group.add(wudhuBase);

    // River Stone Water Trough
    const troughGeo = new THREE.BoxGeometry(5.8, 0.3, 0.6);
    const troughMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const trough = new THREE.Mesh(troughGeo, troughMat);
    trough.position.set(0, 0.3, 2.6);
    group.add(trough);

    // Water Surface in Trough
    const waterGeo = new THREE.PlaneGeometry(5.6, 0.5);
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0.46, 2.6);
    group.add(water);

    // 4 Wudhu Water Taps
    for (let wx = -2.1; wx <= 2.1; wx += 1.4) {
        const tapPipeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.75, 8);
        const tapMat = new THREE.MeshLambertMaterial({ color: 0xc0c0c0 });
        const tap = new THREE.Mesh(tapPipeGeo, tapMat);
        tap.position.set(wx, 0.6, 2.3);
        group.add(tap);

        const spoutGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8);
        const spout = new THREE.Mesh(spoutGeo, tapMat);
        spout.rotation.x = Math.PI / 2;
        spout.position.set(wx, 0.95, 2.45);
        group.add(spout);
    }

        // Prominent Signboard "2 TOILET & KERAN WUDHU"
    const sign = create3DSignboard("2 TOILET & KERAN WUDHU", 5.6, 1.05);
    sign.position.set(0, 2.6, 3.2);
    group.add(sign);

    scene3D.add(group);

    // Northern Courtyard Bright Lighting
    const courtLight = new THREE.PointLight(0xfff3d6, 3.2, 35);
    courtLight.position.set(-3, 8, -17);
    scene3D.add(courtLight);
}

/**
 * Build Indoor Utama (Lingkaran Putih - Barat Daya)
 * Houses tables IU-07 s/d IU-12
 */
/**
 * Build Indoor Utama (Lingkaran Putih - Pendopo Bale Makan Tradisional Terbuka)
 * Sesuai foto riil Warung Makan Bukit Padangan:
 * - Atap limasan kayu terekspos (exposed timber truss & rafters) tanpa plafon
 * - Genteng tanah liat tradisional (terracotta clay tiles)
 * - Kolom kayu jati kokoh (teak posts) dengan sokong diagonal (knee braces/skur)
 * - Lantai batu alam lempeng acak (irregular slate flagstone floor)
 * - Dinding semi-terbuka (half-height wooden balustrade 1.0m, atasnya plong tanpa kaca)
 * - Lampu gantung anyaman bambu kerucut tradisional dengan cahaya kuning hangat di tiap meja
 * - Plang penunjuk arah hijau 'MUSHOLA / TOILET ➔' di balok belakang kanan
 * - TV gantung & kipas angin dinding pada kolom kayu
 * Houses tables IU-07 s/d IU-12
 */
/**
 * Build Indoor Utama (Pendopo Bale Makan Tradisional Terbuka)
 * Sesuai foto asli Warung Makan Bukit Padangan:
 * - Atap limasan kayu terekspos (exposed timber rafters & roof truss)
 * - Usuk & reng kayu terekspos di bagian bawah atap
 * - Genteng tanah liat tradisional cokelat kemerahan
 * - Kolom tiang kayu jati solid dengan sokong diagonal (skur)
 * - Lantai batu alam lempeng acak (slate flagstone crazy paving)
 * - Dinding semi-terbuka (half-height wooden balustrade 0.95m, atasnya terbuka total)
 * - Meja kayu panjang solid + bangku kayu panjang bersandaran punggung & armrest
 * - Lampu gantung kap bambu kerucut tradisional dengan cahaya kuning hangat (2200K)
 * - Plang fisik hijau 'MUSHOLA / TOILET ➔' di balok kayu arah fasilitas
 * - Kipas angin dinding pada tiang & TV gantung
 */
/**
 * Build Indoor Utama (Pendopo Bale Makan Tradisional Terbuka)
 * Sesuai foto riil Warung Makan Bukit Padangan (img_bcb8e1b7e299.jpg):
 * - Arsitektur Bale Tradisional Jawa / Limasan terbuka
 * - Rangka kayu terekspos (exposed timber truss & rafters)
 * - Usuk & reng kayu terekspos rapat di bagian bawah atap
 * - Genteng tanah liat tradisional cokelat kemerahan
 * - Kolom tiang kayu jati solid dengan sokong diagonal (skur)
 * - Lantai batu alam lempeng acak (slate flagstone crazy paving) bertekstur tegas
 * - Dinding papan kayu 0.95m setengah badan, atasnya terbuka total tanpa kaca
 * - Meja kayu panjang solid + bangku kayu panjang bersandaran punggung & armrest
 * - Lampu gantung kap anyaman bambu kerucut tradisional dengan cahaya kuning hangat
 * - Plang fisik hijau 'MUSHOLA / TOILET ➔' menggantung di balok kayu koridor
 * - TV gantung & kipas angin dinding pada kolom tiang kayu
 */
/**
 * Build Indoor Utama (Pendopo Bale Makan Tradisional Terbuka)
 * Sesuai foto riil Warung Makan Bukit Padangan (img_bcb8e1b7e299.jpg):
 * - Arsitektur Bale Tradisional Jawa / Limasan terbuka
 * - Rangka kayu terekspos (exposed timber truss & rafters)
 * - Usuk & reng kayu terekspos rapat di bagian bawah atap
 * - Genteng tanah liat tradisional cokelat kemerahan
 * - Kolom tiang kayu jati solid dengan sokong diagonal (skur)
 * - Lantai batu alam lempeng acak (slate flagstone crazy paving) bertekstur tegas
 * - Dinding papan kayu 0.95m setengah badan, atasnya terbuka total tanpa kaca
 * - Meja kayu panjang solid + bangku kayu panjang bersandaran punggung & armrest
 * - Lampu gantung kap anyaman bambu kerucut tradisional dengan cahaya kuning hangat
 * - Plang fisik hijau 'MUSHOLA / TOILET ➔' menggantung di balok kayu koridor
 * - TV gantung & kipas angin dinding pada kolom tiang kayu
 */
function buildIndoorUtama() {
    const group = new THREE.Group();
    group.position.set(-13, 0, -1);

    const teakMat = new THREE.MeshLambertMaterial({ color: 0x3d2514 }); // Teak Column
    const beamMat = new THREE.MeshLambertMaterial({ color: 0x271408 }); // Heavy Structural Timber
    const rafterMat = new THREE.MeshLambertMaterial({ color: 0x321a0a }); // Exposed Timber Rafters
    const battenMat = new THREE.MeshLambertMaterial({ color: 0x4a2913 }); // Bamboo/Wood Ceiling Battens
    const tileMat = new THREE.MeshLambertMaterial({ color: 0x6e2f1e }); // Terracotta Clay Tiles
    const balustradeMat = new THREE.MeshLambertMaterial({ color: 0x442813 }); // Horizontal Wood Planks

    // 1. Irregular Polygonal Slate Flagstone Floor (Lantai Batu Lempeng Acak / Crazy Paving Sesuai Foto Riil)
    const floorCanvas = document.createElement("canvas");
    floorCanvas.width = 1024;
    floorCanvas.height = 1024;
    const fctx = floorCanvas.getContext("2d");

    // Deep Dark Mortar Base (Nat Semen Gelap Antar Batu Lempeng)
    fctx.fillStyle = "#101319";
    fctx.fillRect(0, 0, 1024, 1024);

    // Natural Slate Flagstones (Lempengan Poligonal Beraneka Ragam Sesuai Foto Riil img_bcb8e1b7e299.jpg)
    const slatePalettes = [
        "#2b313d", "#363e4c", "#242831", "#414b5c",
        "#2f3643", "#3a3630", "#48433d", "#1e222a",
        "#38404e", "#282d38", "#444e5f", "#333946"
    ];

    // Irregular polygonal Voronoi-like mesh of natural flagstones
    const gridCols = 8;
    const gridRows = 8;
    const cellW = 1024 / gridCols;
    const cellH = 1024 / gridRows;

    // Generate perturbed points
    const points = [];
    for (let r = 0; r <= gridRows; r++) {
        points[r] = [];
        for (let c = 0; c <= gridCols; c++) {
            const jx = (c === 0 || c === gridCols) ? 0 : ((Math.sin(r * 3.7 + c * 5.1) * 0.35) * cellW);
            const jy = (r === 0 || r === gridRows) ? 0 : ((Math.cos(r * 4.3 + c * 2.9) * 0.35) * cellH);
            points[r][c] = {
                x: c * cellW + jx,
                y: r * cellH + jy
            };
        }
    }

    // Draw irregular polygonal stone slabs
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            const pTL = points[r][c];
            const pTR = points[r][c + 1];
            const pBR = points[r + 1][c + 1];
            const pBL = points[r + 1][c];

            const midX = (pTL.x + pTR.x + pBR.x + pBL.x) / 4 + (Math.sin(r * 2.3 + c * 4.1) * 12);
            const midY = (pTL.y + pTR.y + pBR.y + pBL.y) / 4 + (Math.cos(r * 3.1 + c * 1.9) * 12);

            const subPolys = [
                [pTL, pTR, { x: midX, y: midY }],
                [pTR, pBR, { x: midX, y: midY }],
                [pBR, pBL, { x: midX, y: midY }],
                [pBL, pTL, { x: midX, y: midY }]
            ];

            subPolys.forEach((poly, pIdx) => {
                const colIdx = (r * 11 + c * 7 + pIdx * 5) % slatePalettes.length;
                fctx.fillStyle = slatePalettes[colIdx];

                fctx.beginPath();
                const inset = 4.0;
                const cx = (poly[0].x + poly[1].x + poly[2].x) / 3;
                const cy = (poly[0].y + poly[1].y + poly[2].y) / 3;

                poly.forEach((pt, i) => {
                    const dx = cx - pt.x;
                    const dy = cy - pt.y;
                    const len = Math.hypot(dx, dy) || 1;
                    const nx = pt.x + (dx / len) * inset;
                    const ny = pt.y + (dy / len) * inset;
                    if (i === 0) fctx.moveTo(nx, ny);
                    else fctx.lineTo(nx, ny);
                });
                fctx.closePath();
                fctx.fill();

                // Chiseled stone edge highlight (tepi batu alam terasah)
                fctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
                fctx.lineWidth = 2.5;
                fctx.stroke();

                // Dark inner contour shadow
                fctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
                fctx.lineWidth = 2.0;
                fctx.stroke();
            });
        }
    }

    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(3, 3);
    floorTex.anisotropy = 8;
    floorTex.needsUpdate = true;

    const floorMat = new THREE.MeshLambertMaterial({
        map: floorTex
    });

    const floorGeo = new THREE.BoxGeometry(16.5, 0.28, 14.5);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = 0.14;
    floor.receiveShadow = true;
    group.add(floor);

    // Dark Stone Perimeter Curb
    const curbGeo = new THREE.BoxGeometry(16.9, 0.32, 14.9);
    const curb = new THREE.Mesh(curbGeo, new THREE.MeshLambertMaterial({ color: 0x14171d }));
    curb.position.y = 0.12;
    group.add(curb);

    // 2. Half-Height Wooden Balustrade (Dinding Papan Kayu 0.95m, Atas Terbuka Plong)
    // West Wall
    const westBal = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.95, 14.2), balustradeMat);
    westBal.position.set(-8.1, 0.65, 0);
    westBal.receiveShadow = true;
    westBal.castShadow = true;
    group.add(westBal);

    const westRail = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 14.4), teakMat);
    westRail.position.set(-8.1, 1.15, 0);
    group.add(westRail);

    // North Wall (Belakang - Menghadap Alam Sawah)
    const northBal = new THREE.Mesh(new THREE.BoxGeometry(16.2, 0.95, 0.18), balustradeMat);
    northBal.position.set(0, 0.65, -7.1);
    northBal.receiveShadow = true;
    northBal.castShadow = true;
    group.add(northBal);

    const northRail = new THREE.Mesh(new THREE.BoxGeometry(16.4, 0.08, 0.28), teakMat);
    northRail.position.set(0, 1.15, -7.1);
    group.add(northRail);

    // South Wall (Depan - Bukaan Pintu Masuk 4.5 Meter di Tengah)
    const southBal1 = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.95, 0.18), balustradeMat);
    southBal1.position.set(-5.2, 0.65, 7.1);
    group.add(southBal1);
    const southRail1 = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.08, 0.28), teakMat);
    southRail1.position.set(-5.2, 1.15, 7.1);
    group.add(southRail1);

    const southBal2 = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.95, 0.18), balustradeMat);
    southBal2.position.set(5.2, 0.65, 7.1);
    group.add(southBal2);
    const southRail2 = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.08, 0.28), teakMat);
    southRail2.position.set(5.2, 1.15, 7.1);
    group.add(southRail2);

    // East Wall (Sisi Kanan - Bukaan Menuju Kasir & Lorong Fasilitas)
    const eastBal1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.95, 4.8), balustradeMat);
    eastBal1.position.set(8.1, 0.65, -4.7);
    group.add(eastBal1);
    const eastBal2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.95, 4.8), balustradeMat);
    eastBal2.position.set(8.1, 0.65, 4.7);
    group.add(eastBal2);

    // 3. Grid Kolom Tiang Kayu Jati Solid & Sokong Diagonal (Knee Braces / Skur)
    const colCoords = [
        [-7.8, -6.8], [-2.6, -6.8], [2.6, -6.8], [7.8, -6.8],
        [-7.8,  0.0], [-2.6,  0.0], [2.6,  0.0], [7.8,  0.0],
        [-7.8,  6.8], [-2.6,  6.8], [2.6,  6.8], [7.8,  6.8]
    ];

    const colGeo = new THREE.BoxGeometry(0.32, 3.8, 0.32);
    const braceGeo = new THREE.BoxGeometry(0.12, 0.75, 0.12);

    colCoords.forEach(([cx, cz]) => {
        // Vertical column
        const col = new THREE.Mesh(colGeo, teakMat);
        col.position.set(cx, 1.9, cz);
        col.castShadow = true;
        col.receiveShadow = true;
        group.add(col);

        // Stone post plinth (Umpak Batu)
        const umpak = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.22, 0.48), new THREE.MeshLambertMaterial({ color: 0x181c22 }));
        umpak.position.set(cx, 0.15, cz);
        group.add(umpak);

        // Diagonal Knee Braces (Skur Penopang Balok)
        const braceX = new THREE.Mesh(braceGeo, beamMat);
        braceX.position.set(cx > 0 ? cx - 0.28 : cx + 0.28, 3.4, cz);
        braceX.rotation.z = cx > 0 ? Math.PI / 4 : -Math.PI / 4;
        group.add(braceX);

        const braceZ = new THREE.Mesh(braceGeo, beamMat);
        braceZ.position.set(cx, 3.4, cz > 0 ? cz - 0.28 : cz + 0.28);
        braceZ.rotation.x = cz > 0 ? -Math.PI / 4 : Math.PI / 4;
        group.add(braceZ);
    });

    // 4. Horizontal Structural Tie Beams (Balok Blandar & Pengeret Kayu)
    [-6.8, 0.0, 6.8].forEach(bz => {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(16.4, 0.28, 0.24), beamMat);
        beam.position.set(0, 3.75, bz);
        beam.castShadow = true;
        group.add(beam);
    });

    [-7.8, -2.6, 2.6, 7.8].forEach(bx => {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 14.2), beamMat);
        beam.position.set(bx, 3.82, 0);
        beam.castShadow = true;
        group.add(beam);
    });

    // 5. Open-Top Cutaway Architecture (Atap limasan & usuk genteng ditiadakan agar seluruh meja terlihat jelas dari atas)

    // 7. Authentic Directional Signboard: "MUSHOLA / TOILET ➔" (Sesuai Persis Foto img_bcb8e1b7e299.jpg)
    // Menggantung di balok kayu koridor tengah-kanan pada ketinggian pandangan mata (y = 2.2m)
    const signGroup = new THREE.Group();
    signGroup.position.set(2.2, 2.2, -2.6);
    signGroup.rotation.y = -0.32; // Menghadap langsung ke arah pandang tamu di koridor

    const signCanvas = document.createElement("canvas");
    signCanvas.width = 512;
    signCanvas.height = 256;
    const sctx = signCanvas.getContext("2d");

    // Dark Forest Green Sign Board
    sctx.fillStyle = "#0c502b";
    sctx.fillRect(0, 0, 512, 256);

    // Double White Border
    sctx.strokeStyle = "#ffffff";
    sctx.lineWidth = 14;
    sctx.strokeRect(10, 10, 492, 236);
    sctx.lineWidth = 4;
    sctx.strokeRect(22, 22, 468, 212);

    // Bold Crisp White Directional Text
    sctx.fillStyle = "#ffffff";
    sctx.font = "bold 64px Arial, sans-serif";
    sctx.textAlign = "center";
    sctx.textBaseline = "middle";
    sctx.fillText("MUSHOLA", 256, 78);
    sctx.fillText("TOILET  ➔", 256, 174);

    const signTex = new THREE.CanvasTexture(signCanvas);
    signTex.needsUpdate = true;
    const signBoardMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });

    const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 0.88), signBoardMat);
    signGroup.add(signBoard);

    // Backside of the sign
    const signBack = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.91, 0.04), new THREE.MeshLambertMaterial({ color: 0x0c502b }));
    signBack.position.z = -0.025;
    signGroup.add(signBack);

    // Timber mounting brackets hanging from tie beam above
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.4, 0.06), beamMat);
    b1.position.set(-0.6, 0.85, 0);
    signGroup.add(b1);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.4, 0.06), beamMat);
    b2.position.set(0.6, 0.85, 0);
    signGroup.add(b2);

    group.add(signGroup);

    // 8. Flat Screen TV hanging from central tie beam
    const tvGroup = new THREE.Group();
    tvGroup.position.set(0.8, 2.85, -6.5);
    const tvCase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.95, 0.08), new THREE.MeshLambertMaterial({ color: 0x111827 }));
    tvGroup.add(tvCase);
    const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.85, 0.02), new THREE.MeshBasicMaterial({ color: 0x1e3a8a }));
    tvScreen.position.z = 0.045;
    tvGroup.add(tvScreen);
    group.add(tvGroup);

    // 9. Wall-Mounted Oscillating Fans on Timber Columns
    const fanMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
    [[-2.6, 2.5, -6.6], [2.6, 2.5, 6.6], [-7.6, 2.5, 0]].forEach(([fx, fy, fz]) => {
        const fanBase = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.25, 0.15), fanMat);
        fanBase.position.set(fx, fy, fz);
        group.add(fanBase);

        const fanCage = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16), fanMat);
        fanCage.rotation.x = Math.PI / 2;
        fanCage.position.set(fx, fy + 0.1, fz + (fz > 0 ? -0.2 : 0.2));
        group.add(fanCage);
    });

    // 10. Front Header Wooden Signboard: "INDOOR UTAMA"
    const headerSign = create3DSignboard("INDOOR UTAMA (BALE MAKAN)", 6.2, 0.9);
    headerSign.position.set(0, 3.85, 7.25);
    group.add(headerSign);

    // 11. Warm Ambient Lighting (Kuning Hangat Tradisional 2200K)
    const hallLight1 = new THREE.PointLight(0xffb248, 2.8, 22);
    hallLight1.position.set(-3.5, 3.2, -2.0);
    group.add(hallLight1);

    const hallLight2 = new THREE.PointLight(0xffb248, 2.8, 22);
    hallLight2.position.set(3.5, 3.2, 2.0);
    group.add(hallLight2);

    scene3D.add(group);
}

/**
 * Build Kasir Station (Lingkaran Hitam - Dekat Indoor Utama)
 */
function buildCashierStation() {
    const group = new THREE.Group();
    group.position.set(-5.5, 0, 2);

    // Kasir Wooden Counter Deck
    const deskGeo = new THREE.BoxGeometry(2.6, 1.2, 1.5);
    const deskMat = new THREE.MeshLambertMaterial({ color: 0x4a2e17 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.y = 0.6;
    desk.castShadow = true;
    desk.receiveShadow = true;
    group.add(desk);

    // POS Terminal Monitor
    const screenGeo = new THREE.BoxGeometry(0.6, 0.45, 0.08);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.45, 0.1);
    group.add(screen);

    // Canopy Awning over Cashier
    const awningGeo = new THREE.BoxGeometry(3.2, 0.15, 2.2);
    const awningMat = new THREE.MeshLambertMaterial({ color: 0x1f1913 });
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, 2.7, 0);
    awning.castShadow = true;
    group.add(awning);

    // Awning Support Pillars
    const pMat = new THREE.MeshLambertMaterial({ color: 0x2a1c10 });
    [[-1.4, -0.9], [1.4, -0.9], [-1.4, 0.9], [1.4, 0.9]].forEach(([px, pz]) => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.7, 0.12), pMat);
        p.position.set(px, 1.35, pz);
        group.add(p);
    });

    // Signboard "KASIR"
    const sign = create3DSignboard("KASIR", 2.4, 0.7);
    sign.position.set(0, 3.2, 1.05);
    group.add(sign);

    // Spot Gold Light
    const spot = new THREE.PointLight(0xffaa33, 2.0, 10);
    spot.position.set(0, 2.5, 0);
    group.add(spot);

    scene3D.add(group);
}

/**
 * Build Indoor Timur 1 (Lingkaran Biru Kiri)
 * Houses tables IT1-13 s/d IT1-16
 */
/**
 * Build Indoor Timur 1 (Panggung Pertunjukan Musik / Acoustic Live Stage Hall)
 * Sesuai foto riil Warung Makan Bukit Padangan (img_ee137fc07575.jpg):
 * - Panggung utama kayu solid (elevated wooden stage h: 0.22m)
 * - Dinding latar bilah bambu vertikal (polished bamboo slats / pelupuh)
 * - Plafon anyaman bambu sasak/kepang dibingkai balok kayu struktural tebal
 * - 2 Pintu ganda backstage kiri & kanan dengan plang 'KHUSUS KARYAWAN'
 * - Sepeda onthel antik hitam klasik (roadster bicycle) di sisi kanan panggung
 * - Unit sound system trolley speaker portabel ber-LED dengan 'Kotak Apresiasi'
 * - Tripod stand mikrofon & instrumen musik, tumpukan kursi panggung
 * - Instalasi seni akustik dinding: tampah/nyiru aneka ukuran, kukusan, boboko, caping
 * - 2 Lampu gantung kap anyaman bambu kerucut tradisional (cahaya hangat 2700K)
 * - Area penonton lantai batu alam lempeng acak dengan bangku & meja kayu
 */
/**
 * Build Indoor Timur (Ruangan Makan Persegi Panjang Sederhana)
 * Sesuai arahan revisi aktual Bukit Padangan:
 * - Bangunan persegi panjang sederhana dengan arsitektur kayu tradisional terbuka (open-top cutaway)
 * - Tanpa panggung, tanpa live stage, tanpa area musik/speaker/mic/properti panggung fiktif
 * - Fokus murni pada area makan dengan meja dan kursi kayu
 * - Memuat 3 set meja makan kayu yang tersusun menyamping/berjajar dalam 1 arah (IT1-13, IT1-14, IT1-15)
 */
function buildIndoorTimur1() {
    const group = new THREE.Group();
    // Posisi acuan global Indoor Timur (X = 10, Z = 0)
    group.position.set(10, 0, 0);

    const teakMat  = new THREE.MeshStandardMaterial({ color: 0x4a2e1b, roughness: 0.6, metalness: 0.05 });
    const beamMat  = new THREE.MeshStandardMaterial({ color: 0x331c0e, roughness: 0.7, metalness: 0.05 });
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x5a3d24, roughness: 0.7, metalness: 0.05 });
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x2b170a, roughness: 0.8 });
    const balustradeMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.7 });

    // Dimensi Ruangan Persegi Panjang (Width: 9.8m, Depth: 4.1m)
    // Z membentang dari Z = -1.90 (Dinding Atas) sampai Z = +2.20 (Dinding Bawah)
    // Titik tengah Z ruangan = +0.15m
    const roomW = 9.8;
    const roomD = 4.1;
    const roomCenterZ = 0.15;

    // 1. Lantai Bangunan Persegi Panjang Sederhana (9.8m x 0.22m x 4.1m)
    const floorGeo = new THREE.BoxGeometry(roomW, 0.22, roomD);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, 0.11, roomCenterZ);
    floor.receiveShadow = false;
    group.add(floor);

    // List Plin Lantai Kayu Sekeliling Ruangan (Memperjelas bentuk persegi panjang)
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

    // 2. Dinding Pembatas Rendah Sejajar (Rustic Balustrade h: 0.95m, Dinding Kiri-Kanan & Atas-Bawah Sejajar)
    // Dinding Barat (Kiri) - Sejajar lurus dengan sumbu Z
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.95, roomD - 0.1), balustradeMat);
    westWall.position.set(-4.83, 0.695, roomCenterZ);
    group.add(westWall);

    const westRail = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, roomD), teakMat);
    westRail.position.set(-4.83, 1.21, roomCenterZ);
    group.add(westRail);

    // Dinding Timur (Kanan) - Sejajar lurus dengan dinding kiri
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.95, roomD - 0.1), balustradeMat);
    eastWall.position.set(4.83, 0.695, roomCenterZ);
    group.add(eastWall);

    const eastRail = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, roomD), teakMat);
    eastRail.position.set(4.83, 1.21, roomCenterZ);
    group.add(eastRail);

    // Dinding Utara (Atas / Belakang Jalur Akses) - Sejajar lurus dengan sumbu X
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(roomW - 0.2, 0.95, 0.14), balustradeMat);
    northWall.position.set(0, 0.695, -1.83);
    group.add(northWall);

    const northRail = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.08, 0.22), teakMat);
    northRail.position.set(0, 1.21, -1.83);
    group.add(northRail);

    // Dinding Selatan (Bawah / Mepet Belakang Meja) - Sejajar lurus dengan dinding atas
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(roomW - 0.2, 0.95, 0.14), balustradeMat);
    southWall.position.set(0, 0.695, 2.13);
    group.add(southWall);

    const southRail = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.08, 0.22), teakMat);
    southRail.position.set(0, 1.21, 2.13);
    group.add(southRail);

    // 3. Tiang Struktural Kayu Jati Solid Persegi (6 Kolom Kokoh Pembentuk Ruang)
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

    const headerSign = create3DSignboard("INDOOR TIMUR 1", 3.8, 0.7);
    headerSign.position.set(0, 3.25, 2.18);
    group.add(headerSign);

    scene3D.add(group);
}

/**
 * Build Area Kolam Terapi Ikan, Selokan Kecil, dan Kandang Labi-Labi
 * 
 * Sesuai Spesifikasi Revisi Denah 3D:
 * - Posisi SEJAJAR di sebelah kanan Indoor Timur 1 (X = 21, Z = 0)
 * - Ukuran/lebar konsisten dengan Indoor Timur 1 (Width: 9.8m, Depth: 4.1m)
 * - Bukan bangunan panggung, berupa kolam terapi ikan terbuka & enclosure
 * 
 * Urutan vertikal TEPAT dari BAWAH ke ATAS:
 * 1. [ JALUR AKSES 2 ORANG ] (Sisi paling bawah, Z = +1.05 s/d +2.20)
 * 2. [ KOLAM TERAPI IKAN ] (Bagian utama/tengah, Z = -0.65 s/d +1.00)
 *    + struktur dudukan/kursi di pinggir kolam (kaki dapat dimasukkan ke air)
 * 3. [ SELOKAN KECIL ] (Pemisah horizontal memanjang, Z = -0.98 s/d -0.68)
 * 4. [ KANDANG LABI-LABI ] (Tepat di atas selokan, Z = -1.90 s/d -1.02)
 *    + enclosure berpagar dengan HANYA 1 EKOR LABI-LABI
 */
