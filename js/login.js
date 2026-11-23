/* =========================================================
   login.js – MOCK LOGIN PAGE (index.html)
   Username: a dropdown of the coach and the runners.
   Password: can be typed, but is not needed or checked (prototype).
   "Log in" sends you to the right app:
     coach  → coach.html
     runner → runner.html
   ========================================================= */

const loginBox = document.getElementById('app');

// What the dropdown is set to: '' (nothing yet), 'coach', or a runner's name
let pickedUsername = '';
let dataWasReset = false;

function pickedUser() {
  if (pickedUsername === 'coach') return { role: 'coach', name: 'Coach' };
  if (findRunner(pickedUsername)) return { role: 'runner', name: pickedUsername };
  return null;
}

function renderLogin() {
  const levels = ['Beginner', 'Experienced', 'Expert'];
  const option = (value, label) =>
    `<option value="${escapeHtml(value)}" ${value === pickedUsername ? 'selected' : ''}>${escapeHtml(label)}</option>`;

  loginBox.innerHTML = `
    <div class="prototype-banner"><span>Prototype v2 · Team 6 · sample data</span></div>

    <header class="login-header">
      <p class="kicker">Marathon Coach</p>
      <h1>Log in</h1>
      <p class="subtitle">Coaches and runners use the same login.</p>
    </header>

    <main>
      <form class="card login-form" data-login-form novalidate>
        <label for="username" class="title">Username</label>
        <select id="username" name="username" data-username>
          <option value="" ${pickedUsername === '' ? 'selected' : ''} disabled>Choose a user</option>
          <optgroup label="Coach">
            ${option('coach', 'Coach')}
          </optgroup>
          ${levels.map(level => `
            <optgroup label="Runners · ${level}">
              ${RUNNERS.filter(r => r.level === level).map(r => option(r.name, r.name)).join('')}
            </optgroup>`).join('')}
        </select>

        <label for="password" class="title">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password"
               placeholder="Optional in the prototype">

        <button type="submit" class="button" ${pickedUser() ? '' : 'disabled'}>Log in</button>
      </form>

      <p class="small">Prototype: pick any user. The password is not checked.
        Tip: log in as the coach in one tab and as a runner in another, and changes the coach saves show up for the runner.</p>

      ${dataWasReset
        ? '<p class="confirmation" role="status">Demo data reset to the start.</p>'
        : '<button class="button secondary" data-reset>Reset demo data</button>'}
    </main>`;
}

// Picking a username: enable "Log in" (keep any password already typed)
loginBox.addEventListener('change', event => {
  if (!event.target.matches('[data-username]')) return;
  pickedUsername = event.target.value;
  dataWasReset = false;
  loginBox.querySelector('button[type="submit"]').disabled = !pickedUser();
});

// Log in (button or Enter key). The password is ignored.
loginBox.addEventListener('submit', event => {
  event.preventDefault();
  const user = pickedUser();
  if (!user) return;
  logIn(user);
  window.location.href = user.role === 'coach' ? 'coach.html' : 'runner.html';
});

loginBox.addEventListener('click', event => {
  if (event.target.closest('[data-reset]')) {
    resetSharedState();
    dataWasReset = true;
    renderLogin();
  }
});

renderLogin();
