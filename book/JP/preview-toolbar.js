/**
 * プレビュー用ツールバー:
 * 「更新」で HTML/CSS を再読み込みしつつ、スクロール位置を維持する。
 * ブラウザ標準の再読み込みでも、直前の位置を復元する。
 */
(function () {
  var KEY = "kindle-preview-scroll:" + location.pathname;

  function saveScroll() {
    try {
      sessionStorage.setItem(
        KEY,
        JSON.stringify({
          y: window.scrollY || window.pageYOffset || 0,
          t: Date.now(),
        })
      );
    } catch (_) {}
  }

  function restoreScroll() {
    try {
      var raw = sessionStorage.getItem(KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || typeof data.y !== "number") return;
      // レイアウト確定後に復元（画像・フォントでずれるのを緩和）
      var y = data.y;
      requestAnimationFrame(function () {
        window.scrollTo(0, y);
        setTimeout(function () {
          window.scrollTo(0, y);
        }, 50);
      });
    } catch (_) {}
  }

  function softReload() {
    saveScroll();
    location.reload();
  }

  window.kindlePreviewReload = softReload;

  window.addEventListener("beforeunload", saveScroll);
  window.addEventListener("pagehide", saveScroll);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", restoreScroll);
  } else {
    restoreScroll();
  }
})();
