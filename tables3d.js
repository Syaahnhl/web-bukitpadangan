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
        pos: { x: 28, y: 32, z: 38 },
        target: { x: 2, y: 0, z: 2 }
    },
    gazebo: {
        pos: { x: -12, y: 16, z: 32 },
        target: { x: -12, y: 1.2, z: 15 }
    },
    outdoor: {
        pos: { x: 20, y: 18, z: 26 },
        target: { x: 19, y: 1.2, z: 6 }
    },
    vip: {
        pos: { x: -3, y: 14, z: -7 },
        target: { x: -3, y: 1.2, z: -19 }
    }
};

// Table Positions Map in 3D Space (X, Z)
const TABLE_3D_LAYOUT = {
    // Zona Gazebo Lesehan (1-8) - South-West Garden Terrace
    "T01": { x: -20, z: 8, zone: "gazebo", rotation: 0 },
    "T02": { x: -12, z: 8, zone: "gazebo", rotation: 0 },
    "T03": { x: -4,  z: 8, zone: "gazebo", rotation: 0 },
    "T04": { x: -20, z: 17, zone: "gazebo", rotation: 0 },
    "T05": { x: -12, z: 17, zone: "gazebo", rotation: 0 },
    "T06": { x: -4,  z: 17, zone: "gazebo", rotation: 0 },
    "T07": { x: -16, z: 26, zone: "gazebo", rotation: 0 },
    "T08": { x: -8,  z: 26, zone: "gazebo", rotation: 0 },

    // Zona Outdoor Panorama & Sunset Cliff Deck (9-20) - East Elevated Wooden Deck
    // Row 1 (Cliff Sunset Edge)
    "T09": { x: 10, z: -2, zone: "outdoor", rotation: 0, umbrella: true },
    "T10": { x: 16, z: -2, zone: "outdoor", rotation: 0, umbrella: true },
    "T11": { x: 22, z: -2, zone: "outdoor", rotation: 0, umbrella: true },
    "T12": { x: 27, z: -2, zone: "outdoor", rotation: 0, umbrella: true },
    // Row 2 (Middle Deck)
    "T13": { x: 10, z: 6,  zone: "outdoor", rotation: 0, umbrella: false },
    "T14": { x: 16, z: 6,  zone: "outdoor", rotation: 0, umbrella: false },
    "T15": { x: 22, z: 6,  zone: "outdoor", rotation: 0, umbrella: false },
    "T16": { x: 27, z: 6,  zone: "outdoor", rotation: 0, umbrella: false },
    // Row 3 (Front Deck)
    "T17": { x: 10, z: 14, zone: "outdoor", rotation: 0, umbrella: true },
    "T18": { x: 16, z: 14, zone: "outdoor", rotation: 0, umbrella: true },
    "T19": { x: 22, z: 14, zone: "outdoor", rotation: 0, umbrella: true },
    "T20": { x: 27, z: 14, zone: "outdoor", rotation: 0, umbrella: true },

    // Zona VIP & Meeting Room (21-26) - North Glass Pavilion
    "T21": { x: -11, z: -17, zone: "vip", rotation: 0, type: "vip-large" },
    "T22": { x: -5,  z: -17, zone: "vip", rotation: 0, type: "vip-large" },
    "T23": { x: 1,   z: -17, zone: "vip", rotation: 0, type: "meeting" },
    "T24": { x: 7,   z: -17, zone: "vip", rotation: 0, type: "meeting" },
    "T25": { x: -8,  z: -22, zone: "vip", rotation: 0, type: "lounge" },
    "T26": { x: 4,   z: -22, zone: "vip", rotation: 0, type: "lounge" }
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
    scene3D.background = new THREE.Color(0xdce7d9); // Soft mountain mist color
    scene3D.fog = new THREE.FogExp2(0xdce7d9, 0.012);

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
    // Hemisphere light (sky warm light, ground grass bounce)
    const hemiLight = new THREE.HemisphereLight(0xfff8ee, 0x476235, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene3D.add(hemiLight);

    // Main Sunlight (Directional with soft shadows)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 0.95);
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

    // Ambient light
    const ambLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene3D.add(ambLight);

    // Warm indoor light for VIP Pavilion
    const vipLight = new THREE.PointLight(0xffdfa4, 1.2, 28);
    vipLight.position.set(-3, 3.2, -19);
    scene3D.add(vipLight);

    // Warm light for Kasir/Main Building
    const mainLight = new THREE.PointLight(0xffd59e, 1.0, 20);
    mainLight.position.set(-22, 3.2, -8);
    scene3D.add(mainLight);
}

/**
 * Build 3D Scenery: Terrain, Main Building, VIP Pavilion, Outdoor Deck, Trees, Paths
 */
function build3DEnvironment() {
    // A. MAIN TERRAIN (Lush Grass Hill Plateau)
    const groundGeo = new THREE.CylinderGeometry(44, 46, 2, 48);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x4f773d });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene3D.add(ground);

    // B. CENTRAL PLAZA & GARDEN PATHWAYS
    // Main Flagstone Plaza
    const plazaGeo = new THREE.CylinderGeometry(5.5, 5.5, 0.08, 32);
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0xd9d3c7 });
    const plaza = new THREE.Mesh(plazaGeo, stoneMat);
    plaza.position.set(1, 0.04, 3);
    plaza.receiveShadow = true;
    scene3D.add(plaza);

    // Central Garden Fountain / Flower Centerpiece
    const fountainBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 2.2, 0.6, 24),
        new THREE.MeshLambertMaterial({ color: 0x7c7365 })
    );
    fountainBase.position.set(1, 0.3, 3);
    fountainBase.castShadow = true;
    scene3D.add(fountainBase);

    // Water pool in fountain
    const water = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.5, 0.1, 24),
        new THREE.MeshLambertMaterial({ color: 0x4ca1af })
    );
    water.position.set(1, 0.58, 3);
    scene3D.add(water);

    // Pathways
    createPathSegment(-20, 8, -4, 8);  // Gazebo path 1
    createPathSegment(-20, 17, -4, 17); // Gazebo path 2
    createPathSegment(-12, 8, -12, 26); // Gazebo cross path
    createPathSegment(-12, 8, 1, 3);    // Gazebo to Plaza
    createPathSegment(1, 3, 8, 3);      // Plaza to Deck
    createPathSegment(1, 3, -3, -14);   // Plaza to VIP

    // C. GEDUNG UTAMA (Kasir, Barista & Dapur)
    buildMainBuilding();

    // D. VIP & MEETING ROOM PAVILION (Glass House)
    buildVipPavilion();

    // E. OUTDOOR SUNSET CLIFF DECK (Elevated Timber Terrace)
    buildOutdoorDeck();

    // F. SURROUNDING NATURE: Trees, Bushes, Cliff Edge Fence
    buildSurroundingNature();
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
    const pathMat = new THREE.MeshLambertMaterial({ color: 0xd4cebf, side: THREE.DoubleSide });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.rotation.z = angle;
    path.position.set((x1 + x2) / 2, 0.02, (z1 + z2) / 2);
    path.receiveShadow = true;
    scene3D.add(path);
}

/**
 * Build Main Building (Kasir & Barista)
 */
function buildMainBuilding() {
    const group = new THREE.Group();
    group.position.set(-22, 0, -8);

    // Building Walls
    const wallGeo = new THREE.BoxGeometry(12, 4.2, 9);
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf5eedb }); // Warm cream stucco
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = 2.1;
    walls.castShadow = true;
    walls.receiveShadow = true;
    group.add(walls);

    // Timber corner accents
    const timberMat = new THREE.MeshLambertMaterial({ color: 0x5c3d24 });
    const corners = [
        [-5.9, -4.4], [5.9, -4.4], [-5.9, 4.4], [5.9, 4.4]
    ];
    corners.forEach(([cx, cz]) => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.2, 0.5), timberMat);
        pillar.position.set(cx, 2.1, cz);
        pillar.castShadow = true;
        group.add(pillar);
    });

    // Dark Pitch Roof
    const roofGeo = new THREE.ConeGeometry(9.2, 2.8, 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x2b3826 }); // Forest dark green roof
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 5.2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // Front Glass Entrance & Signboard
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x8ec3eb,
        transparent: true,
        opacity: 0.65,
        roughness: 0.1,
        transmission: 0.6
    });
    const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(5.5, 2.8, 0.2), glassMat);
    frontGlass.position.set(2, 1.4, 4.55);
    group.add(frontGlass);

    // Signboard "KASIR & BARISTA"
    const signGroup = create3DSignboard("KASIR & BARISTA", 4.2, 0.9);
    signGroup.position.set(2, 3.6, 4.7);
    group.add(signGroup);

    // Front Patio Awning
    const awning = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 2.5), timberMat);
    awning.position.set(2, 3.0, 5.6);
    awning.castShadow = true;
    group.add(awning);

    scene3D.add(group);
}

/**
 * Build VIP & Meeting Room Pavilion (Glass House)
 */
function buildVipPavilion() {
    const group = new THREE.Group();
    group.position.set(-3, 0, -19);

    // Parquet Floor
    const floorGeo = new THREE.BoxGeometry(23, 0.2, 11);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x855836 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = 0.1;
    floor.receiveShadow = true;
    group.add(floor);

    // Glass Walls
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xbfdcf5,
        transparent: true,
        opacity: 0.42,
        roughness: 0.1,
        transmission: 0.7,
        reflectivity: 0.8
    });

    // Front Long Glass
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(22.8, 3.6, 0.15), glassMat);
    frontWall.position.set(0, 1.9, 5.4);
    group.add(frontWall);

    // Back Wall
    const backWallMat = new THREE.MeshLambertMaterial({ color: 0x3d4f3b });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(22.8, 3.6, 0.3), backWallMat);
    backWall.position.set(0, 1.9, -5.4);
    backWall.castShadow = true;
    group.add(backWall);

    // Left & Right Glass
    const sideWallGeo = new THREE.BoxGeometry(0.15, 3.6, 10.8);
    const leftWall = new THREE.Mesh(sideWallGeo, glassMat);
    leftWall.position.set(-11.4, 1.9, 0);
    group.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeo, glassMat);
    rightWall.position.set(11.4, 1.9, 0);
    group.add(rightWall);

    // Structural Black Columns
    const colMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    for (let x = -11.4; x <= 11.4; x += 5.7) {
        const colF = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.6, 0.35), colMat);
        colF.position.set(x, 1.9, 5.4);
        colF.castShadow = true;
        group.add(colF);

        const colB = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.6, 0.35), colMat);
        colB.position.set(x, 1.9, -5.4);
        colB.castShadow = true;
        group.add(colB);
    }

    // Architectural Skylight & Pergola Roof (Permits clear top-down view of tables)
    const roofGlassMat = new THREE.MeshLambertMaterial({
        color: 0xddeefc,
        transparent: true,
        opacity: 0.35
    });
    const roofGlass = new THREE.Mesh(new THREE.BoxGeometry(23.8, 0.12, 11.8), roofGlassMat);
    roofGlass.position.y = 3.8;
    group.add(roofGlass);

    // Pergola Timber Slats (Spaced every 2.4 units)
    for (let bx = -11.2; bx <= 11.2; bx += 2.8) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.35, 11.8), colMat);
        slat.position.set(bx, 3.9, 0);
        slat.castShadow = true;
        group.add(slat);
    }

    // Pavilion Signboard "VIP & MEETING ROOM"
    const vipSign = create3DSignboard("VIP & MEETING ROOM", 5.8, 0.85);
    vipSign.position.set(0, 4.3, 5.6);
    group.add(vipSign);

    scene3D.add(group);
}

/**
 * Build Outdoor Sunset Cliff Deck
 */
function buildOutdoorDeck() {
    const group = new THREE.Group();
    // Deck spans from x: 7 to 30, z: -5 to 19
    const deckWidth = 24;
    const deckDepth = 25;
    group.position.set(18.5, 0, 7);

    // Elevated Timber Deck Planks
    const deckGeo = new THREE.BoxGeometry(deckWidth, 0.45, deckDepth);
    const deckMat = new THREE.MeshLambertMaterial({ color: 0xb58957 }); // Warm teak wood
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = 0.25;
    deck.receiveShadow = true;
    deck.castShadow = true;
    group.add(deck);

    // Deck Railing along Cliff Edges (East x: +12, South z: +12.5, North z: -12.5)
    const railMat = new THREE.MeshLambertMaterial({ color: 0x4a3219 });

    // East Cliff Railing (Facing Sunrise/Valley)
    const eastRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.1, deckDepth), railMat);
    eastRail.position.set(deckWidth / 2 - 0.1, 1.0, 0);
    eastRail.castShadow = true;
    group.add(eastRail);

    // South Railing
    const southRail = new THREE.Mesh(new THREE.BoxGeometry(deckWidth, 1.1, 0.18), railMat);
    southRail.position.set(0, 1.0, deckDepth / 2 - 0.1);
    southRail.castShadow = true;
    group.add(southRail);

    // North Railing
    const northRail = new THREE.Mesh(new THREE.BoxGeometry(deckWidth, 1.1, 0.18), railMat);
    northRail.position.set(0, 1.0, -deckDepth / 2 + 0.1);
    northRail.castShadow = true;
    group.add(northRail);

    // Deck Signboard "OUTDOOR SUNSET DECK"
    const deckSign = create3DSignboard("TERAS OUTDOOR PANORAMA", 6.2, 0.85);
    deckSign.position.set(-deckWidth / 2 + 3.5, 1.7, -deckDepth / 2 + 0.5);
    deckSign.rotation.y = Math.PI / 2;
    group.add(deckSign);

    scene3D.add(group);
}

/**
 * Build Surrounding Trees, Bushes, and Cliff Details
 */
function buildSurroundingNature() {
    // Pine Trees Positions
    const treePositions = [
        [-28, -2], [-30, 10], [-26, 22], [-22, 32],
        [-10, 33], [0, 32], [12, 28], [24, 25],
        [32, 18], [33, 4], [32, -8], [28, -18],
        [16, -24], [-18, -22], [-28, -16]
    ];

    treePositions.forEach(([tx, tz]) => {
        const tree = createPineTree();
        tree.position.set(tx, 0, tz);
        const scale = 0.8 + Math.random() * 0.45;
        tree.scale.set(scale, scale, scale);
        scene3D.add(tree);
    });

    // Flowering Bushes around Garden
    const bushPositions = [
        [-16, 3], [-8, 3], [-16, 12], [-8, 12],
        [-12, 21], [-4, 21], [6, 2], [6, 10]
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
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#22381b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    ctx.fillStyle = "#faf6ed";
    ctx.font = "bold 44px 'Cinzel', serif, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({ map: texture });
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

        // Floating 3D Table Sprite Badge
        const badgeY = (layout.zone === "gazebo") ? 3.4 : (layout.umbrella ? 3.2 : 2.2);
        const sprite = createTableSpriteBadge(table, statusColor);
        sprite.position.set(0, badgeY, 0);
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
    canvas.width = 256;
    canvas.height = 110;
    const ctx = canvas.getContext("2d");

    // Rounded rectangle pill
    const radius = 24;
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.beginPath();
    ctx.roundRect(6, 6, canvas.width - 12, canvas.height - 12, radius);
    ctx.fill();

    // Border with status color
    ctx.strokeStyle = statusColorHex;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Status Circle Indicator
    ctx.fillStyle = statusColorHex;
    ctx.beginPath();
    ctx.arc(42, canvas.height / 2, 14, 0, Math.PI * 2);
    ctx.fill();

    // Text: Table Name
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 34px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(table.name, 72, canvas.height / 2 - 10);

    // Text: Capacity
    ctx.fillStyle = "#64748b";
    ctx.font = "24px sans-serif";
    ctx.fillText(`${table.capacity} Kursi`, 72, canvas.height / 2 + 22);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.4, 1.05, 1.0);
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
