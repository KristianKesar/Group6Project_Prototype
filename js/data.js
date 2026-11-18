/* =========================================================
   data.js – SAMPLE DATA
   Everything here is made up for the prototype.
   In a real app this would come from a database and Strava.
   ========================================================= */

// The days shown in the app. Index 7 ("Next Mon") is used when a coach
// moves a session into next week.
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Next Mon'];
const DAY_DATES = ['16 Nov', '17 Nov', '18 Nov', '19 Nov', '20 Nov', '21 Nov', '22 Nov', '23 Nov'];

// The prototype pretends today is Friday (index 4 in DAY_NAMES).
const TODAY = 4;


// The weekly plan for each level, Monday to Sunday.
// Each day is either null (rest day) or a session:
//   { type, km, pace }   pace = seconds per km (e.g. 405 = 6:45/km)
const WEEK_PLAN_BY_LEVEL = {
  Beginner: [
    null,
    { type: 'Easy', km: 5, pace: 405 },
    { type: 'Intervals 6 × 400 m', km: 5, pace: 360 },
    { type: 'Easy', km: 6, pace: 405 },
    null,
    { type: 'Long run', km: 12, pace: 420 },
    null
  ],
  Experienced: [
    { type: 'Easy', km: 6, pace: 350 },
    { type: 'Intervals 5 × 1 km', km: 8, pace: 300 },
    { type: 'Easy', km: 8, pace: 350 },
    null,
    { type: 'Tempo', km: 6, pace: 315 },
    null,
    { type: 'Long run', km: 18, pace: 355 }
  ],
  Expert: [
    { type: 'Easy', km: 10, pace: 300 },
    { type: 'Intervals 6 × 1 km', km: 10, pace: 250 },
    { type: 'Easy', km: 10, pace: 300 },
    { type: 'Tempo', km: 8, pace: 265 },
    { type: 'Easy', km: 8, pace: 300 },
    null,
    { type: 'Long run', km: 24, pace: 290 }
  ]
};


// The runners in the coach's group.
// "thisWeek" has one letter per day, Monday to Sunday:
//   d = done   f = done but too fast   m = missed   u = upcoming   r = rest
const RUNNERS = [
  { name: 'Seán',    level: 'Beginner',    goalTime: '4:45', thisWeek: 'rdmmrur', usesStrava: true },
  { name: 'Aoife',   level: 'Beginner',    goalTime: '4:30', thisWeek: 'rfdfrur', usesStrava: true },
  { name: 'Niamh',   level: 'Beginner',    goalTime: '5:00', thisWeek: 'rdddrur', usesStrava: true },
  { name: 'Tom',     level: 'Beginner',    goalTime: '4:50', thisWeek: 'rdmdrur', usesStrava: false },
  { name: 'Ciara',   level: 'Experienced', goalTime: '3:45', thisWeek: 'dddruru', usesStrava: true },
  { name: 'Mark',    level: 'Experienced', goalTime: '3:55', thisWeek: 'dmdruru', usesStrava: true },
  { name: 'Lisa',    level: 'Experienced', goalTime: '3:40', thisWeek: 'dddruru', usesStrava: true },
  { name: 'Darragh', level: 'Experienced', goalTime: '3:30', thisWeek: 'ddfruru', usesStrava: true },
  { name: 'Orla',    level: 'Expert',      goalTime: '3:05', thisWeek: 'dddduru', usesStrava: true },
  { name: 'Kevin',   level: 'Expert',      goalTime: '3:15', thisWeek: 'dddmuru', usesStrava: true }
];


// Ready-made feedback messages the coach can send with one tap.
// (PO interview: "For feedback, be positive, be direct.")
const FEEDBACK_MESSAGES = [
  'Missed a couple this week, no stress. I have adjusted your plan.',
  'Great work this week. Keep it up.',
  'Easy days should feel easy. Slow it down a little.',
  'Can we have a quick chat after the weekend long run?'
];


// The app's first-draft plan for NEXT week, per level (Plans screen).
const NEXT_WEEK_DRAFTS = {
  Beginner: {
    runnerCount: 4,
    focus: 'Focus: finish safely. Easy runs at chat pace.',
    sessions: [
      { day: 'Tue', what: 'Easy 5 km',      detail: '6:45/km' },
      { day: 'Thu', what: 'Easy 6 km',      detail: '6:45/km' },
      { day: 'Sat', what: 'Long run 13 km', detail: '7:00/km, walk breaks OK' },
      { day: 'Sun', what: 'Rest',           detail: 'Stretch or walk' }
    ]
  },
  Experienced: {
    runnerCount: 4,
    focus: 'Focus: hold even pace. Taper plan starts in week 18.',
    sessions: [
      { day: 'Tue', what: 'Intervals 5 × 1 km', detail: '5:00/km, 2 min jog between' },
      { day: 'Wed', what: 'Easy 8 km',          detail: '5:50/km' },
      { day: 'Fri', what: 'Tempo 6 km',         detail: '5:15/km' },
      { day: 'Sun', what: 'Long run 19 km',     detail: '5:55/km, last 3 km at race pace' }
    ]
  },
  Expert: {
    runnerCount: 2,
    focus: 'Focus: race-pace work. Taper plan starts in week 18.',
    sessions: [
      { day: 'Tue', what: 'Intervals 6 × 1 km', detail: '4:10/km' },
      { day: 'Wed', what: 'Easy 10 km',         detail: '5:00/km' },
      { day: 'Thu', what: 'Tempo 8 km',         detail: '4:25/km' },
      { day: 'Sat', what: 'Easy 8 km',          detail: '5:00/km' },
      { day: 'Sun', what: 'Long run 26 km',     detail: '10 km at race pace 4:30/km' }
    ]
  }
};


// People waiting to join through the invite link.
const JOIN_REQUESTS = [
  { name: 'Emma', detail: 'Says: Beginner · Strava connected' },
  { name: 'Rory', detail: 'Says: Experienced · Strava connected' }
];

const INVITE_LINK = 'marathonapp.ie/join/[GROUP-CODE]';
const MAX_GROUP_SIZE = 20;
