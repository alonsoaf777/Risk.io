import { HttpError } from "./errors.js";

// Variable global para contar los clics
let clickCount = 0; 
const maxClicks = 3; // Máximo número de clics antes de deshabilitar

export function requestFeedback(request, htmlElem, onSuccesMsg, onErrorMsg) {
    const prevText = htmlElem.innerHTML;
    htmlElem.disabled = true;

    // Incrementar contador y manejar los estados
    clickCount++;
    if (clickCount >= maxClicks) {
        htmlElem.innerHTML = "..."; // Mostrar los puntos después del tercer clic
    } else {
        htmlElem.innerHTML = `Envío ${clickCount} de ${maxClicks}`; // Opcional: mensaje intermedio
    }

    request
        .then(response => {
            if (response.status === "no_entities") {
                alert("No se identificaron entidades.");
            } else if (response.status === "processing") {
                alert(response.message);
            } else if (response.status === "completed") {
                htmlElem.innerHTML = onSuccesMsg;
                setTimeout(() => {
                    if (clickCount < maxClicks) {
                        htmlElem.innerHTML = prevText;
                        htmlElem.disabled = false;
                    }
                }, 800);

                // Actualizar el contenido del iframe con el nuevo HTML del mapa
                const mapIframe = document.getElementById("qgis-map");
                mapIframe.contentDocument.open();
                mapIframe.contentDocument.write(response.html);
                mapIframe.contentDocument.close();
            }
        })
        .catch(error => {
            if (error instanceof HttpError) alert(error.detail);

            htmlElem.innerHTML = onErrorMsg;
            setTimeout(() => {
                if (clickCount < maxClicks) {
                    htmlElem.innerHTML = prevText;
                    htmlElem.disabled = false;
                }
            }, 1500);
        });
}
