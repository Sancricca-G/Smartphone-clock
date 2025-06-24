import { Clock } from './clock.js';
import { Stopwatch } from './stopwatch.js';
import { Timer } from './timer.js';
import { AlarmManager } from './alarm.js';
import { Utils } from './utils.js';

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

    const timer = new Timer(
        document.getElementById('timerDisplay'),
        () => {
            Utils.playAlarmSound();
            Utils.showNotification('⏲️ Timer scaduto!', 5000);
        }
    );

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
    let timers = loadTimers();
    let alarmTimerIntervals = {};

    function saveTimers() {
        localStorage.setItem('timers', JSON.stringify(timers));
    }
    function loadTimers() {
        try {
            const stored = localStorage.getItem('timers');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    function renderTimers() {
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
            if (t.active && !t.paused) {
                const msLeft = t.remainingMs - (Date.now() - t.startTimestamp);
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
        timers.filter(t => t.active && !t.paused).forEach(t => startAlarmTimerDisplay(t.id));
    }

    function setUpTimerButtons(id) {
        const t = timers.find(x => x.id === id);
        document.getElementById(`start-${id}`).onclick = () => activateTimer(id);
        document.getElementById(`pause-${id}`).onclick = () => pauseTimer(id);
        document.getElementById(`resume-${id}`).onclick = () => resumeTimer(id);
        document.getElementById(`reset-${id}`).onclick = () => resetTimer(id);
        document.getElementById(`remove-${id}`).onclick = () => removeTimer(id);
    }

    window.removeTimer = function(id) {
        clearInterval(alarmTimerIntervals[id]);
        delete alarmTimerIntervals[id];
        timers = timers.filter(t => t.id !== id);
        saveTimers();
        renderTimers();
    };

    window.activateTimer = function(id) {
        const t = timers.find(x => x.id === id);
        if (!t.active) {
            t.active = true;
            t.paused = false;
            // CORREZIONE: calcola la durata in millisecondi corretta usando minuti e secondi
            t.remainingMs = (t.minutes * 60 + t.seconds) * 1000;
            t.startTimestamp = Date.now();
            saveTimers();
            renderTimers();
        }
    };

    window.pauseTimer = function(id) {
        const t = timers.find(x => x.id === id);
        if (t && t.active && !t.paused) {
            clearInterval(alarmTimerIntervals[id]);
            const elapsed = Date.now() - t.startTimestamp;
            t.remainingMs = Math.max(0, t.remainingMs - elapsed);
            t.paused = true;
            saveTimers();
            renderTimers();
        }
    };

    window.resumeTimer = function(id) {
        const t = timers.find(x => x.id === id);
        if (t && t.active && t.paused && t.remainingMs > 0) {
            t.paused = false;
            t.startTimestamp = Date.now();
            saveTimers();
            renderTimers();
        }
    };

    window.resetTimer = function(id) {
        const t = timers.find(x => x.id === id);
        clearInterval(alarmTimerIntervals[id]);
        t.active = false;
        t.paused = false;
        // CORREZIONE: resetta la durata in ms usando minuti e secondi
        t.remainingMs = (t.minutes * 60 + t.seconds) * 1000;
        saveTimers();
        renderTimers();
    };

    function startAlarmTimerDisplay(id) {
        const t = timers.find(x => x.id === id);
        if (!t || t.paused) return;
        clearInterval(alarmTimerIntervals[id]);
        function update() {
            const msLeft = t.remainingMs - (Date.now() - t.startTimestamp);
            if (msLeft <= 0) {
                document.getElementById(`alarm-timer-${id}`).textContent = '00:00';
                clearInterval(alarmTimerIntervals[id]);
                t.active = false;
                t.paused = false;
                t.remainingMs = 0;
                saveTimers();
                renderTimers();
                Utils.playAlarmSound();
                Utils.showNotification('⏲️ Timer scaduto!', 5000);
            } else {
                const total = Math.ceil(msLeft / 1000);
                const mm = String(Math.floor(total / 60)).padStart(2, '0');
                const ss = String(total % 60).padStart(2, '0');
                document.getElementById(`alarm-timer-${id}`).textContent = `${mm}:${ss}`;
            }
        }
        update();
        alarmTimerIntervals[id] = setInterval(update, 500);
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
        const duplicate = timers.some(
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
        // CORREZIONE: salva la durata in ms usando minuti e secondi
        const durationMs = (minutes * 60 + seconds) * 1000;
        timers.push({
            id: Date.now().toString(),
            minutes,
            seconds,
            duration: minutes * 60 + seconds,
            label,
            active: false,
            paused: false,
            remainingMs: durationMs,
            created: new Date().toISOString()
        });
        saveTimers();
        renderTimers();
    });

    renderTimers();

    window.addEventListener('beforeunload', () => {
        clock.stop();
        stopwatch.stop();
        timer.stop();
        alarmManager.destroy();
        Object.values(alarmTimerIntervals).forEach(i => i && clearInterval(i));
    });

    window.alarmManager = alarmManager;
});