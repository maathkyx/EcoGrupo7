/**
 * EcoTurma - Lógica da Tela de Login e Cadastro
 */

document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");
  const toggleButtons = document.querySelectorAll("[data-toggle-form]");
  const feedbackMessage = document.getElementById("feedback-message");

  // Redireciona para o painel se já estiver logado
  if (typeof getCurrentUser === "function" && getCurrentUser()) {
    window.location.href = "app.html";
    return;
  }

  // Verificação de Contexto Seguro (HTTPS / localhost / http://)
  const isSecure = window.isSecureContext && window.crypto?.subtle;

  if (!isSecure) {
    showInsecureContextWarning();
  }

  // Alternar entre abas de Login e Cadastro
  if (toggleButtons) {
    toggleButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const target = btn.getAttribute("data-toggle-form");
        
        if (target === "register") {
          formLogin?.classList.add("hidden");
          formRegister?.classList.remove("hidden");
        } else {
          formRegister?.classList.add("hidden");
          formLogin?.classList.remove("hidden");
        }
        clearFeedback();
      });
    });
  }

  // Form de Login
  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFeedback();

      if (!isSecure) {
        showFeedback("Ação bloqueada: execute o projeto via servidor local (http://localhost:8000).", "error");
        return;
      }

      const email = document.getElementById("login-email")?.value;
      const password = document.getElementById("login-password")?.value;

      try {
        const result = await loginUser(email, password);
        if (result.success) {
          window.location.href = "app.html";
        } else {
          showFeedback(result.message, "error");
        }
      } catch (err) {
        showFeedback(err.message, "error");
      }
    });
  }

  // Form de Cadastro
  if (formRegister) {
    formRegister.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFeedback();

      if (!isSecure) {
        showFeedback("Ação bloqueada: execute o projeto via servidor local (http://localhost:8000).", "error");
        return;
      }

      const name = document.getElementById("register-name")?.value;
      const email = document.getElementById("register-email")?.value;
      const password = document.getElementById("register-password")?.value;

      try {
        const result = await registerUser(name, email, password);
        if (result.success) {
          // Loga automaticamente após cadastro
          await loginUser(email, password);
          window.location.href = "app.html";
        } else {
          showFeedback(result.message, "error");
        }
      } catch (err) {
        showFeedback(err.message, "error");
      }
    });
  }

  function showFeedback(text, type = "info") {
    if (!feedbackMessage) return;
    feedbackMessage.textContent = text;
    feedbackMessage.className = `feedback-message ${type}`;
    feedbackMessage.classList.remove("hidden");
  }

  function clearFeedback() {
    if (!feedbackMessage) return;
    feedbackMessage.textContent = "";
    feedbackMessage.className = "feedback-message hidden";
  }

  /**
   * Renderiza o banner amigável quando aberto via file://
   */
  function showInsecureContextWarning() {
    const warningBanner = document.createElement("div");
    warningBanner.id = "insecure-context-banner";
    warningBanner.style.backgroundColor = "#fef3c7";
    warningBanner.style.color = "#92400e";
    warningBanner.style.border = "1px solid #fcd34d";
    warningBanner.style.borderRadius = "8px";
    warningBanner.style.padding = "14px 18px";
    warningBanner.style.marginBottom = "20px";
    warningBanner.style.fontSize = "14px";
    warningBanner.style.lineHeight = "1.5";

    warningBanner.innerHTML = `
      <strong>⚠️ Modo de compatibilidade limitado:</strong><br>
      Você abriu o arquivo diretamente pelo navegador (<code>file://</code>). 
      Para que o cadastro e o login funcionem, inicie um servidor local no seu terminal:
      <pre style="background: #fff; padding: 6px 10px; border-radius: 4px; margin: 8px 0 4px 0; display: inline-block;">python3 -m http.server 8000</pre><br>
      Em seguida, acesse <a href="http://localhost:8000" style="color: #b45309; font-weight: bold;">http://localhost:8000</a> ou publique no GitHub Pages.
    `;

    const container = document.querySelector("main") || document.querySelector(".container") || document.body;
    container.insertBefore(warningBanner, container.firstChild);

    // Desabilita botões para previnir envios que falhariam
    const submitBtns = document.querySelectorAll('button[type="submit"]');
    submitBtns.forEach((btn) => {
      btn.disabled = true;
      btn.style.opacity = "0.6";
      btn.style.cursor = "not-allowed";
    });
  }
});