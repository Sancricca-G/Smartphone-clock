// --- Variabili di stato e riferimenti DOM ---
let workDuration = 25, breakDuration = 5, totalCycles = 4;
let currentCycle = 1, isRunning = false, isWork = true, timer = null, secondsLeft = 0;

// Funzione per ottenere i riferimenti DOM in modo dinamico (per overlay o pagina standalone)
function getPomodoroElements() {
    // Overlay Pomodoro (index.html)
    if (document.getElementById('startPomodoroTimerBtn')) {
        return {
            timerEl: document.getElementById('timer'),
            cycleInfoEl: document.getElementById('cycle-info'),
            progressEl: document.getElementById('progress'),
            beep: document.getElementById('beep-sound'),
            workInput: document.getElementById('work'),
            breakInput: document.getElementById('break'),
            cyclesInput: document.getElementById('cycles'),
            startBtn: document.getElementById('startPomodoroTimerBtn'),
            resetBtn: document.getElementById('resetPomodoroBtn')
        };
    }
    // Pagina pomodoro.html
    return {
        timerEl: document.getElementById('timer'),
        cycleInfoEl: document.getElementById('cycle-info'),
        progressEl: document.getElementById('progress'),
        beep: document.getElementById('beep-sound'),
        workInput: document.getElementById('work'),
        breakInput: document.getElementById('break'),
        cyclesInput: document.getElementById('cycles'),
        startBtn: document.getElementById('startPomodoroBtn'),
        resetBtn: document.getElementById('resetPomodoroBtn')
    };
}

// --- Funzioni di utilità ---
function formatTime(secs) {
    let m = Math.floor(secs / 60);
    let s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function updateSettings(els) {
    workDuration = parseInt(els.workInput.value) || 25;
    breakDuration = parseInt(els.breakInput.value) || 5;
    totalCycles = parseInt(els.cyclesInput.value) || 4;
}

// --- Funzioni di UI ---
function updateUI(els) {
    els.timerEl.textContent = formatTime(secondsLeft);
    els.cycleInfoEl.innerHTML = `Ciclo <b>${currentCycle}</b> di <b>${totalCycles}</b> (${isWork ? 'Lavoro' : 'Pausa'})`;
    let totalSteps = totalCycles * 2;
    let currentStep = (currentCycle - 1) * 2 + (isWork ? 0 : 1);
    let progressPercent = (currentStep + (isRunning ? (1 - secondsLeft / ((isWork ? workDuration : breakDuration) * 60)) : 0)) / totalSteps * 100;
    els.progressEl.style.width = `${progressPercent}%`;
}

// --- Logica Pomodoro ---
function tick(els) {
    if (!isRunning) return;
    secondsLeft--;
    updateUI(els);
    if (secondsLeft <= 0) {
        nextStep(els);
    } else {
        timer = setTimeout(() => tick(els), 1000);
    }
}

function nextStep(els) {
    els.beep.currentTime = 0;
    els.beep.loop = true;
    els.beep.play();

    if (isWork) {
        els.timerEl.textContent = "Pausa a breve...";
        isWork = false;
        setTimeout(() => {
            els.beep.pause();
            els.beep.currentTime = 0;
            secondsLeft = breakDuration * 60;
            updateUI(els);
            if (isRunning) timer = setTimeout(() => tick(els), 1000);
        }, 5000);
    } else {
        els.timerEl.textContent = "Lavoro a breve...";
        isWork = true;
        setTimeout(() => {
            els.beep.pause();
            els.beep.currentTime = 0;
            currentCycle++;
            if (currentCycle > totalCycles) {
                stopPomodoro(true, els);
                return;
            }
            secondsLeft = workDuration * 60;
            updateUI(els);
            if (isRunning) timer = setTimeout(() => tick(els), 1000);
        }, 5000);
    }
}

function startPomodoro() {
    const els = getPomodoroElements();
    if (isRunning) return;
    updateSettings(els);
    isRunning = true;
    isWork = true;
    currentCycle = 1;
    secondsLeft = workDuration * 60;
    updateUI(els);
    tick(els);
}

function stopPomodoro(finished = false, els = getPomodoroElements()) {
    isRunning = false;
    clearTimeout(timer);
    if (finished) {
        els.timerEl.textContent = "Fatto!";
        els.cycleInfoEl.textContent = `Hai completato ${totalCycles} cicli!`;
        els.progressEl.style.width = "100%";
    }
}

function resetPomodoro() {
    const els = getPomodoroElements();
    isRunning = false;
    clearTimeout(timer);
    updateSettings(els);
    currentCycle = 1;
    isWork = true;
    secondsLeft = workDuration * 60;
    updateUI(els);
}

// --- Gestione eventi e inizializzazione ---
function setupPomodoroUI() {
    const els = getPomodoroElements();

    // Imposta testo pulsanti se vuoti (per compatibilità)
    if (els.startBtn && !els.startBtn.textContent.trim()) els.startBtn.textContent = "AVVIA";
    if (els.resetBtn && !els.resetBtn.textContent.trim()) els.resetBtn.textContent = "RESET";

    // Rimuovi eventuali listener precedenti per evitare duplicazioni
    if (els.startBtn) {
        els.startBtn.onclick = null;
        els.startBtn.onkeypress = null;
        els.startBtn.addEventListener('click', startPomodoro);
        els.startBtn.addEventListener('keypress', function(e) { if (e.key === 'Enter' || e.key === ' ') startPomodoro(); });
    }
    if (els.resetBtn) {
        els.resetBtn.onclick = null;
        els.resetBtn.onkeypress = null;
        els.resetBtn.addEventListener('click', resetPomodoro);
        els.resetBtn.addEventListener('keypress', function(e) { if (e.key === 'Enter' || e.key === ' ') resetPomodoro(); });
    }
    resetPomodoro();
}

// Espone la funzione per reset dall'esterno (usata in index.html)
window.resetPomodoro = resetPomodoro;

// Inizializza la UI Pomodoro se presente nella pagina o overlay
if (
    (document.getElementById('timer') && document.getElementById('cycle-info')) &&
    (document.getElementById('startPomodoroBtn') || document.getElementById('startPomodoroTimerBtn'))
) {
    setupPomodoroUI();
}

// Gestione apertura overlay Pomodoro dalla home (index.html)
const openPomodoroBtn = document.getElementById('startPomodoroBtn');
const pomodoroOverlay = document.getElementById('pomodoroOverlay');
const closePomodoroOverlay = document.getElementById('closePomodoroOverlay');
if (openPomodoroBtn && pomodoroOverlay) {
    openPomodoroBtn.addEventListener('click', () => {
        pomodoroOverlay.style.display = 'flex';
        window.resetPomodoro();
    });
}
if (closePomodoroOverlay && pomodoroOverlay) {
    closePomodoroOverlay.addEventListener('click', () => {
        pomodoroOverlay.style.display = 'none';
    });
}