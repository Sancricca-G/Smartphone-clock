// Stopwatch Module - Gestisce il cronometro
export class Stopwatch {
    constructor(displayElement) {
        this.displayElement = displayElement;
        this.reset();
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.startTime = Date.now() - this.elapsedTime;
        this.interval = setInterval(() => this.update(), 100);
    }

    stop() {
        this.running = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    reset() {
        this.running = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.elapsedTime = 0;
        this.updateDisplay(0);
    }

    update() {
        this.elapsedTime = Date.now() - this.startTime;
        this.updateDisplay(this.elapsedTime);
    }

    updateDisplay(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        const tenths = Math.floor((ms % 1000) / 100);
        this.displayElement.textContent = `${minutes}:${seconds}.${tenths}`;
    }

    // Funzione per ottenere il tempo corrente (per possibili future estensioni)
    getElapsedTime() {
        return this.elapsedTime;
    }

    // Funzione per controllare se  in esecuzione
    isRunning() {
        return this.running;
    }

    getTimeString() {
        // Restituisce il tempo attuale formattato come visualizzato
        const ms = this.elapsedTime;
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const tenths = Math.floor((ms % 1000) / 100);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
    }
}