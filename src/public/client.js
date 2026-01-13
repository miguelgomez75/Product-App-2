const api = {
  register: (data) => fetch('/api/auth/register', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(data)}).then(r=>r.json()),
  login: (data) => fetch('/api/auth/login', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(data)}).then(r=>r.json()),
  getProducts: () => fetch('/api/products').then(r=>r.json()),
  createProduct: (data, token) => fetch('/api/products', { method:'POST', headers:{'content-type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify(data)}).then(r=>r.json()),
  deleteProduct: (id, token) => fetch('/api/products/'+id, { method:'DELETE', headers:{'Authorization':'Bearer '+token}}).then(r=>r.json()),
  updateProduct: (id, data, token) => fetch('/api/products/'+id, { method:'PUT', headers:{'content-type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify(data)}).then(r=>r.json())
};

document.addEventListener('DOMContentLoaded', () => {
  const btnRegister = document.getElementById('btnRegister');
  const btnLogin = document.getElementById('btnLogin');
  const btnLogout = document.getElementById('btnLogout');
  const authSection = document.getElementById('auth');
  const appSection = document.getElementById('app');

  const usernameIn = document.getElementById('username');
  const passwordIn = document.getElementById('password');
  const roleSel = document.getElementById('role');
  const meSpan = document.getElementById('me');
  const productForm = document.getElementById('productForm');
  const productsUl = document.getElementById('products');

  function showApp(user){
    authSection.style.display = 'none';
    appSection.style.display = 'block';
    meSpan.textContent = user.username + ' (' + user.role + ')';
    if(user.role === 'admin') productForm.style.display = 'block';
    loadProducts();
  }

  function logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authSection.style.display = 'block';
    appSection.style.display = 'none';
  }

  btnRegister.addEventListener('click', async () => {
    const username = usernameIn.value.trim();
    const password = passwordIn.value.trim();
    const role = roleSel.value;
    if(!username || !password) return alert('faltan datos');
    const res = await api.register({ username, password, role });
    if(res.token){
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      showApp(res.user);
    } else alert(res.message || 'Error');
  });

  btnLogin.addEventListener('click', async () => {
    const username = usernameIn.value.trim();
    const password = passwordIn.value.trim();
    if(!username || !password) return alert('faltan datos');
    const res = await api.login({ username, password });
    if(res.token){
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      showApp(res.user);
    } else alert(res.message || 'Error');
  });

  btnLogout.addEventListener('click', logout);

  // crear producto
  document.getElementById('createProduct').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if(!token) return alert('No autorizado');
    const name = document.getElementById('title').value; // Cambiado de "title" a "name"
    const price = Number(document.getElementById('price').value);
    const description = document.getElementById('description').value;
    const stock = Number(document.getElementById('stock')?.value || 0); // Agregado
    const imageUrl = document.getElementById('imageUrl').value;
    const p = await api.createProduct({ name, price, description, stock, imageUrl }, token);
    loadProducts();
  });

  async function loadProducts(){
    const list = await api.getProducts();
    productsUl.innerHTML = '';
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    for(const p of list){
      const li = document.createElement('li');
      li.innerHTML = `<strong>${p.name}</strong> — ${p.price}€ (Stock: ${p.stock}) <br/> ${p.description || ''}`;
      if(user && user.role === 'admin'){
        const del = document.createElement('button'); del.textContent = 'Borrar';
        del.addEventListener('click', async ()=> {
          await api.deleteProduct(p._id, localStorage.getItem('token'));
          loadProducts();
        });
        li.appendChild(del);
      }
      productsUl.appendChild(li);
    }
  }

  // auto-login si token existe
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if(token && user) showApp(user);
});