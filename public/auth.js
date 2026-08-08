let currentUser = null;

async function apiAuth(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${method} ${url} failed`);
  return data;
}

function renderAuthArea(){
  const area = document.getElementById('authArea');

  if (!currentUser){
    area.innerHTML = `<button class="login-btn" id="loginBtn">Login</button>`;
    document.getElementById('loginBtn').addEventListener('click', openAuthModal);
    return;
  }

  const initial = currentUser.name.trim().charAt(0).toUpperCase();
  area.innerHTML = `
    <button class="account-btn" id="accountBtn">
      <span class="avatar">${initial}</span> ${currentUser.name.split(' ')[0]}
      <i class="fa-solid fa-chevron-down" style="font-size:10px;"></i>
    </button>
    <div class="account-menu" id="accountMenu">
      <div class="who">${currentUser.email}</div>
      <button id="historyBtn"><i class="fa-solid fa-clock-rotate-left"></i>&nbsp; Login History</button>
      <button id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i>&nbsp; Logout</button>
    </div>
  `;
  const menu = document.getElementById('accountMenu');
  document.getElementById('accountBtn').addEventListener('click', (e)=>{
    e.stopPropagation();
    menu.classList.toggle('open');
  });
  document.addEventListener('click', ()=> menu.classList.remove('open'), { once:true });
  document.getElementById('historyBtn').addEventListener('click', openHistoryModal);
  document.getElementById('logoutBtn').addEventListener('click', logout);
}

function openAuthModal(){
  document.getElementById('authModal').classList.add('open');
  document.getElementById('authOverlay').classList.add('open');
}
function closeAuthModal(){
  document.getElementById('authModal').classList.remove('open');
  document.getElementById('authOverlay').classList.remove('open');
  document.getElementById('loginError').textContent = '';
  document.getElementById('registerError').textContent = '';
  document.getElementById('loginForm').reset();
  document.getElementById('registerForm').reset();
}

function switchAuthTab(tab){
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
}

async function handleLogin(e){
  e.preventDefault();
  const form = e.target;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';
  try {
    const email = form.email.value.trim();
    const password = form.password.value;
    const user = await apiAuth('/api/auth/login', 'POST', { email, password });
    currentUser = user;
    renderAuthArea();
    closeAuthModal();
    showToast(`Welcome back, ${user.name.split(' ')[0]}`);
  } catch (err) {
    errEl.textContent = err.message;
  }
}

async function handleRegister(e){
  e.preventDefault();
  const form = e.target;
  const errEl = document.getElementById('registerError');
  errEl.textContent = '';
  try {
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const user = await apiAuth('/api/auth/register', 'POST', { name, email, password });
    currentUser = user;
    renderAuthArea();
    closeAuthModal();
    showToast(`Account created — welcome, ${user.name.split(' ')[0]}`);
  } catch (err) {
    errEl.textContent = err.message;
  }
}

async function logout(){
  try {
    await apiAuth('/api/auth/logout', 'POST');
  } catch (err) {
    console.error(err);
  }
  currentUser = null;
  renderAuthArea();
  showToast('Logged out');
}

function openHistoryModal(){
  document.getElementById('historyModal').classList.add('open');
  document.getElementById('historyOverlay').classList.add('open');
  loadHistory();
}
function closeHistoryModal(){
  document.getElementById('historyModal').classList.remove('open');
  document.getElementById('historyOverlay').classList.remove('open');
}

async function loadHistory(){
  const listEl = document.getElementById('historyList');
  listEl.innerHTML = `<p class="history-empty">Loading…</p>`;
  try {
    const rows = await apiAuth('/api/auth/history', 'GET');
    if (rows.length === 0){
      listEl.innerHTML = `<p class="history-empty">No login history yet.</p>`;
      return;
    }
    listEl.innerHTML = rows.map(r => {
      const when = new Date(r.loginAt).toLocaleString();
      return `
        <div class="history-row">
          <div>
            <div class="status ${r.success ? 'ok' : 'fail'}">${r.success ? 'Successful login' : 'Failed attempt'}</div>
            <div class="when">${when}${r.ipAddress ? ' · ' + r.ipAddress : ''}</div>
          </div>
          <i class="fa-solid ${r.success ? 'fa-circle-check' : 'fa-circle-xmark'}" style="color:${r.success ? '#2e7d32' : '#c0392b'}"></i>
        </div>`;
    }).join('');
  } catch (err) {
    listEl.innerHTML = `<p class="history-empty">Couldn't load history.</p>`;
  }
}

async function initAuth(){
  document.getElementById('authClose').addEventListener('click', closeAuthModal);
  document.getElementById('authOverlay').addEventListener('click', closeAuthModal);
  document.getElementById('historyClose').addEventListener('click', closeHistoryModal);
  document.getElementById('historyOverlay').addEventListener('click', closeHistoryModal);

  document.querySelectorAll('.auth-tab').forEach(tab=>{
    tab.addEventListener('click', ()=> switchAuthTab(tab.dataset.tab));
  });
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);

  try {
    const { user } = await apiAuth('/api/auth/me', 'GET');
    currentUser = user;
  } catch (err) {
    currentUser = null;
  }
  renderAuthArea();
}

document.addEventListener('DOMContentLoaded', initAuth);
