export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export const rateText = (n, c) => (n && c > 0)
  ? "1/" + (n / c).toFixed(1)
  : "—";

function logChoose(n, k) {
  if (k < 0 || k > n) return -Infinity;
  let s = 0;
  for (let i = 1; i <= k; i += 1) {
    s += Math.log((n - k + i) / i);
  }
  return s;
}

function binomLL(n, k, p) {
  if (n <= 0 || k < 0 || k > n || p <= 0 || p >= 1) return 0;
  return logChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p);
}

function bonusLL(n, b, r, pb, pr) {
  const other = n - b - r;
  if (n <= 0 || other < 0 || pb <= 0 || pr <= 0 || pb + pr >= 1) return -Infinity;
  return b * Math.log(pb) + r * Math.log(pr) + other * Math.log(1 - pb - pr);
}

function softmax(logs) {
  const max = Math.max(...logs);
  const exp = logs.map(x => Math.exp(x - max));
  const sum = exp.reduce((a, b) => a + b, 0);
  return exp.map(x => 100 * x / sum);
}

function gradeFor(score) {
  if (score >= 80) return ["かなり高設定寄り", "good"];
  if (score >= 65) return ["高設定寄り", "good"];
  if (score >= 50) return ["やや高設定寄り", "warn"];
  if (score >= 35) return ["判断保留", "warn"];
  return ["低設定寄り", "bad"];
}

function material(label, value, refLow, refHigh, inverse = false) {
  if (!isFinite(value)) return { label, text: "データなし", cls: "muted" };

  const denom = refLow - refHigh;
  if (Math.abs(denom) < 1e-9) {
    return { label, text: "設定差が小さい", cls: "muted" };
  }

  const pos = inverse
    ? (refLow - value) / denom
    : (value - refLow) / (refHigh - refLow);

  if (pos >= 0.72) return { label, text: "かなり強い", cls: "good" };
  if (pos >= 0.52) return { label, text: "良好", cls: "good" };
  if (pos >= 0.30) return { label, text: "中間", cls: "warn" };
  return { label, text: "弱め", cls: "bad" };
}

export function evaluateMachine(machine, input) {
  const { G, B, R, SG, SB, SR, GR } = input;

  if (G === null || B === null || R === null || G <= 0 || B < 0 || R < 0 || B + R > G) {
    return { error: "総回転数・BIG・REGを正しく入力してください。" };
  }

  const seatG = SG !== null ? G - SG : null;

  if (SG !== null && seatG < 0) {
    return { error: "着席時Gは現在の総回転数以下にしてください。" };
  }
  if (GR !== null && GR < 0) {
    return { error: "ブドウ数は0以上にしてください。" };
  }
  if (GR !== null && seatG !== null && GR > seatG) {
    return { error: "ブドウ数が着席後ゲーム数を超えています。" };
  }

  const base = {
    G, B, R, SG, SB, SR, GR, seatG,
    bigDen: B > 0 ? G / B : Infinity,
    regDen: R > 0 ? G / R : Infinity,
    bonusDen: B + R > 0 ? G / (B + R) : Infinity,
    grapeDen: (GR !== null && seatG > 0 && GR > 0) ? seatG / GR : Infinity,
    machineName: machine.name
  };

  if (!machine.settings) {
    return {
      ...base,
      fit: null,
      grapeUsed: false,
      grapeNote: machine.grapeNote
    };
  }

  const grapeReady = machine.grapeWeight > 0
    && GR !== null
    && seatG > 0
    && machine.settings.every(x => Number.isFinite(x.g));

  const logs = machine.settings.map(st => {
    let ll = bonusLL(G, B, R, 1 / st.b, 1 / st.r);
    if (grapeReady) {
      ll += machine.grapeWeight * binomLL(seatG, GR, 1 / st.g);
    }
    return ll;
  });

  const fit = softmax(logs);
  const meanSetting = fit.reduce((sum, p, i) => sum + p * (i + 1), 0) / 100;
  const score = Math.round(clamp((meanSetting - 1) / 5 * 100, 0, 100));
  const best = fit.indexOf(Math.max(...fit)) + 1;
  const samplePct = Math.round(clamp(G / 6000 * 100, 0, 100));
  const [grade, gradeCls] = gradeFor(score);

  const s1 = machine.settings[0];
  const s6 = machine.settings[5];

  const reasons = [
    material("BIG", base.bigDen, s1.b, s6.b, true),
    material("REG", base.regDen, s1.r, s6.r, true)
  ];

  if (GR === null || seatG === null || seatG <= 0 || GR === 0) {
    reasons.push({ label: "ブドウ", text: "未評価", cls: "muted" });
  } else if (grapeReady) {
    reasons.push(material("ブドウ", base.grapeDen, s1.g, s6.g, true));
  } else {
    reasons.push({ label: "ブドウ", text: "参考表示のみ", cls: "muted" });
  }

  reasons.push({
    label: "試行G数",
    text: G >= 5000 ? "十分増えてきた"
      : G >= 3000 ? "中程度"
      : G >= 1500 ? "まだ少なめ"
      : "かなり少ない",
    cls: G >= 5000 ? "good" : G >= 3000 ? "warn" : "bad"
  });

  return {
    ...base,
    fit,
    score,
    best,
    samplePct,
    grade,
    gradeCls,
    reasons,
    grapeUsed: grapeReady,
    grapeNote: machine.grapeNote
  };
}
