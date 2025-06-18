import { Utils } from './Utils.js';

// Clock Module - Gestisce l'orologio digitale
export class Clock {
    constructor(displayElement) {
        this.displayElement = displayElement;
        this.interval = null;
        this.start();
    }

    start() {
        this.update();
        this.interval = setInterval(() => this.update(), 1000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    update() {
        const now = new Date();
        const hours = Utils.formatTimeUnit(now.getHours());
        const minutes = Utils.formatTimeUnit(now.getMinutes());
        const seconds = Utils.formatTimeUnit(now.getSeconds());
        this.displayElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    getCurrentTime() {
        return new Date();
    }
}