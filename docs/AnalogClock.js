export class AnalogClock {
    constructor(container) {
        this.container = container;
        this.hr = container.querySelector('#hour');
        this.min = container.querySelector('#min');
        this.sec = container.querySelector('#sec');
        this.interval = null;
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
        const date = new Date();
        const hh = date.getHours();
        const mm = date.getMinutes();
        const ss = date.getSeconds();

        const hRotation = 30 * hh + mm / 2;
        const mRotation = 6 * mm;
        const sRotation = 6 * ss;

        this.hr.style.transform = `rotate(${hRotation}deg)`;
        this.min.style.transform = `rotate(${mRotation}deg)`;
        this.sec.style.transform = `rotate(${sRotation}deg)`;
    }
}

// --- Gestione toggle tra orologio digitale e analogico ---
import { AnalogClock as AnalogClockClass } from './AnalogClock.js';

document.addEventListener('DOMContentLoaded', () => {
    const digitalClock = document.getElementById('DigitalClock');
    const analogClockContainer = document.getElementById('AnalogClockContainer');
    const toggleBtn = document.getElementById('toggleClockBtn');

    // Crea istanza solo se il container esiste
    let analogClock = null;
    if (analogClockContainer) {
        analogClock = new AnalogClockClass(analogClockContainer);
    }

    let isAnalog = false;

    const updateToggleBtnText = () => {
        toggleBtn.textContent = isAnalog ? 'DIGITALE' : 'ANALOGICO';
    };

    toggleBtn.addEventListener('click', () => {
        isAnalog = !isAnalog;
        if (isAnalog) {
            digitalClock.style.display = 'none';
            analogClockContainer.style.display = 'flex';
            analogClock && analogClock.start();
        } else {
            analogClock && analogClock.stop();
            analogClockContainer.style.display = 'none';
            digitalClock.style.display = 'flex';
        }
        updateToggleBtnText();
    });

    // Mostra l'orologio digitale all'avvio, nascondi l'analogico
    digitalClock.style.display = 'flex';
    analogClockContainer.style.display = 'none';
    updateToggleBtnText();

    window.addEventListener('beforeunload', () => {
        analogClock && analogClock.stop();
    });
});
