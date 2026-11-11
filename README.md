# 在海邊躍動的精靈：HTML 還原版

從 `main-page.html` 開啟新版響應式首頁；`index.html` 會導向首頁。六個入口連至導引、鳥類圖鑑、展翅基隆、生態浩劫、互動遊戲與成果驗收。舊 SWF 首頁影格及原始主時間軸畫面保留在 `flash-frame.html`，導引和基隆頁仍使用它呈現復原的 Flash 影格。

`timeline.html` 是 SWF 時間軸檢視器，用來檢查原始動畫影格，不是網站首頁。它可用 `?frame=數字` 開啟指定影格。

`tools/asset-gallery.html` 可瀏覽主 SWF 的 208 張圖片，方便核對原始素材。

`assets/flash-source/` 集中保存解析出的 Flash 原始資料；`decoded/` 中的文字、時間軸與程式資料保留原始名稱，圖片則以最佳解析度整理到新頁面素材資料夾，並由 `bitmap-index.json` 記錄對照。新版素材依單元放在 `bird-catalog/`、`guide/`、`region/`、`games/`、`assessment/`、`ecology/` 與 `shared/`；圖片使用鳥種或用途命名，對照表由各單元的 `image-map.js` 提供。未被新版頁面使用的素材集中在 `unused/`。新增或替換圖片時，放入所屬單元資料夾並同步更新該單元對照表；`assets/` 根目錄不放散檔。

Flash 解析文字、時間軸與 ActionScript 保留在 `assets/flash-source/decoded/`。成果驗收題庫放在 `assets/assessment/quiz-data.json` 與 `quiz-data.js`。`source/movie.flv` 的瀏覽器影片版本位於 `assets/ecology/coastal-impact.mp4`。重新產生互動題庫時，依序執行 `node tools/extract-swf-text.mjs`、`node tools/extract-swf-actions.mjs`、`node tools/extract-swf-timelines.mjs`、`node tools/extract-choice-quiz.mjs`。重新抽取連結 SWF 圖片時執行 `node tools/extract-swfs.mjs`。

鳥類介紹的八個分類及 22 個鳥種資料位於 `bird-catalog.js`；160 張原始照片與逐張對話位於 `bird-slides.js`。`birds.html` 依資料產生家族圖卡、搜尋、鳥種切換與逐張照片導覽。新增鳥種步驟見 `PROJECT_WORKFLOW.md`。抽取程式為 `tools/extract-bird-slides.mjs`。原始 `source/movie.flv` 的瀏覽器版本位於 `assets/ecology/coastal-impact.mp4`，`movie.html` 使用 HTML5 影片播放器播放。

共用視覺 tokens 與導覽位於 `site.css`、`site-redesign.css`、`presentation-pages.css`；滿版場景翻頁控制位於 `presentation.js`。導引與基隆影格切換、鳥圖鑑照片也加入輕量轉場。首頁、圖鑑、展翅基隆、導引、生態浩劫、測驗與遊戲採單視窗場景版型，`timeline.html` 維持作為內部時間軸檢視器。頁面改版工作流與鳥種新增指南位於 `PROJECT_WORKFLOW.md`。

