// storage.js
// Camada de dados do EcoTurma. Usa localStorage do navegador — ou seja,
// os dados ficam salvos no computador/navegador onde o app é usado.
// Isso é suficiente para uma demonstração de projeto de faculdade rodando
// no GitHub Pages. Para um app "de verdade" com dados sincronizados entre
// vários dispositivos, veja a seção "Próximos passos" do README.

const USERS_KEY = 'ecoturma_users';
const SESSION_KEY = 'ecoturma_session';
const ACTIONS_KEY = 'ecoturma_actions';

const CATEGORIES = [
  { id: 'energia', label: 'Energia', points: 10, color: '#E3B23C', icon: 'zap' },
  { id: 'agua', label: 'Água', points: 10, color: '#4A7C8C', icon: 'droplet' },
  { id: 'residuos', label: 'Resíduos', points: 15, color: '#3F7A52', icon: 'recycle' },
  { id: 'transporte', label: 'Transporte', points: 20, color: '#A15C34', icon: 'bus' },
  { id: 'consumo', label: 'Consumo consciente', points: 10, color: '#7A5C3F', icon: 'shopping-bag' },
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

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- Usuários e sessão ----

function getUsers() {
  return readJSON(USERS_KEY, []);
}

function saveUsers(users) {
  writeJSON(USERS_KEY, users);
}

function findUserByUsername(username) {
  return getUsers().find((u) => u.username.toLowerCase() === username.toLowerCase());
}

function getSession() {
  return localStorage.getItem(SESSION_KEY) || '';
}

function setSession(username) {
  localStorage.setItem(SESSION_KEY, username);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function getCurrentUser() {
  const username = getSession();
  if (!username) return null;
  return findUserByUsername(username) || null;
}

// ---- Senhas ----
// Hash simples com SHA-256 + salt via Web Crypto API. Isso evita guardar a
// senha em texto puro, mas não substitui um backend de verdade com HTTPS e
// um servidor de autenticação — está no nível certo para um trabalho
// acadêmico rodando 100% no navegador.

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bufferToHex(bytes.buffer);
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + ':' + password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(digest);
}

async function registerUser({ name, username, password }) {
  if (findUserByUsername(username)) {
    throw new Error('Esse nome de usuário já está em uso.');
  }
  const salt = randomSalt();
  const hash = await hashPassword(password, salt);
  const user = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    username,
    salt,
    hash,
  };
  const users = getUsers();
  users.push(user);
  saveUsers(users);
  return user;
}

async function loginUser({ username, password }) {
  const user = findUserByUsername(username);
  if (!user) {
    throw new Error('Usuário ou senha incorretos.');
  }
  const hash = await hashPassword(password, user.salt);
  if (hash !== user.hash) {
    throw new Error('Usuário ou senha incorretos.');
  }
  return user;
}

// ---- Ações registradas ----

function getActions() {
  return readJSON(ACTIONS_KEY, []);
}

function saveActions(actions) {
  writeJSON(ACTIONS_KEY, actions);
}

function addAction({ userName, categoryId, description }) {
  const cat = catInfo(categoryId);
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: userName,
    category: cat.id,
    points: cat.points,
    description,
    date: new Date().toISOString(),
  };
  const updated = [entry, ...getActions()];
  saveActions(updated);
  return updated;
}

function resetActions() {
  saveActions([]);
}
