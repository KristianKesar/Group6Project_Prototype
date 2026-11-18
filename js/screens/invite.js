/* =========================================================
   SCREEN: Invite (coach)  –  US1
   Runners join with a link; the coach confirms their level.
   ========================================================= */

Screens.invite = function () {
  const placesUsed = RUNNERS.length + Object.keys(state.acceptedJoiners).length;

  return `
    ${pageHeader({ kicker: 'Coach · Invite', title: 'Add runners to your group', subtitle: `${placesUsed} of ${MAX_GROUP_SIZE} places used` })}

    <main>
      <section class="card">
        <h2>Group invite link</h2>
        <p class="muted">
          Share it in your club WhatsApp. Runners tap it, pick their level and connect Strava.
          You don't type anyone's details.
        </p>
        <div class="invite-link">${INVITE_LINK}</div>
        <button class="button" data-action="copyLink">${state.linkCopied ? 'Link copied' : 'Copy invite link'}</button>
      </section>

      <section class="card compact">
        <h2>Who wants to join</h2>
        <p class="muted">You confirm their level before they get a plan.</p>
        ${JOIN_REQUESTS.map(person => `
          <div class="row">
            <span class="text-stack">
              <span class="title">${person.name}</span>
              <span class="small">${person.detail}</span>
            </span>
            ${state.acceptedJoiners[person.name]
              ? '<span class="status-done">Added</span>'
              : `<button class="button small" data-action="acceptJoiner" data-value="${person.name}">Accept</button>`}
          </div>`).join('')}
      </section>
    </main>

    ${bottomMenu('invite')}`;
};
