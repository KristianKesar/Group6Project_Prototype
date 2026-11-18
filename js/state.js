/* =========================================================
   state.js – WHAT THE APP REMEMBERS
   Every click changes something in "state", then the screen is
   drawn again from it. Nothing is saved when you close the page.
   ========================================================= */

const state = {
  // Which screen is showing: 'group', 'runnerDetail', 'editSession',
  // 'runnerView', 'plans' or 'invite'
  screen: 'group',

  // Short message shown after an action, e.g. "Saved."
  confirmation: '',

  // Group screen: which level filter is selected
  levelFilter: 'All',

  // Which runner the coach has open
  selectedRunner: 'Seán',

  // Runner view: which runner we are pretending to be
  viewingAsRunner: 'Seán',

  // Coach changes to sessions, per runner and per weekday index:
  //   sessionChanges['Seán'][3] = { day: 5, km: 5, pace: 405, note: '...' }
  sessionChanges: {},

  // The edit screen's form while the coach is changing a session
  //   { dayIndex, day, km, pace, note, aiApplied }
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
  planSent: {},

  // Invite screen
  linkCopied: false,
  acceptedJoiners: {}
};

// Copy each runner's starting Strava setting into state
RUNNERS.forEach(runner => {
  state.stravaConnected[runner.name] = runner.usesStrava;
});
