const console = {
    log: (...args) => window.console.log("SkipFlix# ", ...args),
    warn: (...args) => window.console.warn("SkipFlix# ", ...args),
    error: (...args) => window.console.error("SkipFlix# ", ...args),
};

(() => {
    window.addEventListener('load', () => {
        bodyObserver.observe(
            document.body,
            {
                subtree: true,
                childList: true
            }
        );
    });
})();

const bodyObserver = new MutationObserver(mutations => {
    try {
        chrome.runtime.sendMessage("skipEnabled", (skipEnabled) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node instanceof HTMLElement) {
                        const skippableButtonList = node.querySelectorAll('button[data-uia="player-skip-intro"], button[data-uia="next-episode-seamless-button-draining"], button[data-uia="next-episode-seamless-button"], button[data-uia="player-skip-recap"]');
                        if (skipEnabled && skippableButtonList.length > 0) {
                            console.log('Skippable button found');
                            setTimeout(
                                function () {
                                    try {
                                        skippableButtonList[0].click();
                                        console.log('Skipping...');
                                    } catch (error) {
                                        console.warn(error);
                                    }
                                },
                                800
                            );
                            try {
                                skippableButtonList[0].querySelector('span').innerHTML = "Skipping...";
                            } catch (error) {
                                console.warn(error);
                            }
                        }
                    }
                });
            });
        });
    } catch (error) {
        console.warn(error);
    }
});