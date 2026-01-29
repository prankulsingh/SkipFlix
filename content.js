const console = {
    log: (...args) => window.console.log("SkipFlix#", ...args),
    warn: (...args) => window.console.warn("SkipFlix#", ...args),
    error: (...args) => window.console.error("SkipFlix#", ...args),
};

let skipEnabled = true;

// Initialize state
chrome.storage.local.get(['skipEnabled'], (result) => {
    if (result.skipEnabled !== undefined) {
        skipEnabled = result.skipEnabled;
    }
});

// Listen for state changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.skipEnabled) {
        skipEnabled = changes.skipEnabled.newValue;
        console.log(`Skip enabled changed to: ${skipEnabled}`);
    }
});

/**
 * Recursively searches for buttons matching the skip criteria within the given root and its shadow DOMs.
 * @param {Node} root - The root node to start searching from (e.g., document.body or a shadowRoot).
 * @returns {HTMLElement[]} - Array of found button elements.
 */
function findButtonsInShadowDom(root) {
    let buttons = [];

    // Search in the current root
    if (root.querySelectorAll) {
        const found = root.querySelectorAll('button[data-uia="player-skip-intro"], button[data-uia="next-episode-seamless-button-draining"], button[data-uia="next-episode-seamless-button"], button[data-uia="player-skip-recap"]');
        buttons = [...buttons, ...found];
    }

    // Traverse children to find shadow roots
    // We walk the tree using a TreeWalker or simple recursion. 
    // Given the dynamic nature, iterating all elements is safer but more expensive.
    // Optimization: querySelectorAll('*') gets all elements, we check shadowRoot.

    if (root.querySelectorAll) {
        const allElements = root.querySelectorAll('*');
        for (const el of allElements) {
            if (el.shadowRoot) {
                buttons = [...buttons, ...findButtonsInShadowDom(el.shadowRoot)];
            }
        }
    }

    return buttons;
}

const trySkip = () => {
    if (!skipEnabled) return;

    const buttons = findButtonsInShadowDom(document.body);

    if (buttons.length > 0) {
        const button = buttons[0];
        console.log('Skippable button found');

        try {
            button.click();
            console.log('Skipping...');

            // Visual feedback
            const span = button.querySelector('span');
            if (span) span.innerHTML = "Skipping...";

        } catch (error) {
            console.warn(error);
        }
    }
};

// Throttle observer callback to avoid performance issues
let throttleTimer;
const observerCallback = (mutations) => {
    if (throttleTimer) return;

    throttleTimer = setTimeout(() => {
        trySkip();
        throttleTimer = null;
    }, 500);
};

const bodyObserver = new MutationObserver(observerCallback);

window.addEventListener('load', () => {
    bodyObserver.observe(
        document.body,
        {
            subtree: true,
            childList: true
        }
    );
});