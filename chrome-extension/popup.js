// popup.js - Extension popup logic

document.addEventListener('DOMContentLoaded', () => {
    loadCurrentActivity();
    setupFocusToggle();
});

function loadCurrentActivity() {
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_ACTIVITY' }, (activity) => {
        if (activity) {
            document.getElementById('current-domain').textContent = activity.domain;
            document.getElementById('page-title').textContent = activity.title;

            const statusEl = document.getElementById('status');
            if (activity.distraction) {
                statusEl.textContent = '⚠️ DISTRACTION';
                statusEl.className = 'value distraction';
            } else {
                statusEl.textContent = '✅ PRODUCTIVE';
                statusEl.className = 'value productive';
            }
        } else {
            document.getElementById('current-domain').textContent = 'No activity yet';
            document.getElementById('status').textContent = 'Waiting...';
        }
    });
}

function setupFocusToggle() {
    const button = document.getElementById('focus-toggle');
    let focusModeActive = false;

    button.addEventListener('click', () => {
        focusModeActive = !focusModeActive;
        button.textContent = focusModeActive ? 'Disable Focus Mode' : 'Enable Focus Mode';
        button.style.background = focusModeActive ? '#ff3333' : '#00ff99';

        chrome.runtime.sendMessage({
            type: 'TOGGLE_FOCUS_MODE',
            enabled: focusModeActive
        });
    });
}
