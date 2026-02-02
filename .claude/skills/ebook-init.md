# /ebook-init — 電子書籍プロジェクト初期化

新しい電子書籍プロジェクトを初期化し、featureブランチを作成する。
CLAUDE.mdのベストプラクティスに基づき、戦略設計（BDF分析・ニッチ戦略）も同時に行う。

## 手順

### Phase 1: 基本情報の収集

1. ユーザーに以下を質問する（AskUserQuestionを使用）：
   - 書籍タイトル（仮でも可。後で最適化する）
   - 著者名
   - ジャンル（ビジネス、自己啓発、技術書、エッセイ、小説 など）
   - 想定読者（ターゲット）
   - 書籍の概要（どんな内容を書きたいか）
   - 文体（「です・ます」調 / 「だ・である」調）
   - 目標章数（デフォルト: 8章）
   - 目標文字数（デフォルト: 20,000文字前後）

### Phase 2: 戦略設計（BDF分析・ニッチ戦略）

2. 収集した情報をもとに、戦略設計SubAgentを起動する：
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
   - 悪い例: 「ダイエットしたい人」
   - 良い例: 「残業続きの30代営業マンで運動する時間がない人」
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

3. 戦略設計の結果をユーザーに提示し、確認を求める：
   - タイトル案から1つを選択（またはユーザーが修正）
   - BDF分析の内容を確認
   - バックエンド導線の有無を確認（不要なら空欄）

### Phase 3: プロジェクト作成

4. タイトルから英数ケバブケースのスラッグを生成する（例: `ai-business-guide`）

5. **Gitブランチを作成する**：
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/{slug}
   ```

6. 以下のディレクトリとファイルを作成する：
   ```
   books/{slug}/
   ├── book.yaml
   ├── chapters/
   │   ├── 00-introduction.md
   │   └── 99-afterword.md
   ├── assets/
   └── reviews/
   ```

7. book.yaml を以下の形式で作成する（戦略フィールド込み）：
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

8. 章テンプレートは以下のフロントマターで作成する：
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

9. **初期コミットを作成する**：
   ```bash
   git add books/{slug}/
   git commit -m "[{slug}] init: プロジェクト初期化"
   ```

10. 作成完了後、次のステップとして `/ebook-outline {slug}` でアウトライン作成を案内する。
