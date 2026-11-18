/* =========================================================
   components.js – PIECES USED ON MORE THAN ONE SCREEN

   How screens work:
   Each screen file adds a function to the "Screens" object.
   The function returns the screen's HTML as text.
   app.js picks the right one based on state.screen.

   How buttons work:
   Every button has  data-action="someAction"  and sometimes
   data-value="something". app.js looks up "someAction" in its
   list of actions and runs it. Search app.js for the action name
   to see what a button does.
   ========================================================= */

const Screens = {};


// The dark (coach) or blue (runner) bar at the top of each screen
function pageHeader({ kicker = '', title, subtitle = '', backTo = '', backLabel = '', isRunnerScreen = false }) {
  const backButton = backTo
    ? `<button class="back-button" data-action="goTo" data-value="${backTo}">
         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
         ${escapeHtml(backLabel)}
       </button>`
    : '';

  return `
    <header class="${isRunnerScreen ? 'runner-header' : ''}">
      ${backButton}
      ${kicker ? `<p class="kicker">${escapeHtml(kicker)}</p>` : ''}
      <h1>${escapeHtml(title)}</h1>
      ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ''}
    </header>`;
}


// The menu at the bottom of the main screens
function bottomMenu(currentScreen) {
  const items = [
    { screen: 'group',      label: 'Group' },
    { screen: 'plans',      label: 'Plans' },
    { screen: 'invite',     label: 'Invite' },
    { screen: 'runnerView', label: 'Runner view' }
  ];

  const buttons = items.map(item => `
    <button data-action="goTo" data-value="${item.screen}" class="${item.screen === currentScreen ? 'current' : ''}">
      ${item.label}
    </button>`).join('');

  return `<nav aria-label="Menu">${buttons}</nav>`;
}


// A blue "Saved" style message, shown once after an action
function confirmationMessage() {
  if (!state.confirmation) return '';
  return `<p class="confirmation" role="status">${escapeHtml(state.confirmation)}</p>`;
}


// One circle in the weekly grid for one runner on one day
function dayDot(sessions, day) {
  const sessionToday = sessions.find(s => s.day === day);

  if (sessionToday) {
    const s = sessionToday;

    if (s.status === 'upcoming' && day === TODAY) {
      return dot('today', s.changedByCoach ? '✎' : '•', 'Today');
    }

    const looks = {
      'done':     { symbol: '✓', label: 'Done' },
      'too-fast': { symbol: '!', label: 'Done, too fast' },
      'missed':   { symbol: '✕', label: 'Missed' },
      'upcoming': { symbol: s.changedByCoach ? '✎' : '',
                    label: s.changedByCoach ? 'Upcoming, changed by coach' : 'Upcoming' }
    };
    return dot(s.status, looks[s.status].symbol, looks[s.status].label);
  }

  // Nothing on this day now, but something was moved away from it
  const movedAway = sessions.some(s => s.dayIndex === day && s.day !== day);
  if (movedAway) return dot('moved', '→', 'Moved by coach');

  return dot('rest', '–', 'Rest day');
}

function dot(cssClass, symbol, label) {
  return `<span class="dot ${cssClass}" title="${label}" aria-label="${label}">${symbol}</span>`;
}


// Status word on the right of a session row
function statusWord(session) {
  switch (session.status) {
    case 'done':     return '<span class="status-done">Done</span>';
    case 'too-fast': return '<span class="status-problem">Too fast</span>';
    case 'missed':   return '<span class="status-problem">Missed</span>';
    default:         return `<span class="status-upcoming">${session.day === TODAY ? 'Today' : 'Upcoming'}</span>`;
  }
}

function changedTag(session, text = 'changed') {
  return session.changedByCoach ? `<span class="tag">${text}</span>` : '';
}
