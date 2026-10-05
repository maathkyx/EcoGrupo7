/**
 * EcoTurma - Tela de login e cadastro
 */

document.addEventListener("DOMContentLoaded", () => {
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");
  const errorBox = document.getElementById("auth-error");

  if (getCurrentUser()) {
    window.location.href = "app.html";
    return;
  }

  const isSecure = window.isSecureContext && !!(window.crypto && window.crypto.subtle);
  if (!isSecure) showInsecureContextWarning();

  function showError(text) {
    errorBox.textContent = text;
    errorBox.hidden = false;
  }
  function clearError() {
    errorBox.textContent = "";
    errorBox.hidden = true;
  }

  function showTab(which) {
    const isLogin = which === "login";
    formLogin.hidden = !isLogin;
    formRegister.hidden = isLogin;
    tabLogin.classList.toggle("active", isLogin);
    tabRegister.classList.toggle("active", !isLogin);
    if (isSecure) clearError(); // mantém o aviso de file:// visível
  }
  tabLogin.addEventListener("click", () => showTab("login"));
  tabRegister.addEventListener("click", () => showTab("register"));

  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    if (!username.trim() || !password) return showError("Preencha usuário e senha.");

    try {
      const result = await loginUser(username, password);
      if (result.success) window.location.href = "app.html";
      else showError(result.message);
    } catch (err) {
      showError(err.message);
    }
  });

  formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();
    const name = document.getElementById("register-name").value;
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const confirm = document.getElementById("register-confirm").value;

    if (!name.trim() || !username.trim()) return showError("Preencha nome e usuário.");
    if (password.length < 4) return showError("A senha precisa ter pelo menos 4 caracteres.");
    if (password !== confirm) return showError("As senhas não conferem.");

    try {
      const result = await registerUser(name, username, password);
      if (!result.success) return showError(result.message);
      await loginUser(username, password);
      window.location.href = "app.html";
    } catch (err) {
      showError(err.message);
    }
  });

  /** Aviso amigável quando aberto por file:// (sem crypto.subtle) */
  function showInsecureContextWarning() {
    showError(
      "Este site precisa ser aberto por um servidor local (python3 -m http.server 8000, depois acesse http://localhost:8000) ou pelo GitHub Pages — veja o README."
    );
    document.querySelectorAll('button[type="submit"]').forEach((btn) => {
      btn.disabled = true;
    });
  }
});
