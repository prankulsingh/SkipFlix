// Initialize state from storage
chrome.storage.local.get(['skipEnabled'], (result) => {
    if (result.skipEnabled === undefined) {
        chrome.storage.local.set({ skipEnabled: true });
    }
});

chrome.commands.onCommand.addListener(function (command) {
    if (command === "toggleSkip") {
        chrome.storage.local.get(['skipEnabled'], (result) => {
            const newState = !result.skipEnabled;
            chrome.storage.local.set({ skipEnabled: newState }, () => {
                displayPopup(newState);
            });
        });
    }
});

// Remove runtime message listener as content script will listen to storage changes directly
// effectively decoupling state management.

function displayPopup(skipEnabled) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];
        if (!tab) return;

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (skipEnabled) => {
                const dialog = document.createElement('dialog');
                dialog.textContent = skipEnabled ? "✅ Skipping ON" : "❌ Skipping OFF";

                // Helper to append dialog to the correct parent
                const appendDialog = () => {
                    const parent = document.fullscreenElement || document.body;
                    if (dialog.parentElement !== parent) {
                        parent.appendChild(dialog);
                        // Re-open if moving caused it to close (browser dependent behavior)
                        if (!dialog.open) {
                            try { dialog.showModal(); } catch (e) { }
                        }
                    }
                };

                appendDialog();
                dialog.showModal();

                // Ensure it stays visible if fullscreen toggles shortly after
                const fullscreenListener = () => appendDialog();
                document.addEventListener('fullscreenchange', fullscreenListener);

                setTimeout(() => {
                    dialog.remove();
                    document.removeEventListener('fullscreenchange', fullscreenListener);
                }, 1000);
            },
            args: [skipEnabled]
        });
    });
}