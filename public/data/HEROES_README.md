# 英雄資料 `heroes.json`

此檔案定義 **100 位中國古代名將** 與主角 Kenny。可直接編輯後重新整理瀏覽器即可生效（無需改程式碼）。

## 結構

| 欄位 | 說明 |
|------|------|
| `protagonist` | Kenny 初始生命、移動、閃避 |
| `spawnRules` | 開局數量、場上上限、增援間隔 |
| `victory.targetLevel` | 勝利等級（預設 20） |
| `heroes[].baseStats` | `hp`, `attack`, `range`, `move` |
| `heroes[].skill` | `name`, `description`, `type`, `basePower`, `cooldown`, `scalingPerKennyLevel` |

## 平衡

- **敵將攻擊與技能威力** 會隨 **Kenny 等級** 上升（見 `scalingPerKennyLevel` 與程式內 `scaledAttack` / `scaledPower`）。
- 開局敵等級為 `spawnRules.enemyBaseLevel`（預設 1），之後隨 Kenny 等級同步提高。

## 重新產生名單

若需從腳本重產（會覆写本檔）：

```bash
node scripts/generate-heroes.mjs
```
