import * as backend from "./modules/backend_connection.js";
import { requestFeedback } from "./modules/ui_feedback.js";

const IDs = {
    writeText: "text-write",
    sendButton: "text-send",
    openModal: "new-tweet-button",
    closeModal: "close-modal",
    modal: "tweet-modal"
};

// Variable global para contar clics
let clickCount = 0;
const maxClicks = 3;

document.addEventListener("DOMContentLoaded", () => {
    const elems = Object.keys(IDs).reduce((output, id) => {
        output[IDs[id]] = document.getElementById(IDs[id]);
        return output;
    }, {});

    // Abrir el modal
    elems[IDs.openModal].addEventListener("click", () => {
        elems[IDs.modal].style.display = "flex";
        elems[IDs.sendButton].disabled = false; // Asegurar que el botón esté habilitado al abrir el modal
        clickCount = 0; // Reiniciar el contador de clics
        elems[IDs.sendButton].innerHTML = "Enviar"; // Restablecer el texto del botón
    });

    // Cerrar el modal
    elems[IDs.closeModal].addEventListener("click", () => {
        elems[IDs.modal].style.display = "none";
    });

    // Enviar el texto
    elems[IDs.sendButton].addEventListener("click", () => {
        const texto = elems[IDs.writeText].value;
        if (texto === "") {
            alert("Por favor, escribe un texto.");
            return;
        }

        const request = backend.analyseTweet(texto);

        // Actualizar contador y estado del botón
        clickCount++;
        if (clickCount >= maxClicks) {
            elems[IDs.sendButton].innerHTML = "...";
            elems[IDs.sendButton].disabled = true;
        } else {
            elems[IDs.sendButton].innerHTML = `Envío ${clickCount} de ${maxClicks}`;
        }

        request
            .then(response => {
                switch (response.status) {
                    case "no_entities":
                        alert(response.message); // Mostrar mensaje de "No se detectaron entidades"
                        break;
                    case "processing":
                        alert(response.message); // Mostrar mensaje de "Procesando..."
                        break;
                    case "completed":
                        alert("Tweet procesado correctamente.");
                        elems[IDs.writeText].value = ""; // Limpiar el campo de texto
                        elems[IDs.modal].style.display = "none"; // Cerrar el modal

                        // Actualizar el contenido del iframe
                        const mapIframe = document.getElementById("qgis-map");
                        mapIframe.contentDocument.open();
                        mapIframe.contentDocument.write(response.html);
                        mapIframe.contentDocument.close();
                        break;
                }
            })
            .catch(error => {
                alert("Error al procesar el tweet.");
            })
            .finally(() => {
                // Siempre restaurar el botón después de la respuesta
                if (clickCount < maxClicks) {
                    elems[IDs.sendButton].disabled = false;
                    elems[IDs.sendButton].innerHTML = "Enviar";
                }
            });
    });
});
