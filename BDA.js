// ==UserScript==
// @name         YouTube Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Mejorar la experiencia de videos sin interrupciones.
// @author       Donny
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/DonnySandoval/BDA/blob/main/BDA.js
// @downloadURL  https://github.com/DonnySandoval/BDA/blob/main/BDA.js
// @grant        none
// ==/UserScript==

(function() {
    // Configuración
    const enableFeatureA = true; // Habilita la función A
    const enableFeatureB = false; // Habilita la función B
    const enableUpdateCheck = true; // Habilita la verificación de actualizaciones
    const enableDebug = true; // Habilita los mensajes de depuración

    const customModalConfig = {
        enable: true, // Habilita el modal personalizado
        timer: 5000, // Duración del modal en milisegundos
    };

    // Funciones auxiliares
    function logMessage(message, level = 'info', ...args) {
        if (!enableDebug) return; // Si la depuración no está habilitada, salir

        const prefix = 'YouTube Enhancer:'; // Prefijo para los mensajes de depuración
        const fullMessage = `${prefix} ${message}`;
        switch (level) {
            case 'error':
                console.error(fullMessage, ...args); // Mensaje de error
                break;
            case 'warn':
                console.warn(fullMessage, ...args); // Mensaje de advertencia
                break;
            case 'info':
            default:
                console.info(fullMessage, ...args); // Mensaje de información
                break;
        }
    }

    // Implementación de la función A
    function featureA() {
        logMessage("Función A activada"); // Mensaje de depuración
        const playbackRate = 1; // Velocidad de reproducción normal

        setInterval(() => {
            const videoElement = document.querySelector('video'); // Selecciona el elemento de video
            const adElement = document.querySelector('.ad-showing'); // Selecciona el elemento de anuncio

            if (adElement) {
                videoElement.playbackRate = 10; // Aumenta la velocidad de reproducción
                videoElement.volume = 0; // Silencia el volumen

                // Encuentra y hace clic en los botones de omitir anuncio
                document.querySelectorAll('.ytp-ad-skip-button, .ytp-ad-skip-button-container').forEach(button => button.click());
                videoElement.currentTime = videoElement.duration; // Salta al final del video

                logMessage("Anuncio omitido"); // Mensaje de depuración
            } else {
                videoElement.playbackRate = playbackRate; // Restablece la velocidad de reproducción
            }
        }, 50); // Intervalo de verificación cada 50 ms
    }

    // Implementación de la función B
    function featureB() {
        logMessage("Función B activada"); // Mensaje de depuración
        setInterval(() => {
            const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop"); // Selecciona el superposición modal
            const popupElement = document.querySelector(".style-scope ytd-enforcement-message-view-model"); // Selecciona el elemento popup
            const dismissButton = document.getElementById("dismiss-button"); // Selecciona el botón de descartar

            const videoElement = document.querySelector('video'); // Selecciona el elemento de video

            if (modalOverlay) {
                modalOverlay.remove(); // Elimina la superposición modal
            }

            if (popupElement) {
                dismissButton?.click(); // Hace clic en el botón de descartar si existe
                popupElement.remove(); // Elimina el elemento popup
                videoElement.play(); // Reanuda la reproducción del video
            }
        }, 1000); // Intervalo de verificación cada 1000 ms
    }

    // Verificación de actualizaciones
    function checkForUpdates() {
        if (!window.location.href.includes("youtube.com") || !enableUpdateCheck) return; // Verifica si la URL incluye YouTube y si la verificación de actualizaciones está habilitada

        const scriptUrl = 'https://raw.githubusercontent.com/DonnySandoval/BDA/main/BDA.js'; // URL del script

        fetch(scriptUrl)
            .then(response => response.text()) // Obtiene el contenido del script
            .then(data => {
                const match = data.match(/@version\s+(\d+\.\d+)/); // Encuentra la versión del script
                if (!match) return;

                const latestVersion = parseFloat(match[1]); // Convierte la versión a número
                const currentVersion = parseFloat(GM_info.script.version); // Obtiene la versión actual del script

                if (latestVersion <= currentVersion) return; // Si la versión más reciente no es mayor, salir

                if (customModalConfig.enable) {
                    const script = document.createElement('script'); // Crea un elemento de script
                    script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11'; // URL de SweetAlert2
                    document.head.appendChild(script); // Añade el script al head

                    const style = document.createElement('style'); // Crea un elemento de estilo
                    style.textContent = '.swal2-container { z-index: 2400; }'; // Estilo para SweetAlert2
                    document.head.appendChild(style); // Añade el estilo al head

                    script.onload = function () {
                        Swal.fire({
                            position: "top-end",
                            backdrop: false,
                            title: 'YouTube Enhancer: Nueva versión disponible.',
                            text: '¿Desea actualizar?',
                            showCancelButton: true,
                            showDenyButton: true,
                            confirmButtonText: 'Actualizar',
                            denyButtonText: 'Saltar',
                            cancelButtonText: 'Cerrar',
                            timer: customModalConfig.timer,
                            timerProgressBar: true,
                            didOpen: (modal) => {
                                modal.onmouseenter = Swal.stopTimer; // Detiene el temporizador al pasar el ratón
                                modal.onmouseleave = Swal.resumeTimer; // Reanuda el temporizador al salir el ratón
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.replace(scriptUrl); // Reemplaza la URL con la del script
                            } else if (result.isDenied) {
                                localStorage.setItem('skipYouTubeEnhancerVersion', latestVersion); // Guarda la versión omitida en localStorage
                            }
                        });
                    };

                    script.onerror = function () {
                        const confirmUpdate = window.confirm("YouTube Enhancer: Nueva versión disponible. ¿Desea actualizar?");
                        if (confirmUpdate) {
                            window.location.replace(scriptUrl); // Reemplaza la URL con la del script
                        }
                    };
                } else {
                    const confirmUpdate = window.confirm("YouTube Enhancer: Nueva versión disponible. ¿Desea actualizar?");
                    if (confirmUpdate) {
                        window.location.replace(scriptUrl); // Reemplaza la URL con la del script
                    }
                }
            })
            .catch(error => {
                logMessage("Error al verificar actualizaciones", "error", error); // Mensaje de error
            });
    }

    // Inicializa el script
    logMessage("Script iniciado"); // Mensaje de depuración

    if (enableFeatureA) featureA(); // Activa la función A si está habilitada
    if (enableFeatureB) featureB(); // Activa la función B si está habilitada
    if (enableUpdateCheck) checkForUpdates(); // Activa la verificación de actualizaciones si está habilitada
})();
