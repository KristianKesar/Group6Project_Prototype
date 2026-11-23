/* =========================================================
   SCREEN: Plans (coach)  –  US4
   The app's first-draft plan for next week, one per level.
   v2: the coach can edit any session before sending, using the
   same day / distance / pace controls as for one runner
   (usability test 2: "users wanted more control over the plans").
   ========================================================= */

// How many runners are in a level (so the count is never hard-coded)
function runnersInLevel(level) {
  return RUNNERS.filter(r => r.level === level).length;
}

// A plan's sessions in day order, keeping each one's position in the list
function sessionsByDay(plan) {
  return plan.sessions
    .map((session, index) => ({ ...session, index }))
    .sort((a, b) => a.day - b.day);
}

Screens.plans = function () {
  const level = state.planLevel;
  const plan = state.nextWeekPlans[level];
  const count = runnersInLevel(level);
  const levelLower = level.toLowerCase();
  const sentStatus = state.planSent[level];

  let sendPart;
  if (sentStatus === 'sent') {
    sendPart = `<p class="confirmation" role="status">Sent to ${count} ${levelLower} runners. Edit a session to send an update.</p>`;
  } else if (sentStatus === 'changedSinceSent') {
    sendPart = `
      <p class="small warning-title">You changed this plan after sending it. Runners still see the old version.</p>
      <button class="button" data-action="sendPlan">Send update to ${count} ${levelLower} runners</button>`;
  } else {
    sendPart = `<button class="button" data-action="sendPlan">Send to ${count} ${levelLower} runners</button>`;
  }

  return `
    ${pageHeader({ kicker: 'Coach · Plans', title: 'Next week (week 4)', subtitle: '23–29 Nov · first draft per level' })}

    <main>
      ${confirmationMessage()}

      <div class="pill-grid three">
        ${Object.keys(state.nextWeekPlans).map(name => `
          <button aria-pressed="${name === level}" class="pill ${name === level ? 'selected' : ''}"
                  data-action="pickPlanLevel" data-value="${name}">${name}</button>`).join('')}
      </div>

      <p class="card muted">
        Drafted by the app from this group's last 3 weeks. Tap <strong>Edit</strong> to change any session
        before you send it. Runners only see the plan after you send it.
      </p>

      <section class="card compact">
        <h2>${level} · ${count} runners</h2>
        ${sessionsByDay(plan).map(planSessionRow).join('')}
        <p class="small">${plan.focus}</p>
      </section>

      ${sendPart}
    </main>

    ${bottomMenu('plans')}`;
};


// "Tue · Intervals 5 × 1 km (8 km)   changed   [Edit]"
function planSessionRow(session) {
  const details = [`${formatPace(session.pace)}/km`, formatDuration(session.km, session.pace)];
  if (session.note) details.push(escapeHtml(session.note));

  return `
    <div class="row">
      <span class="text-stack">
        <span class="title">${DAY_NAMES[session.day]} · ${escapeHtml(sessionName(session))}${session.changed ? '<span class="tag">changed</span>' : ''}</span>
        <span class="small">${details.join(' · ')}</span>
      </span>
      <button class="button small" data-action="editPlanSession" data-value="${session.index}"
              aria-label="Edit ${DAY_NAMES[session.day]} session">Edit</button>
    </div>`;
}


/* =========================================================
   SCREEN: Edit plan session (coach)  –  US4
   Same controls as editing one runner, but the change applies to
   everyone in the level's plan for next week.
   ========================================================= */

Screens.editPlanSession = function () {
  const form = state.editForm;
  const plan = state.nextWeekPlans[form.level];
  const original = NEXT_WEEK_DRAFTS[form.level].sessions[form.index];
  const count = runnersInLevel(form.level);

  // Warn if another session is already on the picked day
  const clash = plan.sessions.find((s, i) => i !== form.index && s.day === form.day);

  return `
    ${pageHeader({
      title: 'Edit plan session',
      subtitle: `${form.level} group · next week · drafted ${DAY_NAMES[original.day]} ${sessionName(original)} at ${formatPace(original.pace)}/km`,
      backTo: 'plans',
      backLabel: 'Plans'
    })}

    <main>
      <section class="card">
        <h2>Day</h2>
        ${dayPicker([0, 1, 2, 3, 4, 5, 6], form.day)}
        ${clash ? `<p class="small warning-title" role="status">${DAY_NAMES[form.day]} already has ${escapeHtml(sessionName(clash))}. Runners would have two sessions that day.</p>` : ''}
      </section>

      <section class="card">
        ${stepperRow('Distance', `Drafted ${original.km} km`, `${form.km} km`, 'distanceDown', 'distanceUp',
                     'Decrease distance', 'Increase distance')}
        ${stepperRow('Target pace', 'Per km', formatPace(form.pace), 'paceFaster', 'paceSlower',
                     'Faster pace', 'Slower pace')}
      </section>

      <section class="card">
        <label for="note" class="title">Note to the group (optional)</label>
        <input id="note" type="text" data-input="editNote" placeholder="e.g. Keep it easy, chat pace"
               value="${escapeHtml(form.note)}">
      </section>

      <p class="muted">This changes next week's plan for all ${count} ${form.level.toLowerCase()} runners.
        To change one runner, open them from Group.</p>
    </main>

    <div class="bottom-bar">
      <button class="button" data-action="savePlanSession">Save change</button>
    </div>`;
};
