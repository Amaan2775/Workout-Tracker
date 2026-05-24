// ============================================
// WORKOUTS MODULE — Workout CRUD & Session Logic
// ============================================

let activeSessionData = null;
let elapsedTimerRef = null;

// ===== Routines =====

function renderRoutines() {
  const grid = document.getElementById('routines-grid');
  if (!grid) return;

  const { getRoutines, deleteRoutine } = window.storage;
  const routines = getRoutines();

  if (routines.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">🏋️</div>
        <h3 class="empty-state-title">No routines yet</h3>
        <p class="empty-state-text">Create your first workout routine to get started!</p>
        <button class="btn btn-primary" id="empty-create-routine">
          <i data-lucide="plus"></i> Create Routine
        </button>
      </div>
    `;
    const emptyBtn = document.getElementById('empty-create-routine');
    if (emptyBtn) emptyBtn.addEventListener('click', () => openRoutineEditor());
    window.ui.refreshIcons(grid);
    return;
  }

  grid.innerHTML = routines.map(routine => {
    const exerciseCount = routine.exercises ? routine.exercises.length : 0;
    const totalSets = routine.exercises ? routine.exercises.reduce((sum, e) => sum + (e.sets || 0), 0) : 0;
    const estDuration = totalSets * 1.5; // rough estimate in minutes

    return `
      <div class="routine-card" data-routine-id="${routine.id}">
        <div class="routine-card-header">
          <div>
            <div class="routine-card-title">${routine.name}</div>
            <span class="badge badge-purple mt-sm">${routine.category}</span>
          </div>
        </div>
        <div class="routine-card-body">
          <div class="routine-card-stat">
            <i data-lucide="dumbbell"></i>
            <span>${exerciseCount}</span> exercises
          </div>
          <div class="routine-card-stat">
            <i data-lucide="layers"></i>
            <span>${totalSets}</span> total sets
          </div>
          <div class="routine-card-stat">
            <i data-lucide="clock"></i>
            ~<span>${Math.round(estDuration)}</span> min
          </div>
        </div>
        <div class="routine-card-footer">
          <button class="btn btn-primary btn-sm start-routine-btn" data-id="${routine.id}">
            <i data-lucide="play"></i> Start
          </button>
          <button class="btn btn-ghost btn-sm edit-routine-btn" data-id="${routine.id}">
            <i data-lucide="pencil"></i>
          </button>
          <button class="btn btn-ghost btn-sm copy-routine-btn" data-id="${routine.id}">
            <i data-lucide="copy"></i>
          </button>
          <button class="btn btn-ghost btn-sm delete-routine-btn" data-id="${routine.id}">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Bind buttons
  grid.querySelectorAll('.start-routine-btn').forEach(btn => {
    btn.addEventListener('click', () => startWorkoutSession(btn.dataset.id));
  });
  grid.querySelectorAll('.edit-routine-btn').forEach(btn => {
    btn.addEventListener('click', () => openRoutineEditor(btn.dataset.id));
  });
  grid.querySelectorAll('.copy-routine-btn').forEach(btn => {
    btn.addEventListener('click', () => copyRoutine(btn.dataset.id));
  });
  grid.querySelectorAll('.delete-routine-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.ui.showConfirm('Delete Routine', 'Are you sure you want to delete this routine? This cannot be undone.', () => {
        deleteRoutine(btn.dataset.id);
        renderRoutines();
        window.ui.showToast('Routine deleted', 'success');
      }, 'Delete', true);
    });
  });

  window.ui.refreshIcons(grid);
}

function copyRoutine(id) {
  const routine = window.storage.getRoutineById(id);
  if (!routine) return;
  const copy = {
    ...routine,
    id: window.storage.generateId(),
    name: routine.name + ' (Copy)',
    createdAt: new Date().toISOString()
  };
  window.storage.saveRoutine(copy);
  renderRoutines();
  window.ui.showToast('Routine copied!', 'success');
}

// ===== Routine Editor =====

let editorExercises = [];

function openRoutineEditor(routineId = null) {
  const { CATEGORIES, getExerciseById, MUSCLE_GROUP_EMOJIS, MUSCLE_GROUP_COLORS } = window.exerciseLibrary;
  
  const routine = routineId ? window.storage.getRoutineById(routineId) : null;

  editorExercises = routine ? JSON.parse(JSON.stringify(routine.exercises)) : [];

  const modal = document.getElementById('routine-editor-modal');
  if (!modal) return;

  const body = modal.querySelector('.modal-body');
  const title = modal.querySelector('.modal-title');
  title.textContent = routine ? 'Edit Routine' : 'Create Routine';

  function renderEditor() {
    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Routine Name</label>
        <input type="text" class="form-input" id="routine-name-input" value="${routine ? routine.name : ''}" placeholder="e.g. Push Day A">
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-select" id="routine-category-select">
          ${CATEGORIES.map(c => `<option value="${c}" ${routine && routine.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>

      <div class="form-label mb-md" style="display:flex;align-items:center;justify-content:space-between;">
        <span>Exercises (${editorExercises.length})</span>
        <button class="btn btn-primary btn-sm" id="editor-add-exercise">
          <i data-lucide="plus"></i> Add Exercise
        </button>
      </div>

      <div id="editor-exercise-list" style="display:flex;flex-direction:column;gap:var(--space-md);margin-bottom:var(--space-xl);max-height:360px;overflow-y:auto;">
        ${editorExercises.length === 0 ? `
          <div class="empty-state" style="padding:var(--space-2xl);">
            <div class="empty-state-icon">📋</div>
            <p class="text-secondary text-sm">Add exercises to your routine</p>
          </div>
        ` : editorExercises.map((exSlot, idx) => {
          const ex = getExerciseById(exSlot.exerciseId);
          if (!ex) return '';
          return `
            <div class="card-static" style="padding:var(--space-lg);" data-idx="${idx}">
              <div class="flex items-center justify-between mb-md">
                <div class="flex items-center gap-md">
                  <span class="drag-handle" draggable="true" data-idx="${idx}">
                    <i data-lucide="grip-vertical"></i>
                  </span>
                  <span style="font-size:1.1rem;">${MUSCLE_GROUP_EMOJIS[ex.muscleGroup] || '💪'}</span>
                  <strong style="font-family:var(--font-display);">${ex.name}</strong>
                  <span class="badge badge-${MUSCLE_GROUP_COLORS[ex.muscleGroup] || 'purple'} text-xs">${ex.muscleGroup}</span>
                </div>
                <button class="btn btn-ghost btn-sm remove-exercise-btn" data-idx="${idx}">
                  <i data-lucide="x"></i>
                </button>
              </div>

              <div class="flex gap-md items-center" style="flex-wrap:wrap;">
                <div class="flex items-center gap-sm">
                  <label class="text-xs text-secondary">Type:</label>
                  <label class="toggle" style="width:36px;height:20px;">
                    <input type="checkbox" class="time-toggle" data-idx="${idx}" ${exSlot.duration !== null ? 'checked' : ''}>
                    <span class="toggle-slider" style="--toggle-size:14px;" title="${exSlot.duration !== null ? 'Time-based' : 'Rep-based'}"></span>
                  </label>
                  <span class="text-xs text-secondary">${exSlot.duration !== null ? '⏱ Time' : '🔁 Reps'}</span>
                </div>
                <div class="flex items-center gap-sm">
                  <label class="text-xs text-secondary">Sets:</label>
                  <input type="number" class="form-input number-input form-input-sm" value="${exSlot.sets}" min="1" max="20" data-field="sets" data-idx="${idx}">
                </div>
                ${exSlot.duration !== null ? `
                  <div class="flex items-center gap-sm">
                    <label class="text-xs text-secondary">Seconds:</label>
                    <input type="number" class="form-input number-input form-input-sm" value="${exSlot.duration || 30}" min="5" max="600" data-field="duration" data-idx="${idx}">
                  </div>
                ` : `
                  <div class="flex items-center gap-sm">
                    <label class="text-xs text-secondary">Reps:</label>
                    <input type="number" class="form-input number-input form-input-sm" value="${exSlot.reps}" min="1" max="100" data-field="reps" data-idx="${idx}">
                  </div>
                `}
                <div class="flex items-center gap-sm">
                  <label class="text-xs text-secondary">Rest:</label>
                  <input type="number" class="form-input number-input form-input-sm" value="${exSlot.rest}" min="0" max="300" data-field="rest" data-idx="${idx}"> <span class="text-xs text-secondary">s</span>
                </div>
              </div>

              <div class="mt-sm">
                <input type="text" class="form-input form-input-sm w-full" placeholder="Notes (optional)" value="${exSlot.notes || ''}" data-field="notes" data-idx="${idx}">
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="flex gap-md justify-between">
        <button class="btn btn-secondary" id="editor-cancel">Cancel</button>
        <button class="btn btn-primary" id="editor-save">
          <i data-lucide="check"></i> ${routine ? 'Save Changes' : 'Create Routine'}
        </button>
      </div>
    `;

    // Bind add exercise
    body.querySelector('#editor-add-exercise').addEventListener('click', () => {
      window.exercises.openExercisePicker((exerciseId) => {
        const ex = getExerciseById(exerciseId);
        editorExercises.push({
          exerciseId: exerciseId,
          sets: 1,
          reps: ex.timeBased ? null : 12,
          duration: ex.timeBased ? 30 : null,
          rest: window.storage.getSettings().defaultRest,
          notes: ''
        });
        renderEditor();
      });
    });

    // Bind remove exercise
    body.querySelectorAll('.remove-exercise-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        editorExercises.splice(parseInt(btn.dataset.idx), 1);
        renderEditor();
      });
    });

    // Bind number inputs
    body.querySelectorAll('input[data-field]').forEach(input => {
      input.addEventListener('change', () => {
        const idx = parseInt(input.dataset.idx);
        const field = input.dataset.field;
        if (field === 'notes') {
          editorExercises[idx][field] = input.value;
        } else {
          editorExercises[idx][field] = parseInt(input.value) || 0;
        }
      });
    });

    // Bind time toggle
    body.querySelectorAll('.time-toggle').forEach(toggle => {
      toggle.addEventListener('change', () => {
        const idx = parseInt(toggle.dataset.idx);
        if (toggle.checked) {
          editorExercises[idx].duration = 30;
          editorExercises[idx].reps = null;
        } else {
          editorExercises[idx].duration = null;
          editorExercises[idx].reps = 12;
        }
        renderEditor();
      });
    });

    // Bind cancel
    body.querySelector('#editor-cancel').addEventListener('click', () => {
      window.ui.closeModal('routine-editor-modal');
    });

    // Bind save
    body.querySelector('#editor-save').addEventListener('click', () => {
      const name = body.querySelector('#routine-name-input').value.trim();
      const category = body.querySelector('#routine-category-select').value;

      if (!name) {
        window.ui.showToast('Please enter a routine name', 'warning');
        return;
      }

      const routineData = {
        id: routine ? routine.id : window.storage.generateId(),
        name,
        category,
        exercises: editorExercises,
        createdAt: routine ? routine.createdAt : new Date().toISOString()
      };

      window.storage.saveRoutine(routineData);
      window.ui.closeModal('routine-editor-modal');
      renderRoutines();
      window.ui.showToast(routine ? 'Routine updated!' : 'Routine created!', 'success');
    });

    // Drag and drop reorder
    const dragHandles = body.querySelectorAll('.drag-handle');
    dragHandles.forEach(handle => {
      handle.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', handle.dataset.idx);
        handle.closest('.card-static').classList.add('dragging');
      });
      handle.addEventListener('dragend', () => {
        body.querySelectorAll('.card-static').forEach(c => c.classList.remove('dragging'));
      });
    });

    const exerciseCards = body.querySelectorAll('.card-static[data-idx]');
    exerciseCards.forEach(card => {
      card.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
        const toIdx = parseInt(card.dataset.idx);
        if (fromIdx !== toIdx) {
          const [moved] = editorExercises.splice(fromIdx, 1);
          editorExercises.splice(toIdx, 0, moved);
          renderEditor();
        }
      });
    });

    window.ui.refreshIcons(body);
  }

  renderEditor();
  window.ui.openModal('routine-editor-modal');
}

// ===== Workout Session =====

function startWorkoutSession(routineId) {
  const routine = window.storage.getRoutineById(routineId);
  if (!routine) { window.ui.showToast('Routine not found', 'error'); return; }

  // Check for active session
  const existing = window.storage.getActiveSession();
  if (existing) {
    window.ui.showConfirm('Active Workout', 'You have an active workout in progress. Discard it and start a new one?', () => {
      window.storage.clearActiveSession();
      beginSession(routine);
    }, 'Discard & Start', true);
    return;
  }

  beginSession(routine);
}

function beginSession(routine) {
  const { getExerciseById } = window.exerciseLibrary;
  // Build session data with previous data lookup
  const sessions = window.storage.getSessions();

  activeSessionData = {
    id: window.storage.generateId(),
    routineId: routine.id,
    routineName: routine.name,
    category: routine.category,
    date: new Date().toISOString(),
    startedAt: Date.now(),
    duration: 0,
    exercises: routine.exercises.map(exSlot => {
      const ex = getExerciseById(exSlot.exerciseId);

      // Look up previous session data
      let previousSets = null;
      for (let i = sessions.length - 1; i >= 0; i--) {
        const s = sessions[i];
        const prevEx = s.exercises.find(e => e.exerciseId === exSlot.exerciseId);
        if (prevEx) {
          previousSets = prevEx.sets;
          break;
        }
      }

      return {
        exerciseId: exSlot.exerciseId,
        name: ex ? ex.name : 'Unknown',
        muscleGroup: ex ? ex.muscleGroup : '',
        timeBased: ex ? ex.timeBased : false,
        targetSets: exSlot.sets,
        targetReps: exSlot.reps,
        targetDuration: exSlot.duration,
        rest: exSlot.rest,
        previousSets,
        sets: Array.from({ length: exSlot.sets }, (_, i) => ({
          reps: exSlot.reps || 0,
          weight: 0,
          duration: exSlot.duration || 0,
          completed: false
        }))
      };
    }),
    notes: '',
    prs: []
  };

  window.storage.saveActiveSession(activeSessionData);

  // Switch to active session view
  document.getElementById('workout-routines-tab').classList.remove('active');
  document.getElementById('workout-session-tab').classList.add('active');
  document.querySelectorAll('#page-workouts .tab-btn').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === 'workout-session-tab');
  });

  renderActiveSession();

  // Start elapsed timer
  window.timer.startElapsedTimer((elapsed) => {
    const timerEl = document.getElementById('session-elapsed-timer');
    if (timerEl) timerEl.textContent = window.ui.formatTimerDisplay(elapsed);
  });
}

function renderActiveSession() {
  if (!activeSessionData) {
    activeSessionData = window.storage.getActiveSession();
  }

  const container = document.getElementById('session-content');
  if (!container) return;

  if (!activeSessionData) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏃</div>
        <h3 class="empty-state-title">No active workout</h3>
        <p class="empty-state-text">Start a workout from the Routines tab to begin logging!</p>
      </div>
    `;
    return;
  }

  const settings = window.storage.getSettings();
  const weightUnit = settings.units === 'metric' ? 'kg' : 'lbs';
  const { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_EMOJIS } = window.exerciseLibrary;

  container.innerHTML = `
    <div class="session-header">
      <div>
        <h2 style="font-family:var(--font-display);font-weight:700;">${activeSessionData.routineName}</h2>
        <span class="badge badge-purple mt-sm">${activeSessionData.category}</span>
      </div>
      <div class="flex items-center gap-lg">
        <div class="session-timer" id="session-elapsed-timer">00:00:00</div>
        <button class="btn btn-success" id="finish-workout-btn">
          <i data-lucide="check-circle"></i> Finish
        </button>
      </div>
    </div>

    ${activeSessionData.exercises.map((ex, exIdx) => `
      <div class="session-exercise-card" data-exercise-idx="${exIdx}">
        <div class="session-exercise-header">
          <div class="flex items-center gap-md">
            <span style="font-size:1.2rem;">${MUSCLE_GROUP_EMOJIS[ex.muscleGroup] || '💪'}</span>
            <span class="session-exercise-name">${ex.name}</span>
            <span class="badge badge-${MUSCLE_GROUP_COLORS[ex.muscleGroup] || 'purple'} text-xs">${ex.muscleGroup}</span>
          </div>
        </div>

        <div style="padding: 0;">
          <!-- Set header -->
          <div class="session-set-row" style="opacity:0.5;border-bottom:1px solid var(--border-color);">
            <div class="text-xs font-semibold text-secondary">SET</div>
            <div class="text-xs font-semibold text-secondary">${ex.timeBased ? 'DURATION' : 'REPS'}</div>
            <div class="text-xs font-semibold text-secondary">WEIGHT (${weightUnit})</div>
            <div class="text-xs font-semibold text-secondary">PREV</div>
            <div></div>
          </div>

          ${ex.sets.map((set, setIdx) => {
            const prev = ex.previousSets && ex.previousSets[setIdx];
            const prevText = prev ? (ex.timeBased ? `${prev.duration}s` : `${prev.reps}r @ ${prev.weight}${weightUnit}`) : '—';

            return `
              <div class="session-set-row ${set.completed ? 'completed' : ''}" data-ex="${exIdx}" data-set="${setIdx}">
                <div class="set-number">${setIdx + 1}</div>
                <div>
                  ${ex.timeBased
                    ? `<input type="number" class="form-input number-input form-input-sm set-input" data-ex="${exIdx}" data-set="${setIdx}" data-field="duration" value="${set.duration}" min="1" max="3600">`
                    : `<input type="number" class="form-input number-input form-input-sm set-input" data-ex="${exIdx}" data-set="${setIdx}" data-field="reps" value="${set.reps}" min="0" max="999">`
                  }
                </div>
                <div>
                  <input type="number" class="form-input number-input form-input-sm set-input" data-ex="${exIdx}" data-set="${setIdx}" data-field="weight" value="${set.weight}" min="0" max="999" step="0.5">
                </div>
                <div class="previous-data text-xs text-secondary">${prevText}</div>
                <button class="set-complete-btn ${set.completed ? 'completed' : ''}" data-ex="${exIdx}" data-set="${setIdx}">
                  <i data-lucide="check"></i>
                </button>
              </div>
            `;
          }).join('')}

          <div class="session-add-set">
            <button class="btn btn-ghost btn-sm add-set-btn" data-ex="${exIdx}">
              <i data-lucide="plus"></i> Add Set
            </button>
          </div>
        </div>
      </div>
    `).join('')}
  `;

  // Bind set inputs
  container.querySelectorAll('.set-input').forEach(input => {
    input.addEventListener('change', () => {
      const exIdx = parseInt(input.dataset.ex);
      const setIdx = parseInt(input.dataset.set);
      const field = input.dataset.field;
      activeSessionData.exercises[exIdx].sets[setIdx][field] = parseFloat(input.value) || 0;
      window.storage.saveActiveSession(activeSessionData);
    });
  });

  // Bind complete buttons
  container.querySelectorAll('.set-complete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const exIdx = parseInt(btn.dataset.ex);
      const setIdx = parseInt(btn.dataset.set);
      const set = activeSessionData.exercises[exIdx].sets[setIdx];
      set.completed = !set.completed;
      window.storage.saveActiveSession(activeSessionData);

      // Check for PR
      if (set.completed) {
        checkForPR(exIdx, setIdx);
        btn.classList.add('completed');
        btn.closest('.session-set-row').classList.add('completed');

        // Auto-start rest timer
        const settings = window.storage.getSettings();
        if (settings.enableRestTimer !== false) {
          const restTime = activeSessionData.exercises[exIdx].rest || settings.defaultRest;
          if (restTime > 0) {
            window.timer.startRestTimer(restTime,
              null,
              () => { window.ui.playBeep(); }
            );
          }
        }
      } else {
        btn.classList.remove('completed');
        btn.closest('.session-set-row').classList.remove('completed');
      }
    });
  });

  // Bind add set
  container.querySelectorAll('.add-set-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const exIdx = parseInt(btn.dataset.ex);
      const ex = activeSessionData.exercises[exIdx];
      ex.sets.push({
        reps: ex.targetReps || 0,
        weight: 0,
        duration: ex.targetDuration || 0,
        completed: false
      });
      window.storage.saveActiveSession(activeSessionData);
      renderActiveSession();
    });
  });

  // Bind finish
  const finishBtn = document.getElementById('finish-workout-btn');
  if (finishBtn) {
    finishBtn.addEventListener('click', () => finishWorkout());
  }

  // Resume timer if active
  if (activeSessionData.startedAt) {
    window.timer.resumeElapsedTimer(activeSessionData.startedAt, (elapsed) => {
      const timerEl = document.getElementById('session-elapsed-timer');
      if (timerEl) timerEl.textContent = window.ui.formatTimerDisplay(elapsed);
    });
  }

  window.ui.refreshIcons(container);
}

function checkForPR(exIdx, setIdx) {
  const ex = activeSessionData.exercises[exIdx];
  const set = ex.sets[setIdx];
  const sessions = window.storage.getSessions();

  let bestWeight = 0;
  let bestReps = 0;
  let bestVolume = 0;

  sessions.forEach(s => {
    s.exercises.forEach(sEx => {
      if (sEx.exerciseId === ex.exerciseId) {
        sEx.sets.forEach(sSet => {
          if (sSet.completed) {
            if (sSet.weight > bestWeight) bestWeight = sSet.weight;
            if (sSet.reps > bestReps) bestReps = sSet.reps;
            const vol = (sSet.reps || 0) * (sSet.weight || 0);
            if (vol > bestVolume) bestVolume = vol;
          }
        });
      }
    });
  });

  const currentVolume = (set.reps || 0) * (set.weight || 0);
  const isPR = (set.weight > bestWeight && set.weight > 0) ||
               (set.reps > bestReps && set.reps > 0 && set.weight >= bestWeight) ||
               (currentVolume > bestVolume && currentVolume > 0);

  if (isPR) {
    if (!activeSessionData.prs.includes(ex.exerciseId)) {
      activeSessionData.prs.push(ex.exerciseId);
    }
    // Show PR badge
    const row = document.querySelector(`.session-set-row[data-ex="${exIdx}"][data-set="${setIdx}"]`);
    if (row && !row.querySelector('.badge-pr')) {
      const badge = document.createElement('span');
      badge.className = 'badge badge-pr';
      badge.textContent = '🏆 PR!';
      row.querySelector('.set-number').after(badge);
    }
    window.ui.showToast('🏆 New Personal Record!', 'success');
  }
}

function finishWorkout() {
  if (!activeSessionData) return;

  const elapsed = window.timer.getElapsedSeconds();
  window.timer.stopElapsedTimer();

  // Calculate summary
  const totalSets = activeSessionData.exercises.reduce((sum, ex) =>
    sum + ex.sets.filter(s => s.completed).length, 0);
  const totalExercises = activeSessionData.exercises.filter(ex =>
    ex.sets.some(s => s.completed)).length;

  // Show summary modal
  const overlay = document.getElementById('session-summary-modal');
  if (overlay) {
    const body = overlay.querySelector('.modal-body');
    body.innerHTML = `
      <div style="text-align:center;margin-bottom:var(--space-2xl);">
        <div style="font-size:3rem;margin-bottom:var(--space-lg);">🎉</div>
        <h2 style="font-family:var(--font-display);font-weight:700;font-size:var(--text-2xl);">Workout Complete!</h2>
        <p class="text-secondary mt-sm">${activeSessionData.routineName}</p>
      </div>

      <div style="margin-bottom:var(--space-2xl);">
        <div class="summary-stat">
          <span class="label">Duration</span>
          <span class="value">${window.ui.formatDuration(elapsed)}</span>
        </div>
        <div class="summary-stat">
          <span class="label">Exercises</span>
          <span class="value">${totalExercises}</span>
        </div>
        <div class="summary-stat">
          <span class="label">Sets Completed</span>
          <span class="value">${totalSets}</span>
        </div>
        <div class="summary-stat">
          <span class="label">PRs</span>
          <span class="value" style="color:var(--color-coral);">${activeSessionData.prs.length}</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Session Notes (optional)</label>
        <textarea class="form-textarea" id="session-notes-input" placeholder="How did it go?">${activeSessionData.notes || ''}</textarea>
      </div>

      <div class="flex gap-md">
        <button class="btn btn-danger" id="discard-session-btn" style="flex:1;">
          <i data-lucide="trash-2"></i> Discard
        </button>
        <button class="btn btn-primary" id="save-session-btn" style="flex:2;">
          <i data-lucide="check"></i> Save Workout
        </button>
      </div>
    `;

    document.getElementById('save-session-btn').addEventListener('click', () => {
      const notes = document.getElementById('session-notes-input').value;
      const session = {
        id: activeSessionData.id,
        routineId: activeSessionData.routineId,
        routineName: activeSessionData.routineName,
        category: activeSessionData.category,
        date: activeSessionData.date,
        duration: elapsed,
        exercises: activeSessionData.exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets.filter(s => s.completed)
        })),
        notes,
        prs: activeSessionData.prs
      };

      window.storage.saveSession(session);
      window.storage.clearActiveSession();
      activeSessionData = null;
      window.ui.closeModal('session-summary-modal');
      window.ui.showToast('Workout saved!', 'success');

      // Switch back to routines tab
      document.getElementById('workout-session-tab').classList.remove('active');
      document.getElementById('workout-routines-tab').classList.add('active');
      document.querySelectorAll('#page-workouts .tab-btn').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === 'workout-routines-tab');
      });

      // Check for streak milestone
      checkStreakMilestone();

      // Dispatch event for dashboard refresh
      window.dispatchEvent(new CustomEvent('workoutSaved'));
    });

    document.getElementById('discard-session-btn').addEventListener('click', () => {
      window.ui.showConfirm('Discard Workout', 'Are you sure? All data from this session will be lost.', () => {
        window.storage.clearActiveSession();
        activeSessionData = null;
        window.ui.closeModal('session-summary-modal');

        document.getElementById('workout-session-tab').classList.remove('active');
        document.getElementById('workout-routines-tab').classList.add('active');
        document.querySelectorAll('#page-workouts .tab-btn').forEach(t => {
          t.classList.toggle('active', t.dataset.tab === 'workout-routines-tab');
        });

        window.ui.showToast('Workout discarded', 'info');
      }, 'Discard', true);
    });

    window.ui.refreshIcons(body);
    window.ui.openModal('session-summary-modal');

    // Fire confetti if PRs
    if (activeSessionData.prs.length > 0) {
      setTimeout(() => window.ui.fireConfetti(), 500);
    }
  }
}

function checkStreakMilestone() {
  const streak = calculateStreak();
  const milestones = [7, 14, 21, 30, 50, 100];
  if (milestones.includes(streak)) {
    setTimeout(() => {
      window.ui.fireConfetti();
      window.ui.showToast(`🔥 ${streak} Day Streak! Keep it up!`, 'success', 5000);
    }, 800);
  }
}

// ===== Stats Calculations =====

function calculateStreak() {
  const sessions = window.storage.getSessions();
  if (sessions.length === 0) return 0;

  const dates = [...new Set(sessions.map(s => new Date(s.date).toDateString()))];
  dates.sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    if (dates.includes(checkDate.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

function calculateLongestStreak() {
  const sessions = window.storage.getSessions();
  if (sessions.length === 0) return 0;

  const dates = [...new Set(sessions.map(s => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }))].sort();

  let longest = 1;
  let current = 1;
  const dayMs = 86400000;

  for (let i = 1; i < dates.length; i++) {
    if (dates[i] - dates[i - 1] === dayMs) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

function getTotalWorkouts() {
  return window.storage.getSessions().length;
}

function getThisWeekSessions() {
  const sessions = window.storage.getSessions();
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  return sessions.filter(s => new Date(s.date) >= startOfWeek).length;
}

function getPRsThisMonth() {
  const sessions = window.storage.getSessions();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return sessions
    .filter(s => new Date(s.date) >= startOfMonth)
    .reduce((sum, s) => sum + (s.prs ? s.prs.length : 0), 0);
}

function getRecentSessions(count = 5) {
  const sessions = window.storage.getSessions();
  return sessions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, count);
}

function getSessionsByDateRange(from, to) {
  const sessions = window.storage.getSessions();
  return sessions.filter(s => {
    const d = new Date(s.date);
    return d >= from && d <= to;
  });
}

function getMuscleGroupDistribution(sessions = null) {
  const data = sessions || window.storage.getSessions();
  const counts = {};

  data.forEach(s => {
    s.exercises.forEach(ex => {
      const exData = window.exerciseLibrary.getExerciseById(ex.exerciseId);
      if (exData) {
        counts[exData.muscleGroup] = (counts[exData.muscleGroup] || 0) + 1;
      }
    });
  });

  return counts;
}

function checkForActiveSession() {
  const active = window.storage.getActiveSession();
  if (active) {
    window.ui.showConfirm(
      'Resume Workout?',
      `You have an active ${active.routineName} workout. Would you like to resume?`,
      () => {
        activeSessionData = active;
        window.ui.navigateTo('workouts');
        setTimeout(() => {
          document.getElementById('workout-routines-tab').classList.remove('active');
          document.getElementById('workout-session-tab').classList.add('active');
          document.querySelectorAll('#page-workouts .tab-btn').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === 'workout-session-tab');
          });
          renderActiveSession();
        }, 100);
      },
      'Resume',
      false
    );
  }
}

// Expose to global namespace
window.workouts = {
  renderRoutines,
  openRoutineEditor,
  startWorkoutSession,
  renderActiveSession,
  calculateStreak,
  calculateLongestStreak,
  getTotalWorkouts,
  getThisWeekSessions,
  getPRsThisMonth,
  getRecentSessions,
  getSessionsByDateRange,
  getMuscleGroupDistribution,
  checkForActiveSession
};
