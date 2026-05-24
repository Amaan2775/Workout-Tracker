// ============================================
// CHARTS MODULE — Chart.js Integrations
// ============================================

const chartInstances = {};

const CHART_COLORS = {
  purple: '#FF3B30',
  navy: '#32ADE6',
  coral: '#FF9500',
  success: '#34D399',
  grid: 'rgba(255, 255, 255, 0.05)',
  text: '#A1A1AA'
};

function initChartDefaults() {
  if (window.Chart) {
    Chart.defaults.color = CHART_COLORS.text;
    Chart.defaults.font.family = "'JetBrains Mono', monospace";
    Chart.defaults.plugins.tooltip.backgroundColor = '#1C1C22';
    Chart.defaults.plugins.tooltip.titleColor = '#FFF';
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
  }
}

// Ensure defaults are set on load
initChartDefaults();

// ===== Data Helpers =====

function getLoggedExercises() {
  const sessions = window.storage.getSessions();
  const { getAllExercises } = window.exerciseLibrary;
  
  const loggedIds = new Set();
  sessions.forEach(s => {
    s.exercises.forEach(ex => {
      if (ex.sets.some(set => set.completed)) {
        loggedIds.add(ex.exerciseId);
      }
    });
  });

  const exercises = Array.from(loggedIds)
    .map(id => window.exerciseLibrary.getExerciseById(id))
    .filter(Boolean);

  return exercises.sort((a, b) => a.name.localeCompare(b.name));
}

function getPRHistory(exerciseId) {
  const sessions = window.storage.getSessions();
  const history = [];

  sessions.forEach(s => {
    const exData = s.exercises.find(e => e.exerciseId === exerciseId);
    if (exData) {
      let bestWeight = 0;
      let bestReps = 0;
      let totalVolume = 0;

      exData.sets.forEach(set => {
        if (set.completed) {
          if (set.weight > bestWeight) bestWeight = set.weight;
          if (set.reps > bestReps) bestReps = set.reps;
          totalVolume += (set.weight * set.reps);
        }
      });

      if (bestWeight > 0 || bestReps > 0 || totalVolume > 0) {
        history.push({
          date: s.date,
          weight: bestWeight,
          reps: bestReps,
          volume: totalVolume,
          isPR: s.prs && s.prs.includes(exerciseId)
        });
      }
    }
  });

  return history.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function getPRData() {
  const sessions = window.storage.getSessions();
  const prMap = new Map();
  const { getExerciseById } = window.exerciseLibrary;

  sessions.forEach(s => {
    s.exercises.forEach(ex => {
      let bestW = 0;
      let bestR = 0;
      ex.sets.forEach(set => {
        if (set.completed) {
          if (set.weight > bestW) bestW = set.weight;
          if (set.reps > bestR) bestR = set.reps;
        }
      });

      if (bestW > 0 || bestR > 0) {
        const existing = prMap.get(ex.exerciseId);
        if (!existing || bestW > existing.bestWeight || (bestW === existing.bestWeight && bestR > existing.bestReps)) {
          prMap.set(ex.exerciseId, {
            exerciseId: ex.exerciseId,
            bestWeight: bestW,
            bestReps: bestR,
            date: s.date,
            isRecent: (new Date() - new Date(s.date)) < 7 * 24 * 60 * 60 * 1000 // 7 days
          });
        }
      }
    });
  });

  return Array.from(prMap.values()).map(pr => {
    const exData = getExerciseById(pr.exerciseId);
    return {
      ...pr,
      name: exData ? exData.name : 'Unknown',
      muscleGroup: exData ? exData.muscleGroup : 'Unknown'
    };
  });
}

// ===== Date Filtering Helper =====

function filterDataByRange(data, dateKey, range) {
  const now = new Date();
  let ms = 30 * 24 * 60 * 60 * 1000; // 1M

  if (range === '1W') ms = 7 * 24 * 60 * 60 * 1000;
  if (range === '2M') ms = 60 * 24 * 60 * 60 * 1000;
  if (range === '3M') ms = 90 * 24 * 60 * 60 * 1000;
  if (range === '6M') ms = 180 * 24 * 60 * 60 * 1000;
  if (range === '1Y') ms = 365 * 24 * 60 * 60 * 1000;

  const threshold = now.getTime() - ms;

  return data.filter(item => {
    const d = new Date(item[dateKey]);
    return d.getTime() >= threshold;
  });
}

// ===== Rendering Charts =====

function renderStrengthChart(canvasId, exerciseId, range = '1M', metric = 'weight') {
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  const rawHistory = getPRHistory(exerciseId);
  const history = filterDataByRange(rawHistory, 'date', range);

  const ctx = document.getElementById(canvasId);
  if (!ctx || history.length === 0) return;

  const labels = history.map(h => window.ui.formatDateShort(h.date));
  let dataPoints = [];
  let labelText = '';

  if (metric === 'weight') {
    dataPoints = history.map(h => h.weight);
    labelText = 'Max Weight';
  } else if (metric === 'volume') {
    dataPoints = history.map(h => h.volume);
    labelText = 'Total Volume';
  } else if (metric === 'reps') {
    dataPoints = history.map(h => h.reps);
    labelText = 'Max Reps';
  }

  const unit = window.storage.getSettings().units === 'metric' ? 'kg' : 'lbs';

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: labelText,
        data: dataPoints,
        borderColor: CHART_COLORS.purple,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: history.map(h => h.isPR ? CHART_COLORS.coral : CHART_COLORS.purple),
        pointRadius: history.map(h => h.isPR ? 6 : 4),
        pointBorderWidth: 2,
        pointBorderColor: '#1C1C22'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.raw} ${metric !== 'reps' ? unit : ''}`
          }
        }
      },
      scales: {
        x: { grid: { color: CHART_COLORS.grid } },
        y: { 
          grid: { color: CHART_COLORS.grid },
          beginAtZero: false
        }
      }
    }
  });
}

function renderConsistencyChart(canvasId, range = '3M') {
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  const sessions = window.storage.getSessions();
  const filtered = filterDataByRange(sessions, 'date', range);
  
  // Group by week
  const weeks = {};
  filtered.forEach(s => {
    const d = new Date(s.date);
    const year = d.getFullYear();
    // Get ISO week number roughly
    const firstDay = new Date(year, 0, 1);
    const pastDaysOfYear = (d - firstDay) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
    const key = `W${weekNum}`;
    
    weeks[key] = (weeks[key] || 0) + 1;
  });

  const labels = Object.keys(weeks);
  const data = Object.values(weeks);

  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Sessions',
        data,
        backgroundColor: CHART_COLORS.navy,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false } },
        y: { 
          grid: { color: CHART_COLORS.grid },
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

function renderRadarChart(canvasId, range = '1M') {
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  const sessions = window.storage.getSessions();
  const filtered = filterDataByRange(sessions, 'date', range);
  const counts = window.workouts.getMuscleGroupDistribution(filtered);

  const { MUSCLE_GROUPS } = window.exerciseLibrary;
  const labels = MUSCLE_GROUPS;
  const data = MUSCLE_GROUPS.map(g => counts[g] || 0);

  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: 'Exercises Completed',
        data,
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
        borderColor: CHART_COLORS.purple,
        pointBackgroundColor: CHART_COLORS.purple,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: CHART_COLORS.purple
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: CHART_COLORS.grid },
          grid: { color: CHART_COLORS.grid },
          pointLabels: {
            color: CHART_COLORS.text,
            font: { family: "'Space Grotesk', sans-serif", size: 12 }
          },
          ticks: { display: false, beginAtZero: true }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function renderMiniRadar(canvasId) {
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  const sessions = window.storage.getSessions();
  const filtered = filterDataByRange(sessions, 'date', '1W');
  const counts = window.workouts.getMuscleGroupDistribution(filtered);

  const { MUSCLE_GROUPS } = window.exerciseLibrary;
  const labels = MUSCLE_GROUPS;
  const data = MUSCLE_GROUPS.map(g => counts[g] || 0);

  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: 'rgba(50, 173, 230, 0.4)',
        borderColor: CHART_COLORS.navy,
        borderWidth: 1,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { display: false },
          grid: { color: CHART_COLORS.grid },
          pointLabels: {
            color: CHART_COLORS.text,
            font: { size: 9 }
          },
          ticks: { display: false, beginAtZero: true }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });
}

function renderDurationChart(canvasId, range = '3M') {
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  const sessions = window.storage.getSessions();
  const filtered = filterDataByRange(sessions, 'date', range);
  
  const ctx = document.getElementById(canvasId);
  if (!ctx || filtered.length === 0) return;

  const labels = filtered.map(s => window.ui.formatDateShort(s.date));
  const data = filtered.map(s => Math.round((s.duration || 0) / 60)); // Minutes

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Duration (min)',
        data,
        borderColor: CHART_COLORS.navy,
        backgroundColor: 'rgba(50, 173, 230, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: CHART_COLORS.navy
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } },
        y: { 
          grid: { color: CHART_COLORS.grid },
          beginAtZero: true
        }
      }
    }
  });
}

function renderBodyWeightChart(canvasId) {
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  const progress = window.storage.getBodyProgress();
  const ctx = document.getElementById(canvasId);
  if (!ctx || progress.length === 0) return;

  const labels = progress.map(p => window.ui.formatDateShort(p.date));
  const data = progress.map(p => p.weight);
  const unit = window.storage.getSettings().units === 'metric' ? 'kg' : 'lbs';

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `Weight (${unit})`,
        data,
        borderColor: CHART_COLORS.success,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: CHART_COLORS.success
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { 
          grid: { color: CHART_COLORS.grid },
          beginAtZero: false
        }
      }
    }
  });
}

// Expose to global namespace
window.charts = {
  chartInstances,
  getLoggedExercises,
  getPRHistory,
  getPRData,
  renderStrengthChart,
  renderConsistencyChart,
  renderRadarChart,
  renderMiniRadar,
  renderDurationChart,
  renderBodyWeightChart
};
