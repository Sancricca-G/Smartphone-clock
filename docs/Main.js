import { Clock } from './clock.js';
import { Stopwatch } from './stopwatch.js';
import { AlarmManager } from './alarm.js';
import { Utils } from './utils.js';
import { Timer } from './Timer.js';

document.addEventListener('DOMContentLoaded', () => {
    const clock = new Clock(document.getElementById('DigitalClock'));
    window.digitalClockInstance = clock;

    const alarmManager = new AlarmManager(
        document.getElementById('alarmList'),
        document.getElementById('alarmStatus')
    );

    const stopwatch = new Stopwatch(document.getElementById('stopwatchDisplay'));
    const lapsList = document.getElementById('lapsList');
    let laps = [];
    const lapBtn = document.getElementById('lapStopwatchBtn');
    lapBtn.disabled = true;

    document.getElementById('lapStopwatchBtn').addEventListener('click', () => {
        const lapTime = stopwatch.getTimeString();
        if (lapTime === "00:00.0" && laps.length === 0) return;
        laps.push(lapTime);
        renderLaps();
    });

    document.getElementById('resetStopwatchBtn').addEventListener('click', () => {
        stopwatch.reset();
        laps = [];
        renderLaps();
        lapBtn.disabled = true;
    });

    function renderLaps() {
        lapsList.innerHTML = '';
        laps.forEach((lap, idx) => {
            const li = document.createElement('li');
            li.textContent = `Giro ${idx + 1}: ${lap}`;
            lapsList.appendChild(li);
        });
    }

    document.getElementById('startStopwatchBtn').addEventListener('click', () => {
        stopwatch.start();
        lapBtn.disabled = false;
    });

    document.getElementById('stopStopwatchBtn').addEventListener('click', () => {
        stopwatch.stop();
        lapBtn.disabled = true;
    });

    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    document.getElementById('setAlarmBtn').addEventListener('click', () => {
        const time = document.getElementById('alarmTime').value;
        const repeat = document.getElementById('alarmRepeat').value;
        const label = document.getElementById('alarmLabel').value;
        if (alarmManager.add(time, repeat, label)) {
            document.getElementById('alarmTime').value = '';
            document.getElementById('alarmRepeat').value = 'Una sola volta';
            document.getElementById('alarmLabel').value = '';
        }
    });

    const customPanel = document.getElementById('customPanelContent');

    // Inizializza Timer come istanza
    const timerManager = new Timer(
        (timer) => {
            Utils.playAlarmSound();
            Utils.showNotification('⏲️ Timer scaduto!', 5000);
        },
        renderTimers
    );

    function renderTimers() {
        const timers = timerManager.getTimers();
        customPanel.innerHTML = '';
        if (!timers.length) {
            customPanel.innerHTML = '<p style="color:#999;font-style:italic;text-align:center;">Nessun timer attivo</p>';
            return;
        }
        timers.forEach(t => {
            const div = document.createElement('div');
            div.className = 'alarm-item';
            div.style.opacity = t.active ? '1' : '0.6';
            let displayTime = "00:00";
            // Calcolo corretto del tempo rimanente
            if (t.active && !t.paused) {
                const msLeft = Math.max(0, t.remainingMs - (Date.now() - t.startTimestamp));
                const total = Math.ceil(msLeft / 1000);
                const mm = String(Math.floor(total / 60)).padStart(2, '0');
                const ss = String(total % 60).padStart(2, '0');
                displayTime = msLeft > 0 ? `${mm}:${ss}` : '00:00';
            } else if (t.paused) {
                const total = Math.ceil(t.remainingMs / 1000);
                const mm = String(Math.floor(total / 60)).padStart(2, '0');
                const ss = String(total % 60).padStart(2, '0');
                displayTime = `${mm}:${ss}`;
            } else {
                const mm = String(t.minutes).padStart(2, '0');
                const ss = String(t.seconds).padStart(2, '0');
                displayTime = `${mm}:${ss}`;
            }

            div.innerHTML = `
                <div>
                    ${t.label ? `<span style="font-size:0.98em;color:#B97A57;font-weight:500;">${t.label}</span><br>` : ''}
                    <div id="alarm-timer-${t.id}" class="alarm-timer">${displayTime}</div>
                </div>
                <div>
                    <button id="start-${t.id}" ${t.active && !t.paused ? 'disabled' : ''}>Avvia</button>
                    <button id="pause-${t.id}" ${!t.active || t.paused ? 'disabled' : ''}>Pausa</button>
                    <button id="resume-${t.id}" ${!t.active || !t.paused ? 'disabled' : ''}>Riprendi</button>
                    <button id="reset-${t.id}">Reset</button>
                    <button id="remove-${t.id}">Rimuovi</button>
                </div>
            `;
            customPanel.appendChild(div);
            setUpTimerButtons(t.id);
        });

        // Aggiorna la visualizzazione dei timer attivi ogni secondo
        if (window._timerListInterval) clearInterval(window._timerListInterval);
        const updateAllTimers = () => {
            timerManager.getTimers().forEach(t => {
                if (t.active && !t.paused) {
                    const msLeft = Math.max(0, t.remainingMs - (Date.now() - t.startTimestamp));
                    const total = Math.ceil(msLeft / 1000);
                    const mm = String(Math.floor(total / 60)).padStart(2, '0');
                    const ss = String(total % 60).padStart(2, '0');
                    const el = document.getElementById(`alarm-timer-${t.id}`);
                    if (el) el.textContent = msLeft > 0 ? `${mm}:${ss}` : '00:00';
                }
            });
        };
        window._timerListInterval = setInterval(updateAllTimers, 500);
    }

    function setUpTimerButtons(id) {
        document.getElementById(`start-${id}`).onclick = () => timerManager.activateTimer(id);
        document.getElementById(`pause-${id}`).onclick = () => timerManager.pauseTimer(id);
        document.getElementById(`resume-${id}`).onclick = () => timerManager.resumeTimer(id);
        document.getElementById(`reset-${id}`).onclick = () => timerManager.resetTimer(id);
        document.getElementById(`remove-${id}`).onclick = () => timerManager.removeTimer(id);
    }

    document.getElementById('addTimerBtn').addEventListener('click', () => {
        const minutes = parseInt(document.getElementById('timerMinutes').value || '0', 10);
        const seconds = parseInt(document.getElementById('timerSeconds').value || '0', 10);
        const label = document.getElementById('timerLabel').value.trim();
        const timerError = document.getElementById('timerError');
        const totalSeconds = minutes * 60 + seconds;
        if (
            (isNaN(minutes) && isNaN(seconds)) ||
            (minutes < 0 || minutes > 120) ||
            (seconds < 0 || seconds > 59) ||
            (totalSeconds < 1 || totalSeconds > 7200)
        ) {
            timerError.textContent = "Imposta un timer tra 1 secondo e 120 minuti (max 2 ore).";
            return;
        }
        const duplicate = timerManager.getTimers().some(
            t => t.minutes === minutes && t.seconds === seconds && t.label === label
        );
        if (duplicate) {
            timerError.textContent = "Timer già presente con questa durata ed etichetta.";
            return;
        }
        timerError.textContent = '';
        document.getElementById('timerMinutes').value = '';
        document.getElementById('timerSeconds').value = '';
        document.getElementById('timerLabel').value = '';
        timerManager.addTimer({ minutes, seconds, label });
    });

    renderTimers();

    window.addEventListener('beforeunload', () => {
        clock.stop();
        stopwatch.stop();
        alarmManager.destroy();
        timerManager.clearAllIntervals();
    });

    window.alarmManager = alarmManager;
    window.timerManager = timerManager;
});