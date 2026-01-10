const adviceBox = document.getElementById("aiAdvice");
const timetableBox = document.getElementById("aiTimetable");
const tipsBox = document.getElementById("aiTips");
const btn = document.getElementById("getAdviceBtn");

btn.addEventListener("click", () => {

    adviceBox.innerText = "🤖 Analyzing your study productivity...";
    timetableBox.innerText = "⏳ Generating timetable...";
    tipsBox.innerText = "⏳ Preparing tips...";

    const activeProfile = JSON.parse(localStorage.getItem("activeProfile"));

    if (!activeProfile || !activeProfile.sessions || activeProfile.sessions.length === 0) {
        adviceBox.innerText = "No study sessions found. Add sessions first.";
        timetableBox.innerText = "-";
        tipsBox.innerText = "-";
        return;
    }

    const sessions = activeProfile.sessions;

    const slotScores = {
        "Early Morning": { score: 0, count: 0 },
        "Morning": { score: 0, count: 0 },
        "Afternoon": { score: 0, count: 0 },
        "Evening": { score: 0, count: 0 },
        "Night": { score: 0, count: 0 }
    };

    sessions.forEach(s => {
        const hour = parseInt(s.start.split(":")[0]);
        let slot;

        if (hour >= 4 && hour < 8) slot = "Early Morning";
        else if (hour >= 8 && hour < 12) slot = "Morning";
        else if (hour >= 12 && hour < 16) slot = "Afternoon";
        else if (hour >= 16 && hour < 20) slot = "Evening";
        else slot = "Night";

        const startMin = toMin(s.start);
        const endMin = toMin(s.end) <= startMin
            ? toMin(s.end) + 1440
            : toMin(s.end);

        const duration = endMin - startMin;
        const effective = duration - s.distraction;
        const productivity = (effective * s.focus) / duration;

        slotScores[slot].score += productivity;
        slotScores[slot].count++;
    });

    let bestSlot = "";
    let deadSlot = "";
    let max = -Infinity;
    let min = Infinity;

    for (const slot in slotScores) {
        if (slotScores[slot].count > 0) {
            const avg = slotScores[slot].score / slotScores[slot].count;
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

    // ---- FINAL AI OUTPUT ----
    adviceBox.innerHTML = `
        Your highest productivity is during <strong>${bestSlot}</strong>.  
        A noticeable drop in productivity is observed during <strong>${deadSlot}</strong>, 
        which is identified as your <strong>Dead Zone</strong>.
    `;

    timetableBox.innerHTML = `
        <ul style="text-align:left">
            <li><strong>${bestSlot}:</strong> Difficult subjects & problem-solving</li>
            <li>Afternoon: Revision & practice</li>
            <li><strong>${deadSlot}:</strong> Light tasks or breaks</li>
        </ul>
    `;

    tipsBox.innerHTML = `
        <ul style="text-align:left">
            <li>Study core subjects during ${bestSlot.toLowerCase()}</li>
            <li>Avoid heavy study during ${deadSlot.toLowerCase()}</li>
            <li>Track distractions honestly</li>
            <li>Use focused study cycles</li>
            <li>Maintain consistent sleep patterns</li>
        </ul>
    `;
});

function toMin(t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}