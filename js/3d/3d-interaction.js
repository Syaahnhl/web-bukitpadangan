/**
 * 3d-interaction.js - Raycasting, Tooltip & Zone Camera Control
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


window.focus3DZone = focus3DZone;
