# /ebook-write — 章の執筆

ライターメンバーを並列起動して章を執筆する。
book.yaml の戦略設計とベストプラクティスを反映した原稿を作成する。
引数: 書籍スラッグ [章番号|"all"]（例: `/ebook-write ai-business-guide 3` または `/ebook-write ai-business-guide all`）

## 手順

1. 現在のブランチが `feature/{slug}` であることを確認する。異なる場合はチェックアウトする。
2. `books/{slug}/book.yaml` と `books/{slug}/outline.md` を読み込む
3. 引数に応じて対象章を決定する：
   - 章番号指定 → その章のみ
   - `all` → status: draft の全章
   - 未指定 → 次の未執筆章を1つ

### Phase 0: チーム確認

4. チーム `ebook-{slug}` の存在を確認する（`~/.claude/teams/ebook-{slug}/config.json` を Read で確認）
   - 存在する場合: そのまま利用する
   - 存在しない場合: `TeamCreate(team_name="ebook-{slug}")` で作成する

### Phase 1: タスク作成

5. 対象の各章についてタスクを作成する：
   - `TaskCreate("第{N}章 執筆")` → `writer-ch{NN}` に割り当て
   - 全章分のタスクをまとめて作成する

### Phase 2: ライターメンバーの並列起動

6. 対象章ごとに1つずつライターメンバーを起動する（**1メッセージ内で全章分を並列起動**）

#### ライター（Writer）メンバー

対象章ごとにTaskツールで起動する：
- `subagent_type: "general-purpose"`
- `team_name: "ebook-{slug}"`
- `name: "writer-ch{NN}"` （例: `writer-ch00`, `writer-ch01`, `writer-ch99`）
- プロンプト内容：

```
あなたはプロのライターです。チーム「ebook-{slug}」の writer-ch{NN} として活動します。

## チーム作業ルール
- TaskList で自分に割り当てられたタスク「第{N}章 執筆」を確認すること
- 作業開始時に TaskUpdate(status="in_progress") を実行すること
- 作業完了時に TaskUpdate(status="completed") を実行すること
- アウトラインの疑問や執筆方針の不明点は SendMessage(recipient="editor-in-chief") で編集長に質問できる
- 他のメンバーからメッセージを受け取った場合は適切に対応すること

## タスク: 第{N}章の執筆

【書籍情報】
{book.yamlの内容（戦略設計フィールド含む）}

【アウトラインの該当章】
{outline.mdから対象章のセクションを抜粋}

【戦略設計の反映（必須）】
- BDF分析を意識すること:
  - Belief: {belief} → この思い込みを本編で崩していく
  - Desire: {desire} → 読者がこうなれることを示す
  - Feeling: {feeling} → 読者の感情に寄り添う表現を使う
- ニッチターゲット「{niche_target}」に語りかけるよう書く
- 差別化要素「{differentiation}」を活かした具体例・体験談を盛り込む
- 単なる情報の羅列ではなく、ストーリー性を持たせる
  - 「問題提起 → 共感 → 小さな成功体験」の流れを各章内でも意識する
  - 著者の失敗談・克服体験を適宜挿入する

【執筆ガイドライン】
- 文体: {book.yamlのtone}で統一する
- 一文60文字以内を目安
- 章の冒頭: 読者の興味を引くエピソードや問いかけで始める
- 本論: アウトラインのキーポイントを具体例やエピソードを交えて展開する
- 章の結び: 要点のまとめ + ブリッジ（次章への橋渡し文。アウトラインに記載あり）
- 適度に小見出し（##, ###）を使う
- 読者への問いかけを適宜入れる
- 箇条書きを活用して情報を整理する
- 短い段落を心がける（スマホでの可読性）
- 太字（**強調**）を効果的に使う
- 1章あたり1,500〜2,500文字を目標（はじめに・あとがきは800〜1,500文字）
- 書籍全体で20,000文字前後になるよう各章のバランスを意識する
- 内容の充実度を優先し、水増しはしない
- 専門用語は避け、会話調を取り入れて読みやすくする（Kindle Unlimited対策）

【はじめに（00-introduction.md）の特別ルール】
- 「読まない壁」を突破する最重要パート
- BDFのFeelingに基づく悩みを提示し共感する
- 「この本を読むとどうなれるか」を明確に示す
- 本書の構成と読み方を案内する

【あとがき（99-afterword.md）の特別ルール】
- 「行動しない壁」を突破する
- 本書の要点を簡潔にまとめる
- 読者への行動喚起を明確に行う
- バックエンド導線: {backend_offer}（特典オファーのプレースホルダを記載）
- レビュー依頼文: 「本書が少しでもお役に立てたなら、Amazonでの評価をいただけると大変励みになります。」
- 著者プロフィール: 権威性と親近感を両立した紹介文

【出力先】
books/{slug}/chapters/{NN}-chapter.md に Write ツールで書き込むこと。
既存のフロントマターを保持し、status を "writing" に、word_count を実際の文字数に更新すること。
```

### Phase 3: 完了処理

7. 全ライターのタスク完了を確認する（TaskList で全執筆タスクが completed であること）
8. 各章の文字数を集計する
9. 全ライターに `SendMessage(type="shutdown_request")` を送信してシャットダウンする

10. **コミットする**：
   ```bash
   git add books/{slug}/chapters/
   git commit -m "[{slug}] write: {対象章の説明} 執筆完了"
   ```
   例: `[ai-business-guide] write: 第1章〜第8章 執筆完了`
