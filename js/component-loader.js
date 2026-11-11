/**
 * js/component-loader.js
 * Asynchronous Component Loader for Warung Makan Bukit Padangan
 * Hydrates modular HTML components (< 300 LOC per file) into the main document
 */
(function() {
    window.componentsReady = (async function() {
        const slots = Array.from(document.querySelectorAll('[data-component]'));
        if (slots.length === 0) return true;

        await Promise.all(slots.map(async function(slot) {
            const src = slot.getAttribute('data-component');
            try {
                const response = await fetch(src);
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status + ' while fetching ' + src);
                }
                const html = await response.text();
                
                // Create a temporary container to extract elements
                const temp = document.createElement('div');
                temp.innerHTML = html.trim();
                
                // Replace the slot with the component child nodes
                const parent = slot.parentNode;
                while (temp.firstChild) {
                    parent.insertBefore(temp.firstChild, slot);
                }
                parent.removeChild(slot);
            } catch (err) {
                console.error('[ComponentLoader] Error loading component ' + src + ':', err);
            }
        }));

        document.dispatchEvent(new CustomEvent('components:loaded'));
        return true;
    })();
})();
