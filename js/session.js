document.getElementById('sessionForm').addEventListener('submit', e => {
    e.preventDefault();

    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    const distraction = parseInt(document.getElementById('distractionTime').value);
    const focus = parseInt(document.getElementById('focusLevel').value);

    const msg = document.getElementById('msg');
    msg.textContent = '';

    if (!startTime || !endTime) return;

    // ✅ time input already gives correct time → direct use (24 hour)
    let startMin = toMinutes(startTime);
    let endMin = toMinutes(endTime);

    // ✅ HANDLE OVERNIGHT STUDY (past midnight)
    if (endMin <= startMin) {
        endMin += 24 * 60;
    }

    const duration = endMin - startMin;

    if (distraction > duration) {
        msg.textContent = 'Distraction time cannot exceed study duration';
        return;
    }

    const active = JSON.parse(localStorage.getItem('activeProfile'));
    const profiles = JSON.parse(localStorage.getItem('profiles'));

    const session = {
        start: startTime,
        end: endTime,
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
function toMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}
