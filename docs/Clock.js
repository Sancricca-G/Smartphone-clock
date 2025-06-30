import { Utils } from './Utils.js';

// Clock Module - Gestisce l'orologio digitale
export class Clock {
    constructor(displayElement) {
        // Elemento HTML dove verrà mostrato l'orario corrente
        this.displayElement = displayElement;
        this.interval = null; // Identificatore dell'intervallo di aggiornamento
        this.start(); // Avvia automaticamente l'orologio all'istanziazione
    }

    // Avvia l'orologio e aggiorna il display ogni secondo
    start() {
        this.update(); // Aggiorna subito il display
        this.interval = setInterval(() => this.update(), 1000); // Aggiorna ogni 1000ms (1 secondo)
    }

    // Ferma l'orologio (interrompe l'intervallo di aggiornamento)
    stop() {
        if (this.interval) {
            clearInterval(this.interval); // Ferma l'intervallo
            this.interval = null;
        }
    }

    // Aggiorna il contenuto del display con l'orario corrente formattato
    update() {
        const now = new Date(); // Ottiene l'orario corrente
        const hours = Utils.formatTimeUnit(now.getHours());   // Formatta le ore
        const minutes = Utils.formatTimeUnit(now.getMinutes()); // Formatta i minuti
        const seconds = Utils.formatTimeUnit(now.getSeconds()); // Formatta i secondi
        this.displayElement.textContent = `${hours}:${minutes}:${seconds}`; // Mostra l'orario
    }

}
