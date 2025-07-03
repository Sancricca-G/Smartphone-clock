import { Utils } from './utils.js';

// Alarm Manager Module - Gestisce tutte le sveglie
export class AlarmManager {
    constructor(listElement, statusElement) {
        this.listElement = listElement;
        this.statusElement = statusElement;
        this.alarms = this.loadAlarms();
        this.checkInterval = null;
        this.render();
        this.startChecking();
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

    add(time, repeat, label = '') {
        // Validazione input
        if (!Utils.validateTimeInput(time)) {
            this.showStatus('Inserisci un orario valido (HH:MM).', 'error');
            return false;
        }

        // Controllo duplicati migliorato
        const isDuplicate = this.alarms.some(a =>
            a.time === time && (
                (a.repeat === 'Una sola volta' && repeat === 'Una sola volta') ||
                (a.repeat === repeat && repeat !== 'Una sola volta')
            )
        );
        if (isDuplicate) {
            this.showStatus('Sveglia già impostata per quell\'ora e giorno.', 'error');
            return false;
        }

        // Crea nuova sveglia
        const alarm = {
            id: Date.now(),
            time,
            repeat,
            label: label || '', // salva l'etichetta
            active: true,
            created: new Date().toISOString()
        };

        this.alarms.push(alarm);
        this.saveAlarms();
        this.render();
        this.showStatus('Sveglia impostata con successo!', 'success');
        return true;
    }

    remove(id) {
        const initialLength = this.alarms.length;
        this.alarms = this.alarms.filter(alarm => alarm.id !== id);

        if (this.alarms.length < initialLength) {
            this.saveAlarms();
            this.render();
            this.showStatus('Sveglia rimossa.', 'success');
        }
    }

    toggle(id) {
        const alarm = this.alarms.find(a => a.id === id);
        if (alarm) {
            alarm.active = !alarm.active;
            this.saveAlarms();
            this.render();
            this.showStatus(`Sveglia ${alarm.active ? 'attivata' : 'disattivata'}.`, 'success');
        }
    }

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
                    ${alarm.label ? `<span style="font-size:0.98em;color:#B97A57;font-weight:500;">${alarm.label}</span><br>` : ''}
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

    startChecking() {
        // Controlla le sveglie ogni 1.5 secondi
        this.checkInterval = setInterval(() => this.checkAlarms(), 1500);

        // Controllo immediato all'avvio
        this.checkAlarms();
    }

    checkAlarms() {
        new Date();
        const currentTime = Utils.getCurrentTimeString();
        const currentDay = Utils.getCurrentDayName();

        this.alarms.forEach(alarm => {
            if (alarm.time === currentTime && alarm.active) {
                const shouldTrigger = this.shouldTriggerAlarm(alarm, currentDay);

                if (shouldTrigger) {
                    this.triggerAlarm(alarm);

                    // Rimuovi la sveglia dopo che è suonata (una sola volta anche se settimanale)
                    setTimeout(() => this.remove(alarm.id), 1000);
                }
            }
        });
    }


    shouldTriggerAlarm(alarm, currentDay) {
        return alarm.repeat === 'Una sola volta' || alarm.repeat === currentDay;
    }

    triggerAlarm(alarm) {
        // Riproduci suono
        Utils.playAlarmSound();

        // Mostra notifica toast
        Utils.showNotification(`⏰ Sveglia! ${alarm.time}`, 8000);

        // Notifica browser se supportata e autorizzata
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('Sveglia!', {
                body: `È l'ora: ${alarm.time} (${alarm.repeat})`,
                icon: '⏰',
                requireInteraction: true
            });

            // Chiudi la notifica dopo 10 secondi
            setTimeout(() => notification.close(), 10000);
        }

        // Vibrazione su dispositivi supportati
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    }

    showStatus(message, type) {
        this.statusElement.textContent = message;
        if (type === 'error') {
            this.statusElement.style.color = '#ff6b6b';
        } else {
            this.statusElement.style.color = '#fff';
        }
        // Pulisci il messaggio dopo 4 secondi
        setTimeout(() => {
            this.statusElement.textContent = '';
        }, 4000);
    }

    // Pulizia risorse
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

}