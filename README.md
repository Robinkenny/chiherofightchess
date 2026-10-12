# Kenny 戰棋求生 · 百將追擊 (chiherofightchess)

瀏覽器線上戰棋生存遊戲：平民 **Kenny** 在 **42×36** 古代風地圖上移動，避開 **100 位古代名將** 的追擊與兵法技能，升級至 **20 級** 即勝利。玩法參考 [PokéSurvivor](https://pokesurvivor.com/) 的升級三選一，地圖尺度對標同類生存遊戲常用可玩區域。

## 快速開始

```bash
npm install
npm run dev
```

開啟終端顯示的本地網址即可遊玩。

### 手機瀏覽器預覽

1. 本機同一 Wi‑Fi：執行 `npm run dev`（已 `--host`），用手機開啟 `http://<你的電腦區域 IP>:5173`。
2. 外網暫時連結（開發用）：`npx cloudflared tunnel --url http://127.0.0.1:5173`，終端會顯示 `*.trycloudflare.com` 網址，手機 Safari／Chrome 可直接開啟。
3. 操作：點按地圖**黃格**移動，下方 **待機** 結束回合；直向時地圖在上、狀態在下，可捲動地圖區域查看全圖。

## 修改英雄與技能

編輯 [`public/data/heroes.json`](public/data/heroes.json)（說明見 [`public/data/HEROES_README.md`](public/data/HEROES_README.md)）。

## 操作

- **點擊黃格**：Kenny 移動（戰棋回合）
- **待機**：結束回合並獲得經驗
- **升級**：三選一強化（類 PokéSurvivor）
- 地形：樹林移動較慢、水邊遲滯、懸崖與山不可通行

## 建置

```bash
npm run build
npm run preview
```
