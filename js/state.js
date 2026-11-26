/* =========================================================
   state.js – WHAT THE APP REMEMBERS
   Every click changes something in "state", then the screen is
   drawn again from it. Nothing is saved when you close the page.
   ========================================================= */

// Where the login and the shared changes are kept in the browser (see the bottom of this file)
const USER_KEY = 'marathonCoach.user';
const DATA_KEY = 'marathonCoach.v2.data';

// Which app this page is, and who logged in on the login page (index.html)
const APP_ROLE = document.body.dataset.app;
const LOGGED_IN_USER = getLoggedInUser();

const state = {
  // v2: which app this page is – 'coach' (coach.html) or 'runner' (runner.html).
  // It is set on the <body> tag of each page.
  role: APP_ROLE,

  // Which screen is showing.
  //   Coach:  'group', 'runnerDetail', 'editSession', 'plans', 'editPlanSession', 'invite'
  //   Runner: 'runnerWeek', 'runnerNextWeek', 'runnerProfile'
  screen: APP_ROLE === 'runner' ? 'runnerWeek' : 'group',

  // Short message shown after an action, e.g. "Marked as caught up."
  confirmation: '',

  // v2: pop-up shown after a change is saved or sent: { title, text }
  popup: null,

  // Group screen: which level filter is selected
  levelFilter: 'All',

  // Which runner the coach has open
  selectedRunner: 'Seán',

  // Runner app: which runner is logged in
  viewingAsRunner: LOGGED_IN_USER && LOGGED_IN_USER.role === 'runner' ? LOGGED_IN_USER.name : 'Seán',

  // Coach changes to sessions, per runner and per weekday index:
  //   sessionChanges['Seán'][3] = { day: 5, km: 5, pace: 405, note: '...' }
  sessionChanges: {},

  // The edit form while the coach is changing a session.
  //   One runner:     { mode: 'runner', dayIndex, day, km, pace, note, aiApplied }
  //   A group plan:   { mode: 'plan', level, index, day, km, pace, note }
  editForm: null,

  // Feedback: which message is picked and which one was sent, per runner
  pickedMessage: {},
  sentMessage: {},

  // Runners the coach has marked as "caught up" (removes them from Needs attention)
  caughtUp: {},

  // Sessions a runner ticked "Mark done" by hand, per runner and day index
  markedDoneByRunner: {},

  // Strava on/off per runner (starts from the sample data)
  stravaConnected: {},

  // Plans screen
  planLevel: 'Experienced',
  // v2: the coach's editable copy of next week's draft, per level
  nextWeekPlans: JSON.parse(JSON.stringify(NEXT_WEEK_DRAFTS)),
  // 'sent' or 'changedSinceSent', per level
  planSent: {},
  // The version runners actually received, per level
  sentPlans: {},

  // Invite screen
  linkCopied: false,
  acceptedJoiners: {}
};

// Copy each runner's starting Strava setting into state
RUNNERS.forEach(runner => {
  state.stravaConnected[runner.name] = runner.usesStrava;
});


/* ---------- Logging in (mock) ----------
   The login page saves who you picked for this browser tab.
   No passwords: it is a prototype. */
function getLoggedInUser() {
  try { return JSON.parse(sessionStorage.getItem(USER_KEY)); } catch (error) { return null; }
}
function logIn(user) {
  try { sessionStorage.setItem(USER_KEY, JSON.stringify(user)); } catch (error) { /* fine for a prototype */ }
}
function logOut() {
  try { sessionStorage.removeItem(USER_KEY); } catch (error) { /* fine for a prototype */ }
}


/* ---------- Sharing changes between the coach and runner apps ----------
   coach.html and runner.html are separate pages, so the changes
   below are kept in the browser's storage. A change the coach saves
   shows up when you log in as that runner (even in another tab). */
const SHARED_KEYS = [
  'sessionChanges', 'sentMessage', 'pickedMessage', 'caughtUp', 'markedDoneByRunner',
  'stravaConnected', 'nextWeekPlans', 'planSent', 'sentPlans', 'acceptedJoiners'
];

// The changes are saved in two places, so they survive moving between pages
// in every browser:
//   localStorage   – shared by all tabs (coach in one tab, runner in another)
//   sessionStorage – this tab only, but always kept when you log out and back in
//                    (some browsers, e.g. Safari, keep localStorage separate
//                    per file when the app is opened from a folder)
// Each copy has a time stamp; we load whichever is newest.
function readSaved(storage) {
  try { return JSON.parse(storage.getItem(DATA_KEY)); } catch (error) { return null; }
}

function loadSharedState() {
  const copies = [readSaved(window.localStorage), readSaved(window.sessionStorage)].filter(Boolean);
  if (copies.length === 0) return; // nothing saved yet – start from the sample data
  const newest = copies.reduce((a, b) => ((b.savedAt || 0) > (a.savedAt || 0) ? b : a));
  SHARED_KEYS.forEach(key => { if (newest[key] !== undefined) state[key] = newest[key]; });
}

function saveSharedState() {
  const toSave = { savedAt: Date.now() };
  SHARED_KEYS.forEach(key => { toSave[key] = state[key]; });
  const text = JSON.stringify(toSave);
  try { window.localStorage.setItem(DATA_KEY, text); } catch (error) { /* blocked – sessionStorage still works */ }
  try { window.sessionStorage.setItem(DATA_KEY, text); } catch (error) { /* blocked */ }
}

function resetSharedState() {
  try { window.localStorage.removeItem(DATA_KEY); } catch (error) { /* nothing to clear */ }
  try { window.sessionStorage.removeItem(DATA_KEY); } catch (error) { /* nothing to clear */ }
}

loadSharedState();
