/* =========================================================
   SCREEN: Plans (coach)  –  US3
   The app's first-draft plan for next week, one per level.
   ========================================================= */

Screens.plans = function () {
  const level = state.planLevel;
  const draft = NEXT_WEEK_DRAFTS[level];
  const levelLower = level.toLowerCase();

  return `
    ${pageHeader({ kicker: 'Coach · Plans', title: 'Next week (week 4)', subtitle: '23–29 Nov · first draft per level' })}

    <main>
      <div class="pill-grid three" role="tablist">
        ${Object.keys(NEXT_WEEK_DRAFTS).map(name => `
          <button role="tab" aria-selected="${name === level}" class="pill ${name === level ? 'selected' : ''}"
                  data-action="pickPlanLevel" data-value="${name}">${name}</button>`).join('')}
      </div>

      <p class="card muted">
        Drafted by the app from this group's last 3 weeks. Change any session before you send it,
        or change one runner later from their page.
      </p>

      <section class="card compact">
        <h2>${level} · ${draft.runnerCount} runners</h2>
        ${draft.sessions.map(s => `
          <div class="row">
            <span class="text-stack">
              <span class="title">${s.day} · ${s.what}</span>
              <span class="small">${s.detail}</span>
            </span>
          </div>`).join('')}
        <p class="small">${draft.focus}</p>
      </section>

      ${state.planSent[level]
        ? `<p class="confirmation" role="status">Sent to ${draft.runnerCount} ${levelLower} runners</p>`
        : `<button class="button" data-action="sendPlan">Send to ${draft.runnerCount} ${levelLower} runners</button>`}
    </main>

    ${bottomMenu('plans')}`;
};
