export const MACHINE_ORDER = [
  "my6","my5","neoim","im","funky2","happy3","gogo3","girls","mr","ultra","other"
];

const rows = (bonus, grapes = null) => bonus.map((x, i) => ({
  s: i + 1,
  b: x[0],
  r: x[1],
  g: grapes ? grapes[i] : null
}));

const myBonus = [
  [273.1,409.6],[270.8,385.5],[266.4,336.1],
  [254.0,290.0],[240.1,268.6],[229.1,229.1]
];
const imBonus = [
  [273.1,439.8],[269.7,399.6],[269.7,331.0],
  [259.0,315.1],[259.0,255.0],[255.0,255.0]
];

export const MACHINES = {
  my6: {
    name: "マイジャグラーVI",
    short: "マイVI",
    settings: rows(myBonus),
    grapeWeight: 0,
    grapeNote: "ブドウはカウント・表示のみ（全設定比較用の十分な参考値を未採用）"
  },
  my5: {
    name: "マイジャグラーV",
    short: "マイV",
    settings: rows(myBonus, [5.89,5.85,5.81,5.77,5.76,5.66]),
    grapeWeight: 0.65,
    grapeNote: "ブドウは解析・実戦上の参考値を補助材料として使用"
  },
  neoim: {
    name: "ネオアイムジャグラーEX",
    short: "ネオアイム",
    settings: rows(imBonus, [6.06,6.04,6.04,6.04,6.02,5.80]),
    grapeWeight: 0.45,
    grapeNote: "ブドウはアイム系全設定参考値＋ネオアイム実戦値を補助材料として使用"
  },
  im: {
    name: "アイムジャグラーEX（6号機）",
    short: "アイムEX",
    settings: rows(imBonus, [6.06,6.04,6.04,6.04,6.02,5.80]),
    grapeWeight: 0.65,
    grapeNote: "ブドウは解析・実戦上の参考値を補助材料として使用"
  },
  funky2: {
    name: "ファンキージャグラー2",
    short: "ファンキー2",
    settings: rows([
      [266.4,439.8],[259.0,407.1],[256.0,366.1],
      [249.2,322.8],[240.1,299.3],[219.9,262.1]
    ], [5.96,5.92,5.88,5.87,5.79,5.72]),
    grapeWeight: 0.65,
    grapeNote: "ブドウは解析・実戦上の参考値を補助材料として使用"
  },
  happy3: {
    name: "ハッピージャグラーV III",
    short: "ハッピーVⅢ",
    settings: rows([
      [273.1,397.2],[270.8,362.1],[263.2,332.7],
      [254.0,300.6],[239.2,273.1],[226.0,256.0]
    ]),
    grapeWeight: 0,
    grapeNote: "ブドウはカウント・表示のみ（全設定比較用の十分な参考値を未採用）"
  },
  gogo3: {
    name: "ゴーゴージャグラー3",
    short: "ゴージャグ3",
    settings: rows([
      [259.0,354.2],[258.0,332.7],[257.0,306.2],
      [254.0,268.6],[247.3,247.3],[234.9,234.9]
    ]),
    grapeWeight: 0,
    grapeNote: "ブドウはカウント・表示のみ（全設定比較用の十分な参考値を未採用）"
  },
  girls: {
    name: "ジャグラーガールズSS",
    short: "ガールズSS",
    settings: rows([
      [273.1,381.0],[270.8,350.5],[260.1,316.6],
      [250.1,281.3],[243.6,270.8],[226.0,252.1]
    ]),
    grapeWeight: 0,
    grapeNote: "ブドウはカウント・表示のみ（全設定比較用の十分な参考値を未採用）"
  },
  mr: {
    name: "ミスタージャグラー",
    short: "ミスター",
    settings: rows([
      [268.6,374.5],[267.5,354.2],[260.1,331.0],
      [249.2,291.3],[240.9,257.0],[237.4,237.4]
    ]),
    grapeWeight: 0,
    grapeNote: "ブドウはカウント・表示のみ（全設定比較用の十分な参考値を未採用）"
  },
  ultra: {
    name: "ウルトラミラクルジャグラー",
    short: "ウルミラ",
    settings: rows([
      [267.5,425.6],[261.1,402.1],[256.0,350.5],
      [242.7,322.8],[233.2,297.9],[216.3,277.7]
    ]),
    grapeWeight: 0,
    grapeNote: "ブドウはカウント・表示のみ（全設定比較用の十分な参考値を未採用）"
  },
  other: {
    name: "その他",
    short: "その他",
    settings: null,
    grapeWeight: 0,
    grapeNote: "機種固有の設定別基準値がないため設定評価は行いません"
  }
};

const LEGACY = { my: "my5", gogo: "gogo3", im: "im" };

export function resolveMachineKey(key) {
  const resolved = LEGACY[key] || key;
  return MACHINES[resolved] ? resolved : "my5";
}
