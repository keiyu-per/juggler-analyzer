import { rateText } from "./analysis.js";

export const PROMPT_TYPES = {
  recheck: {
    label: "設定再評価",
    ask: "生データを優先して独立に再評価してください。強い材料・弱い材料・試行数による不確実性・自動判定とのズレを確認してください。"
  },
  continue: {
    label: "続行価値",
    ask: "今この台を続ける価値を判断してください。「続行 / 様子見 / 見切り寄り」のどれかを先頭に置き、理由と次の再判定ポイントを示してください。"
  },
  quit: {
    label: "やめ時",
    ask: "今やめるべきか、まだ回すなら何G程度までかを判断してください。追加状況に残り時間・投資等があれば考慮し、具体的な終了条件を示してください。"
  },
  cutline: {
    label: "見切りライン",
    ask: "この台を見切る条件を具体化してください。次に確認するG数と、REG・合算・ブドウ等がどこまで悪化したら見切るかを簡潔に示してください。"
  },
  context: {
    label: "店舗・イベント込み信頼度",
    ask: "台単体の数値と店舗・イベント要因を分離して評価してください。イベント日、島配置、周辺台等は補助証拠として扱い、それだけで設定を断定しないでください。"
  },
  change: {
    label: "前回からの変化",
    ask: "前回データから改善・悪化した材料だけを整理し、判断を変えるほどの変化か、次に何を見るべきかを示してください。"
  },
  sit: {
    label: "着席価値",
    ask: "現在空いている台として着席する価値を判断してください。座るなら最初の見切りラインも具体的に示してください。"
  }
};

function fmt(v) {
  return v === null || v === undefined ? "未入力" : v;
}

export function buildPrompt(result, type = "recheck", context = "", previous = null) {
  const def = PROMPT_TYPES[type] || PROMPT_TYPES.recheck;
  const lines = [];

  lines.push("【ジャグラー実戦データ】");
  lines.push("機種：" + result.machineName);
  lines.push("");
  lines.push(
    "現在：" + result.G + "G / BIG " + result.B + " / REG " + result.R
  );
  lines.push(
    "BIG " + rateText(result.G, result.B)
    + " / REG " + rateText(result.G, result.R)
    + " / 合算 " + rateText(result.G, result.B + result.R)
  );

  if (result.SG !== null) {
    lines.push(
      "着席時：" + result.SG + "G / BIG " + fmt(result.SB) + " / REG " + fmt(result.SR)
    );
    lines.push(
      "着席後：" + result.seatG + "G / ブドウ " + fmt(result.GR)
      + " / ブドウ確率 "
      + (Number.isFinite(result.grapeDen) ? "1/" + result.grapeDen.toFixed(2) : "算出不可")
    );
  } else if (result.GR !== null) {
    lines.push("ブドウ：" + result.GR + "（着席時G未入力のため確率算出不可）");
  }

  if (result.fit) {
    lines.push("");
    lines.push(
      "ツール参考：高設定寄り指数 " + result.score + "/100"
      + " / 最適合 設定" + result.best
      + " / サンプル " + result.samplePct + "%"
    );
    lines.push(
      "設定別適合度："
      + result.fit.map((p, i) => (i + 1) + "=" + p.toFixed(1) + "%").join(" / ")
    );
    lines.push(
      "ブドウの判定利用："
      + (result.grapeUsed ? "補助材料として使用" : "設定別適合度には未使用")
    );
  } else {
    lines.push("");
    lines.push("ツール参考：機種固有の設定別基準値がないため設定別適合度なし");
  }

  if (previous) {
    let prev = "前回：" + previous.G + "G / B" + previous.B + " / R" + previous.R;
    if (previous.GR !== null) prev += " / ブドウ" + previous.GR;
    if (previous.score !== null) prev += " / 指数" + previous.score;
    lines.push("");
    lines.push(prev);
  }

  if (context.trim()) {
    lines.push("");
    lines.push("追加状況：" + context.trim());
  }

  lines.push("");
  lines.push("【確認したいこと：" + def.label + "】");
  lines.push(def.ask);
  lines.push("");
  lines.push("【回答形式】");
  lines.push("結論を最初に。原則8行程度まで。");
  lines.push("入力値を長く再掲せず、判断に効く材料だけ示してください。");
  lines.push("小サンプルは断定せず、生データを優先してツール判定も必要なら批判的に見てください。");

  return lines.join("\n");
}
