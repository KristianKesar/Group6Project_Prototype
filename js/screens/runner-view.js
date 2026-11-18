/* =========================================================
   SCREEN: Runner view  –  US8, US9, US10
   What a runner sees on their phone. In the prototype you can
   switch which runner you are pretending to be.
   ========================================================= */

Screens.runnerView = function () {
  const runner = findRunner(state.viewingAsRunner);
  const summary = getWeekSummary(runner);
  const changedSessions = summary.sessions.filter(s => s.changedByCoach);
  const sentMessageIndex = state.sentMessage[runner.name];

  return `
    ${pageHeader({
      kicker: 'Runner view',
      title: `Hi ${runner.name} · My week`,
      subtitle: `Week 3 of 20 · 16–22 Nov · goal ${runner.goalTime}`,
      isRunnerScreen: true
    })}

    <main>
      <section class="card">
        <label for="view-as" class="title">Prototype: view as</label>
        <select id="view-as" data-change="viewAs">
          ${RUNNERS.map(r => `<option ${r.name === runner.name ? 'selected' : ''}>${escapeHtml(r.name)}</option>`).join('')}
        </select>
      </section>

      ${changedSessions.length ? coachChangesCard(changedSessions) : ''}

      ${sentMessageIndex !== undefined ? `
        <section class="card">
          <h2>Message from your coach</h2>
          <p class="muted">“${escapeHtml(FEEDBACK_MESSAGES[sentMessageIndex])}”</p>
        </section>` : ''}

      <section class="card compact">
        <h2>This week</h2>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(day => runnerDayRows(summary.sessions, day)).join('')}
      </section>

      ${stravaCard(runner)}
    </main>

    ${bottomMenu('runnerView')}`;
};


// Blue box listing what the coach changed
function coachChangesCard(sessions) {
  const lines = sessions.map(s => `
    <p style="margin:0;font-size:14px">
      <strong>${DAY_NAMES[s.day]}: ${escapeHtml(sessionName(s))} at ${formatPace(s.pace)}/km</strong>
      ${s.day !== s.dayIndex ? `(moved from ${DAY_NAMES[s.dayIndex]})` : ''}
    </p>
    ${s.note ? `<p class="muted">Coach: “${escapeHtml(s.note)}”</p>` : ''}`).join('');

  return `
    <section class="card info" role="status">
      <h2>Your coach changed your plan</h2>
      ${lines}
    </section>`;
}


// The row(s) for one day in the runner's week. Today is highlighted.
function runnerDayRows(sessions, day) {
  const sessionsToday = sessions.filter(s => s.day === day);
  const isToday = day === TODAY;
  const dayLabel = `${DAY_NAMES[day]}${isToday ? ' · Today' : ''}`;

  // Rest day (we only show "Next Mon" if something was moved there)
  if (sessionsToday.length === 0) {
    if (day === 7) return '';
    const movedAway = sessions.some(s => s.dayIndex === day);
    return `
      <div class="row ${isToday ? 'today' : ''}">
        <span class="text-stack">
          <span class="title">${dayLabel} · Rest</span>
          <span class="small">${movedAway ? 'Session moved by coach' : 'Stretch or walk if you like'}</span>
        </span>
      </div>`;
  }

  return sessionsToday.map(s => {
    let right;
    if (s.status === 'done' || s.status === 'too-fast') right = '<span class="status-done">Done</span>';
    else if (s.status === 'missed') right = '<span class="status-problem">Missed</span>';
    else if (day <= TODAY) right = `<button class="button small" data-action="markDone" data-value="${s.dayIndex}">Mark done</button>`;
    else right = '<span class="status-upcoming">Upcoming</span>';

    const ran = s.actualKm ? ` · ran ${s.actualKm} km at ${formatPace(s.actualPace)}/km` : '';

    return `
      <div class="row ${isToday ? 'today' : ''}">
        <span class="text-stack">
          <span class="title">${dayLabel} · ${escapeHtml(sessionName(s))}${changedTag(s, 'changed by coach')}</span>
          <span class="small">Target ${formatPace(s.pace)}/km${ran}</span>
        </span>
        ${right}
      </div>`;
  }).join('');
}


// US10: connect or disconnect Strava at any time
function stravaCard(runner) {
  const connected = state.stravaConnected[runner.name];
  return `
    <section class="card horizontal">
      <span class="text-stack">
        <span class="title">Strava</span>
        <span class="small">${connected
          ? 'Connected. Runs sync to your coach automatically. Free account works.'
          : 'Not connected. Tap Mark done to log a run by hand.'}</span>
      </span>
      <button class="switch ${connected ? 'on' : ''}" data-action="toggleStrava" aria-pressed="${connected}">
        ${connected ? 'On' : 'Off'}
      </button>
    </section>`;
}
