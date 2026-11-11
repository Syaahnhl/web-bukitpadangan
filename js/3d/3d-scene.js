/**
 * 3d-scene.js - Three.js Scene Setup, Lighting & Render Loop
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

    // Scenescene3D = new THREE.Scene();
    scene3D.background = new THREE.Color(0x0a0c0f); // Luxury Night Obsidian Sky
    scene3D.fog = new THREE.FogExp2(0x0a0c0f, 0.0055);

    // Cameracamera3D = new THREE.PerspectiveCamera(40, width / height, 0.5, 300);
    camera3D.position.set(CAMERA_PRESETS.all.pos.x, CAMERA_PRESETS.all.pos.y, CAMERA_PRESETS.all.pos.z);

    // Detect Mobile Device
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768);

    // Renderer (adaptive Performance: 60 FPS on Mobile HP & Ultra-Crisp on Desktop)
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

    // Controlscontrols3D = new THREE.OrbitControls(camera3D, renderer3D.domElement);
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

    // Lightingsetup3DLighting();

    // Build scenery & environmentbuild3DEnvironment();

    // Populate tablespopulate3DTables();

    // Interaction eventssetup3DInteraction();

    // Animation loopis3DInitialized = true;
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
    // Terrain & Southern Road (Jl. Gunungwungkal - Jepalo)
    buildTerrainAndRoad();

    // Perimeter Ring (Lingkaran Kuning)
    buildPerimeterRing();

    // Lingkaran Hijau: Area Outdoor Dekat Jalan Raya (Jl. Gunungwungkal)
    buildOutdoorRoadsidePlaza();

    // Fasilitas Ibadah & Sanitasi (Lingkaran Merah: Mushola & Toilet/Wudhu)
    buildMushola();
    buildToiletsAndWudhu();

    // Area Utama (Lingkaran Putih & Hitam: Indoor Utama & Kasir)
    buildIndoorUtama();
    buildCashierStation();

    // Kompleks Timur (Lingkaran Biru: IT1, Kolam Terapi Ikan, IT2)
    buildIndoorTimur1();
    buildFishTherapyPool();
    buildIndoorTimur2();

    // Penanda Sunset (Barat / Kiri)
    buildSunsetIndicator();

    // Jalan Setapak & Lanskap Alami
    buildGardenPathways();
    buildSurroundingNature();
}

/**
 * Build Terrain Ridge Plateau, Terraced Rice Fields, and Curved Main Road
 * Sesuai Citra Satelit Google Maps (Desa Ngablak, Gunungwungkal)
 */
let gpsBlueDotRipple = null;

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

