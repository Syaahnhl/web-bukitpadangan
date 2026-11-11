/**
 * tables3d.js - Interactive 3D Spatial Floor Plan for Bukit Padangan
 * Built with Three.js (r128), OrbitControls, and Tween.js
 */

let scene3D, camera3D, renderer3D, controls3D;
let tableObjects = [];
let tableGroupMap = {};
let hoveredTable = null;
let selectedTableMesh = null;
let is3DInitialized = false;
let currentActiveZone3D = "all";
let canvasContainer = null;
let animFrameId = null;

// Camera Presets
const CAMERA_PRESETS = {
    all: {
        pos: { x: 2, y: 84, z: 88 },
        target: { x: 2, y: -1, z: 6 }
    },
    outdoor: {
        pos: { x: -8, y: 17, z: 44 },
        target: { x: -8, y: 1.0, z: 23 }
    },
    indoor: {
        pos: { x: -16.5, y: 2.1, z: 4.8 },
        target: { x: -10.5, y: 1.6, z: -2.5 }
    },
    stage: {
        pos: { x: 21, y: 15, z: 18 },
        target: { x: 21, y: 0.5, z: 0.2 }
    },
    east: {
        pos: { x: 21, y: 15, z: 18 },
        target: { x: 21, y: 0.5, z: 0.2 }
    },
    terapi: {
        pos: { x: 21, y: 9.5, z: 8.5 },
        target: { x: 21, y: 0.5, z: 0.15 }
    },
    facilities: {
        pos: { x: -3, y: 5.5, z: 0 },
        target: { x: -3, y: 1.0, z: -24 }
    },
    // Aliases for backwards compatibility
    saung: {
        pos: { x: -8, y: 22, z: 54 },
        target: { x: -8, y: 1.0, z: 24 }
    },
    gazebo: {
        pos: { x: -8, y: 22, z: 54 },
        target: { x: -8, y: 1.0, z: 24 }
    },
    vip: {
        pos: { x: -18.2, y: 4.2, z: 6.8 },
        target: { x: -11.5, y: 1.4, z: -2.2 }
    }
};

// Table Positions Map in 3D Space (X, Z)
const TABLE_3D_LAYOUT = {
    // Lingkaran Hijau: Area Outdoor Dekat Jalan Raya (OD-01 s/d OD-06) - Meja Bar Compact Menempel Pagar
    // Perimeter Barat (Sunset View): OD-01 s/d OD-03 (menempel pagar Barat X: -18.75, menghadap Barat ke sawah)
    "OD-01": { x: -18.45, z: 18.0, zone: "outdoor", type: "outdoor-bar", rotation: -Math.PI / 2 },
    "OD-02": { x: -18.45, z: 22.0, zone: "outdoor", type: "outdoor-bar", rotation: -Math.PI / 2 },
    "OD-03": { x: -18.45, z: 26.0, zone: "outdoor", type: "outdoor-bar", rotation: -Math.PI / 2 },
    // Perimeter Selatan (Roadside View): OD-04 s/d OD-06 (menempel pagar Selatan Z: 28.25, menghadap Selatan ke jalan raya)
    "OD-04": { x: -15.50, z: 27.95, zone: "outdoor", type: "outdoor-bar", rotation: 0 },
    "OD-05": { x: -12.00, z: 27.95, zone: "outdoor", type: "outdoor-bar", rotation: 0 },
    "OD-06": { x: -2.50,  z: 27.95, zone: "outdoor", type: "outdoor-bar", rotation: 0 },

    // Backward compatibility aliases
    "S-01": { x: -18.45, z: 18.0, zone: "outdoor", type: "outdoor-bar", rotation: -Math.PI / 2 },
    "S-02": { x: -18.45, z: 22.0, zone: "outdoor", type: "outdoor-bar", rotation: -Math.PI / 2 },
    "S-03": { x: -18.45, z: 26.0, zone: "outdoor", type: "outdoor-bar", rotation: -Math.PI / 2 },
    "S-04": { x: -15.50, z: 27.95, zone: "outdoor", type: "outdoor-bar", rotation: 0 },
    "S-05": { x: -12.00, z: 27.95, zone: "outdoor", type: "outdoor-bar", rotation: 0 },
    "S-06": { x: -2.50,  z: 27.95, zone: "outdoor", type: "outdoor-bar", rotation: 0 },

    // Lingkaran Putih: Zona Indoor Utama (IU-07 s/d IU-12) - Barat Daya
    "IU-07": { x: -16, z: -4, zone: "vip", rotation: 0, type: "vip-large" },
    "IU-08": { x: -10, z: -4, zone: "vip", rotation: 0, type: "vip-large" },
    "IU-09": { x: -16, z: 2,  zone: "vip", rotation: 0, type: "meeting" },
    "IU-10": { x: -10, z: 2,  zone: "vip", rotation: 0, type: "meeting" },
    "IU-11": { x: -16, z: -1, zone: "vip", rotation: 0, type: "lounge" },
    "IU-12": { x: -10, z: -1, zone: "vip", rotation: 0, type: "lounge" },

    // Lingkaran Biru (Tengah): Zona Kolam Terapi Ikan (Spot Duduk Terapi TI-01 s/d TI-03 di Pinggir Kolam)
    "TI-01": { x: 18.2, z: 0.86, zone: "terapi", type: "terapi-seat", rotation: 0 },
    "TI-02": { x: 21.0, z: 0.86, zone: "terapi", type: "terapi-seat", rotation: 0 },
    "TI-03": { x: 23.8, z: 0.86, zone: "terapi", type: "terapi-seat", rotation: 0 },

    // Zona Indoor Timur 1 (3 Set Meja Memanjang Menyamping Mepet Bawah, Akses 2 Orang di Atas)
    "IT1-13": { x: 7.2,  z: 1.0, zone: "vip", type: "rustic-timur", rotation: 0 },
    "IT1-14": { x: 10.0, z: 1.0, zone: "vip", type: "rustic-timur", rotation: 0 },
    "IT1-15": { x: 12.8, z: 1.0, zone: "vip", type: "rustic-timur", rotation: 0 },

    // Zona Indoor Timur 2 (HANYA 2 Meja Memanjang Menyamping Mepet Bawah, Akses 2 Orang di Atas)
    "IT2-17": { x: 29.6, z: 1.0, zone: "vip", type: "rustic-timur", rotation: 0 },
    "IT2-18": { x: 34.4, z: 1.0, zone: "vip", type: "rustic-timur", rotation: 0 },

    // Backwards Compatibility Fallback (T01-T26)
    "T01": { x: -16, z: 14, zone: "gazebo", rotation: 0 },
    "T02": { x: -9,  z: 14, zone: "gazebo", rotation: 0 },
    "T03": { x: -2,  z: 14, zone: "gazebo", rotation: 0 },
    "T04": { x: -16, z: 22, zone: "gazebo", rotation: 0 },
    "T05": { x: -9,  z: 22, zone: "gazebo", rotation: 0 },
    "T06": { x: -2,  z: 22, zone: "gazebo", rotation: 0 },
    "T07": { x: 17,  z: -2, zone: "outdoor", rotation: 0 },
    "T08": { x: 20,  z: 1,  zone: "outdoor", rotation: 0 },
    "T09": { x: 8,   z: -2, zone: "vip", rotation: 0 },
    "T10": { x: 12,  z: -2, zone: "vip", rotation: 0 },
    "T11": { x: 8,   z: 4,  zone: "vip", rotation: 0 },
    "T12": { x: 12,  z: 4,  zone: "vip", rotation: 0 },
    "T13": { x: 26,  z: -2, zone: "vip", rotation: 0 },
    "T14": { x: 30,  z: -2, zone: "vip", rotation: 0 },
    "T15": { x: 26,  z: 4,  zone: "vip", rotation: 0 },
    "T16": { x: 30,  z: 4,  zone: "vip", rotation: 0 },
    "T17": { x: 17,  z: 4,  zone: "outdoor", rotation: 0 },
    "T18": { x: 20,  z: 4,  zone: "outdoor", rotation: 0 },
    "T19": { x: -16, z: -4, zone: "vip", rotation: 0 },
    "T20": { x: -10, z: -4, zone: "vip", rotation: 0 },
    "T21": { x: -16, z: 2,  zone: "vip", rotation: 0 },
    "T22": { x: -10, z: 2,  zone: "vip", rotation: 0 },
    "T23": { x: -16, z: -1, zone: "vip", rotation: 0 },
    "T24": { x: -10, z: -1, zone: "vip", rotation: 0 },
    "T25": { x: 8,   z: 1,  zone: "vip", rotation: 0 },
    "T26": { x: 26,  z: 1,  zone: "vip", rotation: 0 }
};

/**
 * Initialize 3D Spatial Floor Plan
 */
function init3DFloorPlan() {
    canvasContainer = document.getElementById("webglCanvasContainer");
    if (!canvasContainer) return;

    // Avoid duplicate initialization
    if (is3DInitialized) {
        on3DWindowResize();
        return;
    }

    const width = canvasContainer.clientWidth || 800;
    const height = canvasContainer.clientHeight || 500;

    // 1. SCENE
    scene3D = new THREE.Scene();
    scene3D.background = new THREE.Color(0x0a0c0f); // Luxury Night Obsidian Sky
    scene3D.fog = new THREE.FogExp2(0x0a0c0f, 0.0055);

    // 2. CAMERA
    camera3D = new THREE.PerspectiveCamera(40, width / height, 0.5, 300);
    camera3D.position.set(CAMERA_PRESETS.all.pos.x, CAMERA_PRESETS.all.pos.y, CAMERA_PRESETS.all.pos.z);

    // Detect Mobile Device
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768);

    // 3. RENDERER (Adaptive Performance: 60 FPS on Mobile HP & Ultra-Crisp on Desktop)
    renderer3D = new THREE.WebGLRenderer({
        antialias: !isMobileDevice, // Mobile screens have dense 400+ PPI; disabling MSAA saves massive fillrate & memory bandwidth
        alpha: false,
        powerPreference: isMobileDevice ? "default" : "high-performance"
    });
    renderer3D.setSize(width, height);

    // Mobile capped at 1.25x (lightweight, zero thermal lag), Desktop capped at 1.75x
    const targetDPR = isMobileDevice
        ? Math.min(window.devicePixelRatio || 1, 1.25)
        : Math.min(window.devicePixelRatio || 1, 1.75);
    renderer3D.setPixelRatio(targetDPR);

    renderer3D.shadowMap.enabled = false;
    renderer3D.toneMapping = THREE.ACESFilmicToneMapping;
    renderer3D.toneMappingExposure = 1.15;

    // Remove loading indicator if present
    const loadingElem = document.getElementById("canvas3DLoading");
    if (loadingElem) loadingElem.style.display = "none";

    canvasContainer.appendChild(renderer3D.domElement);

    // 4. CONTROLS
    controls3D = new THREE.OrbitControls(camera3D, renderer3D.domElement);
    controls3D.enableDamping = true;
    controls3D.dampingFactor = 0.06;
    controls3D.maxPolarAngle = Math.PI / 2 - 0.06; // Don't go below ground
    controls3D.minDistance = 6;
    controls3D.maxDistance = 160;
    controls3D.target.set(CAMERA_PRESETS.all.target.x, CAMERA_PRESETS.all.target.y, CAMERA_PRESETS.all.target.z);
    window.camera3D = camera3D;
    window.controls3D = controls3D;
    window.scene3D = scene3D;
    window.renderer3D = renderer3D;

    // 5. LIGHTING
    setup3DLighting();

    // 6. BUILD SCENERY & ENVIRONMENT
    build3DEnvironment();

    // 7. POPULATE TABLES
    populate3DTables();

    // 8. INTERACTION EVENTS
    setup3DInteraction();

    // 9. ANIMATION LOOP
    is3DInitialized = true;
    animate3D();

    window.addEventListener("resize", on3DWindowResize);
}

/**
 * Setup Lighting
 */
function setup3DLighting() {
    // Hemisphere light (Warm moonlight above, dark earth bounce)
    const hemiLight = new THREE.HemisphereLight(0xffeedd, 0x111418, 0.65);
    hemiLight.position.set(0, 50, 0);
    scene3D.add(hemiLight);

    // Main Warm Golden Key Light (Zero shadow map pass for silky smooth FPS)
    const sunLight = new THREE.DirectionalLight(0xffdfa9, 0.95);
    sunLight.position.set(28, 45, 25);
    sunLight.castShadow = false;
    scene3D.add(sunLight);

    // Warm Gold Ambient fill
    const ambLight = new THREE.AmbientLight(0xd4a373, 0.35);
    scene3D.add(ambLight);

    // Warm golden indoor light for VIP Pavilion
    const vipLight = new THREE.PointLight(0xffba55, 2.2, 30);
    vipLight.position.set(-3, 3.5, -19);
    scene3D.add(vipLight);

    // Warm golden light for Kasir/Main Building
    const mainLight = new THREE.PointLight(0xffaa44, 2.0, 25);
    mainLight.position.set(-22, 3.5, -8);
    scene3D.add(mainLight);

    // Outdoor cliff lanterns
    const deckLight1 = new THREE.PointLight(0xff9933, 1.5, 18);
    deckLight1.position.set(22, 3.0, -8);
    scene3D.add(deckLight1);

    const deckLight2 = new THREE.PointLight(0xff9933, 1.5, 18);
    deckLight2.position.set(22, 3.0, 10);
    scene3D.add(deckLight2);
}

/**
 * Build 3D Scenery: Terrain, Main Building, VIP Pavilion, Outdoor Deck, Trees, Paths
 */
/**
 * Build 3D Scenery: Terrain, Buildings, Pathways, and Nature
 * Ground Truth: Satellite Mapping with color-coded zones:
 * - Kuning: Perimeter Kawasan Bukit Padangan
 * - Merah: Mushola (kiri) & 2 Toilet + Keran Wudhu luar (kanan)
 * - Putih: Indoor Utama
 * - Hitam: Kasir dekat Indoor Utama
 * - Biru: Indoor Timur 1 (kiri), Kolam Terapi Ikan (tengah), Indoor Timur 2 (kanan)
 * - Hijau: Saung Outdoor tepi sawah (selatan)
 * - Sunset: Arah matahari terbenam dari kiri (barat)
 */
function build3DEnvironment() {
    // 1. Terrain & Southern Road (Jl. Gunungwungkal - Jepalo)
    buildTerrainAndRoad();

    // 2. Perimeter Ring (Lingkaran Kuning)
    buildPerimeterRing();

    // Lingkaran Hijau: Area Outdoor Dekat Jalan Raya (Jl. Gunungwungkal)
    buildOutdoorRoadsidePlaza();

    // 3. Fasilitas Ibadah & Sanitasi (Lingkaran Merah: Mushola & Toilet/Wudhu)
    buildMushola();
    buildToiletsAndWudhu();

    // 4. Area Utama (Lingkaran Putih & Hitam: Indoor Utama & Kasir)
    buildIndoorUtama();
    buildCashierStation();

    // 5. Kompleks Timur (Lingkaran Biru: IT1, Kolam Terapi Ikan, IT2)
    buildIndoorTimur1();
    buildFishTherapyPool();
    buildIndoorTimur2();

    // 6. Penanda Sunset (Barat / Kiri)
    buildSunsetIndicator();

    // 7. Jalan Setapak & Lanskap Alami
    buildGardenPathways();
    buildSurroundingNature();
}

/**
 * Build Terrain Ridge Plateau, Terraced Rice Fields, and Curved Main Road
 * Sesuai Citra Satelit Google Maps (Desa Ngablak, Gunungwungkal)
 */
let gpsBlueDotRipple = null;

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
function buildSunsetIndicator() {
    const group = new THREE.Group();
    group.position.set(-32, 2.5, 8);

    // Golden Sun Orb
    const sunGeo = new THREE.SphereGeometry(2.0, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa22 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.y = 3.5;
    group.add(sun);

    // Radiating Sun Ring
    const haloGeo = new THREE.RingGeometry(2.6, 3.4, 32);
    const haloMat = new THREE.MeshBasicMaterial({
        color: 0xffd56b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 3.5;
    halo.rotation.y = Math.PI / 2;
    group.add(halo);

    // Signboard "ARAH SUNSET (GOLDEN HOUR)"
    const sign = create3DSignboard("ARAH SUNSET (16.30 - 17.45 WIB)", 7.8, 1.0);
    sign.position.set(0, 0.8, 0);
    sign.rotation.y = Math.PI / 2;
    group.add(sign);

    // Warm Sunset Glow Light
    const sunLight = new THREE.PointLight(0xff9900, 3.5, 30);
    sunLight.position.set(0, 3.5, 0);
    group.add(sunLight);

    scene3D.add(group);
}

/**
 * Build Garden Pathways connecting all zones
 */
function buildGardenPathways() {
    // Entrance to Cashier & Indoor Utama
    createPathSegment(-5, 29, -5.5, 4, 1.8);
    createPathSegment(-5.5, 4, -13, 4, 1.6);

    // Cashier to Saung Outdoor
    createPathSegment(-5.5, 4, -9, 14, 1.6);
    createPathSegment(-16, 14, -2, 14, 1.4);
    createPathSegment(-16, 22, -2, 22, 1.4);
    createPathSegment(-9, 14, -9, 22, 1.4);

    // Cashier to East Complex (IT1, Fish Therapy, IT2)
    createPathSegment(-5.5, 4, 10, 4, 1.6);
    createPathSegment(10, 4, 21, 4, 1.6);
    createPathSegment(21, 4, 32, 4, 1.6);

    // Central pathway to North Facilities (Mushola & Toilet)
    createPathSegment(-5.5, 4, -5.5, -16, 1.6);
    createPathSegment(-5.5, -16, -10, -20, 1.6); // to Mushola
    createPathSegment(-5.5, -16, 4, -20, 1.6);   // to Toilets & Wudhu
}

/**
 * Build Stone Path Segment
 */
function createPathSegment(x1, z1, x2, z2, width = 1.4) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);

    const pathGeo = new THREE.PlaneGeometry(width, len);
    const pathMat = new THREE.MeshLambertMaterial({ color: 0x334155, side: THREE.DoubleSide });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.rotation.z = angle;
    path.position.set((x1 + x2) / 2, 0.04, (z1 + z2) / 2);
    path.receiveShadow = true;
    scene3D.add(path);
}

/**
 * Build Surrounding Trees, Bushes, and Cliff Details
 */
function buildSurroundingNature() {
    // Pine / Shade Trees around perimeter and terrace bunds
    const treePositions = [
        [-46, 12], [-44, 2], [-40, -14], [-30, -26], [-14, -30],
        [4, -29], [22, -27], [38, -24], [45, -12], [46, 4],
        [42, 16], [30, 26], [16, 28], [-28, 25], [-38, 22],
        [-52, -38], [-20, -48], [15, -46], [58, -12], [65, 8],
        [35, 42], [-25, 40], [-48, 36], [68, 44]
    ];

    treePositions.forEach(([tx, tz]) => {
        const tree = createPineTree();
        let ty = 0;
        if (tz < -28) ty = -1.8;
        if (tz < -44) ty = -3.4;
        if (tx > 44) ty = -1.8;
        if (tx > 64) ty = -3.4;
        if (tz > 36) ty = -1.5;
        tree.position.set(tx, ty, tz);
        const scale = 0.85 + Math.random() * 0.45;
        tree.scale.set(scale, scale, scale);
        scene3D.add(tree);
    });

    // Flowering Bushes along walkways
    const bushPositions = [
        [-14, 8], [-4, 8], [4, 8], [15, 8],
        [-18, -12], [-8, -12], [8, -12], [22, -12],
        [-24, 20], [18, 22]
    ];
    bushPositions.forEach(([bx, bz]) => {
        const bush = createFlowerBush();
        bush.position.set(bx, 0, bz);
        scene3D.add(bush);
    });
}

/**
 * Helper: Create 3D Pine Tree
 */
function createPineTree() {
    const group = new THREE.Group();

    // Trunk
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.4, 2.2, 8),
        new THREE.MeshLambertMaterial({ color: 0x543d2b })
    );
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    group.add(trunk);

    // Foliage (Tiered Cones)
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x274e28 });
    const tiers = [
        { r: 2.2, h: 2.5, y: 2.6 },
        { r: 1.7, h: 2.2, y: 3.8 },
        { r: 1.1, h: 1.8, y: 4.8 }
    ];

    tiers.forEach(tier => {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(tier.r, tier.h, 7), foliageMat);
        cone.position.y = tier.y;
        cone.castShadow = true;
        group.add(cone);
    });

    return group;
}

/**
 * Helper: Create Flower Bush
 */
function createFlowerBush() {
    const group = new THREE.Group();
    const greenMat = new THREE.MeshLambertMaterial({ color: 0x3d6b35 });
    const flowerMat = new THREE.MeshLambertMaterial({ color: 0xf39c12 });

    const baseBush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 1), greenMat);
    baseBush.position.y = 0.5;
    baseBush.scale.set(1.2, 0.8, 1.2);
    baseBush.castShadow = true;
    group.add(baseBush);

    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), flowerMat);
    bloom.position.set(0.1, 0.9, 0.1);
    group.add(bloom);

    return group;
}

/**
 * Helper: Create 3D Signboard with Canvas Text
 */
function create3DSignboard(text, width = 3, height = 0.8) {
    const group = new THREE.Group();

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    // Luxury Dark Green Background
    ctx.fillStyle = "#142617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Warm Gold Ornate Border
    ctx.strokeStyle = "#d4a373";
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 4;
    ctx.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);

    // Crisp Bright White Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 60px 'Cinzel', 'Playfair Display', serif, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
    group.add(board);

    return group;
}

/**
 * Populate Tables in 3D Space using tables.json metadata
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

    // 1. Raised Wooden Deck Platform
    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.35, 3.2), deckMat);
    deck.position.y = 0.2;
    deck.castShadow = true;
    deck.receiveShadow = true;
    group.add(deck);

    // 2. Bamboo Pillars (4 corners)
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

    // 4. Low Dining Table (Lesehan)
    const tableMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
    const lowTable = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.6), tableMat);
    lowTable.position.y = 0.55;
    lowTable.castShadow = true;
    group.add(lowTable);

    // 5. Floor Tatami Cushions
    const cushionMat = new THREE.MeshLambertMaterial({ color: 0xb53426 });
    const cushionOffsets = [[-0.9, 0], [0.9, 0], [0, -0.9], [0, 0.9]];
    cushionOffsets.forEach(([cx, cz]) => {
        const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 0.65), cushionMat);
        cushion.position.set(cx, 0.42, cz);
        group.add(cushion);
    });

    // 6. Hanging Warm Resort Amber Lantern
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

    // -------------------------------------------------------------------------
    // 1. MEJA COMPACT MENEMPEL PADA PAGAR (Compact Bar Ledge)
    // In local space:
    // Pagar perimeter berada di z = +0.24 (tepat di belakang meja).
    // Meja berukuran 0.95m x 0.48m, tebal 0.045m, tinggi y = 1.02m di atas lantai dek.
    // Sisi belakang meja menempel erat dan terhubung langsung ke pagar perimeter.
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // 2. TEPAT 1 KURSI TINGGI / BAR STOOL (High Stool untuk 1 Orang)
    // Terletak di sisi luar meja (z = -0.58) menghadap meja dan area outdoor.
    // Tinggi dudukan y = 0.74m di atas dek (standar kursi bar tinggi, bukan kursi makan biasa).
    // Kaki metal ramping splayed, footrest ring melingkar, dan low lumbar backrest.
    // -------------------------------------------------------------------------
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

    // 1. Meja Makan Kayu Panjang Sederhana (2.15m x 0.08m x 0.85m)
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

    // 2. Bangku Kayu Panjang Sederhana (2 Sisi: Utara & Selatan)
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

    // 1. Bantalan Duduk Pengunjung di Pinggir Kolam (0.55m x 0.06m x 0.36m)
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

    // 1. Long Teak Dining Table (Meja Kayu Panjang Solid)
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

    // 2. Long Wooden Benches with Backrest (Bangku Kayu Panjang Bersandaran) on North & South Sides
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
function setup3DInteraction() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let pointerDownPos = { x: 0, y: 0 };

    const canvas = renderer3D.domElement;

    // Track Pointer Down
    canvas.addEventListener("pointerdown", (e) => {
        isDragging = false;
        pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    // Track Pointer Move (Detect Drag vs Click & Handle Hover)
    canvas.addEventListener("pointermove", (e) => {
        const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
        if (moveDist > 6) isDragging = true;

        // Raycasting for Hover
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera3D);
        const intersects = raycaster.intersectObjects(tableObjects);

        if (intersects.length > 0) {
            const hit = intersects[0].object;
            const table = hit.userData.table;
            canvas.style.cursor = "pointer";

            if (hoveredTable !== hit) {
                // Restore previous
                if (hoveredTable && hoveredTable.userData.parentTableGroup) {
                    const prevSprite = hoveredTable.userData.parentTableGroup.userData.sprite;
                    if (prevSprite) prevSprite.scale.set(2.4, 1.05, 1.0);
                }

                hoveredTable = hit;
                // Highlight hovered
                const currSprite = hit.userData.parentTableGroup.userData.sprite;
                if (currSprite) currSprite.scale.set(2.8, 1.25, 1.0);

                show3DTooltip(table, e.clientX, e.clientY);
            } else {
                update3DTooltipPosition(e.clientX, e.clientY);
            }
        } else {
            canvas.style.cursor = "default";
            if (hoveredTable) {
                if (hoveredTable.userData.parentTableGroup) {
                    const prevSprite = hoveredTable.userData.parentTableGroup.userData.sprite;
                    if (prevSprite) prevSprite.scale.set(2.4, 1.05, 1.0);
                }
                hoveredTable = null;
                hide3DTooltip();
            }
        }
    });

    // Pointer Up: Handle Click / Tap on Table
    canvas.addEventListener("pointerup", (e) => {
        if (isDragging) return; // Ignore drag/rotation gestures

        const rect = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera3D);
        const intersects = raycaster.intersectObjects(tableObjects);

        if (intersects.length > 0) {
            const hit = intersects[0].object;
            const table = hit.userData.table;
            on3DTableClicked(table, hit.userData.parentTableGroup);
        }
    });
}

/**
 * Table Click Action: Fly Camera & Open Detail Modal
 */
function on3DTableClicked(table, tableGroup) {
    if (!table) return;

    hide3DTooltip();

    // Camera Fly to Table
    const targetX = tableGroup.position.x;
    const targetZ = tableGroup.position.z;
    const targetY = (table.zone === "outdoor") ? 1.5 : 1.0;

    const camX = targetX + 5.5;
    const camY = targetY + 6.5;
    const camZ = targetZ + 7.5;

    // Smooth Tween Transition
    if (typeof TWEEN !== "undefined") {
        new TWEEN.Tween(camera3D.position)
            .to({ x: camX, y: camY, z: camZ }, 700)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();

        new TWEEN.Tween(controls3D.target)
            .to({ x: targetX, y: targetY, z: targetZ }, 700)
            .easing(TWEEN.Easing.Cubic.Out)
            .onComplete(() => {
                // Open table detail modal
                if (typeof openTableModal === "function") {
                    openTableModal(table.id);
                }
            })
            .start();
    } else {
        camera3D.position.set(camX, camY, camZ);
        controls3D.target.set(targetX, targetY, targetZ);
        if (typeof openTableModal === "function") {
            openTableModal(table.id);
        }
    }
}

/**
 * Programmatic Table Selection (Exposed to Global Window)
 */
function select3DTableById(tableId) {
    const tables = (typeof tablesData !== "undefined" && tablesData.length > 0)
        ? tablesData
        : getDefaultTablesFallback();
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const group = tableGroupMap[tableId];
    if (group) {
        on3DTableClicked(table, group);
    }
}
window.select3DTableById = select3DTableById;

/**
 * Fly Camera to Zone Presets
 */
function focus3DZone(zoneKey) {
    currentActiveZone3D = zoneKey;

    const btns = document.querySelectorAll(".cam-preset-btn");
    btns.forEach(b => b.classList.remove("active"));
    const activeBtn = document.querySelector(`.cam-preset-btn[data-zone="${zoneKey}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    const preset = CAMERA_PRESETS[zoneKey] || CAMERA_PRESETS.all;

    if (typeof TWEEN !== "undefined") {
        new TWEEN.Tween(camera3D.position)
            .to(preset.pos, 850)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();

        new TWEEN.Tween(controls3D.target)
            .to(preset.target, 850)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();
    } else {
        camera3D.position.set(preset.pos.x, preset.pos.y, preset.pos.z);
        controls3D.target.set(preset.target.x, preset.target.y, preset.target.z);
    }
}

/**
 * Reset 3D Camera to Bird's Eye Overview
 */
function reset3DCamera() {
    focus3DZone("all");
}

/**
 * Toggle Fullscreen for 3D View
 */
function toggle3DFullscreen() {
    const wrap = document.getElementById("floorPlan3DContainer");
    if (!wrap) return;

    wrap.classList.toggle("fullscreen-mode");
    const isFull = wrap.classList.contains("fullscreen-mode");

    const icon = document.querySelector(".btn-3d-fullscreen i");
    if (icon) {
        icon.className = isFull ? "fas fa-compress" : "fas fa-expand";
    }

    if (isFull) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "";
    }

    setTimeout(on3DWindowResize, 100);
}

/**
 * Switch View Mode: 3D vs Classic Grid
 */
function switchTableViewMode(mode) {
    const btn3D = document.getElementById("btnView3D");
    const btnGrid = document.getElementById("btnViewGrid");
    const container3D = document.getElementById("floorPlan3DContainer");
    const containerGrid = document.getElementById("floorPlanGridContainer");

    if (mode === "3d") {
        if (btn3D) btn3D.classList.add("active");
        if (btnGrid) btnGrid.classList.remove("active");
        if (container3D) container3D.style.display = "block";
        if (containerGrid) containerGrid.style.display = "none";
        setTimeout(on3DWindowResize, 50);
    } else {
        if (btn3D) btn3D.classList.remove("active");
        if (btnGrid) btnGrid.classList.add("active");
        if (container3D) container3D.style.display = "none";
        if (containerGrid) containerGrid.style.display = "block";
    }
}

/**
 * Tooltip UI Helpers
 */
function show3DTooltip(table, clientX, clientY) {
    const tooltip = document.getElementById("table3DTooltip");
    if (!tooltip) return;

    document.getElementById("tooltipTableName").innerText = table.name;
    document.getElementById("tooltipTableZone").innerHTML = `<i class="fas fa-map-marker-alt"></i> ${table.zoneName}`;
    document.getElementById("tooltipTableCap").innerHTML = `<i class="fas fa-users"></i> ${table.capacity} Orang`;

    const statusPill = document.getElementById("tooltipTableStatus");
    if (statusPill) {
        statusPill.className = `table-status-pill ${table.status}`;
        statusPill.innerText = table.status.toUpperCase();
    }

    tooltip.style.display = "block";
    update3DTooltipPosition(clientX, clientY);
}

function update3DTooltipPosition(clientX, clientY) {
    const tooltip = document.getElementById("table3DTooltip");
    if (!tooltip) return;

    const wrap = document.getElementById("floorPlan3DContainer");
    const rect = wrap ? wrap.getBoundingClientRect() : { left: 0, top: 0 };

    const x = clientX - rect.left + 15;
    const y = clientY - rect.top - 10;

    tooltip.style.left = `${Math.max(10, Math.min(x, (wrap ? wrap.clientWidth : window.innerWidth) - 240))}px`;
    tooltip.style.top = `${Math.max(10, Math.min(y, (wrap ? wrap.clientHeight : window.innerHeight) - 150))}px`;
}

function hide3DTooltip() {
    const tooltip = document.getElementById("table3DTooltip");
    if (tooltip) tooltip.style.display = "none";
}

/**
 * Window Resize
 */
function on3DWindowResize() {
    if (!canvasContainer || !renderer3D || !camera3D) return;

    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;

    if (width === 0 || height === 0) return;

    camera3D.aspect = width / height;
    camera3D.updateProjectionMatrix();
    renderer3D.setSize(width, height);
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768);
    const targetDPR = isMobileDevice
        ? Math.min(window.devicePixelRatio || 1, 1.25)
        : Math.min(window.devicePixelRatio || 1, 1.75);
    renderer3D.setPixelRatio(targetDPR);
}

let isCanvasInView = true;

// Smart Viewport Observer: Pause WebGL render loop when user is browsing other parts of the website
if (typeof IntersectionObserver !== "undefined") {
    const canvasObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isCanvasInView = entry.isIntersecting;
        });
    }, { rootMargin: "100px" });
    const targetContainer = document.getElementById("webglCanvasContainer") || document.getElementById("denah-3d");
    if (targetContainer) {
        canvasObserver.observe(targetContainer);
    }
}

let lastRenderTime = 0;

/**
 * Animation Frame Loop (Adaptive 60 FPS with Off-Screen Sleep & Mobile Throttle)
 */
function animate3D(time) {
    animFrameId = requestAnimationFrame(animate3D);

    // Pause WebGL rendering if 3D section is scrolled off-screen (0% GPU drain when reading menus/home)
    if (!isCanvasInView) return;

    // Mobile frame throttling: cap at ~38 FPS on mobile to keep device cool & save battery
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768);
    if (isMobile) {
        const now = time || performance.now();
        if (now - lastRenderTime < 26) {
            return;
        }
        lastRenderTime = now;
    }

    if (typeof TWEEN !== "undefined") {
        TWEEN.update();
    }

    if (controls3D) {
        controls3D.update();
    }

    // Subtle breathing pulse for status rings
    const pulseScale = 1.0 + Math.sin(Date.now() * 0.003) * 0.05;
    tableObjects.forEach(hitBox => {
        const ring = hitBox.userData.parentTableGroup.userData.glowRing;
        if (ring) {
            ring.scale.set(pulseScale, pulseScale, 1);
        }
    });

        // Pulse Google Maps GPS Location Dot Ripple
    if (typeof gpsBlueDotRipple !== "undefined" && gpsBlueDotRipple) {
        const gpsTime = Date.now() * 0.0025;
        const gpsScale = 1.0 + (gpsTime % 1.0) * 1.5;
        const gpsOpacity = Math.max(0, 0.6 - (gpsTime % 1.0) * 0.6);
        gpsBlueDotRipple.scale.set(gpsScale, gpsScale, 1);
        gpsBlueDotRipple.material.opacity = gpsOpacity;
    }

    if (renderer3D && scene3D && camera3D) {
        renderer3D.render(scene3D, camera3D);
    }
}

window.focus3DZone = focus3DZone;
