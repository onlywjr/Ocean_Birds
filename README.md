# 在海邊躍動的精靈：HTML 版

從 `main-page.html` 開啟新版網站；`index.html` 會導向首頁。新版包含導引簡介、鳥類圖鑑、展翅基隆、生態浩劫、互動遊戲與成果驗收。

鳥類圖鑑採每種鳥一個資料夾：`assets/bird-catalog/species/<slug>/` 內放數字命名的照片與 `dialog.json`；`assets/bird-catalog/index.json` 登記要載入的資料夾。新增鳥種時新增資料夾、對話 JSON，並把 slug 加入索引即可，頁面會自動載入。詳細格式見 `PROJECT_WORKFLOW.md`。

成果驗收題庫位於 `assets/assessment/quiz-data.json` 與 `quiz-data.js`。生態浩劫使用 `assets/ecology/coastal-impact.mp4`。首頁、導引、圖鑑、基隆鳥種、影片、遊戲與測驗都由根目錄的 HTML、CSS、JavaScript 檔案呈現。

原始 SWF、Flash Player、FLV、解碼輸出、舊影格檢視器、抽取工具與已停用素材集中在 `Backup/`。這個封存目錄已加入 `.gitignore`，不會納入 Git；新版頁面請勿引用其中檔案。需要查閱或重新抽取原始資料時，可在 `Backup/flash-archive/` 找到保留相對結構的 Flash 封存。
