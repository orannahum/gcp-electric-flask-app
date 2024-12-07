let lastSubmitTime = 0;

function updateButton() {
    const submitBtn = document.getElementById('submitBtn');
    const cooldownMsg = document.getElementById('cooldownMessage');
    const now = Date.now() / 1000;
    const elapsed = now - lastSubmitTime;
    
    if (lastSubmitTime && elapsed < 10) {
        const remaining = Math.ceil(10 - elapsed);
        submitBtn.disabled = true;
        cooldownMsg.style.display = 'block';
        cooldownMsg.textContent = `נא להמתין ${remaining} שניות לפני בקשה נוספת`;
    } else {
        submitBtn.disabled = false;
        cooldownMsg.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('uploadForm').addEventListener('submit', function() {
        lastSubmitTime = Date.now() / 1000;
        localStorage.setItem('lastSubmitTime', lastSubmitTime);
    });

    const storedTime = localStorage.getItem('lastSubmitTime');
    if (storedTime) {
        lastSubmitTime = parseFloat(storedTime);
    }

    updateButton();
    setInterval(updateButton, 1000);
});