import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'source', '_bird');

function readCString(data, offset) {
  const end = data.indexOf(0, offset);
  if (end < 0) throw new Error('Unterminated SWF string');
  return [data.toString('utf8', offset, end), end + 1];
}

function editText(tag) {
  const id = tag.readUInt16LE(0);
  const nbits = tag[2] >>> 3;
  let at = 2 + Math.ceil((5 + 4 * nbits) / 8);
  const flags = tag[at++];
  const flags2 = tag[at++];
  if (flags & 1) at += 2;
  if (flags2 & 0x80) [, at] = readCString(tag, at);
  if (flags & 1) at += 2;
  if (flags & 4) at += 4;
  if (flags & 2) at += 2;
  if (flags2 & 0x20) at += 9;
  const [variable, next] = readCString(tag, at);
  at = next;
  const text = flags & 0x80 ? readCString(tag, at)[0] : '';
  return { id, variable, html: Boolean(flags2 & 2), text };
}

function readFont(tag) {
  const id = tag.readUInt16LE(0);
  const flags = tag[2];
  const name = tag.toString('utf8', 5, 5 + tag[4]).replace(/\0+$/u, '');
  let at = 5 + tag[4];
  const glyphCount = tag.readUInt16LE(at); at += 2;
  const offsetStart = at;
  const offsetWidth = flags & 8 ? 4 : 2;
  const tableAt = at + glyphCount * offsetWidth;
  const tableOffset = offsetWidth === 4 ? tag.readUInt32LE(tableAt) : tag.readUInt16LE(tableAt);
  const codeAt = offsetStart + tableOffset;
  const codeWidth = flags & 4 ? 2 : 1;
  const codes = [];
  for (let i = 0; i < glyphCount; i++) codes.push(codeWidth === 2 ? tag.readUInt16LE(codeAt + i * 2) : tag[codeAt + i]);
  return { id, name, codes };
}

class BitReader {
  constructor(data, offset = 0) { this.data = data; this.bit = offset * 8; }
  unsigned(count) {
    let value = 0;
    for (let i = 0; i < count; i++, this.bit++) value = (value << 1) | ((this.data[this.bit >>> 3] >>> (7 - (this.bit & 7))) & 1);
    return value >>> 0;
  }
  signed(count) {
    const value = this.unsigned(count);
    if (!count || !(value & (1 << (count - 1)))) return value;
    return value - 2 ** count;
  }
  align() { this.bit = (this.bit + 7) & ~7; }
  get offset() { return this.bit >>> 3; }
}

function rect(data, offset) {
  const bits = new BitReader(data, offset);
  const count = bits.unsigned(5);
  const value = { left: bits.signed(count), right: bits.signed(count), top: bits.signed(count), bottom: bits.signed(count) };
  bits.align();
  return [value, bits.offset];
}

function matrix(data, offset) {
  const bits = new BitReader(data, offset);
  let a = 1, b = 0, c = 0, d = 1;
  if (bits.unsigned(1)) { const n = bits.unsigned(5); a = bits.signed(n) / 65536; d = bits.signed(n) / 65536; }
  if (bits.unsigned(1)) { const n = bits.unsigned(5); b = bits.signed(n) / 65536; c = bits.signed(n) / 65536; }
  const n = bits.unsigned(5), x = bits.signed(n) / 20, y = bits.signed(n) / 20;
  bits.align();
  return [{ a, b, c, d, x, y }, bits.offset];
}

function defineText(tag, fonts, rgba) {
  const id = tag.readUInt16LE(0);
  const [bounds, afterBounds] = rect(tag, 2);
  const [transform, afterMatrix] = matrix(tag, afterBounds);
  let at = afterMatrix;
  const glyphBits = tag[at++], advanceBits = tag[at++];
  const records = [];
  let cursorX = 0, cursorY = 0;
  while (at < tag.length) {
    const flags = tag[at++];
    if (!flags) break;
    if (!(flags & 0x80)) throw new Error(`DefineText ${id}: invalid text record`);
    let fontId = records.at(-1)?.fontId;
    if (flags & 8) { fontId = tag.readUInt16LE(at); at += 2; }
    let color = records.at(-1)?.color;
    if (flags & 4) {
      color = `#${tag.subarray(at, at + (rgba ? 4 : 3)).toString('hex')}`;
      at += rgba ? 4 : 3;
    }
    if (flags & 1) { cursorX = tag.readInt16LE(at) / 20; at += 2; }
    if (flags & 2) { cursorY = tag.readInt16LE(at) / 20; at += 2; }
    let fontSize = records.at(-1)?.fontSize;
    if (flags & 8) { fontSize = tag.readUInt16LE(at) / 20; at += 2; }
    const count = tag[at++];
    const bits = new BitReader(tag, at);
    let text = '';
    let advance = 0;
    for (let i = 0; i < count; i++) {
      const glyph = bits.unsigned(glyphBits);
      advance += bits.signed(advanceBits) / 20;
      text += String.fromCodePoint(fonts.get(fontId)?.codes[glyph] ?? 0xfffd);
    }
    bits.align();
    at = bits.offset;
    const fontName = fonts.get(fontId)?.name || '';
    records.push({ text, fontId, fontName, fontSize, color, xOffset: cursorX, yOffset: cursorY, advance });
    cursorX += advance;
  }
  return { id, bounds: Object.fromEntries(Object.entries(bounds).map(([key, value]) => [key, value / 20])), matrix: transform, text: records.map(record => record.text).join(''), records };
}

function extractFields(source, filename) {
  const signature = source.toString('ascii', 0, 3);
  if (signature !== 'FWS' && signature !== 'CWS') throw new Error(`${filename}: unsupported SWF signature ${signature}`);
  const body = signature === 'CWS' ? Buffer.concat([source.subarray(0, 8), inflateSync(source.subarray(8))]) : source;
  const rectBytes = Math.ceil((5 + 4 * (body[8] >>> 3)) / 8);
  let offset = 8 + rectBytes + 4;
  const fields = [];
  const fonts = new Map(), rawText = [];
  while (offset + 2 <= body.length) {
    const header = body.readUInt16LE(offset);
    offset += 2;
    const code = header >>> 6;
    let length = header & 63;
    if (length === 63) {
      length = body.readUInt32LE(offset);
      offset += 4;
    }
    const end = offset + length;
    if (end > body.length) throw new Error(`${filename}: SWF tag ${code} exceeds the file`);
    const tag = body.subarray(offset, end);
    if (code === 37) fields.push(editText(tag));
    if (code === 48 || code === 75) fonts.set(tag.readUInt16LE(0), readFont(tag));
    if (code === 11 || code === 33) rawText.push({ tag, rgba: code === 33 });
    offset = end;
    if (code === 0) break;
  }
  const staticText = rawText.map(({ tag, rgba }) => defineText(tag, fonts, rgba));
  return { fields, staticText };
}

const files = (await fs.readdir(sourceDir)).filter(file => file.endsWith('.swf'));
const pageText = {};
const pageStaticText = {};
for (const file of files) {
  const page = path.basename(file, '.swf');
  const { fields, staticText } = extractFields(await fs.readFile(path.join(sourceDir, file)), file);
  pageText[page] = fields;
  pageStaticText[page] = staticText;
  const targetDir = page === 'main-page'
    ? path.join(root, 'assets', 'decoded')
    : path.join(root, 'assets', 'decoded', page);
  await fs.mkdir(targetDir, { recursive: true });
  const basename = page === 'main-page' ? 'main-page-text' : 'text';
  if (fields.length) await fs.writeFile(path.join(targetDir, `${basename}.json`), `${JSON.stringify(fields, null, 2)}\n`);
  if (staticText.length) await fs.writeFile(path.join(targetDir, `${page === 'main-page' ? 'main-page-static-text' : 'static-text'}.json`), `${JSON.stringify(staticText, null, 2)}\n`);
}

const browserOutput = path.join(root, 'assets', 'decoded', 'swf-text.js');
await fs.writeFile(browserOutput, `window.SWF_TEXT = ${JSON.stringify(pageText)}; window.SWF_STATIC_TEXT = ${JSON.stringify(pageStaticText)}; window.SWF_EDIT_TEXT = window.SWF_TEXT['main-page'] || [];\n`);
const mainFields = pageText['main-page'] || [];
if (!mainFields.length || mainFields.some(field => !field.text)) throw new Error('Main SWF text extraction self-check failed');
console.log(`Extracted text: ${Object.entries(pageText).map(([page, fields]) => `${page}: ${fields.length} editable, ${pageStaticText[page].length} static`).join(', ')}.`);
