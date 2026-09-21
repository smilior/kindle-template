# book/

**このリポジトリで作る本の作業場**です。いまは空 — ここに原紙をコピーして書き始めます。

```bash
mkdir -p book/JP/images book/EN/images
cp .claude/skills/kindle-book/assets/* book/JP/
cp .claude/skills/kindle-book/assets/* book/EN/   # 英語版も作るとき
```

| パス | 役割 |
|------|------|
| `book/JP/with-text.html` | 日本語版の主成果物 |
| `book/JP/TASKS.md` | 進捗の正本（AI も執筆者も着手前に読む） |
| `book/JP/images/` | 図・画面キャプチャ |
| `book/EN/` | English edition（必要なら） |
| `book/docs/JP|EN/` | KDP 入力値・表紙デザイン依頼 |

完成形の見本は [`examples/cloudflare-os/`](../examples/cloudflare-os/)。制作ルールは [`AGENTS.md`](../AGENTS.md)、対話手順は [`.claude/skills/kindle-book/SKILL.md`](../.claude/skills/kindle-book/SKILL.md)。
