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

## 8. 囲み `page-callout`

```html
<div class="callout callout-text">
  <div class="callout-icon callout-icon-a" aria-hidden="true"></div>
  <div class="callout-body">
    <p class="callout-kicker">ポイント</p>
    <p>...</p>
  </div>
</div>
```

アイコン: `callout-icon-a` / `b` / `c`。キッカー例: ポイント / 注意 / 用語。

## 9. 表 `page-table`

`table.text-table`（`thead` / `tbody`）。ページ見出しは他と同様 `h2.page-title`。

## 10. 章末まとめ `page-summary`

- 見出し + `ul.text-list`
- 余白 `.summary-space`
- 次章導線 `p.next-hint`

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
