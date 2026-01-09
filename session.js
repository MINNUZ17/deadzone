document.getElementById('sessionForm').addEventListener('submit', e => {
    e.preventDefault();

    const startTime = document.getElementById('startTime').value;
    const startPeriod = document.getElementById('startPeriod').value;
    const endTime = document.getElementById('endTime').value;
    const endPeriod = document.getElementById('endPeriod').value;

    const distraction = parseInt(document.getElementById('distractionTime').value);
    const focus = parseInt(document.getElementById('focusLevel').value);

    const msg = document.getElementById('msg');
    msg.textContent = '';

    if (!startTime || !endTime) return;

    // Convert to 24-hour format
    const start24 = convertTo24(startTime, startPeriod);
    const end24 = convertTo24(endTime, endPeriod);

    let startMin = toMinutes(start24);
    let endMin = toMinutes(end24);

    // ✅ HANDLE OVERNIGHT STUDY (past midnight)
    if (endMin <= startMin) {
        endMin += 24 * 60; // add one day
    }

    const duration = endMin - startMin;

    if (distraction > duration) {
        msg.textContent = 'Distraction time cannot exceed study duration';
        return;
    }

    const active = JSON.parse(localStorage.getItem('activeProfile'));
    const profiles = JSON.parse(localStorage.getItem('profiles'));

    const session = {
        start: start24,
        end: end24,
        distraction: distraction,
        focus: focus,
        date: new Date().toLocaleDateString()
    };

    active.sessions.push(session);

    const updated = profiles.map(p =>
        p.id === active.id ? active : p
    );

    localStorage.setItem('profiles', JSON.stringify(updated));
    localStorage.setItem('activeProfile', JSON.stringify(active));

    msg.textContent = 'Study session saved successfully ✔️';
    e.target.reset();
});

// ---------- HELPERS ----------

function convertTo24(time, period) {
    let [h, m] = time.split(':').map(Number);

    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function toMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}
