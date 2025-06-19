import { Utils } from './Utils.js';

// Alarm Manager Module - Gestisce tutte le sveglie
export class AlarmManager {
    constructor(listElement, statusElement) {
        this.listElement = listElement;   // Elemento HTML per visualizzare la lista delle sveglie
        this.statusElement = statusElement; // Elemento HTML per mostrare messaggi di stato
        this.alarms = this.loadAlarms();  // Carica le sveglie salvate
        this.checkInterval = null;        // Intervallo per il controllo delle sveglie
        this.render();                    // Mostra le sveglie nella UI
        this.startChecking();            // Avvia il controllo periodico delle sveglie
    }

    // Carica le sveglie dal localStorage
    loadAlarms() {
        try {
            const stored = localStorage.getItem('alarms');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Errore nel caricamento delle sveglie dal localStorage:', error);
            return [];
        }
    }

    // Salva le sveglie nel localStorage
    saveAlarms() {
        try {
            localStorage.setItem('alarms', JSON.stringify(this.alarms));
        } catch (error) {
            console.warn('Errore nel salvataggio delle sveglie:', error);
        }
    }

    // Aggiunge una nuova sveglia
    add(time, repeat) {
        if (!Utils.validateTimeInput(time)) {
            this.showStatus('Inserisci un orario valido (HH:MM).', 'error');
            return false;
        }

        // Evita duplicati
        if (this.alarms.some(a => a.time === time && a.repeat === repeat)) {
            this.showStatus('Sveglia già impostata per quell\'ora e per quel giorno.', 'error');
            return false;
        }

        const alarm = {
            id: Date.now(), // ID univoco
            time,
            repeat,
            active: true,
            created: new Date().toISOString()
        };

        this.alarms.push(alarm);
        this.saveAlarms();
        this.render();
        this.showStatus('Sveglia impostata con successo!', 'success');
        return true;
    }

    // Rimuove una sveglia tramite ID
    remove(id) {
        const initialLength = this.alarms.length;
        this.alarms = this.alarms.filter(alarm => alarm.id !== id);

        if (this.alarms.length < initialLength) {
            this.saveAlarms();
            this.render();
            this.showStatus('Sveglia rimossa.', 'success');
        }
    }

    // Attiva/disattiva una sveglia
    toggle(id) {
        const alarm = this.alarms.find(a => a.id === id);
        if (alarm) {
            alarm.active = !alarm.active;
            this.saveAlarms();
            this.render();
            this.showStatus(`Sveglia ${alarm.active ? 'attivata' : 'disattivata'}.`, 'success');
        }
    }

    // Mostra tutte le sveglie nella UI
    render() {
        this.listElement.innerHTML = '';

        if (this.alarms.length === 0) {
            this.listElement.innerHTML = '<p style="color: #999; font-style: italic; text-align: center;">Nessuna sveglia impostata</p>';
            return;
        }

        // Ordina le sveglie per orario
        const sortedAlarms = [...this.alarms].sort((a, b) => a.time.localeCompare(b.time));

        sortedAlarms.forEach(alarm => {
            const div = document.createElement('div');
            div.className = 'alarm-item';
            div.style.opacity = alarm.active ? '1' : '0.6';

            div.innerHTML = `
                <div>
                    <strong>${alarm.time}</strong><br>
                    <small>${alarm.repeat}</small>
                </div>
                <div>
                    <button onclick="alarmManager.toggle(${alarm.id})" style="margin-right: 5px;">
                        ${alarm.active ? 'Disattiva' : 'Attiva'}
                    </button>
                    <button onclick="alarmManager.remove(${alarm.id})">
                        Rimuovi
                    </button>
                </div>
            `;
            this.listElement.appendChild(div);
        });
    }

    // Avvia il controllo delle sveglie ogni 1.5 secondi
    startChecking() {
        this.checkInterval = setInterval(() => this.checkAlarms(), 1500);
        this.checkAlarms(); // Controllo immediato all'avvio
    }

    // Controlla se una sveglia deve suonare
    checkAlarms() {
        const now = new Date();
        const currentTime = Utils.getCurrentTimeString();
        const currentDay = Utils.getCurrentDayName();

        this.alarms.forEach(alarm => {
            if (alarm.time === currentTime && alarm.active) {
                const shouldTrigger = this.shouldTriggerAlarm(alarm, currentDay);

                if (shouldTrigger) {
                    this.triggerAlarm(alarm);
                    setTimeout(() => this.remove(alarm.id), 1000); // Rimuove dopo aver suonato
                }
            }
        });
    }

    // Verifica se la sveglia deve suonare in base al giorno
    shouldTriggerAlarm(alarm, currentDay) {
        return alarm.repeat === 'Una sola volta' || alarm.repeat === currentDay;
    }

    // Esegue le azioni quando una sveglia suona
    triggerAlarm(alarm) {
        Utils.playAlarmSound(); // Suono
        Utils.showNotification(`⏰ Sveglia! ${alarm.time}`, 8000); // Notifica visiva

        // Notifica browser
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('Sveglia!', {
                body: `È l'ora: ${alarm.time} (${alarm.repeat})`,
                icon: '⏰',
                requireInteraction: true
            });
            setTimeout(() => notification.close(), 10000);
        }

        // Vibrazione (se supportata)
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    }

    // Mostra un messaggio di stato temporaneo
    showStatus(message, type) {
        this.statusElement.textContent = message;
        this.statusElement.style.color = type === 'error' ? '#FF0000' : '#F3E9DC';

        setTimeout(() => {
            this.statusElement.textContent = '';
        }, 4000);
    }

    // Ferma il controllo delle sveglie
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    // Restituisce solo le sveglie attive
    getActiveAlarms() {
        return this.alarms.filter(alarm => alarm.active);
    }

    // Restituisce il numero totale di sveglie
    getAlarmCount() {
        return this.alarms.length;
    }

    // Rimuove tutte le sveglie
    clearAll() {
        this.alarms = [];
        this.saveAlarms();
        this.render();
        this.showStatus('Tutte le sveglie sono state rimosse.', 'success');
    }
}
