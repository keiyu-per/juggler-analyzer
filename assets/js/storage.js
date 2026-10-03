const MACHINE_KEY = "ja_machine";
const SESSION_KEY = "ja_session";
const DRAFT_KEY = "ja_draft";
const PROMPT_KEY = "ja_prompt_type";

export function loadMachine() {
  return localStorage.getItem(MACHINE_KEY) || "my5";
}

export function saveMachine(key) {
  localStorage.setItem(MACHINE_KEY, key);
}

export function loadSession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (parsed && Array.isArray(parsed.history)) return parsed;
  } catch {}
  return { id: Date.now(), history: [] };
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function resetSession() {
  const session = { id: Date.now(), history: [] };
  saveSession(session);
  return session;
}

export function appendHistory(session, result) {
  if (!session.id) session.id = Date.now();

  const item = {
    t: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
    G: result.G,
    B: result.B,
    R: result.R,
    GR: result.GR,
    score: result.score ?? null,
    best: result.best ?? null,
    machineName: result.machineName
  };

  const prev = session.history[session.history.length - 1];
  const same = prev
    && prev.G === item.G
    && prev.B === item.B
    && prev.R === item.R
    && prev.GR === item.GR
    && prev.machineName === item.machineName;

  if (!same) {
    session.history.push(item);
    if (session.history.length > 50) session.history.shift();
    saveSession(session);
  }
  return session;
}

export function previousHistory(session, current) {
  for (let i = session.history.length - 1; i >= 0; i -= 1) {
    const h = session.history[i];
    const same = current
      && h.G === current.G
      && h.B === current.B
      && h.R === current.R
      && h.GR === current.GR
      && h.machineName === current.machineName;
    if (!same) return h;
  }
  return null;
}

export function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

export function saveDraft(draft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export function loadPromptType() {
  return localStorage.getItem(PROMPT_KEY) || "recheck";
}

export function savePromptType(type) {
  localStorage.setItem(PROMPT_KEY, type);
}
