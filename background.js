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
                const popup = document.createElement('div');
                popup.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background-color: #222;
                    color: #ccc;
                    padding: 10px 20px;
                    border: 1px solid #ccc;
                    font-size: 40px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.5);
                    z-index: 99999999 !important;
                `;
                popup.textContent = skipEnabled ? "Skipping ON" : "Skipping OFF"
                document.body.appendChild(popup);
                setTimeout(() => {
                    popup.remove();
                }, 1000);
            },
            args: [skipEnabled] // Pass skipEnabled as an argument
        });
    });
}