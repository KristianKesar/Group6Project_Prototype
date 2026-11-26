/* =========================================================
   SCREEN: Edit session (coach)  –  US6, US7 + AI suggestion
   The coach changes one session for one runner.
   The purple panel at the top suggests a change; the coach
   can apply it, change it, or ignore it.
   ========================================================= */

Screens.editSession = function () {
  const runner = findRunner(state.selectedRunner);
  const form = state.editForm;
  const session = getSessions(runner).find(s => s.dayIndex === form.dayIndex);
  const planned = originalSession(runner, form.dayIndex);

  return `
    ${pageHeader({
      title: 'Edit session',
      subtitle: `${runner.name} · ${DAY_NAMES[form.dayIndex]} · ${planned.type} ${planned.km} km at ` +
                `${formatPace(planned.pace)}/km${session.status === 'missed' ? ' · missed' : ''}`,
      backTo: 'runnerDetail',
      backLabel: runner.name
    })}

    <main>
      ${aiSuggestionPanel(runner, session)}

      <section class="card">
        <h2>Day</h2>
        ${dayPicker([4, 5, 6, 7], form.day)}
      </section>

      <section class="card">
        ${stepperRow('Distance', `Planned ${planned.km} km`, `${form.km} km`, 'distanceDown', 'distanceUp',
                     'Decrease distance', 'Increase distance')}
        ${stepperRow('Target pace', 'Per km', formatPace(form.pace), 'paceFaster', 'paceSlower',
                     'Faster pace', 'Slower pace')}
      </section>

      <section class="card">
        <label for="note" class="title">Note to ${escapeHtml(runner.name)} (optional)</label>
        <input id="note" type="text" data-input="editNote" placeholder="e.g. Keep it easy, chat pace"
               value="${escapeHtml(form.note)}">
      </section>

      <p class="muted">Only ${escapeHtml(runner.name)}'s plan changes. The rest of the group stays the same.</p>
    </main>

    <div class="bottom-bar">
      <button class="button" data-action="saveSession">Save and notify ${escapeHtml(runner.name)}</button>
    </div>`;
};


// The purple "AI suggestion" box
function aiSuggestionPanel(runner, session) {
  const suggestion = getAiSuggestion(runner, session);
  const dataSource = state.stravaConnected[runner.name] ? 'Strava' : 'logged';

  let changeBox = '';
  if (suggestion.change) {
    const c = suggestion.change;
    const movedIntervals = session.type.startsWith('Intervals') && c.day !== session.dayIndex;
    const type = movedIntervals ? 'Easy' : session.type;

    changeBox = `
      <div class="ai-change">
        ${DAY_NAMES[c.day]} · ${escapeHtml(type)} ${c.km} km at ${formatPace(c.pace)}/km
        ${c.note ? `<span class="small">Note: “${escapeHtml(c.note)}”</span>` : ''}
      </div>
      ${state.editForm.aiApplied
        ? '<p class="confirmation ai-applied" role="status">Applied below. Change anything before you save.</p>'
        : '<button class="button ai" data-action="applyAiSuggestion">Apply suggestion</button>'}`;
  }

  return `
    <section class="card ai-panel" aria-labelledby="ai-title">
      <div class="ai-heading">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3l1.8 4.7L18 9.5l-4.2 1.8L12 16l-1.8-4.7L6 9.5l4.2-1.8z"/>
          <path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>
        </svg>
        <h2 id="ai-title">AI suggestion: ${escapeHtml(suggestion.title)}</h2>
      </div>
      <ul>${suggestion.reasons.map(reason => `<li>${escapeHtml(reason)}</li>`).join('')}</ul>
      ${changeBox}
      <p class="small">Based on this week's ${dataSource} runs. A starting point only. You decide. No medical or diet advice.</p>
    </section>`;
}


// A label on the left, a − value + control on the right
function stepperRow(label, hint, value, downAction, upAction, downLabel, upLabel) {
  return `
    <div class="setting-row">
      <span class="text-stack"><span class="title">${label}</span><span class="small">${hint}</span></span>
      <div class="stepper">
        <button class="stepper-button" data-action="${downAction}" aria-label="${downLabel}">−</button>
        <span class="stepper-value">${value}</span>
        <button class="stepper-button" data-action="${upAction}" aria-label="${upLabel}">+</button>
      </div>
    </div>`;
}
