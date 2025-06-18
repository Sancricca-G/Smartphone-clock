// Pomodoro Timer Script - collegato a pomodoro.html
let workDuration = 25, breakDuration = 5, totalCycles = 4;
let currentCycle = 1, isRunning = false, isWork = true, timer = null, secondsLeft = 0;
const timerEl = document.getElementById('timer');
const cycleInfoEl = document.getElementById('cycle-info');
const progressEl = document.getElementById('progress');
const beep = document.getElementById('beep-sound');

function updateSettings() {
    workDuration = parseInt(document.getElementById('work').value) || 25;
    breakDuration = parseInt(document.getElementById('break').value) || 5;
    totalCycles = parseInt(document.getElementById('cycles').value) || 4;
}

function formatTime(secs) {
    let m = Math.floor(secs / 60);
    let s = secs % 60;
    return `${m}:${s.toString().padStart(2,'0')}`;
}

function updateUI() {
    timerEl.textContent = formatTime(secondsLeft);
    cycleInfoEl.innerHTML = `Ciclo <b>${currentCycle}</b> di <b>${totalCycles}</b> (${isWork ? 'Lavoro' : 'Pausa'})`;
    let progressPercent = ((currentCycle-1)+(isWork ? 0 : 0.5))/totalCycles * 100;
    progressEl.style.width = `${progressPercent}%`;
}

function nextStep() {
    beep.currentTime = 0;
    beep.loop = true;
    beep.play();

    if (isWork) {
        timerEl.textContent = "Pausa a breve...";
        isWork = false;
        setTimeout(() => {
            beep.pause();
            beep.currentTime = 0;
            secondsLeft = breakDuration * 60;
            updateUI();
            if (isRunning) timer = setTimeout(tick, 1000);
        }, 5000);
    } else {
        timerEl.textContent = "Lavoro a breve...";
        isWork = true;
        setTimeout(() => {
            beep.pause();
            beep.currentTime = 0;
            currentCycle++;
            if (currentCycle > totalCycles) {
                stopPomodoro(true);
                return;
            }
            secondsLeft = workDuration * 60;
            updateUI();
            if (isRunning) timer = setTimeout(tick, 1000);
        }, 5000);
    }
}

function tick() {
    if (!isRunning) return;
    secondsLeft--;
    updateUI();
    if (secondsLeft <= 0) {
        nextStep();
    } else {
        timer = setTimeout(tick, 1000);
    }
}

function startPomodoro() {
    if (isRunning) return;
    updateSettings();
    isRunning = true;
    isWork = true;
    currentCycle = 1;
    secondsLeft = workDuration * 60;
    updateUI();
    tick();
}

document.getElementById('startPomodoroBtn').addEventListener('click', startPomodoro);

document.getElementById('resetPomodoroBtn').addEventListener('click', resetPomodoro);

function stopPomodoro(finished = false) {
    isRunning = false;
    clearTimeout(timer);
    if (finished) {
        timerEl.textContent = "Fatto!";
        cycleInfoEl.textContent = `Hai completato ${totalCycles} cicli!`;
        progressEl.style.width = "100%";
    }
}

function resetPomodoro() {
    isRunning = false;
    clearTimeout(timer);
    updateSettings();
    currentCycle = 1;
    isWork = true;
    secondsLeft = workDuration * 60;
    updateUI();
}

// Init UI
resetPomodoro();

