# 見本: Cloudflare OS 入門 / Cloudflare OS Essentials

`kindle-book` スキルとレイアウト原紙で実際に作りきった **完成原稿の見本**です。

> **この配下は編集しません。** 新しい本を作るときは `book/JP/`（英語版は `book/EN/`）に原紙をコピーして始めてください。ここは「完成形はこうなる」を確認するための参照用です。

| フォルダ | 中身 |
|----------|------|
| **[JP/](JP/)** | 日本語版 — Cloudflare OS 入門（`with-text.html` / `TASKS.md` / `images/`） |
| **[EN/](EN/)** | English — Cloudflare OS Essentials |
| **[docs/](docs/)** | KDP 入力値・表紙デザイン依頼書（[JP](docs/JP/) / [EN](docs/EN/)） |
| **[scripts/](scripts/)** | 第3章の画面キャプチャ再撮影スクリプト（Playwright） |
| **[NOTES.md](NOTES.md)** | この本だけに効いていた執筆ルール（トーン・撮影環境） |

## 開く

```bash
open examples/cloudflare-os/JP/with-text.html   # 日本語版
open examples/cloudflare-os/EN/with-text.html   # English
```

## 見どころ

- **構成**: 表紙 → 目次 → はじめに →（章扉 → 本文 → 章末まとめ）× 7 → おわりに → 付録A/B/C → 奥付（各版 80 ページ・ノンブル 3〜80）
- **タスク表の使い方**: `JP/TASKS.md` に章ごとの進捗と体裁チェックを残した実例
- **図のトーン**: 概念図はポイント緑 `#2f9e5f` ＋グレーのみ（`JP/images/os-compare.svg` ほか）
- **画面キャプチャ**: Light モード＋フォーカス切り出しの実例（`JP/images/ch3-*.png`）
- **日英2版**: 同じ骨格で言語版を並走させた例（EN は印刷プレビューのみ未確認）
