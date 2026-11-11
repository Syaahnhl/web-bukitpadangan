/**
 * 3d-tables.js - 3D Dining Table Models & Status Badges
 */

function populate3DTables() {
    tableObjects = [];

    const tables = (typeof tablesData !== "undefined" && tablesData.length > 0)
        ? tablesData
        : getDefaultTablesFallback();

    tables.forEach(table => {
        const layout = TABLE_3D_LAYOUT[table.id];
        if (!layout) return;

        const tableGroup = new THREE.Group();
        const posY = (layout.zone === "outdoor") ? 0.35 : 0;
        tableGroup.position.set(layout.x, posY, layout.z);
        tableGroup.userData = { table: table };

        // Construct 3D Physical Geometry based on Zone
        if (layout.type === "rustic-timur" || (table.id && (table.id.startsWith("IT1-") || table.id.startsWith("IT2-")))) {
            buildIndoorTimurRusticTable3D(tableGroup, table);
        } else if (layout.type === "terapi-seat" || layout.zone === "terapi" || (table.id && table.id.startsWith("TI-"))) {
            buildTerapiSeat3D(tableGroup, table);
        } else if (layout.type === "outdoor-bar" || layout.zone === "outdoor" || layout.zone === "gazebo" || (table.id && table.id.startsWith("OD-"))) {
            buildOutdoorFenceBarTable3D(tableGroup, table, layout);
        } else if (layout.zone === "vip") {
            buildVipTable3D(tableGroup, table, layout.type);
        }

        // Add 3D Status Glow Ring & Floating Billboard Badge
        const statusColor = getStatusColor(table.status);
        
        // Ground Status Ring
        const isCompact = (layout.type === "terapi-seat" || layout.type === "outdoor-bar" || (table.id && (table.id.startsWith("OD-") || table.id.startsWith("TI-"))));
        const ringRadius = (layout.type === "terapi-seat") ? 0.65 : (isCompact ? 0.55 : 1.2);
        const ringOuter  = (layout.type === "terapi-seat") ? 0.85 : (isCompact ? 0.75 : 1.45);
        const ringGeo = new THREE.RingGeometry(ringRadius, ringOuter, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: statusColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = (layout.type === "terapi-seat") ? 0.25 : 0.05;
        tableGroup.add(ring);
        tableGroup.userData.glowRing = ring;

        // Floating 3D Table Sprite Badge right above each table (Clean open-top layout)
        const badgeY = (layout.type === "terapi-seat") ? 1.45 : (isCompact ? 1.75 : 2.2);
        const badgeScaleX = isCompact ? 2.2 : 2.8;
        const badgeScaleY = isCompact ? 0.95 : 1.2;

        const sprite = createTableSpriteBadge(table, statusColor);
        sprite.position.set(0, badgeY, 0);
        sprite.scale.set(badgeScaleX, badgeScaleY, 1.0);
        tableGroup.add(sprite);
        tableGroup.userData.sprite = sprite;

        // Interaction Hitbox (Invisible bounding box for smooth touch & click)
        const hitBoxGeo = isCompact ? new THREE.BoxGeometry(2.0, 2.4, 2.0) : new THREE.BoxGeometry(3.6, 3.2, 3.6);
        const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
        hitBox.position.y = 1.6;
        tableGroup.add(hitBox);

        // Save reference
        hitBox.userData = { parentTableGroup: tableGroup, table: table };
        tableObjects.push(hitBox);
        tableGroupMap[table.id] = tableGroup;

        scene3D.add(tableGroup);
    });
}

/**
 * 3D Gazebo Builder (Meja 01 - 08)
 */
function buildGazebo3D(group, table) {
    const bambooMat = new THREE.MeshLambertMaterial({ color: 0xc8ad7f }); // Bamboo yellow-brown
    const deckMat = new THREE.MeshLambertMaterial({ color: 0x6e4726 });   // Dark timber deck
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x42362b });   // Thatched roof

    // Raised Wooden Deck Platform
    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.35, 3.2), deckMat);
    deck.position.y = 0.2;
    deck.castShadow = true;
    deck.receiveShadow = true;
    group.add(deck);

    // Bamboo Pillars (4 corners)
    const pillarPositions = [
        [-1.35, -1.35], [1.35, -1.35],
        [-1.35, 1.35],  [1.35, 1.35]
    ];
    pillarPositions.forEach(([px, pz]) => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.2, 8), bambooMat);
        pillar.position.set(px, 1.3, pz);
        pillar.castShadow = true;
        group.add(pillar);
    });

    // Gazebo Saung - Open-Air (Atap kerucut ditiadakan agar lesehan & meja tampak jelas dari atas)

    // Low Dining Table (Lesehan)
    const tableMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
    const lowTable = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.6), tableMat);
    lowTable.position.y = 0.55;
    lowTable.castShadow = true;
    group.add(lowTable);

    // Floor Tatami Cushions
    const cushionMat = new THREE.MeshLambertMaterial({ color: 0xb53426 });
    const cushionOffsets = [[-0.9, 0], [0.9, 0], [0, -0.9], [0, 0.9]];
    cushionOffsets.forEach(([cx, cz]) => {
        const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 0.65), cushionMat);
        cushion.position.set(cx, 0.42, cz);
        group.add(cushion);
    });

    // Hanging Warm Resort Amber Lantern
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffcc77 });
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.35, 8), lanternMat);
    lantern.position.y = 2.2;
    group.add(lantern);

    const warmLight = new THREE.PointLight(0xffb055, 1.3, 8.5);
    warmLight.position.y = 2.0;
    group.add(warmLight);
}

/**
 * 3D Outdoor Perimeter Bar Table & High Stool Builder (OD-01 s/d OD-06)
 * Meja-meja kecil compact yang menempel langsung pada pagar perimeter outdoor.
 * Dilengkapi tepat 1 kursi tinggi (high bar stool) untuk 1 orang per meja.
 * Material natural: daun meja kayu jati rustic, braket & rangka kaki metal industrial,
 * dudukan kursi kayu bulat dengan pijakan kaki (footrest ring).
 * Tidak ada kursi berpasangan atau meja 2-4 orang.
 */
function buildOutdoorFenceBarTable3D(group, table, layout = {}) {
    const rotY = (layout && typeof layout.rotation === "number") ? layout.rotation : 0;
    const model = new THREE.Group();
    model.rotation.y = rotY;
    group.add(model);

    // Materials
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5a3818 });     // Teak slab tabletop
    const woodTrimMat = new THREE.MeshLambertMaterial({ color: 0x472c12 }); // Edge bevel trim
    const seatWoodMat = new THREE.MeshLambertMaterial({ color: 0x6e492b }); // High stool wooden round seat
    const steelMat = new THREE.MeshLambertMaterial({ color: 0x22252a });    // Dark charcoal powder-coated steel
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0x50535a });   // Rubber / glide caps

        // Meja compact menempel pada pagar (compact Bar Ledge)
    // In local space:
    // Pagar perimeter berada di z = +0.24 (tepat di belakang meja).
    // Meja berukuran 0.95m x 0.48m, tebal 0.045m, tinggi y = 1.02m di atas lantai dek.
    // Sisi belakang meja menempel erat dan terhubung langsung ke pagar perimeter.
        const topGeo = new THREE.BoxGeometry(0.95, 0.045, 0.48);
    const topMesh = new THREE.Mesh(topGeo, woodMat);
    topMesh.position.set(0, 1.02, 0);
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    model.add(topMesh);

    // Front edge rounded bevel trim
    const frontTrimGeo = new THREE.BoxGeometry(0.96, 0.048, 0.03);
    const frontTrim = new THREE.Mesh(frontTrimGeo, woodTrimMat);
    frontTrim.position.set(0, 1.02, -0.23);
    model.add(frontTrim);

    // Heavy-duty steel mounting L-brackets connecting tabletop securely to fence
    [-0.32, 0.32].forEach(bx => {
        // Horizontal under-table mounting plate
        const horizPlate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.36), steelMat);
        horizPlate.position.set(bx, 0.99, 0.05);
        model.add(horizPlate);

        // Vertical bracket flange clamping directly to fence handrail/post
        const vertFlange = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.02), steelMat);
        vertFlange.position.set(bx, 0.88, 0.23);
        model.add(vertFlange);

        // Cantilever diagonal strut brace back to fence
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.46, 6), steelMat);
        strut.position.set(bx, 0.82, 0.02);
        strut.rotation.x = 0.58;
        model.add(strut);
    });

    // Central slim vertical support leg to deck floor
    const centerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.99, 8), steelMat);
    centerLeg.position.set(0, 0.495, 0.04);
    model.add(centerLeg);

    const legFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.02, 8), steelMat);
    legFlange.position.set(0, 0.01, 0.04);
    model.add(legFlange);

    // Living Cafe Tabletop Accessories
    // Brass table ID plaque
    const plaqueMat = new THREE.MeshLambertMaterial({ color: 0xd4af37 });
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.01, 0.06), plaqueMat);
    plaque.position.set(-0.35, 1.048, 0.16);
    model.add(plaque);

    // Ceramic coffee cup & saucer
    const cupMat = new THREE.MeshLambertMaterial({ color: 0xf4f0e6 });
    const coffeeMat = new THREE.MeshLambertMaterial({ color: 0x3b2111 });

    const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.01, 12), cupMat);
    saucer.position.set(0.24, 1.048, -0.06);
    model.add(saucer);

    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.03, 0.055, 12), cupMat);
    cup.position.set(0.24, 1.075, -0.06);
    model.add(cup);

    const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.005, 12), coffeeMat);
    coffee.position.set(0.24, 1.098, -0.06);
    model.add(coffee);

    // Mini green succulent pot
    const potMat = new THREE.MeshLambertMaterial({ color: 0x88bb99, transparent: true, opacity: 0.85 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.065, 8), potMat);
    pot.position.set(-0.18, 1.075, 0.12);
    model.add(pot);

    const plant = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 6), new THREE.MeshLambertMaterial({ color: 0x3a7d44 }));
    plant.position.set(-0.18, 1.12, 0.12);
    model.add(plant);

        // Tepat 1 kursi tinggi / bar stool (high Stool untuk 1 Orang)
    // Terletak di sisi luar meja (z = -0.58) menghadap meja dan area outdoor.
    // Tinggi dudukan y = 0.74m di atas dek (standar kursi bar tinggi, bukan kursi makan biasa).
    // Kaki metal ramping splayed, footrest ring melingkar, dan low lumbar backrest.
        const stoolZ = -0.58;

    // Solid Teak Wood Round Seat Disc
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.035, 16), seatWoodMat);
    seat.position.set(0, 0.74, stoolZ);
    seat.castShadow = true;
    model.add(seat);

    // Under-seat mounting hub
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.015, 12), steelMat);
    hub.position.set(0, 0.718, stoolZ);
    model.add(hub);

    // 4 Splayed Industrial Metal Legs
    const legCoords = [
        { tx: -0.09, tz: -0.09, bx: -0.16, bz: -0.16 },
        { tx:  0.09, tz: -0.09, bx:  0.16, bz: -0.16 },
        { tx: -0.09, tz:  0.09, bx: -0.16, bz:  0.16 },
        { tx:  0.09, tz:  0.09, bx:  0.16, bz:  0.16 }
    ];

    legCoords.forEach(c => {
        const topPt = new THREE.Vector3(c.tx, 0.71, stoolZ + c.tz);
        const botPt = new THREE.Vector3(c.bx, 0.01, stoolZ + c.bz);
        const length = topPt.distanceTo(botPt);

        const legBar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.010, length, 8), steelMat);
        legBar.position.copy(topPt).add(botPt).multiplyScalar(0.5);
        legBar.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            topPt.clone().sub(botPt).normalize()
        );
        model.add(legBar);

        // Floor rubber glide
        const glide = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 0.02, 8), chromeMat);
        glide.position.set(c.bx, 0.01, stoolZ + c.bz);
        model.add(glide);
    });

    // Horizontal Circular Metal Footrest Ring
    const footRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.011, 8, 16), steelMat);
    footRing.position.set(0, 0.28, stoolZ);
    footRing.rotation.x = Math.PI / 2;
    model.add(footRing);

    // Low Minimalist Lumbar Backrest Tab (facing front towards table)
    const backArch = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.01, 6, 12, Math.PI), steelMat);
    backArch.position.set(0, 0.86, stoolZ - 0.12);
    backArch.rotation.x = 0.2;
    model.add(backArch);

    [-0.11, 0.11].forEach(ux => {
        const backPost = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.16, 6), steelMat);
        backPost.position.set(ux, 0.79, stoolZ - 0.11);
        model.add(backPost);
    });

    // Subtle Warm Under-table Mood Light
    const microLight = new THREE.PointLight(0xffb86c, 0.35, 2.5);
    microLight.position.set(0, 0.95, -0.15);
    model.add(microLight);
}

// Backward-compatibility alias
function buildOutdoorTable3D(group, table, hasUmbrella = false) {
    buildOutdoorFenceBarTable3D(group, table, { rotation: 0 });
}

/**
 * Build Indoor Timur Rustic Table 3D
 * Meja makan kayu sederhana memanjang dengan tampilan rustic/tradisional,
 * dilengkapi bangku kayu panjang sederhana di 2 sisi (masing-masing 2-3 orang).
 * Kapasitas total 4-6 orang per meja, tanpa ornamen modern berlebih.
 */
function buildIndoorTimurRusticTable3D(group, table) {
    const tableMat = new THREE.MeshLambertMaterial({ color: 0x54361e }); // Kayu Jati Rustic Alami
    const legMat   = new THREE.MeshLambertMaterial({ color: 0x3d2513 }); // Rangka & Kaki Kayu Solid
    const benchMat = new THREE.MeshLambertMaterial({ color: 0x5c3d23 }); // Papan Dudukan Bangku

    // Meja Makan Kayu Panjang Sederhana (2.15m x 0.08m x 0.85m)
    const topGeo = new THREE.BoxGeometry(2.15, 0.08, 0.85);
    const topMesh = new THREE.Mesh(topGeo, tableMat);
    topMesh.position.y = 0.74;
    topMesh.castShadow = false;
    topMesh.receiveShadow = false;
    topMesh.name = "TableMesh_" + table.id;
    group.add(topMesh);

    // Subframe / Apron di Bawah Meja
    const apron = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.06, 0.68), legMat);
    apron.position.y = 0.67;
    group.add(apron);

    // 4 Kaki Meja Kayu Solid Kokoh (Square Legs 10cm x 10cm)
    const legGeo = new THREE.BoxGeometry(0.10, 0.70, 0.10);
    const legX = 0.90;
    const legZ = 0.31;
    [
        [-legX, legZ],
        [legX, legZ],
        [-legX, -legZ],
        [legX, -legZ]
    ].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, 0.35, lz);
        group.add(leg);
    });

    // Palang Penguat Kaki Bawah Meja (Stretcher Rail)
    const railX = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.05, 0.05), legMat);
    railX.position.set(0, 0.18, 0);
    group.add(railX);

    // Ornamen Meja Sederhana: Wadah Tisu Kayu Rustic & Tempat Sendok Kayu
    const tissueBox = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.08, 0.12), legMat);
    tissueBox.position.set(0.65, 0.82, 0);
    group.add(tissueBox);

    const cutleryHolder = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.09, 12), legMat);
    cutleryHolder.position.set(0.40, 0.82, 0);
    group.add(cutleryHolder);

    // Bangku Kayu Panjang Sederhana (2 Sisi: Utara & Selatan)
    // 1 sisi menampung 2–3 orang -> Total kapasitas 4–6 orang per meja
    [-0.66, 0.66].forEach((benchZ, bIdx) => {
        const benchGroup = new THREE.Group();
        benchGroup.position.set(0, 0, benchZ);

        // Alas Duduk Kayu Panjang (2.05m x 0.06m x 0.32m)
        const seatGeo = new THREE.BoxGeometry(2.05, 0.06, 0.32);
        const seat = new THREE.Mesh(seatGeo, benchMat);
        seat.position.y = 0.44;
        benchGroup.add(seat);

        // 4 Kaki Bangku Kayu
        const bLegGeo = new THREE.BoxGeometry(0.06, 0.41, 0.06);
        const bLegX = 0.88;
        const bLegZ = 0.10;
        [
            [-bLegX, bLegZ],
            [bLegX, bLegZ],
            [-bLegX, -bLegZ],
            [bLegX, -bLegZ]
        ].forEach(([blx, blz]) => {
            const bLeg = new THREE.Mesh(bLegGeo, legMat);
            bLeg.position.set(blx, 0.205, blz);
            benchGroup.add(bLeg);
        });

        // Penguat Kaki Bangku
        const bRail = new THREE.Mesh(new THREE.BoxGeometry(1.70, 0.04, 0.04), legMat);
        bRail.position.set(0, 0.15, 0);
        benchGroup.add(bRail);

        // Sandaran Bangku Kayu Sederhana (Rustic Backrest)
        const backSign = bIdx === 0 ? -1 : 1; // Menghadap ke meja
        const backrest = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.22, 0.04), benchMat);
        backrest.position.set(0, 0.66, backSign * 0.14);
        backrest.rotation.x = backSign * 0.10;
        benchGroup.add(backrest);

        // 3 Tiang Penyangga Sandaran
        [-0.85, 0, 0.85].forEach(postX => {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.40, 0.04), legMat);
            post.position.set(postX, 0.52, backSign * 0.13);
            post.rotation.x = backSign * 0.10;
            benchGroup.add(post);
        });

        group.add(benchGroup);
    });
}

/**
 * 3D Terapi Seat Builder (TI-01 s/d TI-03)
 * 
 * Pengunjung duduk di pinggir kolam terapi ikan menghadap air dengan kaki terendam.
 * Bukan kursi makan biasa dan tidak memakai meja makan.
 * Bantalan duduk terpasang langsung di atas dek bangku kayu pinggir kolam.
 */
function buildTerapiSeat3D(group, table) {
    const cushionMat = new THREE.MeshLambertMaterial({ color: 0xa16207 }); // Bantalan duduk jok bambu emas hangat
    const rimMat     = new THREE.MeshLambertMaterial({ color: 0x2b170a }); // List bingkai kayu jati tua
    const plateMat   = new THREE.MeshLambertMaterial({ color: 0xd97706 }); // Plat penanda spot terapi

    // Bantalan Duduk Pengunjung di Pinggir Kolam (0.55m x 0.06m x 0.36m)
    const padGeo = new THREE.BoxGeometry(0.55, 0.06, 0.36);
    const padMesh = new THREE.Mesh(padGeo, cushionMat);
    padMesh.position.y = 0.53;
    padMesh.castShadow = false;
    padMesh.receiveShadow = false;
    padMesh.name = "TableMesh_" + table.id;
    group.add(padMesh);

    // List Trim Kayu Penahan Bantalan
    const trimMesh = new THREE.Mesh(new THREE.BoxGeometry(0.59, 0.03, 0.40), rimMat);
    trimMesh.position.y = 0.49;
    group.add(trimMesh);

    // Plat Nomor Spot Terapi Ikan
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.02), plateMat);
    plate.position.set(0, 0.45, 0.19);
    group.add(plate);
}

/**
 * 3D VIP Table Builder (Meja 21 - 26)
 */
function buildVipTable3D(group, table, type = "vip-large") {
    const tableMat = new THREE.MeshLambertMaterial({ color: 0x482d19 }); // Solid Teak Wood Table
    const benchMat = new THREE.MeshLambertMaterial({ color: 0x5a371e }); // Solid Teak Bench with Backrest
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x301a0d }); // Bench Base & Legs
    const cordMat  = new THREE.MeshLambertMaterial({ color: 0x111111 }); // Black Drop Cord

    // Procedural Woven Bamboo Rattan Texture (Anyaman Bambu Tradisional)
    const weaveCanvas = document.createElement("canvas");
    weaveCanvas.width = 256;
    weaveCanvas.height = 256;
    const wctx = weaveCanvas.getContext("2d");
    wctx.fillStyle = "#cf9d63"; // Warm straw base
    wctx.fillRect(0, 0, 256, 256);

    wctx.lineWidth = 4;
    for (let i = 0; i <= 256; i += 16) {
        wctx.strokeStyle = i % 32 === 0 ? "#966530" : "#d9ab75";
        wctx.beginPath();
        wctx.moveTo(i, 0);
        wctx.lineTo(i, 256);
        wctx.stroke();

        wctx.strokeStyle = i % 32 === 0 ? "#7b4f21" : "#e5bc88";
        wctx.beginPath();
        wctx.moveTo(0, i);
        wctx.lineTo(256, i);
        wctx.stroke();
    }

    const weaveTex = new THREE.CanvasTexture(weaveCanvas);
    weaveTex.wrapS = THREE.RepeatWrapping;
    weaveTex.wrapT = THREE.RepeatWrapping;
    weaveTex.repeat.set(4, 2);
    weaveTex.needsUpdate = true;

    const shadeMat = new THREE.MeshLambertMaterial({
        map: weaveTex,
        side: THREE.DoubleSide
    });

    // Long Teak Dining Table (Meja Kayu Panjang Solid)
    const topGeo = new THREE.BoxGeometry(3.3, 0.12, 1.15);
    const tableTop = new THREE.Mesh(topGeo, tableMat);
    tableTop.position.y = 0.76;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    group.add(tableTop);

    // Beveled Table Apron
    const apron = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.08, 0.95), frameMat);
    apron.position.y = 0.68;
    group.add(apron);

    // Sturdy Square Wooden Legs
    [[-1.4, -0.42], [1.4, -0.42], [-1.4, 0.42], [1.4, 0.42]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.72, 0.12), frameMat);
        leg.position.set(lx, 0.36, lz);
        leg.castShadow = true;
        group.add(leg);
    });

    // Stretcher Bars (Palang Bawah Kaki Meja)
    const st1 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.06, 0.06), frameMat);
    st1.position.set(0, 0.18, 0);
    group.add(st1);

    // Tabletop Condiments (Keranjang Kerupuk & Kotak Tisu)
    const tissueBox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.16), new THREE.MeshLambertMaterial({ color: 0xeee8d5 }));
    tissueBox.position.set(-0.35, 0.88, 0);
    group.add(tissueBox);

    const snackBasket = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.18, 12), new THREE.MeshLambertMaterial({ color: 0x9b6b3b }));
    snackBasket.position.set(0.35, 0.91, 0);
    group.add(snackBasket);

    // Long Wooden Benches with Backrest (Bangku Kayu Panjang Bersandaran) on North & South Sides
    [-0.85, 0.85].forEach((bz, bIdx) => {
        const benchGroup = new THREE.Group();
        benchGroup.position.set(0, 0, bz);

        // Seat Plank
        const seat = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.08, 0.38), benchMat);
        seat.position.y = 0.46;
        seat.castShadow = true;
        benchGroup.add(seat);

        // 4 Bench Legs
        [[-1.35, -0.12], [1.35, -0.12], [-1.35, 0.12], [1.35, 0.12]].forEach(([blx, blz]) => {
            const bLeg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.44, 0.08), frameMat);
            bLeg.position.set(blx, 0.22, blz);
            benchGroup.add(bLeg);
        });

        // Inclined Solid Backrest & Armrests
        const isSouth = bz > 0;
        const backZ = isSouth ? 0.17 : -0.17;
        const tiltX = isSouth ? 0.18 : -0.18;

        const backrest = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.38, 0.06), benchMat);
        backrest.position.set(0, 0.72, backZ);
        backrest.rotation.x = tiltX;
        backrest.castShadow = true;
        benchGroup.add(backrest);

        // Vertical Backrest Support Posts
        [-1.3, -0.45, 0.45, 1.3].forEach(px => {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 0.06), frameMat);
            post.position.set(px, 0.65, backZ);
            post.rotation.x = tiltX;
            benchGroup.add(post);
        });

        // Wooden Armrests at both ends
        [-1.48, 1.48].forEach(ax => {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.36), benchMat);
            arm.position.set(ax, 0.62, 0);
            benchGroup.add(arm);
        });

        group.add(benchGroup);
    });

    // Overhead space open & unobstructed for table badge clarity
}

/**
 * Helper: Create Floating 3D Table Sprite Badge
 */
function createTableSpriteBadge(table, statusColorHex) {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");

    // Rounded rectangle pill: Deep Obsidian Charcoal
    const radius = 26;
    ctx.fillStyle = "rgba(15, 18, 24, 0.98)";
    ctx.beginPath();
    ctx.roundRect(8, 8, canvas.width - 16, canvas.height - 16, radius);
    ctx.fill();

    // Border with metallic gold or status color
    ctx.strokeStyle = statusColorHex || "#d4a373";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Outer Glow Ring for Status
    ctx.fillStyle = statusColorHex || "#10b981";
    ctx.beginPath();
    ctx.arc(46, canvas.height / 2, 16, 0, Math.PI * 2);
    ctx.fill();

    // Text: Table Name (Crisp White)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px 'Poppins', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(table.name, 78, canvas.height / 2 - 12);

    // Text: Capacity (Warm Vibrant Gold)
    ctx.fillStyle = "#e5b382";
    ctx.font = "bold 26px 'Poppins', sans-serif";
    ctx.fillText(`${table.capacity} Kursi`, 78, canvas.height / 2 + 25);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.4, 1.4, 1.0);
    return sprite;
}

/**
 * Get Status Color
 */
function getStatusColor(status) {
    switch (status) {
        case "tersedia": return "#10b981"; // Emerald Green
        case "terisi":   return "#ef4444"; // Coral Red
        case "dipesan":  return "#f59e0b"; // Amber Yellow
        default:         return "#10b981";
    }
}

/**
 * Fallback tables if tables.json not loaded yet
 */
function getDefaultTablesFallback() {
    const fallback = [];
    for (let i = 1; i <= 26; i++) {
        const id = `T${i < 10 ? '0' + i : i}`;
        let zone = "terapi";
        let zoneName = "Area Terapi Ikan";
        let cap = 6;
        if (i >= 9 && i <= 20) {
            zone = "outdoor";
            zoneName = "Zona Outdoor Panorama";
            cap = 4;
        } else if (i >= 21) {
            zone = "vip";
            zoneName = "Zona VIP & Meeting";
            cap = 8;
        }
        fallback.push({
            id: id,
            number: i,
            name: `Meja ${i < 10 ? '0' + i : i}`,
            zone: zone,
            zoneName: zoneName,
            capacity: cap,
            status: i === 3 ? "dipesan" : (i === 6 ? "terisi" : "tersedia"),
            description: `Spot nyaman dengan pemandangan pegunungan asri Bukit Padangan.`
        });
    }
    return fallback;
}

/**
 * Setup Interaction (Hover & Click via Raycaster)
 */
