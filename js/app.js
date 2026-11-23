/* =========================================================
   app.js – DRAWS THE SCREEN AND HANDLES CLICKS
   The loop is always the same:
     1. the user clicks a button with data-action="..."
     2. the matching function in "actions" changes "state"
     3. render() draws the screen again from "state"
   ========================================================= */

const appBox = document.getElementById('app');


/* ---------- Drawing ---------- */

function render(scrollToTop = false) {
  const drawScreen = Screens[state.screen];
  appBox.innerHTML = prototypeBanner() + drawScreen() + popupBox();

  if (scrollToTop) {
    const main = appBox.querySelector('main');
    if (main) main.scrollTo(0, 0);
  }

  // Put keyboard focus on the pop-up's OK button so it can be closed with Enter
  const popupButton = appBox.querySelector('.popup button');
  if (popupButton) popupButton.focus();

  // Keep the coach's and runners' changes so the other app can see them
  saveSharedState();
}

// The grey strip at the very top: who is logged in, and "Log out"
function prototypeBanner() {
  const who = state.role === 'runner'
    ? `${escapeHtml(state.viewingAsRunner)} (runner)`
    : 'Coach';

  return `<div class="prototype-banner">
      <span>Prototype v2 · Team 6 · logged in as ${who}</span>
      <button class="banner-button" data-action="logOutUser">Log out</button>
    </div>`;
}

// Change screen and start at the top of it
function goToScreen(screenName) {
  state.screen = screenName;
  return 'scrollToTop';
}


/* ---------- Actions ----------
   Each action gets the button's data-value (as text).
   Return 'scrollToTop' when the action opens a new screen. */

const actions = {

  /* Logging out goes back to the login page */
  logOutUser() {
    logOut();
    window.location.href = 'index.html';
  },

  /* Pop-up */
  closePopup() {
    state.popup = null;
  },

  /* Moving around */
  goTo(screenName) {
    return goToScreen(screenName);
  },
  openRunner(runnerName) {
    state.selectedRunner = runnerName;
    return goToScreen('runnerDetail');
  },

  /* Group screen */
  filterLevel(level) {
    state.levelFilter = level;
  },

  /* Runner detail screen */
  markCaughtUp() {
    state.caughtUp[state.selectedRunner] = true;
    state.confirmation = `${state.selectedRunner} marked as caught up.`;
  },
  pickMessage(index) {
    state.pickedMessage[state.selectedRunner] = Number(index);
  },
  sendMessage() {
    state.sentMessage[state.selectedRunner] = state.pickedMessage[state.selectedRunner] ?? 0;
  },

  /* Opening the edit screen for one session */
  editSession(dayIndex) {
    const runner = findRunner(state.selectedRunner);
    const session = getSessions(runner).find(s => s.dayIndex === Number(dayIndex));

    state.editForm = {
      mode: 'runner',
      dayIndex: session.dayIndex,
      day: Math.max(session.day, TODAY), // you can't move a session into the past
      km: session.km,
      pace: session.pace,
      note: session.note,
      aiApplied: false
    };
    return goToScreen('editSession');
  },

  /* Edit screen */
  pickDay(day)  { state.editForm.day = Number(day); },
  distanceDown() { state.editForm.km = Math.max(1, state.editForm.km - 0.5); },
  distanceUp()   { state.editForm.km = Math.min(42, state.editForm.km + 0.5); },
  paceFaster()   { state.editForm.pace = Math.max(180, state.editForm.pace - 5); },
  paceSlower()   { state.editForm.pace = Math.min(600, state.editForm.pace + 5); },

  applyAiSuggestion() {
    const runner = findRunner(state.selectedRunner);
    const session = getSessions(runner).find(s => s.dayIndex === state.editForm.dayIndex);
    const change = getAiSuggestion(runner, session).change;
    if (!change) return;

    state.editForm.day = Math.max(change.day, TODAY);
    state.editForm.km = change.km;
    state.editForm.pace = change.pace;
    state.editForm.note = change.note;
    state.editForm.aiApplied = true;
  },

  saveSession() {
    const runnerName = state.selectedRunner;
    const form = state.editForm;

    if (!state.sessionChanges[runnerName]) state.sessionChanges[runnerName] = {};
    state.sessionChanges[runnerName][form.dayIndex] = {
      day: form.day,
      km: form.km,
      pace: form.pace,
      note: form.note
    };

    const runner = findRunner(runnerName);
    const saved = getSessions(runner).find(s => s.dayIndex === form.dayIndex);
    state.popup = {
      title: 'Plan updated',
      text: `${runnerName}'s ${DAY_NAMES[saved.day]} session is now ${sessionName(saved)} at ${formatPace(saved.pace)}/km. ` +
            `${runnerName} will see the change next time they open the app.`
    };
    return goToScreen('runnerDetail');
  },

  /* Runner view */
  markDone(dayIndex) {
    const name = state.viewingAsRunner;
    if (!state.markedDoneByRunner[name]) state.markedDoneByRunner[name] = {};
    state.markedDoneByRunner[name][Number(dayIndex)] = true;
  },
  toggleStrava() {
    const name = state.viewingAsRunner;
    state.stravaConnected[name] = !state.stravaConnected[name];
  },

  /* Plans screen */
  pickPlanLevel(level) { state.planLevel = level; },

  sendPlan() {
    const level = state.planLevel;
    const wasUpdate = state.planSent[level] === 'changedSinceSent';
    // Runners get a copy, so later edits don't reach them until the coach sends again
    state.sentPlans[level] = JSON.parse(JSON.stringify(state.nextWeekPlans[level]));
    state.planSent[level] = 'sent';

    const count = runnersInLevel(level);
    state.popup = {
      title: wasUpdate ? 'Update sent' : 'Plan sent',
      text: `All ${count} ${level.toLowerCase()} runners can now see next week's plan in their app.`
    };
  },

  // Open the edit screen for one session of next week's group plan
  editPlanSession(index) {
    const level = state.planLevel;
    const session = state.nextWeekPlans[level].sessions[Number(index)];
    state.editForm = {
      mode: 'plan',
      level: level,
      index: Number(index),
      day: session.day,
      km: session.km,
      pace: session.pace,
      note: session.note
    };
    return goToScreen('editPlanSession');
  },

  savePlanSession() {
    const form = state.editForm;
    const session = state.nextWeekPlans[form.level].sessions[form.index];
    const unchanged = session.day === form.day && session.km === form.km &&
                      session.pace === form.pace && session.note === form.note;

    if (!unchanged) {
      Object.assign(session, { day: form.day, km: form.km, pace: form.pace, note: form.note, changed: true });
      if (state.planSent[form.level]) state.planSent[form.level] = 'changedSinceSent';
    }

    const count = runnersInLevel(form.level);
    state.popup = unchanged
      ? { title: 'No changes', text: 'You didn\'t change anything, so the plan stays the same.' }
      : { title: 'Plan updated',
          text: `${DAY_NAMES[session.day]} is now ${sessionName(session)} at ${formatPace(session.pace)}/km for all ${count} ` +
                `${form.level.toLowerCase()} runners. Tap Send when the plan is ready.` };
    return goToScreen('plans');
  },

  /* Invite screen */
  copyLink() {
    state.linkCopied = true;
    try { navigator.clipboard.writeText(INVITE_LINK); } catch (error) { /* not allowed on some browsers – fine for a prototype */ }
  },
  acceptJoiner(name) { state.acceptedJoiners[name] = true; }
};


/* ---------- Listening for the user ---------- */

// Button clicks
appBox.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const action = actions[button.dataset.action];
  if (!action) {
    console.warn('No action called', button.dataset.action);
    return;
  }

  state.confirmation = ''; // old "Saved" messages disappear on the next click
  loadSharedState();       // pick up changes the other app made, so we never save over them
  const result = action(button.dataset.value);
  render(result === 'scrollToTop');
});

// Typing in the note box (we save the text but don't redraw, so typing isn't interrupted)
appBox.addEventListener('input', event => {
  if (event.target.dataset.input === 'editNote') {
    state.editForm.note = event.target.value;
  }
});

// Escape closes the pop-up
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && state.popup) {
    state.popup = null;
    render();
  }
});


// The other app (in another tab) saved a change: load it and redraw
window.addEventListener('storage', event => {
  if (event.key === DATA_KEY) {
    loadSharedState();
    render();
  }
});

// Coming back to this page (switching tabs, or the browser's Back button showing
// a saved copy of the page): check who is logged in and load the latest changes.
function refreshFromStorage() {
  const user = getLoggedInUser();
  if (!user || user.role !== APP_ROLE || (APP_ROLE === 'runner' && user.name !== state.viewingAsRunner)) {
    window.location.replace(APP_ROLE === 'runner' && user && user.role === 'runner' ? 'runner.html' : 'index.html');
    return;
  }
  loadSharedState();
  render();
}
window.addEventListener('pageshow', event => { if (event.persisted) refreshFromStorage(); });
window.addEventListener('focus', refreshFromStorage);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') refreshFromStorage();
});


/* ---------- Start ----------
   Only start if the right kind of user logged in on index.html;
   otherwise go back to the login page. */
if (!LOGGED_IN_USER || LOGGED_IN_USER.role !== APP_ROLE) {
  window.location.replace('index.html');
} else {
  render(true);
}
