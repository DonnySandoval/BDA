// ==UserScript==
// @name         YouTube Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Mejorar la experiencia de videos sin interrupciones.
// @author       Donny
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/DonnySandoval/BDA/blob/main/BDA.js
// @downloadURL  https://github.com/DonnySandoval/BDA/blob/main/BDA.js
// @grant        none
// ==/UserScript==

(function() {
    // Configuration
    const enableFeatureA = true;
    const enableFeatureB = false;
    const enableUpdateCheck = true;
    const enableDebug = true;

    const customModalConfig = {
        enable: true,
        timer: 5000,
    };

    // Helper functions
    function logMessage(message, level = 'info', ...args) {
        if (!enableDebug) return;

        const prefix = 'YouTube Enhancer:';
        const fullMessage = `${prefix} ${message}`;
        switch (level) {
            case 'error':
                console.error(fullMessage, ...args);
                break;
            case 'warn':
                console.warn(fullMessage, ...args);
                break;
            case 'info':
            default:
                console.info(fullMessage, ...args);
                break;
        }
    }

    // Feature A implementation
    function featureA() {
        logMessage("Feature A activated");
        const playbackRate = 1;

        setInterval(() => {
            const videoElement = document.querySelector('video');
            const adElement = document.querySelector('.ad-showing');

            if (adElement) {
                videoElement.playbackRate = 10;
                videoElement.volume = 0;

                document.querySelectorAll('.ytp-ad-skip-button, .ytp-ad-skip-button-container').forEach(button => button.click());
                videoElement.currentTime = videoElement.duration;

                logMessage("Ad skipped");
            } else {
                videoElement.playbackRate = playbackRate;
            }
        }, 50);
    }

    // Feature B implementation
    function featureB() {
        logMessage("Feature B activated");
        setInterval(() => {
            const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop");
            const popupElement = document.querySelector(".style-scope ytd-enforcement-message-view-model");
            const dismissButton = document.getElementById("dismiss-button");

            const videoElement = document.querySelector('video');

            if (modalOverlay) {
                modalOverlay.remove();
            }

            if (popupElement) {
                dismissButton?.click();
                popupElement.remove();
                videoElement.play();
            }
        }, 1000);
    }



    

    // Update check
    function checkForUpdates() {
        if (!window.location.href.includes("youtube.com") || !enableUpdateCheck) return;

        const scriptUrl = 'https://raw.githubusercontent.com/DonnySandoval/BDA/main/BDA.js';

        fetch(scriptUrl)
            .then(response => response.text())
            .then(data => {
                const match = data.match(/@version\s+(\d+\.\d+)/);
                if (!match) return;

                const latestVersion = parseFloat(match[1]);
                const currentVersion = parseFloat(GM_info.script.version);

                if (latestVersion <= currentVersion) return;

                if (customModalConfig.enable) {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
                    document.head.appendChild(script);

                    const style = document.createElement('style');
                    style.textContent = '.swal2-container { z-index: 2400; }';
                    document.head.appendChild(style);

                    script.onload = function () {
                        Swal.fire({
                            position: "top-end",
                            backdrop: false,
                            title: 'YouTube Enhancer: New version available.',
                            text: 'Would you like to update?',
                            showCancelButton: true,
                            showDenyButton: true,
                            confirmButtonText: 'Update',
                            denyButtonText: 'Skip',
                            cancelButtonText: 'Close',
                            timer: customModalConfig.timer,
                            timerProgressBar: true,
                            didOpen: (modal) => {
                                modal.onmouseenter = Swal.stopTimer;
                                modal.onmouseleave = Swal.resumeTimer;
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.replace(scriptUrl);
                            } else if (result.isDenied) {
                                localStorage.setItem('skipYouTubeEnhancerVersion', latestVersion);
                            }
                        });
                    };

                    script.onerror = function () {
                        const confirmUpdate = window.confirm("YouTube Enhancer: New version available. Would you like to update?");
                        if (confirmUpdate) {
                            window.location.replace(scriptUrl);
                        }
                    };
                } else {
                    const confirmUpdate = window.confirm("YouTube Enhancer: New version available. Would you like to update?");
                    if (confirmUpdate) {
                        window.location.replace(scriptUrl);
                    }
                }
            })
            .catch(error => {
                logMessage("Error checking for updates", "error", error);
            });
    }

    // Initialize script
    logMessage("Script started");

    if (enableFeatureA) featureA();
    if (enableFeatureB) featureB();
    if (enableUpdateCheck) checkForUpdates();
})();
