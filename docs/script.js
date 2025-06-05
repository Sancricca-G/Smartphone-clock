let alarmSet = false;
let alarmDateTime = null;
const statusDiv = document.getElementById("statusDiv");
const alarmList = document.getElementById("alarmList");
const alarmSound = new Audio("alarm.mp3");
alarmSound.loop = true;

const alarms = []; // array per gestire più sveglie

function aggiornaOrologio() {
    const ora = new Date();
    const ore = String(ora.getHours()).padStart(2, '0');
    const minuti = String(ora.getMinutes()).padStart(2, '0');
    const secondi = String(ora.getSeconds()).padStart(2, '0');
    document.getElementById('DigitalClock').textContent = `${ore}:${minuti}:${secondi}`;
}

aggiornaOrologio();
setInterval(aggiornaOrologio, 1000);

function setAlarm() {
    const input = document.getElementById("alarmTime").value;
    if (!input) {
        alert("Inserisci un orario valido.");
        return;
    }

    const now = new Date();
    let [h, m] = input.split(":").map(Number);
    let alarm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);

    if (alarm <= now) {
        alarm.setDate(alarm.getDate() + 1);
    }

    alarms.push(alarm);
    aggiungiSvegliaAllaLista(alarm);

}

function aggiungiSvegliaAllaLista(alarmDate) {
    const li = document.createElement("li");
    li.textContent = alarmDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const btn = document.createElement("button");
    btn.textContent = "Rimuovi";
    btn.style.marginLeft = "10px";
    btn.onclick = function () {
        alarmList.removeChild(li);
        const index = alarms.indexOf(alarmDate);
        if (index !== -1) alarms.splice(index, 1);
    };

    li.appendChild(btn);
    alarmList.appendChild(li);
}

function checkAlarm() {
    const now = new Date();
    for (let i = alarms.length - 1; i >= 0; i--) {
        if (now >= alarms[i]) {
            alert("Sveglia attivata.");
            alarmSound.play();
            alarms.splice(i, 1);
            const items = alarmList.getElementsByTagName("li");
            if (items[i]) items[i].remove();
        }
    }
}


setInterval(checkAlarm, 1000);