// ============================================
// UI MODULE — DOM Helpers, Toasts, Modals
// ============================================

// ===== Toast Notifications =====

let toastContainer = null;

function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

function showToast(message, type = 'info', duration = 3000) {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: 'check-circle',
    error: 'alert-circle',
    info: 'info',
    warning: 'alert-triangle'
  };

  toast.innerHTML = `
    <i data-lucide="${icons[type] || 'info'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Initialize Lucide icons in the new toast
  if (window.lucide) lucide.createIcons({ nodes: [toast] });

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ===== Modal Management =====

function openModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay.active').forEach(m => {
    m.classList.remove('active');
  });
  document.body.style.overflow = '';
}

// ===== Confirmation Dialog =====

function showConfirm(title, message, onConfirm, confirmText = 'Confirm', isDanger = false) {
  let overlay = document.getElementById('confirm-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'confirm-modal-overlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="modal confirm-modal" style="max-width: 420px;">
      <div class="modal-body">
        <div class="confirm-icon">${isDanger ? '⚠️' : '❓'}</div>
        <h3 class="modal-title" style="text-align:center;">${title}</h3>
        <p class="confirm-text">${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="confirm-cancel">Cancel</button>
        <button class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" id="confirm-ok">${confirmText}</button>
      </div>
    </div>
  `;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  document.getElementById('confirm-cancel').onclick = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  document.getElementById('confirm-ok').onclick = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    if (onConfirm) onConfirm();
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };
}

// ===== Page Navigation =====

let currentPage = 'dashboard';

function navigateTo(page) {
  currentPage = page;

  // Update page views
  document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) target.classList.add('active');

  // Update sidebar nav
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // Update bottom nav
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // Dispatch custom event for page change handlers
  window.dispatchEvent(new CustomEvent('pagechange', { detail: { page } }));
}

function getCurrentPage() {
  return currentPage;
}

// ===== Tab Management =====

function initTabs(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const tabs = container.querySelectorAll('.tab-btn');
  const contents = container.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}

// ===== Theme Toggle =====

function initTheme() {
  const saved = localStorage.getItem('workout-tracker-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('workout-tracker-theme', next);
  updateThemeIcon(next);
  return next;
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    const icon = btn.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
      if (window.lucide) lucide.createIcons({ nodes: [btn] });
    }
  }
  const sidebarBtn = document.getElementById('sidebar-theme-toggle');
  if (sidebarBtn) {
    const icon = sidebarBtn.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
      if (window.lucide) lucide.createIcons({ nodes: [sidebarBtn] });
    }
  }
}

// ===== DOM Helpers =====

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function createElement(tag, className, innerHTML) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatTimerDisplay(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
}

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ===== Onboarding =====

function showOnboarding() {
  const steps = [
    { target: '.sidebar-nav-item[data-page="workouts"]', text: '💪 Start by creating a workout routine here!', position: 'right' },
    { target: '.sidebar-nav-item[data-page="library"]', text: '📚 Browse exercises in the library to add to your routines.', position: 'right' },
    { target: '.sidebar-nav-item[data-page="progress"]', text: '📊 Track your progress and PRs over time here.', position: 'right' }
  ];

  let currentStep = 0;

  function showStep(idx) {
    // Remove previous tooltip
    document.querySelectorAll('.onboarding-tooltip').forEach(t => t.remove());

    if (idx >= steps.length) {
      if (window.storage && window.storage.completeOnboarding) window.storage.completeOnboarding();
      return;
    }

    const step = steps[idx];
    const target = document.querySelector(step.target);
    if (!target) { showStep(idx + 1); return; }

    const rect = target.getBoundingClientRect();
    const tooltip = document.createElement('div');
    tooltip.className = 'onboarding-tooltip';
    tooltip.style.top = `${rect.top + window.scrollY - 10}px`;
    tooltip.style.left = `${rect.right + 16}px`;

    tooltip.innerHTML = `
      <div class="onboarding-tooltip-text">${step.text}</div>
      <div class="onboarding-tooltip-actions">
        <button class="btn btn-ghost btn-sm" id="onboarding-skip">Skip</button>
        <button class="btn btn-primary btn-sm" id="onboarding-next">${idx < steps.length - 1 ? 'Next' : 'Got it!'}</button>
      </div>
    `;

    document.body.appendChild(tooltip);

    document.getElementById('onboarding-skip').onclick = () => {
      tooltip.remove();
      if (window.storage && window.storage.completeOnboarding) window.storage.completeOnboarding();
    };

    document.getElementById('onboarding-next').onclick = () => {
      tooltip.remove();
      showStep(idx + 1);
    };
  }

  // Delay to let the page render
  setTimeout(() => showStep(0), 800);
}

// ===== Confetti Effect =====

function fireConfetti() {
  if (window.confetti) {
    window.confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D174D2', '#E0563F', '#3F567F', '#FBBF24', '#34D399']
    });
  }
}

// ===== Web Audio Beep =====

let audioContext = null;

function playBeep(frequency = 800, duration = 0.2) {
  try {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = frequency;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + duration);
  } catch (e) {
    // Audio not available
  }
}

// ===== Refresh Lucide Icons =====

function refreshIcons(root = document) {
  if (window.lucide) {
    lucide.createIcons({ nodes: root === document ? undefined : [root] });
  }
}

// Expose to global namespace
window.ui = {
  showToast,
  openModal,
  closeModal,
  closeAllModals,
  showConfirm,
  navigateTo,
  getCurrentPage,
  initTabs,
  initTheme,
  toggleTheme,
  $,
  $$,
  createElement,
  formatDate,
  formatDateShort,
  formatDuration,
  formatTimerDisplay,
  timeAgo,
  debounce,
  showOnboarding,
  fireConfetti,
  playBeep,
  refreshIcons
};
