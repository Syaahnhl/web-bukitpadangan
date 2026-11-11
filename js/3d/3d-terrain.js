/**
 * 3d-terrain.js - Rice Terraces, Road & Perimeter Fence
 */

function buildTerrainAndRoad() {
    const terrainGroup = new THREE.Group();

    // 1. Central Ridge Knoll Plateau (Punggungan Bukit Tapak Resto Bukit Padangan)
    // Sumbu bukit membujur dari barat daya ke timur laut (SW to NE)
    const plateauGroup = new THREE.Group();
    plateauGroup.rotation.y = -0.24; // Rotasi ~13.7 derajat mengikuti sumbu bukit riil

    // Upper Plateau Surface (Dataran Rata Lantai Resto)
    const topPlateauGeo = new THREE.CylinderGeometry(35, 38, 2.4, 64);
    const topPlateauMat = new THREE.MeshLambertMaterial({ color: 0x15191f }); // Dark Obsidian Stone Earth
    const topPlateau = new THREE.Mesh(topPlateauGeo, topPlateauMat);
    topPlateau.position.y = -1.2;
    topPlateau.scale.set(1.42, 1.0, 0.94); // Memanjang: panjang ~100m, lebar ~65m
    topPlateau.receiveShadow = true;
    plateauGroup.add(topPlateau);

    // Plateau retaining stone edge / slope skirt
    const skirtGeo = new THREE.CylinderGeometry(38, 43, 1.6, 64);
    const skirtMat = new THREE.MeshLambertMaterial({ color: 0x22262d }); // Batuan penahan lereng bukit
    const skirt = new THREE.Mesh(skirtGeo, skirtMat);
    skirt.position.y = -2.8;
    skirt.scale.set(1.44, 1.0, 0.95);
    skirt.receiveShadow = true;
    plateauGroup.add(skirt);

    // Deep sub-base bedrock disc
    const subBaseGeo = new THREE.CylinderGeometry(90, 100, 4.0, 64);
    const subBaseMat = new THREE.MeshLambertMaterial({ color: 0x0e1115 });
    const subBase = new THREE.Mesh(subBaseGeo, subBaseMat);
    subBase.position.y = -4.8;
    subBase.receiveShadow = true;
    terrainGroup.add(subBase);

    terrainGroup.add(plateauGroup);
    scene3D.add(terrainGroup);

    // 2. Terraced Rice Fields (Terasering Sawah Berundak di Sekeliling Bukit)
    buildTieredRiceTerraces();

    // 3. Curved Southern Mountain Road: Jl. Gunungwungkal - Jepalo
    buildCurvedRoad();

    // 4. Google Maps Satellite POI Pin & GPS Location Dot
    buildGoogleMapsSatelliteMarkers();
}

/**
 * Build Tiered Agricultural Rice Terraces (Sengkedan Sawah Khas Lereng Gunungwungkal)
 */
/**
 * Build Tiered Agricultural Rice Terraces (Sengkedan Sawah Bertingkat Khas Lereng Gunungwungkal)
 * Built with solid 3D stepped riser boxes, raised earthen bunds, and vibrant multi-tone paddy plots
 */
function buildTieredRiceTerraces() {
    const terracesGroup = new THREE.Group();

    // Vibrant Paddy Field Color Variations
    const greenPaddys = [
        0x2d6a4f, // Emerald green
        0x40916c, // Fresh vibrant green
        0x1e5e3a, // Deep lush paddy
        0x52b788, // Light young rice stalk
        0x236b43  // Rich wet agricultural green
    ];
    const bundColor = 0x3e2723;  // Dark loam galengan / bund
    const riserColor = 0x2b221b; // Vertical retaining earthen step riser

    const bundMat = new THREE.MeshLambertMaterial({ color: bundColor });
    const riserMat = new THREE.MeshLambertMaterial({ color: riserColor });

    function createPaddyPlot(x, y, z, width, depth, colorIdx) {
        const plotGroup = new THREE.Group();

        // 1. Solid Step Base (Vertical Riser Wall down to lower level)
        const riserH = 2.0;
        const baseGeo = new THREE.BoxGeometry(width, riserH, depth);
        const baseMesh = new THREE.Mesh(baseGeo, riserMat);
        baseMesh.position.set(x, y - riserH / 2, z);
        baseMesh.receiveShadow = true;
        plotGroup.add(baseMesh);

        // 2. Top Water / Paddy Vegetative Surface
        const padGeo = new THREE.BoxGeometry(width - 0.5, 0.1, depth - 0.5);
        const padMat = new THREE.MeshLambertMaterial({
            color: greenPaddys[colorIdx % greenPaddys.length]
        });
        const padMesh = new THREE.Mesh(padGeo, padMat);
        padMesh.position.set(x, y + 0.05, z);
        padMesh.receiveShadow = true;
        plotGroup.add(padMesh);

        // 3. Perimeter Galengan Bunds (Pematang Sawah)
        // North bund
        const nBund = new THREE.Mesh(new THREE.BoxGeometry(width, 0.35, 0.5), bundMat);
        nBund.position.set(x, y + 0.18, z - depth / 2 + 0.25);
        plotGroup.add(nBund);

        // South bund
        const sBund = new THREE.Mesh(new THREE.BoxGeometry(width, 0.35, 0.5), bundMat);
        sBund.position.set(x, y + 0.18, z + depth / 2 - 0.25);
        plotGroup.add(sBund);

        // West bund
        const wBund = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, depth), bundMat);
        wBund.position.set(x - width / 2 + 0.25, y + 0.18, z);
        plotGroup.add(wBund);

        // East bund
        const eBund = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, depth), bundMat);
        eBund.position.set(x + width / 2 - 0.25, y + 0.18, z);
        plotGroup.add(eBund);

        return plotGroup;
    }

    // ==========================================
    // A. UTARA & BARAT LAUT (Lembah Belakang Resto)
    // ==========================================
    // Tier N1 (Y: -1.6, Z: -36, depth 16) - 4 Petak Sawah
    const n1Plots = [
        { x: -38, w: 26, c: 0 },
        { x: -14, w: 22, c: 1 },
        { x: 8,   w: 22, c: 2 },
        { x: 28,  w: 18, c: 3 }
    ];
    n1Plots.forEach(p => {
        terracesGroup.add(createPaddyPlot(p.x, -1.6, -36, p.w, 16, p.c));
    });

    // Tier N2 (Y: -3.6, Z: -54, depth 20) - 4 Petak Sawah
    const n2Plots = [
        { x: -44, w: 30, c: 1 },
        { x: -16, w: 26, c: 4 },
        { x: 12,  w: 30, c: 0 },
        { x: 40,  w: 26, c: 2 }
    ];
    n2Plots.forEach(p => {
        terracesGroup.add(createPaddyPlot(p.x, -3.6, -54, p.w, 20, p.c));
    });

    // Tier N3 (Y: -5.6, Z: -76, depth 24) - 3 Petak Sawah Luas Lembah
    const n3Plots = [
        { x: -40, w: 42, c: 2 },
        { x: 0,   w: 38, c: 3 },
        { x: 38,  w: 38, c: 1 }
    ];
    n3Plots.forEach(p => {
        terracesGroup.add(createPaddyPlot(p.x, -5.6, -76, p.w, 24, p.c));
    });

    // ==========================================
    // B. TIMUR & TIMUR LAUT (Lembah Depan Sayap Timur IT1 & IT2)
    // ==========================================
    // Tier E1 (Y: -1.6, X: 52, width 18) - 3 Petak
    const e1Plots = [
        { z: -20, d: 22, c: 4 },
        { z: 0,   d: 18, c: 0 },
        { z: 18,  d: 18, c: 2 }
    ];
    e1Plots.forEach(p => {
        terracesGroup.add(createPaddyPlot(52, -1.6, p.z, 18, p.d, p.c));
    });

    // Tier E2 (Y: -3.6, X: 72, width 22) - 3 Petak
    const e2Plots = [
        { z: -22, d: 24, c: 1 },
        { z: 0,   d: 20, c: 3 },
        { z: 20,  d: 20, c: 4 }
    ];
    e2Plots.forEach(p => {
        terracesGroup.add(createPaddyPlot(72, -3.6, p.z, 22, p.d, p.c));
    });

    // Tier E3 (Y: -5.6, X: 94, width 22) - 2 Petak Lembah Timur
    const e3Plots = [
        { z: -12, d: 34, c: 0 },
        { z: 18,  d: 26, c: 2 }
    ];
    e3Plots.forEach(p => {
        terracesGroup.add(createPaddyPlot(94, -5.6, p.z, 22, p.d, p.c));
    });

    // ==========================================
    // C. SELATAN (Terasering Seberang Jl. Gunungwungkal - Jepalo)
    // ==========================================
    // Tier S1 (Y: -1.4, Z: 48, depth 16) - 4 Petak
    const s1Plots = [
        { x: -44, w: 28, c: 3 },
        { x: -16, w: 28, c: 0 },
        { x: 14,  w: 32, c: 1 },
        { x: 44,  w: 28, c: 4 }
    ];
    s1Plots.forEach(p => {
        terracesGroup.add(createPaddyPlot(p.x, -1.4, 48, p.w, 16, p.c));
    });

    // Tier S2 (Y: -3.4, Z: 66, depth 20) - 4 Petak
    const s2Plots = [
        { x: -46, w: 32, c: 2 },
        { x: -14, w: 32, c: 4 },
        { x: 18,  w: 32, c: 0 },
        { x: 48,  w: 28, c: 1 }
    ];
    s2Plots.forEach(p => {
        terracesGroup.add(createPaddyPlot(p.x, -3.4, 66, p.w, 20, p.c));
    });

    // Tier S3 (Y: -5.4, Z: 88, depth 24) - 3 Petak Lembah Selatan
    const s3Plots = [
        { x: -36, w: 44, c: 0 },
        { x: 6,   w: 40, c: 2 },
        { x: 46,  w: 40, c: 3 }
    ];
    s3Plots.forEach(p => {
        terracesGroup.add(createPaddyPlot(p.x, -5.4, 88, p.w, 24, p.c));
    });

    scene3D.add(terracesGroup);
}

/**
 * Build Curved Jl. Gunungwungkal - Jepalo with Spline Road Geometry
 */
function buildCurvedRoad() {
    const roadGroup = new THREE.Group();

    // Road Curve Keypoints (SW to NE curved arc matching Google Maps)
    const roadPoints = [
        new THREE.Vector3(-68, 0.08, 25),
        new THREE.Vector3(-45, 0.08, 28),
        new THREE.Vector3(-20, 0.08, 31.5),
        new THREE.Vector3(5, 0.08, 33),
        new THREE.Vector3(30, 0.08, 34.5),
        new THREE.Vector3(55, 0.08, 37),
        new THREE.Vector3(75, 0.08, 40)
    ];

    const roadCurve = new THREE.CatmullRomCurve3(roadPoints);
    const sampleCount = 48;
    const curvePoints = roadCurve.getPoints(sampleCount);

    const roadWidth = 7.6;
    const asphaltMat = new THREE.MeshLambertMaterial({ color: 0x1c2027 }); // Asphalt dark
    const shoulderMat = new THREE.MeshLambertMaterial({ color: 0x2c2b28 }); // Gravel shoulder
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9, side: THREE.DoubleSide });

    const roadGeom = new THREE.BufferGeometry();
    const shoulderGeom = new THREE.BufferGeometry();
    const vertices = [];
    const shoulderVerts = [];
    const indices = [];
    const shoulderIndices = [];

    for (let i = 0; i <= sampleCount; i++) {
        const pt = curvePoints[i];
        let tangent;
        if (i < sampleCount) {
            tangent = curvePoints[i + 1].clone().sub(pt).normalize();
        } else {
            tangent = pt.clone().sub(curvePoints[i - 1]).normalize();
        }
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        const pLeft = pt.clone().addScaledVector(normal, roadWidth / 2);
        const pRight = pt.clone().addScaledVector(normal, -roadWidth / 2);

        vertices.push(pLeft.x, pLeft.y, pLeft.z);
        vertices.push(pRight.x, pRight.y, pRight.z);

        const sLeft = pt.clone().addScaledVector(normal, roadWidth / 2 + 1.2);
        const sRight = pt.clone().addScaledVector(normal, -roadWidth / 2 - 1.2);
        shoulderVerts.push(sLeft.x, sLeft.y - 0.03, sLeft.z);
        shoulderVerts.push(sRight.x, sRight.y - 0.03, sRight.z);

        if (i < sampleCount) {
            const base = i * 2;
            indices.push(base, base + 1, base + 2);
            indices.push(base + 1, base + 3, base + 2);

            shoulderIndices.push(base, base + 1, base + 2);
            shoulderIndices.push(base + 1, base + 3, base + 2);
        }

        // White dashed centerline every 3 points
        if (i % 3 === 0 && i < sampleCount - 1) {
            const stripeGeo = new THREE.PlaneGeometry(2.2, 0.28);
            const stripe = new THREE.Mesh(stripeGeo, lineMat);
            stripe.rotation.x = -Math.PI / 2;
            const angle = Math.atan2(tangent.x, tangent.z) - Math.PI / 2;
            stripe.rotation.z = angle;
            stripe.position.set(pt.x, 0.16, pt.z);
            roadGroup.add(stripe);
        }
    }

    roadGeom.setIndex(indices);
    roadGeom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    roadGeom.computeVertexNormals();
    const roadMesh = new THREE.Mesh(roadGeom, asphaltMat);
    roadMesh.receiveShadow = true;
    roadGroup.add(roadMesh);

    shoulderGeom.setIndex(shoulderIndices);
    shoulderGeom.setAttribute("position", new THREE.Float32BufferAttribute(shoulderVerts, 3));
    shoulderGeom.computeVertexNormals();
    const shoulderMesh = new THREE.Mesh(shoulderGeom, shoulderMat);
    shoulderMesh.receiveShadow = true;
    roadGroup.add(shoulderMesh);

    // Road Signboards
    const roadSign = create3DSignboard("JL. RAYA GUNUNGWUNGKAL - JEPALO", 7.2, 0.9);
    roadSign.position.set(-18, 2.3, 34.5);
    roadGroup.add(roadSign);

    const desaSign = create3DSignboard("DESA NGABLAK - PATI", 5.2, 0.75);
    desaSign.position.set(22, 2.3, 37.5);
    roadGroup.add(desaSign);

    // Main Entrance Gate Marker
    const gateSign = create3DSignboard("GERBANG MASUK RESTO", 5.2, 0.75);
    gateSign.position.set(-5, 2.4, 29);
    roadGroup.add(gateSign);

    scene3D.add(roadGroup);
}

/**
 * Build Google Maps Satellite Markers (Red POI Pin & Pulsing GPS Blue Dot)
 */
function buildGoogleMapsSatelliteMarkers() {
    const group = new THREE.Group();

    // 1. Google Maps POI Pin Marker ("📍 Bukit Padangan")
    const pinGroup = new THREE.Group();
    pinGroup.position.set(-14, 6.5, 2);

    const pinHeadMat = new THREE.MeshLambertMaterial({ color: 0xe53935 }); // Google Red
    const pinHead = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), pinHeadMat);
    pinHead.position.y = 1.6;
    pinGroup.add(pinHead);

    const pinCenterMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pinCenter = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), pinCenterMat);
    pinCenter.position.set(0, 1.6, 0.6);
    pinGroup.add(pinCenter);

    const pinNeedleMat = new THREE.MeshLambertMaterial({ color: 0xc62828 });
    const pinNeedle = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.8, 12), pinNeedleMat);
    pinNeedle.rotation.x = Math.PI;
    pinNeedle.position.y = 0.9;
    pinGroup.add(pinNeedle);

    const poiLabel = create3DSignboard("BUKIT PADANGAN • NOT TOO BUSY", 7.5, 0.85);
    poiLabel.position.set(0, 3.2, 0);
    pinGroup.add(poiLabel);

    group.add(pinGroup);

    // 2. Active User GPS Blue Location Dot (with pulsing ripple)
    const gpsGroup = new THREE.Group();
    gpsGroup.position.set(-8, 0.15, 6);

    const blueCoreMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const blueCore = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.08, 24), blueCoreMat);
    gpsGroup.add(blueCore);

    const haloMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.46, 0.65, 24), haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.04;
    gpsGroup.add(halo);

    const rippleMat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    gpsBlueDotRipple = new THREE.Mesh(new THREE.RingGeometry(0.7, 1.8, 32), rippleMat);
    gpsBlueDotRipple.rotation.x = -Math.PI / 2;
    gpsBlueDotRipple.position.y = 0.05;
    gpsGroup.add(gpsBlueDotRipple);

    group.add(gpsGroup);

    scene3D.add(group);
}


/**
 * Build Golden Perimeter Ring (Lingkaran Kuning)
 */

/**
 * Build Area Outdoor Dekat Jalan Raya (Lingkaran Hijau - Jl. Gunungwungkal - Jepalo)
 */
function buildOutdoorRoadsidePlaza() {
    const group = new THREE.Group();

    // 1. Spacious Paved Terrace Platform
    // Spans X: -19 to 3 (width 22), Z: 15.5 to 28.5 (depth 13)
    const deckGeo = new THREE.BoxGeometry(22, 0.35, 13);
    const deckMat = new THREE.MeshLambertMaterial({ color: 0x222834 }); // Slate outdoor paving
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(-8, 0.175, 22);
    deck.receiveShadow = true;
    group.add(deck);

    // Decorative Gold Stone Border Trim
    const trimGeo = new THREE.BoxGeometry(22.4, 0.38, 13.4);
    const trimMat = new THREE.MeshLambertMaterial({ color: 0x3d352a });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(-8, 0.15, 22);
    group.add(trim);

    // 2. Roadside Access Steps / Ramp (connecting road Z: 29.5 to terrace Z: 28.5)
    const stepsGeo = new THREE.BoxGeometry(8, 0.18, 1.6);
    const stepsMat = new THREE.MeshLambertMaterial({ color: 0x2e3544 });
    const steps = new THREE.Mesh(stepsGeo, stepsMat);
    steps.position.set(-8, 0.09, 29.2);
    steps.receiveShadow = true;
    group.add(steps);

    // 3. Outdoor Perimeter Railing & Fence (Pagar Pembatas Minimalis Kayu & Besi)
    // Runs along West edge (X: -18.75), South roadside edge (Z: 28.25, with entrance gap), and East edge (X: 2.75)
    // Handrail top at Y: 1.38 (height 1.03m above deck), 2 horizontal dark steel sub-rails, dark square steel posts.
    const fencePostMat = new THREE.MeshLambertMaterial({ color: 0x242830 }); // Dark powder-coated steel posts
    const fenceRailWoodMat = new THREE.MeshLambertMaterial({ color: 0x5c3d23 }); // Solid teak wood handrail
    const fenceSubRailMat = new THREE.MeshLambertMaterial({ color: 0x1b1e24 }); // Horizontal dark metal sub-bars
    const fenceBaseMat = new THREE.MeshLambertMaterial({ color: 0x181a20 }); // Base curb plate

    function createFenceSegment(p1, p2, postSpacing = 2.45) {
        const segGroup = new THREE.Group();
        const start = new THREE.Vector3(p1.x, 0.35, p1.z);
        const end = new THREE.Vector3(p2.x, 0.35, p2.z);
        const diff = end.clone().sub(start);
        const length = diff.length();
        const center = start.clone().add(end).multiplyScalar(0.5);
        const angleY = Math.atan2(diff.x, diff.z);

        // 1. Teak Wood Handrail (Top Rail at Y: 1.38m)
        const railGeo = new THREE.BoxGeometry(0.12, 0.05, length);
        const rail = new THREE.Mesh(railGeo, fenceRailWoodMat);
        rail.position.set(center.x, 1.38, center.z);
        rail.rotation.y = angleY;
        rail.castShadow = true;
        segGroup.add(rail);

        // 2. Mid & Lower Horizontal Steel Sub-Rails
        [0.72, 1.05].forEach(ry => {
            const subGeo = new THREE.CylinderGeometry(0.016, 0.016, length, 8);
            const sub = new THREE.Mesh(subGeo, fenceSubRailMat);
            sub.position.set(center.x, ry, center.z);
            sub.rotation.y = angleY;
            sub.rotation.x = Math.PI / 2;
            segGroup.add(sub);
        });

        // 3. Base Metal Plinth / Curb Strip
        const baseGeo = new THREE.BoxGeometry(0.14, 0.04, length);
        const base = new THREE.Mesh(baseGeo, fenceBaseMat);
        base.position.set(center.x, 0.37, center.z);
        base.rotation.y = angleY;
        segGroup.add(base);

        // 4. Fence Posts
        const numPosts = Math.max(2, Math.round(length / postSpacing) + 1);
        for (let i = 0; i < numPosts; i++) {
            const t = i / (numPosts - 1);
            const pos = start.clone().lerp(end, t);

            // Steel square post
            const postGeo = new THREE.BoxGeometry(0.08, 1.05, 0.08);
            const post = new THREE.Mesh(postGeo, fencePostMat);
            post.position.set(pos.x, 0.35 + 1.05 / 2, pos.z);
            post.castShadow = true;
            segGroup.add(post);

            // Post cap
            const capGeo = new THREE.BoxGeometry(0.10, 0.03, 0.10);
            const cap = new THREE.Mesh(capGeo, fenceRailWoodMat);
            cap.position.set(pos.x, 1.41, pos.z);
            segGroup.add(cap);

            // Floor mounting flange
            const flangeGeo = new THREE.BoxGeometry(0.12, 0.02, 0.12);
            const flange = new THREE.Mesh(flangeGeo, fencePostMat);
            flange.position.set(pos.x, 0.36, pos.z);
            segGroup.add(flange);
        }

        return segGroup;
    }

    // West perimeter fence (facing sunset & sawah valley)
    group.add(createFenceSegment({ x: -18.75, z: 15.8 }, { x: -18.75, z: 28.25 }, 2.45));

    // South perimeter fence - West Wing
    group.add(createFenceSegment({ x: -18.75, z: 28.25 }, { x: -11.0, z: 28.25 }, 2.4));

    // South perimeter fence - East Wing (Central gap -11.0 to -5.0 remains open for entrance stairs)
    group.add(createFenceSegment({ x: -5.0, z: 28.25 }, { x: 2.75, z: 28.25 }, 2.4));

    // East perimeter fence (facing garden)
    group.add(createFenceSegment({ x: 2.75, z: 15.8 }, { x: 2.75, z: 28.25 }, 2.45));

    // 4. Exterior Flower Planter Troughs along roadside curb (outside the fence at Z: 28.85)
    const planterMat = new THREE.MeshLambertMaterial({ color: 0x4a3424 }); // Dark wood planter box
    const shrubMat = new THREE.MeshLambertMaterial({ color: 0x2d5a27 }); // Lush green shrub
    const flowerMat = new THREE.MeshLambertMaterial({ color: 0xe5a342 }); // Golden yellow flowers

    const planterPositions = [-16.5, -13.5, -2.5, 0.5];
    planterPositions.forEach(px => {
        const box = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.5), planterMat);
        box.position.set(px, 0.52, 28.85);
        box.castShadow = true;
        group.add(box);

        const shrub = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.40, 0.42), shrubMat);
        shrub.position.set(px, 0.80, 28.85);
        group.add(shrub);

        // Flower accents
        for (let fx = -0.8; fx <= 0.8; fx += 0.4) {
            const fl = new THREE.Mesh(new THREE.SphereGeometry(0.09, 5, 5), flowerMat);
            fl.position.set(px + fx, 1.04, 28.85 + (fx % 0.8 === 0 ? 0.04 : -0.04));
            group.add(fl);
        }
    });

    // 4. Festoon Bistro Light Poles at 4 corners
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x1f232b }); // Black iron pole
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffd180 }); // Warm glowing bulb
    const poleCoords = [
        [-18.2, 16.2],
        [2.2,   16.2],
        [-18.2, 27.8],
        [2.2,   27.8]
    ];

    poleCoords.forEach(([px, pz]) => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.0, 8), poleMat);
        pole.position.set(px, 2.0, pz);
        pole.castShadow = true;
        group.add(pole);

        // Lamp head
        const lantern = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.25, 4), poleMat);
        lantern.position.set(px, 4.0, pz);
        group.add(lantern);

        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), bulbMat);
        bulb.position.set(px, 3.82, pz);
        group.add(bulb);
    });

    // Catenary String Light Glow
    const festoonLight1 = new THREE.PointLight(0xffbe6b, 2.4, 18);
    festoonLight1.position.set(-8, 3.8, 19);
    group.add(festoonLight1);

    const festoonLight2 = new THREE.PointLight(0xffbe6b, 2.4, 18);
    festoonLight2.position.set(-8, 3.8, 25);
    group.add(festoonLight2);

    // 5. 3D Roadside Signboard (Facing visitors on Jl. Gunungwungkal)
    const sign = create3DSignboard("AREA OUTDOOR (TEPI JL. GUNUNGWUNGKAL)", 8.2, 0.95);
    sign.position.set(-8, 2.2, 28.8);
    sign.rotation.y = 0; // facing south towards road
    group.add(sign);

    scene3D.add(group);
}

/**
 * Build Golden Perimeter Loop (Lingkaran Batas Kawasan Sesuai Satelit Google Maps)
 */
function buildPerimeterRing() {
    const perimeterPoints = [
        new THREE.Vector3(-42, 0.08, 14),
        new THREE.Vector3(-40, 0.08, -4),
        new THREE.Vector3(-26, 0.08, -25),
        new THREE.Vector3(-8, 0.08, -28),
        new THREE.Vector3(12, 0.08, -26),
        new THREE.Vector3(38, 0.08, -22),
        new THREE.Vector3(44, 0.08, -8),
        new THREE.Vector3(40, 0.08, 10),
        new THREE.Vector3(26, 0.08, 26),
        new THREE.Vector3(6, 0.08, 27),
        new THREE.Vector3(-16, 0.08, 26),
        new THREE.Vector3(-32, 0.08, 24),
        new THREE.Vector3(-42, 0.08, 14)
    ];

    const curve = new THREE.CatmullRomCurve3(perimeterPoints, true);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.18, 8, true);
    const tubeMat = new THREE.MeshBasicMaterial({
        color: 0xd4a373,
        transparent: true,
        opacity: 0.65
    });
    const perimeterMesh = new THREE.Mesh(tubeGeo, tubeMat);
    scene3D.add(perimeterMesh);
}

/**
 * Build Mushola (Lingkaran Merah Kiri - Fasilitas Ibadah)
 */
