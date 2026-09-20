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
        pos: { x: 0, y: 52, z: 52 },
        target: { x: 0, y: 0, z: 3 }
    },
    saung: {
        pos: { x: -9, y: 16, z: 34 },
        target: { x: -9, y: 1.2, z: 18 }
    },
    indoor: {
        pos: { x: -13, y: 18, z: 14 },
        target: { x: -13, y: 1.2, z: -1 }
    },
    east: {
        pos: { x: 19, y: 18, z: 18 },
        target: { x: 19, y: 1.2, z: 1 }
    },
    facilities: {
        pos: { x: -3, y: 5.5, z: 0 },
        target: { x: -3, y: 1.0, z: -24 }
    },
    // Aliases for backwards compatibility
    outdoor: {
        pos: { x: -9, y: 16, z: 34 },
        target: { x: -9, y: 1.2, z: 18 }
    },
    gazebo: {
        pos: { x: -9, y: 16, z: 34 },
        target: { x: -9, y: 1.2, z: 18 }
    },
    vip: {
        pos: { x: -13, y: 18, z: 14 },
        target: { x: -13, y: 1.2, z: -1 }
    }
};

// Table Positions Map in 3D Space (X, Z)
const TABLE_3D_LAYOUT = {
    // Lingkaran Hijau: Zona Saung Bambu / Lesehan Tepi Sawah & Sungai (S-01 s/d S-06) - Selatan dekat jalan
    "S-01": { x: -16, z: 14, zone: "gazebo", rotation: 0 },
    "S-02": { x: -9,  z: 14, zone: "gazebo", rotation: 0 },
    "S-03": { x: -2,  z: 14, zone: "gazebo", rotation: 0 },
    "S-04": { x: -16, z: 22, zone: "gazebo", rotation: 0 },
    "S-05": { x: -9,  z: 22, zone: "gazebo", rotation: 0 },
    "S-06": { x: -2,  z: 22, zone: "gazebo", rotation: 0 },

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
    "IT1-13": { x: 8,  z: -2, zone: "vip", rotation: 0 },
    "IT1-14": { x: 12, z: -2, zone: "vip", rotation: 0 },
    "IT1-15": { x: 8,  z: 4,  zone: "vip", rotation: 0 },
    "IT1-16": { x: 12, z: 4,  zone: "vip", rotation: 0 },

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
    scene3D.fog = new THREE.FogExp2(0x0a0c0f, 0.014);

    // 2. CAMERA
    camera3D = new THREE.PerspectiveCamera(40, width / height, 0.5, 300);
    camera3D.position.set(CAMERA_PRESETS.all.pos.x, CAMERA_PRESETS.all.pos.y, CAMERA_PRESETS.all.pos.z);

    // 3. RENDERER
    renderer3D = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer3D.setSize(width, height);
    renderer3D.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer3D.shadowMap.enabled = true;
    renderer3D.shadowMap.type = THREE.PCFSoftShadowMap;
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
    controls3D.maxDistance = 90;
    controls3D.target.set(CAMERA_PRESETS.all.target.x, CAMERA_PRESETS.all.target.y, CAMERA_PRESETS.all.target.z);

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
    const sunLight = new THREE.DirectionalLight(0xffdfa9, 0.85);
    sunLight.position.set(28, 45, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
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
 * Build Terrain Plateau & Southern Main Road
 */
function buildTerrainAndRoad() {
    // Main Hill Plateau
    const groundGeo = new THREE.CylinderGeometry(52, 54, 2.5, 48);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x14181e });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1.25;
    ground.receiveShadow = true;
    scene3D.add(ground);

    // Southern Road: Jl. Gunungwungkal - Jepalo
    const roadGeo = new THREE.BoxGeometry(84, 0.2, 7.5);
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x1f232b }); // Asphalt dark
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(2, 0.05, 33);
    road.receiveShadow = true;
    scene3D.add(road);

    // Road White Dashed Centerline
    for (let rx = -38; rx <= 40; rx += 5) {
        const stripeGeo = new THREE.PlaneGeometry(2.4, 0.25);
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9, side: THREE.DoubleSide });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(rx, 0.16, 33);
        scene3D.add(stripe);
    }

    // Road Signboard
    const roadSign = create3DSignboard("JL. GUNUNGWUNGKAL - JEPALO", 6.8, 0.85);
    roadSign.position.set(-18, 2.2, 36.5);
    scene3D.add(roadSign);

    // Main Entrance Gate Marker
    const gateSign = create3DSignboard("GERBANG MASUK RESTO", 5.2, 0.75);
    gateSign.position.set(-5, 2.4, 29);
    scene3D.add(gateSign);
}

/**
 * Build Golden Perimeter Ring (Lingkaran Kuning)
 */
function buildPerimeterRing() {
    const ringGeo = new THREE.RingGeometry(46, 46.4, 64);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0xd4a373,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    scene3D.add(ring);
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
function buildIndoorUtama() {
    const group = new THREE.Group();
    group.position.set(-13, 0, -1);

    // Timber Parquet Floor
    const floorGeo = new THREE.BoxGeometry(14, 0.3, 12);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x855836 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = 0.15;
    floor.receiveShadow = true;
    group.add(floor);

    // Glass Walls (Transparent to view interior tables)
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xcfe6fc,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        transmission: 0.75
    });

    // Front Glass Wall
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(13.8, 3.6, 0.15), glassMat);
    frontWall.position.set(0, 1.9, 5.9);
    group.add(frontWall);

    // Back Solid Timber Wall
    const backWallMat = new THREE.MeshLambertMaterial({ color: 0x2e2318 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(13.8, 3.6, 0.25), backWallMat);
    backWall.position.set(0, 1.9, -5.9);
    backWall.castShadow = true;
    group.add(backWall);

    // Left & Right Glass Walls
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.6, 11.8), glassMat);
    leftWall.position.set(-6.9, 1.9, 0);
    group.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.6, 11.8), glassMat);
    rightWall.position.set(6.9, 1.9, 0);
    group.add(rightWall);

    // Structural Pillars
    const colMat = new THREE.MeshLambertMaterial({ color: 0x1f1913 });
    const cols = [[-6.8, -5.8], [6.8, -5.8], [-6.8, 5.8], [6.8, 5.8], [0, -5.8], [0, 5.8]];
    cols.forEach(([cx, cz]) => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.8, 0.4), colMat);
        pillar.position.set(cx, 1.9, cz);
        pillar.castShadow = true;
        group.add(pillar);
    });

    // Pergola Slat Roof with Skylight
    for (let bx = -6.4; bx <= 6.4; bx += 1.6) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 12.2), colMat);
        slat.position.set(bx, 3.85, 0);
        slat.castShadow = true;
        group.add(slat);
    }

    // Signboard "INDOOR UTAMA"
    const sign = create3DSignboard("INDOOR UTAMA", 5.2, 0.85);
    sign.position.set(0, 4.3, 6.05);
    group.add(sign);

    // Warm Interior Illumination
    const light = new THREE.PointLight(0xffbe6b, 2.2, 24);
    light.position.set(0, 3.5, 0);
    group.add(light);

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
function buildIndoorTimur1() {
    const group = new THREE.Group();
    group.position.set(10, 0, 1);

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

    // Signboard "INDOOR TIMUR 1"
    const sign = create3DSignboard("INDOOR TIMUR 1", 4.8, 0.8);
    sign.position.set(0, 4.0, 5.05);
    group.add(sign);

    // Light
    const light = new THREE.PointLight(0xffbe6b, 1.8, 18);
    light.position.set(0, 3.2, 0);
    group.add(light);

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
    // Pine / Shade Trees around perimeter
    const treePositions = [
        [-34, -12], [-32, -22], [-24, -28], [-18, -28],
        [16, -28], [24, -26], [34, -20], [38, -8],
        [38, 8], [36, 20], [28, 26], [-28, 24], [-34, 16]
    ];

    treePositions.forEach(([tx, tz]) => {
        const tree = createPineTree();
        tree.position.set(tx, 0, tz);
        const scale = 0.85 + Math.random() * 0.4;
        tree.scale.set(scale, scale, scale);
        scene3D.add(tree);
    });

    // Flowering Bushes
    const bushPositions = [
        [-14, 8], [-4, 8], [4, 8], [15, 8],
        [-18, -12], [-8, -12], [8, -12], [22, -12]
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
        tableGroup.position.set(layout.x, 0, layout.z);
        tableGroup.userData = { table: table };

        // Construct 3D Physical Geometry based on Zone
        if (layout.zone === "gazebo") {
            buildGazebo3D(tableGroup, table);
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
        ring.position.y = (layout.zone === "outdoor") ? 0.5 : 0.05;
        tableGroup.add(ring);
        tableGroup.userData.glowRing = ring;

        // Floating 3D Table Sprite Badge with perspective distance compensation
        let badgeY = 2.4;
        let badgeScaleX = 3.2;
        let badgeScaleY = 1.35;

        if (layout.zone === "gazebo") {
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
    const tableMat = new THREE.MeshLambertMaterial({ color: 0x24180f }); // Polished dark mahogany
    const chairMat = new THREE.MeshLambertMaterial({ color: 0x8b261b }); // Burgundy upholstered chairs

    if (type === "meeting") {
        // Long Conference Dining Table
        const top = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 1.5), tableMat);
        top.position.y = 0.95;
        top.castShadow = true;
        group.add(top);

        const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.85, 1.2), tableMat);
        leg1.position.set(-1.4, 0.5, 0);
        group.add(leg1);

        const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.85, 1.2), tableMat);
        leg2.position.set(1.4, 0.5, 0);
        group.add(leg2);
    } else {
        // Elegant Round VIP Table
        const top = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.12, 24), tableMat);
        top.position.y = 0.95;
        top.castShadow = true;
        group.add(top);

        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.85, 16), tableMat);
        leg.position.y = 0.5;
        group.add(leg);
    }

    // Modern Armchairs around table
    const chairCount = table.capacity || 6;
    const radius = (type === "meeting") ? 1.6 : 1.7;
    for (let i = 0; i < chairCount; i++) {
        const ang = (i / chairCount) * Math.PI * 2;
        const chair = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.5), chairMat);
        chair.position.set(Math.cos(ang) * radius, 0.45, Math.sin(ang) * radius);
        chair.rotation.y = -ang - Math.PI / 2;
        chair.castShadow = true;
        group.add(chair);
    }
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
}

/**
 * Animation Frame Loop
 */
function animate3D(time) {
    animFrameId = requestAnimationFrame(animate3D);

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

    if (renderer3D && scene3D && camera3D) {
        renderer3D.render(scene3D, camera3D);
    }
}
