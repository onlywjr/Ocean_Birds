import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'assets', 'flash-source', 'decoded');
const timeline = JSON.parse(await fs.readFile(path.join(dataDir, 'main-page', 'timeline.json'), 'utf8'));
const shapes = JSON.parse(await fs.readFile(path.join(root, 'shapes.json'), 'utf8'));
const textFields = [
  ...JSON.parse(await fs.readFile(path.join(dataDir, 'main-page-static-text.json'), 'utf8')),
  ...JSON.parse(await fs.readFile(path.join(dataDir, 'main-page-text.json'), 'utf8')),
];
const birds = [
  ['大白鷺', 26, 46], ['小白鷺', 46, 66], ['蒼鷺', 66, 81], ['岩鷺', 81, 96],
  ['小環頸鴴', 111, 126], ['東方環頸鴴', 126, 141], ['半蹼鷸', 141, 156],
  ['紅胸濱鷸', 156, 166], ['磯鷸', 166, 176], ['翻石鷸', 176, 186],
  ['小燕鷗', 186, 196], ['黑嘴鷗', 196, 206], ['黑脊鷗', 206, 216],
  ['魚鷹', 216, 231], ['彩鷸', 231, 246], ['金斑鴴', 246, 261],
  ['鐵嘴鴴', 261, 276], ['灰斑鴴', 276, 291], ['小青足鷸', 291, 301],
  ['中杓鷸', 301, 316], ['翠鳥', 326, 336], ['白鶺鴒', 336, 342],
];
const textById = new Map(textFields.map(field => [field.id, field]));
const files = new Set(await fs.readdir(dataDir));
const result = {};

for (const [name, start, end] of birds) {
  let lastImage;
  const slides = [];
  for (let frameNumber = start; frameNumber < end; frameNumber++) {
    const frame = timeline.root[frameNumber - 1];
    const items = frame?.items || [];
    const storyItem = [...items].reverse().find(item => {
      const field = textById.get(item.char);
      const isStoryText = field?.records?.some(record => record.fontSize === 18)
        || /size=["']18["']/.test(field?.text || '');
      return isStoryText && field.text?.trim();
    });
    if (!storyItem) continue;

    const imageItem = [...items].reverse().find(item => {
      const bitmapIds = shapes[item.char]?.bitmap_ids || [];
      return bitmapIds.some(id => id !== 65535 && files.has(`bitmap_${id}.jpg`));
    });
    if (imageItem) {
      const ids = shapes[imageItem.char].bitmap_ids.filter(id => id !== 65535);
      lastImage = ids.find(id => id !== 0) ?? lastImage;
    }
    const field = textById.get(storyItem.char);
    if (lastImage && field) slides.push({ frame: frameNumber, image: lastImage, text: field.text.trim() });
  }
  result[name] = slides;
}

const counts = Object.fromEntries(Object.entries(result).map(([name, slides]) => [name, slides.length]));
if (Object.values(result).some(slides => !slides.length)) throw new Error('A bird has no extracted slides');
const selectedBird = process.argv.find(value => value.startsWith('--bird='))?.slice(7);
const output = `window.BIRD_SLIDES = ${JSON.stringify(selectedBird ? { [selectedBird]: result[selectedBird] } : result)};\n`;
if (process.argv.includes('--write')) await fs.writeFile(path.join(root, 'bird-slides.js'), output);
else process.stdout.write(output);
if (process.argv.includes('--write')) console.log(JSON.stringify(counts, null, 2));

