# 在海邊躍動的精靈：HTML 還原版

從 `main-page.html` 開啟依主 SWF 第一格時間軸重建的 900 × 600 首頁；`index.html` 會導向首頁。六個入口分別連至導引、鳥類介紹、基隆三寶、生態浩劫、互動遊戲與成果驗收。首頁會使用抽出的靜態文字、可編輯文字與 SWF 顯示清單定位；畫布互動區由 HTML 導覽連結提供。`guide.html` 直接呈現主 SWF 第 2–6 格的原始導引內容，可用按鈕或左右方向鍵逐格切換；`region.html` 先顯示第 342 格「展翅基隆」介紹，並可進入白腹鰹鳥、黑鳶、鳳頭燕鷗的原始照片與對話影格。

`timeline.html` 是 SWF 時間軸檢視器，用來檢查原始動畫影格，不是網站首頁。它可用 `?frame=數字` 開啟指定影格。

`tools/asset-gallery.html` 可瀏覽主 SWF 的 208 張圖片，方便核對原始素材。

`assets/decoded/` 保存主 SWF 的 208 張點陣圖、179 個可編輯欄位及 122 組靜態文字；各連結 SWF 的文字也會存入對應子資料夾。`swf-text.js` 提供各頁面抽出的原始文字給 HTML 使用。`swf-actions.json` 保存 278 段主時間軸、Sprite 及按鈕程式資料，包含 ActionScript 字串、數字與指令序列。成果驗收題庫和答案編號由 `choice.swf` 的 37 個題目影格產生，輸出至 `assets/decoded/choice/quiz.json` 和 `quiz.js`。重新產生互動題庫時，依序執行 `node tools/extract-swf-text.mjs`、`node tools/extract-swf-actions.mjs`、`node tools/extract-swf-timelines.mjs`、`node tools/extract-choice-quiz.mjs`。重新抽取連結 SWF 圖片時執行 `node tools/extract-swfs.mjs`。

鳥類介紹的八個分類採自主 SWF 第 7 格還原：鷺科、鶚科、鷸科、彩鷸科、鴴科、鷗科、翡翠科、鶺鴒科。22 個鳥種的原始照片與對話已依時間軸整理為 160 張圖鑑頁，選取鳥種後可逐張切換，也可自動播放；來源資料是 `bird-slides.js`，抽取程式為 `tools/extract-bird-slides.mjs`。原始 `source/movie.flv` 已轉為 H.264/AAC 的 `movie.mp4`，`movie.html` 使用 HTML5 影片播放器播放。
