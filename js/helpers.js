/* =========================================================
   helpers.js – SMALL REUSABLE FUNCTIONS
   ========================================================= */


/* ---------- Formatting ---------- */

// 405 seconds → "6:45"
function formatPace(secondsPerKm) {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = String(secondsPerKm % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

// 10 km at 405 s/km → "1 h 7 min"
function formatDuration(km, secondsPerKm) {
  const totalSeconds = Math.round(km * secondsPerKm);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
}

// 5.3 → 5.5 (distances move in half-kilometre steps)
function roundToHalf(number) {
  return Math.round(number * 2) / 2;
}

// Makes text safe to put inside HTML (stops names like "<b>" breaking the page)
function escapeHtml(text) {
  const replacements = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(text).replace(/[&<>"']/g, character => replacements[character]);
}

// "Easy 5 km", or "Intervals 6 × 400 m (5 km)"
function sessionName(session) {
  if (session.type.startsWith('Intervals')) {
    return `${session.type} (${session.km} km)`;
  }
  return `${session.type} ${session.km} km`;
}


/* ---------- Runners and sessions ---------- */

function findRunner(name) {
  return RUNNERS.find(runner => runner.name === name);
}

// The session as it was originally planned (before any coach changes)
function originalSession(runner, dayIndex) {
  return WEEK_PLAN_BY_LEVEL[runner.level][dayIndex];
}

/*
  Builds the list of this week's sessions for one runner.
  It starts from the level's plan, then adds:
    - what the runner actually did (from the sample data)
    - any changes the coach saved
    - any session the runner marked as done by hand

  Each session looks like:
  {
    dayIndex,       the day it was originally planned (0 = Mon)
    day,            the day it is on now (can change if the coach moves it)
    type, km, pace, the plan
    status,         'done' | 'too-fast' | 'missed' | 'upcoming'
    actualKm, actualPace,   what was really run (only if done)
    changedByCoach, note,   coach edits
    loggedByHand            true if the runner ticked it themselves
  }
*/
function getSessions(runner) {
  const statusFromLetter = { d: 'done', f: 'too-fast', m: 'missed', u: 'upcoming' };
  const sessions = [];

  WEEK_PLAN_BY_LEVEL[runner.level].forEach((plan, dayIndex) => {
    if (plan === null) return; // rest day

    const session = {
      dayIndex: dayIndex,
      day: dayIndex,
      type: plan.type,
      km: plan.km,
      pace: plan.pace,
      status: statusFromLetter[runner.thisWeek[dayIndex]],
      changedByCoach: false,
      note: ''
    };

    // Pretend Strava data: done runs are on target, "too fast" runs are 40 s/km quicker
    if (session.status === 'done') {
      session.actualKm = roundToHalf(plan.km * 1.02);
      session.actualPace = plan.pace - 5;
    }
    if (session.status === 'too-fast') {
      session.actualKm = plan.km;
      session.actualPace = plan.pace - 40;
    }

    // Apply the coach's saved change, if there is one
    const change = (state.sessionChanges[runner.name] || {})[dayIndex];
    if (change) {
      session.day = change.day;
      session.km = change.km;
      session.pace = change.pace;
      session.note = change.note;
      session.changedByCoach = true;
      if (session.status === 'missed') session.status = 'upcoming'; // rescheduled
    }

    // The runner ticked "Mark done" on their own screen
    const markedDone = (state.markedDoneByRunner[runner.name] || {})[dayIndex];
    if (session.status === 'upcoming' && markedDone) {
      session.status = 'done';
      session.actualKm = session.km;
      session.actualPace = session.pace;
      session.loggedByHand = true;
    }

    sessions.push(session);
  });

  // Show sessions in the order of the day they are on now
  return sessions.sort((a, b) => a.day - b.day);
}

/*
  Counts how a runner's week is going and decides if the coach should
  look at them ("Needs attention").
  Rule (from the PO interview: "perhaps too fast, perhaps missing some runs"):
    - 2 or more missed sessions, or
    - 2 or more runs that were too fast
*/
function getWeekSummary(runner) {
  const sessions = getSessions(runner);

  const missed = sessions.filter(s => s.status === 'missed').length;
  const tooFast = sessions.filter(s => s.status === 'too-fast').length;
  const done = sessions.filter(s => s.status === 'done' || s.status === 'too-fast').length;
  const dueSoFar = sessions.filter(s => s.dayIndex < TODAY).length;

  let reason = '';
  if (missed >= 2) {
    reason = `Missed ${missed} sessions this week`;
  } else if (tooFast >= 2) {
    reason = 'Easy runs about 40 s/km faster than target';
  }

  const needsAttention = reason !== '' && !state.caughtUp[runner.name];

  return { sessions, missed, tooFast, done, dueSoFar, reason, needsAttention };
}
