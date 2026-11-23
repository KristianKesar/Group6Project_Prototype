/* =========================================================
   RUNNER APP  –  US6, US7, US8
   v2: runners get their own app (runner.html) with their own menu
   (My week / Next week / Profile) instead of a "Runner view" tab
   inside the coach app (usability test 3).
   ========================================================= */


/* ---------- Runner: My week ---------- */

Screens.runnerWeek = function () {
  const runner = findRunner(state.viewingAsRunner);
  const summary = getWeekSummary(runner);
  const changedSessions = summary.sessions.filter(s => s.changedByCoach);
  const sentMessageIndex = state.sentMessage[runner.name];
  const nextWeekReady = state.sentPlans[runner.level];

  return `
    ${runnerHeader(runner, 'My week', `Week 3 of 20 · 16–22 Nov · goal ${runner.goalTime}`)}

    <main>
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

      ${nextWeekReady ? `
        <button class="row-button card horizontal" data-action="goTo" data-value="runnerNextWeek">
          <span class="text-stack">
            <span class="title">Next week's plan is ready</span>
            <span class="small">${nextWeekReady.sessions.length} sessions from your coach</span>
          </span>
          <span class="link-text">View</span>
        </button>` : ''}
    </main>

    ${bottomMenu('runnerWeek')}`;
};


/* ---------- Runner: Next week ---------- */

Screens.runnerNextWeek = function () {
  const runner = findRunner(state.viewingAsRunner);
  const plan = state.sentPlans[runner.level];

  let content;
  if (!plan) {
    content = `
      <section class="card">
        <h2>Not ready yet</h2>
        <p class="muted">Your coach hasn't sent next week's plan yet. You'll see it here as soon as they do.</p>
      </section>`;
  } else {
    content = `
      <section class="card compact">
        <h2>Week 4 · 23–29 Nov</h2>
        ${[0, 1, 2, 3, 4, 5, 6].map(day => {
          const sessions = plan.sessions.filter(s => s.day === day);
          if (sessions.length === 0) {
            return `<div class="row"><span class="text-stack"><span class="title">${DAY_NAMES[day]} · Rest</span></span></div>`;
          }
          return sessions.map(s => `
            <div class="row">
              <span class="text-stack">
                <span class="title">${DAY_NAMES[day]} · ${escapeHtml(sessionName(s))}${s.changed ? '<span class="tag">changed by coach</span>' : ''}</span>
                <span class="small">Target ${formatPace(s.pace)}/km · about ${formatDuration(s.km, s.pace)}</span>
                ${s.note ? `<span class="small">Coach: “${escapeHtml(s.note)}”</span>` : ''}
              </span>
            </div>`).join('');
        }).join('')}
        <p class="small">${escapeHtml(plan.focus)}</p>
      </section>`;
  }

  return `
    ${runnerHeader(runner, 'Next week', 'Week 4 of 20 · 23–29 Nov')}
    <main>${content}</main>
    ${bottomMenu('runnerNextWeek')}`;
};


/* ---------- Runner: Profile ---------- */

Screens.runnerProfile = function () {
  const runner = findRunner(state.viewingAsRunner);

  return `
    ${runnerHeader(runner, 'Profile', `${runner.level} · goal ${runner.goalTime}`)}

    <main>
      <section class="card compact">
        <h2>My marathon</h2>
        <div class="row"><span class="title">Level</span><span>${runner.level}</span></div>
        <div class="row"><span class="title">Goal time</span><span>${runner.goalTime}</span></div>
        <div class="row"><span class="title">Training block</span><span>Week 3 of 20</span></div>
      </section>

      ${stravaCard(runner)}
    </main>

    ${bottomMenu('runnerProfile')}`;
};


// Blue header used on every runner screen
function runnerHeader(runner, title, subtitle) {
  return pageHeader({ kicker: `Hi ${runner.name}`, title, subtitle, isRunnerScreen: true });
}


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


// US7: connect or disconnect Strava at any time
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
