/**
 * EcoTurma - Camada de dados (localStorage)
 */

const STORAGE_KEYS = {
  USERS: "ecoturma_users",
  SESSION: "ecoturma_session",
  ACTIONS: "ecoturma_actions",
};

// Ícones são nomes da biblioteca Lucide; cores combinam com as variáveis do CSS
const CATEGORIES = [
  { id: "energia",     label: "Energia",     icon: "zap",      color: "#E3B23C", points: 10 },
  { id: "transporte",  label: "Transporte",  icon: "bike",     color: "#4A7C8C", points: 15 },
  { id: "residuos",    label: "Resíduos",    icon: "recycle",  color: "#3F7A52", points: 10 },
  { id: "agua",        label: "Água",        icon: "droplets", color: "#4A7C8C", points: 10 },
  { id: "alimentacao", label: "Alimentação", icon: "salad",    color: "#A15C34", points: 10 },
];

function catInfo(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** SHA-256 da senha. Exige contexto seguro (HTTPS ou localhost). */
async function hashPassword(password) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error(
      "Este site precisa ser aberto por um servidor local (python3 -m http.server 8000) ou pelo GitHub Pages — veja o README."
    );
  }
  const data = new TextEncoder().encode(password);
  const buf = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- Usuários ---------- */
function getUsers() {
  return readJSON(STORAGE_KEYS.USERS, []);
}

async function registerUser(name, username, password) {
  const users = getUsers();
  const uname = username.toLowerCase().trim();

  if (users.some((u) => u.username === uname)) {
    return { success: false, message: "Esse usuário já existe." };
  }
  const user = {
    id: Date.now().toString(),
    name: name.trim(),
    username: uname,
    password: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return { success: true, user };
}

async function loginUser(username, password) {
  const uname = username.toLowerCase().trim();
  const hashed = await hashPassword(password);
  const user = getUsers().find((u) => u.username === uname && u.password === hashed);

  if (!user) return { success: false, message: "Usuário ou senha incorretos." };

  const session = { id: user.id, name: user.name, username: user.username };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  return { success: true, user: session };
}

function getCurrentUser() {
  return readJSON(STORAGE_KEYS.SESSION, null);
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

/* ---------- Ações ---------- */
function getActions() {
  return readJSON(STORAGE_KEYS.ACTIONS, []);
}

function addAction({ userName, categoryId, description }) {
  const cat = catInfo(categoryId);
  const actions = getActions();
  const action = {
    id: Date.now().toString(),
    name: userName,
    category: cat.id,
    description: description.trim(),
    points: cat.points,
    date: new Date().toISOString(),
  };
  // mais recentes primeiro (o feed mostra nessa ordem)
  actions.unshift(action);
  localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
  return action;
}

function resetActions() {
  localStorage.removeItem(STORAGE_KEYS.ACTIONS);
}
