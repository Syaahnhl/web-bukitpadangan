/**
 * tables3d.js - Warung Makan Bukit Padangan
 * Monolithic Three.js code has been decomposed into clean modular architecture under js/3d/:
 *  1. js/3d/3d-config.js            - Spatial coordinates, camera presets, table layout
 *  2. js/3d/3d-scene.js             - Three.js scene setup, lights, render loop, resize
 *  3. js/3d/3d-terrain.js           - Terrain contour, tiered rice terraces, asphalt road
 *  4. js/3d/3d-buildings-main.js    - Indoor Utama, Cashier, Mushola, Toilets, Indoor Timur 1
 *  5. js/3d/3d-buildings-therapy.js - Fish therapy pool & Indoor Timur 2
 *  6. js/3d/3d-nature.js            - Pine trees, flower bushes, pathways, sunset indicator
 *  7. js/3d/3d-tables.js            - 3D Table geometry, badges, status materials
 *  8. js/3d/3d-interaction.js       - Raycaster, table clicking, zone focusing, tooltips
 */
console.info("Bukit Padangan: 3D Spatial Floor Plan loaded in modular architecture mode.");
