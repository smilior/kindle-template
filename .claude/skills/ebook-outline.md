# /ebook-outline — アウトライン作成

書籍のアウトライン（構成案）を作成する。Agent Teamsでチームを作成し、構成作家と編集長をメンバーとして起動する。
book.yaml の戦略設計（BDF分析・構成タイプ・ニッチ戦略）を反映した構成にする。
引数: 書籍スラッグ（例: `/ebook-outline ai-business-guide`）

## 手順

1. 現在のブランチが `feature/{slug}` であることを確認する。異なる場合はチェックアウトする。
2. `books/{slug}/book.yaml` を読み込む

### Phase 0: チーム作成

3. `TeamCreate(team_name="ebook-{slug}")` でチームを作成する
   - チーム名例: `ebook-ai-business-guide`
   - チームリーダー = メインエージェント（スキル実行者）

4. タスクを作成する：
   - `TaskCreate("アウトライン作成")` → structure-writer に割り当て
   - `TaskCreate("アウトラインレビュー")` → editor-in-chief に割り当て、blockedBy: [アウトライン作成]

### Phase 1: メンバー起動（構成作家 + 編集長を並列起動）

5. 以下の2つのメンバーを**並列**で起動する（1メッセージ内で2つのTaskツールを同時呼び出し）

#### 構成作家（Structure Writer）メンバー

Taskツールで起動する：
- `subagent_type: "general-purpose"`
- `team_name: "ebook-{slug}"`
- `name: "structure-writer"`
- プロンプト内容：

```
あなたはプロの構成作家です。チーム「ebook-{slug}」の structure-writer として活動します。

## チーム作業ルール
- TaskList で自分に割り当てられたタスク「アウトライン作成」を確認すること
- 作業開始時に TaskUpdate(status="in_progress") を実行すること
- 作業完了時に TaskUpdate(status="completed") を実行すること
- 疑問や問題がある場合は SendMessage(recipient="editor-in-chief") で編集長に連絡すること

## タスク: アウトラインの作成

【書籍情報】
{book.yamlの内容をここに展開（戦略設計フィールド含む）}

【構成の基本方針】
book.yaml の structure_type に応じた構成テンプレートを採用すること：

■ problem-solving（問題解決型）の場合：
  - 序章: この本で解決できる未来の提示（BDFのDesireを示す）
  - 第1章: なぜその問題が起きるのか（BDFのBeliefを否定する導入）
  - 第2章: 解決の基本原則
  - 第3〜6章: 実践ステップ（具体的手法）
  - 第7〜8章: 応用・発展
  - 終章: 読者への行動喚起

■ story（ストーリー型）の場合：
  - 悩み・どん底の状態（BDFのFeelingに共感）
  - 出会い・気づき
  - 実践・失敗の繰り返し
  - 成功・変化（BDFのDesireの実現）
  - 読者へのメッセージ

【3つの壁を超える構成ルール（必須）】
1. 序章（はじめに）で「読まない壁」を突破する：
   - BDFに基づいた悩みを提示し「この本はあなたのための本だ」と確信させる
   - 読むとどうなれるか（ベネフィット）を最初に示す
2. 本編で「信じない壁」を突破する：
   - 著者の実績・体験談・データで信頼を得る
   - ノウハウを惜しみなく開示する
3. 終章（あとがき）で「行動しない壁」を突破する：
   - 読者への行動喚起を明確に行う
   - バックエンド導線（{backend_offer}）へ誘導する

【ブリッジ（章末予告）の義務化】
各章の概要設計に「次章への橋渡し文」を含めること。

【ニッチ戦略の反映】
- ニッチターゲット: {niche_target}
- 差別化要素: {differentiation}
- これらが全章を通じて一貫して反映されるよう構成すること

【出力形式】
# {書籍タイトル} — アウトライン

## 書籍概要
{概要}

## 想定読者
{ニッチターゲット}

## BDF分析
- Belief: {belief}
- Desire: {desire}
- Feeling: {feeling}

## 差別化コンセプト
{differentiation}

## 全体構成（{structure_type}型）

### はじめに —「読まない壁」の突破
- 読者の悩み（BDFのFeeling）への共感
- ベネフィットの提示
- 本書の読み方
**ブリッジ**: {次章への橋渡し}

### 第1章: {章タイトル}
**概要**: {章の概要}
**キーポイント**:
- ポイント1
- ポイント2
- ポイント3
**ブリッジ**: {次章への橋渡し}

（以降、全章分）

### あとがき —「行動しない壁」の突破
- まとめと行動喚起
- 読者限定特典オファー（{backend_offer}）
- レビュー依頼文
- 著者プロフィール

【出力先】
books/{slug}/outline.md に Write ツールで書き込むこと。
また、各章に対応する空のchapterファイル（01-chapter.md 〜 NN-chapter.md）を
books/{slug}/chapters/ に作成すること。
各chapterファイルにはフロントマター（chapter番号、title、status: draft、word_count: 0、reviewed_by: []）を含めること。
```

#### 編集長（Editor-in-Chief）メンバー

Taskツールで起動する：
- `subagent_type: "general-purpose"`
- `team_name: "ebook-{slug}"`
- `name: "editor-in-chief"`
- プロンプト内容：

```
あなたは出版社の編集長です。チーム「ebook-{slug}」の editor-in-chief として活動します。
あなたはアウトライン工程だけでなく、執筆・レビュー・仕上げまで全工程を通じて品質を監督する役割です。

## チーム作業ルール
- TaskList で自分に割り当てられたタスクを確認すること
- 「アウトラインレビュー」タスクは「アウトライン作成」完了後に着手可能になる
- 作業開始時に TaskUpdate(status="in_progress") を実行すること
- 作業完了時に TaskUpdate(status="completed") を実行すること
- 構成作家からメッセージを受け取った場合は適切に対応すること
- 後続工程でもメッセージが届く可能性があるので、シャットダウン要求が来るまで待機すること

## タスク: アウトラインレビュー

「アウトライン作成」タスクが完了したら着手すること。
TaskList を定期的に確認し、依存タスクの完了を検知すること。

【書籍情報】
{book.yamlの内容（戦略設計フィールド含む）}

【レビュー観点】
1. 書籍のコンセプト（BDF・差別化要素）が構成に正しく反映されているか
2. 章間の論理的な流れに飛躍や重複がないか
3. 「3つの壁」（読まない・信じない・行動しない）を突破する構成になっているか
4. 各章にブリッジ（次章予告）が設計されているか
5. 序章でBDFのFeelingに共感し、ベネフィットを提示しているか
6. あとがきにバックエンド導線・レビュー依頼・著者プロフィールが含まれているか
7. ニッチターゲットに一貫して語りかける構成か
8. 各章のボリュームバランスは適切か（全体20,000文字前後、1章1,500〜2,500文字）
9. 構成タイプ（problem-solving / story）に適した流れになっているか

問題があれば outline.md を直接修正してください。
修正した場合は、何をどう変えたかを簡潔に報告してください。
修正がなければ「承認」と報告してください。
```

### Phase 2: 完了処理

6. 両メンバーのタスク完了を確認する（TaskList で全タスクが completed であること）
7. `structure-writer` に `SendMessage(type="shutdown_request")` を送信してシャットダウンする
   - **`editor-in-chief` はシャットダウンしない**（後続工程で引き続き使用する）

8. **コミットする**：
   ```bash
   git add books/{slug}/
   git commit -m "[{slug}] outline: アウトライン作成"
   ```
