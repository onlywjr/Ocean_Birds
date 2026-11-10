import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'source', '_bird');
const outputDir = path.join(root, 'assets', 'decoded');

class Bits {
  constructor(data, offset = 0) { this.data = data; this.bit = offset * 8; }
  uint(n) { let v = 0; for (let i = 0; i < n; i++, this.bit++) v = (v << 1) | ((this.data[this.bit >>> 3] >>> (7 - (this.bit & 7))) & 1); return v >>> 0; }
  sint(n) { const v = this.uint(n); return n && v & (1 << (n - 1)) ? v - 2 ** n : v; }
  align() { this.bit = (this.bit + 7) & ~7; }
  get offset() { return this.bit >>> 3; }
}

function matrix(data, offset) {
  const b = new Bits(data, offset);
  let a = 1, bTerm = 0, c = 0, d = 1;
  if (b.uint(1)) { const n = b.uint(5); a = b.sint(n) / 65536; d = b.sint(n) / 65536; }
  if (b.uint(1)) { const n = b.uint(5); bTerm = b.sint(n) / 65536; c = b.sint(n) / 65536; }
  const n = b.uint(5), tx = b.sint(n) / 20, ty = b.sint(n) / 20;
  b.align();
  return [{ a, b: bTerm, c, d, tx, ty }, b.offset];
}

function skipColorTransform(data, offset, alpha) {
  const b = new Bits(data, offset);
  const add = b.uint(1), mult = b.uint(1), n = b.uint(4), channels = alpha ? 4 : 3;
  for (let i = 0; i < channels; i++) if (mult) b.sint(n);
  for (let i = 0; i < channels; i++) if (add) b.sint(n);
  b.align();
  return b.offset;
}

function cString(data, offset) {
  const end = data.indexOf(0, offset);
  if (end < 0) throw new Error('Unterminated SWF name');
  return end + 1;
}

function placeObject(tag, code, previous = {}) {
  let at = 0, flags, flags2 = 0, depth, char = previous.char, transform = previous.matrix;
  if (code === 4) {
    char = tag.readUInt16LE(0); depth = tag.readUInt16LE(2); at = 4;
    [transform, at] = matrix(tag, at);
  } else {
    flags = tag[at++];
    if (code === 70) flags2 = tag[at++];
    depth = tag.readUInt16LE(at); at += 2;
    if (code === 70 && (flags2 & 8) && ((flags2 & 16) || (flags & 2))) at = cString(tag, at);
    if (flags & 2) { char = tag.readUInt16LE(at); at += 2; }
    if (flags & 4) [transform, at] = matrix(tag, at);
    if (flags & 8) at = skipColorTransform(tag, at, true);
    if (flags & 16) at += 2;
    if (flags & 32) at = cString(tag, at);
  }
  if (char == null && previous.char == null) return null;
  return { depth, char, matrix: transform || { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, move: Boolean(flags & 1) };
}

function parseTimeline(data, start, limit, label, sprites) {
  let at = start, frame = 1;
  const display = new Map(), frames = [];
  while (at + 2 <= limit) {
    const header = data.readUInt16LE(at); at += 2;
    const code = header >>> 6;
    let length = header & 63;
    if (length === 63) { length = data.readUInt32LE(at); at += 4; }
    const end = at + length;
    if (end > limit) throw new Error(`${label}: tag ${code} exceeds the stream`);
    const tag = data.subarray(at, end);
    if (code === 4 || code === 26 || code === 70) {
      const previous = code === 4 ? {} : display.get(tag.readUInt16LE(code === 70 ? 2 : 1)) || {};
      const item = placeObject(tag, code, previous);
      if (item) display.set(item.depth, item);
    } else if (code === 5 || code === 28) {
      display.delete(code === 28 ? tag.readUInt16LE(0) : tag.readUInt16LE(2));
    } else if (code === 39 && length >= 4) {
      const id = tag.readUInt16LE(0), frameCount = tag.readUInt16LE(2);
      if (!sprites[id]) sprites[id] = { frameCount, frames: parseTimeline(tag, 4, tag.length, `${label}/sprite-${id}`, sprites) };
    } else if (code === 1) {
      frames.push({ frame, items: [...display.values()].sort((a, b) => a.depth - b.depth) });
      frame++;
    }
    at = end;
    if (code === 0) break;
  }
  return frames;
}

for (const file of (await fs.readdir(sourceDir)).filter(name => name.endsWith('.swf'))) {
  const source = await fs.readFile(path.join(sourceDir, file));
  const signature = source.toString('ascii', 0, 3);
  if (signature !== 'FWS' && signature !== 'CWS') throw new Error(`${file}: unsupported SWF signature ${signature}`);
  const data = signature === 'CWS' ? Buffer.concat([source.subarray(0, 8), inflateSync(source.subarray(8))]) : source;
  const rectBytes = Math.ceil((5 + 4 * (data[8] >>> 3)) / 8);
  const sprites = {};
  const rootFrames = parseTimeline(data, 8 + rectBytes + 4, data.length, file, sprites);
  const page = path.basename(file, '.swf');
  const targetDir = path.join(outputDir, page);
  await fs.mkdir(targetDir, { recursive: true });
  const payload = { header: { width: data.readUInt16LE(8 + rectBytes) / 20, height: data.readUInt16LE(10 + rectBytes) / 20, fps: data.readUInt16LE(12 + rectBytes) / 256, frames: data.readUInt16LE(14 + rectBytes) }, root: rootFrames, sprites };
  await fs.writeFile(path.join(targetDir, 'timeline.json'), `${JSON.stringify(payload)}\n`);
  if (page === 'choice' && !sprites['160']?.frames?.some(frame => frame.items.some(item => item.char === 57))) throw new Error('Choice question timeline extraction self-check failed');
  console.log(`${page}: ${rootFrames.length} root frames, ${Object.keys(sprites).length} sprites.`);
}
