/* =========================================================
   ai-advisor.js – THE "AI SUGGESTION" PANEL
   In this prototype the suggestion is SIMULATED with simple rules.
   A real version could send the runner's Strava data to an AI model.

   getAiSuggestion(runner, session) returns:
   {
     title:   short headline
     reasons: list of sentences explaining why
     change:  { day, km, pace, note } to fill in the form,
              or null if there is nothing to change
   }
   ========================================================= */

function getAiSuggestion(runner, session) {
  const summary = getWeekSummary(runner);
  const dataSource = state.stravaConnected[runner.name] ? 'Strava' : 'the runner’s own log';

  // Rule 1: the session is already done, so changing it makes no sense
  if (session.status === 'done' || session.status === 'too-fast') {
    return {
      title: 'Already completed',
      reasons: [
        `${runner.name} completed this session on ${DAY_NAMES[session.dayIndex]}.`,
        'Changing it now won’t change what was run. Edit an upcoming session instead.'
      ],
      change: null
    };
  }

  // Rule 2: a missed session → move it to a free day (and shorten it if 2+ were missed)
  if (session.status === 'missed') {
    const freeDay = findFreeDay(summary.sessions, session);
    const missedLots = summary.missed >= 2;
    const isIntervals = session.type.startsWith('Intervals');

    const newKm = missedLots ? Math.max(3, roundToHalf(session.km * 0.8)) : session.km;
    // A missed hard session is swapped for an easy one (easy pace from the level's plan)
    const newPace = isIntervals ? easyPaceFor(runner) : session.pace;

    return {
      title: `Move to ${DAY_NAMES[freeDay]}${missedLots ? ' and shorten it' : ''}`,
      reasons: [
        `${runner.name} missed ${summary.missed} session${summary.missed > 1 ? 's' : ''} this week (nothing synced from ${dataSource}).`,
        `${DAY_NAMES[freeDay]} is a free day, so two runs don’t land on the same day.` +
          (isIntervals ? ' Run it as an easy run instead of intervals.' : ''),
        missedLots
          ? `Cutting ${session.km} km to ${newKm} km avoids cramming the missed training back in.`
          : 'Distance stays the same because only one session was missed.'
      ],
      change: {
        day: freeDay,
        km: newKm,
        pace: newPace,
        note: 'No stress about the missed run. Keep this one easy, at chat pace.'
      }
    };
  }

  // Rule 3: the runner has been running too fast → keep the session, add a pacing note
  const fastRuns = summary.sessions.filter(s => s.status === 'too-fast');
  if (fastRuns.length > 0) {
    return {
      title: 'Keep the session, add a pacing note',
      reasons: [
        `${runner.name}’s last ${fastRuns.length} easy run${fastRuns.length > 1 ? 's were' : ' was'} about 40 s/km faster than target (from ${dataSource}).`,
        'Running easy days too fast builds tiredness later in the block.',
        `Keep the target at ${formatPace(session.pace)}/km and tell ${runner.name} why.`
      ],
      change: {
        day: session.day,
        km: session.km,
        pace: session.pace,
        note: `Your easy runs have been quicker than planned. Aim for ${formatPace(session.pace)}/km, even if it feels slow.`
      }
    };
  }

  // Rule 4: an on-track runner's long run → add 1 km and practise an even start
  // (Nathan and Brady both started their marathons too fast)
  if (session.type === 'Long run') {
    return {
      title: 'Add 1 km and a pacing note',
      reasons: [
        `${runner.name} has completed ${summary.done} of ${summary.dueSoFar} sessions so far this week.`,
        'Adding 1 km keeps the weekly increase under 10%.',
        'Runners we interviewed started their races too fast, so the note practises an even start.'
      ],
      change: {
        day: session.day,
        km: session.km + 1,
        pace: session.pace,
        note: 'Start the first 3 km about 10 s/km slower than target, then settle in.'
      }
    };
  }

  // Rule 5: everything is fine
  return {
    title: 'No change needed',
    reasons: [
      `${runner.name} is on track: ${summary.done} of ${summary.dueSoFar} sessions done so far this week.`,
      'Keep the session as planned.'
    ],
    change: { day: session.day, km: session.km, pace: session.pace, note: '' }
  };
}


/* ---------- small helpers for the rules above ---------- */

// First day from tomorrow (Sat, Sun, then Next Mon) with no other session on it
function findFreeDay(sessions, sessionBeingMoved) {
  const busyDays = sessions
    .filter(s => s.dayIndex !== sessionBeingMoved.dayIndex)
    .map(s => s.day);

  const candidates = [5, 6, 7]; // Sat, Sun, Next Mon
  const free = candidates.find(day => day > TODAY && !busyDays.includes(day));
  return free !== undefined ? free : 7;
}

// The easy-run pace from the runner's level plan
function easyPaceFor(runner) {
  const easySession = WEEK_PLAN_BY_LEVEL[runner.level].find(s => s && s.type === 'Easy');
  return easySession.pace;
}
