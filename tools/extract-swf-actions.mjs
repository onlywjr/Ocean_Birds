import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'source', '_bird');

function cString(data, offset) {
  const end = data.indexOf(0, offset);
  if (end < 0) throw new Error('Unterminated ActionScript string');
  return [data.toString('utf8', offset, end), end + 1];
}

function actions(data) {
  const names = [], constants = [], pushes = [], opcodes = [];
  let pool = [];
  let at = 0;
  while (at < data.length) {
    const start = at, code = data[at++];
    if (!code) break;
    let length = 0;
    if (code >= 0x80) {
      if (at + 2 > data.length) throw new Error('Truncated SWF action header');
      length = data.readUInt16LE(at);
      at += 2;
    }
    const end = at + length;
    if (end > data.length) throw new Error(`SWF action 0x${code.toString(16)} exceeds its block`);
    opcodes.push({ code, length });
    if (code === 0x88) {
      let p = at;
      const count = data.readUInt16LE(p); p += 2;
      for (let i = 0; i < count && p < end; i++) {
        const [value, next] = cString(data, p);
        constants.push(value); pool.push(value); p = next;
      }
    }
    if (code === 0x96) {
      let p = at;
      while (p < end) {
        const type = data[p++];
        if (type === 0) {
          const [value, next] = cString(data, p);
          names.push(value); pushes.push(value); p = next;
        } else if (type === 1) { pushes.push(data.readFloatLE(p)); p += 4; }
        else if (type === 6) { pushes.push(data.readDoubleLE(p)); p += 8; }
        else if (type === 4) p += 1;
        else if (type === 5) { pushes.push(Boolean(data[p++])); }
        else if (type === 7) { pushes.push(data.readInt32LE(p)); p += 4; }
        else if (type === 8) { pushes.push(pool[data[p++]]); }
        else if (type === 9) { pushes.push(pool[data.readUInt16LE(p)]); p += 2; }
        else if (type === 2 || type === 3) continue;
        else throw new Error(`Unknown ActionPush value type ${type}`);
        if (p > end) throw new Error('ActionPush value exceeds its block');
      }
    }
    if (code === 0x9b) names.push(cString(data, at)[0]);
    at = end;
    if (at <= start) throw new Error('Action parser did not advance');
  }
  return { constants, strings: names, pushes, opcodes };
}

function buttonActions(tag) {
  if (tag.length < 5) return [];
  const id = tag.readUInt16LE(0), actionOffset = tag.readUInt16LE(3);
  if (!actionOffset) return [];
  let at = 3 + actionOffset;
  if (at >= tag.length) throw new Error(`Button ${id}: action offset exceeds its definition`);
  const blocks = [];
  while (at + 4 <= tag.length) {
    const size = tag.readUInt16LE(at); at += 2;
    const condition = tag.readUInt16LE(at); at += 2;
    const end = size ? at + size - 4 : tag.length;
    if (end > tag.length) throw new Error(`Button ${id}: condition action exceeds its definition`);
    blocks.push({ kind: 'ButtonAction', button: id, condition, ...actions(tag.subarray(at, end)) });
    at = end;
    if (!size) break;
  }
  return blocks;
}

function spriteActions(tag, filename) {
  const id = tag.readUInt16LE(0);
  let at = 4, frame = 1;
  const blocks = [];
  while (at + 2 <= tag.length) {
    const header = tag.readUInt16LE(at); at += 2;
    const code = header >>> 6;
    let length = header & 63;
    if (length === 63) { length = tag.readUInt32LE(at); at += 4; }
    const end = at + length;
    if (end > tag.length) throw new Error(`${filename}: sprite ${id} tag ${code} exceeds its definition`);
    const child = tag.subarray(at, end);
    if (code === 12) blocks.push({ kind: 'SpriteAction', sprite: id, frame, ...actions(child) });
    if (code === 59 && length >= 2) blocks.push({ kind: 'SpriteInitAction', sprite: child.readUInt16LE(0), frame, ...actions(child.subarray(2)) });
    if (code === 34) blocks.push(...buttonActions(child).map(block => ({ ...block, sprite: id, frame })));
    if (code === 39) blocks.push(...spriteActions(child, filename));
    if (code === 1) frame++;
    at = end;
    if (code === 0) break;
  }
  return blocks;
}

function readSwf(source, filename) {
  const signature = source.toString('ascii', 0, 3);
  if (signature !== 'FWS' && signature !== 'CWS') throw new Error(`${filename}: unsupported SWF signature ${signature}`);
  const body = signature === 'CWS' ? Buffer.concat([source.subarray(0, 8), inflateSync(source.subarray(8))]) : source;
  const rectBytes = Math.ceil((5 + 4 * (body[8] >>> 3)) / 8);
  let offset = 8 + rectBytes + 4;
  const blocks = [];
  while (offset + 2 <= body.length) {
    const header = body.readUInt16LE(offset); offset += 2;
    const code = header >>> 6;
    let length = header & 63;
    if (length === 63) { length = body.readUInt32LE(offset); offset += 4; }
    const end = offset + length;
    if (end > body.length) throw new Error(`${filename}: SWF tag ${code} exceeds the file`);
    if (code === 12) blocks.push({ kind: 'DoAction', ...actions(body.subarray(offset, end)) });
    if (code === 59 && length >= 2) blocks.push({ kind: 'DoInitAction', sprite: body.readUInt16LE(offset), ...actions(body.subarray(offset + 2, end)) });
    if (code === 34) blocks.push(...buttonActions(body.subarray(offset, end)));
    if (code === 39) blocks.push(...spriteActions(body.subarray(offset, end), filename));
    offset = end;
    if (code === 0) break;
  }
  return blocks;
}

const result = {};
for (const file of (await fs.readdir(sourceDir)).filter(file => file.endsWith('.swf'))) {
  const page = path.basename(file, '.swf');
  const blocks = readSwf(await fs.readFile(path.join(sourceDir, file)), file);
  if (blocks.length) result[page] = blocks;
}
const output = path.join(root, 'assets', 'flash-source', 'decoded', 'swf-actions.json');
await fs.writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
if (!Object.keys(result).length) throw new Error('Action extraction self-check failed');
console.log(`Extracted ${Object.values(result).reduce((total, blocks) => total + blocks.length, 0)} ActionScript blocks from ${Object.keys(result).join(', ')}.`);

