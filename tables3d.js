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
        pos: { x: -8, y: 22, z: 54 },
        target: { x: -8, y: 1.0, z: 24 }
    },
    indoor: {
        pos: { x: -16.5, y: 2.1, z: 4.8 },
        target: { x: -10.5, y: 1.6, z: -2.5 }
    },
    stage: {
        pos: { x: 10, y: 2.8, z: 6.8 },
        target: { x: 10, y: 1.5, z: -2.0 }
    },
    east: {
        pos: { x: 10, y: 2.8, z: 6.8 },
        target: { x: 10, y: 1.5, z: -2.0 }
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
    // Lingkaran Hijau: Area Outdoor Dekat Jalan Raya (OD-01 s/d OD-06) - Tepi Jl. Gunungwungkal
    "OD-01": { x: -14, z: 19, zone: "outdoor", rotation: 0, umbrella: true },
    "OD-02": { x: -8,  z: 19, zone: "outdoor", rotation: 0, umbrella: true },
    "OD-03": { x: -2,  z: 19, zone: "outdoor", rotation: 0, umbrella: true },
    "OD-04": { x: -14, z: 25, zone: "outdoor", rotation: 0, umbrella: true },
    "OD-05": { x: -8,  z: 25, zone: "outdoor", rotation: 0, umbrella: true },
    "OD-06": { x: -2,  z: 25, zone: "outdoor", rotation: 0, umbrella: true },

    // Backward compatibility aliases
    "S-01": { x: -14, z: 19, zone: "outdoor", rotation: 0, umbrella: true },
    "S-02": { x: -8,  z: 20, zone: "outdoor", rotation: 0, umbrella: true },
    "S-03": { x: -2,  z: 19, zone: "outdoor", rotation: 0, umbrella: true },
    "S-04": { x: -14, z: 25, zone: "outdoor", rotation: 0, umbrella: true },
    "S-05": { x: -8,  z: 25, zone: "outdoor", rotation: 0, umbrella: true },
    "S-06": { x: -2,  z: 25, zone: "outdoor", rotation: 0, umbrella: true },

    // Lingkaran Putih: Zona Indoor Utama (IU-07 s/d IU-12) - Barat Daya
    "IU-07": { x: -16, z: -4, zone: "vip", rotation: 0, type: "vip-large" },
    "IU-08": { x: -10, z: -4, zone: "vip", rotation: 0, type: "vip-large" },
    "IU-09": { x: -16, z: 2,  zone: "vip", rotation: 0, type: "meeting" },
    "IU-10": { x: -10, z: 2,  zone: "vip", rotation: 0, type: "meeting" },
    "IU-11": { x: -16, z: -1, zone: "vip", rotation: 0, type: "lounge" },
    "IU-12": { x: -10, z: -1, zone: "vip", rotation: 0, type: "lounge" },

    // Lingkaran Biru (Tengah): Zona Kolam Terapi Ikan (TI-01 s/d TI-03)
    "TI-01": { x: 17, z: -2, zone: "outdoor", rotation: 0, umbrella: false },
    "TI-02": { x: 20, z: 1,  zone: "outdoor", rotation: 0, umbrella: false },
    "TI-03": { x: 17, z: 4,  zone: "outdoor", rotation: 0, umbrella: false },

    // Lingkaran Biru (Kiri): Zona Indoor Timur 1 (IT1-13 s/d IT1-16)
    "IT1-13": { x: 8,  z: 0.6, zone: "vip", rotation: 0 },
    "IT1-14": { x: 12, z: 0.6, zone: "vip", rotation: 0 },
    "IT1-15": { x: 8,  z: 3.6, zone: "vip", rotation: 0 },
    "IT1-16": { x: 12, z: 3.6, zone: "vip", rotation: 0 },

    // Lingkaran Biru (Kanan): Zona Indoor Timur 2 (IT2-17 s/d IT2-20)
    "IT2-17": { x: 26, z: -2, zone: "vip", rotation: 0 },
    "IT2-18": { x: 30, z: -2, zone: "vip", rotation: 0 },
    "IT2-19": { x: 26, z: 4,  zone: "vip", rotation: 0 },
    "IT2-20": { x: 30, z: 4,  zone: "vip", rotation: 0 },

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

    renderer3D.shadowMap.enabled = true;
    renderer3D.shadowMap.type = isMobileDevice ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
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

    // Main Warm Golden Key Light
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768);
    const sunLight = new THREE.DirectionalLight(0xffdfa9, 0.85);
    sunLight.position.set(28, 45, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = isMobileDevice ? 1024 : 2048;
    sunLight.shadow.mapSize.height = isMobileDevice ? 1024 : 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 120;
    const d = 40;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0008;
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

    // 3. Flower Planter Troughs along roadside edge
    const planterMat = new THREE.MeshLambertMaterial({ color: 0x4a3424 }); // Dark wood planter box
    const shrubMat = new THREE.MeshLambertMaterial({ color: 0x2d5a27 }); // Lush green shrub
    const flowerMat = new THREE.MeshLambertMaterial({ color: 0xe5a342 }); // Golden yellow flowers

    const planterPositions = [-17, -13, -3, 1];
    planterPositions.forEach(px => {
        const box = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.5, 0.8), planterMat);
        box.position.set(px, 0.55, 28.2);
        box.castShadow = true;
        group.add(box);

        const shrub = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.45, 0.7), shrubMat);
        shrub.position.set(px, 0.85, 28.2);
        group.add(shrub);

        // Flower accents
        for (let fx = -1.1; fx <= 1.1; fx += 0.55) {
            const fl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), flowerMat);
            fl.position.set(px + fx, 1.12, 28.2);
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

    // 5. Exposed Timber Roof Truss & Rafters (Rangka Atap Usuk Kayu Terekspos)
    [-2.6, 2.6].forEach(kx => {
        const kingPost = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.8, 0.24), beamMat);
        kingPost.position.set(kx, 4.65, 0);
        group.add(kingPost);
    });

    const ridgeBeam = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.24, 0.24), beamMat);
    ridgeBeam.position.set(0, 5.55, 0);
    group.add(ridgeBeam);

    // Exposed Timber Rafters (Usuk-Usuk Kayu Berjejer Rapat)
    for (let rx = -7.4; rx <= 7.4; rx += 0.65) {
        const rafterN = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 8.4), rafterMat);
        rafterN.position.set(rx, 4.65, -3.5);
        rafterN.rotation.x = 0.44;
        group.add(rafterN);

        const rafterS = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 8.4), rafterMat);
        rafterS.position.set(rx, 4.65, 3.5);
        rafterS.rotation.x = -0.44;
        group.add(rafterS);
    }

    // Exposed Horizontal Ceiling Battens / Purlins (Reng Bambu/Kayu di Bawah Atap)
    [-5.8, -4.2, -2.6, -1.0, 1.0, 2.6, 4.2, 5.8].forEach(pz => {
        const purlin = new THREE.Mesh(new THREE.BoxGeometry(15.6, 0.08, 0.08), battenMat);
        const yPurlin = 5.55 - Math.abs(pz) * 0.26;
        purlin.position.set(0, yPurlin, pz);
        group.add(purlin);
    });

    // 6. Terracotta Clay Tile Pitched Roof (Genteng Tanah Liat Limasan Tradisional)
    const roofN = new THREE.Mesh(new THREE.BoxGeometry(17.4, 0.12, 8.8), tileMat);
    roofN.position.set(0, 4.75, -3.6);
    roofN.rotation.x = 0.44;
    roofN.castShadow = true;
    roofN.receiveShadow = true;
    group.add(roofN);

    const roofS = new THREE.Mesh(new THREE.BoxGeometry(17.4, 0.12, 8.8), tileMat);
    roofS.position.set(0, 4.75, 3.6);
    roofS.rotation.x = -0.44;
    roofS.castShadow = true;
    roofS.receiveShadow = true;
    group.add(roofS);

    const eastHip = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.2, 4), tileMat);
    eastHip.position.set(8.2, 4.65, 0);
    eastHip.rotation.y = Math.PI / 4;
    group.add(eastHip);

    const westHip = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.2, 4), tileMat);
    westHip.position.set(-8.2, 4.65, 0);
    westHip.rotation.y = Math.PI / 4;
    group.add(westHip);

    const ridgeCap = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.18, 0.42), tileMat);
    ridgeCap.position.set(0, 5.65, 0);
    group.add(ridgeCap);

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
 * Build Indoor Timur 1 (Panggung Pertunjukan Musik / Acoustic Live Stage Hall)
 * Sesuai foto riil Warung Makan Bukit Padangan (img_ee137fc07575.jpg):
 * - Panggung utama kayu solid (elevated wooden stage h: 0.22m)
 * - Dinding latar bilah bambu vertikal (polished bamboo slats / pelupuh)
 * - Plafon balok kayu ekspos & rangka kayu tradisional terbuka
 * - 2 Pintu ganda backstage kiri & kanan dengan plang 'KHUSUS KARYAWAN'
 * - Sepeda onthel antik hitam klasik (roadster bicycle) di sisi kanan panggung
 * - Unit sound system trolley speaker portabel ber-LED dengan 'Kotak Apresiasi'
 * - Tripod stand mikrofon & instrumen musik, tumpukan kursi panggung
 * - Instalasi seni akustik dinding: tampah/nyiru aneka ukuran, kukusan, boboko, caping
 * - 2 Lampu gantung kap anyaman bambu kerucut tradisional (cahaya hangat 2700K)
 * - Area penonton lantai batu alam lempeng acak dengan bangku & meja kayu
 */
function buildIndoorTimur1() {
    const group = new THREE.Group();
    group.position.set(10, 0, 1);

    const teakMat   = new THREE.MeshStandardMaterial({ color: 0x4a2e1b, roughness: 0.6, metalness: 0.05 });
    const beamMat   = new THREE.MeshStandardMaterial({ color: 0x331c0e, roughness: 0.7, metalness: 0.05 });
    const stageMat  = new THREE.MeshStandardMaterial({ color: 0x54331a, roughness: 0.5, metalness: 0.1 });
    const panelMat  = new THREE.MeshStandardMaterial({ color: 0x6e4324, roughness: 0.6, metalness: 0.05 });
    const tileMat   = new THREE.MeshStandardMaterial({ color: 0x823b26, roughness: 0.8, metalness: 0.0 });
    const metalMat  = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4, metalness: 0.7 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.85 });

    // 1. Audience Floor: Irregular Slate Flagstones (Crazy Paving)
    const floorCanvas = document.createElement("canvas");
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fctx = floorCanvas.getContext("2d");
    fctx.fillStyle = "#1e2430";
    fctx.fillRect(0, 0, 512, 512);

    const slateColors = ["#3a4352", "#485366", "#2f3642", "#525e73", "#3d4657", "#4a463e", "#5a544b"];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const x = c * 64 + 4 + (((r * 13 + c * 17) % 7) - 3);
            const y = r * 64 + 4 + (((r * 19 + c * 11) % 7) - 3);
            fctx.fillStyle = slateColors[(r * 5 + c * 3) % slateColors.length];
            fctx.beginPath();
            fctx.roundRect(x, y, 56, 56, 6);
            fctx.fill();
            fctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
            fctx.lineWidth = 2.5;
            fctx.stroke();
        }
    }
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(3, 3);
    floorTex.needsUpdate = true;

    const floorGeo = new THREE.BoxGeometry(9.6, 0.25, 10.4);
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.7 }));
    floor.position.y = 0.12;
    floor.receiveShadow = true;
    group.add(floor);

    // 2. Elevated Wooden Performance Stage (Panggung Utama Kayu Solid h: 0.24m)
    const stageGeo = new THREE.BoxGeometry(7.8, 0.26, 3.2);
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.set(0, 0.38, -3.2);
    stage.receiveShadow = true;
    group.add(stage);

    // Stage Front Skirt Board (Lis Kayu Depan Panggung)
    const skirtGeo = new THREE.BoxGeometry(7.84, 0.26, 0.08);
    const skirt = new THREE.Mesh(skirtGeo, new THREE.MeshStandardMaterial({ color: 0x3d2110, roughness: 0.6 }));
    skirt.position.set(0, 0.38, -1.58);
    group.add(skirt);

    // 3. Vertical Bamboo Slats Backdrop (Dinding Latar Bilah Bambu Pelupuh)
    const bambooCanvas = document.createElement("canvas");
    bambooCanvas.width = 512;
    bambooCanvas.height = 512;
    const bctx = bambooCanvas.getContext("2d");
    bctx.fillStyle = "#c28f44"; // Rich warm golden bamboo
    bctx.fillRect(0, 0, 512, 512);

    for (let bx = 0; bx < 512; bx += 8) {
        const tone = ((bx * 7) % 35) - 17;
        bctx.fillStyle = `rgb(${194 + tone}, ${143 + tone}, ${68 + tone})`;
        bctx.fillRect(bx, 0, 7, 512);

        bctx.fillStyle = "rgba(45, 25, 10, 0.7)";
        bctx.fillRect(bx + 6.5, 0, 1.5, 512);

        for (let ny = 60; ny < 512; ny += 95) {
            bctx.fillStyle = "rgba(80, 48, 20, 0.4)";
            bctx.fillRect(bx, ny + ((bx * 3) % 7), 7, 3);
        }
    }
    const bambooTex = new THREE.CanvasTexture(bambooCanvas);
    bambooTex.wrapS = THREE.RepeatWrapping;
    bambooTex.wrapT = THREE.RepeatWrapping;
    bambooTex.repeat.set(2, 1);
    bambooTex.needsUpdate = true;

    const backWallMat = new THREE.MeshStandardMaterial({ map: bambooTex, roughness: 0.55 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(7.8, 3.6, 0.16), backWallMat);
    backWall.position.set(0, 2.05, -4.75);
    backWall.receiveShadow = true;
    group.add(backWall);

    // 4. Symmetrical Backstage Doors ("KHUSUS KARYAWAN")
    function createKaryawanSign() {
        const c = document.createElement("canvas");
        c.width = 256;
        c.height = 64;
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#0c502b";
        ctx.fillRect(0, 0, 256, 64);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 6;
        ctx.strokeRect(4, 4, 248, 56);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("KHUSUS KARYAWAN", 128, 32);

        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.25), new THREE.MeshBasicMaterial({ map: tex }));
        return sign;
    }

    // Left Doorway (Equipment rack / backstage)
    const leftDoorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.5, 0.2), beamMat);
    leftDoorFrame.position.set(-4.2, 1.5, -4.72);
    group.add(leftDoorFrame);

    const leftDoorOpening = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.3, 0.14), new THREE.MeshStandardMaterial({ color: 0x181e28, roughness: 0.8 }));
    leftDoorOpening.position.set(-4.2, 1.4, -4.74);
    group.add(leftDoorOpening);

    const signLeft = createKaryawanSign();
    signLeft.position.set(-4.2, 2.75, -4.6);
    group.add(signLeft);

    // Right Doorway (Wood panel door)
    const rightDoorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.5, 0.2), beamMat);
    rightDoorFrame.position.set(4.2, 1.5, -4.72);
    group.add(rightDoorFrame);

    const rightDoorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.3, 0.1), panelMat);
    rightDoorPanel.position.set(4.2, 1.4, -4.74);
    group.add(rightDoorPanel);

    const signRight = createKaryawanSign();
    signRight.position.set(4.2, 2.75, -4.6);
    group.add(signRight);

    // 5. Open-Air Rustic Side Walls (Setengah Badan Kayu Jati / Balustrade 1.1m)
    // Sisi kiri & kanan dibuat terbuka di bagian atas agar pencahayaan alami & pemandangan lereng tetap masuk
    const westBalustrade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.1, 10.2), panelMat);
    westBalustrade.position.set(-4.75, 0.75, 0);
    westBalustrade.receiveShadow = true;
    group.add(westBalustrade);

    const eastBalustrade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.1, 10.2), panelMat);
    eastBalustrade.position.set(4.75, 0.75, 0);
    eastBalustrade.receiveShadow = true;
    group.add(eastBalustrade);

    // Structural Timber Posts (Tiang Kayu Penopang)
    [-4.7, 4.7].forEach(px => {
        [-4.7, 0, 4.7].forEach(pz => {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.8, 0.3), teakMat);
            post.position.set(px, 2.0, pz);
            group.add(post);
        });
    });

    // 6. Perimeter Roof Beams & Cross Ties
    const bNorth = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.28, 0.26), beamMat);
    bNorth.position.set(0, 3.75, -4.75);
    group.add(bNorth);

    const bSouth = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.28, 0.26), beamMat);
    bSouth.position.set(0, 3.75, 4.75);
    group.add(bSouth);

    const bWest = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 10.2), beamMat);
    bWest.position.set(-4.75, 3.75, 0);
    group.add(bWest);

    const bEast = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 10.2), beamMat);
    bEast.position.set(4.75, 3.75, 0);
    group.add(bEast);

    const bCenter = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.24, 0.24), beamMat);
    bCenter.position.set(0, 3.75, 0);
    group.add(bCenter);

    // Traditional Pitched Terracotta Roof
    const roofN = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.12, 5.6), tileMat);
    roofN.position.set(0, 4.55, -2.4);
    roofN.rotation.x = 0.36;
    group.add(roofN);

    const roofS = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.12, 5.6), tileMat);
    roofS.position.set(0, 4.55, 2.4);
    roofS.rotation.x = -0.36;
    group.add(roofS);

    // 7. Iconic Museum-Grade Ultra-Smooth Vintage Sepeda Onthel (Gazelle Champion / Fongers Style)
    // Geometri presisi beresolusi tinggi: lingkar lengkung kurva ultra-halus, sadel Brooks berkontur, stang dongkol pipa mulus
    const bikeGroup = new THREE.Group();
    bikeGroup.position.set(0, 0.40, -3.1);
    bikeGroup.rotation.y = 0.16; // Angled gracefully towards the audience for perfect silhouette

    // Materials
    const bikeBlackMat = new THREE.MeshStandardMaterial({
        color: 0x0a0c10,
        roughness: 0.15,
        metalness: 0.50,
        side: THREE.DoubleSide
    }); // High-gloss Dutch black enamel lacquer with rich reflections
    const bikeChromeMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.08,
        metalness: 0.98
    }); // Mirror-finish vintage chrome
    const bikeTireMat = new THREE.MeshStandardMaterial({
        color: 0x16171a,
        roughness: 0.88,
        metalness: 0.04
    }); // Deep matte vintage tire rubber
    const bikeLeatherMat = new THREE.MeshStandardMaterial({
        color: 0x3d1b0d,
        roughness: 0.38,
        metalness: 0.10
    }); // Aged Brooks chestnut brown leather
    const goldPinstripeMat = new THREE.MeshStandardMaterial({
        color: 0xe5aa52,
        roughness: 0.22,
        metalness: 0.88,
        emissive: 0x4a300a,
        emissiveIntensity: 0.30
    }); // Elegant gold pinstripe accent
    const brassMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.20,
        metalness: 0.92
    }); // Polished brass for rivets & bell

    // --- A. WHEELS (28" Chrome Rims, Fine Wire Spokes, Deep Rubber Tires, Ultra-Smooth 128-Seg) ---
    function createOnthelWheel(xPos) {
        const wGroup = new THREE.Group();
        wGroup.position.set(xPos, 0.42, 0);

        // Ultra-Smooth Polished Chrome Rim (128 tubular segments for seamless circle)
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.385, 0.015, 16, 64), bikeChromeMat);
        wGroup.add(rim);

        // Ultra-Smooth Vintage Tread Rubber Tire (128 tubular segments)
        const tire = new THREE.Mesh(new THREE.TorusGeometry(0.402, 0.026, 16, 64), bikeTireMat);
        wGroup.add(tire);

        // Center Chrome Hub with Flanges & Axle Nuts
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.14, 32), bikeChromeMat);
        hub.rotation.x = Math.PI / 2;
        wGroup.add(hub);

        // Spoke Flange Rings
        [-0.05, 0.05].forEach(fz => {
            const flange = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.004, 12, 32), bikeChromeMat);
            flange.position.z = fz;
            wGroup.add(flange);
        });

        [-0.07, 0.07].forEach(nz => {
            const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 16), bikeChromeMat);
            nut.rotation.x = Math.PI / 2;
            nut.position.z = nz;
            wGroup.add(nut);
        });

        // Fine Round Wire Spokes via InstancedMesh (36 spokes per wheel in EXACTLY 1 draw call!)
        const spokeCount = 36;
        const spokeGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.77, 6);
        const spokeInst = new THREE.InstancedMesh(spokeGeo, bikeChromeMat, spokeCount);
        const dummy = new THREE.Object3D();
        for (let s = 0; s < spokeCount; s++) {
            const angle = (s * Math.PI * 2) / spokeCount;
            const side = (s % 2 === 0) ? 0.012 : -0.012;
            const offset = (s % 2 === 0) ? 0 : 0.08;
            dummy.position.set(0, 0, side);
            dummy.rotation.set(0, 0, angle + offset);
            dummy.updateMatrix();
            spokeInst.setMatrixAt(s, dummy.matrix);
        }
        spokeInst.instanceMatrix.needsUpdate = true;
        wGroup.add(spokeInst);
        return wGroup;
    }

    const frontWheel = createOnthelWheel(0.74);
    bikeGroup.add(frontWheel);

    const rearWheel = createOnthelWheel(-0.74);
    bikeGroup.add(rearWheel);

    // --- B. VINTAGE C-CHANNEL FENDERS WITH WHITE TIP & GAZELLE MASCOT (128 Radial Segments) ---
    // Front Fender (Lengkung Depan Ber-Volume Halus Tanpa Facet)
    const frontFender = new THREE.Mesh(
        new THREE.CylinderGeometry(0.435, 0.435, 0.072, 64, 1, true, -Math.PI * 0.18, Math.PI * 0.82),
        bikeBlackMat
    );
    frontFender.rotation.x = Math.PI / 2;
    frontFender.position.set(0.74, 0.42, 0);
    bikeGroup.add(frontFender);

    // Iconic Gazelle Leaping Mascot on Front Fender Tip
    const mascotGroup = new THREE.Group();
    mascotGroup.position.set(0.96, 0.76, 0);
    mascotGroup.rotation.z = 0.55;
    const mascotBody = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.065, 24), bikeChromeMat);
    mascotBody.rotation.z = -Math.PI / 2;
    mascotGroup.add(mascotBody);
    const mascotHead = new THREE.Mesh(new THREE.SphereGeometry(0.014, 20, 20), bikeChromeMat);
    mascotHead.position.set(0.038, 0.012, 0);
    mascotGroup.add(mascotHead);
    const mascotHorns = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.0025, 8, 20, Math.PI * 0.6), bikeChromeMat);
    mascotHorns.position.set(0.040, 0.024, 0);
    mascotHorns.rotation.z = 0.4;
    mascotGroup.add(mascotHorns);
    bikeGroup.add(mascotGroup);

    // Front Fender Stays (Dual Chrome Wire Stays to Front Axle)
    [-0.045, 0.045].forEach(sz => {
        const stay = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.44, 16), bikeChromeMat);
        stay.position.set(0.74, 0.22, sz);
        stay.rotation.z = 0.22;
        bikeGroup.add(stay);
    });

    // Rear Fender (Lengkung Belakang Ber-Volume Panjang 128 Segments)
    const rearFender = new THREE.Mesh(
        new THREE.CylinderGeometry(0.435, 0.435, 0.072, 64, 1, true, -Math.PI * 0.48, Math.PI * 1.02),
        bikeBlackMat
    );
    rearFender.rotation.x = Math.PI / 2;
    rearFender.position.set(-0.74, 0.42, 0);
    bikeGroup.add(rearFender);

    // Rear Fender Stays (Dual Chrome Wire Stays to Rear Axle)
    [-0.045, 0.045].forEach(sz => {
        const stay = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.44, 16), bikeChromeMat);
        stay.position.set(-0.74, 0.22, sz);
        stay.rotation.z = -0.22;
        bikeGroup.add(stay);
    });

    // Rear Fender White Tip Patch (Cat Putih Ujung Spatbor Belakang Khas Onthel Belanda)
    const rearWhiteTip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.438, 0.438, 0.074, 96, 1, true, -Math.PI * 0.48, Math.PI * 0.28),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 })
    );
    rearWhiteTip.rotation.x = Math.PI / 2;
    rearWhiteTip.position.set(-0.74, 0.42, 0);
    bikeGroup.add(rearWhiteTip);

    // --- C. ICONIC JASBESCHERMERS (Penutup Kain / Anyaman Jala Roda Belakang - 96 Segments) ---
    const coatGuardMat = new THREE.MeshStandardMaterial({
        color: 0x14161a,
        roughness: 0.85,
        metalness: 0.08,
        transparent: true,
        opacity: 0.94,
        side: THREE.DoubleSide
    });
    [-0.038, 0.038].forEach(sideZ => {
        // Upper rear quarter woven shield (96 theta segments for perfectly round arc)
        const coatGuard = new THREE.Mesh(
            new THREE.RingGeometry(0.18, 0.425, 96, 1, Math.PI * 0.48, Math.PI * 0.52),
            coatGuardMat
        );
        coatGuard.position.set(-0.74, 0.42, sideZ);
        bikeGroup.add(coatGuard);

        // Cord/rib lace patterns across the coat guard (8 fine radial laces)
        for (let cr = 0; cr < 8; cr++) {
            const cordAngle = Math.PI * 0.50 + cr * 0.072;
            const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.24, 12), goldPinstripeMat);
            cord.position.set(
                -0.74 + Math.cos(cordAngle) * 0.30,
                0.42 + Math.sin(cordAngle) * 0.30,
                sideZ + (sideZ > 0 ? 0.002 : -0.002)
            );
            cord.rotation.z = cordAngle + Math.PI / 2;
            bikeGroup.add(cord);
        }
    });

    // --- D. CLASSIC HEREN DIAMOND FRAME (Rangka Batangan Onthel Lanang - 32-Seg Tubes) ---
    // Head Tube (Pipa Leher Tebal dengan Badge Onthel)
    const headTube = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.26, 32), bikeBlackMat);
    headTube.position.set(0.58, 0.90, 0);
    headTube.rotation.z = -0.32;
    bikeGroup.add(headTube);

    // Head Badge (Emblem Gazelle / Fongers di Pipa Leher)
    const headBadge = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 32, 1, true, 0, Math.PI), goldPinstripeMat);
    headBadge.position.set(0.58, 0.90, 0);
    headBadge.rotation.z = -0.32;
    headBadge.rotation.y = Math.PI / 2;
    bikeGroup.add(headBadge);

    // Front Fork Blades (Garpu Depan Kokoh dengan Crown Khas Onthel)
    const forkCrown = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.03, 0.09), bikeChromeMat);
    forkCrown.position.set(0.61, 0.78, 0);
    forkCrown.rotation.z = -0.32;
    bikeGroup.add(forkCrown);

    [-0.042, 0.042].forEach(fz => {
        const forkBlade = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.54, 24), bikeBlackMat);
        forkBlade.position.set(0.67, 0.58, fz);
        forkBlade.rotation.z = -0.32;
        bikeGroup.add(forkBlade);

        // Gold pinstripe on fork blade
        const fStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.0155, 0.0125, 0.38, 24, 1, true, 0, Math.PI), goldPinstripeMat);
        fStripe.position.set(0.67, 0.60, fz);
        fStripe.rotation.z = -0.32;
        fStripe.rotation.y = fz > 0 ? Math.PI / 2 : -Math.PI / 2;
        bikeGroup.add(fStripe);
    });

    // Bottle Dynamo mounted on Right Front Fork (Dinamo Botol Roda Depan)
    const dynamoGroup = new THREE.Group();
    dynamoGroup.position.set(0.69, 0.68, 0.065);
    const dynamoBody = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.09, 24), bikeChromeMat);
    dynamoGroup.add(dynamoBody);
    const dynamoCap = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.012, 0.024, 24), bikeBlackMat);
    dynamoCap.position.y = 0.055;
    dynamoGroup.add(dynamoCap);
    // Wire from dynamo to headlight
    const dynamoWire = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.36, 12), bikeBlackMat);
    dynamoWire.position.set(-0.06, 0.16, -0.04);
    dynamoWire.rotation.z = 0.6;
    dynamoGroup.add(dynamoWire);
    bikeGroup.add(dynamoGroup);

    // Bottom Bracket Shell (Rumah As Tengah Chrome)
    const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.13, 32), bikeChromeMat);
    bb.position.set(-0.10, 0.42, 0);
    bb.rotation.x = Math.PI / 2;
    bikeGroup.add(bb);

    // Seat Tube (Pipa Tiang Sadel - 32-Seg)
    const seatTube = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.60, 32), bikeBlackMat);
    seatTube.position.set(-0.21, 0.68, 0);
    seatTube.rotation.z = -0.36;
    bikeGroup.add(seatTube);

    // Top Tube (Palang Batangan Lurus Horisontal Khas Onthel Heren - 32-Seg)
    const topTube = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.88, 32), bikeBlackMat);
    topTube.position.set(0.14, 0.92, 0);
    topTube.rotation.z = Math.PI / 2 - 0.03;
    bikeGroup.add(topTube);

    // Gold Pinstripe on Top Tube
    const topStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.0185, 0.0185, 0.72, 32, 1, true, 0, Math.PI), goldPinstripeMat);
    topStripe.position.set(0.14, 0.92, 0);
    topStripe.rotation.z = Math.PI / 2 - 0.03;
    topStripe.rotation.x = Math.PI / 2;
    bikeGroup.add(topStripe);

    // Down Tube (Pipa Serong Bawah - 32-Seg)
    const downTube = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.020, 0.86, 32), bikeBlackMat);
    downTube.position.set(0.24, 0.66, 0);
    downTube.rotation.z = -0.92;
    bikeGroup.add(downTube);

    // Vintage Frame Tire Pump (Pompa Angin Tabung Jadul Terpasang di Down Tube)
    const pumpGroup = new THREE.Group();
    pumpGroup.position.set(0.21, 0.63, 0.032);
    pumpGroup.rotation.z = -0.92;
    const pumpBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.44, 24), bikeChromeMat);
    pumpGroup.add(pumpBarrel);
    const pumpHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.05, 24), bikeLeatherMat);
    pumpHandle.position.y = 0.24;
    pumpGroup.add(pumpHandle);
    [-0.20, 0.20].forEach(cy => {
        const clip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.035), bikeChromeMat);
        clip.position.y = cy;
        pumpGroup.add(clip);
    });
    bikeGroup.add(pumpGroup);

    // Rear Seat Stays (Penopang Sadel ke As Belakang)
    [-0.042, 0.042].forEach(sz => {
        const stay = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.011, 0.66, 20), bikeBlackMat);
        stay.position.set(-0.53, 0.67, sz);
        stay.rotation.z = 0.86;
        bikeGroup.add(stay);
    });

    // Chain Stays (Garpu Bawah Rantai)
    [-0.042, 0.042].forEach(cz => {
        const cStay = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.66, 20), bikeBlackMat);
        cStay.position.set(-0.42, 0.42, cz);
        cStay.rotation.z = Math.PI / 2;
        bikeGroup.add(cStay);
    });

    // --- E. FULL ENCLOSED CHAINCASE (Katengkas Penuh Khas Onthel dengan Garis Emas - 64 Seg) ---
    const chaincaseGroup = new THREE.Group();
    chaincaseGroup.position.set(-0.38, 0.42, 0.055);

    // Body Katengkas (Plat Enamel Hitam Melengkung Rapi)
    const caseMain = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.20, 0.035), bikeBlackMat);
    chaincaseGroup.add(caseMain);

    // Front Round Bulge for Chainring (64 segments for perfect circle)
    const caseDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.038, 64), bikeBlackMat);
    caseDisc.rotation.x = Math.PI / 2;
    caseDisc.position.set(0.28, 0, 0);
    chaincaseGroup.add(caseDisc);

    // Rear Axle Round Cap
    const caseRearDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.036, 48), bikeBlackMat);
    caseRearDisc.rotation.x = Math.PI / 2;
    caseRearDisc.position.set(-0.34, 0, 0);
    chaincaseGroup.add(caseRearDisc);

    // Elegant Gold Pinstripe Border on Chaincase (Lis Emas Mewah)
    const goldLine1 = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.008, 0.04), goldPinstripeMat);
    goldLine1.position.set(0, 0.06, 0.002);
    chaincaseGroup.add(goldLine1);

    const goldLine2 = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.008, 0.04), goldPinstripeMat);
    goldLine2.position.set(0, -0.06, 0.002);
    chaincaseGroup.add(goldLine2);

    const goldRing = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.005, 16, 64), goldPinstripeMat);
    goldRing.position.set(0.28, 0, 0.02);
    chaincaseGroup.add(goldRing);

    // Chrome Crank Arms & Vintage Rubber Block Pedals
    const crankR = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.19, 20), bikeChromeMat);
    crankR.position.set(0.28, -0.08, 0.045);
    chaincaseGroup.add(crankR);

    const pedalR = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.032, 0.065), bikeTireMat);
    pedalR.position.set(0.28, -0.18, 0.085);
    chaincaseGroup.add(pedalR);

    // Pedal Amber Reflector
    const pedalReflector = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 0.01), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    pedalReflector.position.set(0.28, -0.18, 0.12);
    chaincaseGroup.add(pedalReflector);

    bikeGroup.add(chaincaseGroup);

    // --- F. VINTAGE BROOKS CONTOURED LEATHER SADDLE WITH COPPER RIVETS & TOOL BAG ---
    const saddleGroup = new THREE.Group();
    saddleGroup.position.set(-0.33, 0.98, 0);

    // Chrome Seatpost & Clamp Lug
    const seatPost = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 24), bikeChromeMat);
    seatPost.position.y = -0.08;
    saddleGroup.add(seatPost);

    const seatClamp = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.035, 0.05), bikeChromeMat);
    seatClamp.position.y = 0.01;
    saddleGroup.add(seatClamp);

    // Organically Contoured Aged Brown Leather Saddle Top (Smooth Bezier Spline + Beveled Extrusion)
    const saddleShape = new THREE.Shape();
    saddleShape.moveTo(0.19, 0);
    saddleShape.bezierCurveTo(0.14, 0.032, 0.02, 0.052, -0.06, 0.098);
    saddleShape.bezierCurveTo(-0.13, 0.140, -0.17, 0.115, -0.19, 0.065);
    saddleShape.bezierCurveTo(-0.20, 0.025, -0.20, -0.025, -0.19, -0.065);
    saddleShape.bezierCurveTo(-0.17, -0.115, -0.13, -0.140, -0.06, -0.098);
    saddleShape.bezierCurveTo(0.02, -0.052, 0.14, -0.032, 0.19, 0);

    const saddleExtrudeSettings = {
        steps: 1,
        depth: 0.038,
        bevelEnabled: true,
        bevelThickness: 0.024,
        bevelSize: 0.018,
        bevelSegments: 8
    };
    const saddleGeo = new THREE.ExtrudeGeometry(saddleShape, saddleExtrudeSettings);
    saddleGeo.rotateX(-Math.PI / 2);
    saddleGeo.center();
    const saddleTop = new THREE.Mesh(saddleGeo, bikeLeatherMat);
    saddleTop.position.set(-0.04, 0.075, 0);
    saddleGroup.add(saddleTop);

    // 7 Solid Brass Rivets along the back curve of the saddle (Paku Keling Kuningan Brooks)
    for (let rv = 0; rv < 7; rv++) {
        const rvAngle = -Math.PI * 0.38 + rv * (Math.PI * 0.76 / 6);
        const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.006, 16, 16), brassMat);
        rivet.position.set(-0.15 + Math.cos(rvAngle) * 0.035, 0.088, Math.sin(rvAngle) * 0.105);
        saddleGroup.add(rivet);
    }

    // Dual Heavy-Duty Chrome Coil Springs (Per Keong Sadel Belakang)
    [-0.055, 0.055].forEach(sz => {
        for (let sp = 0; sp < 3; sp++) {
            const coil = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.007, 16, 32), bikeChromeMat);
            coil.rotation.x = Math.PI / 2;
            coil.position.set(-0.14, 0.02 + sp * 0.025, sz);
            saddleGroup.add(coil);
        }
    });

    // Vintage Leather Saddle Tool Bag Hanging Behind Seat (Tas Sadel Kulit Khas Onthel)
    const toolBag = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.16), bikeLeatherMat);
    toolBag.position.set(-0.24, 0.04, 0);
    saddleGroup.add(toolBag);
    // Brass buckles on tool bag
    [-0.045, 0.045].forEach(bz => {
        const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.02, 0.02), brassMat);
        buckle.position.set(-0.31, 0.04, bz);
        saddleGroup.add(buckle);
    });

    bikeGroup.add(saddleGroup);

    // --- G. SWEPT-BACK CONTINUOUS CURVED HANDLEBARS, BULLET HEADLIGHT & BRASS BELL ---
    const handleGroup = new THREE.Group();
    handleGroup.position.set(0.55, 1.01, 0);

    // Chrome Quill Stem (Leher Stang Angsa)
    const stemVert = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 24), bikeChromeMat);
    stemVert.position.y = 0.04;
    handleGroup.add(stemVert);

    const stemForward = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.10, 24), bikeChromeMat);
    stemForward.position.set(0.03, 0.12, 0);
    stemForward.rotation.z = Math.PI / 2;
    handleGroup.add(stemForward);

    // Seamless Continuous Curved Handlebar (Stang Dongkol Klasik - CatmullRom Tube 64-Seg)
    const barCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.16, 0.128, 0.28),   // left grip end
        new THREE.Vector3(-0.06, 0.142, 0.25),   // sweep forward
        new THREE.Vector3(0.035, 0.150, 0.14),   // bend towards center
        new THREE.Vector3(0.065, 0.140, 0.00),   // center stem clamp
        new THREE.Vector3(0.035, 0.150, -0.14),  // bend towards right
        new THREE.Vector3(-0.06, 0.142, -0.25),  // sweep back
        new THREE.Vector3(-0.16, 0.128, -0.28)   // right grip end
    ]);
    const barGeo = new THREE.TubeGeometry(barCurve, 64, 0.013, 24, false);
    const barMesh = new THREE.Mesh(barGeo, bikeChromeMat);
    handleGroup.add(barMesh);

    // Vintage Ribbed Grips and Rod Brake Levers
    [-0.265, 0.265].forEach(bz => {
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.12, 24), bikeTireMat);
        grip.position.set(-0.12, 0.133, bz);
        grip.rotation.y = bz > 0 ? 0.35 : -0.35;
        handleGroup.add(grip);

        // Rod Brake Levers (Tuas Rem Kawat/Batangan Klasik)
        const brakeLever = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 16), bikeChromeMat);
        brakeLever.position.set(-0.08, 0.10, bz > 0 ? bz - 0.025 : bz + 0.025);
        brakeLever.rotation.x = Math.PI / 2;
        brakeLever.rotation.z = bz > 0 ? 0.3 : -0.3;
        handleGroup.add(brakeLever);
    });

    // Vintage Polished Brass Dome Bell (Bel Kring-Kring Kuningan - 32-Seg)
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.038, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2), brassMat);
    bell.position.set(0.04, 0.18, -0.14);
    handleGroup.add(bell);

    // Iconic Vintage Bullet / Torpedo Headlight (Lampu Torpedo Bosch / Miller - 48-Seg)
    const headlampGroup = new THREE.Group();
    headlampGroup.position.set(0.18, 0.06, 0);

    const lampBracket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.04), bikeChromeMat);
    lampBracket.position.set(-0.06, 0, 0);
    headlampGroup.add(lampBracket);

    // Torpedo Chrome Bullet Body (48 radial segments for ultra-smooth bullet shape)
    const lampBody = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.19, 48), bikeChromeMat);
    lampBody.rotation.z = -Math.PI / 2;
    headlampGroup.add(lampBody);

    // Convex Ribbed Glass Lens with Warm Golden Glow (36x36 segments)
    const lampLens = new THREE.Mesh(
        new THREE.SphereGeometry(0.082, 36, 36, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({
            color: 0xfff6d4,
            emissive: 0xffd15c,
            emissiveIntensity: 0.95,
            roughness: 0.1,
            metalness: 0.1
        })
    );
    lampLens.rotation.z = Math.PI / 2;
    lampLens.position.set(0.085, 0, 0);
    headlampGroup.add(lampLens);

    // Warm Torpedo Point Light Pool on Stage Floor
    const headlampLight = new THREE.PointLight(0xffbe6b, 2.8, 6.0);
    headlampLight.position.set(0.18, 0, 0);
    headlampGroup.add(headlampLight);

    handleGroup.add(headlampGroup);
    bikeGroup.add(handleGroup);

    // --- H. REAR TUBULAR LUGGAGE CARRIER (Boncengan / Bagasi Pipa Bulat - 20-Seg) ---
    const rackGroup = new THREE.Group();
    rackGroup.position.set(-0.72, 0.84, 0);

    // Heavy-Duty Luggage Platform
    const rackFrame = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.024, 0.18), bikeBlackMat);
    rackGroup.add(rackFrame);

    // Spring Clip (Jepitan Bagasi Klasik)
    const springClip = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.018, 0.14), bikeChromeMat);
    springClip.position.set(0.05, 0.022, 0);
    rackGroup.add(springClip);

    // Dual Tubular Legs to Rear Axle (20 radial segments)
    [-0.07, 0.07].forEach(rz => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.48, 20), bikeBlackMat);
        leg.position.set(0, -0.23, rz);
        rackGroup.add(leg);
    });

    // Ruby Red Cat's-Eye Reflector (Mata Kucing Merah Belakang - 32-Seg)
    const rearReflector = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.018, 32),
        new THREE.MeshStandardMaterial({
            color: 0xef4444,
            emissive: 0xdc2626,
            emissiveIntensity: 0.85,
            roughness: 0.2
        })
    );
    rearReflector.rotation.z = Math.PI / 2;
    rearReflector.position.set(-0.27, -0.04, 0);
    rackGroup.add(rearReflector);

    bikeGroup.add(rackGroup);

    // --- I. DUAL-LEG KICKSTAND (Standar Dua Kares Kokoh Menyentuh Lantai - 20-Seg) ---
    const standGroup = new THREE.Group();
    standGroup.position.set(-0.74, 0.42, 0);

    [-0.14, 0.14].forEach(sz => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.009, 0.44, 20), bikeBlackMat);
        leg.position.set(0, -0.21, sz);
        leg.rotation.x = sz > 0 ? 0.38 : -0.38;
        standGroup.add(leg);
    });
    bikeGroup.add(standGroup);

    // --- J. DEDICATED CENTERPIECE ACCENT LIGHT ---
    // Teater Spotlight panggung hangat terfokus presisi ke Sepeda Onthel agar lekukan krom & enamel hitam berkilau mewah
    const bikeSpot = new THREE.SpotLight(0xfff5e6, 5.2, 10.0, Math.PI / 4.2, 0.45, 1.2);
    bikeSpot.position.set(0, 3.4, -1.8);
    bikeSpot.target.position.set(0, 0.65, -3.1);
    bikeSpot.castShadow = false;
    bikeSpot.shadow.mapSize.width = 1024;
    bikeSpot.shadow.mapSize.height = 1024;
    bikeSpot.shadow.bias = -0.0003;
    group.add(bikeSpot);
    group.add(bikeSpot.target);

    // Warm ambient rim fill to illuminate spoke details
    const bikeRimFill = new THREE.PointLight(0xffeedb, 1.8, 4.5);
    bikeRimFill.position.set(0, 0.85, -2.3);
    group.add(bikeRimFill);

    group.add(bikeGroup);



    // 8. Stage Monitor Speaker & "Kotak Apresiasi" Akustik (Stage Right)
    const soundGroup = new THREE.Group();
    soundGroup.position.set(2.2, 0.52, -3.4);

    const speakerBox = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.88, 0.46), new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.55 }));
    speakerBox.position.y = 0.44;
    soundGroup.add(speakerBox);

    const cone1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 32), new THREE.MeshBasicMaterial({ color: 0x0f1115 }));
    cone1.position.set(0, 0.62, 0.24);
    cone1.rotation.x = Math.PI / 2;
    soundGroup.add(cone1);

    const ledRing = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.21, 32), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    ledRing.position.set(0, 0.62, 0.252);
    soundGroup.add(ledRing);

    // Kotak Apresiasi Kayu Jati Klasik
    const tipBox = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.2), new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.4 }));
    tipBox.position.set(0, 0.98, 0);
    soundGroup.add(tipBox);

    const tipSlot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: 0x111111 }));
    tipSlot.position.set(0, 1.075, 0);
    soundGroup.add(tipSlot);

    group.add(soundGroup);

    // 9. Stage Performance Setup (Stage Left: Grounded Acoustic Chair & Realistic Vocal Mic Stand)
    // Vocal Microphone Stand with Grounded Tripod & Swivel Boom Arm (Natural human height 1.25m)
    const tripod1 = new THREE.Group();
    tripod1.position.set(-1.6, 0.51, -2.6);

    // 3 Grounded Tripod Base Legs
    for (let fi = 0; fi < 3; fi++) {
        const angle = (fi * Math.PI * 2) / 3;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.36, 16), metalMat);
        leg.position.set(Math.cos(angle) * 0.15, 0.065, Math.sin(angle) * 0.15);
        leg.rotation.y = -angle;
        leg.rotation.z = 0.92;
        tripod1.add(leg);
    }

    // Vertical Telescoping Shaft (0.85m above stage floor)
    const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.85, 20), chromeMat);
    pole1.position.y = 0.425;
    tripod1.add(pole1);

    // Swivel Knuckle Joint
    const swivel = new THREE.Mesh(new THREE.SphereGeometry(0.020, 16, 16), metalMat);
    swivel.position.set(0, 0.85, 0);
    tripod1.add(swivel);

    // Boom Arm Group extending toward performer
    const boomGroup = new THREE.Group();
    boomGroup.position.set(0, 0.85, 0);
    boomGroup.rotation.y = 0.40;
    boomGroup.rotation.z = -0.38;

    const micBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.52, 16), metalMat);
    micBoom.position.y = 0.26;
    boomGroup.add(micBoom);

    // Dynamic Microphone Capsule seamlessly attached to boom tip
    const micCapsule = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.012, 0.08, 16), chromeMat);
    micCapsule.position.y = 0.53;
    boomGroup.add(micCapsule);

    // Foam Windscreen (Black)
    const micFoam = new THREE.Mesh(new THREE.SphereGeometry(0.018, 16, 16), new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 }));
    micFoam.position.y = 0.57;
    boomGroup.add(micFoam);

    tripod1.add(boomGroup);
    group.add(tripod1);

    // Acoustic Guitar Music Stand (Disimpan di samping kursi pemain, rapi & terpisah dari sepeda)
    const tripod2 = new THREE.Group();
    tripod2.position.set(-2.5, 0.51, -2.8);

    for (let fi = 0; fi < 3; fi++) {
        const angle = (fi * Math.PI * 2) / 3 + 0.5;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.32, 16), metalMat);
        leg.position.set(Math.cos(angle) * 0.13, 0.06, Math.sin(angle) * 0.13);
        leg.rotation.y = -angle;
        leg.rotation.z = 0.92;
        tripod2.add(leg);
    }
    const pole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.75, 16), metalMat);
    pole2.position.y = 0.375;
    tripod2.add(pole2);

    const musicDesk = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.26, 0.015), metalMat);
    musicDesk.position.set(0, 0.76, 0);
    musicDesk.rotation.x = -0.38;
    tripod2.add(musicDesk);

    const musicSheet = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.22), new THREE.MeshBasicMaterial({ color: 0xfafafa }));
    musicSheet.position.set(0, 0.76, 0.010);
    musicSheet.rotation.x = -0.38;
    tripod2.add(musicSheet);

    group.add(tripod2);

    // Performance Chair (Kursi Kayu Jati Akustik: 4 Kaki Flush di Atas Panggung y=0.51)
    const chairGroup = new THREE.Group();
    chairGroup.position.set(-2.0, 0.51, -3.2);

    const chairLegMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.6 });
    [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.013, 0.44, 16), chairLegMat);
        leg.position.set(lx, 0.22, lz);
        chairGroup.add(leg);
    });

    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.44), new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.45 }));
    chairSeat.position.y = 0.44;
    chairGroup.add(chairSeat);

    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.36, 0.03), chairLegMat);
    chairBack.position.set(0, 0.66, -0.19);
    chairGroup.add(chairBack);

    group.add(chairGroup);

    // Tumpukan Kursi Cadangan Lipat di Ujung Kanan Panggung
    const chairStack = new THREE.Group();
    chairStack.position.set(2.8, 0.51, -3.7);
    for (let ci = 0; ci < 4; ci++) {
        const folded = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.82, 0.05), new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 }));
        folded.position.set(0, 0.41, ci * 0.065);
        folded.rotation.x = -0.15;
        chairStack.add(folded);
    }
    group.add(chairStack);
    // 10. Traditional Acoustic Wall Installations (Tampah / Nyiru, Kukusan)
    const tampahMat = new THREE.MeshStandardMaterial({ color: 0xe0b26a, roughness: 0.6 });
    const kukusanMat = new THREE.MeshStandardMaterial({ color: 0xd49b4c, roughness: 0.6 });

    const tampahConfigs = [
        { x: -2.8, y: 2.7, r: 0.54 },
        { x: -2.1, y: 2.1, r: 0.40 },
        { x: -3.2, y: 1.8, r: 0.34 },
        { x: -1.3, y: 2.9, r: 0.46 },
        { x: 1.4,  y: 2.8, r: 0.50 },
        { x: 2.4,  y: 2.4, r: 0.40 },
        { x: 3.1,  y: 1.9, r: 0.34 }
    ];

    tampahConfigs.forEach(tc => {
        const tray = new THREE.Mesh(new THREE.CylinderGeometry(tc.r, tc.r, 0.04, 18), tampahMat);
        tray.rotation.x = Math.PI / 2;
        tray.position.set(tc.x, tc.y, -4.65);
        group.add(tray);
    });

    [-2.5, 2.0].forEach(kx => {
        const kukusan = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.48, 14), kukusanMat);
        kukusan.rotation.x = -Math.PI / 2;
        kukusan.position.set(kx, 1.9, -4.63);
        group.add(kukusan);
    });

    // 11. Two Hanging Conical Woven Bamboo Lamps (Cahaya Hangat 2700K)
    [-2.2, 2.2].forEach(lx => {
        const lamp = new THREE.Group();
        lamp.position.set(lx, 2.4, -2.6);

        const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.4), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        cord.position.y = 0.7;
        lamp.add(cord);

        const shade = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.38, 16, 1, true), kukusanMat);
        shade.position.y = 0;
        lamp.add(shade);

        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffe8a3 }));
        bulb.position.y = -0.06;
        lamp.add(bulb);

        group.add(lamp);
    });

    // Dedicated Stage & Hall Illuminations (Warm Amber Ambiance)
    const stageLight = new THREE.PointLight(0xffbe6b, 3.5, 16);
    stageLight.position.set(0, 3.2, -2.2);
    group.add(stageLight);

    const hallLight = new THREE.PointLight(0xffbe6b, 3.0, 18);
    hallLight.position.set(0, 3.2, 2.2);
    group.add(hallLight);

    // 12. Front Header Wooden Signboard: "INDOOR TIMUR 1 (LIVE STAGE HALL)"
    const headerSign = create3DSignboard("INDOOR TIMUR 1 (LIVE STAGE HALL)", 5.6, 0.85);
    headerSign.position.set(0, 3.88, 5.25);
    group.add(headerSign);

    scene3D.add(group);
}

/**
 * Build Kolam Terapi Ikan (Lingkaran Biru Tengah)
 * Houses tables TI-01 s/d TI-03
 */
function buildFishTherapyPool() {
    const group = new THREE.Group();
    group.position.set(19.5, 0, 1);

    // Stone Pool Basin
    const basinGeo = new THREE.BoxGeometry(8, 0.5, 10);
    const basinMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const basin = new THREE.Mesh(basinGeo, basinMat);
    basin.position.y = 0.25;
    basin.receiveShadow = true;
    basin.castShadow = true;
    group.add(basin);

    // Clear Turquoise Water
    const waterGeo = new THREE.BoxGeometry(7.4, 0.1, 9.4);
    const waterMat = new THREE.MeshLambertMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.85
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 0.45;
    group.add(water);

    // Timber Edge Deck around Pool for visitors to sit and dip feet
    const deckMat = new THREE.MeshLambertMaterial({ color: 0xa16207 });
    const edgeNorth = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.2, 0.8), deckMat);
    edgeNorth.position.set(0, 0.55, -4.8);
    group.add(edgeNorth);

    const edgeSouth = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.2, 0.8), deckMat);
    edgeSouth.position.set(0, 0.55, 4.8);
    group.add(edgeSouth);

    // Signboard "KOLAM TERAPI IKAN"
    const sign = create3DSignboard("KOLAM TERAPI IKAN", 5.6, 0.85);
    sign.position.set(0, 2.8, 5.0);
    group.add(sign);

    // Animated Fish (Visual markers)
    const fishGeo = new THREE.ConeGeometry(0.12, 0.4, 6);
    const fishMat1 = new THREE.MeshBasicMaterial({ color: 0xf97316 }); // Orange Koi
    const fishMat2 = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White Koi

    [[-2, -2], [1, 0], [-1, 2], [2, 3], [0, -3]].forEach(([fx, fz], idx) => {
        const fish = new THREE.Mesh(fishGeo, idx % 2 === 0 ? fishMat1 : fishMat2);
        fish.rotation.x = Math.PI / 2;
        fish.rotation.z = Math.random() * Math.PI * 2;
        fish.position.set(fx, 0.48, fz);
        group.add(fish);
    });

    scene3D.add(group);
}

/**
 * Build Indoor Timur 2 (Lingkaran Biru Kanan)
 * Houses tables IT2-17 s/d IT2-20
 */
function buildIndoorTimur2() {
    const group = new THREE.Group();
    group.position.set(29, 0, 1);

    // Timber Floor
    const floorGeo = new THREE.BoxGeometry(9, 0.25, 10);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x855836 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = 0.12;
    floor.receiveShadow = true;
    group.add(floor);

    // Glass walls
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xcfe6fc,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        transmission: 0.75
    });
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(8.8, 3.4, 0.12), glassMat);
    frontWall.position.set(0, 1.8, 4.9);
    group.add(frontWall);

    const backWallMat = new THREE.MeshLambertMaterial({ color: 0x2e2318 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(8.8, 3.4, 0.2), backWallMat);
    backWall.position.set(0, 1.8, -4.9);
    group.add(backWall);

    // Roof Pergola Slats
    const colMat = new THREE.MeshLambertMaterial({ color: 0x1f1913 });
    for (let bx = -4.0; bx <= 4.0; bx += 1.6) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 10.2), colMat);
        slat.position.set(bx, 3.6, 0);
        group.add(slat);
    }

    // Signboard "INDOOR TIMUR 2"
    const sign = create3DSignboard("INDOOR TIMUR 2", 4.8, 0.8);
    sign.position.set(0, 4.0, 5.05);
    group.add(sign);

    // Light
    const light = new THREE.PointLight(0xffbe6b, 1.8, 18);
    light.position.set(0, 3.2, 0);
    group.add(light);

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
    createPathSegment(10, 4, 19.5, 4, 1.6);
    createPathSegment(19.5, 4, 29, 4, 1.6);

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
        if (layout.zone === "gazebo" || layout.zone === "outdoor") {
            buildOutdoorTable3D(tableGroup, table, true);
        } else if (layout.zone === "outdoor") {
            buildOutdoorTable3D(tableGroup, table, layout.umbrella);
        } else if (layout.zone === "vip") {
            buildVipTable3D(tableGroup, table, layout.type);
        }

        // Add 3D Status Glow Ring & Floating Billboard Badge
        const statusColor = getStatusColor(table.status);
        
        // Ground Status Ring
        const ringGeo = new THREE.RingGeometry(1.2, 1.45, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: statusColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.05;
        tableGroup.add(ring);
        tableGroup.userData.glowRing = ring;

        // Floating 3D Table Sprite Badge with perspective distance compensation
        let badgeY = 2.4;
        let badgeScaleX = 3.2;
        let badgeScaleY = 1.35;

        if (layout.zone === "outdoor" || layout.umbrella) {
            badgeY = 3.6;
        } else if (layout.zone === "vip") {
            badgeY = 4.2; // Above glass pergola roof
            badgeScaleX = 4.2; // Perspective distance compensation
            badgeScaleY = 1.7;
        } else if (layout.umbrella) {
            badgeY = 3.4;
        }

        const sprite = createTableSpriteBadge(table, statusColor);
        sprite.position.set(0, badgeY, 0);
        sprite.scale.set(badgeScaleX, badgeScaleY, 1.0);
        tableGroup.add(sprite);
        tableGroup.userData.sprite = sprite;

        // Interaction Hitbox (Invisible bounding box for smooth touch & click)
        const hitBoxGeo = new THREE.BoxGeometry(3.6, 4.0, 3.6);
        const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
        hitBox.position.y = 2.0;
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

    // 3. Thatched Pyramid Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.4, 4), roofMat);
    roof.position.y = 2.9;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

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
 * 3D Outdoor Table Builder (Meja 09 - 20)
 */
function buildOutdoorTable3D(group, table, hasUmbrella = false) {
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5c4028 });
    const chairMat = new THREE.MeshLambertMaterial({ color: 0x3d2918 });

    // Round Dining Table
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.1, 20), woodMat);
    tableTop.position.y = 1.25;
    tableTop.castShadow = true;
    group.add(tableTop);

    const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.8, 12), woodMat);
    tableLeg.position.y = 0.8;
    tableLeg.castShadow = true;
    group.add(tableLeg);

    // Warm table centerpiece lamp
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffe29a });
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.18, 8), lampMat);
    lamp.position.y = 1.38;
    group.add(lamp);

    const tableGlow = new THREE.PointLight(0xffb86c, 0.7, 3.5);
    tableGlow.position.y = 1.42;
    group.add(tableGlow);

    // 4 Dining Chairs Around Table
    const chairAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    chairAngles.forEach(ang => {
        const chair = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.45), chairMat);
        seat.position.y = 0.8;
        chair.add(seat);

        const back = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.08), chairMat);
        back.position.set(0, 1.1, -0.2);
        chair.add(back);

        chair.position.set(Math.cos(ang) * 1.3, 0, Math.sin(ang) * 1.3);
        chair.rotation.y = -ang - Math.PI / 2;
        chair.castShadow = true;
        group.add(chair);
    });

    // Patio Parasol Umbrella
    if (hasUmbrella) {
        const umbrellaGroup = new THREE.Group();
        const poleMat = new THREE.MeshLambertMaterial({ color: 0x4a3b32 });
        const canopyMat = new THREE.MeshLambertMaterial({ color: 0xf5f0e1 }); // Warm cream canopy

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.7, 8), poleMat);
        pole.position.y = 1.35;
        umbrellaGroup.add(pole);

        const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.7, 8), canopyMat);
        canopy.position.y = 2.6;
        canopy.castShadow = true;
        umbrellaGroup.add(canopy);

        group.add(umbrellaGroup);
    }
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

    // 3. Hanging Woven Bamboo Pendant Lamp (Lampu Gantung Anyaman Bambu Kerucut Tradisional)
    // Tepat di atas meja makan sesuai foto img_bcb8e1b7e299.jpg
    const lampGroup = new THREE.Group();
    lampGroup.position.set(0, 2.35, 0);

    // Drop cord from ceiling truss
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.6, 6), cordMat);
    cord.position.y = 0.8;
    lampGroup.add(cord);

    // Conical Woven Bamboo Lampshade (Caping Anyaman Bambu Terbalik)
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.32, 16, 1, true), shadeMat);
    shade.position.y = 0;
    shade.castShadow = true;
    lampGroup.add(shade);

    // Glowing warm amber bulb inside
    const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffe29a })
    );
    bulb.position.y = -0.06;
    lampGroup.add(bulb);

    // Localized Warm Amber Point Light (Cahaya Kuning Hangat 2200K Menerangi Meja)
    const tableLight = new THREE.PointLight(0xffa834, 2.4, 6.5);
    tableLight.position.y = -0.15;
    tableLight.castShadow = false;
    lampGroup.add(tableLight);

    group.add(lampGroup);
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
        let zone = "gazebo";
        let zoneName = "Zona Gazebo Lesehan";
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

/**
 * Animation Frame Loop (Adaptive 60 FPS with Off-Screen Sleep)
 */
function animate3D(time) {
    animFrameId = requestAnimationFrame(animate3D);

    // Pause WebGL rendering if 3D section is scrolled off-screen (0% GPU drain when reading menus/home)
    if (!isCanvasInView) return;

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
