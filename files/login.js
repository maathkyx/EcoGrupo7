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
    errorBox.hidden = true;
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

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
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
    errorBox.hidden = true;
    const name = document.getElementById('register-name').value.trim();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;

    if (!name || !username || !password) {
      showError('Preencha todos os campos.');
      return;
    }
    if (password.length < 4) {
      showError('A senha precisa ter pelo menos 4 caracteres.');
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
