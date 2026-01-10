// ===============================
// DEADZONE STORAGE LOGIC (FINAL FIXED)
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

// -------- FORMAT TIME --------
function formatTime(time) {
    let [h, m] = time.split(':');
    h = parseInt(h);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
}

document.addEventListener('DOMContentLoaded', function () {

    /* ================= HOME PAGE ================= */

    const profileBar = document.getElementById('profileBar');
    const modal = document.getElementById('modal');

    if (profileBar) {
        const profiles = getProfiles();
        profileBar.innerHTML = '';

        profiles.forEach(profile => {
            const card = document.createElement('div');
            card.className = 'profile-card';

            card.innerHTML = `
                <div class="avatar">
                    <img src="${profile.photo || 'default-avatar.png'}">
                </div>
                <strong>${profile.name}</strong><br>
                <small>${profile.id}</small>
            `;

            card.onclick = function () {
                setActiveProfile(profile);
            };

            profileBar.appendChild(card);
        });
    }

    document.getElementById('openModalBtn') &&
        document.getElementById('openModalBtn').addEventListener('click', function () {
            modal.classList.remove('hidden');
        });

    document.getElementById('closeModalBtn') &&
        document.getElementById('closeModalBtn').addEventListener('click', function () {
            modal.classList.add('hidden');
        });

    // -------- CREATE PROFILE (NO ASYNC / NO ERROR) --------
    document.getElementById('createProfileBtn') &&
        document.getElementById('createProfileBtn').addEventListener('click', function () {

            const name = document.getElementById('studentName').value.trim();
            const photoInput = document.getElementById('studentPhoto');

            if (!name) return;

            const profiles = getProfiles();

            const newProfile = {
                name: name,
                id: generateId(),
                sessions: [],
                photo: null
            };

            // 👉 IF PHOTO EXISTS → COMPRESS
            if (photoInput.files && photoInput.files[0]) {

                compressImage(photoInput.files[0], 250, 250, 0.7)
                    .then(function (base64) {
                        newProfile.photo = base64;
                        profiles.push(newProfile);
                        saveProfiles(profiles);
                        setActiveProfile(newProfile);
                    })
                    .catch(function () {
                        alert('Image too large. Try another photo.');
                    });

            } else {
                // 👉 NO PHOTO
                profiles.push(newProfile);
                saveProfiles(profiles);
                setActiveProfile(newProfile);
            }
        });

    /* ================= PROFILE PAGE ================= */

    const active = JSON.parse(localStorage.getItem('activeProfile'));

    if (active && document.getElementById('profileName')) {
        document.getElementById('profileName').textContent = active.name;

        const sessionList = document.getElementById('sessionList');
        sessionList.innerHTML = '';

        if (!active.sessions || active.sessions.length === 0) {
            sessionList.innerHTML = '<p>No study sessions added yet.</p>';
        } else {
            active.sessions.forEach(function (s, index) {
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

        document.getElementById('deleteProfileBtn').onclick = function () {
            let profiles = getProfiles();
            profiles = profiles.filter(p => p.id !== active.id);
            saveProfiles(profiles);
            localStorage.removeItem('activeProfile');

            document.getElementById('deleteMsg').textContent =
                'Profile deleted successfully ✔️';

            setTimeout(function () {
                window.location.href = 'index.html';
            }, 1500);
        };
    }
});

// ================= IMAGE COMPRESSION =================

function compressImage(file, maxW, maxH, quality) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function () {
                let w = img.width;
                let h = img.height;

                if (w > h && w > maxW) {
                    h = Math.round(h * (maxW / w));
                    w = maxW;
                } else if (h > maxH) {
                    w = Math.round(w * (maxH / h));
                    h = maxH;
                }

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);

                const compressed = canvas.toDataURL('image/jpeg', quality);
                resolve(compressed);
            };

            img.onerror = reject;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
