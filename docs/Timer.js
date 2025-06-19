import { Utils } from './Utils.js';

// Timer Module - Gestisce il timer con conto alla rovescia
export class Timer {
    constructor(displayElement, onEnd) {
        // Elemento HTML dove verrà mostrato il tempo rimanente
        this.displayElement = displayElement;
        // Callback da eseguire quando il timer termina
        this.onEnd = onEnd;
        this.reset(); // Inizializza lo stato del timer
    }

    start(durationMs) {
        // Ferma eventuali timer già in esecuzione
        this.stop();
        // Imposta il tempo rimanente e il tempo di fine
        this.remainingTime = durationMs;
        this.endTime = Date.now() + durationMs;
        this.running = true;
        this.paused = false;
        // Avvia l'intervallo di aggiornamento ogni 100ms
        this.interval = setInterval(() => this.update(), 100);
    }

    pause() {
        // Se il timer non è in esecuzione o è già in pausa, esce
        if (!this.running || this.paused) return;

        this.running = false;
        this.paused = true;
        // Ferma l'intervallo di aggiornamento
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        // Calcola il tempo rimanente al momento della pausa
        this.remainingTime = Math.max(0, this.endTime - Date.now());
    }

    resume() {
        // Se non è in pausa o non c'è tempo rimanente, esce
        if (!this.paused || this.remainingTime <= 0) return;

        // Calcola il nuovo tempo di fine e riavvia l'intervallo
        this.endTime = Date.now() + this.remainingTime;
        this.running = true;
        this.paused = false;
        this.interval = setInterval(() => this.update(), 100);
    }

    stop() {
        // Ferma il timer e cancella l'intervallo
        this.running = false;
        this.paused = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    reset() {
        // Ferma il timer e azzera il tempo rimanente
        this.stop();
        this.remainingTime = 0;
        // Mostra 00:00 nell'elemento HTML
        this.displayElement.textContent = '00:00';
    }

    update() {
        // Calcola i millisecondi rimanenti
        const msLeft = this.endTime - Date.now();

        if (msLeft <= 0) {
            // Se il tempo è scaduto, resetta e chiama la callback
            this.reset();
            if (this.onEnd) {
                this.onEnd();
            }
        } else {
            // Calcola minuti e secondi rimanenti
            const totalSeconds = Math.ceil(msLeft / 1000);
            const minutes = Utils.formatTimeUnit(Math.floor(totalSeconds / 60));
            const seconds = Utils.formatTimeUnit(totalSeconds % 60);
            // Aggiorna il contenuto dell'elemento HTML
            this.displayElement.textContent = `${minutes}:${seconds}`;
        }
    }

    // Funzione di utilità: restituisce true se il timer è in esecuzione
    isRunning() {
        return this.running;
    }

    // Funzione di utilità: restituisce true se il timer è in pausa
    isPaused() {
        return this.paused;
    }

    // Funzione di utilità: restituisce il tempo rimanente in millisecondi
    getRemainingTime() {
        return this.remainingTime;
    }
}
