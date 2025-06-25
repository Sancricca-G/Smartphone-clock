// Timer.js - Gestione dei timer multipli come classe modulare
export class Timer {
    constructor(onTimerEnd, onTimersUpdate) {
        this.timers = this.loadTimers();
        this.intervals = {};
        this.onTimerEnd = onTimerEnd;
        this.onTimersUpdate = onTimersUpdate;
    }

    saveTimers() {
        localStorage.setItem('timers', JSON.stringify(this.timers));
    }
    loadTimers() {
        try {
            const stored = localStorage.getItem('timers');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    addTimer({minutes, seconds, label}) {
        const durationMs = (minutes * 60 + seconds) * 1000;
        const timer = {
            id: Date.now().toString(),
            minutes,
            seconds,
            duration: minutes * 60 + seconds,
            label,
            active: false,
            paused: false,
            remainingMs: durationMs,
            created: new Date().toISOString()
        };
        this.timers.push(timer);
        this.saveTimers();
        this.onTimersUpdate && this.onTimersUpdate();
    }

    removeTimer(id) {
        clearInterval(this.intervals[id]);
        delete this.intervals[id];
        this.timers = this.timers.filter(t => t.id !== id);
        this.saveTimers();
        this.onTimersUpdate && this.onTimersUpdate();
    }

    activateTimer(id) {
        const t = this.timers.find(x => x.id === id);
        if (!t.active) {
            t.active = true;
            t.paused = false;
            t.remainingMs = (t.minutes * 60 + t.seconds) * 1000;
            t.startTimestamp = Date.now();
            this.saveTimers();
            this.onTimersUpdate && this.onTimersUpdate();
            this.startAlarmTimerDisplay(id);
        }
    }

    pauseTimer(id) {
        const t = this.timers.find(x => x.id === id);
        if (t && t.active && !t.paused) {
            clearInterval(this.intervals[id]);
            const elapsed = Date.now() - t.startTimestamp;
            t.remainingMs = Math.max(0, t.remainingMs - elapsed);
            t.paused = true;
            this.saveTimers();
            this.onTimersUpdate && this.onTimersUpdate();
        }
    }

    resumeTimer(id) {
        const t = this.timers.find(x => x.id === id);
        if (t && t.active && t.paused && t.remainingMs > 0) {
            t.paused = false;
            t.startTimestamp = Date.now();
            this.saveTimers();
            this.onTimersUpdate && this.onTimersUpdate();
        }
    }

    resetTimer(id) {
        const t = this.timers.find(x => x.id === id);
        clearInterval(this.intervals[id]);
        t.active = false;
        t.paused = false;
        t.remainingMs = (t.minutes * 60 + t.seconds) * 1000;
        this.saveTimers();
        this.onTimersUpdate && this.onTimersUpdate();
    }

    startAlarmTimerDisplay(id) {
        const t = this.timers.find(x => x.id === id);
        if (!t || t.paused) return;
        clearInterval(this.intervals[id]);
        const update = () => {
            const msLeft = t.remainingMs - (Date.now() - t.startTimestamp);
            if (msLeft <= 0) {
                clearInterval(this.intervals[id]);
                t.active = false;
                t.paused = false;
                t.remainingMs = 0;
                this.saveTimers();
                this.onTimersUpdate && this.onTimersUpdate();
                this.onTimerEnd && this.onTimerEnd(t);
            }
        };
        update();
        this.intervals[id] = setInterval(update, 500);
    }

    getTimers() {
        return this.timers;
    }

    clearAllIntervals() {
        Object.values(this.intervals).forEach(i => i && clearInterval(i));
    }
}