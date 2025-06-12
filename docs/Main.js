import { Clock } from './clock.js';
import { Stopwatch } from './stopwatch.js';
import { Timer } from './timer.js';
import { AlarmManager } from './alarm.js';
import { Utils } from './utils.js';

// Main Application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    const clock = new Clock(document.getElementById('DigitalClock'));

    const alarmManager = new AlarmManager(
        document.getElementById('alarmList'),
        document.getElementById('alarmStatus')
    );

    const stopwatch = new Stopwatch(document.getElementById('stopwatchDisplay'));

    const timer = new Timer(
        document.getElementById('timerDisplay'),
        () => {
            Utils.playAlarmSound();
            Utils.showNotification('⏲️ Timer scaduto!', 5000);
        }
    );

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Alarm controls
    document.getElementById('setAlarmBtn').addEventListener('click', () => {
        const time = document.getElementById('alarmTime').value;
        const repeat = document.getElementById('alarmRepeat').value;
        if (alarmManager.add(time, repeat)) {
            document.getElementById('alarmTime').value = '';
            document.getElementById('alarmRepeat').value = 'Una sola volta';
        }
    });

    // Stopwatch controls
    document.getElementById('startStopwatchBtn').addEventListener('click', () => {
        stopwatch.start();
    });

    document.getElementById('stopStopwatchBtn').addEventListener('click', () => {
        stopwatch.stop();
    });

    document.getElementById('resetStopwatchBtn').addEventListener('click', () => {
        stopwatch.reset();
    });

    // Timer controls
    document.getElementById('startTimerBtn').addEventListener('click', () => {
        const minutes = parseInt(document.getElementById('timerMinutes').value || '0', 10);
        if (minutes > 0) {
            timer.start(minutes * 60 * 1000);
            document.getElementById('timerMinutes').value = '';
        } else {
            Utils.showNotification('Inserisci un numero di minuti valido!');
        }
    });

    document.getElementById('pauseTimerBtn').addEventListener('click', () => {
        timer.pause();
    });

    document.getElementById('resumeTimerBtn').addEventListener('click', () => {
        timer.resume();
    });

    document.getElementById('resetTimerBtn').addEventListener('click', () => {
        timer.reset();
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        clock.stop();
        stopwatch.stop();
        timer.stop();
        alarmManager.destroy();
    });

    // Make alarmManager globally accessible for remove buttons
    window.alarmManager = alarmManager;
});