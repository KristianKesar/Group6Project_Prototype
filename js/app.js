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
  appBox.innerHTML = '<div class="prototype-banner">Prototype v1 · Team 6 · sample data</div>' + drawScreen();

  if (scrollToTop) {
    const main = appBox.querySelector('main');
    if (main) main.scrollTo(0, 0);
  }
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

  /* Moving around */
  goTo(screenName) {
    return goToScreen(screenName);
  },
  openRunner(runnerName) {
    state.selectedRunner = runnerName;
    return goToScreen('runnerDetail');
  },
  viewAsRunner(runnerName) {
    state.viewingAsRunner = runnerName;
    return goToScreen('runnerView');
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

    state.confirmation = `Saved. ${runnerName} will see the change in their week.`;
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
  sendPlan() { state.planSent[state.planLevel] = true; },

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
  const result = action(button.dataset.value);
  render(result === 'scrollToTop');
});

// Typing in the note box (we save the text but don't redraw, so typing isn't interrupted)
appBox.addEventListener('input', event => {
  if (event.target.dataset.input === 'editNote') {
    state.editForm.note = event.target.value;
  }
});

// The "view as" dropdown on the runner screen
appBox.addEventListener('change', event => {
  if (event.target.dataset.change === 'viewAs') {
    state.viewingAsRunner = event.target.value;
    render(true);
  }
});


/* ---------- Start ---------- */
render(true);
