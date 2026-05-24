// ============================================
// APP ENTRY POINT — Glue Logic
// ============================================

// ===== Initialization =====

function init() {
  const { storage, ui, workouts, exercises, charts, pdfExport } = window;

  // 1. Initialize Theme
  ui.initTheme();
  
  // 2. Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // 3. Register Service Worker (PWA)
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        console.log('SW registered:', reg.scope);
      }).catch(err => {
        console.log('SW registration failed:', err);
      });
    });
  }

  // 4. Bind Navigation Events
  bindNavigation();

  // 5. Bind Global Settings/Actions
  bindGlobalActions();

  // 6. Render Initial State
  renderAll();

  // 7. Handle Onboarding
  if (!storage.isOnboardingComplete()) {
    ui.showOnboarding();
  }

  // 8. Check for Active Session
  workouts.checkForActiveSession();

  // 9. Listen for custom events
  window.addEventListener('pagechange', (e) => {
    if (e.detail.page === 'progress') {
      renderProgressPage();
    } else if (e.detail.page === 'dashboard') {
      renderDashboard();
    }
  });

  window.addEventListener('workoutSaved', () => {
    renderDashboard();
    renderProgressPage();
  });
}

// ===== Binding Events =====

function bindNavigation() {
  const { ui, workouts } = window;

  // Sidebar
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      ui.navigateTo(item.dataset.page);
    });
  });

  // Bottom Nav
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      ui.navigateTo(item.dataset.page);
    });
  });

  // Dashboard shortcuts
  const startWorkoutBtn = document.getElementById('dashboard-start-btn');
  if (startWorkoutBtn) {
    startWorkoutBtn.addEventListener('click', () => {
      ui.navigateTo('workouts');
    });
  }

  // Workouts page shortcuts
  const createRoutineBtn = document.getElementById('create-routine-btn');
  if (createRoutineBtn) {
    createRoutineBtn.addEventListener('click', () => {
      workouts.openRoutineEditor();
    });
  }

  // Initialize Tabs
  ui.initTabs('#page-workouts');
}

function bindGlobalActions() {
  const { ui, storage, pdfExport } = window;

  // Theme Toggle
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = ui.toggleTheme();
      const settingsToggle = document.getElementById('settings-theme-toggle');
      if (settingsToggle) settingsToggle.checked = next === 'dark';
    });
  });

  // Export PDF
  const exportPdfBtn = document.getElementById('settings-export-pdf');
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', () => {
      pdfExport.exportPDF();
    });
  }

  // Export JSON
  const exportJsonBtn = document.getElementById('settings-export-json');
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      storage.exportData();
      ui.showToast('Data exported successfully', 'success');
    });
  }

  // Import JSON
  const importJsonBtn = document.getElementById('settings-import-json');
  const importFileInput = document.getElementById('settings-import-file');
  if (importJsonBtn && importFileInput) {
    importJsonBtn.addEventListener('click', () => importFileInput.click());
    
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const jsonStr = event.target.result;
        ui.showConfirm('Import Data', 'This will merge imported data with your current data. Proceed?', () => {
          if (storage.importData(jsonStr, 'merge')) {
            ui.showToast('Data imported successfully!', 'success');
            renderAll();
          } else {
            ui.showToast('Invalid backup file.', 'error');
          }
        });
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset
    });
  }

  // Clear Data
  const clearDataBtn = document.getElementById('settings-clear-data');
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
      ui.showConfirm('Clear ALL Data?', 'This action is irreversible. All your routines, history, and progress will be lost.', () => {
        storage.clearAllData();
        window.location.reload();
      }, 'Delete Everything', true);
    });
  }

  // Settings specific updates
  const settingsThemeToggle = document.getElementById('settings-theme-toggle');
  if (settingsThemeToggle) {
    const isDark = (localStorage.getItem('workout-tracker-theme') || 'dark') === 'dark';
    settingsThemeToggle.checked = isDark;
    settingsThemeToggle.addEventListener('change', () => {
      ui.toggleTheme();
    });
  }

  const restToggle = document.getElementById('settings-rest-toggle');
  if (restToggle) {
    restToggle.checked = storage.getSettings().enableRestTimer !== false;
    restToggle.addEventListener('change', (e) => {
      storage.updateSettings({ enableRestTimer: e.target.checked });
      ui.showToast('Settings updated', 'success');
    });
  }

  const weightUnitSelect = document.getElementById('settings-weight-unit');
  if (weightUnitSelect) {
    weightUnitSelect.value = storage.getSettings().units || 'metric';
    weightUnitSelect.addEventListener('change', (e) => {
      storage.updateSettings({ units: e.target.value });
      ui.showToast('Settings updated', 'success');
      renderProgressPage(); // Update charts that use unit
    });
  }

  const restTimerInput = document.getElementById('settings-rest-timer');
  if (restTimerInput) {
    restTimerInput.value = storage.getSettings().defaultRest || 60;
    restTimerInput.addEventListener('change', (e) => {
      storage.updateSettings({ defaultRest: parseInt(e.target.value) || 60 });
      ui.showToast('Settings updated', 'success');
    });
  }

  // Add Custom Exercise bindings (already handled in exercises.js, but need the modal trigger)
  const addCustomBtn = document.getElementById('add-custom-exercise-btn');
  if (addCustomBtn) {
    addCustomBtn.addEventListener('click', () => {
      ui.openModal('custom-exercise-modal');
    });
  }
}

// ===== Rendering Pages =====

function renderAll() {
  const { workouts, exercises } = window;
  
  renderDashboard();
  workouts.renderRoutines();
  exercises.renderExerciseLibrary();
  renderProgressPage();
}

function renderDashboard() {
  const { workouts, ui, charts, storage } = window;

  // Stats
  document.getElementById('stat-total-workouts').textContent = workouts.getTotalWorkouts();
  document.getElementById('stat-week-sessions').textContent = workouts.getThisWeekSessions();
  document.getElementById('stat-current-streak').textContent = workouts.calculateStreak();
  document.getElementById('stat-prs-month').textContent = workouts.getPRsThisMonth();

  // Streak Badge
  const streak = workouts.calculateStreak();
  const streakBadge = document.getElementById('streak-badge');
  if (streakBadge) {
    streakBadge.textContent = `🔥 ${streak} Day Streak`;
    if (streak > 0) {
      streakBadge.style.display = 'inline-flex';
    } else {
      streakBadge.style.display = 'none';
    }
  }

  // Recent Activity
  const recentFeed = document.getElementById('recent-activity');
  if (recentFeed) {
    const recent = workouts.getRecentSessions(5);
    if (recent.length === 0) {
      recentFeed.innerHTML = '<p class="text-secondary text-sm" style="padding:var(--space-lg);">No activity yet. Complete a workout to see it here!</p>';
    } else {
      recentFeed.innerHTML = recent.map(s => `
        <div class="activity-item">
          <div class="activity-dot"></div>
          <div class="activity-date">${ui.timeAgo(s.date)}</div>
          <div class="activity-title">${s.routineName || 'Custom Workout'}</div>
          <div class="activity-meta">
            ${ui.formatDuration(s.duration || 0)} · ${s.exercises.length} Exercises
            ${s.prs && s.prs.length > 0 ? `<span style="color:var(--color-coral);margin-left:8px;">🏆 ${s.prs.length} PRs</span>` : ''}
          </div>
        </div>
      `).join('');
    }
  }

  // Heatmap
  renderHeatmap();

  // Mini Radar
  setTimeout(() => {
    charts.renderMiniRadar('mini-radar-chart');
  }, 100);
}

function renderHeatmap() {
  const container = document.getElementById('heatmap-container');
  if (!container) return;

  const { storage, ui } = window;
  const sessions = storage.getSessions();
  const sessionDates = sessions.map(s => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  const weeks = 12;
  const days = weeks * 7;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - days + today.getDay() + 1);

  let html = '<div class="heatmap-grid">';
  
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const currentDate = new Date(startDay);
      currentDate.setDate(startDay.getDate() + (w * 7) + d);
      
      const isFuture = currentDate > today;
      let level = 0;
      let title = currentDate.toDateString();
      
      if (!isFuture) {
        const t = currentDate.getTime();
        const count = sessionDates.filter(time => time === t).length;
        
        if (count > 0) {
          level = count > 3 ? 4 : count;
          
          const daySessions = sessions.filter(s => {
            const sd = new Date(s.date);
            sd.setHours(0,0,0,0);
            return sd.getTime() === t;
          });
          
          if (daySessions.length > 0) {
            title = `${ui.formatDate(currentDate.toISOString())} — ${daySessions.map(s => s.routineName).join(', ')}`;
          }
        }
      }
      
      html += `
        <div class="heatmap-cell level-${level}" ${isFuture ? 'style="opacity:0.2;"' : ''}>
          ${!isFuture ? `<div class="heatmap-tooltip">${title}</div>` : ''}
        </div>
      `;
    }
  }
  
  html += '</div>';
  container.innerHTML = html;
}

function renderProgressPage() {
  const { charts, workouts, storage, ui } = window;
  if (!document.getElementById('page-progress')) return;

  charts.renderConsistencyChart('consistency-chart', '3M');
  charts.renderDurationChart('duration-chart', '3M');
  
  document.getElementById('progress-current-streak').textContent = workouts.calculateStreak();
  document.getElementById('progress-longest-streak').textContent = workouts.calculateLongestStreak();
  document.getElementById('progress-total-workouts').textContent = workouts.getTotalWorkouts();
  
  const totalSeconds = storage.getSessions().reduce((sum, s) => sum + (s.duration || 0), 0);
  document.getElementById('progress-total-time').textContent = ui.formatDuration(totalSeconds);

  charts.renderRadarChart('radar-chart', '1M');

  document.querySelectorAll('#radar-range-tabs .time-range-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#radar-range-tabs .time-range-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      charts.renderRadarChart('radar-chart', btn.dataset.range);
    };
  });

  setupBodyProgress();
  charts.renderBodyWeightChart('body-weight-chart');
  
  renderPRTracker();
  setupStrengthProgress();
}

function setupStrengthProgress() {
  const { charts, ui, storage } = window;
  const select = document.getElementById('progress-exercise-select');
  if (!select) return;

  const loggedExercises = charts.getLoggedExercises();
  
  if (loggedExercises.length === 0) {
    select.innerHTML = '<option value="">No data available</option>';
    select.disabled = true;
    return;
  }
  
  select.disabled = false;
  const currentVal = select.value;
  
  select.innerHTML = `
    <option value="">Select Exercise ▼</option>
    ${loggedExercises.map(ex => `<option value="${ex.id}">${ex.name}</option>`).join('')}
  `;
  
  if (currentVal && loggedExercises.some(e => e.id === currentVal)) {
    select.value = currentVal;
  } else if (loggedExercises.length > 0) {
    select.value = loggedExercises[0].id;
  }

  let currentRange = '1M';
  let currentMetric = 'weight';

  function updateStrengthView() {
    const exerciseId = select.value;
    if (exerciseId) {
      charts.renderStrengthChart('strength-chart', exerciseId, currentRange, currentMetric);
      updatePRHistoryTable(exerciseId);
    }
  }

  select.addEventListener('change', updateStrengthView);

  document.querySelectorAll('#strength-range-tabs .time-range-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#strength-range-tabs .time-range-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRange = btn.dataset.range;
      updateStrengthView();
    };
  });

  document.querySelectorAll('.metric-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.metric-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMetric = btn.dataset.metric;
      updateStrengthView();
    };
  });

  if (select.value) updateStrengthView();
}

function updatePRHistoryTable(exerciseId) {
  const { charts, storage, ui } = window;
  const tbody = document.getElementById('pr-history-body');
  if (!tbody) return;

  const history = charts.getPRHistory(exerciseId);
  const unit = storage.getSettings().units === 'metric' ? 'kg' : 'lbs';

  if (history.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-tertiary);padding:var(--space-2xl);">No history for this exercise.</td></tr>';
    return;
  }

  tbody.innerHTML = history.reverse().map(entry => `
    <tr class="${entry.isPR ? 'pr-row' : ''}">
      <td class="text-xs">${ui.formatDate(entry.date)}</td>
      <td class="mono">${entry.reps}</td>
      <td class="mono">${entry.weight} <span class="text-xs text-secondary">${unit}</span></td>
      <td class="mono">${entry.volume}</td>
    </tr>
  `).join('');
}

function renderPRTracker() {
  const { charts, storage, ui } = window;
  const grid = document.getElementById('pr-grid');
  const sortSelect = document.getElementById('pr-sort-select');
  if (!grid || !sortSelect) return;

  let prData = charts.getPRData();
  const unit = storage.getSettings().units === 'metric' ? 'kg' : 'lbs';

  if (prData.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><p class="text-secondary text-sm">No PRs recorded yet.</p></div>';
    return;
  }

  function renderGrid() {
    const sort = sortSelect.value;
    if (sort === 'recent') {
      prData.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sort === 'name') {
      prData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'category') {
      prData.sort((a, b) => a.muscleGroup.localeCompare(b.muscleGroup));
    }

    grid.innerHTML = prData.map(pr => `
      <div class="pr-card ${pr.isRecent ? 'new-pr' : ''}">
        <div class="pr-card-name">${pr.name}</div>
        <div class="pr-card-stats">
          <div class="pr-card-stat">
            <span class="label">Best Weight</span>
            <span class="value">${pr.bestWeight} <span style="font-size:var(--text-xs);color:var(--text-secondary);font-weight:normal;">${unit}</span></span>
          </div>
          <div class="pr-card-stat">
            <span class="label">Best Reps</span>
            <span class="value">${pr.bestReps}</span>
          </div>
        </div>
        <div class="flex items-center justify-between mt-md">
          <div class="pr-card-date">${ui.timeAgo(pr.date)}</div>
          ${pr.isRecent ? '<span class="badge badge-pr">🏆 Recent PR</span>' : ''}
        </div>
      </div>
    `).join('');
  }

  sortSelect.addEventListener('change', renderGrid);
  renderGrid();
}

function setupBodyProgress() {
  const { storage, ui, charts } = window;
  const form = document.getElementById('body-progress-form');
  if (!form) return;

  document.getElementById('bp-date').value = new Date().toISOString().split('T')[0];

  const settings = storage.getSettings();
  const weightUnit = settings.units === 'metric' ? 'kg' : 'lbs';
  const lenUnit = settings.units === 'metric' ? 'cm' : 'in';

  document.getElementById('bp-weight').placeholder = weightUnit;
  ['bp-chest', 'bp-waist', 'bp-hips', 'bp-arms', 'bp-thighs'].forEach(id => {
    document.getElementById(id).placeholder = lenUnit;
  });

  form.onsubmit = (e) => {
    e.preventDefault();
    
    const date = document.getElementById('bp-date').value;
    const weight = parseFloat(document.getElementById('bp-weight').value);
    
    if (!date || isNaN(weight)) {
      ui.showToast('Date and Weight are required', 'warning');
      return;
    }

    const entry = {
      id: storage.generateId(),
      date: new Date(date).toISOString(),
      weight,
      bodyFat: parseFloat(document.getElementById('bp-bodyfat').value) || null,
      bmi: parseFloat(document.getElementById('bp-bmi').value) || null,
      notes: document.getElementById('bp-notes').value || '',
      measurements: {
        chest: parseFloat(document.getElementById('bp-chest').value) || null,
        waist: parseFloat(document.getElementById('bp-waist').value) || null,
        hips: parseFloat(document.getElementById('bp-hips').value) || null,
        arms: parseFloat(document.getElementById('bp-arms').value) || null,
        thighs: parseFloat(document.getElementById('bp-thighs').value) || null
      }
    };

    storage.saveBodyEntry(entry);
    ui.showToast('Measurement saved!', 'success');
    form.reset();
    document.getElementById('bp-date').value = new Date().toISOString().split('T')[0];
    
    charts.renderBodyWeightChart('body-weight-chart');
    updateBodyProgressSummary();
  };

  updateBodyProgressSummary();
}

function updateBodyProgressSummary() {
  const { storage } = window;
  const container = document.getElementById('body-progress-summary');
  if (!container) return;

  const progress = storage.getBodyProgress();
  if (progress.length < 2) {
    if (progress.length === 1) {
      container.innerHTML = '<p class="text-secondary text-sm">Add one more measurement to see your change.</p>';
    }
    return;
  }

  const first = progress[0];
  const last = progress[progress.length - 1];
  const diff = last.weight - first.weight;
  
  const unit = storage.getSettings().units === 'metric' ? 'kg' : 'lbs';
  const isLoss = diff < 0;
  const color = isLoss ? 'var(--color-success)' : 'var(--color-coral)';
  
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:var(--space-md);">
      <div class="flex items-center justify-between">
        <span class="text-secondary text-sm">Starting Weight</span>
        <span class="font-mono font-bold">${first.weight} <span class="text-xs font-normal">${unit}</span></span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-secondary text-sm">Current Weight</span>
        <span class="font-mono font-bold">${last.weight} <span class="text-xs font-normal">${unit}</span></span>
      </div>
      <div class="flex items-center justify-between pt-md" style="border-top:1px solid var(--border-color);">
        <span class="font-semibold">Total Change</span>
        <span class="font-mono font-bold" style="color:${color};font-size:var(--text-lg);">
          ${diff > 0 ? '+' : ''}${diff.toFixed(1)} <span class="text-xs font-normal">${unit}</span>
        </span>
      </div>
    </div>
  `;
}

// ===== Start App =====

document.addEventListener('DOMContentLoaded', init);
