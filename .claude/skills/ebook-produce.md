---
name: ebook-produce
description: 全工程一括実行。企画からPR作成まで全自動
argument-hint: "[book-slug]"
---

# /ebook-produce — 全工程一括実行

電子書籍の企画から原稿完成・PR作成まで**全工程を一気通貫で自動実行**する。
Agent Teamsでチームを作成し、共有タスクリストで全工程の進捗を管理する。

引数パターン：
- `/ebook-produce` — 新規書籍を企画から一気通貫で作成（init含む）
- `/ebook-produce {slug}` — 企画済み書籍の制作を一気通貫で実行

これは出版社のプロダクション工程を一気通貫で回すスキルである。
各工程でプロフェッショナルチームのメンバーを適切に起動し、並列実行を最大限活用する。

## デフォルト値の読み込み

スキル実行開始時に、プロジェクトルートの `.env` ファイルを読み込む。
`.env` が存在しない場合は `.env.example` を参照し、ユーザーに `.env` の作成を案内する。

| 環境変数 | 用途 | デフォルト適用先 |
|---------|------|----------------|
| `AUTHOR_NAME` | 著者名（ペンネーム） | 工程-1 Phase A: 著者名の初期値 |
| `DEFAULT_TONE` | 文体 | 工程-1 Phase A: 文体の初期値 |
| `WRITING_STYLE` | 文章の雰囲気・トーン | 工程2: ライターへの文体指針、工程3: 校正・校閲の判断基準 |
| `AUTHOR_BACKGROUND` | 著者バックグラウンド | 工程-1 Phase B: 戦略設計の入力 |
| `EXCLUDED_TOPICS` | 除外テーマ | 工程-1 Phase 0: テーマ調査の入力 |

これらの値が `.env` に設定済みの場合、対応する質問をスキップまたは初期値として使用する。

## 実行フロー判定

1. 引数にスラッグが指定されている場合:
   - `books/{slug}/book.yaml` の存在を確認する
   - **存在する**: 工程0（チーム作成）から開始
   - **存在しない**: エラー（`/ebook-init {slug}` を先に実行するよう案内）

2. 引数なしの場合:
   - **工程-1（企画・初期化）から開始**する

---

## 工程-1: 企画・初期化（book.yamlが存在しない場合のみ）

この工程のみユーザー対話が発生する。企画が固まったら以降は全自動。

### Phase 0: テーマ発見（任意）

まず、テーマが決まっているかを確認する。

AskUserQuestion:
- 「書きたいテーマは決まっていますか？」
  - **はい** → Phase A（従来通り基本情報の収集）に進む
  - **いいえ（テーマ探しから始める）** → `/ebook-idea` のフローを実行する

`/ebook-idea` のフロー完了後、選択テーマの構造化データ（タイトル案・BDF・ニッチ公式・キーワード・差別化等）が得られる。
このデータで Phase A の質問項目を自動入力し、ユーザーには以下のみ確認する：
- 著者名
- 文体（です・ます / だ・である）
- 目標章数（デフォルト: 8章）
- 目標文字数（デフォルト: 20,000文字）

Phase B（戦略設計）は `/ebook-idea` で完了済みのためスキップし、Phase C に進む。

### Phase A: 基本情報の収集

ユーザーに以下を質問する（AskUserQuestionを使用）：
- 書籍タイトル（仮でも可。後で最適化する）
- 著者名
- ジャンル（ビジネス、自己啓発、技術書、エッセイ、小説 など）
- 想定読者（ターゲット）
- 書籍の概要（どんな内容を書きたいか）
- 文体（「です・ます」調 / 「だ・である」調）
- 目標章数（デフォルト: 8章）
- 目標文字数（デフォルト: 20,000文字前後）

### Phase B: 戦略設計（BDF分析・ニッチ戦略）

収集した情報をもとに、戦略設計SubAgent（単独）を起動する：
- `subagent_type: "general-purpose"`
- プロンプト内容：

```
あなたは電子書籍のマーケティング戦略家です。以下の書籍企画に対して戦略設計を行ってください。

【書籍企画】
{ユーザーから収集した基本情報}

【タスク】
以下の項目を分析・提案してください。結果はJSON形式で返してください。

1. HARM分類: テーマが Money / Health / Ambition / Relation のどれに該当するか判定
2. ニッチターゲット: 「ターゲット × ベネフィット × 手法」の掛け合わせで具体化
3. BDF分析:
   - Belief（読者の思い込み）: その分野で読者が抱いている固定観念
   - Desire（欲求）: 読者が本当はどうなりたいか
   - Feeling（感情）: 現状に対する読者の感情
4. 差別化コンセプト: 「[Belief]を否定し、[Desire]を叶えるための、[独自の解決策]」
5. Amazon SEOキーワード: 読者が検索しそうなキーワードを最大7つ提案
6. タイトル最適化案: 以下の公式に基づくタイトル案を3つ提案
   公式: [ターゲット] × [ベネフィット（数字・期間）] × [権威性・簡易性]
   9つの訴求要素（ベネフィット、期間、簡易性、権威性、限定性、数字、ターゲット明示、好奇心、緊急性）をできる限り盛り込む
7. 構成タイプ推奨: problem-solving（問題解決型） or story（ストーリー型）
8. バックエンド導線案: 書籍の先にある商品・サービスへの導線提案
```

戦略設計の結果をユーザーに提示し、確認を求める：
- タイトル案から1つを選択（またはユーザーが修正）
- BDF分析の内容を確認
- バックエンド導線の有無を確認（不要なら空欄）

### Phase C: プロジェクト作成

1. タイトルから英数ケバブケースのスラッグを生成する（例: `ai-business-guide`）

2. **Gitブランチを作成する**：
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/{slug}
   ```

3. 以下のディレクトリとファイルを作成する：
   ```
   books/{slug}/
   ├── book.yaml
   ├── chapters/
   │   ├── 00-introduction.md
   │   └── 99-afterword.md
   ├── assets/
   └── reviews/
   ```

4. book.yaml を作成する（戦略フィールド込み）：
   ```yaml
   slug: "{スラッグ}"
   title: "{最適化済みタイトル}"
   subtitle: "{サブタイトル}"
   author: "{著者名}"
   language: ja
   description: |
     {概要}
   target_audience: "{想定読者}"
   genre: "{ジャンル}"
   tone: "{文体}"
   total_chapters: {章数}
   word_count_target: {目標文字数}
   status: draft
   created_at: "{作成日}"

   # --- 戦略設計 ---
   harm_category: "{HARM分類}"
   niche_target: "{ニッチターゲット}"
   bdf:
     belief: "{読者の思い込み}"
     desire: "{読者の欲求}"
     feeling: "{読者の感情}"
   differentiation: "{差別化要素}"
   backend_offer: "{バックエンド導線}"
   keywords:
     - "{キーワード1}"
     - "{キーワード2}"
     - "{キーワード3}"
   structure_type: "{problem-solving or story}"
   ```

5. 章テンプレートは以下のフロントマターで作成する：
   ```markdown
   ---
   chapter: 0
   title: "はじめに"
   status: draft
   word_count: 0
   reviewed_by: []
   ---

   # はじめに

   （ここに本文を記述）
   ```

6. **初期コミットを作成する**：
   ```bash
   git add books/{slug}/
   git commit -m "[{slug}] init: プロジェクト初期化"
   ```

**→ 企画完了。以降は全自動（ユーザー対話なし）で工程0に進む。**

---

## 工程0: チーム作成

`TeamCreate(team_name="ebook-{slug}")` でチームを作成する。
- チーム名例: `ebook-ai-business-guide`
- チームリーダー = メインエージェント（スキル実行者）

## 工程1: アウトライン作成

1. タスクを作成する：
   - `TaskCreate("アウトライン作成")` → structure-writer に割り当て
   - `TaskCreate("アウトラインレビュー")` → editor-in-chief に割り当て、blockedBy: [アウトライン作成]

2. 構成作家と編集長を**並列起動**する：
   - `structure-writer`（general-purpose, team_name="ebook-{slug}", name="structure-writer"）:
     book.yamlを読み、outline.mdを作成し、各章の空ファイルをchapters/に生成する。
     TaskUpdate でタスクを管理すること。
   - `editor-in-chief`（general-purpose, team_name="ebook-{slug}", name="editor-in-chief"）:
     outline.mdをレビューし、必要に応じて修正する。
     TaskList で依存タスクの完了を確認してから着手すること。
     **後続工程でも使い続けるため、シャットダウン要求が来るまで待機すること。**

3. 全タスク完了確認（TaskList で工程1の全タスクが completed であること）
4. `structure-writer` を `SendMessage(type="shutdown_request")` でシャットダウン
   - **`editor-in-chief` はシャットダウンしない**

**コミット**:
```bash
git add books/{slug}/
git commit -m "[{slug}] outline: アウトライン作成"
```

## 工程2: 全章執筆

1. 対象章ごとにタスクを作成する：
   - `TaskCreate("第{N}章 執筆")` → writer-ch{NN} に割り当て

2. ライター × N章を**全章分並列起動**する（1メッセージ内で全TaskツールをMultiple呼び出し）：
   - `writer-ch{NN}`（general-purpose, team_name="ebook-{slug}", name="writer-ch{NN}"）:
     各章を outline.md に沿って執筆する。
     疑問があれば SendMessage(recipient="editor-in-chief") で編集長に質問できる。

3. 全タスク完了確認（TaskList で工程2の全タスクが completed であること）
4. 全ライターを `SendMessage(type="shutdown_request")` でシャットダウン

**コミット**:
```bash
git add books/{slug}/chapters/
git commit -m "[{slug}] write: 全章執筆完了"
```

## 工程3: 全章レビュー

1. 各章について3タスクを作成する（依存関係付き）：
   - `TaskCreate("第{N}章 校正")` → proofreader に割り当て
   - `TaskCreate("第{N}章 校閲")` → content-editor に割り当て
   - `TaskCreate("第{N}章 編集長レビュー")` → editor-in-chief に割り当て、**blockedBy: [校正, 校閲]**

2. 校正者と校閲者を**並列起動**する：
   - `proofreader`（general-purpose, team_name="ebook-{slug}", name="proofreader"）:
     全対象章の校正タスクを順次処理する。
   - `content-editor`（general-purpose, team_name="ebook-{slug}", name="content-editor"）:
     全対象章の校閲タスクを順次処理する。

3. 校正・校閲タスク全完了確認（TaskList で全校正・校閲タスクが completed であること）
4. `proofreader` と `content-editor` を `SendMessage(type="shutdown_request")` でシャットダウン

5. `editor-in-chief` に統合レビューの実施をメッセージで依頼する（SendMessage）：
   校正レポートと校閲レポートを統合し、各章の最終修正を適用。
   フロントマターの reviewed_by に ["proofreader", "content_editor", "editor_in_chief"] を追加。
   status を "review" に更新。

6. 全編集長レビュータスク完了確認（TaskList で全タスクが completed であること）

**コミット**:
```bash
git add books/{slug}/
git commit -m "[{slug}] review: 全章レビュー完了"
```

## 工程4: 原稿結合

1. `TaskCreate("原稿結合")` → finalizer に割り当て

2. 仕上げ担当を起動する：
   - `finalizer`（general-purpose, team_name="ebook-{slug}", name="finalizer"）:
     全章を結合し、目次・奥付を自動生成する。
     巻末必須要素（レビュー依頼文・特典オファー・著者プロフィール）を確認・補完する。

3. タスク完了確認（TaskList で「原稿結合」が completed であること）

**コミット**:
```bash
git add books/{slug}/manuscript.md
git commit -m "[{slug}] build: 原稿結合完了"
```

## 工程5: チームクリーンアップ

1. 全メンバーをシャットダウンする：
   - `finalizer` に `SendMessage(type="shutdown_request")` を送信
   - `editor-in-chief` に `SendMessage(type="shutdown_request")` を送信
2. 全メンバーのシャットダウンを確認後、`TeamDelete()` でチームリソースを削除する

## 工程6: プルリクエスト作成

1. 全章の `reviewed_by` に `editor_in_chief` が含まれていることを最終確認する
2. リモートにプッシュする:
   ```bash
   git push -u origin feature/{slug}
   ```
3. gh コマンドでPRを作成する:
   - タイトル: `{書籍タイトル} — 原稿完成`
   - 本文: 制作完了レポート（文字数統計・レビュー状況）

## 工程7: 最終レポート
全工程完了後、以下を報告する：

```
===================================
制作完了レポート: {書籍タイトル}
===================================

総章数: {N}章
総文字数: {X}文字 / 目標 {Y}文字
目標達成率: {Z}%

各章の文字数:
  はじめに:    {X}文字
  第1章: ...  {X}文字
  第2章: ...  {X}文字
  ...
  あとがき:    {X}文字

レビュー状況: 全章レビュー済み
出力ファイル: books/{slug}/manuscript.md
PR: {PR URL}
===================================
```

## メンバー起動時の共通ルール

全てのメンバー起動プロンプトには以下を必ず含めること：

1. **役割の明示**: 「あなたは{役割名}です」
2. **書籍情報**: book.yaml の全内容
3. **対象ファイルの絶対パス**: 読み書きするファイルを明示
4. **CLAUDE.mdの文章スタイルガイド**: 一文60文字以内、文体統一、Kindle最適化等のルール。書籍全体で20,000文字前後、1章あたり1,500〜2,500文字を目標とする
5. **文章の雰囲気（WRITING_STYLE）**: `.env` の `WRITING_STYLE` を文体指針としてプロンプトに含める。ライターは執筆時の文章トーンとして、校正者・校閲者は文体の一貫性チェックの基準として使用する
6. **具体的なタスク**: 何を行い、何を出力するか
6. **出力先ファイルパス**: 結果を書き込むファイルを明示
7. **チーム作業ルール**:
   - TaskList で自分に割り当てられたタスクを確認すること
   - 作業開始時に TaskUpdate(status="in_progress") を実行すること
   - 作業完了時に TaskUpdate(status="completed") を実行すること
   - 疑問がある場合は SendMessage で適切なメンバーに連絡すること

## 並列実行の最大化

このスキルの最大の特徴は並列実行の徹底である：

- 工程1では構成作家と編集長を並列起動する（タスク依存関係で順序を制御）
- 工程2では全章のライターを1メッセージで同時起動する
- 工程3では校正者と校閲者を並列起動する（タスク依存関係で編集長レビューの順序を制御）
- 工程間（0→1→2→3→4→5→6）は直列だが、工程内は最大限並列化する
- タスク依存関係（blockedBy）で自動的に前工程完了を検知し、待機→着手の流れを制御する
