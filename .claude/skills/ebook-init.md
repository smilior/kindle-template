# /ebook-init — 電子書籍プロジェクト初期化

新しい電子書籍プロジェクトを初期化する。

## 手順

1. ユーザーに以下を質問する（AskUserQuestionを使用）：
   - 書籍タイトル
   - 著者名
   - ジャンル（ビジネス、自己啓発、技術書、エッセイ、小説 など）
   - 想定読者（ターゲット）
   - 書籍の概要（どんな内容を書きたいか）
   - 文体（「です・ます」調 / 「だ・である」調）
   - 目標章数（デフォルト: 10章）
   - 目標文字数（デフォルト: 30,000〜50,000文字）

2. タイトルから英数ケバブケースのスラッグを生成する（例: `ai-business-guide`）

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

4. book.yaml を以下の形式で作成する：
   ```yaml
   slug: "{スラッグ}"
   title: "{タイトル}"
   subtitle: ""
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

6. 作成完了後、次のステップとして `/ebook-outline {slug}` でアウトライン作成を案内する。
