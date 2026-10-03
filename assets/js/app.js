import { MACHINES, MACHINE_ORDER, resolveMachineKey } from "./machines.js";
import { evaluateMachine, rateText } from "./analysis.js";
import { PROMPT_TYPES, buildPrompt } from "./prompts.js";
import {
  loadMachine,
  saveMachine,
  loadSession,
  resetSession,
  appendHistory,
  previousHistory,
  loadDraft,
  saveDraft,
  clearDraft,
  loadPromptType,
  savePromptType
} from "./storage.js";

const $ = id => document.getElementById(id);

const num = id => {
  const v = $(id).value.trim();
  return v === "" ? null : Number(v);
};

let machine = resolveMachineKey(loadMachine());
let session = loadSession();
let lastResult = null;
const draft = loadDraft();

function currentDraft() {
  return {
    games: $("games").value,
    big: $("big").value,
    reg: $("reg").value,
    grapes: $("grapes").value,
    startGames: $("startGames").value,
    startBig: $("startBig").value,
    startReg: $("startReg").value,
    otherName: $("otherName").value,
    aiContext: $("aiContext").value
  };
}

function persistDraft() {
  saveDraft(currentDraft());
}

function renderMachineGrid() {
  $("machineGrid").innerHTML = MACHINE_ORDER.map(key => {
    const m = MACHINES[key];
    const extra = key === "other" ? " other" : "";
    return '<button class="machine-btn' + extra + '" data-machine="' + key + '">' + m.short + "</button>";
  }).join("");

  $("machineGrid").querySelectorAll(".machine-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      machine = btn.dataset.machine;
      saveMachine(machine);
      syncMachineUI();
    });
  });
}

function syncMachineUI() {
  document.querySelectorAll(".machine-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.machine === machine);
  });

  $("otherWrap").classList.toggle("hidden", machine !== "other");
  $("machineDataNote").textContent = MACHINES[machine].grapeNote;
  saveMachine(machine);
}

function restoreDraft() {
  const ids = [
    "games","big","reg","grapes","startGames","startBig","startReg","otherName","aiContext"
  ];

  ids.forEach(id => {
    if (draft[id] !== undefined) $(id).value = draft[id];
  });

  syncGrapeFloat();
}

function syncGrapeFloat() {
  const raw = Number($("grapes").value || 0);
  const value = Number.isFinite(raw) ? Math.max(0, raw) : 0;
  $("grapeCount").textContent = String(value);
}

function changeGrape(delta) {
  const raw = Number($("grapes").value || 0);
  const now = Number.isFinite(raw) ? Math.max(0, raw) : 0;
  $("grapes").value = String(Math.max(0, now + delta));
  syncGrapeFloat();
  persistDraft();
}

function readInput() {
  return {
    G: num("games"),
    B: num("big"),
    R: num("reg"),
    GR: num("grapes"),
    SG: num("startGames"),
    SB: num("startBig"),
    SR: num("startReg")
  };
}

function evaluate() {
  const base = MACHINES[machine];
  const machineDef = machine === "other"
    ? { ...base, name: $("otherName").value.trim() || "その他" }
    : base;

  const result = evaluateMachine(machineDef, readInput());

  if (result.error) {
    alert(result.error);
    return;
  }

  $("bigRate").textContent = rateText(result.G, result.B);
  $("regRate").textContent = rateText(result.G, result.R);
  $("bonusRate").textContent = rateText(result.G, result.B + result.R);
  $("grapeRate").textContent = Number.isFinite(result.grapeDen)
    ? "1/" + result.grapeDen.toFixed(1)
    : "—";

  $("resultCard").classList.remove("hidden");
  $("copyCard").classList.remove("hidden");

  if (!result.fit) {
    $("scoreCard").classList.add("hidden");
    $("fitCard").classList.add("hidden");

    $("reasons").innerHTML =
      '<div class="reason"><span>設定評価</span><strong class="muted">機種固有値なし</strong></div>'
      + '<div class="reason"><span>ブドウ</span><strong class="muted">'
      + (result.GR !== null ? "カウント済み" : "未入力")
      + "</strong></div>";

    $("reasonCard").classList.remove("hidden");
  } else {
    $("score").textContent = result.score;
    $("grade").textContent = result.grade;
    $("grade").className = "grade " + result.gradeCls;
    $("bestSetting").textContent = "設定" + result.best;
    $("sample").textContent = result.samplePct + "%";
    $("scoreCard").classList.remove("hidden");

    $("bars").innerHTML = result.fit.map((p, i) => {
      return '<div class="barrow">'
        + "<div>設定" + (i + 1) + "</div>"
        + '<div class="track"><div class="fill" style="width:' + p.toFixed(2) + '%"></div></div>'
        + '<div class="right">' + p.toFixed(1) + "%</div>"
        + "</div>";
    }).join("");

    $("fitCard").classList.remove("hidden");

    $("reasons").innerHTML = result.reasons.map(x => {
      return '<div class="reason"><span>' + x.label + '</span><strong class="' + x.cls + '">'
        + x.text + "</strong></div>";
    }).join("");

    $("reasonCard").classList.remove("hidden");
  }

  $("resultDataNote").textContent = result.grapeNote || "";

  lastResult = result;
  appendHistory(session, result);
  persistDraft();
  renderHistory();
}

function renderHistory() {
  if (!session.history.length) {
    $("history").classList.add("muted");
    $("history").innerHTML = "まだ評価履歴はありません。";
    return;
  }

  $("history").classList.remove("muted");

  $("history").innerHTML = [...session.history].reverse().map(h => {
    const grape = h.GR !== null ? " / 🍇" + h.GR : "";
    const score = h.score !== null ? h.score + "点" : "";
    return '<div class="histrow"><div><strong>' + h.G + "G</strong> B" + h.B + " / R" + h.R
      + grape + '</div><div>' + score + ' <span class="muted">' + h.t + "</span></div></div>";
  }).join("");
}

function shortText() {
  if (!lastResult) return "";
  return [
    lastResult.G,
    lastResult.B,
    lastResult.R,
    lastResult.GR ?? ""
  ].join(",");
}

async function copy(txt) {
  if (!txt) {
    alert("先に「評価を更新」を押してください。");
    return;
  }

  try {
    await navigator.clipboard.writeText(txt);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }

  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 1200);
}

function initPromptTypes() {
  $("promptType").innerHTML = Object.entries(PROMPT_TYPES).map(([key, value]) => {
    return '<option value="' + key + '">' + value.label + "</option>";
  }).join("");

  const saved = loadPromptType();
  $("promptType").value = PROMPT_TYPES[saved] ? saved : "recheck";

  $("promptType").addEventListener("change", () => {
    savePromptType($("promptType").value);
  });
}

$("evaluate").addEventListener("click", evaluate);
$("copyShort").addEventListener("click", () => copy(shortText()));

$("copyDetail").addEventListener("click", () => {
  if (!lastResult) {
    alert("先に「評価を更新」を押してください。");
    return;
  }

  const prev = previousHistory(session, lastResult);
  copy(buildPrompt(
    lastResult,
    $("promptType").value,
    $("aiContext").value,
    prev
  ));
});

$("grapePlus").addEventListener("click", () => changeGrape(1));
$("grapeMinus").addEventListener("click", () => changeGrape(-1));

$("grapes").addEventListener("input", () => {
  syncGrapeFloat();
  persistDraft();
});

[
  "games","big","reg","startGames","startBig","startReg","otherName","aiContext"
].forEach(id => {
  $(id).addEventListener("input", persistDraft);
});

$("newSession").addEventListener("click", () => {
  if (!confirm("現在の実戦履歴と入力値をリセットして、新しい実戦を開始しますか？")) {
    return;
  }

  session = resetSession();
  clearDraft();

  [
    "games","big","reg","grapes","startGames","startBig","startReg","otherName","aiContext"
  ].forEach(id => {
    $(id).value = "";
  });

  [
    "resultCard","scoreCard","fitCard","reasonCard","copyCard"
  ].forEach(id => {
    $(id).classList.add("hidden");
  });

  lastResult = null;
  syncGrapeFloat();
  renderHistory();
});

renderMachineGrid();
syncMachineUI();
initPromptTypes();
restoreDraft();
renderHistory();
