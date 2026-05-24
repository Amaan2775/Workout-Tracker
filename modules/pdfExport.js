// ============================================
// PDF EXPORT MODULE — jsPDF Integration
// ============================================

async function exportPDF() {
  if (!window.jspdf || !window.html2canvas) {
    window.ui.showToast('PDF export libraries not loaded yet.', 'error');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  window.ui.showToast('Generating PDF... This may take a moment.', 'info');

  const margin = 15;
  let yPos = margin;
  const pageWidth = doc.internal.pageSize.width;

  // Colors
  const darkBg = '#0F0F13';
  const purple = '#D174D2';
  const textWhite = '#FFFFFF';
  const textGray = '#A1A1AA';

  // --- Title Page ---
  doc.setFillColor(darkBg);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.height, 'F');
  
  doc.setTextColor(purple);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('WORKOUT PROGRESS REPORT', pageWidth / 2, 50, { align: 'center' });

  doc.setTextColor(textWhite);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const d = new Date();
  doc.text(`Generated on: ${d.toLocaleDateString()}`, pageWidth / 2, 65, { align: 'center' });

  // --- Stats ---
  const totalWorkouts = window.workouts.getTotalWorkouts();
  const streak = window.workouts.calculateStreak();
  const longest = window.workouts.calculateLongestStreak();
  const totalSeconds = window.storage.getSessions().reduce((sum, s) => sum + (s.duration || 0), 0);

  doc.setFontSize(16);
  doc.text(`Total Workouts: ${totalWorkouts}`, pageWidth / 2, 100, { align: 'center' });
  doc.text(`Current Streak: ${streak} days`, pageWidth / 2, 115, { align: 'center' });
  doc.text(`Longest Streak: ${longest} days`, pageWidth / 2, 130, { align: 'center' });
  doc.text(`Total Training Time: ${window.ui.formatDuration(totalSeconds)}`, pageWidth / 2, 145, { align: 'center' });

  // --- PRs ---
  const prs = window.charts.getPRData();
  if (prs.length > 0) {
    doc.addPage();
    doc.setFillColor(darkBg);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.height, 'F');

    doc.setTextColor(purple);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Personal Records', margin, 30);

    doc.setTextColor(textWhite);
    doc.setFontSize(12);
    let currentY = 50;

    const unit = window.storage.getSettings().units === 'metric' ? 'kg' : 'lbs';

    prs.forEach((pr, index) => {
      if (currentY > 270) {
        doc.addPage();
        doc.setFillColor(darkBg);
        doc.rect(0, 0, pageWidth, doc.internal.pageSize.height, 'F');
        currentY = 30;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${pr.name}`, margin, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textGray);
      doc.text(`Best: ${pr.bestWeight}${unit} for ${pr.bestReps} reps`, margin + 80, currentY);
      doc.text(`Date: ${window.ui.formatDateShort(pr.date)}`, margin + 140, currentY);
      doc.setTextColor(textWhite);
      
      currentY += 15;
    });
  }

  // --- Snapshot of Progress Page ---
  // We'll try to capture the charts area if visible
  const progressPage = document.getElementById('page-progress');
  if (progressPage && progressPage.classList.contains('active')) {
    try {
      const canvas = await window.html2canvas(progressPage, {
        backgroundColor: '#0F0F13',
        scale: 1.5,
        ignoreElements: (el) => el.tagName === 'BUTTON' || el.classList.contains('page-header')
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      doc.addPage();
      
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = pageWidth - (margin * 2);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      doc.addImage(imgData, 'JPEG', margin, margin, pdfWidth, pdfHeight);
    } catch (e) {
      console.error('Failed to capture charts:', e);
    }
  }

  doc.save(`workout-report-${d.toISOString().split('T')[0]}.pdf`);
  window.ui.showToast('PDF exported successfully!', 'success');
}

// Expose to global namespace
window.pdfExport = {
  exportPDF
};
