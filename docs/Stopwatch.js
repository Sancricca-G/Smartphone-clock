// Stopwatch Module - Gestisce il cronometro
export class Stopwatch {
    constructor(displayElement) {
        // Elemento HTML dove verrà mostrato il tempo trascorso
        this.displayElement = displayElement;
        this.reset(); // Inizializza lo stato del cronometro
    }

    // Avvia il cronometro
    start() {
        if (this.running) return; // Evita di avviare più volte
        this.running = true;
        // Calcola il tempo di partenza tenendo conto di eventuali pause precedenti
        this.startTime = Date.now() - this.elapsedTime;
        // Avvia l'intervallo di aggiornamento ogni 100ms
        this.interval = setInterval(() => this.update(), 100);
    }

    // Ferma il cronometro (pausa)
    stop() {
        this.running = false;
        if (this.interval) {
            clearInterval(this.interval); // Ferma l'intervallo
            this.interval = null;
        }
    }

    // Reimposta il cronometro a 00:00.0
    reset() {
        this.running = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.elapsedTime = 0; // Azzera il tempo trascorso
        this.updateDisplay(0); // Mostra 00:00.0
    }

    // Aggiorna il tempo trascorso e il display
    update() {
        this.elapsedTime = Date.now() - this.startTime;
        this.updateDisplay(this.elapsedTime);
    }

    // Aggiorna il contenuto dell'elemento HTML con il tempo formattato
    updateDisplay(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        const tenths = Math.floor((ms % 1000) / 100); // Decimi di secondo
        this.displayElement.textContent = `${minutes}:${seconds}.${tenths}`;
    }

    // Restituisce il tempo trascorso in millisecondi
    getElapsedTime() {
        return this.elapsedTime;
    }

    // Indica se il cronometro è attualmente in esecuzione
    isRunning() {
        return this.running;
    }
}
