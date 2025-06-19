import { Utils } from './utils.js';

// Timer Module - Gestisce il timer con conto alla rovescia
export class Timer {
    constructor(displayElement, onEnd) {
        this.displayElement = displayElement;
        this.onEnd = onEnd;
        this.reset();
    }

    start(durationMs) {
        this.stop(); // Ferma qualsiasi timer esistente
        // Limite massimo: 60 minuti
        const maxMs = 60 * 60 * 1000;
        if (durationMs > maxMs) {
            durationMs = maxMs;
        }
        this.remainingTime = durationMs;
        this.endTime = Date.now() + durationMs;
        this.running = true;
        this.paused = false;
        this.interval = setInterval(() => this.update(), 100);
    }

    pause() {
        if (!this.running || this.paused) return;

        this.running = false;
        this.paused = true;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        // Calcola il tempo rimanente al momento della pausa
        this.remainingTime = Math.max(0, this.endTime - Date.now());
    }

    resume() {
        if (!this.paused || this.remainingTime <= 0) return;

        // Riavvia il timer con il tempo rimanente
        this.endTime = Date.now() + this.remainingTime;
        this.running = true;
        this.paused = false;
        this.interval = setInterval(() => this.update(), 100);
    }

    stop() {
        this.running = false;
        this.paused = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    reset() {
        this.stop();
        this.remainingTime = 0;
        this.displayElement.textContent = '00:00';
    }

    update() {
        const msLeft = this.endTime - Date.now();

        if (msLeft <= 0) {
            this.reset();
            if (this.onEnd) {
                this.onEnd();
            }
        } else {
            const totalSeconds = Math.ceil(msLeft / 1000);
            const minutes = Utils.formatTimeUnit(Math.floor(totalSeconds / 60));
            const seconds = Utils.formatTimeUnit(totalSeconds % 60);
            this.displayElement.textContent = `${minutes}:${seconds}`;
        }
    }

    // Funzioni di utilità per controllare lo stato
    isRunning() {
        return this.running;
    }

    isPaused() {
        return this.paused;
    }

    getRemainingTime() {
        return this.remainingTime;
    }
}