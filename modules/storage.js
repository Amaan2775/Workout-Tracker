// ============================================
// STORAGE MODULE — localStorage CRUD Helpers
// ============================================

const STORAGE_KEY = 'workout-tracker-data';

const DEFAULT_DATA = {
  routines: [],
  sessions: [],
  bodyProgress: [],
  customExercises: [], // Custom exercises added by the user
  settings: {
    theme: 'dark',
    units: 'metric',
    defaultRest: 60,
    enableRestTimer: true
  },
  activeSession: null,
  onboardingComplete: false
};

/**
 * Get all app data from localStorage
 */
function getAllData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA };
    const data = JSON.parse(raw);
    // Merge with defaults to ensure all keys exist
    return {
      ...DEFAULT_DATA,
      ...data,
      settings: { ...DEFAULT_DATA.settings, ...(data.settings || {}) }
    };
  } catch (e) {
    console.error('Failed to read localStorage:', e);
    return { ...DEFAULT_DATA };
  }
}

/**
 * Save all app data to localStorage
 */
function saveAllData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.error('localStorage quota exceeded!');
      return false;
    }
    console.error('Failed to save to localStorage:', e);
    return false;
  }
}

/**
 * Get a specific section of data
 */
function getData(key) {
  const data = getAllData();
  return data[key];
}

/**
 * Set a specific section of data
 */
function setData(key, value) {
  const data = getAllData();
  data[key] = value;
  return saveAllData(data);
}

// ===== Routines =====

function getRoutines() {
  return getData('routines') || [];
}

function saveRoutine(routine) {
  const routines = getRoutines();
  const idx = routines.findIndex(r => r.id === routine.id);
  if (idx >= 0) {
    routines[idx] = routine;
  } else {
    routines.push(routine);
  }
  return setData('routines', routines);
}

function deleteRoutine(id) {
  const routines = getRoutines().filter(r => r.id !== id);
  return setData('routines', routines);
}

function getRoutineById(id) {
  return getRoutines().find(r => r.id === id);
}

// ===== Sessions =====

function getSessions() {
  return getData('sessions') || [];
}

function saveSession(session) {
  const sessions = getSessions();
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.push(session);
  }
  return setData('sessions', sessions);
}

function deleteSession(id) {
  const sessions = getSessions().filter(s => s.id !== id);
  return setData('sessions', sessions);
}

// ===== Custom Exercises =====

function getCustomExercises() {
  return getData('customExercises') || [];
}

function saveCustomExercise(exercise) {
  const exercises = getCustomExercises();
  exercises.push(exercise);
  return setData('customExercises', exercises);
}

// ===== Active Session =====

function getActiveSession() {
  return getData('activeSession');
}

function saveActiveSession(session) {
  return setData('activeSession', session);
}

function clearActiveSession() {
  return setData('activeSession', null);
}

// ===== Body Progress =====

function getBodyProgress() {
  return getData('bodyProgress') || [];
}

function saveBodyEntry(entry) {
  const progress = getBodyProgress();
  const idx = progress.findIndex(p => p.date === entry.date);
  if (idx >= 0) {
    progress[idx] = entry;
  } else {
    progress.push(entry);
    progress.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  return setData('bodyProgress', progress);
}

function deleteBodyEntry(date) {
  const progress = getBodyProgress().filter(p => p.date !== date);
  return setData('bodyProgress', progress);
}

// ===== Settings =====

function getSettings() {
  return getData('settings') || DEFAULT_DATA.settings;
}

function updateSettings(updates) {
  const settings = { ...getSettings(), ...updates };
  return setData('settings', settings);
}

// ===== Onboarding =====

function isOnboardingComplete() {
  return getData('onboardingComplete') === true;
}

function completeOnboarding() {
  return setData('onboardingComplete', true);
}

// ===== Export / Import =====

function exportData() {
  const data = getAllData();
  // Remove active session from export
  const { activeSession, ...exportData } = data;
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workout-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(jsonString, mode = 'replace') {
  try {
    const imported = JSON.parse(jsonString);
    if (mode === 'replace') {
      const merged = { ...DEFAULT_DATA, ...imported, settings: { ...DEFAULT_DATA.settings, ...(imported.settings || {}) } };
      saveAllData(merged);
    } else {
      // Merge mode
      const current = getAllData();
      const mergeArray = (a, b, key = 'id') => {
        const map = new Map(a.map(item => [item[key], item]));
        b.forEach(item => map.set(item[key], item));
        return Array.from(map.values());
      };
      current.routines = mergeArray(current.routines, imported.routines || []);
      current.sessions = mergeArray(current.sessions, imported.sessions || []);
      current.bodyProgress = mergeArray(current.bodyProgress, imported.bodyProgress || [], 'date');
      current.customExercises = mergeArray(current.customExercises || [], imported.customExercises || []);
      current.settings = { ...current.settings, ...(imported.settings || {}) };
      saveAllData(current);
    }
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
}

function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
}

// ===== Helpers =====

function generateId() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

// Expose to global namespace
window.storage = {
  getAllData,
  saveAllData,
  getData,
  setData,
  getRoutines,
  saveRoutine,
  deleteRoutine,
  getRoutineById,
  getSessions,
  saveSession,
  deleteSession,
  getCustomExercises,
  saveCustomExercise,
  getActiveSession,
  saveActiveSession,
  clearActiveSession,
  getBodyProgress,
  saveBodyEntry,
  deleteBodyEntry,
  getSettings,
  updateSettings,
  isOnboardingComplete,
  completeOnboarding,
  exportData,
  importData,
  clearAllData,
  generateId
};
