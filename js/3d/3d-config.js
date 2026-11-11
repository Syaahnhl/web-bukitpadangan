/**
 * 3d-config.js - 3D Floor Plan Layout & Camera Presets
 */

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
