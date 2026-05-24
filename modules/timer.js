// ============================================
// TIMER MODULE — Rest Timer Logic
// ============================================

let timerInterval = null;
let timerRemaining = 0;
let timerTotal = 0;
let timerCallback = null;

function startRestTimer(seconds, onTick, onComplete) {
  stopRestTimer();
  timerTotal = seconds;
  timerRemaining = seconds;
  timerCallback = onComplete;

  // Show overlay
  const overlay = document.getElementById('rest-timer-overlay');
  if (overlay) overlay.classList.add('active');

  updateTimerDisplay();
  if (onTick) onTick(timerRemaining, timerTotal);

  timerInterval = setInterval(() => {
    timerRemaining--;
    updateTimerDisplay();
    if (onTick) onTick(timerRemaining, timerTotal);

    if (timerRemaining <= 0) {
      stopRestTimer();
      if (timerCallback) timerCallback();
    }
  }, 1000);
}

function stopRestTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  const overlay = document.getElementById('rest-timer-overlay');
  if (overlay) overlay.classList.remove('active');
}

function skipRestTimer() {
  stopRestTimer();
  if (timerCallback) timerCallback();
}

function getTimerState() {
  return {
    remaining: timerRemaining,
    total: timerTotal,
    running: timerInterval !== null
  };
}

function updateTimerDisplay() {
  const timeEl = document.getElementById('rest-timer-time');
  const progressEl = document.getElementById('rest-timer-progress');

  if (timeEl) {
    const m = Math.floor(timerRemaining / 60);
    const s = timerRemaining % 60;
    timeEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  if (progressEl) {
    const circumference = 2 * Math.PI * 90;
    const offset = circumference * (1 - timerRemaining / timerTotal);
    progressEl.style.strokeDasharray = circumference;
    progressEl.style.strokeDashoffset = offset;
  }
}

// ===== Workout Elapsed Timer =====

let elapsedInterval = null;
let elapsedSeconds = 0;
let elapsedStartTime = null;

function startElapsedTimer(onTick) {
  stopElapsedTimer();
  elapsedStartTime = Date.now();
  elapsedSeconds = 0;

  elapsedInterval = setInterval(() => {
    elapsedSeconds = Math.floor((Date.now() - elapsedStartTime) / 1000);
    if (onTick) onTick(elapsedSeconds);
  }, 1000);
}

function stopElapsedTimer() {
  if (elapsedInterval) {
    clearInterval(elapsedInterval);
    elapsedInterval = null;
  }
}

function getElapsedSeconds() {
  if (elapsedStartTime) {
    return Math.floor((Date.now() - elapsedStartTime) / 1000);
  }
  return elapsedSeconds;
}

function resumeElapsedTimer(startedAt, onTick) {
  stopElapsedTimer();
  elapsedStartTime = startedAt;
  elapsedSeconds = Math.floor((Date.now() - elapsedStartTime) / 1000);

  elapsedInterval = setInterval(() => {
    elapsedSeconds = Math.floor((Date.now() - elapsedStartTime) / 1000);
    if (onTick) onTick(elapsedSeconds);
  }, 1000);
}

// Expose to global namespace
window.timer = {
  startRestTimer,
  stopRestTimer,
  skipRestTimer,
  getTimerState,
  startElapsedTimer,
  stopElapsedTimer,
  getElapsedSeconds,
  resumeElapsedTimer
};

document.addEventListener('DOMContentLoaded', () => {
  const skipBtn = document.getElementById('skip-rest-btn');
  if (skipBtn) skipBtn.addEventListener('click', skipRestTimer);

  const addBtn = document.getElementById('add-rest-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      timerRemaining += 15;
      timerTotal += 15;
      updateTimerDisplay();
    });
  }
});
