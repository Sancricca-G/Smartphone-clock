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

        // Rimuoviamo il limite di 60 minuti per supportare ore e secondi
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
        this.remainingTime = Math.max(0, this.endTime - Date.now());
    }

    resume() {
        if (!this.paused || this.remainingTime <= 0) return;

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
        this.displayElement.textContent = '00:00:00';
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
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            this.displayElement.textContent = `${Utils.formatTimeUnit(hours)}:${Utils.formatTimeUnit(minutes)}:${Utils.formatTimeUnit(seconds)}`;
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
