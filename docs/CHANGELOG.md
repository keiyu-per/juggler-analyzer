# 変更管理台帳

**Project:** Juggler Analyzer  
**運用開始:** 2026-10-03

## 1. 目的
`docs/SPECIFICATION.md` を現在有効な仕様（Single Source of Truth）とし、本台帳では「なぜ・いつ・何を変更したか」を変更要求（CR）単位で追跡する。

## 2. 変更管理フロー
```text
変更要求 → CR登録 → 影響分析 → 方針決定 → 仕様書更新 → 実装 → 確認 → コミット → CR完了
```

統計ロジック、入力項目、保存形式、主要UI、公開方式に影響する変更は原則としてCRを登録する。

## 3. ステータス
| Status | 意味 |
|---|---|
| Proposed | 変更案として登録済み |
| Approved | 実施方針が確定 |
| In Progress | 仕様変更・実装中 |
| Implemented | 実装済み、確認待ち |
| Completed | 確認・反映まで完了 |
| Rejected | 採用しない |
| Deferred | 保留 |

## 4. 変更種別
| Type | 内容 |
|---|---|
| Feature | 新機能 |
| Change | 既存仕様変更 |
| Fix | 不具合修正 |
| Logic | 統計・判定ロジック変更 |
| UI/UX | 画面・操作性変更 |
| Data | 保存形式・データ構造変更 |
| Docs | 文書・運用変更 |
| Infra | GitHub Pages等の基盤変更 |

## 5. 運用ルール
- CR IDは `CR-YYYY-NNN` 形式で採番する。
- 1つのCRには原則1つの変更目的を持たせる。
- 変更理由、変更前、変更後、影響範囲を記録する。
- 統計ロジック変更では数式・基準値・重みの変更を明記する。
- 保存形式変更では既存データとの互換性を確認する。
- 実装により仕様が変わる場合は `docs/SPECIFICATION.md` も更新する。
- コードだけを変更して仕様書を古い状態にしない。
- CR完了時に対象ファイルと関連コミットを記録する。
- Pull Request運用へ移行した場合はPR番号も関連付ける。
- 未着手の将来候補は `docs/BACKLOG.md` で管理し、実施決定時にCRへ昇格させる。

## 6. 変更一覧
| CR ID | 日付 | Type | 概要 | Status | 対象 |
|---|---|---|---|---|---|
| CR-2026-001 | 2026-10-03 | Feature | Juggler Analyzer v0.1 初期実装 | Completed | `index.html` |
| CR-2026-002 | 2026-10-03 | Docs | 基本設計書 v0.1をリポジトリ管理へ移行 | Completed | `docs/SPECIFICATION.md` |
| CR-2026-003 | 2026-10-03 | Docs | 仕様駆動開発に変更管理台帳を追加 | Completed | `docs/CHANGELOG.md`, `docs/SPECIFICATION.md` |

## 7. 変更詳細

### CR-2026-001 — Juggler Analyzer v0.1 初期実装
- **日付:** 2026-10-03
- **Type:** Feature
- **Status:** Completed
- **目的:** iPhone上で実戦データを入力し、AIなしでも基本的な設定推測を行えるツールを構築する。
- **対象:** `index.html`
- **関連コミット:** `6b8e6142e8c9fbad2de4288465d278d8395122e8`

### CR-2026-002 — 基本設計書のリポジトリ管理
- **日付:** 2026-10-03
- **Type:** Docs
- **Status:** Completed
- **目的:** 現在有効な仕様と設計意図をGitHub上で管理する。
- **変更後:** `docs/SPECIFICATION.md` を現行仕様の基準文書とする。
- **対象:** `docs/SPECIFICATION.md`
- **関連コミット:** `dc810b2794186f2da6b2e1f9f635015e162cb6ba`

### CR-2026-003 — 変更管理台帳の導入
- **日付:** 2026-10-03
- **Type:** Docs
- **Status:** Completed
- **目的:** 変更要求・変更理由・影響・実装結果を追跡可能にする。
- **変更前:** 現行仕様は管理するが、変更要求単位の履歴管理ルールは未定義。
- **変更後:** CR単位の変更管理を導入し、仕様書と実装を関連付ける。
- **対象:** `docs/CHANGELOG.md`, `docs/SPECIFICATION.md`
- **影響:** 今後の主要変更では仕様書更新とCR更新をセットで行う。

## 8. 新規CRテンプレート
```markdown
### CR-YYYY-NNN — 変更名
- **日付:** YYYY-MM-DD
- **Type:** Feature / Change / Fix / Logic / UI/UX / Data / Docs / Infra
- **Status:** Proposed
- **要求・背景:**
- **目的:**
- **変更前:**
- **変更後:**
- **影響範囲:**
- **対象ファイル:**
- **データ互換性:** 影響なし / 要対応 / 未確認
- **確認項目:**
- **関連Issue/PR:**
- **関連コミット:**
- **備考:**
```

## 9. 文書の役割分担
| 文書 | 役割 |
|---|---|
| `README.md` | プロジェクト概要・利用方法 |
| `docs/SPECIFICATION.md` | 現在有効な仕様・設計 |
| `docs/CHANGELOG.md` | 変更要求・理由・影響・実施履歴 |
| `docs/BACKLOG.md` | 未着手・検討中の将来機能・改善候補 |
| Git履歴 | 実際のファイル変更履歴 |
