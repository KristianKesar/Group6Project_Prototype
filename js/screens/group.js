/* =========================================================
   SCREEN: Group week (coach)  –  US2, US4, US5
   Shows every runner × every day, and who needs attention.
   ========================================================= */

Screens.group = function () {
  const shownRunners = RUNNERS.filter(r => state.levelFilter === 'All' || r.level === state.levelFilter);
  const needAttention = RUNNERS.filter(r => getWeekSummary(r).needsAttention);

  return `
    ${pageHeader({
      kicker: 'Coach · Marathon group',
      title: 'Week 3 of 20',
      subtitle: `16–22 Nov · today Fri 20 Nov · ${RUNNERS.length} runners`
    })}

    <main>
      ${confirmationMessage()}

      ${needsAttentionCard(needAttention)}

      ${levelFilterButtons()}

      <section class="card compact">
        <div class="week-grid heading">
          <span>Runner (${shownRunners.length})</span>
          ${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((letter, day) =>
            `<span class="${day === TODAY ? 'today-column' : ''}">${letter}</span>`).join('')}
        </div>
        ${shownRunners.map(runnerGridRow).join('')}
      </section>

      <div class="legend">
        <span><i style="background:#1D4ED8"></i>Done</span>
        <span><i style="background:#FFEDD5;border:2px solid #C2410C"></i>Too fast</span>
        <span><i style="background:#C2410C"></i>Missed</span>
        <span><i style="border:2px solid #CBD5E1"></i>Upcoming</span>
        <span>✎ Changed by you</span>
      </div>
      <p class="small">Tap any runner to see their week. Runs sync from Strava (free accounts work) or are logged by hand.</p>
    </main>

    ${bottomMenu('group')}`;
};


// Orange box at the top listing runners to check first
function needsAttentionCard(runners) {
  const rows = runners.map(runner => `
    <button class="row-button" data-action="openRunner" data-value="${escapeHtml(runner.name)}">
      <div class="row">
        <span class="text-stack">
          <span class="title">${escapeHtml(runner.name)} · ${runner.level}</span>
          <span class="muted">${getWeekSummary(runner).reason}</span>
        </span>
        <span class="link-text">Review</span>
      </div>
    </button>`).join('');

  return `
    <section class="card warning">
      <h2 class="warning-title">Needs attention (${runners.length})</h2>
      ${rows || '<p class="muted">Everyone is on track or has been followed up.</p>'}
    </section>`;
}


// All / Beginner / Experienced / Expert
function levelFilterButtons() {
  const levels = ['All', 'Beginner', 'Experienced', 'Expert'];
  return `
    <div class="pill-row">
      ${levels.map(level => `
        <button class="pill ${level === state.levelFilter ? 'selected' : ''}" data-action="filterLevel" data-value="${level}">
          ${level}
        </button>`).join('')}
    </div>`;
}


// One line in the grid: name + 7 day circles
function runnerGridRow(runner) {
  const summary = getWeekSummary(runner);
  const days = [0, 1, 2, 3, 4, 5, 6];

  return `
    <button class="row-button" data-action="openRunner" data-value="${escapeHtml(runner.name)}" aria-label="Open ${escapeHtml(runner.name)}">
      <div class="week-grid">
        <span class="text-stack">
          <span class="runner-name">
            ${escapeHtml(runner.name)}
            ${summary.needsAttention ? '<span class="attention-dot" aria-label="needs attention">●</span>' : ''}
          </span>
          <span class="runner-level">${runner.level}</span>
        </span>
        ${days.map(day => dayDot(summary.sessions, day)).join('')}
      </div>
    </button>`;
}
