# 電子書籍原稿作成プロジェクト

複数のKindle向け電子書籍の原稿をMarkdownで作成・管理するワークスペース。
出版社のプロフェッショナルチーム体制をSubAgentで再現し、高品質な原稿を効率的に生成する。

## プロジェクト構造

```
kindle-template/
├── CLAUDE.md                    # プロジェクト指示書（このファイル）
├── books/                       # 全書籍の格納ディレクトリ
│   ├── {book-slug}/             # 書籍ごとのディレクトリ（英数ケバブケース）
│   │   ├── book.yaml            # 書籍メタデータ
│   │   ├── outline.md           # アウトライン
│   │   ├── chapters/            # 章ファイル
│   │   │   ├── 00-introduction.md
│   │   │   ├── 01-chapter.md
│   │   │   └── ...
│   │   ├── assets/              # 画像・図表
│   │   ├── reviews/             # レビュー記録
│   │   │   └── review-ch01.md
│   │   └── manuscript.md        # 結合済み原稿（自動生成）
│   └── {another-book-slug}/
│       └── ...
└── .claude/
    └── skills/                  # スキル定義
```

## 書籍スラッグの規則
- 英数小文字とハイフンのみ使用（例: `ai-business-guide`, `side-hustle-101`）
- スラッグは `book.yaml` の `slug` フィールドと一致させる
- 全スキルは引数として書籍スラッグを受け取る（例: `/ebook-write ai-business-guide 3`）

## book.yaml の形式
```yaml
slug: "ai-business-guide"
title: "書籍タイトル"
subtitle: "サブタイトル（任意）"
author: "著者名"
language: ja
description: |
  書籍の概要説明
target_audience: "想定読者"
genre: "ジャンル"
tone: "です・ます"   # です・ます | だ・である
total_chapters: 10
word_count_target: 50000
status: draft        # draft | in_progress | review | complete
created_at: "2026-02-02"
```

## 章ファイルの規則

### 命名規則
- `00-introduction.md` — はじめに
- `01-chapter.md` ～ `NN-chapter.md` — 各章
- `99-afterword.md` — あとがき

### フロントマター
```markdown
---
chapter: 1
title: "章タイトル"
status: draft       # draft | writing | review | complete
word_count: 0
reviewed_by: []     # レビュー済みの役割リスト
---
```

## 文章スタイルガイド
- 一文は60文字以内を目安
- 段落間は空行で区切る
- 専門用語は初出時に説明を入れる
- book.yaml の `tone` で指定した文体を書籍内で統一する
- 読者に語りかける文体を基本とする
- 箇条書きや見出しを活用して可読性を高める
- Kindle向け横書き前提
- 短い段落を心がける（スマホでの可読性）
- 太字（**強調**）を効果的に使う

## 文字数の目安
- 1章あたり: 3,000〜5,000文字
- 書籍全体: book.yaml の word_count_target を目標とする

---

## プロフェッショナルチーム体制

出版社の制作チームを再現する6つの専門役割を定義する。
各役割はSubAgent（Taskツール）として独立して動作し、並列実行で効率化する。

### 役割一覧

| 役割 | 英名 | 責務 |
|------|------|------|
| 編集長 | Editor-in-Chief | 書籍全体の方向性・品質の最終責任者。企画承認、構成監修、全体の一貫性を担保 |
| 構成作家 | Structure Writer | 章立て・アウトライン設計。読者の導線と論理構成を設計する |
| ライター | Writer | 本文の執筆。アウトラインに沿って読みやすい文章を書く |
| 校正者 | Proofreader | 文字レベルの品質管理。誤字脱字・文法ミス・表記ゆれを修正する |
| 校閲者 | Content Editor | 内容レベルの品質管理。事実確認・論理矛盾・構成の飛躍を指摘する |
| 仕上げ担当 | Finalizer | 原稿の最終整形。目次生成・奥付作成・Kindle向けフォーマット最適化 |

### SubAgentの使い方

各役割は `Task` ツールの `subagent_type: "general-purpose"` で起動する。
プロンプトには以下を必ず含める：

1. **役割の明示**: 「あなたは{役割名}です」
2. **書籍情報**: book.yaml の内容
3. **対象ファイル**: 操作する章ファイルのパス
4. **具体的な指示**: その役割に応じたタスク内容
5. **出力先**: 結果を書き込むファイルパス

### 並列実行の原則

- **並列可能**: 複数章の同時執筆、複数章の同時校正、校正と校閲の同時実行
- **直列必須**: アウトライン → 執筆 → レビュー → 仕上げ（工程間は依存あり）

## ワークフロー

```
/ebook-init         書籍プロジェクト初期化
     ↓
/ebook-outline      アウトライン作成（構成作家 + 編集長）
     ↓
/ebook-write        章の執筆（ライター × 並列）
     ↓
/ebook-review       校正・校閲（校正者 + 校閲者 × 並列）
     ↓
/ebook-build        原稿結合・仕上げ（仕上げ担当）
     ↓
/ebook-status       全書籍の進捗確認
/ebook-list         管理中の書籍一覧
/ebook-produce      全工程一括実行（企画→完成まで自動）
```
