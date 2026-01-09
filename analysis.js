const activeProfile = JSON.parse(localStorage.getItem('activeProfile'));

const totalSessionsEl = document.getElementById('totalSessions');
const bestSlotEl = document.getElementById('bestSlot');
const deadSlotEl = document.getElementById('deadSlot');
const recEl = document.getElementById('recommendation');

if (!activeProfile || !activeProfile.sessions || activeProfile.sessions.length === 0) {
    totalSessionsEl.textContent = 0;
    recEl.textContent = 'Add study sessions to view your productivity overview.';
} else {
    const sessions = activeProfile.sessions;
    totalSessionsEl.textContent = sessions.length;

    const slotScores = {
        'Early Morning': 0,
        'Morning': 0,
        'Afternoon': 0,
        'Evening': 0,
        'Night': 0
    };

    const slotCount = {
        'Early Morning': 0,
        'Morning': 0,
        'Afternoon': 0,
        'Evening': 0,
        'Night': 0
    };

    sessions.forEach(s => {
        const hour = parseInt(s.start.split(':')[0]);
        let slot;

        if (hour >= 4 && hour < 8) slot = 'Early Morning';
        else if (hour >= 8 && hour < 12) slot = 'Morning';
        else if (hour >= 12 && hour < 16) slot = 'Afternoon';
        else if (hour >= 16 && hour < 20) slot = 'Evening';
        else slot = 'Night';

        const duration = toMin(s.end) - toMin(s.start);
        const effective = duration - s.distraction;
        const productivity = (effective * s.focus) / duration;

        slotScores[slot] += productivity;
        slotCount[slot]++;
    });

    const labels = [];
    const values = [];

    let bestSlot = '';
    let deadSlot = '';
    let max = -Infinity;
    let min = Infinity;

    for (const slot in slotScores) {
        if (slotCount[slot] > 0) {
            const avg = slotScores[slot] / slotCount[slot];
            labels.push(slot);
            values.push(avg.toFixed(2));

            if (avg > max) {
                max = avg;
                bestSlot = slot;
            }
            if (avg < min) {
                min = avg;
                deadSlot = slot;
            }
        }
    }

    bestSlotEl.textContent = bestSlot;
    deadSlotEl.textContent =
        labels.length > 1 ? deadSlot : 'Not enough data';

    recEl.textContent =
        labels.length > 1
            ? `You perform best during ${bestSlot}. Productivity is lowest during ${deadSlot}.`
            : `You perform best during ${bestSlot}. Add sessions at other times to detect dead zones.`;

    // SOFT DONUT CHART
    new Chart(document.getElementById('slotChart'), {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
    data: values,
    backgroundColor: [
        '#60a5fa', // Early Morning
        '#34d399', // Morning
        '#fbbf24', // Afternoon
        '#f87171', // Evening
        '#a78bfa'  // Night
    ],
    borderColor: '#ffffff',
    borderWidth: 2
}]

        },
        options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 600   // smooth but not slow
    },
    plugins: {
        legend: {
            position: 'bottom'
        }
    }
}

    });
}

function toMin(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}
