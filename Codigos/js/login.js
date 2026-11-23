// login.js — lógica da tela de entrar/cadastrar

document.addEventListener('DOMContentLoaded', () => {
  // Se já existe uma sessão ativa, vai direto para o app.
  if (getSession()) {
    window.location.href = 'app.html';
    return;
  }

  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const errorBox = document.getElementById('auth-error');

  function showTab(tab) {
    errorBox.hidden = cryptoOk;
    if (tab === 'login') {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.hidden = false;
      formRegister.hidden = true;
    } else {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.hidden = false;
      formLogin.hidden = true;
    }
  }

  tabLogin.addEventListener('click', () => showTab('login'));
  tabRegister.addEventListener('click', () => showTab('register'));

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  // crypto.subtle só existe em contexto seguro (HTTPS ou localhost). Ao abrir
  // o index.html direto (file://) alguns navegadores o deixam indefinido.
  const cryptoOk = !!(window.crypto && window.crypto.subtle);
  const CRYPTO_MSG =
    'Este site precisa ser aberto por um servidor local ou pelo site publicado ' +
    '(Vercel/GitHub Pages). Rode "python3 -m http.server 8000" na pasta do ' +
    'projeto e acesse http://localhost:8000 — veja o README.';
  if (!cryptoOk) {
    showError(CRYPTO_MSG);
    document
      .querySelectorAll('#form-login button[type="submit"], #form-register button[type="submit"]')
      .forEach((b) => { b.disabled = true; });
  }

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!cryptoOk) { showError(CRYPTO_MSG); return; }
    errorBox.hidden = true;
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    if (!username || !password) return;

    const submitBtn = formLogin.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Entrando…';
    try {
      const user = await loginUser({ username, password });
      setSession(user.username);
      window.location.href = 'app.html';
    } catch (err) {
      showError(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Entrar';
    }
  });

  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!cryptoOk) { showError(CRYPTO_MSG); return; }
    errorBox.hidden = true;
    const name = document.getElementById('register-name').value.trim();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;

    if (!name || !username || !password) {
      showError('Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      showError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      showError('As senhas não coincidem.');
      return;
    }

    const submitBtn = formRegister.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Criando conta…';
    try {
      const user = await registerUser({ name, username, password });
      setSession(user.username);
      window.location.href = 'app.html';
    } catch (err) {
      showError(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Criar conta';
    }
  });
});
