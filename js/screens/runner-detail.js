/* =========================================================
   SCREEN: Runner detail (coach)  –  US5, US6, US7, US10
   One runner's week: plan vs actual, history, quick feedback.
   ========================================================= */

Screens.runnerDetail = function () {
  const runner = findRunner(state.selectedRunner);
  const summary = getWeekSummary(runner);
  const hasStrava = state.stravaConnected[runner.name];

  return `
    ${pageHeader({
      title: runner.name,
      subtitle: `${runner.level} · goal ${runner.goalTime} · ${hasStrava ? 'Strava connected' : 'No Strava, logs runs by hand'}`,
      backTo: 'group',
      backLabel: 'Group'
    })}

    <main>
      ${confirmationMessage()}
      ${summary.needsAttention ? attentionBox(summary) : ''}

      <div class="stats">
        <div class="stat"><span class="small">Done so far</span><b>${summary.done} of ${summary.dueSoFar}</b></div>
        <div class="stat"><span class="small">Missed</span><b>${summary.missed}</b></div>
        <div class="stat"><span class="small">Too fast</span><b>${summary.tooFast}</b></div>
      </div>

      <section class="card compact">
        <h2>This week · plan vs actual</h2>
        ${summary.sessions.map(sessionRowWithEdit).join('')}
      </section>

      ${trainingHistory(runner, summary.sessions)}

      ${feedbackCard(runner)}

      <p class="small">To see what ${escapeHtml(runner.name)} sees, open the login page in another tab and log in as ${escapeHtml(runner.name)}.</p>
    </main>`;
};


function attentionBox(summary) {
  return `
    <section class="card warning horizontal">
      <span class="text-stack">
        <span class="title warning-title">Needs attention</span>
        <span class="muted">${summary.reason}</span>
      </span>
      <button class="button small" data-action="markCaughtUp">Mark caught up</button>
    </section>`;
}


// "Tue · Easy 5 km   Done  [Edit]"
function sessionRowWithEdit(session) {
  let detail;
  if (session.status === 'done' || session.status === 'too-fast') {
    const source = session.loggedByHand ? 'logged' : 'synced';
    detail = `Plan ${formatPace(session.pace)}/km · ${source} ${session.actualKm} km at ${formatPace(session.actualPace)}/km`;
  } else if (session.status === 'missed') {
    detail = 'No run synced';
  } else {
    detail = `Target ${formatPace(session.pace)}/km`;
  }

  return `
    <div class="row">
      <span class="text-stack">
        <span class="title">${DAY_NAMES[session.day]} · ${escapeHtml(sessionName(session))}${changedTag(session)}</span>
        <span class="small">${detail}</span>
      </span>
      <span class="row-actions">
        ${statusWord(session)}
        <button class="button small" data-action="editSession" data-value="${session.dayIndex}"
                aria-label="Edit ${DAY_NAMES[session.day]} session">Edit</button>
      </span>
    </div>`;
}


// US10: completed runs imported from Strava (date, distance, duration)
function trainingHistory(runner, sessions) {
  const completed = sessions.filter(s => s.status === 'done' || s.status === 'too-fast');
  const hasStrava = state.stravaConnected[runner.name];

  let content;
  if (!hasStrava && completed.length === 0) {
    content = '<p class="muted">Not connected to Strava. Runs appear here when the runner logs them.</p>';
  } else if (completed.length === 0) {
    content = '<p class="muted">No runs yet this week.</p>';
  } else {
    content = completed.map(s => `
      <div class="row">
        <span class="text-stack">
          <span class="title">${DAY_DATES[s.dayIndex]} · ${s.actualKm} km</span>
          <span class="small">${formatDuration(s.actualKm, s.actualPace)} · ${formatPace(s.actualPace)}/km ·
            ${s.loggedByHand ? 'logged by runner' : 'from Strava'}</span>
        </span>
      </div>`).join('');
  }

  return `<section class="card"><h2>Training history</h2>${content}</section>`;
}


// Pick a ready-made message and send it
function feedbackCard(runner) {
  const picked = state.pickedMessage[runner.name] ?? 0;
  const alreadySent = state.sentMessage[runner.name] === picked;

  const choices = FEEDBACK_MESSAGES.map((message, index) => `
    <button class="message-choice ${index === picked ? 'selected' : ''}" data-action="pickMessage" data-value="${index}">
      ${escapeHtml(message)}
    </button>`).join('');

  const sendPart = alreadySent
    ? `<p class="confirmation" role="status">Sent. ${escapeHtml(runner.name)} will see it in their week.</p>`
    : `<button class="button secondary" data-action="sendMessage">Send to ${escapeHtml(runner.name)}</button>`;

  return `<section class="card"><h2>Quick feedback</h2>${choices}${sendPart}</section>`;
}
