# Suno BGM 提示詞｜「在海邊躍動的精靈」

無語音頁面的背景音樂提示詞。有語音的頁面（birds / region / guide）不需要 BGM，
避免蓋過旁白。

**共通設定**
- Suno 用 **Custom Mode**：Style 欄貼下方提示詞，Lyrics 欄貼 Metatags，**Instrumental 開**
- 全場無人聲；若跑出 vocal 片段就重roll
- 每首建議 2–4 分鐘；遊戲頁可選 3–4 分鐘以便循環

---

## 1. 首頁 main-page.html ─ 漫步海岸（寧靜、希望感）

**Style**
```
calm ambient acoustic, gentle fingerpicked acoustic guitar, soft felt piano, subtle
ocean wave foley, warm analog pad, light finger snaps, 70 BPM, D major, spacious
and airy, soft and hopeful, nature documentary feeling, gentle lofi warmth, slow
build with a quiet loop-friendly tail, instrumental, no vocals
```
**Metatags**
```
[Intro] [Instrumental Break] [Quiet arrangement] [Outro]
```
**Exclude**: vocals, loud, distorted, electronic bass
**檔名建議**: `assets/music/main-page.mp3`

---

## 2. 生態浩劫 movie.html ─ 鹽寮灣記憶（懷舊、淒美）

**Style**
```
cinematic ambient, melancholic and bittersweet, slow sweeping strings, sparse felt
piano, low warm drone, distant wind foley, 60 BPM, A minor, nostalgic memory of a
lost coastline, documentary score, slow orchestral swell then recede, quiet and
reflective, intimate and aching, instrumental, no vocals
```
**Metatags**
```
[Intro] [Low Energy] [Melancholic] [Orchestral swell] [Falling tension] [Outro] [Silence]
```
**Exclude**: vocals, upbeat, bright major
**檔名建議**: `assets/music/movie.mp3`

---

## 3. 配對大作戰 card.html（輕快遊戲、時鐘壓力）

**Style**
```
playful casual game music, bouncy ukulele, pizzicato strings, marimba, soft hand
drum groove, bright and curious, 112 BPM, C major, cozy memory-game energy,
light rhythmic pulse, gentle tension under the surface, sunny and upbeat,
instrumental, no vocals
```
**Metatags**
```
[Intro] [Instrumental Break] [High Energy] [Build-up] [Outro]
```
**Exclude**: vocals, slow, ambient
**檔名建議**: `assets/music/card.mp3`

---

## 4. 成果驗收 choice.html（安靜回顧、溫暖）

**Style**
```
gentle acoustic lullaby, warm piano, soft cello, light brushed percussion,
72 BPM, G major with a wistful touch, reflective and serene, cozy field-note
study feeling, tender and calm, slow flowing melody, instrumental, no vocals
```
**Metatags**
```
[Intro] [Instrumental Break] [Low Energy] [Intimate] [Outro]
```
**Exclude**: vocals, energetic, rock
**檔名建議**: `assets/music/choice.mp3`

---

## 5. 輕鬆一下 game.html（遊戲入口、陽光海島）

**Style**
```
upbeat acoustic folk pop, claps, bright acoustic guitar, cheerful whistling
melody, 100 BPM, sunshiny island breeze, tropical light touch, relaxed and
playful, summer holiday feeling, steady bouncy groove, instrumental, no vocals
```
**Metatags**
```
[Intro] [Instrumental Break] [High Energy] [Euphoric] [Outro]
```
**Exclude**: vocals, dark, minor key
**檔名建議**: `assets/music/game-hub.mp3`

---

## 6. 猜猜我是誰 guess.html（猜謎、俏皮好奇）

**Style**
```
curious playful puzzle music, glockenspiel, marimba, soft shaker, light
woodwinds, mischievous and bright, 108 BPM, C major, gentle rhythmic pulse,
cozy quiz-show energy, sneaky melodic hook that loops, instrumental, no vocals
```
**Metatags**
```
[Intro] [Hook] [Instrumental Break] [High Energy] [Outro]
```
**Exclude**: vocals, slow, ambient
**檔名建議**: `assets/music/guess.mp3`

---

## 7. 小白鷺找食物 hit.html（追逐食物、可愛帶點緊張）

**Style**
```
light kawaii game music, bouncy marimba, soft plucked guitar, gentle hand drum
chase rhythm, cute and determined, 128 BPM, A major, playful chase energy with
tides and surf feeling, building tension in the middle, bright and sprightly,
instrumental, no vocals
```
**Metatags**
```
[Intro] [Build-up] [High Energy] [Explosive] [Instrumental Break] [Outro]
```
**Exclude**: vocals, dark, ambient
**檔名建議**: `assets/music/hit.mp3`

---

## 生成後
- 放進 `assets/music/`，檔名如上
- 每頁 `<head>` 加 `<audio id="bgm" src="assets/music/XX.mp3" loop>`
- 遊戲頁建議切頁時 pause、有語音的頁面一律不播 BGM
