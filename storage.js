// ===============================
// DEADZONE STORAGE LOGIC (FINAL)
// ===============================

function generateId() {
    return 'DZ-' + Math.floor(100000 + Math.random() * 900000);
}

function getProfiles() {
    return JSON.parse(localStorage.getItem('profiles')) || [];
}

function saveProfiles(profiles) {
    localStorage.setItem('profiles', JSON.stringify(profiles));
}

function setActiveProfile(profile) {
    localStorage.setItem('activeProfile', JSON.stringify(profile));
    window.location.href = 'profile.html';
}

// -------- FORMAT TIME WITH AM / PM --------
function formatTime(time) {
    let [h, m] = time.split(':');
    h = parseInt(h);

    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;

    return `${h}:${m} ${ampm}`;
}

document.addEventListener('DOMContentLoaded', () => {

    /* ================= HOME PAGE ================= */

    const profileBar = document.getElementById('profileBar');
    const modal = document.getElementById('modal');

    if (profileBar) {
        const profiles = getProfiles();
        profileBar.innerHTML = '';

        profiles.forEach(profile => {
            if (!profile.name || !profile.id) return;

            const card = document.createElement('div');
            card.className = 'profile-card';
            card.innerHTML = `<strong>${profile.name}</strong><br>${profile.id}`;
            card.onclick = () => setActiveProfile(profile);

            profileBar.appendChild(card);
        });
    }

    document.getElementById('openModalBtn')?.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    document.getElementById('closeModalBtn')?.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    document.getElementById('createProfileBtn')?.addEventListener('click', () => {
        const name = document.getElementById('studentName').value.trim();
        if (!name) return;

        const profiles = getProfiles();
        const newProfile = {
            name: name,
            id: generateId(),
            sessions: []
        };

        profiles.push(newProfile);
        saveProfiles(profiles);
        setActiveProfile(newProfile);
    });

    /* ================= PROFILE PAGE ================= */

    const active = JSON.parse(localStorage.getItem('activeProfile'));

    if (active && document.getElementById('profileName')) {
        document.getElementById('profileName').textContent = active.name;
        document.getElementById('profileId').textContent = active.id;

        const sessionList = document.getElementById('sessionList');
        sessionList.innerHTML = '';

        if (!active.sessions || active.sessions.length === 0) {
            sessionList.innerHTML = '<p>No study sessions added yet.</p>';
        } else {
            active.sessions.forEach((s, index) => {
                const div = document.createElement('div');
                div.className = 'session-item';
                div.innerHTML = `
                    <strong>Session ${index + 1}</strong><br>
                    ${s.date}<br>
                    ${formatTime(s.start)} – ${formatTime(s.end)}<br>
                    Distraction: ${s.distraction} mins<br>
                    Focus Level: ${s.focus}
                `;
                sessionList.appendChild(div);
            });
        }

        // -------- DELETE PROFILE (NO BROWSER POPUP) --------
        document.getElementById('deleteProfileBtn').onclick = () => {
            let profiles = getProfiles();
            profiles = profiles.filter(p => p.id !== active.id);
            saveProfiles(profiles);

            localStorage.removeItem('activeProfile');

            const msg = document.getElementById('deleteMsg');
            msg.textContent = 'Profile deleted successfully ✔️';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        };
    }
});
