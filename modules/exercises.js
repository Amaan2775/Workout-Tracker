// ============================================
// EXERCISES MODULE — Exercise Library Logic
// ============================================

let currentFilters = {
  muscleGroup: 'All',
  difficulty: 'All',
  equipment: 'All',
  search: ''
};

function renderExerciseLibrary() {
  renderFilters();
  renderExercises();
  bindSearch();
  bindCustomExerciseModal();
}

function renderFilters() {
  const { MUSCLE_GROUPS, DIFFICULTIES, EQUIPMENT_LIST } = window.exerciseLibrary;

  // Muscle Group filters
  const mgContainer = document.getElementById('filter-muscle-group');
  if (mgContainer) {
    mgContainer.innerHTML = ['All', ...MUSCLE_GROUPS].map(g =>
      `<button class="filter-pill ${currentFilters.muscleGroup === g ? 'active' : ''}" data-filter="muscleGroup" data-value="${g}">${g}</button>`
    ).join('');
  }

  // Difficulty filters
  const diffContainer = document.getElementById('filter-difficulty');
  if (diffContainer) {
    diffContainer.innerHTML = ['All', ...DIFFICULTIES].map(d =>
      `<button class="filter-pill ${currentFilters.difficulty === d ? 'active' : ''}" data-filter="difficulty" data-value="${d}">${d}</button>`
    ).join('');
  }

  // Equipment filters
  const eqContainer = document.getElementById('filter-equipment');
  if (eqContainer) {
    eqContainer.innerHTML = ['All', ...EQUIPMENT_LIST].map(e =>
      `<button class="filter-pill ${currentFilters.equipment === e ? 'active' : ''}" data-filter="equipment" data-value="${e}">${e}</button>`
    ).join('');
  }

  // Bind filter clicks
  document.querySelectorAll('.filter-pill[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { filter, value } = btn.dataset;
      currentFilters[filter] = value;
      renderFilters();
      renderExercises();
    });
  });
}

function bindSearch() {
  const searchInput = document.getElementById('exercise-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilters.search = e.target.value;
      renderExercises();
    });
  }
}

function getFilteredExercises() {
  const { getAllExercises } = window.exerciseLibrary;
  return getAllExercises().filter(ex => {
    if (currentFilters.muscleGroup !== 'All' && ex.muscleGroup !== currentFilters.muscleGroup) return false;
    if (currentFilters.difficulty !== 'All' && ex.difficulty !== currentFilters.difficulty) return false;
    if (currentFilters.equipment !== 'All' && ex.equipment !== currentFilters.equipment) return false;
    if (currentFilters.search) {
      const q = currentFilters.search.toLowerCase();
      if (!ex.name.toLowerCase().includes(q) &&
        !ex.muscleGroup.toLowerCase().includes(q) &&
        !ex.equipment.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function renderExercises() {
  const grid = document.getElementById('exercise-grid');
  if (!grid) return;

  const exercisesList = getFilteredExercises();
  const { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_EMOJIS } = window.exerciseLibrary;
  const { showToast, refreshIcons } = window.ui;

  if (exercisesList.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">🔍</div>
        <h3 class="empty-state-title">No exercises found</h3>
        <p class="empty-state-text">Try adjusting your filters or search term.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = exercisesList.map(ex => `
    <div class="exercise-card" data-exercise-id="${ex.id}">
      <div class="exercise-card-icon" style="background: var(--color-${MUSCLE_GROUP_COLORS[ex.muscleGroup] || 'purple'}-dim);">
        ${MUSCLE_GROUP_EMOJIS[ex.muscleGroup] || '💪'}
      </div>
      <div class="exercise-card-name">${ex.name}</div>
      <div class="exercise-card-meta">
        <span class="badge badge-${MUSCLE_GROUP_COLORS[ex.muscleGroup] || 'purple'}">${ex.muscleGroup}</span>
        <span class="badge badge-navy">${ex.difficulty}</span>
        ${ex.timeBased ? '<span class="badge badge-coral">⏱ Time</span>' : ''}
      </div>
      <div class="text-sm text-secondary" style="flex:1;">${ex.equipment}</div>
      <div class="exercise-card-actions">
        <button class="btn btn-ghost btn-sm exercise-detail-btn" data-exercise-id="${ex.id}">
          <i data-lucide="eye"></i> Details
        </button>
        <button class="btn btn-primary btn-sm exercise-add-btn" data-exercise-id="${ex.id}">
          <i data-lucide="plus"></i> Add
        </button>
      </div>
    </div>
  `).join('');

  // Bind detail buttons
  grid.querySelectorAll('.exercise-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => showExerciseDetail(btn.dataset.exerciseId));
  });

  // Bind add buttons
  grid.querySelectorAll('.exercise-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openRoutinePickerForExercise(btn.dataset.exerciseId);
    });
  });

  refreshIcons(grid);
}

function showExerciseDetail(exerciseId) {
  const { getExerciseById, MUSCLE_GROUP_COLORS, MUSCLE_GROUP_EMOJIS } = window.exerciseLibrary;
  const { openModal, closeModal, showToast, refreshIcons } = window.ui;

  const ex = getExerciseById(exerciseId);
  if (!ex) return;

  const modal = document.getElementById('exercise-detail-modal');
  if (!modal) return;

  const body = modal.querySelector('.modal-body');
  body.innerHTML = `
    <div style="text-align:center; margin-bottom: var(--space-2xl);">
      <div class="exercise-card-icon" style="width:64px;height:64px;font-size:2rem;margin:0 auto var(--space-lg);background:var(--color-${MUSCLE_GROUP_COLORS[ex.muscleGroup] || 'purple'}-dim);">
        ${MUSCLE_GROUP_EMOJIS[ex.muscleGroup] || '💪'}
      </div>
      <h2 style="font-family:var(--font-display);font-weight:700;font-size:var(--text-2xl);">${ex.name}</h2>
      <div class="flex items-center gap-sm" style="justify-content:center;margin-top:var(--space-md);">
        <span class="badge badge-${MUSCLE_GROUP_COLORS[ex.muscleGroup] || 'purple'}">${ex.muscleGroup}</span>
        <span class="badge badge-navy">${ex.difficulty}</span>
        <span class="badge badge-deep">${ex.equipment}</span>
        ${ex.timeBased ? '<span class="badge badge-coral">⏱ Time-based</span>' : ''}
      </div>
    </div>

    <div class="mb-xl">
      <p style="color:var(--text-secondary);line-height:1.7;">${ex.description || 'Custom exercise.'}</p>
    </div>

    ${ex.secondaryMuscles && ex.secondaryMuscles.length > 0 ? `
      <div class="mb-xl">
        <h4 class="form-label mb-sm">Secondary Muscles</h4>
        <div class="flex gap-sm">
          ${ex.secondaryMuscles.map(m => `<span class="badge badge-navy">${m}</span>`).join('')}
        </div>
      </div>
    ` : ''}

    ${ex.instructions && ex.instructions.length > 0 ? `
      <div class="mb-xl">
        <h4 class="form-label mb-sm">Instructions</h4>
        <ol style="padding-left:var(--space-xl);display:flex;flex-direction:column;gap:var(--space-md);color:var(--text-secondary);">
          ${ex.instructions.map(step => `<li style="line-height:1.6;">${step}</li>`).join('')}
        </ol>
      </div>
    ` : ''}

    <button class="btn btn-primary w-full exercise-modal-add" data-exercise-id="${ex.id}">
      <i data-lucide="plus"></i> Add to Routine
    </button>
  `;

  body.querySelector('.exercise-modal-add').addEventListener('click', () => {
    openRoutinePickerForExercise(ex.id);
    closeModal('exercise-detail-modal');
  });

  refreshIcons(body);
  openModal('exercise-detail-modal');
}

// ===== Exercise Picker Modal (for routine editor) =====

function openExercisePicker(onSelect) {
  let pickerFilters = { muscleGroup: 'All', search: '' };
  const { MUSCLE_GROUPS, MUSCLE_GROUP_EMOJIS, MUSCLE_GROUP_COLORS, getAllExercises } = window.exerciseLibrary;
  const { openModal, closeModal, refreshIcons } = window.ui;

  const overlay = document.getElementById('exercise-picker-modal');
  if (!overlay) return;

  function renderPicker() {
    const body = overlay.querySelector('.modal-body');

    let filtered = getAllExercises().filter(ex => {
      if (pickerFilters.muscleGroup !== 'All' && ex.muscleGroup !== pickerFilters.muscleGroup) return false;
      if (pickerFilters.search) {
        const q = pickerFilters.search.toLowerCase();
        if (!ex.name.toLowerCase().includes(q) && !ex.muscleGroup.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    body.innerHTML = `
      <div class="search-bar mb-lg">
        <i data-lucide="search"></i>
        <input type="text" id="picker-search" placeholder="Search exercises..." value="${pickerFilters.search}">
      </div>
      <div class="filter-row mb-lg">
        ${['All', ...MUSCLE_GROUPS].map(g =>
      `<button class="filter-pill ${pickerFilters.muscleGroup === g ? 'active' : ''}" data-mg="${g}">${g}</button>`
    ).join('')}
      </div>
      <div style="max-height:400px;overflow-y:auto;display:flex;flex-direction:column;gap:var(--space-sm);">
        ${filtered.map(ex => `
          <button class="activity-item picker-item" data-id="${ex.id}" style="cursor:pointer;border:none;text-align:left;">
            <span style="font-size:1.2rem;">${MUSCLE_GROUP_EMOJIS[ex.muscleGroup] || '💪'}</span>
            <span class="activity-title">${ex.name}</span>
            <span class="badge badge-${MUSCLE_GROUP_COLORS[ex.muscleGroup] || 'purple'} text-xs">${ex.muscleGroup}</span>
            ${ex.timeBased ? '<span class="badge badge-coral text-xs">⏱</span>' : ''}
          </button>
        `).join('')}
      </div>
    `;

    // Bind search
    body.querySelector('#picker-search').addEventListener('input', (e) => {
      pickerFilters.search = e.target.value;
      renderPicker();
    });

    // Bind filter pills
    body.querySelectorAll('.filter-pill[data-mg]').forEach(btn => {
      btn.addEventListener('click', () => {
        pickerFilters.muscleGroup = btn.dataset.mg;
        renderPicker();
      });
    });

    // Bind items
    body.querySelectorAll('.picker-item').forEach(item => {
      item.addEventListener('click', () => {
        onSelect(item.dataset.id);
        closeModal('exercise-picker-modal');
      });
    });

    refreshIcons(body);
  }

  renderPicker();
  openModal('exercise-picker-modal');
}

// ===== Routine Picker Modal (for adding exercises from library) =====

function openRoutinePickerForExercise(exerciseId) {
  const overlay = document.getElementById('routine-picker-modal');
  if (!overlay) return;

  const { getRoutines, saveRoutine, generateId } = window.storage;
  const { openModal, closeModal, showToast } = window.ui;
  const { getExerciseById } = window.exerciseLibrary;

  const routines = getRoutines();
  const body = overlay.querySelector('.modal-body');

  if (routines.length === 0) {
    body.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏋️</div>
        <p class="empty-state-text text-sm">No routines available. Please create a routine first in the Workouts tab.</p>
      </div>
    `;
  } else {
    body.innerHTML = `
      <p class="text-secondary text-sm mb-md">Select a routine to add this exercise to:</p>
      <div style="display:flex;flex-direction:column;gap:var(--space-sm);max-height:300px;overflow-y:auto;">
        ${routines.map(r => `
          <button class="btn btn-secondary routine-picker-btn" data-id="${r.id}" style="justify-content:flex-start;">
            <i data-lucide="clipboard-list"></i> ${r.name}
          </button>
        `).join('')}
      </div>
    `;

    body.querySelectorAll('.routine-picker-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const routineId = btn.dataset.id;
        const routine = getRoutines().find(r => r.id === routineId);
        const ex = getExerciseById(exerciseId);

        if (routine && ex) {
          routine.exercises.push({
            exerciseId: exerciseId,
            sets: 1,
            reps: ex.timeBased ? null : 12,
            duration: ex.timeBased ? 30 : null,
            rest: window.storage.getSettings().defaultRest,
            notes: ''
          });
          saveRoutine(routine);
          showToast(`Added to ${routine.name}!`, 'success');
          // Re-render routines if on workouts page
          if (window.workouts && window.workouts.renderRoutines) {
            window.workouts.renderRoutines();
          }
        }
        closeModal('routine-picker-modal');
      });
    });
  }

  window.ui.refreshIcons(body);
  openModal('routine-picker-modal');
}

// ===== Custom Exercise Modal =====

function bindCustomExerciseModal() {
  const saveBtn = document.getElementById('save-custom-exercise-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const name = document.getElementById('custom-ex-name').value.trim();
      const muscleGroup = document.getElementById('custom-ex-muscle').value;
      const difficulty = document.getElementById('custom-ex-difficulty').value;
      const equipment = document.getElementById('custom-ex-equipment').value;
      const isTimeBased = document.getElementById('custom-ex-timebased').checked;

      if (!name) {
        window.ui.showToast('Please enter an exercise name', 'warning');
        return;
      }

      const newEx = {
        id: 'custom-' + Date.now().toString(36),
        name: name,
        muscleGroup: muscleGroup,
        secondaryMuscles: [],
        difficulty: difficulty,
        equipment: equipment,
        timeBased: isTimeBased,
        description: 'Custom exercise created by you.',
        instructions: []
      };

      window.storage.saveCustomExercise(newEx);
      window.ui.showToast('Custom exercise added!', 'success');
      window.ui.closeModal('custom-exercise-modal');
      
      // Reset form
      document.getElementById('custom-ex-name').value = '';
      
      // Re-render
      renderExercises();
    });
  }
}

// Expose to global namespace
window.exercises = {
  renderExerciseLibrary,
  openExercisePicker,
  openRoutinePickerForExercise
};
