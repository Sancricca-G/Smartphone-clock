// Utils Module - Funzioni di utilità condivise
export class Utils {

    // Formatta un numero (es. ore o minuti) in una stringa a due cifre (es. 5 → "05")
    static formatTimeUnit(unit) {
        return unit.toString().padStart(2, '0');
    }

    // Restituisce il nome del giorno corrente in italiano (es. "Lunedi")
    static getCurrentDayName() {
        const days = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato'];
        return days[new Date().getDay()];
    }

    // Mostra un messaggio temporaneo sullo schermo per un certo numero di millisecondi
    static showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // Rimuove la notifica dopo il tempo specificato
        setTimeout(() => {
            notification.remove();
        }, duration);
    }

    // Riproduce un file audio (BrainFart.mp3) come suono di allarme
    // Se fallisce, genera un suono alternativo (beep)
    static playAlarmSound() {
        try {
            const audio = new Audio('BrainFart.mp3');
            audio.play()
                .then(() => {
                    console.log("Audio riprodotto con successo");
                })
                .catch((err) => {
                    console.warn("Errore nella riproduzione:", err);
                    this.generateBeepSound();
                });
        } catch (error) {
            console.error("Errore generale nel suono sveglia:", error);
            this.generateBeepSound();
        }
    }

    // Genera 3 beep consecutivi usando l'API Web Audio come fallback(javascript x la creazione di audio)
    static generateBeepSound() {
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const beep = () => {
                const oscillator = context.createOscillator();
                const gainNode = context.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(context.destination);

                oscillator.frequency.value = 800; // Frequenza del beep in Hz
                oscillator.type = 'sine'; // Tipo di onda

                gainNode.gain.setValueAtTime(0.3, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

                oscillator.start(context.currentTime);
                oscillator.stop(context.currentTime + 0.5);
            };

            // Esegue 3 beep a intervalli
            beep();
            setTimeout(beep, 600);
            setTimeout(beep, 1200);
        } catch (error) {
            console.warn('Audio non supportato in questo browser');
        }
    }

    // Verifica se una stringa rappresenta un orario valido nel formato HH:MM (24 ore)
    static validateTimeInput(time) {
        if (!time) return false;
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    // Restituisce l'orario corrente come stringa formattata "HH:MM"
    static getCurrentTimeString() {
        const now = new Date();
        return `${this.formatTimeUnit(now.getHours())}:${this.formatTimeUnit(now.getMinutes())}`;
    }
}
