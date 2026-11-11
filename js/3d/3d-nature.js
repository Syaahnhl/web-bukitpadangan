/**
 * 3d-nature.js - Flora, Garden Pathways & Signboards
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
