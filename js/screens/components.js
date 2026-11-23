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


// The menus at the bottom of the main screens.
// v2: coaches and runners have separate apps, so each gets its own menu.
const COACH_MENU = [
  { screen: 'group',  label: 'Group' },
  { screen: 'plans',  label: 'Plans' },
  { screen: 'invite', label: 'Invite' }
];
const RUNNER_MENU = [
  { screen: 'runnerWeek',     label: 'My week' },
  { screen: 'runnerNextWeek', label: 'Next week' },
  { screen: 'runnerProfile',  label: 'Profile' }
];

function bottomMenu(currentScreen) {
  const items = state.role === 'runner' ? RUNNER_MENU : COACH_MENU;

  const buttons = items.map(item => `
    <button data-action="goTo" data-value="${item.screen}" class="${item.screen === currentScreen ? 'current' : ''}"
            ${item.screen === currentScreen ? 'aria-current="page"' : ''}>
      ${item.label}
    </button>`).join('');

  return `<nav aria-label="Menu" class="${state.role === 'runner' ? 'runner-nav' : ''}"
               style="grid-template-columns: repeat(${items.length}, minmax(0, 1fr))">${buttons}</nav>`;
}


// v2: pop-up after the coach saves or sends a change, so they know it went through
// (usability test 1: "there was no indication that it was saved").
function popupBox() {
  if (!state.popup) return '';
  return `
    <div class="popup-backdrop">
      <div class="popup" role="alertdialog" aria-modal="true" aria-labelledby="popup-title" aria-describedby="popup-text">
        <div class="popup-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
        </div>
        <h2 id="popup-title">${escapeHtml(state.popup.title)}</h2>
        <p id="popup-text" class="muted">${escapeHtml(state.popup.text)}</p>
        <button class="button" data-action="closePopup">OK</button>
      </div>
    </div>`;
}


// Seven day buttons (or a subset) used by both edit screens
function dayPicker(days, selectedDay) {
  return `
    <div class="pill-grid ${days.length === 7 ? 'seven' : 'four'}">
      ${days.map(day => `
        <button class="pill ${day === selectedDay ? 'selected' : ''}" aria-pressed="${day === selectedDay}"
                data-action="pickDay" data-value="${day}">${DAY_NAMES[day]}</button>`).join('')}
    </div>`;
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
