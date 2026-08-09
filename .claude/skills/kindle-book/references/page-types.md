# ページ型 — 空枠と文字入りの対応

正本の見本は `assets/with-text.html`。書籍の流し込みでは **文字入り側のクラス**を使う。

共通の箱:

```html
<section class="sheet-wrap" id="...">
  <p class="sheet-label no-print">N · 名称</p>
  <article class="page page-...">
    ...
  </article>
</section>
```

`body` には `class="with-text"` を付け、CSS は `templates.css` と `with-text.css` の両方を読む。

---

## 1. 表紙 `page-cover`

| 空枠 | 文字入り |
| --- | --- |
| `.bar-title` | `h1.cover-title` |
| `.bar-subtitle` | `p.cover-subtitle` |
| `.bar-tagline` | `p.cover-tagline` |
| `.bar-meta` | `p.cover-meta` |

黄の短い線 `.mark-line.mark-line-short` はタイトル下に残す。

## 2. 目次 `page-toc`

| 空枠 | 文字入り |
| --- | --- |
| `.bar-heading` | `h2.page-title`（例: 目次） |
| `.toc-list` + `.toc-row` | `ol.toc-list-text` + `li` |
| 行内 | `.toc-num` / `.toc-label` + `.toc-leader` + `.toc-page` |
| `.folio` | `.folio-num` |

## 3. 本文 `page-body`

| 空枠 | 文字入り |
| --- | --- |
| `.bar-running` | `span.running-text` |
| `.sec-num` + `.bar-sec-title` | `.section-head-text` + `.sec-num-text` + `h3.sec-title` |
| `.bar-body` 群 | `.body-prose` + `p` |
| `.figure-box` + `.bar-caption` | `.figure-box-label`（任意）+ `p.caption` |
| `.folio` | `.folio-num` |

**字下げ（必須）:** `.body-prose p` は `text-indent: 1em`（1文字分）。`with-text.css` で指定。囲み・手順・表・キャプション・箇条書きには付けない。

**節見出し（必須）:** `h3.sec-title` は **1ページ（1つの `sheet-wrap`）に1つまで**。2つ目の節は必ず別ページに送る。

## 4. 章扉 `page-chapter`

| 空枠 | 文字入り |
| --- | --- |
| `.chapter-num` | `p.chapter-num-text` |
| `.bar-chapter-title` | `h2.chapter-title-text` |
| `.bar-chapter-sub` | `p.chapter-sub-text` |

親に `.chapter-center-text` を付ける。

## 5. はじめに `page-preface` / おわりに `page-outro`

- 見出し: `h2.page-title` + `.mark-line-heading`
- 本文: `.body-prose`
- 箇条書き: `ul.text-list`
- おわりに下部の余白: `.outro-space`（任意）

## 6. 手順 `page-steps`

```html
<ol class="steps-list-text">
  <li class="step-item">
    <div class="step-row">
      <span class="step-num">1.</span>
      <div class="step-copy">
        <p class="step-title">...</p>
        <p class="step-note">...</p>
      </div>
    </div>
    <div class="figure-block step-figure">
      <div class="figure-box figure-box-label figure-box-step">
        <span class="figure-placeholder">差し込み説明</span>
      </div>
      <p class="caption">図: ...</p>
    </div>
  </li>
</ol>
```

## 7. 図 `page-figure`

`.figure-stack` 内に複数の `.figure-block`。幅バリエーション: `.figure-box-wide` / `.figure-box-mid`。

差し込み図（SVG/PNG）を新規作成したら、渡す前に **文字の重なり・線と文字・はみ出し・余白・コントラスト** を PNG 目視で確認する（詳細は `AGENTS.md` / `SKILL.md` の「図の作成後チェック」）。

## 8. 囲み `page-callout` / ポイント `.callout-point`

### 通常の囲み（注意・用語など）

```html
<div class="callout callout-text">
  <div class="callout-icon callout-icon-a" aria-hidden="true"></div>
  <div class="callout-body">
    <p class="callout-kicker">注意</p>
    <p>...</p>
  </div>
</div>
```

アイコン: `callout-icon-a` / `b` / `c`。キッカー例: 注意 / 用語。

### 行動喚起のポイント（緑点線・指アイコン）

「次は手を動かそう」など短い励まし用。スタイルは `with-text.css` の `.callout-point`。

```html
<div class="callout callout-point">
  <div class="callout-point-icon" aria-hidden="true">
    <!-- 指の線画 SVG（第1章まとめの例をコピー） -->
  </div>
  <div class="callout-body">
    <p class="callout-kicker callout-point-kicker">ポイント</p>
    <p>（短文。囲み内は字下げしない）</p>
  </div>
</div>
```

見た目: 緑点線枠・白背景・いびつな角丸・左に指アイコン。通常 callout の「ポイント」キッカーとは別クラスを使う。

## 9. 表 `page-table`

`table.text-table`（`thead` / `tbody`）。ページ見出しは他と同様 `h2.page-title`。

## 10. 章末まとめ `page-summary`

- 見出しは **`この章のまとめ`**（「この章でできたこと」は使わない）
- 本文: `ul.text-list` — **チェックリスト表示**（CSS: `.page-summary .text-list li::before` で ☑）。通常本文の `ul.text-list`（・）とは見た目が違う
- 余白 `.summary-space`
- 次章導線 `p.next-hint`
- 行動喚起があれば `.callout-point` をまとめ内に置いてよい

キーワード早見（`page-table`）を章に入れる場合は、**まとめの直前**など章末側に置く。

## 10b. 画面キャプチャの差し込み

UI スクショは **Light モード・フォーカス切り出し**（詳細は `references/screenshots.md`）。

```html
<div class="figure-block">
  <div class="figure-box figure-box-wide figure-box-img figure-box-entry">
    <img src="images/example.png" alt="…" />
  </div>
  <p class="caption">図: …</p>
</div>
```

`.figure-box-entry` は入口・フォームなど本文同居用の高さ上限。全面キャプチャのまま載せない。

## 11. 奥付 `page-colophon`

```html
<div class="colophon-stack colophon-stack-text">
  <p class="colophon-title">書名</p>
  <p>版・年</p>
  ...
  <p class="colophon-note">注記</p>
</div>
```

---

## ページの複製

同じ型を複数枚使うときは `sheet-wrap` ごと複製し、`id` は一意にする（例: `body-ch1-1`, `body-ch1-2`）。ツールバーのアンカーリンクは主要なページだけでもよい。
