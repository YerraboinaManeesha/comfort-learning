let COURSES = [];
let cart = [];

async function apiGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}
async function apiSend(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${url} failed: ${res.status}`);
  return res.json();
}

function renderCourses(){
  const grid = document.getElementById('courseGrid');
  if (COURSES.length === 0){
    grid.innerHTML = `<p style="text-align:center;color:var(--ink-soft)">No courses available right now — check the API is running and you've run <code>npm run seed</code>.</p>`;
    return;
  }
  grid.innerHTML = COURSES.map(c => `
    <div class="course-card">
      <div class="course-icon" style="background:${logoColor(c.logoKey)}">${logoHTML(c.logoKey, c.name)}</div>
      <h3>${c.name}</h3>
      <p class="desc">${c.description}</p>
      <div class="course-price">$${Number(c.price).toFixed(2)}</div>
      <div class="card-actions">
        <button class="btn-add" data-id="${c._id}">Add to Cart</button>
        <a class="btn-view" href="${c.externalLink}" target="_blank" rel="noopener">View <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:10px;"></i></a>
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('.btn-add').forEach(btn=>{
    btn.addEventListener('click', ()=> addToCart(btn.dataset.id));
  });
}

async function loadCart(){
  cart = await apiGet('/api/cart');
  renderCart();
  updateCartBadge();
}

async function addToCart(courseId){
  try {
    await apiSend('/api/cart', 'POST', { courseId });
    await loadCart();
    showToast('Course added to cart');
  } catch (err) {
    console.error(err);
    showToast('Could not add to cart');
  }
}

async function changeQty(courseId, delta){
  try {
    await apiSend(`/api/cart/${courseId}`, 'PUT', { delta });
    await loadCart();
  } catch (err) {
    console.error(err);
    showToast('Could not update quantity');
  }
}

async function removeItem(courseId){
  try {
    await apiSend(`/api/cart/${courseId}`, 'DELETE');
    await loadCart();
  } catch (err) {
    console.error(err);
    showToast('Could not remove item');
  }
}

async function clearCart(){
  try {
    await apiSend('/api/cart', 'DELETE');
    await loadCart();
  } catch (err) {
    console.error(err);
    showToast('Could not clear cart');
  }
}

function cartTotals(){
  return cart.reduce((acc, item) => {
    acc.count += item.quantity;
    acc.sum += Number(item.course.price) * item.quantity;
    return acc;
  }, { count: 0, sum: 0 });
}

function updateCartBadge(){
  const { count } = cartTotals();
  document.getElementById('cartCount').textContent = count;
}

function renderCart(){
  const contentEl = document.getElementById('cartContent');
  const totalEl = document.getElementById('totalSum');
  const actionsEl = document.getElementById('cartActions');

  if (cart.length === 0){
    contentEl.innerHTML = `<div class="cart-empty">Your cart is empty.<br>Add a course to get started.</div>`;
    totalEl.innerHTML = '';
    actionsEl.innerHTML = '';
    return;
  }

  contentEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="mini-icon" style="background:${logoColor(item.course.logoKey)}">${logoHTML(item.course.logoKey, item.course.name)}</div>
        <div class="info">
          <div class="nm">${item.course.name}</div>
          <div class="pr">$${Number(item.course.price).toFixed(2)}</div>
          <button class="remove" data-id="${item.course._id}">remove</button>
        </div>
        <div class="qty-control">
          <button data-act="inc" data-id="${item.course._id}"><i class="fa-solid fa-caret-up"></i></button>
          <span>${item.quantity}</span>
          <button data-act="dec" data-id="${item.course._id}"><i class="fa-solid fa-caret-down"></i></button>
        </div>
      </div>`
  ).join('');

  contentEl.querySelectorAll('[data-act]').forEach(btn=>{
    btn.addEventListener('click', ()=> changeQty(btn.dataset.id, btn.dataset.act === 'inc' ? 1 : -1));
  });
  contentEl.querySelectorAll('.remove').forEach(btn=>{
    btn.addEventListener('click', ()=> removeItem(btn.dataset.id));
  });

  const { sum } = cartTotals();
  totalEl.innerHTML = `<h1>Your Total: $${sum.toFixed(2)}</h1>`;
  actionsEl.innerHTML = `
    <button class="btn-block clear-cart-btn" id="clearCartBtn">Clear Cart</button>
    <button class="btn-block proceed-btn" id="proceedBtn">Proceed</button>
    <p class="checkout-note">Proceed takes you to the official course page to continue.</p>
  `;
  document.getElementById('clearCartBtn').addEventListener('click', clearCart);
  document.getElementById('proceedBtn').addEventListener('click', ()=>{
    window.open(cart[0].course.externalLink, '_blank');
  });
}

function initDrawer(){
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('overlay');
  const open = ()=>{ drawer.classList.add('open'); overlay.classList.add('open'); };
  const close = ()=>{ drawer.classList.remove('open'); overlay.classList.remove('open'); };
  document.getElementById('cartToggle').addEventListener('click', open);
  document.getElementById('closeCart').addEventListener('click', close);
  overlay.addEventListener('click', close);
}

let toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 1600);
}

async function init(){
  initDrawer();
  try {
    COURSES = await apiGet('/api/courses');
    renderCourses();
    await loadCart();
  } catch (err) {
    console.error('Failed to initialize app:', err);
    document.getElementById('courseGrid').innerHTML =
      `<p style="text-align:center;color:#c0392b">Couldn't reach the server. Is <code>npm start</code> running?</p>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
