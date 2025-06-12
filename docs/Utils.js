// Utils Module - Funzioni di utilità condivise
export class Utils {
    static formatTimeUnit(unit) {
        return unit.toString().padStart(2, '0');
    }

    static getCurrentDayName() {
        const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
        return days[new Date().getDay()];
    }

    static showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, duration);
    }

    static playAlarmSound() {
        try {
            // Tenta di riprodurre un file audio se disponibile
            const audio = new Audio('alarm.mp3');
            audio.play().catch(() => {
                // Fallback: genera beep programmaticamente
                this.generateBeepSound();
            });
        } catch (error) {
            // Se Audio non è supportato, usa il beep generato
            this.generateBeepSound();
        }
    }

    static generateBeepSound() {
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const beep = () => {
                const oscillator = context.createOscillator();
                const gainNode = context.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(context.destination);

                oscillator.frequency.value = 800;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

                oscillator.start(context.currentTime);
                oscillator.stop(context.currentTime + 0.5);
            };

            // Suona 3 beep consecutivi
            beep();
            setTimeout(beep, 600);
            setTimeout(beep, 1200);
        } catch (error) {
            console.warn('Audio non supportato in questo browser');
        }
    }

    static validateTimeInput(time) {
        if (!time) return false;
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    static getCurrentTimeString() {
        const now = new Date();
        return `${this.formatTimeUnit(now.getHours())}:${this.formatTimeUnit(now.getMinutes())}`;
    }
}