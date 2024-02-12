let skipEnabled = true; // Flag to determine if skipping feature is enabled or disabled

chrome.commands.onCommand.addListener(function (command) {
    if (command === "toggleSkip") {
        skipEnabled = !skipEnabled;
        displayPopup(skipEnabled);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === "skipEnabled") {
        sendResponse(skipEnabled);
    }
    return true;
});

function displayPopup(skipEnabled) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        const tab = tabs[0];
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: (skipEnabled) => {
                const dialog = document.createElement('dialog');
                dialog.textContent = skipEnabled ? "✅ Skipping ON" : "❌ Skipping OFF"
                document.body.appendChild(dialog);
                dialog.showModal();
                setTimeout(() => {
                    dialog.remove();
                }, 1000);
            },
            args: [skipEnabled] // Pass skipEnabled as an argument
        });
    });
}