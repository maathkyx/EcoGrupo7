/**
 * EcoTurma - Camada de Dados (localStorage)
 */

// Chaves utilizadas no localStorage
const STORAGE_KEYS = {
  USERS: "ecoturma_users",
  CURRENT_USER: "ecoturma_current_user",
  ACTIONS: "ecoturma_actions",
};

/**
 * Categorias de ações sustentáveis disponíveis no sistema
 */
const CATEGORIES = {
  energia: { label: "Economia de Energia", icon: "⚡", color: "#eab308" },
  transporte: { label: "Transporte Sustentável", icon: "🚲", color: "#3b82f6" },
  residuos: { label: "Gestão de Resíduos", icon: "♻️️", color: "#22c55e" },
  agua: { label: "Consumo Consciente de Água", icon: "💧", color: "#06b6d4" },
  alimentacao: { label: "Alimentação Consciente", icon: "🥗", color: "#84cc16" },
};

/**
 * Gera o hash SHA-256 de uma string (senha).
 * Requer um contexto seguro (HTTPS, localhost ou servidor web local).
 */
async function hashPassword(password) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error(
      "O recurso de segurança (crypto.subtle) não está disponível. " +
      "Se você abriu o arquivo via file://, execute um servidor local " +
      "(ex: python3 -m http.server 8000) e acesse via http://localhost:8000 ou publique no GitHub Pages."
    );
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Funções de Usuários
 */
function getUsers() {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
}

async function registerUser(name, email, password) {
  const users = getUsers();
  const normalizedEmail = email.toLowerCase().trim();

  if (users.some((u) => u.email === normalizedEmail)) {
    return { success: false, message: "Este e-mail já está cadastrado." };
  }

  const hashedPassword = await hashPassword(password);

  const newUser = {
    id: Date.now().toString(),
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  return { success: true, user: newUser };
}

async function loginUser(email, password) {
  const users = getUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const hashedPassword = await hashPassword(password);

  const user = users.find(
    (u) => u.email === normalizedEmail && u.password === hashedPassword
  );

  if (!user) {
    return { success: false, message: "E-mail ou senha incorretos." };
  }

  // Armazena sessão sem expor o hash da senha
  const sessionUser = { id: user.id, name: user.name, email: user.email };
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionUser));

  return { success: true, user: sessionUser };
}

function getCurrentUser() {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
}

function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

/**
 * Funções de Ações Sustentáveis
 */
function getActions() {
  const actions = localStorage.getItem(STORAGE_KEYS.ACTIONS);
  return actions ? JSON.parse(actions) : [];
}

function addAction(categoryId, description, points = 10) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, message: "Usuário não autenticado." };
  }

  const actions = getActions();
  const newAction = {
    id: Date.now().toString(),
    userId: currentUser.id,
    userName: currentUser.name,
    category: categoryId,
    description: description.trim(),
    points: Number(points) || 10,
    createdAt: new Date().toISOString(),
  };

  actions.push(newAction);
  localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));

  return { success: true, action: newAction };
}