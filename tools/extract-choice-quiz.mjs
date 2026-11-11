import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = path.join(root, 'assets', 'flash-source', 'decoded', 'choice');
const [timeline, staticText, actionData] = await Promise.all([
  fs.readFile(path.join(base, 'timeline.json'), 'utf8').then(JSON.parse),
  fs.readFile(path.join(base, 'static-text.json'), 'utf8').then(JSON.parse),
  fs.readFile(path.join(root, 'assets', 'flash-source', 'decoded', 'swf-actions.json'), 'utf8').then(JSON.parse),
]);
const textById = new Map(staticText.map(item => [item.id, item]));
const actionByFrame = new Map(actionData.choice
  .filter(item => item.kind === 'SpriteAction' && item.sprite === 160 && item.pushes[0] === 'ANS')
  .map(item => [item.frame, item.pushes[1]]));
const frames = timeline.sprites['160'].frames.slice(1, 38);
const questions = frames.map((frame, index) => {
  const entries = frame.items.map(item => textById.get(item.char)).filter(Boolean);
  if (entries.length !== 2) throw new Error(`Question frame ${frame.frame}: expected prompt and option text, got ${entries.length}`);
  const [prompt, optionText] = entries;
  const rows = new Map();
  for (const record of optionText.records) rows.set(record.yOffset, (rows.get(record.yOffset) || '') + record.text);
  const choices = [...rows.entries()].sort((a, b) => a[0] - b[0]).map(([, text]) => text.trim());
  const correctOption = actionByFrame.get(frame.frame);
  if (choices.length !== 3 || !choices.every(Boolean) || ![1, 2, 3].includes(correctOption)) {
    throw new Error(`Question frame ${frame.frame}: invalid choices or answer mapping`);
  }
  return { number: index + 1, prompt: prompt.text, choices, correctOption, swf: { frame: frame.frame, promptId: prompt.id, choicesId: optionText.id } };
});
await fs.mkdir(path.join(root, 'assets', 'assessment'), { recursive: true });
if (questions.length !== 37) throw new Error(`Expected 37 original question frames, got ${questions.length}`);
await fs.writeFile(path.join(root, 'assets', 'assessment', 'quiz-data.json'), `${JSON.stringify(questions, null, 2)}\n`);
await fs.writeFile(path.join(root, 'assets', 'assessment', 'quiz-data.js'), `window.CHOICE_QUIZ = ${JSON.stringify(questions)};\n`);
console.log(`Recovered ${questions.length} quiz questions and answer indices from choice.swf.`);



