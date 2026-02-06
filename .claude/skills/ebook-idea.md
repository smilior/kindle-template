# /ebook-idea — テーマ発見・市場調査

WebSearchを活用した市場調査で「売れるテーマ」を発見し、スコアリングで評価する。
CLAUDE.mdのベストプラクティス（HARMの法則・ニッチ戦略・BDF分析）を自動適用する。

引数パターン：
- `/ebook-idea` — 対話でHARMカテゴリを選択して調査
- `/ebook-idea Money` — 指定カテゴリで即調査（Money / Health / Ambition / Relation）
- `/ebook-idea --auto` — 全カテゴリ調査して最有望テーマを自動提示

---

## Phase 1: ユーザー入力

### 引数ありの場合
- HARMカテゴリが引数で指定済み → Phase 1のカテゴリ選択をスキップ
- `--auto` の場合 → Phase 1を全スキップし、全カテゴリで調査

### 引数なしの場合
AskUserQuestion で以下を収集する：

**質問1**（必須）:
- HARMカテゴリ: Money / Health / Ambition / Relation / おまかせ（全カテゴリ調査）

**質問2**（必須）:
- 著者のバックグラウンド（職業・経験・得意分野）
  - 例: 「元営業マン、現在フリーランスエンジニア」「子育て中の主婦、家計管理が得意」

**質問3**（任意）:
- 想定する読者層のヒント
  - 例: 「20代の若手社会人」「副業に興味がある人」
- 除外テーマ（既出版・興味なし等）
  - 例: 「投資系は除外」「ダイエット本は既に出版済み」

---

## Phase 2: 3つの並列リサーチャー

`TeamCreate(team_name="ebook-idea-research")` でチームを作成する。

3つのリサーチャーを**並列起動**する（全て `subagent_type: "general-purpose"`、`team_name: "ebook-idea-research"`）。

各リサーチャーには以下を共通で伝える：
- HARMカテゴリ（または全カテゴリ）
- 著者バックグラウンド
- 読者層ヒント・除外テーマ
- 結果はJSON形式で返すこと

### trend-researcher（トレンド調査）

```
あなたはKindle電子書籍のトレンドリサーチャーです。

【調査対象】HARMカテゴリ: {category}
【著者背景】{author_background}
【読者ヒント】{reader_hint}
【除外テーマ】{excluded_topics}

【タスク】
WebSearchを使い、以下の4〜5クエリを実行して市場トレンドを調査してください：

1. 「Kindle ベストセラー {category関連ワード} 2026」
2. 「Amazon 電子書籍 ランキング {category関連ワード} 新着」
3. 「{category関連ワード} トレンド 2026 注目」
4. 「Kindle Unlimited 人気 {category関連ワード}」
5. （カテゴリに応じた追加クエリ）

【出力形式】
以下のJSON形式で結果をまとめてください：
{
  "category": "Money",
  "trending_topics": [
    {
      "topic": "トピック名",
      "evidence": "根拠（検索結果の要約）",
      "growth_signal": "high/medium/low",
      "related_keywords": ["キーワード1", "キーワード2"]
    }
  ],
  "bestseller_patterns": ["パターン1", "パターン2"],
  "emerging_niches": ["ニッチ1", "ニッチ2"]
}

TaskListで自分のタスクを確認し、開始時にin_progress、完了時にcompletedに更新すること。
```

### competitor-researcher（競合調査）

```
あなたはKindle電子書籍の競合分析リサーチャーです。

【調査対象】HARMカテゴリ: {category}
【著者背景】{author_background}
【読者ヒント】{reader_hint}
【除外テーマ】{excluded_topics}

【タスク】
WebSearchを使い、以下の4〜5クエリを実行して競合の弱点・ギャップを調査してください：

1. 「Kindle {category関連ワード} レビュー 期待はずれ」
2. 「Amazon {category関連ワード} 本 低評価 物足りない」
3. 「{category関連ワード} 本 おすすめ 不満」
4. 「Kindle {category関連ワード} 入門 わかりにくい」
5. （カテゴリに応じた追加クエリ）

【出力形式】
以下のJSON形式で結果をまとめてください：
{
  "category": "Money",
  "competitor_weaknesses": [
    {
      "area": "分野",
      "common_complaints": ["不満1", "不満2"],
      "gap_opportunity": "差別化チャンスの説明"
    }
  ],
  "underserved_niches": ["ニッチ1", "ニッチ2"],
  "differentiation_angles": ["差別化の切り口1", "差別化の切り口2"]
}

TaskListで自分のタスクを確認し、開始時にin_progress、完了時にcompletedに更新すること。
```

### needs-researcher（読者ニーズ調査）

```
あなたはKindle電子書籍の読者ニーズリサーチャーです。

【調査対象】HARMカテゴリ: {category}
【著者背景】{author_background}
【読者ヒント】{reader_hint}
【除外テーマ】{excluded_topics}

【タスク】
WebSearchを使い、以下の4〜5クエリを実行して読者の生の悩み・ニーズを調査してください：

1. 「{category関連ワード} 悩み 知恵袋 2025 2026」
2. 「{category関連ワード} 始め方 わからない 初心者」
3. 「{category関連ワード} 失敗 体験談 後悔」
4. 「{category関連ワード} おすすめ 本 教えて」
5. （カテゴリに応じた追加クエリ）

【出力形式】
以下のJSON形式で結果をまとめてください：
{
  "category": "Money",
  "reader_pain_points": [
    {
      "pain": "悩みの内容",
      "frequency": "high/medium/low",
      "source": "情報源の種類",
      "bdf_material": {
        "belief": "この悩みに潜む思い込み",
        "desire": "本当の欲求",
        "feeling": "現状への感情"
      }
    }
  ],
  "common_questions": ["質問1", "質問2"],
  "emotional_triggers": ["感情トリガー1", "感情トリガー2"]
}

TaskListで自分のタスクを確認し、開始時にin_progress、完了時にcompletedに更新すること。
```

### タスク作成

Phase 2開始時に以下のタスクを作成する：
- `TaskCreate("トレンド調査")` → trend-researcher に割り当て
- `TaskCreate("競合調査")` → competitor-researcher に割り当て
- `TaskCreate("読者ニーズ調査")` → needs-researcher に割り当て
- `TaskCreate("テーマ評価・スコアリング")` → theme-evaluator に割り当て、blockedBy: [トレンド調査, 競合調査, 読者ニーズ調査]

---

## Phase 3: テーマ評価・スコアリング

3つのリサーチャーの全タスク完了を確認（TaskList）後、リサーチャーをシャットダウンする。

`theme-evaluator`（`subagent_type: "general-purpose"`、`team_name: "ebook-idea-research"`）を起動する：

```
あなたはKindle電子書籍のテーマ評価エキスパートです。

【著者背景】{author_background}
【読者ヒント】{reader_hint}
【除外テーマ】{excluded_topics}

【リサーチ結果】
■ トレンド調査:
{trend_researcher_result}

■ 競合調査:
{competitor_researcher_result}

■ 読者ニーズ調査:
{needs_researcher_result}

【タスク】
3つのリサーチ結果を合成し、**5つのテーマ候補**を生成してください。
各テーマを以下の7軸で10点満点で評価してください。

【7軸スコアリング基準】
1. 市場需要 (10点): トレンド上昇度・検索ボリューム・読者の関心度
2. 競合優位性 (10点): 競合書籍の少なさ・差別化余地の大きさ
3. ニッチ適合度 (10点): 「ターゲット × ベネフィット × 手法」の明確さ
4. BDF深度 (10点): 読者心理（Belief/Desire/Feeling）への刺さり度
5. 著者適合度 (10点): 著者バックグラウンドとの親和性・実体験の活用度
6. シリーズ化可能性 (10点): 続編展開・関連書籍への発展余地
7. 収益ポテンシャル (10点): KU収益見込み + バックエンド導線設計のしやすさ

【出力形式】
以下のJSON形式で5候補を返してください：
{
  "candidates": [
    {
      "rank": 1,
      "total_score": 53,
      "provisional_title": "仮タイトル（9つの訴求要素を意識）",
      "concept": "コンセプトの1行説明",
      "niche_formula": {
        "target": "ターゲット",
        "benefit": "ベネフィット",
        "method": "手法"
      },
      "bdf": {
        "belief": "読者の思い込み",
        "desire": "読者の欲求",
        "feeling": "読者の感情"
      },
      "harm_category": "Money",
      "differentiation": "差別化ポイント",
      "keywords": ["キーワード1", "キーワード2", "キーワード3"],
      "backend_idea": "バックエンド導線のアイデア",
      "series_potential": "シリーズ化の展望",
      "structure_type": "problem-solving",
      "scores": {
        "market_demand": 8,
        "competitive_advantage": 9,
        "niche_fit": 7,
        "bdf_depth": 8,
        "author_fit": 6,
        "series_potential": 7,
        "revenue_potential": 8
      },
      "reasoning": "このテーマを推奨する理由（2〜3文）"
    }
  ]
}

候補はtotal_scoreの降順でランク付けすること。
各スコアには明確な根拠をreasoningで説明すること。

TaskListで自分のタスクを確認し、開始時にin_progress、完了時にcompletedに更新すること。
```

theme-evaluator 完了後、シャットダウンする。

---

## Phase 4: 結果表示とテーマ選択

theme-evaluator の結果を以下のフォーマットで表示する：

```
============================================
Kindle書籍テーマ候補レポート（HARMカテゴリ: {category}）
============================================

【第1位】総合スコア: {score}/70
仮タイトル: {provisional_title}
コンセプト: {concept}
ニッチ公式: {target} × {benefit} × {method}
BDF:
  Belief: {belief}
  Desire: {desire}
  Feeling: {feeling}
差別化: {differentiation}
キーワード: {keywords}
スコア内訳: 市場{n} / 競合{n} / ニッチ{n} / BDF{n} / 著者{n} / シリーズ{n} / 収益{n}
推奨理由: {reasoning}

（第2位〜第5位も同様のフォーマットで表示）

============================================
```

### ユーザー選択

AskUserQuestion で以下を質問する：
- 選択肢: 第1位〜第5位 / もう一度調査する（カテゴリ変更可）

「もう一度調査する」が選択された場合 → Phase 1に戻る。

---

## Phase 5: 引き継ぎ

選択されたテーマの構造化データを保持し、次のアクションをAskUserQuestionで選択させる：

- `/ebook-produce` で全工程一括実行（推奨）
- `/ebook-init` でプロジェクト初期化のみ

### 引き継ぎデータ

選択テーマから以下のデータを構造化して保持する。
`/ebook-init` または `/ebook-produce` の Phase A（基本情報収集）では、
このデータで以下の項目を**自動入力**し、ユーザーへの質問を省略する：

| 自動入力される項目 | データソース |
|-------------------|------------|
| 書籍タイトル（仮） | provisional_title |
| ジャンル | harm_category から推定 |
| 想定読者 | niche_formula.target |
| 書籍の概要 | concept + reasoning |
| HARM分類 | harm_category |
| ニッチターゲット | niche_formula |
| BDF分析 | bdf |
| 差別化要素 | differentiation |
| キーワード | keywords |
| バックエンド導線案 | backend_idea |
| 構成タイプ | structure_type |

**ユーザーに確認する項目**（自動入力できないもの）：
- 著者名
- 文体（です・ます / だ・である）
- 目標章数（デフォルト: 8章）
- 目標文字数（デフォルト: 20,000文字）

### 実行

選択に応じて `/ebook-init` または `/ebook-produce` のスキルを呼び出す。
引き継ぎデータを含めてスキルを実行し、Phase A の対話を簡略化する。

---

## チームリソース管理

```
TeamCreate("ebook-idea-research")
  ├── trend-researcher       → Phase 2完了後 shutdown
  ├── competitor-researcher  → Phase 2完了後 shutdown
  ├── needs-researcher       → Phase 2完了後 shutdown
  └── theme-evaluator        → Phase 3完了後 shutdown
TeamDelete("ebook-idea-research")
```

- 制作チーム `ebook-{slug}` とは**完全に独立**したチーム
- Phase 3完了後、全メンバーをシャットダウンし、TeamDelete で削除する
- `--auto` モードでも同じチームライフサイクルを使用する
